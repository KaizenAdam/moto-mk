"use server";

import { createClient } from "@/lib/supabase/server";
import { create } from "@/lib/data/listings";
import type { Tables } from "@/lib/database.types";

export type CreateListingState = {
  error: string | null;
  listing: Tables<"listings"> | null;
};

function num(formData: FormData, key: string): number | undefined {
  const v = formData.get(key);
  if (!v) return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

function str(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function createListingAction(
  _prevState: CreateListingState,
  formData: FormData
): Promise<CreateListingState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to log in to list a bike.", listing: null };

  const make = str(formData, "make");
  const model = str(formData, "model");
  const priceEur = num(formData, "price_eur");
  const year = num(formData, "year");

  if (!make || !model || priceEur == null) {
    return { error: "Make, model and price are required.", listing: null };
  }

  // The form's min/max are only a browser hint, and the database's check
  // constraints would reject these with an unreadable error. Say it plainly.
  const engineCc = num(formData, "engine_cc");
  const mileageKm = num(formData, "mileage_km");
  const maxYear = new Date().getFullYear() + 1;
  if (priceEur <= 0) return { error: "Price must be more than €0.", listing: null };
  if (year != null && (year < 1900 || year > maxYear)) {
    return { error: `Year must be between 1900 and ${maxYear}.`, listing: null };
  }
  if ((engineCc ?? 0) < 0 || (mileageKm ?? 0) < 0) {
    return { error: "Engine size and mileage can't be negative.", listing: null };
  }

  // The sell form doesn't ask for a headline — a title is derived from the
  // spec fields buyers actually browse by, same as how listing cards
  // display "{make} {model}" rather than a free-text title.
  const title = [year, make, model].filter(Boolean).join(" ");

  try {
    const listing = await create(supabase, {
      title,
      make,
      model,
      price_eur: priceEur,
      year: year ?? null,
      engine_cc: engineCc ?? null,
      engine_type: str(formData, "engine_type") ?? null,
      licence_category: str(formData, "licence_category") ?? null,
      riding_style: str(formData, "riding_style") ?? null,
      mileage_km: mileageKm ?? null,
      town: str(formData, "town") ?? null,
    });
    return { error: null, listing };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create listing.", listing: null };
  }
}
