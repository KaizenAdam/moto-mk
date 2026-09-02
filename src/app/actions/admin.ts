"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { update as updateListing } from "@/lib/data/listings";
import { setRequestStatus } from "@/lib/data/dealerRequests";
import { createEvent, deleteEvent } from "@/lib/data/events";

export async function approveListingAction(id: string) {
  const supabase = await createClient();
  await updateListing(supabase, id, { status: "active" });
  revalidatePath("/admin");
}

export async function rejectListingAction(id: string) {
  const supabase = await createClient();
  await updateListing(supabase, id, { status: "rejected" });
  revalidatePath("/admin");
}

export async function approveDealerRequestAction(id: string) {
  const supabase = await createClient();
  await setRequestStatus(supabase, id, "approved");
  revalidatePath("/admin");
}

export async function rejectDealerRequestAction(id: string) {
  const supabase = await createClient();
  await setRequestStatus(supabase, id, "rejected");
  revalidatePath("/admin");
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

export async function deleteEventAction(id: string) {
  const supabase = await createClient();
  await deleteEvent(supabase, id);
  revalidatePath("/admin");
}
