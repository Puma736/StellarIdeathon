import { useState } from "react";
import { DEFAULT_RECIPIENT, sobreByPublic } from "../../config.js";
import { expertUrl } from "../../lib/expert.js";
import { formatAmount, formatRelativeDay, formatTime, initials, shortKey } from "../../lib/format.js";
import { Icon } from "../../components/ui/Icon.jsx";

/** Pagos recibidos por el comercio: quién pagó, cuánto, concepto, hash. */
export function Recibidos({ items, loading, error }) {
  const [all, setAll] = useState(false);
  const visibles = all ? items : items.slice(0, 3);
  const hoy = new Date().toDateString();

  return (
    <section className="flex flex-col gap-space-sm mb-space-lg">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-space-xs">
          <Icon name="history" size={20} className="text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Cobros recibidos</h2>
        </div>
        {items.length > 3 && (
          <button type="button" onClick={() => setAll((v) => !v)} className="font-label-sm text-label-sm text-primary hover:underline font-semibold">
            {all ? "Ver menos" : "Ver todos"}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-space-sm">
        {loading && items.length === 0 && (
          <p className="px-1 font-body-sm text-body-sm text-outline">Leyendo la red…</p>
        )}
        {error && <p className="px-1 font-body-sm text-body-sm text-error">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="px-1 font-body-sm text-body-sm text-outline">Todavía nadie pagó un cobro. Genera un QR y págalo desde la Billetera.</p>
        )}

        {visibles.map((p, i) => {
          const sobre = sobreByPublic(p.de);
          const quien = sobre ? `${DEFAULT_RECIPIENT.nombre} · Sobre ${sobre.nombre}` : shortKey(p.de, 6);
          const esHoy = new Date(p.fecha).toDateString() === hoy;
          const destacado = i === 0 && esHoy;
          return (
            <article
              key={`${p.hash}-${i}`}
              className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-xs relative overflow-hidden"
            >
              {destacado && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-label-md shrink-0 ${
                      destacado ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container text-on-surface"
                    }`}
                  >
                    {sobre ? initials(DEFAULT_RECIPIENT.nombre + " " + sobre.nombre) : p.de.slice(1, 3)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate">{quien}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{p.concepto || "Sin concepto"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="font-headline-sm text-headline-sm text-primary font-bold">+{formatAmount(p.monto)} USDp</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {formatTime(p.fecha)} · {formatRelativeDay(p.fecha)}
                  </span>
                </div>
              </div>
              <div className={`flex items-center ${destacado ? "justify-between" : "justify-end"} pt-1`}>
                {destacado && (
                  <span className="inline-flex items-center gap-1 bg-primary-fixed/60 text-on-primary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
                    <Icon name="check_circle" size={14} />
                    Pagado hoy
                  </span>
                )}
                <a
                  href={expertUrl(p.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-0.5"
                >
                  <span>Ver comprobante</span>
                  <Icon name="chevron_right" size={14} />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
