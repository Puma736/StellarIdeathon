import { useMemo, useState } from "react";
import {
  DEFAULT_AMOUNT,
  DEFAULT_PERCENT,
  DEFAULT_RECIPIENT,
} from "./config.js";
import { Madrid } from "./components/Madrid.jsx";
import { Enviar } from "./components/Enviar.jsx";
import { LaPaz } from "./components/LaPaz.jsx";
import { isValidSplit, splitRemittance } from "./lib/split.js";
import { hasDemoAccounts, sendSplit } from "./lib/stellar.js";

const initialDraft = {
  monto: DEFAULT_AMOUNT,
  nombre: DEFAULT_RECIPIENT,
  porcentaje: DEFAULT_PERCENT,
};

/** Una sola página, tres momentos: Madrid, Enviar, La Paz. */
export default function App() {
  const [draft, setDraft] = useState(initialDraft);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [hash, setHash] = useState(null);
  const [error, setError] = useState(null);

  const split = useMemo(
    () => splitRemittance(draft.monto, draft.porcentaje),
    [draft.monto, draft.porcentaje],
  );

  const ready = hasDemoAccounts();
  const canSend = isValidSplit(split);
  const sending = status === "sending";

  function onChange(event) {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
    // Cambió el pedido: el comprobante anterior ya no corresponde.
    setHash(null);
    setError(null);
    setStatus("idle");
  }

  async function onSend() {
    if (!ready || !canSend || sending) return;

    setStatus("sending");
    setError(null);
    setHash(null);

    try {
      const txHash = await sendSplit({
        paraHoy: split.paraHoy,
        cuota: split.cuota,
      });
      setHash(txHash);
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="track">Pagos y remesas · Testnet</p>
        <h1>Reparte</h1>
        <p className="lead">
          La remesa llega partida: una parte para hoy y otra directo a la cuenta de la cuota.
        </p>
      </header>

      <Madrid draft={draft} split={split} disabled={sending} onChange={onChange} />

      <Enviar
        split={split}
        status={status}
        error={error}
        ready={ready}
        canSend={canSend}
        onSend={onSend}
      />

      <LaPaz nombre={draft.nombre} split={split} hash={hash} />

      <footer className="foot">
        Montos en dólares de prueba. Una transacción, dos operaciones, memo <code>REPARTE</code>.
      </footer>
    </main>
  );
}
