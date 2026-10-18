import { useCallback, useEffect, useState } from "react";
import { DEFAULT_RECIPIENT, SOBRES } from "../../config.js";
import { loadLastCobro } from "../../lib/contacts.js";
import { formatAmount, formatBs, formatUsd } from "../../lib/format.js";
import { parsePayLink } from "../../lib/sep7.js";
import { loadBalances, loadHistory } from "../../lib/stellar.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { Sheet } from "../../components/ui/Sheet.jsx";
import { SobreCard } from "./SobreCard.jsx";
import { Historial } from "./Historial.jsx";
import { Escaner, Pagar } from "./Pagar.jsx";
import { Mover } from "./Mover.jsx";

/** Pantalla Billetera (La Paz): sobres con saldo real, historial, pagar y mover. */
export function Billetera({ ready }) {
  const { balances, history, loading, error, refresh } = useWalletData(ready);

  const [view, setView] = useState("main"); // main | pagar
  const [cobro, setCobro] = useState(null);
  const [preselect, setPreselect] = useState(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [moverFrom, setMoverFrom] = useState(null);

  const total = SOBRES.reduce((acc, s) => acc + (balances[s.id] ?? 0), 0);
  const activos = SOBRES.filter((s) => s.publicKey).length;

  function abrirPago(sobreId = null) {
    setPreselect(sobreId);
    setScanOpen(true);
  }

  function cobroLeido(parsed) {
    setCobro(parsed);
    setScanOpen(false);
    setView("pagar");
  }

  function volver() {
    setView("main");
    setCobro(null);
    setPreselect(null);
  }

  if (view === "pagar" && cobro) {
    return <Pagar cobro={cobro} balances={balances} preselectId={preselect} onBack={volver} onPaid={refresh} />;
  }

  return (
    <div className="flex flex-col w-full pb-8 md:pb-2">
      <div className="md:grid md:grid-cols-5 md:gap-8 md:items-start">
      <div className="md:col-span-3 flex flex-col">
      <div className="flex flex-col mb-space-lg">
        <div className="flex items-center justify-between mb-space-xs">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Hola, {DEFAULT_RECIPIENT.nombre} 👋</h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container lg:bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {DEFAULT_RECIPIENT.ciudad}, BO
          </span>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">Tus fondos recibidos desde Madrid (Red Stellar)</p>
      </div>

      <div className="bg-surface-container-lowest rounded-[14px] p-space-lg shadow-sm mb-space-lg flex flex-col">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-label-md text-on-surface-variant font-medium">Saldo total repartido</span>
          <button
            type="button"
            onClick={refresh}
            disabled={loading || !ready}
            aria-label="Actualizar saldos"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-40"
          >
            <Icon name="refresh" size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface font-bold">
            {loading && total === 0 ? "—" : formatUsd(total)}
          </span>
          <span className="font-headline-sm text-headline-sm text-primary-container font-semibold">USDp</span>
        </div>
        <p className="font-currency-reference text-currency-reference text-on-surface-variant mt-0.5">
          ≈ {formatBs(total)} Bs referencial ({formatAmount(total)} USDp)
        </p>
        {error && <p className="mt-2 font-body-sm text-body-sm text-error">{error}</p>}
        <div className="mt-space-lg md:mt-space-md">
          <button
            type="button"
            disabled={!ready}
            onClick={() => abrirPago(null)}
            className="w-full md:w-auto md:min-w-[280px] md:px-6 h-[54px] rounded-[14px] bg-on-background text-on-primary flex items-center justify-center gap-space-sm active:scale-[0.98] transition-all shadow-sm disabled:opacity-40"
          >
            <Icon name="qr_code_scanner" size={24} />
            <span className="font-label-lg text-label-lg font-semibold tracking-wide">Escanear QR para pagar</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col mb-space-xl">
        <div className="flex flex-col mb-space-md">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">Tus Sobres Familiares</h2>
            <span className="font-label-sm text-label-sm text-primary-container font-semibold">{activos} activos</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Cada sobre es una cuenta separada y protegida para tu hogar.
          </p>
        </div>
        <div className="flex flex-col gap-space-md">
          {SOBRES.map((s) => (
            <SobreCard
              key={s.id}
              sobre={s}
              balance={balances[s.id]}
              loading={loading}
              disabled={!ready || !s.publicKey}
              onPagar={() => abrirPago(s.id)}
              onMover={() => setMoverFrom(s.id)}
            />
          ))}
        </div>
      </div>
      </div>

      <div className="md:col-span-2 md:sticky md:top-24">
      <Historial items={history} loading={loading} error={error} />
      </div>
      </div>

      <LeerCobro open={scanOpen} onClose={() => setScanOpen(false)} onResult={cobroLeido} />

      {moverFrom && (
        <Mover
          key={moverFrom}
          open
          fromId={moverFrom}
          balances={balances}
          onClose={() => setMoverFrom(null)}
          onMoved={refresh}
        />
      )}
    </div>
  );
}

/** Hoja para obtener el cobro: cámara, pegar enlace o usar el último cobro generado en Cobrar. */
function LeerCobro({ open, onClose, onResult }) {
  const [modo, setModo] = useState("menu"); // menu | camara
  const [texto, setTexto] = useState("");
  const [error, setError] = useState(null);
  const ultimo = open ? loadLastCobro() : null;

  useEffect(() => {
    if (!open) {
      setModo("menu");
      setTexto("");
      setError(null);
    }
  }, [open]);

  const leer = useCallback(
    (raw) => {
      const parsed = parsePayLink(raw);
      if (!parsed) {
        setError("Ese enlace no es un cobro web+stellar:pay válido.");
        return;
      }
      onResult(parsed);
    },
    [onResult],
  );

  async function pegar() {
    try {
      const t = await navigator.clipboard.readText();
      setTexto(t);
      leer(t);
    } catch {
      setError("No pude leer el portapapeles. Pega el enlace a mano.");
    }
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={modo === "camara" ? "Escaneando…" : "Escanear código QR"}
      subtitle={
        modo === "camara"
          ? undefined
          : "Apunta tu cámara al código QR de la tienda, farmacia o colegio en Bolivia para pagar en segundos."
      }
    >
      {modo === "menu" && (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-primary-container mb-space-md">
            <Icon name="photo_camera" size={32} />
          </div>
        </div>
      )}

      {modo === "camara" && (
        <div className="mb-space-md">
          <Escaner onResult={leer} onError={setError} />
        </div>
      )}

      <div className="w-full flex flex-col gap-2.5">
        {modo === "menu" && (
          <button
            type="button"
            onClick={() => setModo("camara")}
            className="w-full h-[52px] rounded-[14px] bg-primary-container text-on-primary font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2"
          >
            <Icon name="videocam" size={20} />
            <span>Abrir cámara</span>
          </button>
        )}

        {ultimo && (
          <button
            type="button"
            onClick={() => leer(ultimo.link)}
            className="w-full min-h-[52px] rounded-[14px] bg-secondary-fixed/50 text-on-secondary-fixed font-label-lg text-label-lg font-semibold flex items-center justify-center gap-2 px-4 py-2"
          >
            <Icon name="qr_code" size={20} />
            <span className="truncate">
              Usar último cobro: {formatAmount(ultimo.amount)} USDp{ultimo.memo ? ` · ${ultimo.memo}` : ""}
            </span>
          </button>
        )}

        <div className="flex items-center gap-2 bg-surface-container-low rounded-[14px] px-3 py-2 focus-within:bg-surface-container">
          <Icon name="link" size={20} className="text-outline shrink-0" />
          <input
            value={texto}
            onChange={(e) => {
              setTexto(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && leer(texto)}
            placeholder="web+stellar:pay?destination=G…"
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline"
          />
          {texto ? (
            <button type="button" onClick={() => leer(texto)} className="font-label-md text-label-md text-primary-container font-semibold shrink-0">
              Pagar
            </button>
          ) : (
            <button type="button" onClick={pegar} className="font-label-md text-label-md text-primary-container font-semibold shrink-0">
              Pegar
            </button>
          )}
        </div>

        {error && <p className="font-label-sm text-label-sm text-error text-center">{error}</p>}

        <button
          type="button"
          onClick={onClose}
          className="w-full h-[48px] rounded-[14px] bg-surface-container text-on-surface font-label-lg text-label-lg font-medium"
        >
          Cancelar
        </button>
      </div>
    </Sheet>
  );
}

/** Saldos e historial leídos de Horizon, con refresco manual. */
function useWalletData(ready) {
  const [balances, setBalances] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(ready);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(null);
    try {
      const [b, h] = await Promise.all([loadBalances(), loadHistory()]);
      setBalances(b);
      setHistory(h);
    } catch (err) {
      setError(err?.message || "No se pudo leer Horizon.");
    } finally {
      setLoading(false);
    }
  }, [ready]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { balances, history, loading, error, refresh };
}
