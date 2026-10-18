import { formatBs, formatUsd } from "../../lib/format.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { toneOf } from "../../components/ui/tones.js";

const ESTADO = {
  primary: "Al día",
  secondary: "Protegido",
  tertiary: "Seguro",
};

/** Tarjeta de un sobre: saldo en USDp y Bs, botones Pagar · Mover. */
export function SobreCard({ sobre, balance, loading, disabled, onPagar, onMover }) {
  const tone = toneOf(sobre);
  const sinCuenta = !sobre.publicKey;

  return (
    <div className={`rounded-[14px] ${tone.cardBg} p-space-lg flex flex-col relative overflow-hidden transition-all`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ${tone.iconSolid}`}>
            <Icon name={sobre.icon} size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">{sobre.nombre}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{sobre.descripcion}</span>
          </div>
        </div>
        <span
          className={`${tone.badge} font-label-sm text-label-sm bg-surface-container-lowest/80 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1`}
        >
          {sobre.protegido && <Icon name="lock" size={14} />}
          {ESTADO[sobre.tone]}
        </span>
      </div>

      <div className="mt-space-lg flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface font-bold">
            {loading && balance == null ? "—" : formatUsd(balance ?? 0)}
          </span>
          <span className="font-headline-sm text-headline-sm text-on-surface-variant font-semibold">USDp</span>
        </div>
        <span className="font-currency-reference text-currency-reference text-on-surface-variant mt-0.5">
          {sinCuenta ? "Sin cuenta en .env" : `≈ ${formatBs(balance ?? 0)} Bs ref.`}
        </span>
      </div>

      {sobre.protegido && (
        <div className={`flex items-center gap-1.5 mt-2 ${tone.text} font-body-sm text-body-sm`}>
          <Icon name="lock" size={16} />
          <span>Solo para pagar al colegio</span>
        </div>
      )}

      <div className="mt-space-md pt-3 flex items-center justify-between bg-surface-container-lowest/50 -mx-space-lg -mb-space-lg px-space-lg pb-space-lg">
        <div className="flex items-center gap-1.5 text-on-surface-variant">
          <Icon name={sobre.protegido ? "event_upcoming" : sobre.tone === "tertiary" ? "verified_user" : "receipt_long"} size={18} />
          <span className="font-body-sm text-body-sm">{sobre.nota}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={onMover}
            className="h-9 px-3 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md font-semibold hover:bg-surface transition-colors shadow-xs disabled:opacity-50"
          >
            Mover
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={onPagar}
            className={`h-9 px-3.5 rounded-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 shadow-xs disabled:opacity-50 ${tone.payBtn}`}
          >
            {sobre.protegido && <Icon name="qr_code" size={16} />}
            <span>Pagar</span>
            {!sobre.protegido && <Icon name="chevron_right" size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
