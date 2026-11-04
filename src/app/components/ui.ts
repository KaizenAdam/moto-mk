/**
 * The site's shared look, as class strings. Use these rather than writing
 * button/input classes inline, so every page matches. (Admin uses them too.)
 *
 * Square corners throughout. Flat `highlight` gold is for prices and the
 * main call to action; a red outline is for secondary actions.
 */

const buttonBase =
  "font-display inline-flex items-center justify-center gap-1.5 font-semibold tracking-[.06em] transition disabled:cursor-not-allowed disabled:opacity-60";

const buttonSizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
} as const;

const buttonVariants = {
  /** Solid highlight gold: the one main action. */
  primary: "bg-highlight text-[#111] hover:brightness-110",
  /** Red outline: secondary actions (Contact, Log in, Cancel…). */
  outline: "border-2 border-red text-white hover:bg-red",
  /** Red text and outline: destructive actions (Delete, Reject). */
  danger: "border-2 border-red/70 text-red hover:bg-red hover:text-white",
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
  "mt-1 w-full border border-line bg-panel2 px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-[#6f6f76] focus:border-highlight";

export const label = "block text-xs font-bold tracking-wide text-ink-dim uppercase";

/** A plain Oswald section heading, as on the home and listing pages. */
export const sectionTitle = "font-display mb-4 text-2xl font-semibold";

export const card = "border border-line bg-panel";

export const errorBox = "border-l-4 border-red bg-red/15 px-3 py-2 text-sm text-ink";

/** The red/gold glow behind page heroes. */
export const heroBackground =
  "radial-gradient(circle at 80% 0%, rgba(193,39,45,.18), transparent 55%), radial-gradient(circle at 10% 100%, rgba(212,175,55,.12), transparent 50%), #0e0e11";
