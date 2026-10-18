/**
 * Colores por sobre, tomados del diseño: Casa verde, Colegio terracota, Salud azul lago.
 * Las clases van completas para que Tailwind las encuentre al compilar.
 */
export const TONES = {
  primary: {
    hex: "#1f6f5f",
    dot: "bg-primary-container",
    cardBg: "bg-[#E8F3F0]",
    iconSolid: "bg-primary-container text-on-primary",
    iconSoft: "bg-primary-fixed text-primary-container",
    badge: "text-primary-container",
    text: "text-primary",
    payBtn: "bg-primary text-on-primary hover:bg-primary-container",
    selectedBg: "bg-primary-fixed/30",
    check: "bg-primary text-on-primary",
  },
  secondary: {
    hex: "#9e4308",
    dot: "bg-secondary",
    cardBg: "bg-[#F9ECE4]",
    iconSolid: "bg-secondary text-on-secondary",
    iconSoft: "bg-secondary-fixed text-secondary",
    badge: "text-secondary",
    text: "text-secondary",
    payBtn: "bg-secondary text-on-secondary active:opacity-90",
    selectedBg: "bg-secondary-fixed/40",
    check: "bg-secondary text-on-secondary",
  },
  tertiary: {
    hex: "#154c8a",
    dot: "bg-tertiary",
    cardBg: "bg-[#EAF0F9]",
    iconSolid: "bg-tertiary text-on-tertiary",
    iconSoft: "bg-tertiary-fixed text-tertiary",
    badge: "text-tertiary",
    text: "text-tertiary",
    payBtn: "bg-tertiary text-on-tertiary hover:bg-tertiary-container",
    selectedBg: "bg-tertiary-fixed/40",
    check: "bg-tertiary text-on-tertiary",
  },
};

export function toneOf(sobre) {
  return TONES[sobre?.tone] || TONES.primary;
}
