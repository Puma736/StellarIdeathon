// Crea las seis cuentas de la demo en testnet, las fondea con Friendbot,
// abre trustline a USDp en todas menos el emisor y escribe el .env.
//
//   node scripts/cuentas.mjs
//
// Solo testnet, solo demo. Si ya existe .env se guarda una copia en .env.bak.

import { writeFileSync, existsSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  Asset,
  Horizon,
  Keypair,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const FRIENDBOT_URL = "https://friendbot.stellar.org";
const ASSET_CODE = "USDp";

const server = new Horizon.Server(HORIZON_URL);

const ROLES = [
  ["emisor", "Firma el envío. Emite USDp.", "VITE_SENDER_SECRET", "secret"],
  ["casa", "Sobre Casa de la familia.", "VITE_CASA_SECRET", "secret"],
  ["colegio_sobre", "Sobre Colegio de la familia.", "VITE_COLEGIO_SOBRE_SECRET", "secret"],
  ["salud", "Sobre Salud de la familia.", "VITE_SALUD_SECRET", "secret"],
  ["colegio", "El comercio que cobra.", "VITE_COLEGIO_PUBLIC", "public"],
  ["reparte", "Recibe el 1%.", "VITE_FEE_PUBLIC", "public"],
];

async function main() {
  console.log("Reparte · cuentas de testnet\n");

  const cuentas = ROLES.map(([rol, descripcion, envKey, kind]) => ({
    rol,
    descripcion,
    envKey,
    kind,
    keypair: Keypair.random(),
  }));

  // 1. Fondear con Friendbot.
  for (const c of cuentas) {
    process.stdout.write(`Fondeando ${c.rol.padEnd(14)} ${c.keypair.publicKey()} … `);
    await friendbot(c.keypair.publicKey());
    console.log("ok");
  }

  // 2. Trustline a USDp en todas menos el emisor.
  const emisor = cuentas.find((c) => c.rol === "emisor");
  const usdp = new Asset(ASSET_CODE, emisor.keypair.publicKey());

  for (const c of cuentas) {
    if (c.rol === "emisor") continue;
    process.stdout.write(`Trustline USDp ${c.rol.padEnd(14)} … `);
    await changeTrust(c.keypair, usdp);
    console.log("ok");
  }

  // 3. Escribir .env.
  const lines = [
    "# Generado por scripts/cuentas.mjs · testnet · solo demo",
    `# ${new Date().toISOString()}`,
    "",
    `VITE_ASSET_CODE=${ASSET_CODE}`,
    `VITE_ASSET_ISSUER=${emisor.keypair.publicKey()}`,
    "",
  ];
  for (const c of cuentas) {
    lines.push(`# ${c.rol}: ${c.descripcion}`);
    lines.push(
      `${c.envKey}=${c.kind === "secret" ? c.keypair.secret() : c.keypair.publicKey()}`,
    );
    if (c.kind === "public") lines.push(`# secreta de ${c.rol} (no la usa la app): ${c.keypair.secret()}`);
    lines.push("");
  }

  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    copyFileSync(envPath, resolve(process.cwd(), ".env.bak"));
    console.log("\n.env anterior guardado en .env.bak");
  }
  writeFileSync(envPath, lines.join("\n"));

  console.log(`\n.env escrito en ${envPath}`);
  console.log(`Issuer USDp: ${emisor.keypair.publicKey()}`);
  console.log("\nListo. Corre `npm run dev` y abre la pestaña Enviar.");
}

async function friendbot(publicKey) {
  const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`);
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Friendbot falló para ${publicKey}: ${res.status} ${body}`);
  }
}

async function changeTrust(keypair, asset) {
  const [account, baseFee] = await Promise.all([
    server.loadAccount(keypair.publicKey()),
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

main().catch((err) => {
  console.error("\nError:", err?.response?.data?.extras?.result_codes || err.message || err);
  process.exit(1);
});
