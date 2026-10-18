import { useState } from "react";
import { hasDemoAccounts } from "./config.js";
import { AppShell } from "./components/layout/AppShell.jsx";
import { Enviar } from "./features/enviar/Enviar.jsx";
import { Billetera } from "./features/billetera/Billetera.jsx";
import { Cobrar } from "./features/cobrar/Cobrar.jsx";

/** Una sola app. Tres pantallas, una por persona: Enviar · Billetera · Cobrar. */
export default function App() {
  const [tab, setTab] = useState("enviar");
  const ready = hasDemoAccounts();

  return (
    <AppShell tab={tab} onChange={setTab} ready={ready}>
      {!ready && <EnvNotice />}
      {tab === "enviar" && <Enviar ready={ready} onGoWallet={() => setTab("billetera")} />}
      {tab === "billetera" && <Billetera ready={ready} />}
      {tab === "cobrar" && <Cobrar ready={ready} />}
    </AppShell>
  );
}

function EnvNotice() {
  return (
    <div className="mb-space-lg p-space-md rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm">
      Faltan las cuentas de la demo. Corre <code className="font-mono font-semibold">npm run cuentas</code> para crear el{" "}
      <code className="font-mono font-semibold">.env</code> y reinicia <code className="font-mono font-semibold">npm run dev</code>.
      Mientras tanto la app muestra el flujo sin firmar nada.
    </div>
  );
}
