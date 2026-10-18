/** Ícono de Material Symbols. `fill` dibuja la versión rellena. */
export function Icon({ name, size = 24, fill = false, className = "", ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${fill ? "is-filled" : ""} ${className}`}
      style={{ fontSize: size }}
      {...rest}
    >
      {name}
    </span>
  );
}
