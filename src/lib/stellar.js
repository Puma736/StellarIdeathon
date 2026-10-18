import {
  Asset,
  Horizon,
  Keypair,
  Memo,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  ASSET_CODE,
  ASSET_ISSUER,
  COLEGIO_PUBLIC,
  FEE_PUBLIC,
  HORIZON_URL,
  MEMO,
  MEMO_MAX_BYTES,
  NETWORK_PASSPHRASE,
  SENDER_SECRET,
  SOBRES,
  hasDemoAccounts,
} from "../config.js";
import { truncateBytes } from "./format.js";
import { toStellarAmount } from "./split.js";

const server = new Horizon.Server(HORIZON_URL);

/** USDp emitido por la cuenta de la demo. */
export function demoAsset() {
  return ASSET_ISSUER ? new Asset(ASSET_CODE, ASSET_ISSUER) : Asset.native();
}

/** `REPARTE Matrícula marzo`, recortado a 28 bytes. */
export function buildMemo(mensaje) {
  const texto = mensaje?.trim() ? `${MEMO} ${mensaje.trim()}` : MEMO;
  return truncateBytes(texto, MEMO_MAX_BYTES);
}

/**
 * Una transacción, un pago por sobre más la comisión, memo REPARTE.
 *   sobres: [{ id, monto }]  (el destino sale de config por id)
 * Firma la cuenta emisora de la demo. Devuelve { hash, createdAt }.
 */
