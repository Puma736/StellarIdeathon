// Red y constantes de la demo. Testnet, sin backend.

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const EXPERT_TX_URL = "https://stellar.expert/explorer/testnet/tx";

// Comprobante del pedido: quién, cuánto y para qué.
export const MEMO = "REPARTE";

// 1% al enviar. La familia no paga por recibir.
export const FEE_RATE = 0.01;

// Dólares de prueba emitidos por la cuenta emisora.
// Si falta el issuer, la demo cae al plan B: los mismos dos pagos en XLM.
export const ASSET_CODE = import.meta.env.VITE_ASSET_CODE || "USDp";
export const ASSET_ISSUER = import.meta.env.VITE_ASSET_ISSUER || "";

// Cuentas de la demo. Las genera `scripts/cuentas.mjs` y viven en .env.
export const SENDER_SECRET = import.meta.env.VITE_SENDER_SECRET || "";
export const FAMILY_PUBLIC = import.meta.env.VITE_FAMILY_PUBLIC || "";
export const QUOTA_PUBLIC = import.meta.env.VITE_QUOTA_PUBLIC || "";

// Valores con los que abre el formulario de Madrid.
export const DEFAULT_AMOUNT = 200;
export const DEFAULT_PERCENT = 30;
export const DEFAULT_RECIPIENT = "Mamá";
