import { useEffect, useState } from "react";
import { hasDemoAccounts } from "./config.js";
import { ensureDemoAccounts } from "./lib/bootstrap.js";
import { AppShell } from "./components/layout/AppShell.jsx";
import { Enviar } from "./features/enviar/Enviar.jsx";
import { Billetera } from "./features/billetera/Billetera.jsx";
import { Cobrar } from "./features/cobrar/Cobrar.jsx";

/** Una sola app. Tres pantallas, una por persona: Enviar · Billetera · Cobrar. */
export default function App() {
  const [tab, setTab] = useState("enviar");
  const [ready, setReady] = useState(hasDemoAccounts);
  const [pending, setPending] = useState(hasDemoAccounts() ? "" : "Preparando la demo en testnet…");
  const [bootError, setBootError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (hasDemoAccounts()) {
      setReady(true);
      setPending("");
      return;
    }

    let cancel = false;
    setBootError("");
    setPending("Preparando la demo en testnet…");
    ensureDemoAccounts((msg) => {
      if (!cancel) setPending(msg);
    })
      .then(() => {
        if (cancel) return;
        setReady(hasDemoAccounts());
        setPending("");
      })
      .catch((err) => {
        if (cancel) return;
        setReady(false);
        setPending("");
        setBootError(err?.message || "No se pudieron preparar las cuentas de testnet.");
      });

    return () => {
      cancel = true;
    };
  }, [attempt]);

  return (
    <AppShell tab={tab} onChange={setTab} ready={ready} pending={pending}>
      {!ready && (bootError ? <BootError message={bootError} onRetry={() => setAttempt((n) => n + 1)} /> : <BootNotice message={pending} />)}
      {tab === "enviar" && <Enviar ready={ready} onGoWallet={() => setTab("billetera")} />}
      {tab === "billetera" && <Billetera ready={ready} />}
      {tab === "cobrar" && <Cobrar ready={ready} />}
    </AppShell>
  );
}

function BootNotice({ message }) {
  return (
    <div className="mb-space-lg p-space-md rounded-xl bg-primary-container/40 text-on-surface font-body-sm text-body-sm">
      {message || "Preparando la demo en testnet…"} La primera visita crea las cuentas. No hace falta un archivo .env.
    </div>
  );
}

function BootError({ message, onRetry }) {
  return (
    <div className="mb-space-lg p-space-md rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-full bg-on-error-container text-error-container px-4 py-2 font-label-sm text-label-sm"
      >
        Reintentar
      </button>
    </div>
  );
}
