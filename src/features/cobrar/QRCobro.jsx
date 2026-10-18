import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { COMERCIO } from "../../config.js";
import { formatAmount } from "../../lib/format.js";
import { Icon } from "../../components/ui/Icon.jsx";

/** QR del cobro (enlace web+stellar:pay) y botones para compartir o copiar el enlace. */
export function QRCobro({ cobro }) {
  const [src, setSrc] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let vivo = true;
    QRCode.toDataURL(cobro.link, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 448,
      color: { dark: "#1d1b19", light: "#ffffff" },
    })
      .then((url) => vivo && setSrc(url))
      .catch(() => vivo && setSrc(null));
    return () => {
      vivo = false;
    };
  }, [cobro.link]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(cobro.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin portapapeles
    }
  }

  async function compartir() {
    const texto = `Cobro ${COMERCIO.nombre}: ${formatAmount(cobro.amount)} USDp${cobro.memo ? ` · ${cobro.memo}` : ""}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Cobro ${COMERCIO.nombre}`, text: `${texto}\n${cobro.link}` });
        return;
      } catch {
        // cancelado
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${texto}\n${cobro.link}`)}`, "_blank", "noopener");
  }

  return (
    <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col items-center text-center mb-space-lg relative overflow-hidden">
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary-fixed text-on-primary-fixed-variant px-2.5 py-1 rounded-full">
        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
        <span className="font-label-sm text-label-sm font-semibold">Listo para escanear</span>
      </div>

      <div className="mt-4 mb-3 p-4 bg-surface-container-lowest rounded-xl shadow-[0_2px_12px_rgba(29,27,25,0.06)] flex items-center justify-center">
        {src ? (
          <img src={src} alt={`Código QR para ${cobro.memo || "el cobro"}`} className="w-56 h-56 rounded-lg" />
        ) : (
          <div className="w-56 h-56 rounded-lg bg-surface-container-low animate-pulse" />
        )}
      </div>

      <div className="flex flex-col items-center">
        <span className="font-headline-md text-headline-md text-on-surface font-bold">
          {formatAmount(cobro.amount)} USDp{cobro.memo ? ` · ${cobro.memo}` : ""}
        </span>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Escanea desde la app Reparte (Sobre Colegio)</p>
      </div>

      <div className="grid grid-cols-2 gap-space-sm w-full mt-space-lg">
        <button
          type="button"
          onClick={compartir}
          className="h-12 bg-surface-container rounded-xl flex items-center justify-center gap-space-xs text-on-surface font-label-md text-label-md active:bg-surface-container-high transition-colors"
        >
          <Icon name="share" size={18} />
          <span>Compartir</span>
        </button>
        <button
          type="button"
          onClick={copiar}
          className={`h-12 rounded-xl flex items-center justify-center gap-space-xs font-label-md text-label-md transition-colors ${
            copied ? "bg-primary-fixed text-on-primary-fixed-variant" : "bg-surface-container text-on-surface active:bg-surface-container-high"
          }`}
        >
          <Icon name={copied ? "check" : "content_copy"} size={18} />
          <span>{copied ? "¡Copiado!" : "Copiar"}</span>
        </button>
      </div>

      <details className="w-full mt-space-md text-left">
        <summary className="font-label-sm text-label-sm text-outline cursor-pointer select-none">Ver enlace SEP-0007</summary>
        <code className="block mt-1 p-space-sm bg-surface-container-low rounded-lg font-mono text-[11px] leading-4 text-on-surface-variant break-all">
          {cobro.link}
        </code>
      </details>
    </section>
  );
}
