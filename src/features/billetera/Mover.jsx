import { useState } from "react";
import { SOBRES } from "../../config.js";
import { expertUrl } from "../../lib/expert.js";
import { formatAmount, formatBs, formatUsd } from "../../lib/format.js";
import { moveBetweenEnvelopes } from "../../lib/stellar.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { Sheet } from "../../components/ui/Sheet.jsx";
import { toneOf } from "../../components/ui/tones.js";

/** Mover saldo entre sobres: de Casa a Salud si sobró. Un pago entre cuentas de la misma familia. */
export function Mover({ open, fromId, balances, onClose, onMoved }) {
  const [from, setFrom] = useState(fromId);
  const [to, setTo] = useState(() => SOBRES.find((s) => s.id !== fromId)?.id);
  const [monto, setMonto] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [hash, setHash] = useState(null);

  const saldo = balances[from] ?? 0;
  const n = Number(monto);
  const valido = from && to && from !== to && Number.isFinite(n) && n > 0 && n <= saldo;

  async function confirmar() {
    if (!valido || status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      const r = await moveBetweenEnvelopes({ fromId: from, toId: to, amount: n });
      setHash(r.hash);
      setStatus("done");
      onMoved?.();
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  function cerrar() {
    setStatus("idle");
    setError(null);
    setHash(null);
    setMonto("");
    onClose();
  }

  if (status === "done") {
    const sTo = SOBRES.find((s) => s.id === to);
    return (
      <Sheet open={open} onClose={cerrar} title="Saldo movido" subtitle={`${formatAmount(n)} USDp ya están en el sobre ${sTo?.nombre}.`}>
        <div className="flex flex-col items-center gap-space-md">
          <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
            <Icon name="check" size={28} fill />
          </div>
          <a
            href={expertUrl(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label-sm text-label-sm text-primary-container hover:underline flex items-center gap-1 font-semibold"
          >
            Ver en Stellar Expert <Icon name="open_in_new" size={14} />
          </a>
          <button
            type="button"
            onClick={cerrar}
            className="w-full h-[52px] rounded-[14px] bg-surface-container text-on-surface font-label-lg text-label-lg font-medium"
          >
            Volver a la billetera
          </button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onClose={cerrar} title="Mover entre sobres" subtitle="Un pago entre las cuentas de tu familia. Sin comisión de Reparte.">
      <div className="flex flex-col gap-space-md">
        <Selector label="Desde" value={from} exclude={null} balances={balances} onChange={(id) => { setFrom(id); if (id === to) setTo(SOBRES.find((s) => s.id !== id)?.id); }} />
        <div className="flex justify-center -my-2">
          <Icon name="arrow_downward" size={20} className="text-outline" />
        </div>
        <Selector label="Hacia" value={to} exclude={from} balances={balances} onChange={setTo} />

        <label className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant">Monto</span>
            <button
              type="button"
              onClick={() => setMonto(String(saldo))}
              className="font-label-sm text-label-sm text-primary-container font-semibold"
            >
              Todo ({formatUsd(saldo)})
            </button>
          </div>
          <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-3 focus-within:bg-surface-container">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent font-headline-lg text-headline-lg text-on-surface font-bold outline-none pr-16"
            />
            <span className="absolute right-4 font-headline-sm text-headline-sm text-primary font-semibold">USDp</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant px-1">
            {n > 0 ? `≈ Bs ${formatBs(n)}` : "\u00a0"}
            {n > saldo && <span className="text-error"> · supera el saldo del sobre</span>}
          </span>
        </label>

        {error && (
          <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm">{error}</div>
        )}

        <button
          type="button"
          disabled={!valido || status === "sending"}
          onClick={confirmar}
          className="w-full h-[54px] rounded-xl bg-on-background text-surface flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-md disabled:opacity-40"
        >
          {status === "sending" ? (
            <>
              <Icon name="progress_activity" size={20} className="animate-spin" /> Moviendo…
            </>
          ) : (
            <>
              Mover {n > 0 ? `${formatAmount(n)} USDp` : ""} <Icon name="arrow_forward" size={20} />
            </>
          )}
        </button>
        <button type="button" onClick={cerrar} className="h-10 font-label-md text-label-md text-outline underline underline-offset-4">
          Cancelar
        </button>
      </div>
    </Sheet>
  );
}

function Selector({ label, value, exclude, balances, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {SOBRES.map((s) => {
          const tone = toneOf(s);
          const selected = s.id === value;
          const off = s.id === exclude || !s.publicKey;
          return (
            <button
              key={s.id}
              type="button"
              disabled={off}
              onClick={() => onChange(s.id)}
              className={`rounded-xl p-space-sm flex flex-col items-center gap-1 transition-colors disabled:opacity-40 ${
                selected ? tone.selectedBg : "bg-surface-container-low hover:bg-surface-container"
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${selected ? tone.iconSolid : tone.iconSoft}`}>
                <Icon name={s.icon} size={20} />
              </div>
              <span className="font-label-md text-label-md text-on-surface">{s.nombre}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{formatAmount(balances[s.id] ?? 0)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
