import { useEffect } from "react";

/** Hoja inferior, como el modal de escaneo del diseño. */
export function Sheet({ open, onClose, children, title, subtitle }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end lg:items-center justify-center bg-inverse-surface/40 backdrop-blur-[2px] lg:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="presentation"
    >
      <div
        className="sheet-enter bg-surface-container-lowest w-full max-w-lg rounded-t-[20px] lg:rounded-[20px] p-space-lg pb-safe flex flex-col shadow-xl max-h-[92dvh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mb-space-lg self-center lg:hidden" />
        {title && (
          <div className="flex flex-col items-center text-center mb-space-md">
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">{title}</h3>
            {subtitle && (
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mt-1">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
