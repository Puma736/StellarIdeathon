import { DEFAULT_RECIPIENT, SOBRES } from "../config.js";

// Libreta de contactos en localStorage. Sin backend, sin login.
const KEY = "reparte.contactos";
const LAST_COBRO_KEY = "reparte.ultimoCobro";

export function defaultSobres() {
  return SOBRES.map((s) => ({ id: s.id, pct: s.pct }));
}

const DEFAULT_CONTACT = {
  id: "mama",
  nombre: DEFAULT_RECIPIENT.nombre,
  ciudad: DEFAULT_RECIPIENT.ciudad,
  sobres: defaultSobres(),
};

function normalizeSobres(list) {
  if (!Array.isArray(list) || list.length === 0) return defaultSobres();
  const cleaned = list
    .filter((s) => s && SOBRES.some((x) => x.id === s.id))
    .map((s) => ({ id: s.id, pct: Number(s.pct) || 0 }));
  return cleaned.length > 0 ? cleaned : defaultSobres();
}

function normalizeContact(c) {
  if (!c || typeof c !== "object") return null;
  const nombre = String(c.nombre || c.name || "").trim();
  return {
    id: c.id || "mama",
    nombre: nombre || DEFAULT_RECIPIENT.nombre,
    ciudad: String(c.ciudad || c.city || DEFAULT_RECIPIENT.ciudad).trim() || DEFAULT_RECIPIENT.ciudad,
    sobres: normalizeSobres(c.sobres),
  };
}

export function loadContacts() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : null;
    if (Array.isArray(list) && list.length > 0) {
      const normalized = list.map(normalizeContact).filter(Boolean);
      if (normalized.length > 0) return normalized;
    }
  } catch {
    // libreta corrupta: se vuelve a la de fábrica
  }
  return [DEFAULT_CONTACT];
}

export function saveContacts(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

/** Crea o actualiza un contacto. Devuelve la libreta completa. */
export function upsertContact(contact) {
  const list = loadContacts();
  const idx = list.findIndex((c) => c.id === contact.id);
  const next = idx === -1 ? [...list, contact] : list.map((c, i) => (i === idx ? contact : c));
  return saveContacts(next);
}

export function removeContact(id) {
  const next = loadContacts().filter((c) => c.id !== id);
  return saveContacts(next.length > 0 ? next : [DEFAULT_CONTACT]);
}

export function newContactId(nombre) {
  const slug = (nombre || "contacto")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug || "contacto"}-${Date.now().toString(36)}`;
}

/** Último cobro generado en la pestaña Cobrar. Sirve para pagarlo desde la Billetera en el mismo dispositivo. */
export function saveLastCobro(cobro) {
  localStorage.setItem(LAST_COBRO_KEY, JSON.stringify({ ...cobro, creado: Date.now() }));
}

export function loadLastCobro() {
  try {
    const raw = localStorage.getItem(LAST_COBRO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
