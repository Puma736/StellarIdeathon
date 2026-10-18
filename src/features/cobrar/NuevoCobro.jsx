import { MEMO_MAX_BYTES } from "../../config.js";
import { byteLength, formatBs, truncateBytes } from "../../lib/format.js";
import { Icon } from "../../components/ui/Icon.jsx";

/** Formulario del cobro: monto y concepto. */
export function NuevoCobro({ monto, concepto, disabled, onMonto, onConcepto, onGenerar }) {
  const n = Number(monto);
  const valido = Number.isFinite(n) && n > 0;

  return (
    <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md mb-space-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-xs">
          <Icon name="add_circle" size={22} className="text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Nuevo cobro</h2>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">Inmediato</span>
      </div>

      <form
        className="flex flex-col gap-space-md"
        onSubmit={(e) => {
          e.preventDefault();
          if (valido) onGenerar();
        }}
      >
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="monto-input">
            Monto a cobrar
          </label>
          <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:bg-surface-container transition-colors">
            <input
              id="monto-input"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={monto}
              disabled={disabled}
              onChange={(e) => onMonto(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent font-headline-lg text-headline-lg text-on-surface font-bold outline-none pr-16"
            />
            <span className="absolute right-4 font-headline-sm text-headline-sm text-primary font-semibold">USDp</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant px-1">Equivale a aprox. Bs {formatBs(valido ? n : 0)}</p>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="concepto-input">
              Concepto o detalle
            </label>
            <span className="font-label-sm text-label-sm text-outline">
              {byteLength(concepto)}/{MEMO_MAX_BYTES}
            </span>
          </div>
          <div className="flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:bg-surface-container transition-colors">
            <input
              id="concepto-input"
              type="text"
              value={concepto}
              disabled={disabled}
              onChange={(e) => onConcepto(truncateBytes(e.target.value, MEMO_MAX_BYTES))}
              placeholder="Ej. Cuota escolar, pensión..."
              className="w-full bg-transparent font-body-lg text-body-lg text-on-surface outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!valido || disabled}
          className="h-[54px] w-full rounded-xl bg-primary text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs shadow-sm active:bg-primary-container transition-all disabled:opacity-40"
        >
          <Icon name="qr_code_2" size={20} />
          <span>Generar QR de cobro</span>
        </button>
      </form>
    </section>
  );
}
