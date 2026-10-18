import { formatDollars } from "../lib/split.js";
import { expertUrl } from "../lib/expert.js";

/** Momento 3. Dos tarjetas, una por cuenta, y el hash como prueba. */
export function LaPaz({ nombre, split, hash }) {
  const sent = Boolean(hash);

  return (
    <section className={`moment ${sent ? "sent" : ""}`} aria-labelledby="lapaz">
      <p className="where">La Paz</p>
      <h2 id="lapaz">{nombre?.trim() || "Quien recibe"}</h2>

      <div className="cards">
        <article className="card today">
          <p className="label">Para hoy</p>
          <p className="amount">{formatDollars(split.paraHoy)}</p>
          <p className="note">Cuenta de la casa</p>
        </article>

        <article className="card quota">
          <p className="label">Cuota</p>
          <p className="amount">{formatDollars(split.cuota)}</p>
          <p className="note">Cuenta aparte, no entra al gasto del día</p>
        </article>
      </div>

      {sent ? (
        <div className="proof">
          <a href={expertUrl(hash)} target="_blank" rel="noreferrer">
            Ver las dos operaciones en Stellar Expert
          </a>
          <code>{hash}</code>
        </div>
      ) : (
        <p className="hint">El hash aparece aquí cuando sale el envío.</p>
      )}
    </section>
  );
}
