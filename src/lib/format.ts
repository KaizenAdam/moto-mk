import { LicenseCategory } from "./types";

export const LICENSE_LABELS: Record<LicenseCategory, string> = {
  AM: "AM — moped, up to 50cc",
  A1: "A1 — up to 125cc",
  A2: "A2 — up to 35kW",
  A: "A — unrestricted",
};

export function formatMileage(km: number) {
  return `${km.toLocaleString("en-US")} km`;
}

export function formatCc(cc: number) {
  return cc === 0 ? "Electric" : `${cc} cc`;
}

export function timeAgo(days: number) {
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}
