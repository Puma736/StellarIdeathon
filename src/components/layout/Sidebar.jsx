import { Icon } from "../ui/Icon.jsx";
import { NAV } from "./nav.js";

/** Navegación de laptop: logo, las tres pantallas y el estado de la red. */
export function Sidebar({ active, onChange, ready, pending }) {
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-[260px] flex-col bg-surface-container-lowest border-r border-surface-container-high">
      <div className="h-16 px-5 flex items-center gap-3 border-b border-surface-container-high">
        <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary font-bold tracking-tight shadow-sm">
          R
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-none">Reparte</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">Sobres en Stellar</span>
        </div>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1" aria-label="Secciones">
        {NAV.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onChange(item.id)}
              className={`flex items-center gap-3 h-12 px-3 rounded-xl text-left transition-colors ${
                isActive
                  ? "bg-primary-fixed/50 text-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Icon name={item.icon} size={22} fill={isActive} />
              <span className="flex flex-col min-w-0">
                <span className={`font-label-lg text-label-lg leading-tight ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
                <span className="font-label-sm text-label-sm text-outline leading-tight">{item.hint}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-surface-container-high">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${ready ? "bg-primary animate-pulse" : "bg-secondary-container"}`} />
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {ready ? "Testnet · Stellar activa" : pending || "Preparando testnet"}
          </span>
        </div>
      </div>
    </aside>
  );
}
