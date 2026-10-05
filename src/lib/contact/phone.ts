/**
 * Phone numbers are typed however people type them: "070 123 456",
 * "+389 70 123 456", "00389 70...". wa.me and tel: need one form —
 * international digits, no "+", no spaces. A leading 0 is North
 * Macedonia's trunk prefix, so it becomes 389.
 */
export function toInternationalDigits(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.startsWith("0")) digits = `389${digits.slice(1)}`;
  return digits.length >= 8 && digits.length <= 15 ? digits : null;
}

export function telHref(raw: string) {
  const d = toInternationalDigits(raw);
  return d ? `tel:+${d}` : null;
}

export function whatsAppHref(raw: string, message: string) {
  const d = toInternationalDigits(raw);
  return d ? `https://wa.me/${d}?text=${encodeURIComponent(message)}` : null;
}

/** "+389 70 123 456"-ish display for a number we can make sense of; otherwise as typed. */
export function formatPhone(raw: string) {
  const d = toInternationalDigits(raw);
  if (!d) return raw;
  if (d.startsWith("389") && d.length === 11) {
    return `+389 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8)}`;
  }
  return `+${d}`;
}

/**
 * WhatsApp only works on mobiles. North Macedonian mobiles are 07x
 * (international 3897x); 02/03/04 numbers are landlines. Foreign numbers
 * can't be told apart, so they get the benefit of the doubt.
 */
export function canWhatsApp(raw: string) {
  const d = toInternationalDigits(raw);
  if (!d) return false;
  return d.startsWith("389") ? d.startsWith("3897") : true;
}
