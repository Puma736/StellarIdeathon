import { useState } from "react";
import { SOBRES } from "../../config.js";
import { initials } from "../../lib/format.js";
import { newContactId } from "../../lib/contacts.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { Sheet } from "../../components/ui/Sheet.jsx";

/** A quién: contacto guardado o nombre nuevo. */
export function Contacto({ contacts, contact, disabled, onSelect, onCreate, onRemove }) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("La Paz");

  function close() {
    setOpen(false);
    setCreating(false);
    setNombre("");
    setCiudad("La Paz");
  }

  function submitNew(e) {
    e.preventDefault();
    const n = nombre.trim();
    if (!n) return;
    onCreate({
      id: newContactId(n),
      nombre: n,
      ciudad: ciudad.trim() || "La Paz",
      sobres: SOBRES.map((s) => ({ id: s.id, pct: s.pct })),
    });
    close();
  }

  return (
    <section className="flex flex-col space-y-space-xs">
      <span className="font-label-md text-label-md text-on-surface-variant">A quién</span>
      <div className="flex items-center justify-between p-space-md bg-surface-container-lowest rounded-xl shadow-sm">
        <div className="flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary-container font-headline-sm text-headline-sm font-semibold">
            {initials(contact.nombre)}
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">
              {contact.nombre} · {contact.ciudad}
            </span>
            <span className="font-body-sm text-body-sm text-outline">Cuenta familiar vinculada</span>
          </div>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="px-space-sm py-space-xs font-label-md text-label-md text-primary-container hover:text-primary transition-colors focus:outline-none disabled:opacity-50"
        >
          Cambiar
        </button>
      </div>

      <Sheet
        open={open}
        onClose={close}
        title={creating ? "Nuevo contacto" : "¿A quién le envías?"}
        subtitle={
          creating
            ? "Se guarda en este dispositivo con el reparto de sobres que uses."
            : "Tu libreta guarda a quién mandas y cómo repartes."
        }
      >
        {creating ? (
          <form onSubmit={submitNew} className="flex flex-col gap-space-md">
            <label className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface-variant">Nombre</span>
              <input
                autoFocus
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Papá, Tía Rosa"
                className="bg-surface-container-low rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface outline-none focus:bg-surface-container"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface-variant">Ciudad</span>
              <input
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="La Paz, El Alto, Cochabamba…"
                className="bg-surface-container-low rounded-xl px-4 py-3 font-body-lg text-body-lg text-on-surface outline-none focus:bg-surface-container"
              />
            </label>
            <p className="font-body-sm text-body-sm text-outline">
              En la demo todos los contactos reciben en los mismos tres sobres de testnet.
            </p>
            <button
              type="submit"
              disabled={!nombre.trim()}
              className="w-full h-[52px] rounded-[14px] bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold disabled:opacity-50"
            >
              Guardar contacto
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="w-full h-12 rounded-[14px] bg-surface-container text-on-surface font-label-lg text-label-lg font-medium"
            >
              Volver
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-space-sm">
            {contacts.map((c) => {
              const selected = c.id === contact.id;
              return (
                <div
                  key={c.id}
                  role="radio"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => {
                    onSelect(c.id);
                    close();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (onSelect(c.id), close())}
                  className={`cursor-pointer rounded-xl p-space-md flex items-center justify-between gap-space-sm transition-colors ${
                    selected ? "bg-primary-fixed/30" : "bg-surface-container-low hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary-container font-label-lg text-label-lg font-bold">
                      {initials(c.nombre)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">{c.nombre}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {c.ciudad} · {c.sobres.map((s) => `${s.pct}%`).join(" · ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {contacts.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Quitar a ${c.nombre}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(c.id);
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/50"
                      >
                        <Icon name="delete" size={18} />
                      </button>
                    )}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        selected ? "bg-primary text-on-primary" : "bg-surface-container-high"
                      }`}
                    >
                      {selected ? (
                        <Icon name="check" size={18} />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-surface-container-lowest" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mt-space-xs w-full h-[52px] rounded-[14px] bg-surface-container text-on-surface font-label-lg text-label-lg font-medium flex items-center justify-center gap-2"
            >
              <Icon name="person_add" size={20} />
              Nuevo contacto
            </button>
          </div>
        )}
      </Sheet>
    </section>
  );
}
