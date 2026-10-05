export type SearchParams = Record<string, string | string[] | undefined>;

export function toStringParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

/**
 * Builds a query string equal to `current`, with `key` set to `value` (or
 * removed if falsy). Any filter or sort change drops `page`: page 3 of the
 * old results may not exist in the new ones.
 */
export function withParam(current: SearchParams, key: string, value: string) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    const s = toStringParam(v);
    if (s && k !== "page") params.set(k, s);
  }
  if (value) params.set(key, value);
  else params.delete(key);
  return params.toString();
}
