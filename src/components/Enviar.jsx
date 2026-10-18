import { formatDollars } from "../lib/split.js";

/** Momento 2. Un botón construye, firma y envía la transacción de testnet. */
export function Enviar({ split, status, error, ready, canSend, onSend }) {
  const sending = status === "sending";

  return (
    <section className="moment" aria-labelledby="enviar">
      <p className="where">Enviar</p>
      <h2 id="enviar">Una sola transacción</h2>

      <p className="fee">
        Comisión del envío: {formatDollars(split.comision)} (1%). Recibir es gratis.
      </p>

      <button
        type="button"
        className="send"
        onClick={onSend}
        disabled={!ready || !canSend || sending}
      >
        {sending ? "Firmando y enviando…" : "Enviar partido"}
      </button>

      {!ready && (
        <p className="hint">
          Faltan las cuentas de prueba. Corre <code>npm run cuentas</code> y copia el
          resultado a <code>.env</code>.
        </p>
      )}

      {ready && !canSend && !sending && (
        <p className="hint">El monto tiene que ser mayor a cero.</p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
