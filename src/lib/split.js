import { FEE_RATE } from "../config.js";

// Stellar acepta hasta 7 decimales por monto.
const DECIMALS = 7;

/**
 * Reparte el monto entre sobres según su porcentaje y calcula la comisión.
 *   sobres: [{ id, pct }]  → [{ id, pct, monto }]
 * El último sobre absorbe el redondeo para que la suma dé exactamente el total.
 * La comisión (1%) la paga quien envía, encima del monto. La familia recibe el total.
 */
export function splitEnvelopes(monto, sobres = []) {
  const total = toAmount(monto);
  const activos = (Array.isArray(sobres) ? sobres : []).filter((s) => toPercent(s.pct) > 0);

  let acumulado = 0;
  const repartidos = activos.map((s, i) => {
    const pct = toPercent(s.pct);
    let parte;
    if (i === activos.length - 1) {
      parte = round(total - acumulado);
    } else {
      parte = round((total * pct) / 100);
      acumulado = round(acumulado + parte);
    }
    return { ...s, pct, monto: parte };
  });

  const comision = round(total * FEE_RATE);

  return {
    sobres: repartidos,
    comision,
    total,
    totalEmisor: round(total + comision),
  };
}

/** Suma de porcentajes, para validar que dé 100. */
export function sumPercent(sobres) {
  return (Array.isArray(sobres) ? sobres : []).reduce((acc, s) => acc + toPercent(s.pct), 0);
}

/** Lo que la demo puede firmar: monto positivo, porcentajes que suman 100, cada parte > 0. */
export function isValidSplit(split, sobres) {
  return (
    split.total > 0 &&
    split.sobres.length > 0 &&
    split.sobres.every((s) => s.monto > 0) &&
    Math.round(sumPercent(sobres)) === 100
  );
}

/**
 * Ajuste automático: fija el porcentaje de un sobre y reparte el resto entre
 * los demás, proporcional a lo que tenían. Siempre devuelve suma 100 en enteros.
 */
export function adjustPercent(sobres, id, nuevoPct) {
  const target = Math.min(100, Math.max(0, Math.round(Number(nuevoPct) || 0)));
  const otros = sobres.filter((s) => s.id !== id);
  if (otros.length === 0) return sobres.map((s) => ({ ...s, pct: 100 }));

  const resto = 100 - target;
  const sumaOtros = otros.reduce((acc, s) => acc + s.pct, 0);

  const ajustados = otros.map((s) => ({
    ...s,
    pct:
      sumaOtros > 0
        ? Math.floor((s.pct / sumaOtros) * resto)
        : Math.floor(resto / otros.length),
  }));

  // Lo que faltó por el piso se lo lleva el último de los otros.
  const faltante = resto - ajustados.reduce((acc, s) => acc + s.pct, 0);
  ajustados[ajustados.length - 1].pct += faltante;

  return sobres.map((s) =>
    s.id === id ? { ...s, pct: target } : ajustados.find((a) => a.id === s.id),
  );
}

/** Al quitar un sobre, su porcentaje pasa al primero que queda. */
export function removeEnvelope(sobres, id) {
  const quitado = sobres.find((s) => s.id === id);
  const quedan = sobres.filter((s) => s.id !== id);
  if (!quitado || quedan.length === 0) return sobres;
  return quedan.map((s, i) => (i === 0 ? { ...s, pct: s.pct + quitado.pct } : s));
}

/** Monto como string de 7 decimales, el formato que pide Operation.payment. */
export function toStellarAmount(value) {
  return round(value).toFixed(DECIMALS);
}

export function round(value) {
  const factor = 10 ** DECIMALS;
  return Math.round(Number(value) * factor) / factor;
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
