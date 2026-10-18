import { FEE_RATE } from "../config.js";

// Stellar acepta hasta 7 decimales por monto.
const DECIMALS = 7;

/**
 * Parte el envío en dos.
 *   paraHoy = monto * (1 - porcentaje)
 *   cuota   = monto * porcentaje
 * La comisión (1%) la paga quien envía, encima del monto. La familia recibe el total.
 */
export function splitRemittance(monto, porcentaje) {
  const total = toAmount(monto);
  const rate = toPercent(porcentaje) / 100;

  const cuota = round(total * rate);
  const paraHoy = round(total - cuota);
  const comision = round(total * FEE_RATE);

  return {
    paraHoy,
    cuota,
    comision,
    total,
    totalEmisor: round(total + comision),
  };
}

/** Lo que la demo puede firmar: monto positivo y porcentaje entre 0 y 100. */
export function isValidSplit({ paraHoy, cuota, total }) {
  return total > 0 && paraHoy >= 0 && cuota >= 0 && paraHoy + cuota > 0;
}

/** Monto como string de 7 decimales, el formato que pide Operation.payment. */
export function toStellarAmount(value) {
  return round(value).toFixed(DECIMALS);
}

/** Número para mostrar en pantalla: 140, 60, 1.5. */
export function formatDollars(value) {
  return new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(round(value));
}

function toAmount(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function toPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function round(value) {
  const factor = 10 ** DECIMALS;
  return Math.round(value * factor) / factor;
}
