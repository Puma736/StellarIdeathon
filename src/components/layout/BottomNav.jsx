import { Icon } from "../ui/Icon.jsx";
import { NAV } from "./nav.js";

/** Navegación inferior del celular. En laptop la reemplaza el lateral. */
export function BottomNav({ active, onChange }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(29,27,25,0.05)]">
      <div className="flex justify-around items-center h-[72px] px-gutter max-w-lg mx-auto">
        {NAV.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-space-xs py-space-xs transition-colors ${
                isActive ? "text-primary-container font-semibold" : "text-outline hover:text-on-surface"
              }`}
            >
              <Icon name={tab.icon} size={24} fill={isActive} />
              <span className={`font-label-sm text-label-sm mt-1 ${isActive ? "font-semibold" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