export async function sendSplit({ sobres, comision, mensaje }) {
  if (!hasDemoAccounts()) {
    throw new Error("Faltan las cuentas de la demo en .env. Corre `npm run cuentas`.");
  }

  const sender = Keypair.fromSecret(SENDER_SECRET);
  const asset = demoAsset();

  const [account, baseFee] = await Promise.all([
    server.loadAccount(sender.publicKey()),
    server.fetchBaseFee(),
  ]);

  const builder = new TransactionBuilder(account, {
    fee: String(baseFee),
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  for (const parte of sobres) {
    const sobre = SOBRES.find((s) => s.id === parte.id);
    if (!sobre?.publicKey) throw new Error(`El sobre ${parte.id} no tiene cuenta en .env.`);
    builder.addOperation(
      Operation.payment({
        destination: sobre.publicKey,
        asset,
        amount: toStellarAmount(parte.monto),
      }),
    );
  }

  if (comision > 0) {
    builder.addOperation(
      Operation.payment({
        destination: FEE_PUBLIC,
        asset,
        amount: toStellarAmount(comision),
      }),
    );
  }

  const tx = builder.addMemo(Memo.text(buildMemo(mensaje))).setTimeout(180).build();
  tx.sign(sender);

  return submit(tx);
}

/**
 * Pago desde un sobre hacia un cobro (SEP-0007 ya parseado).
 * Firma con la clave del sobre. Devuelve { hash, createdAt }.
 */
export async function payFromEnvelope({ sobreId, destination, amount, memo }) {
  const sobre = SOBRES.find((s) => s.id === sobreId);
  if (!sobre?.secret) throw new Error("Ese sobre no tiene clave en .env.");

  const kp = Keypair.fromSecret(sobre.secret);
  const [account, baseFee] = await Promise.all([
    server.loadAccount(kp.publicKey()),
    server.fetchBaseFee(),
  ]);

  const builder = new TransactionBuilder(account, {
    fee: String(baseFee),
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({
      destination,
      asset: demoAsset(),
      amount: toStellarAmount(amount),
    }),
  );

  if (memo) builder.addMemo(Memo.text(truncateBytes(memo, MEMO_MAX_BYTES)));

  const tx = builder.setTimeout(180).build();
  tx.sign(kp);
  return submit(tx);
}

/** Mover saldo entre dos sobres de la misma familia. */
export async function moveBetweenEnvelopes({ fromId, toId, amount }) {
  const destino = SOBRES.find((s) => s.id === toId);
  if (!destino?.publicKey) throw new Error("El sobre destino no tiene cuenta en .env.");
  return payFromEnvelope({
    sobreId: fromId,
    destination: destino.publicKey,
    amount,
    memo: "Mover entre sobres",
  });
}

/** Saldos reales por sobre, leídos de Horizon. { casa: 120, colegio: 60, salud: 20 } */
export async function loadBalances() {
  const entries = await Promise.all(
    SOBRES.map(async (sobre) => {
      if (!sobre.publicKey) return [sobre.id, null];
      try {
        const account = await server.loadAccount(sobre.publicKey);
        return [sobre.id, balanceOf(account)];
      } catch {
        return [sobre.id, null];
      }
    }),
  );
  return Object.fromEntries(entries);
}

/**
 * Envíos recibidos por la familia: pagos a cualquiera de los sobres cuyo memo
 * empieza con REPARTE, agrupados por transacción.
 *   [{ hash, fecha, de, mensaje, montos: { casa: 120, colegio: 60 }, total }]
 */
export async function loadHistory(limit = 50) {
  const porSobre = await Promise.all(
    SOBRES.filter((s) => s.publicKey).map(async (sobre) => {
      const page = await server
        .payments()
        .forAccount(sobre.publicKey)
        .join("transactions")
        .order("desc")
        .limit(limit)
        .call();
      return page.records
        .filter((r) => r.type === "payment" && r.to === sobre.publicKey && isDemoAsset(r))
        .map((r) => ({ sobreId: sobre.id, record: r }));
    }),
  );

  const grupos = new Map();
  for (const { sobreId, record } of porSobre.flat()) {
    const memo = record.transaction_attr?.memo || "";
    if (!memo.startsWith(MEMO)) continue;

    const hash = record.transaction_hash;
    const grupo = grupos.get(hash) || {
      hash,
      fecha: record.created_at,
      de: record.from,
      mensaje: memo.slice(MEMO.length).trim(),
      montos: {},
      total: 0,
    };
    const monto = Number(record.amount);
    grupo.montos[sobreId] = (grupo.montos[sobreId] || 0) + monto;
    grupo.total += monto;
    grupos.set(hash, grupo);
  }

  return [...grupos.values()].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

/**
 * Cobros recibidos por el comercio.
 *   [{ hash, fecha, de, concepto, monto }]
 */
export async function loadReceived(limit = 50) {
  if (!COLEGIO_PUBLIC) return [];
  const page = await server
    .payments()
    .forAccount(COLEGIO_PUBLIC)
    .join("transactions")
    .order("desc")
    .limit(limit)
    .call();

  return page.records
    .filter((r) => r.type === "payment" && r.to === COLEGIO_PUBLIC && isDemoAsset(r))
    .map((r) => ({
      hash: r.transaction_hash,
      fecha: r.created_at,
      de: r.from,
      concepto: r.transaction_attr?.memo || "",
      monto: Number(r.amount),
    }));
}

function balanceOf(account) {
  const asset = demoAsset();
  const line = account.balances.find((b) =>
    asset.isNative()
      ? b.asset_type === "native"
      : b.asset_code === asset.getCode() && b.asset_issuer === asset.getIssuer(),
  );
  return line ? Number(line.balance) : 0;
}

function isDemoAsset(record) {
  const asset = demoAsset();
  return asset.isNative()
    ? record.asset_type === "native"
    : record.asset_code === asset.getCode() && record.asset_issuer === asset.getIssuer();
}

async function submit(tx) {
  try {
    const result = await server.submitTransaction(tx);
    return { hash: result.hash, createdAt: new Date().toISOString() };
  } catch (err) {
    throw new Error(describeHorizonError(err));
  }
}

/** Convierte la respuesta de Horizon en una frase que se puede leer en pantalla. */
function describeHorizonError(err) {
  const codes = err?.response?.data?.extras?.result_codes;
  if (!codes) return err?.message || "No se pudo enviar la transacción.";

  const ops = codes.operations?.join(", ") || "";
  if (ops.includes("op_no_trust")) {
    return "La cuenta destino no tiene trustline a USDp. Corre `npm run cuentas`.";
  }
  if (ops.includes("op_underfunded")) {
    return "El sobre no tiene saldo suficiente para este pago.";
  }
  if (ops.includes("op_no_destination")) {
    return "Una de las cuentas destino no existe en testnet.";
  }
  if (ops.includes("op_line_full")) {
    return "La cuenta destino no acepta más USDp (límite de trustline).";
  }
  if (codes.transaction === "tx_bad_seq") {
    return "La cuenta cambió mientras firmábamos. Intenta de nuevo.";
  }
  return `Horizon rechazó la transacción: ${codes.transaction}${ops ? ` (${ops})` : ""}.`;
}
