import { useState } from "react";
import { sobreById } from "../../config.js";
import { expertUrl } from "../../lib/expert.js";
import { formatAmount, formatBs, formatDate, formatTime, formatUsd, initials, shortHash } from "../../lib/format.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { toneOf } from "../../components/ui/tones.js";

/** Comprobante del envío: hash, montos por sobre, mensaje y botón para compartir. */
export function Comprobante({ result, onClose, onGoWallet }) {
  const { hash, createdAt, split, mensaje, contacto, sobresPct } = result;
  const [copied, setCopied] = useState(false);
  const url = expertUrl(hash);

  const resumen = split.sobres
    .map((s) => `${formatAmount(s.monto)} ${sobreById(s.id)?.nombre}`)
    .join(" · ");

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    [
      `Reparte · Envío a ${contacto.nombre} (${contacto.ciudad})`,
      `${formatUsd(split.total)} USDp ≈ Bs ${formatBs(split.total)}`,
      resumen,
      mensaje ? `Mensaje: ${mensaje}` : null,
      `Comprobante: ${url}`,
    ]
      .filter(Boolean)
      .join("\n"),
  )}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin portapapeles: el hash está a la vista
    }
  }

  return (
    <div className="flex flex-col w-full pb-8">
      <div className="flex items-center justify-between py-space-sm mb-space-md">
        <button
          type="button"
          aria-label="Cerrar comprobante"
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors active:scale-95 shadow-sm"
        >
          <Icon name="close" size={22} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-label-md text-label-md text-on-surface">Comprobante de envío</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-primary-container" />
            <span className="font-label-sm text-label-sm text-primary-container font-semibold">Completado en Stellar</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Imprimir o guardar PDF"
          onClick={() => window.print()}
          className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors active:scale-95 shadow-sm"
        >
          <Icon name="download" size={20} />
        </button>
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-6 md:items-start">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col items-center text-center relative overflow-hidden mb-space-lg md:col-start-1">
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary-fixed/30 pointer-events-none blur-2xl" />
        <div className="relative w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-space-md">
          <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <Icon name="check" size={28} fill />
          </div>
          <div className="absolute inset-0 rounded-full bg-primary-container/20 animate-ping" style={{ animationDuration: "2.5s" }} />
        </div>
        <span className="font-label-md text-label-md uppercase tracking-wider text-primary-container font-bold mb-1">
          ¡Dinero recibido!
        </span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Envío realizado</h1>
        <div className="mt-space-sm mb-1 flex items-baseline justify-center gap-1.5">
          <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface font-extrabold tracking-tight">
            {formatUsd(split.total)}
          </span>
          <span className="font-headline-sm text-headline-sm text-primary-container font-bold">USDp</span>
        </div>
        <p className="font-currency-reference text-currency-reference text-on-surface-variant font-medium">
          ≈ Bs {formatBs(split.total)} ref.
        </p>
        <div className="w-full h-px bg-surface-container-high my-space-md" />
        <div className="flex items-center justify-between w-full px-space-xs">
          <div className="flex items-center gap-space-sm text-left">
            <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-headline-sm text-headline-sm font-bold shadow-sm">
              {initials(contacto.nombre)}
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">Para {contacto.nombre}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <Icon name="location_on" size={15} className="text-secondary" />
                {contacto.ciudad}, Bolivia
              </span>
            </div>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-label-sm text-label-sm text-on-surface font-medium">{formatDate(createdAt)}</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{formatTime(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-lg md:col-start-2 md:row-start-1">
        <div className="flex items-center justify-between mb-space-md">
          <div className="flex items-center gap-space-xs">
            <Icon name="mail" size={20} fill className="text-primary-container" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Distribución en sobres</h2>
          </div>
          <span className="font-label-sm text-label-sm bg-primary-fixed/40 text-on-primary-fixed-variant px-2.5 py-0.5 rounded-full font-semibold">
            {split.sobres.length} {split.sobres.length === 1 ? "sobre" : "sobres"}
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          La familia ya tiene los fondos asignados y organizados en su billetera:
        </p>
        <div className="flex flex-col gap-space-sm">
          {split.sobres.map((s) => {
            const meta = sobreById(s.id);
            const tone = toneOf(meta);
            const pct = sobresPct.find((x) => x.id === s.id)?.pct ?? s.pct;
            return (
              <div key={s.id} className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tone.iconSoft}`}>
                      <Icon name={meta?.icon} size={18} />
                    </div>
                    <div>
                      <span className="font-label-md text-label-md text-on-surface font-bold">Sobre {meta?.nombre}</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant ml-1.5">({pct}%)</span>
                    </div>
                  </div>
                  <span className="font-label-lg text-label-lg text-on-surface font-bold">{formatAmount(s.monto)} USDp</span>
                </div>
                <div className="flex items-center justify-between pl-11 text-on-surface-variant">
                  {meta?.protegido ? (
                    <span className="font-body-sm text-body-sm text-secondary bg-surface-container-highest px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                      <Icon name="lock" size={14} /> Protegido para cuotas
                    </span>
                  ) : (
                    <span className="font-body-sm text-body-sm">{meta?.descripcion}</span>
                  )}
                  <span className="font-body-sm text-body-sm font-medium">≈ Bs {formatBs(s.monto)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm mb-space-lg md:col-start-1">
        {mensaje && (
          <div className="bg-surface-container-low rounded-lg p-space-md flex items-start gap-space-sm mb-space-md">
            <Icon name="chat_bubble" size={22} className="text-secondary mt-0.5" />
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Mensaje para la familia</span>
              <p className="font-body-md text-body-md text-on-surface font-medium italic mt-0.5">“{mensaje}”</p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-body-sm text-body-sm">Monto enviado a destino</span>
            <span className="font-body-sm text-body-sm font-semibold text-on-surface">{formatUsd(split.total)} USDp</span>
          </div>
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="font-body-sm text-body-sm flex items-center gap-1">
              Comisión Reparte (1%)
              <Icon name="info" size={15} className="text-outline" />
            </span>
            <span className="font-body-sm text-body-sm font-semibold text-on-surface">{formatUsd(split.comision)} USDp</span>
          </div>
          <div className="h-px bg-surface-container-high my-1" />
          <div className="flex justify-between items-center">
            <span className="font-label-md text-label-md text-on-surface font-bold">Total debitado (Madrid)</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">{formatUsd(split.totalEmisor)} USDp</span>
          </div>
        </div>
      </div>

      <div className="bg-surface-container rounded-xl p-space-md mb-space-lg md:col-start-2 md:bg-surface-container-lowest md:shadow-sm">
        <div className="flex items-center justify-between mb-space-xs">
          <div className="flex items-center gap-1.5">
            <Icon name="verified_user" size={18} className="text-primary-container" />
            <span className="font-label-sm text-label-sm text-on-surface font-bold">Registro en Stellar Network</span>
          </div>
          <span className="font-label-sm text-label-sm text-primary-container font-semibold">Inmutable</span>
        </div>
        <div className="bg-surface-container-lowest rounded-lg p-space-sm flex items-center justify-between gap-2 mt-2">
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant">ID de Transacción</span>
            <span className="font-body-sm text-body-sm font-mono text-on-surface font-bold truncate">{shortHash(hash)}</span>
          </div>
          <button
            type="button"
            onClick={copy}
            className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm hover:bg-surface-container-high active:scale-95 transition-all flex items-center gap-1 shrink-0 font-medium ${
              copied ? "bg-primary-fixed text-on-primary-fixed-variant" : "bg-surface-container text-on-surface"
            }`}
          >
            <Icon name={copied ? "check" : "content_copy"} size={16} />
            {copied ? "¡Copiado!" : "Copiar"}
          </button>
        </div>
        <div className="mt-space-sm flex justify-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label-sm text-label-sm text-primary-container hover:underline flex items-center gap-1 font-semibold"
          >
            Verificar en Stellar Expert
            <Icon name="open_in_new" size={14} />
          </a>
        </div>
      </div>

      <div className="flex flex-col gap-space-sm mt-auto md:col-start-2">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-[54px] bg-primary-container hover:bg-primary text-on-primary rounded-xl font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all"
        >
          <Icon name="share" size={22} />
          Compartir constancia por WhatsApp
        </a>
        <button
          type="button"
          onClick={onGoWallet}
          className="w-full h-[54px] bg-surface-container-lowest hover:bg-surface-container-low text-on-surface rounded-xl font-label-lg text-label-lg font-semibold flex items-center justify-center shadow-sm active:scale-[0.99] transition-all"
        >
          Ver la billetera de {contacto.nombre}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-12 flex items-center justify-center font-label-md text-label-md text-outline hover:text-on-surface transition-colors underline underline-offset-4 decoration-outline-variant"
        >
          Volver al inicio
        </button>
      </div>
      </div>
    </div>
  );
}
