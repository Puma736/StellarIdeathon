import { sobreById } from "../../config.js";
import { formatAmount } from "../../lib/format.js";
import { Icon } from "../../components/ui/Icon.jsx";

/** «120 Casa · 60 Colegio · 20 Salud · comisión 2». */
export function VistaPrevia({ split }) {
  return (
    <section className="p-space-lg bg-surface-container-lowest rounded-xl shadow-sm flex flex-col space-y-space-sm">
      <div className="flex items-center gap-2">
        <Icon name="account_balance_wallet" size={18} className="text-primary-container" />
        <span className="font-label-md text-label-md text-on-surface-variant">Resumen de asignación</span>
      </div>
      <div className="p-space-md bg-surface-container-low rounded-lg flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-y-1 gap-x-2 font-headline-sm text-headline-sm text-on-surface">
          {split.sobres.length === 0 && (
            <span className="font-body-sm text-body-sm text-outline">Ingresa un monto para ver el reparto.</span>
          )}
          {split.sobres.map((s, i) => (
            <span key={s.id} className="contents">
              {i > 0 && <span className="text-outline">·</span>}
              <span className="font-semibold">
                {formatAmount(s.monto)}{" "}
                <span className="font-normal text-on-surface-variant">{sobreById(s.id)?.nombre}</span>
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between pt-1 font-body-sm text-body-sm text-outline">
        <span>Comisión de red (1%)</span>
        <span>{formatAmount(split.comision)} USDp</span>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-surface-container font-headline-sm text-headline-sm text-on-surface font-semibold">
        <span>Total a debitar</span>
        <span>{formatAmount(split.totalEmisor)} USDp</span>
      </div>
    </section>
  );
}
