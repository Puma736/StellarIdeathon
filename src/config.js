// Red y constantes de la demo. Testnet, sin backend.
import { Keypair, StrKey } from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const EXPERT_TX_URL = "https://stellar.expert/explorer/testnet/tx";
export const FRIENDBOT_URL = "https://friendbot.stellar.org";

// Marcador del memo. El envío viaja como `REPARTE <mensaje>` (máx. 28 bytes).
export const MEMO = "REPARTE";
export const MEMO_MAX_BYTES = 28;

// 1% al enviar. Recibir y cobrar es gratis.
export const FEE_RATE = 0.01;

// Tasa referencial Bs por dólar de prueba. Solo para mostrar, nunca se usa en la red.
export const BS_RATE = 6.95;

const env = import.meta.env;

/** Clave pública a partir de una secreta. Devuelve "" si la secreta no es válida. */
export function publicFromSecret(secret) {
  try {
    return secret && StrKey.isValidEd25519SecretSeed(secret)
      ? Keypair.fromSecret(secret).publicKey()
      : "";
  } catch {
    return "";
  }
}

// Cuentas de la demo. Las genera `scripts/cuentas.mjs` y viven en .env.
export const SENDER_SECRET = env.VITE_SENDER_SECRET || "";
export const SENDER_PUBLIC = publicFromSecret(SENDER_SECRET);

// Dólares de prueba emitidos por la propia cuenta emisora.
export const ASSET_CODE = env.VITE_ASSET_CODE || "USDp";
export const ASSET_ISSUER = env.VITE_ASSET_ISSUER || SENDER_PUBLIC;

export const COLEGIO_PUBLIC = env.VITE_COLEGIO_PUBLIC || "";
export const FEE_PUBLIC = env.VITE_FEE_PUBLIC || "";

/**
 * Sobres de la familia. Cada uno es una cuenta distinta en la red.
 * `tone` elige los colores del diseño (verde, terracota, azul lago).
 */
export const SOBRES = [
  {
    id: "casa",
    nombre: "Casa",
    descripcion: "Gastos del hogar y servicios",
    nota: "Luz y mercado",
    icon: "home",
    tone: "primary",
    pct: 60,
    secret: env.VITE_CASA_SECRET || "",
    publicKey: publicFromSecret(env.VITE_CASA_SECRET || ""),
  },
  {
    id: "colegio",
    nombre: "Colegio",
    descripcion: "San Andrés · Mateo",
    nota: "Cuota octubre",
    icon: "school",
    tone: "secondary",
    pct: 30,
    protegido: true,
    secret: env.VITE_COLEGIO_SOBRE_SECRET || "",
    publicKey: publicFromSecret(env.VITE_COLEGIO_SOBRE_SECRET || ""),
  },
  {
    id: "salud",
    nombre: "Salud",
    descripcion: "Fondo de emergencia y farmacia",
    nota: "Fondo imprevistos",
    icon: "local_hospital",
    tone: "tertiary",
    pct: 10,
    secret: env.VITE_SALUD_SECRET || "",
    publicKey: publicFromSecret(env.VITE_SALUD_SECRET || ""),
  },
];

export function sobreById(id) {
  return SOBRES.find((s) => s.id === id) || null;
}

export function sobreByPublic(publicKey) {
  return SOBRES.find((s) => s.publicKey && s.publicKey === publicKey) || null;
}

/**
 * Cuentas vivas de la demo. Empiezan en .env si existe.
 * En Vercel no hay .env: `ensureDemoAccounts` las crea en el navegador
 * y las escribe aquí. Quien firme tiene que leer este objeto en el momento, no una copia.
 */
export const demo = {
  senderSecret: SENDER_SECRET,
  senderPublic: SENDER_PUBLIC,
  assetIssuer: ASSET_ISSUER,
  colegioPublic: COLEGIO_PUBLIC,
  feePublic: FEE_PUBLIC,
};

/** Mete un juego de cuentas (env o las creadas en el navegador) en `demo` y en los sobres. */
export function applyDemo(next) {
  demo.senderSecret = next.senderSecret || "";
  demo.senderPublic = publicFromSecret(demo.senderSecret);
  demo.assetIssuer = next.assetIssuer || demo.senderPublic;
  demo.colegioPublic = next.colegioPublic || "";
  demo.feePublic = next.feePublic || "";
  const secrets = {
    casa: next.casaSecret,
    colegio: next.colegioSobreSecret,
    salud: next.saludSecret,
  };
  for (const sobre of SOBRES) {
    if (!secrets[sobre.id]) continue;
    sobre.secret = secrets[sobre.id];
    sobre.publicKey = publicFromSecret(secrets[sobre.id]);
  }
}

/** La demo puede firmar si hay emisor, sobres, colegio y cuenta de la comisión. */
export function hasDemoAccounts() {
  return Boolean(
    demo.senderSecret &&
      demo.feePublic &&
      demo.colegioPublic &&
      demo.assetIssuer &&
      SOBRES.every((s) => s.publicKey && s.secret),
  );
}

// Personas de la demo.
export const SENDER_NAME = "María";
export const SENDER_CITY = "Madrid";
export const DEFAULT_RECIPIENT = { nombre: "Mamá", ciudad: "La Paz" };
export const COMERCIO = { nombre: "Colegio San Andrés", ciudad: "La Paz", icon: "school" };

// Valores con los que abre el formulario de envío.
export const DEFAULT_AMOUNT = 200;
export const DEFAULT_MESSAGE = "Matrícula marzo";
