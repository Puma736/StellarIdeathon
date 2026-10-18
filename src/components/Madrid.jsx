import { formatDollars } from "../lib/split.js";

/** Momento 1. Quien envía elige monto, nombre y porcentaje para la cuota. */
export function Madrid({ draft, split, disabled, onChange }) {
  return (
    <section className="moment" aria-labelledby="madrid">
      <p className="where">Madrid</p>
      <h2 id="madrid">El envío</h2>

      <div className="fields">
        <label>
          <span>Monto total</span>
          <input
            type="number"
            name="monto"
            inputMode="decimal"
            min="1"
            step="1"
            value={draft.monto}
            onChange={onChange}
            disabled={disabled}
          />
        </label>

        <label>
          <span>Quién recibe</span>
          <input
            type="text"
            name="nombre"
            maxLength={40}
            value={draft.nombre}
            onChange={onChange}
            disabled={disabled}
          />
        </label>

        <label>
          <span>Porcentaje para la cuota</span>
          <input
            type="number"
            name="porcentaje"
            inputMode="numeric"
            min="0"
            max="100"
            step="1"
            value={draft.porcentaje}
            onChange={onChange}
            disabled={disabled}
          />
        </label>
      </div>

      <p className="preview">
        <strong>{formatDollars(split.paraHoy)}</strong> para hoy ·{" "}
        <strong>{formatDollars(split.cuota)}</strong> para la cuota
      </p>
    </section>
  );
}
