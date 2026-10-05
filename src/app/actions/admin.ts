"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { update as updateListing } from "@/lib/data/listings";
import { setRequestStatus } from "@/lib/data/dealerRequests";
import { createEvent, deleteEvent } from "@/lib/data/events";
import {
  createServiceCentre,
  deleteServiceCentre,
  setServiceCentreLocation,
  setServiceCentreVerified,
} from "@/lib/data/serviceCentres";

/**
 * Every admin action reports back instead of throwing, so a failure shows
 * next to the button that caused it rather than on the site's error page.
 * Each is bound to its row id and used with useActionState
 * (src/app/admin/AdminAction.tsx).
 */
export type AdminActionState = { error: string | null; done: boolean };

async function run(task: () => Promise<unknown>): Promise<AdminActionState> {
  try {
    await task();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong.", done: false };
  }
  revalidatePath("/admin");
  return { error: null, done: true };
}

export async function approveListingAction(id: string) {
  const supabase = await createClient();
  return run(() => updateListing(supabase, id, { status: "active", rejection_reason: null }));
}

export async function rejectListingAction(
  id: string,
  _prev: AdminActionState,
  formData: FormData
) {
  const reason = String(formData.get("reason") ?? "").trim();
  const supabase = await createClient();
  return run(() =>
    updateListing(supabase, id, { status: "rejected", rejection_reason: reason || null })
  );
}

// Approving opens a storefront and rejecting an approved dealer closes it
// (database trigger), so the public dealer pages change too.
export async function approveDealerRequestAction(id: string) {
  const supabase = await createClient();
  const result = await run(() => setRequestStatus(supabase, id, "approved"));
  revalidatePath("/dealers", "layout");
  return result;
}

export async function rejectDealerRequestAction(id: string) {
  const supabase = await createClient();
  const result = await run(() => setRequestStatus(supabase, id, "rejected"));
  revalidatePath("/dealers", "layout");
  return result;
}

export async function deleteEventAction(id: string) {
  const supabase = await createClient();
  return run(() => deleteEvent(supabase, id));
}

export type CreateEventState = { error: string | null };

export async function createEventAction(
  _prevState: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();

  const supabase = await createClient();
  try {
    await createEvent(supabase, {
      title,
      description: description || null,
      location: location || null,
      event_date: eventDate || null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create event." };
  }

  revalidatePath("/admin");
  return { error: null };
}

// --- Service centres (/service-centres) ---

export async function setServiceCentreVerifiedAction(id: string, verified: boolean) {
  const supabase = await createClient();
  const result = await run(() => setServiceCentreVerified(supabase, id, verified));
  revalidatePath("/service-centres");
  return result;
}

export async function setServiceCentreLocationAction(
  id: string,
  location: { lat: number; lng: number } | null
) {
  if (
    location &&
    !(Number.isFinite(location.lat) && Number.isFinite(location.lng) &&
      Math.abs(location.lat) <= 90 && Math.abs(location.lng) <= 180)
  ) {
    return { error: "That isn't a valid position.", done: false };
  }
  const supabase = await createClient();
  const result = await run(() => setServiceCentreLocation(supabase, id, location));
  revalidatePath("/service-centres");
  return result;
}

export async function deleteServiceCentreAction(id: string) {
  const supabase = await createClient();
  const result = await run(() => deleteServiceCentre(supabase, id));
  revalidatePath("/service-centres");
  return result;
}

export async function createServiceCentreAction(
  _prev: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const field = (k: string) => {
    const v = String(formData.get(k) ?? "").trim();
    return v || null;
  };
  const name = field("name");
  const town = field("town");
  const website = field("website");
  if (!name || !town) return { error: "Name and town are required." };
  if (website && !/^https?:\/\//.test(website)) {
    return { error: "Website must start with http:// or https://" };
  }

  const supabase = await createClient();
  try {
    await createServiceCentre(supabase, {
      name,
      town,
      address: field("address"),
      phone: field("phone"),
      website,
      specialties: field("specialties"),
      source_url: field("source_url"),
      verified: formData.get("verified") === "on",
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to add service centre." };
  }
  revalidatePath("/admin");
  revalidatePath("/service-centres");
  return { error: null };
}
