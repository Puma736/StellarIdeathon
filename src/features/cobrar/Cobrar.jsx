import { useCallback, useEffect, useState } from "react";
import { COMERCIO, demo } from "../../config.js";
import { saveLastCobro } from "../../lib/contacts.js";
import { formatAmount, formatBs, shortKey } from "../../lib/format.js";
import { buildPayLink } from "../../lib/sep7.js";
import { loadReceived } from "../../lib/stellar.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { NuevoCobro } from "./NuevoCobro.jsx";
import { QRCobro } from "./QRCobro.jsx";
import { Recibidos } from "./Recibidos.jsx";

/** Pantalla Cobrar (el colegio): monto y concepto → QR; lista de cobros recibidos. */
export function Cobrar({ ready }) {
  const [monto, setMonto] = useState("60");
  const [concepto, setConcepto] = useState("Matrícula marzo");
  const [cobro, setCobro] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const { items, loading, error, refresh } = useReceived(ready);

  const ahora = new Date();
  const totalMes = items
    .filter((p) => {
      const d = new Date(p.fecha);
      return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
    })
    .reduce((acc, p) => acc + p.monto, 0);

  function generar() {
    const amount = Number(monto);
    const memo = concepto.trim();
    const link = buildPayLink({ destination: demo.colegioPublic, amount, memo });
    const nuevo = { link, amount, memo, destination: demo.colegioPublic };
    setCobro(nuevo);
    saveLastCobro(nuevo);
  }

  async function copiarCuenta() {
    try {
      await navigator.clipboard.writeText(demo.colegioPublic);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      // sin portapapeles
    }
  }

  return (
    <div className="flex flex-col w-full pb-8 md:pb-2 md:grid md:grid-cols-2 md:gap-8 md:items-start">
      <div className="flex flex-col">
      <section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md mb-space-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-space-sm min-w-0">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/15 flex items-center justify-center text-tertiary shrink-0">
              <Icon name={COMERCIO.icon} size={28} />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">{COMERCIO.nombre}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Icon name="verified" size={15} fill className="text-primary" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Comercio verificado · {COMERCIO.ciudad}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={copiarCuenta}
            disabled={!demo.colegioPublic}
            aria-label={copiedKey ? "Cuenta copiada" : "Copiar cuenta del colegio"}
            title={demo.colegioPublic ? `Copiar cuenta ${shortKey(demo.colegioPublic)}` : "Preparando la cuenta"}
            className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
          >
            <Icon name={copiedKey ? "check" : "key"} size={20} />
          </button>
        </div>
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total cobrado este mes</span>
            <button
              type="button"
              onClick={refresh}
              disabled={loading || !ready}
              aria-label="Actualizar cobros"
              className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-primary disabled:opacity-40"
            >
              <Icon name="refresh" size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="flex items-baseline gap-space-xs mt-1">
            <span className="font-display-currency-mobile text-display-currency-mobile text-primary tracking-tight">
              {loading && items.length === 0 ? "—" : formatAmount(totalMes)}
            </span>
            <span className="font-headline-sm text-headline-sm text-primary font-semibold">USDp</span>
          </div>
          <span className="font-currency-reference text-currency-reference text-on-surface-variant mt-0.5">≈ {formatBs(totalMes)} Bs ref.</span>
        </div>
      </section>

      <NuevoCobro
        monto={monto}
        concepto={concepto}
        disabled={!demo.colegioPublic}
        onMonto={setMonto}
        onConcepto={setConcepto}
        onGenerar={generar}
      />
      </div>

      <div className="flex flex-col md:sticky md:top-24">
      {cobro ? <QRCobro cobro={cobro} /> : <QrPendiente />}

      <Recibidos items={items} loading={loading} error={error} />

      <footer className="flex items-center justify-center gap-1.5 py-space-sm text-center">
        <span className="w-2 h-2 rounded-full bg-primary/70" />
        <span className="font-label-sm text-label-sm text-on-surface-variant">Cobrar es gratis · Pagos liquidados en Stellar Network</span>
      </footer>
      </div>
    </div>
  );
}

function QrPendiente() {
  return (
    <section className="hidden md:flex bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex-col items-center text-center mb-space-lg border border-dashed border-outline-variant">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary-container mb-space-sm">
        <Icon name="qr_code_2" size={32} />
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface">El QR aparece acá</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">
        Carga el monto y el concepto, y genera el cobro. La familia lo escanea desde la billetera.
      </p>
    </section>
  );
}

function useReceived(ready) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(ready);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      setItems(await loadReceived());
    } catch (err) {
      setError(err?.message || "No se pudo leer Horizon.");
    } finally {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { items, loading, error, refresh };
}
