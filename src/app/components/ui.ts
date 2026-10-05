/**
 * The site's shared look, as class strings. Use these rather than writing
 * button/input classes inline, so every page matches. (Admin uses them too.)
 */

const buttonBase =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-bold tracking-wide uppercase transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-[18px] py-[9px] text-[13px]",
  lg: "px-5 py-3 text-sm",
} as const;

const buttonVariants = {
  primary:
    "bg-gradient-to-br from-gold-bright to-gold text-[#141414] shadow-[0_2px_10px_rgba(212,175,55,0.25)] hover:brightness-110",
  outline: "border border-line text-ink hover:border-gold hover:text-gold-bright",
  danger: "border border-red/60 text-red hover:bg-red hover:text-white",
  success: "bg-green-700 text-white hover:bg-green-600",
  whatsapp: "bg-[#25D366] text-[#0b0b0d] hover:brightness-110",
} as const;

export function button(
  variant: keyof typeof buttonVariants = "primary",
  size: keyof typeof buttonSizes = "md"
) {
  return `${buttonBase} ${buttonSizes[size]} ${buttonVariants[variant]}`;
}

export const input =
  "mt-1 w-full rounded-md border border-line bg-panel2 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-[#6f6f76] focus:border-gold";

export const label = "block text-xs font-bold tracking-wide text-ink-dim uppercase";

export const sectionTitle =
  "mb-4 border-b border-line pb-2.5 text-[15px] font-bold tracking-wide text-gold uppercase";

export const card = "rounded-[10px] border border-line bg-panel";

export const errorBox = "rounded-md bg-red/20 px-3 py-2 text-sm text-gold-bright";

/** The red/gold glow behind page heroes. */
export const heroBackground =
  "radial-gradient(circle at 80% 0%, rgba(193,39,45,.18), transparent 55%), radial-gradient(circle at 10% 100%, rgba(212,175,55,.12), transparent 50%), #0e0e11";
