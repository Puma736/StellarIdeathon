import { Icon } from "../ui/Icon.jsx";
import { NAV } from "./nav.js";

/** Barra superior. En el celular lleva el logo; en laptop, la sección activa. */
export function Header({ ready, tab, pending }) {
  const current = NAV.find((item) => item.id === tab);

  return (
    <header className="fixed top-0 inset-x-0 z-30 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(29,27,25,0.04)] lg:left-[260px] lg:bg-surface-container/80 lg:shadow-none lg:border-b lg:border-surface-container-high">
      <div className="h-16 px-margin md:px-8 flex items-center justify-between max-w-lg md:max-w-6xl mx-auto">
        <div className="flex items-center gap-space-sm lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary font-headline-sm text-headline-sm font-bold tracking-tight shadow-sm">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight leading-none">
              Reparte
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-2 h-2 rounded-full ${ready ? "bg-primary animate-pulse" : "bg-secondary-container"}`} />
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium leading-none">
                {ready ? "Red Stellar Activa" : pending || "Preparando testnet"}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col">
          <span className="font-label-sm text-label-sm text-outline leading-none">{current?.hint}</span>
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold mt-1 leading-none">
            {current?.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
            <span className={`w-1.5 h-1.5 rounded-full ${ready ? "bg-primary" : "bg-secondary-container"}`} />
            {ready ? "Testnet" : "Preparando"}
          </span>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Icon name="person" size={18} className="text-on-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
