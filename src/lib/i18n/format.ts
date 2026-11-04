import type { Locale } from "./config";

/**
 * Formatting that must come out the same on the server and in every
 * browser. Not all browsers ship Macedonian or Albanian locale data (some
 * fall back to English), and a client component that formats differently
 * from the server breaks hydration. So month and day names, digit grouping
 * and plural rules are spelled out here rather than taken from Intl.
 */

/** Fills `{name}` placeholders: fill("{n} bikes", { n: 3 }) → "3 bikes". */
export function fill(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** A count-dependent phrase. Both forms may use {n}. */
export type Plural = { one: string; other: string };

/** CLDR's "one" rule for each language (Macedonian: 1, 21, 31… but not 11). */
const isOne: Record<Locale, (n: number) => boolean> = {
  en: (n) => n === 1,
  mk: (n) => Number.isInteger(n) && n % 10 === 1 && n % 100 !== 11,
  sq: (n) => n === 1,
};

/** Picks the right form for `n` in this language, then fills {n}. */
export function plural(locale: Locale, n: number, forms: Plural, vars: Record<string, string | number> = {}) {
  return fill(isOne[locale](n) ? forms.one : forms.other, { n: formatNumber(locale, n), ...vars });
}

const SEPARATORS: Record<Locale, { group: string; decimal: string }> = {
  en: { group: ",", decimal: "." },
  mk: { group: ".", decimal: "," },
  sq: { group: " ", decimal: "," },
};

/** 11500 → "11,500" (en), "11.500" (mk), "11 500" (sq). */
export function formatNumber(locale: Locale, n: number) {
  const { group, decimal } = SEPARATORS[locale];
  const [whole, fraction] = Math.abs(n).toString().split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  return `${n < 0 ? "-" : ""}${grouped}${fraction ? decimal + fraction : ""}`;
}

const MONTHS: Record<Locale, { long: string[]; short: string[] }> = {
  en: {
    long: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
  mk: {
    long: ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"],
    short: ["јан", "фев", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "ное", "дек"],
  },
  sq: {
    long: ["janar", "shkurt", "mars", "prill", "maj", "qershor", "korrik", "gusht", "shtator", "tetor", "nëntor", "dhjetor"],
    short: ["jan", "shk", "mar", "pri", "maj", "qer", "korr", "gush", "sht", "tet", "nën", "dhj"],
  },
};

/** Sunday first, as Date.getDay() counts. */
const WEEKDAYS: Record<Locale, { long: string[]; short: string[] }> = {
  en: {
    long: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  },
  mk: {
    long: ["недела", "понеделник", "вторник", "среда", "четврток", "петок", "сабота"],
    short: ["нед", "пон", "вто", "сре", "чет", "пет", "саб"],
  },
  sq: {
    long: ["e diel", "e hënë", "e martë", "e mërkurë", "e enjte", "e premte", "e shtunë"],
    short: ["die", "hën", "mar", "mër", "enj", "pre", "sht"],
  },
};

export type DateStyle = "monthShort" | "monthShortYear" | "monthLongYear" | "weekdayLong" | "weekdayShort";

/** The handful of date shapes the site shows, in local time. */
export function formatDate(locale: Locale, date: string | Date, style: DateStyle) {
  const d = new Date(date);
  const month = MONTHS[locale];
  switch (style) {
    case "monthShort":
      return month.short[d.getMonth()];
    case "monthShortYear":
      return `${month.short[d.getMonth()]} ${d.getFullYear()}`;
    case "monthLongYear":
      return `${month.long[d.getMonth()]} ${d.getFullYear()}`;
    case "weekdayLong":
      return WEEKDAYS[locale].long[d.getDay()];
    case "weekdayShort":
      return WEEKDAYS[locale].short[d.getDay()];
  }
}
