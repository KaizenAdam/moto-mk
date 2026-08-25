export type SearchParams = Record<string, string | string[] | undefined>;

export function toStringParam(v: string | string[] | undefined) {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

/** Builds a query string equal to `current`, with `key` set to `value` (or removed if falsy). */
export function withParam(current: SearchParams, key: string, value: string) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    const s = toStringParam(v);
    if (s) params.set(k, s);
  }
  if (value) params.set(key, value);
  else params.delete(key);
  return params.toString();
}
