import { useState } from "react";
import { SOBRES, sobreById } from "../../config.js";
import { formatAmount } from "../../lib/format.js";
import { adjustPercent, removeEnvelope, sumPercent } from "../../lib/split.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { toneOf } from "../../components/ui/tones.js";

/**
 * Porcentajes por sobre. Ajuste automático: al mover uno, los demás se
 * acomodan para que la suma siempre dé 100.
 */
export function Sobres({ sobres, split, disabled, onChange }) {
  const [adding, setAdding] = useState(false);
  const suma = sumPercent(sobres);
  const ok = Math.round(suma) === 100;
  const faltantes = SOBRES.filter((s) => !sobres.some((x) => x.id === s.id));

  function setPct(id, pct) {
    onChange(adjustPercent(sobres, id, pct));
  }

  function quitar(id) {
    if (sobres.length <= 1) return;
    onChange(removeEnvelope(sobres, id));
  }

  function agregar(id) {
    onChange(adjustPercent([...sobres, { id, pct: 0 }], id, 10));
    setAdding(false);
  }

  return (
    <section className="flex flex-col space-y-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md text-on-surface-variant">Sobres</span>
        <span className="font-label-sm text-label-sm text-primary-container font-medium flex items-center gap-1">
          <Icon name="tune" size={15} fill />
          Ajuste automático
        </span>
      </div>

      <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-sm flex flex-col space-y-space-lg">
        {sobres.map((s) => {
          const meta = sobreById(s.id);
          const tone = toneOf(meta);
          const monto = split.sobres.find((x) => x.id === s.id)?.monto ?? 0;
          return (
            <div key={s.id} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${tone.dot}`} />
                  <span className="font-headline-sm text-headline-sm text-on-surface">{meta?.nombre || s.id}</span>
                  {sobres.length > 1 && !disabled && (
                    <button
                      type="button"
                      aria-label={`Quitar sobre ${meta?.nombre}`}
                      onClick={() => quitar(s.id)}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/50 transition-colors"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </div>
                <div className="text-right flex items-baseline justify-end gap-1">
                  <label className="flex items-baseline">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={100}
                      step={1}
                      disabled={disabled}
                      value={s.pct}
                      onChange={(e) => setPct(s.id, e.target.value)}
                      aria-label={`Porcentaje para ${meta?.nombre}`}
                      className="w-12 bg-transparent text-right font-headline-sm text-headline-sm text-on-surface font-bold outline-none focus:bg-surface-container-low rounded"
                    />
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">%</span>
                  </label>
                  <span className="font-label-sm text-label-sm text-outline ml-1">({formatAmount(monto)} USDp)</span>
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                disabled={disabled}
                value={s.pct}
                onChange={(e) => setPct(s.id, e.target.value)}
                aria-label={`Ajustar ${meta?.nombre}`}
                className="sobre-range"
                style={{
                  "--sobre-color": tone.hex,
                  background: `linear-gradient(to right, ${tone.hex} 0%, ${tone.hex} ${s.pct}%, #ede7e3 ${s.pct}%, #ede7e3 100%)`,
                }}
              />
            </div>
          );
        })}

        <div className="pt-2 flex items-center justify-between">
          {faltantes.length > 0 && !disabled ? (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setAdding((v) => !v)}
                className="inline-flex items-center gap-1 font-label-md text-label-md text-primary-container hover:text-primary transition-colors focus:outline-none"
              >
                <Icon name="add_circle" size={18} />
                Agregar sobre
              </button>
              {adding &&
                faltantes.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => agregar(f.id)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-label-sm ${toneOf(f).text}`}
                  >
                    <Icon name={f.icon} size={14} />
                    {f.nombre}
                  </button>
                ))}
            </div>
          ) : (
            <span />
          )}
          <div
            className={`inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full font-label-sm text-label-sm font-semibold ${
              ok ? "bg-surface-container text-primary" : "bg-error-container text-on-error-container"
            }`}
          >
            <Icon name={ok ? "check_circle" : "error"} size={16} />
            Suma {Math.round(suma)}%
          </div>
        </div>
      </div>
    </section>
  );
}
