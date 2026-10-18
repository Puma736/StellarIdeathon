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
  FAMILY_PUBLIC,
  HORIZON_URL,
  MEMO,
  NETWORK_PASSPHRASE,
  QUOTA_PUBLIC,
  SENDER_SECRET,
} from "../config.js";
import { toStellarAmount } from "./split.js";

const server = new Horizon.Server(HORIZON_URL);

/** USDp si hay issuer; XLM como plan B. En pantalla siempre son dólares de prueba. */
export function demoAsset() {
  return ASSET_ISSUER ? new Asset(ASSET_CODE, ASSET_ISSUER) : Asset.native();
}

/** La demo puede firmar solo si .env trae las tres cuentas. */
export function hasDemoAccounts() {
  return Boolean(SENDER_SECRET && FAMILY_PUBLIC && QUOTA_PUBLIC);
}

/**
 * Una transacción, dos pagos, memo REPARTE.
 *   1. paraHoy -> cuenta familia
 *   2. cuota   -> cuenta cuota
 * Firma la cuenta de prueba guardada solo para la demo. Devuelve el hash.
 */
export async function sendSplit({ paraHoy, cuota }) {
  if (!hasDemoAccounts()) {
    throw new Error("Faltan las cuentas de la demo en .env.");
  }

  const sender = Keypair.fromSecret(SENDER_SECRET);
  const asset = demoAsset();

  const [account, baseFee] = await Promise.all([
    server.loadAccount(sender.publicKey()),
    server.fetchBaseFee(),
  ]);

  const tx = new TransactionBuilder(account, {
    fee: String(baseFee),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: FAMILY_PUBLIC,
        asset,
        amount: toStellarAmount(paraHoy),
      }),
    )
    .addOperation(
      Operation.payment({
        destination: QUOTA_PUBLIC,
        asset,
        amount: toStellarAmount(cuota),
      }),
    )
    .addMemo(Memo.text(MEMO))
    .setTimeout(180)
    .build();

  tx.sign(sender);

  try {
    const result = await server.submitTransaction(tx);
    return result.hash;
  } catch (err) {
    throw new Error(describeHorizonError(err));
  }
}

/** Convierte la respuesta de Horizon en una frase que se puede leer en pantalla. */
function describeHorizonError(err) {
  const codes = err?.response?.data?.extras?.result_codes;
  if (!codes) return err?.message || "No se pudo enviar la transacción.";

  const ops = codes.operations?.join(", ");
  if (ops?.includes("op_no_trust")) {
    return "La cuenta destino no tiene trustline a USDp. Corre scripts/cuentas.mjs.";
  }
  if (ops?.includes("op_underfunded")) {
    return "La cuenta emisora no tiene saldo suficiente para este envío.";
  }
  if (ops?.includes("op_no_destination")) {
    return "Una de las cuentas destino no existe en testnet.";
  }
  return `Horizon rechazó la transacción: ${codes.transaction}${ops ? ` (${ops})` : ""}.`;
}
