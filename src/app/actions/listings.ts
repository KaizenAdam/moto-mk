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

  const title = str(formData, "title");
  const make = str(formData, "make");
  const model = str(formData, "model");
  const priceEur = num(formData, "price_eur");

  if (!title || !make || !model || priceEur == null) {
    return { error: "Title, make, model and price are required.", listing: null };
  }

  try {
    const listing = await create(supabase, {
      title,
      make,
      model,
      price_eur: priceEur,
      year: num(formData, "year") ?? null,
      engine_cc: num(formData, "engine_cc") ?? null,
      engine_type: str(formData, "engine_type") ?? null,
      licence_category: str(formData, "licence_category") ?? null,
      riding_style: str(formData, "riding_style") ?? null,
      mileage_km: num(formData, "mileage_km") ?? null,
      town: str(formData, "town") ?? null,
    });
    return { error: null, listing };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create listing.", listing: null };
  }
}
