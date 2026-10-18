import { ASSET_CODE, ASSET_ISSUER } from "../config.js";
import { toStellarAmount } from "./split.js";

const SCHEME = "web+stellar:pay";

/**
 * Enlace de cobro SEP-0007:
 *   web+stellar:pay?destination=G...&amount=60&asset_code=USDp&asset_issuer=G...&memo=Matricula%20marzo&memo_type=MEMO_TEXT
 */
export function buildPayLink({ destination, amount, memo, assetCode = ASSET_CODE, assetIssuer = ASSET_ISSUER }) {
  const params = new URLSearchParams();
  params.set("destination", destination);
  if (amount) params.set("amount", trimZeros(toStellarAmount(amount)));
  if (assetCode && assetIssuer) {
    params.set("asset_code", assetCode);
    params.set("asset_issuer", assetIssuer);
  }
  if (memo) {
    params.set("memo", memo);
    params.set("memo_type", "MEMO_TEXT");
  }
  return `${SCHEME}?${params.toString()}`;
}

/**
 * Lee un enlace de cobro. Acepta `web+stellar:pay?...`, `web stellar:pay?...`
 * (como lo pegan algunos teclados) y una URL con los mismos parámetros.
 * Devuelve null si no es un cobro válido.
 */
export function parsePayLink(raw) {
  if (!raw) return null;
  const text = raw.trim();
  const idx = text.indexOf("?");
  if (idx === -1) return null;

  const head = text.slice(0, idx).toLowerCase().replace(/\s+/g, "+");
  if (!head.endsWith("stellar:pay")) return null;

  const params = new URLSearchParams(text.slice(idx + 1));
  const destination = params.get("destination");
  if (!destination || !/^G[A-Z2-7]{55}$/.test(destination)) return null;

  const amount = params.get("amount");
  const assetCode = params.get("asset_code") || "XLM";
  const assetIssuer = params.get("asset_issuer") || "";

  return {
    destination,
    amount: amount ? Number(amount) : null,
    assetCode,
    assetIssuer,
    memo: params.get("memo") || "",
    memoType: params.get("memo_type") || "MEMO_TEXT",
    raw: text,
  };
}

/** El cobro pide el mismo asset que mueve la demo. */
export function isDemoAsset(cobro) {
  return cobro.assetCode === ASSET_CODE && cobro.assetIssuer === ASSET_ISSUER;
}

function trimZeros(s) {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}
