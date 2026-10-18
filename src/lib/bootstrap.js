import { Asset, Horizon, Keypair, Operation, TransactionBuilder } from "@stellar/stellar-sdk";
import {
  applyDemo,
  hasDemoAccounts,
  HORIZON_URL,
  NETWORK_PASSPHRASE,
  FRIENDBOT_URL,
  ASSET_CODE,
} from "../config.js";

const STORAGE_KEY = "reparte.demo.v1";
const server = new Horizon.Server(HORIZON_URL);

/**
 * En local basta el .env. En Vercel no hay archivo: la primera visita crea
 * las seis cuentas en testnet, las guarda en este navegador y la app firma con ellas.
 */
let inflight = null;

export function ensureDemoAccounts(onStatus) {
  if (hasDemoAccounts()) return Promise.resolve();
  if (inflight) return inflight;
  inflight = provision(onStatus).finally(() => {
    inflight = null;
  });
  return inflight;
}

async function provision(onStatus) {
  if (hasDemoAccounts()) return;

  const stored = readStored();
  if (stored) {
    applyDemo(stored);
    if (hasDemoAccounts()) return;
  }

  onStatus?.("Creando las cuentas en testnet…");
  const cuentas = ["emisor", "casa", "colegio_sobre", "salud", "colegio", "reparte"].map((rol) => ({
    rol,
    keypair: Keypair.random(),
  }));

  for (const cuenta of cuentas) {
    onStatus?.(`Fondeando ${label(cuenta.rol)}…`);
    await friendbot(cuenta.keypair.publicKey());
  }

  const emisor = cuentas.find((c) => c.rol === "emisor");
  const asset = new Asset(ASSET_CODE, emisor.keypair.publicKey());
  for (const cuenta of cuentas) {
    if (cuenta.rol === "emisor") continue;
    onStatus?.(`Abriendo USDp en ${label(cuenta.rol)}…`);
    await changeTrust(cuenta.keypair, asset);
  }

  const secret = (rol) => cuentas.find((c) => c.rol === rol).keypair.secret();
  const pub = (rol) => cuentas.find((c) => c.rol === rol).keypair.publicKey();
  const next = {
    senderSecret: secret("emisor"),
    assetIssuer: pub("emisor"),
    casaSecret: secret("casa"),
    colegioSobreSecret: secret("colegio_sobre"),
    saludSecret: secret("salud"),
    colegioPublic: pub("colegio"),
    feePublic: pub("reparte"),
  };
  applyDemo(next);
  writeStored(next);
}

function label(rol) {
  return { emisor: "Madrid", casa: "Casa", colegio_sobre: "Colegio", salud: "Salud", colegio: "el comercio", reparte: "Reparte" }[rol] || rol;
}

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // sin almacenamiento: las cuentas viven solo en esta pestaña
  }
}

async function friendbot(publicKey) {
  let last = "";
  for (let intento = 0; intento < 4; intento++) {
    const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
    if (res.ok) return;
    last = `${res.status} ${(await res.text().catch(() => "")).slice(0, 180)}`.trim();
    if (res.status !== 429 && res.status < 500) break;
    await wait(800 * (intento + 1));
  }
  throw new Error(`Friendbot no pudo fondear la cuenta (${last}).`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadAccountWhenReady(publicKey) {
  let last;
  for (let intento = 0; intento < 6; intento++) {
    try {
      return await server.loadAccount(publicKey);
    } catch (err) {
      last = err;
      await wait(700 * (intento + 1));
    }
  }
  throw last;
}

async function changeTrust(keypair, asset) {
  const [account, baseFee] = await Promise.all([
    loadAccountWhenReady(keypair.publicKey()),
    server.fetchBaseFee(),
  ]);
  const tx = new TransactionBuilder(account, {
    fee: String(baseFee),
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(Operation.changeTrust({ asset }))
    .setTimeout(180)
    .build();
  tx.sign(keypair);
  await server.submitTransaction(tx);
}
