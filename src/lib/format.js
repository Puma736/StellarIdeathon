import { BS_RATE } from "../config.js";

const usd2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const usdShort = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const bs = new Intl.NumberFormat("es-BO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Dólares de prueba con dos decimales: 120.00 */
export function formatUsd(value) {
  return usd2.format(Number(value) || 0);
}

/** Dólares de prueba cortos: 120, 1.5 */
export function formatAmount(value) {
  return usdShort.format(Number(value) || 0);
}

/** Bolivianos referenciales: 834,00 */
export function formatBs(usd) {
  return bs.format((Number(usd) || 0) * BS_RATE);
}

/** "Martes 14 oct" */
export function formatDate(iso) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const texto = new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(d);
  return capitalize(texto.replace(",", "").replace(/\.$/, ""));
}

/** "14:20" */
export function formatTime(iso) {
  const d = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

/** "Hoy", "Ayer" o la fecha corta. */
export function formatRelativeDay(iso) {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (sameDay(d, hoy)) return "Hoy";
  if (sameDay(d, ayer)) return "Ayer";
  return formatDate(d);
}

/** G...ABCD → GABC…WXYZ */
export function shortKey(key, n = 4) {
  if (!key || key.length <= n * 2 + 1) return key || "";
  return `${key.slice(0, n)}…${key.slice(-n)}`;
}

/** 86b6978df02a...e43a9b */
export function shortHash(hash) {
  if (!hash) return "";
  return `${hash.slice(0, 12)}...${hash.slice(-6)}`;
}

/** Iniciales para avatares: "Mamá de Lucía" → "ML" */
export function initials(nombre) {
  return (nombre || "?")
    .split(/\s+/)
    .filter((p) => p && !/^(de|del|la|el|y)$/i.test(p))
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/** Bytes UTF-8 de un texto (el memo de Stellar se mide en bytes). */
export function byteLength(text) {
  return new TextEncoder().encode(text || "").length;
}

/** Recorta un texto para que no supere N bytes sin partir un carácter. */
export function truncateBytes(text, maxBytes) {
  let out = text || "";
  while (byteLength(out) > maxBytes) out = out.slice(0, -1);
  return out;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function capitalize(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
