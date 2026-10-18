import { useEffect, useRef, useState } from "react";
import { COLEGIO_PUBLIC, COMERCIO, SOBRES, sobreByPublic } from "../../config.js";
import { expertUrl } from "../../lib/expert.js";
import { formatAmount, formatBs, formatUsd, shortKey } from "../../lib/format.js";
import { isDemoAsset } from "../../lib/sep7.js";
import { payFromEnvelope } from "../../lib/stellar.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { toneOf } from "../../components/ui/tones.js";

/**
 * Pagar un cobro leído (SEP-0007): elegir el sobre y confirmar.
 * Un pago de Stellar desde la cuenta del sobre con el concepto en el memo.
 */
export function Pagar({ cobro, balances, preselectId, onBack, onPaid }) {
  const puede = (s) => s.publicKey && (balances[s.id] ?? 0) >= (cobro.amount ?? 0);
  const inicial =
    (preselectId && puede(SOBRES.find((s) => s.id === preselectId)) && preselectId) ||
    (cobro.destination === COLEGIO_PUBLIC && puede(SOBRES.find((s) => s.id === "colegio")) && "colegio") ||
    SOBRES.find(puede)?.id ||
    null;

  const [sobreId, setSobreId] = useState(inicial);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const esColegio = cobro.destination === COLEGIO_PUBLIC;
  const esSobre = sobreByPublic(cobro.destination);
  const nombreDestino = esColegio ? COMERCIO.nombre : esSobre ? `Sobre ${esSobre.nombre}` : shortKey(cobro.destination, 6);
  const assetOk = isDemoAsset(cobro);
  const monto = cobro.amount ?? 0;

  async function confirmar() {
    if (!sobreId || status === "sending" || !assetOk || monto <= 0) return;
    setStatus("sending");
    setError(null);
    try {
      const r = await payFromEnvelope({
        sobreId,
        destination: cobro.destination,
        amount: monto,
        memo: cobro.memo,
      });
      setResult(r);
      setStatus("done");
      onPaid?.();
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  if (status === "done" && result) {
    const sobre = SOBRES.find((s) => s.id === sobreId);
    return (
      <div className="flex flex-col w-full pb-8">
        <div className="flex items-center justify-between py-space-sm mb-space-md">
          <button type="button" onClick={onBack} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
            <Icon name="close" size={22} />
          </button>
          <span className="font-headline-sm text-headline-sm text-on-surface">Pago realizado</span>
          <div className="w-10 h-10" />
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col items-center text-center relative overflow-hidden mb-space-lg">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary-fixed/30 pointer-events-none blur-2xl" />
          <div className="relative w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-space-md">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <Icon name="check" size={28} fill />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary-container/20 animate-ping" style={{ animationDuration: "2.5s" }} />
          </div>
          <span className="font-label-md text-label-md uppercase tracking-wider text-primary-container font-bold mb-1">Pagado desde el sobre {sobre?.nombre}</span>
          <div className="mt-space-sm mb-1 flex items-baseline justify-center gap-1.5">
            <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface font-extrabold tracking-tight">{formatUsd(monto)}</span>
            <span className="font-headline-sm text-headline-sm text-primary-container font-bold">USDp</span>
          </div>
          <p className="font-currency-reference text-currency-reference text-on-surface-variant font-medium">
            a {nombreDestino}{cobro.memo ? ` · “${cobro.memo}”` : ""}
          </p>
          <div className="w-full h-px bg-surface-container-high my-space-md" />
          <a
            href={expertUrl(result.hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-label-md text-label-md text-primary-container hover:underline flex items-center gap-1 font-semibold"
          >
            Ver comprobante en Stellar Expert <Icon name="open_in_new" size={16} />
          </a>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="w-full h-[54px] rounded-xl bg-on-background text-surface flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-md"
        >
          Volver a la billetera
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full pb-8 md:pb-2">
      <div className="flex items-center justify-between py-space-sm mb-space-md">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors active:scale-95"
        >
          <Icon name="arrow_back" size={22} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-headline-sm text-headline-sm text-on-surface">Pagar con QR</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Icon name="check_circle" size={15} fill className="text-primary" />
            <span className="font-label-sm text-label-sm text-primary">Cobro leído</span>
          </div>
        </div>
        <div className="w-10 h-10" />
      </div>

      <div className="md:grid md:grid-cols-2 md:gap-8 md:items-start">
      <div>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-space-lg mb-space-lg relative overflow-hidden">
        <div className="flex items-start justify-between mb-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
              <Icon name={esColegio ? "school" : "storefront"} size={26} fill />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md text-headline-md text-on-surface">{nombreDestino}</span>
                {esColegio && <Icon name="verified" size={18} fill className="text-primary" />}
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">{cobro.memo || "Sin concepto"}</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col items-center justify-center text-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total a transferir</span>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface">{formatAmount(monto)}</span>
            <span className="font-headline-md text-headline-md text-primary-container">{cobro.assetCode}</span>
          </div>
          <span className="font-currency-reference text-currency-reference text-on-surface-variant mt-0.5">≈ {formatBs(monto)} Bs ref.</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-space-md pt-space-xs">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {esColegio ? "Comercio verificado" : "Destino"} · {shortKey(cobro.destination, 6)}
          </span>
        </div>
      </div>

      {!assetOk && (
        <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm mb-space-lg">
          Este cobro pide {cobro.assetCode}{cobro.assetIssuer ? ` de ${shortKey(cobro.assetIssuer)}` : ""}. Los sobres de la demo solo mueven USDp.
        </div>
      )}
      {monto <= 0 && (
        <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm mb-space-lg">
          El cobro no trae monto. Pide al comercio que genere el QR con un monto.
        </div>
      )}
      </div>

      <div>
      <div className="flex flex-col mb-space-lg">
        <div className="mb-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Pagar desde:</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Elige el sobre con el que deseas cubrir este monto</p>
        </div>
        <div role="radiogroup" aria-label="Sobres disponibles" className="flex flex-col gap-space-sm">
          {SOBRES.map((s) => {
            const tone = toneOf(s);
            const saldo = balances[s.id] ?? 0;
            const alcanza = puede(s);
            const selected = s.id === sobreId;
            const resto = saldo - monto;
            return (
              <div
                key={s.id}
                role="radio"
                aria-checked={selected}
                aria-disabled={!alcanza}
                tabIndex={alcanza ? 0 : -1}
                onClick={() => alcanza && setSobreId(s.id)}
                onKeyDown={(e) => alcanza && e.key === "Enter" && setSobreId(s.id)}
                className={`rounded-xl p-space-md shadow-sm transition-all relative overflow-hidden ${
                  !alcanza
                    ? "opacity-60 cursor-not-allowed bg-surface-container-lowest"
                    : selected
                      ? `${tone.selectedBg} cursor-pointer active:scale-[0.99]`
                      : "bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low active:scale-[0.99]"
                }`}
              >
                <div className="flex items-start justify-between gap-space-sm">
                  <div className="flex items-center gap-space-sm">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? tone.iconSolid : tone.iconSoft}`}>
                      <Icon name={s.icon} size={20} fill={selected} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface">Sobre {s.nombre}</span>
                      <span className={`font-body-sm text-body-sm text-on-surface ${selected ? "font-semibold" : ""}`}>
                        {formatAmount(saldo)} USDp{" "}
                        <span className="font-currency-reference text-currency-reference text-on-surface-variant font-normal">
                          (≈ {formatBs(saldo)} Bs)
                        </span>
                      </span>
                    </div>
                  </div>
                  {!alcanza ? (
                    <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-outline">
                      <Icon name="block" size={16} />
                    </div>
                  ) : selected ? (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs ${tone.check}`}>
                      <Icon name="check" size={18} />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-surface-container-lowest" />
                    </div>
                  )}
                </div>
                {!alcanza ? (
                  <div className="mt-space-sm pt-space-xs flex items-center gap-1.5 text-error">
                    <Icon name="info" size={16} />
                    <span className="font-label-sm text-label-sm">
                      {s.publicKey ? `Saldo insuficiente (faltan ${formatAmount(monto - saldo)} USDp)` : "Sin cuenta en .env"}
                    </span>
                  </div>
                ) : s.protegido ? (
                  <div className={`mt-space-sm pt-space-xs flex items-center gap-1.5 ${tone.text}`}>
                    <Icon name="lock" size={16} fill />
                    <span className="font-label-sm text-label-sm font-semibold">
                      {resto === 0 ? "Saldo exacto disponible · " : ""}Solo para pagar al colegio
                    </span>
                  </div>
                ) : (
                  <div className="mt-space-xs pl-[48px]">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Quedarán {formatAmount(resto)} USDp tras el pago</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface-container-high/60 rounded-xl p-space-md mb-space-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="bolt" size={20} className="text-primary" />
          <span className="font-body-sm text-body-sm text-on-surface">
            Comisión de pago: <strong className="font-semibold text-primary">0 USDp</strong>
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">Inmediato en Stellar</span>
      </div>

      {error && (
        <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm mb-space-md flex items-start gap-2">
          <Icon name="error" size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-space-sm mt-auto">
        <button
          type="button"
          disabled={!sobreId || !assetOk || monto <= 0 || status === "sending"}
          onClick={confirmar}
          className="w-full h-[54px] rounded-xl bg-on-background text-surface flex items-center justify-center gap-2 font-label-lg text-label-lg shadow-md active:bg-inverse-surface transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {status === "sending" ? (
            <>
              <Icon name="progress_activity" size={20} className="animate-spin" />
              <span>Firmando con el sobre…</span>
            </>
          ) : (
            <>
              <span>Confirmar pago ({formatAmount(monto)} USDp)</span>
              <Icon name="arrow_forward" size={20} />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="h-12 flex items-center justify-center font-label-md text-label-md text-outline hover:text-on-surface transition-colors underline underline-offset-4 decoration-outline-variant"
        >
          Cancelar y volver a Billetera
        </button>
      </div>
      </div>
      </div>
    </div>
  );
}

/**
 * Lector de QR con la cámara usando BarcodeDetector (Chrome/Android, Safari 17+).
 * Si el navegador no lo trae, avisa para pegar el enlace.
 */
export function Escaner({ onResult, onError }) {
  const videoRef = useRef(null);
  const [soportado] = useState(() => typeof window !== "undefined" && "BarcodeDetector" in window);
  const [estado, setEstado] = useState("iniciando");

  useEffect(() => {
    if (!soportado) return undefined;
    let stream;
    let timer;
    let activo = true;

    (async () => {
      try {
        // eslint-disable-next-line no-undef
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!activo) return;
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        setEstado("buscando");

        timer = setInterval(async () => {
          if (!activo || video.readyState < 2) return;
          try {
            const codes = await detector.detect(video);
            const hit = codes.find((c) => c.rawValue);
            if (hit) {
              clearInterval(timer);
              onResult(hit.rawValue);
            }
          } catch {
            // frame no legible, se intenta en el siguiente
          }
        }, 300);
      } catch (err) {
        setEstado("error");
        onError?.(err?.message || "No se pudo abrir la cámara.");
      }
    })();

    return () => {
      activo = false;
      clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [soportado, onResult, onError]);

  if (!soportado) {
    return (
      <div className="rounded-xl bg-surface-container-low p-space-md font-body-sm text-body-sm text-on-surface-variant text-center">
        Este navegador no puede leer QR con la cámara. Pega el enlace del cobro abajo.
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-inverse-surface aspect-square w-full">
      <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
      <div className="absolute inset-8 border-2 border-surface-container-lowest/80 rounded-xl pointer-events-none" />
      <span className="absolute bottom-3 inset-x-0 text-center font-label-sm text-label-sm text-surface-container-lowest/90">
        {estado === "buscando" ? "Apunta al QR del colegio o la tienda" : estado === "error" ? "Sin acceso a la cámara" : "Abriendo cámara…"}
      </span>
    </div>
  );
}
