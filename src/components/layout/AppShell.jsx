import { BottomNav } from "./BottomNav.jsx";
import { Header } from "./Header.jsx";
import { Sidebar } from "./Sidebar.jsx";

/**
 * Marco de la app. En el celular es la pantalla de Stitch.
 * Desde laptop abre el lateral y deja que el contenido use el ancho.
 */
export function AppShell({ tab, onChange, ready, children }) {
  return (
    <div className="min-h-[100dvh] bg-surface text-on-surface font-body-md text-body-md lg:bg-surface-container">
      <Sidebar active={tab} onChange={onChange} ready={ready} />
      <div className="lg:pl-[260px]">
        <Header ready={ready} tab={tab} />
        <main className="mx-auto w-full max-w-lg md:max-w-6xl px-margin md:px-8 pt-20 pb-28 lg:pt-24 lg:pb-10">
          {children}
        </main>
      </div>
      <BottomNav active={tab} onChange={onChange} />
    </div>
  );
}
