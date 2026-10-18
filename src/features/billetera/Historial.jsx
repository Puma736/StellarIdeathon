import { useState } from "react";
import { SENDER_CITY, SENDER_NAME, demo, sobreById } from "../../config.js";
import { expertUrl } from "../../lib/expert.js";
import { formatAmount, formatDate, shortKey } from "../../lib/format.js";
import { Icon } from "../../components/ui/Icon.jsx";

/** Envíos recibidos: fecha, quién mandó, mensaje, montos por sobre, enlace al hash. */
export function Historial({ items, loading, error }) {
  const [all, setAll] = useState(false);
  const visibles = all ? items : items.slice(0, 3);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-space-md">
        <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Últimos envíos</h2>
        {items.length > 3 && (
          <button
            type="button"
            onClick={() => setAll((v) => !v)}
            className="font-label-md text-label-md text-primary-container font-semibold hover:underline"
          >
            {all ? "Ver menos" : "Ver todos"}
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-[14px] p-space-md shadow-sm flex flex-col gap-space-md">
        {loading && items.length === 0 && (
          <p className="p-3 font-body-sm text-body-sm text-outline">Leyendo la red…</p>
        )}
        {error && <p className="p-3 font-body-sm text-body-sm text-error">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="p-3 font-body-sm text-body-sm text-outline">
            Todavía no llegó ningún envío con memo <code className="font-mono">REPARTE</code>.
          </p>
        )}

        {visibles.map((env, i) => (
          <div key={env.hash} className="contents">
            {i > 0 && <div className="h-[1px] bg-surface-container-high mx-2" />}
            <div className="flex flex-col p-3 rounded-lg hover:bg-surface-container-low transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon name="south_west" size={20} className="text-primary" />
                  <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    {env.de === demo.senderPublic ? `${SENDER_NAME}, ${SENDER_CITY}` : shortKey(env.de)}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{formatDate(env.fecha)}</span>
              </div>
              {env.mensaje && (
                <p className="font-body-md text-body-md text-on-surface font-medium mb-1.5">“{env.mensaje}”</p>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-surface-container-high gap-2">
                <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                  {Object.entries(env.montos)
                    .map(([id, m]) => `${formatAmount(m)} ${sobreById(id)?.nombre || id}`)
                    .join(" · ")}
                </span>
                <a
                  href={expertUrl(env.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-label-sm text-label-sm text-primary-container font-semibold hover:underline inline-flex items-center gap-0.5 shrink-0"
                >
                  <span>Ver comprobante</span>
                  <Icon name="open_in_new" size={14} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
