"use server";

import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getById, remove, update } from "@/lib/data/listings";
import { removePhoto } from "@/lib/data/listingPhotos";
import { updateOwnProfile } from "@/lib/data/profiles";
import { requestDealerStatus } from "@/lib/data/dealerRequests";
import { getOwnDealer, updateOwnDealer } from "@/lib/data/dealers";
import { toInternationalDigits } from "@/lib/contact/phone";

/**
 * Seller-side actions behind /garage and /listings/[id]/edit. Ownership is
 * enforced by RLS (owner-only update/delete policies), not by these
 * functions — a call on someone else's listing simply fails.
 */
export type FormState = { error: string | null; message?: string };

function text(formData: FormData, key: string) {
  const v = formData.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function optionalNumber(formData: FormData, key: string) {
  const v = text(formData, key);
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

async function attempt(task: () => Promise<unknown>, message?: string): Promise<FormState> {
  const { t } = await getI18n();
  try {
    await task();
  } catch (e) {
    return { error: e instanceof Error ? e.message : t.errors.generic };
  }
  revalidatePath("/garage");
  return { error: null, message };
}

export async function updateProfileAction(_prev: FormState, formData: FormData) {
  const { t } = await getI18n();
  const phone = text(formData, "phone");
  if (phone && !toInternationalDigits(phone)) {
    return { error: t.errors.badPhone };
  }
  const supabase = await createClient();
  return attempt(
    () =>
      updateOwnProfile(supabase, {
        name: text(formData, "name"),
        phone,
        town: text(formData, "town"),
      }),
    t.messages.profileSaved,
  );
}

export async function requestDealerAction(_prev: FormState, formData: FormData) {
  const { t } = await getI18n();
  const businessName = text(formData, "business_name");
  if (!businessName) return { error: t.errors.businessRequired };
  const supabase = await createClient();
  return attempt(
    () =>
      requestDealerStatus(supabase, {
        business_name: businessName,
        address: text(formData, "address") ?? undefined,
        phone: text(formData, "phone") ?? undefined,
      }),
    t.messages.requestSent,
  );
}

export async function markSoldAction(id: string) {
  const supabase = await createClient();
  return attempt(() => update(supabase, id, { status: "sold" }));
}

export async function deleteListingAction(id: string) {
  const supabase = await createClient();
  return attempt(() => remove(supabase, id));
}

export async function removePhotoAction(photo: { id: string; storage_path: string }) {
  const supabase = await createClient();
  return attempt(() => removePhoto(supabase, photo));
}

export async function updateListingAction(id: string, _prev: FormState, formData: FormData) {
  const { t } = await getI18n();
  const make = text(formData, "make");
  const model = text(formData, "model");
  const price = optionalNumber(formData, "price_eur");
  const year = optionalNumber(formData, "year");
  const engineCc = optionalNumber(formData, "engine_cc");
  const mileageKm = optionalNumber(formData, "mileage_km");
  const description = text(formData, "description");
  const maxYear = new Date().getFullYear() + 1;

  if (!make || !model || price == null) return { error: t.errors.makeModelPrice };
  if ([price, year, engineCc, mileageKm].some((n) => Number.isNaN(n))) {
    return { error: t.errors.numbersOnly };
  }
  if (price <= 0) return { error: t.errors.pricePositive };
  if (year != null && (year < 1900 || year > maxYear)) {
    return { error: fill(t.errors.yearRange, { max: maxYear }) };
  }
  if ((engineCc ?? 0) < 0 || (mileageKm ?? 0) < 0) {
    return { error: t.errors.notNegative };
  }
  if (description && description.length > 3000) {
    return { error: t.errors.descriptionTooLong };
  }

  const supabase = await createClient();
  const current = await getById(supabase, id);
  if (!current) return { error: t.errors.listingNotFound };

  const result = await attempt(
    () =>
      update(supabase, id, {
        title: [year, make, model].filter(Boolean).join(" "),
        make,
        model,
        price_eur: price,
        year,
        engine_cc: engineCc,
        engine_type: text(formData, "engine_type"),
        riding_style: text(formData, "riding_style"),
        mileage_km: mileageKm,
        town: text(formData, "town"),
        description,
        // Fixing a rejected listing resubmits it for review.
        ...(current.status === "rejected" ? { status: "pending", rejection_reason: null } : {}),
      }),
    current.status === "active" ? t.messages.savedRereview : t.messages.saved,
  );
  revalidatePath(`/listings/${id}`);
  return result;
}

export async function updateStorefrontAction(_prev: FormState, formData: FormData) {
  const { t } = await getI18n();
  const businessName = text(formData, "business_name");
  const phone = text(formData, "phone");
  const about = text(formData, "about");
  if (!businessName) return { error: t.errors.businessRequired };
  if (businessName.length > 120) return { error: t.errors.businessTooLong };
  if (phone && !toInternationalDigits(phone)) return { error: t.errors.badPhone };
  if (about && about.length > 2000) return { error: t.errors.aboutTooLong };

  const supabase = await createClient();
  const dealer = await getOwnDealer(supabase);
  const result = await attempt(
    () =>
      updateOwnDealer(supabase, {
        business_name: businessName,
        town: text(formData, "town"),
        address: text(formData, "address"),
        phone,
        about,
      }),
    t.messages.storefrontSaved,
  );
  if (dealer) revalidatePath(`/dealers/${dealer.slug}`);
  revalidatePath("/dealers");
  return result;
}
