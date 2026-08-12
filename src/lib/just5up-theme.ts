// Just5Up brand tokens — scoped to the /listings page only.
// Gold values sampled directly from the client's provided logo
// (Black logo - no background.png): deep #c49a56, mid #e0c77d, light #f2e395.
// Dark backing tone matches the provided app-icon mark (#222831).
//
// Light-first palette: pale gold/near-black work on dark surfaces (header
// wordmark on... no — header is light now, footer stays dark) but fail
// contrast on white, so `goldDeep` (a saturated dark-goldenrod) is the
// text-safe gold for anything sitting on the light page/card background.
export const j5u = {
  // dark surfaces (footer only)
  black: "#0a0a0b",
  charcoal: "#1c2027",
  charcoalLight: "#262b33",

  // light surfaces (header, page body, cards)
  bg: "#f6f5f2",
  card: "#ffffff",
  border: "#e4e2db",
  borderStrong: "#d3d0c7",
  ink: "#16171b",
  inkMuted: "#5b5d61",

  // brand accents
  gold: "#e3c56e",
  goldBright: "#f2e395",
  goldDeep: "#b8860b",
  red: "#e0212b",
  redDeep: "#8f151c",
  grey100: "#e9e9e9",
  grey400: "#9a9a9a",
  grey700: "#34383f",
} as const;
