"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { update as updateListing } from "@/lib/data/listings";
import { setRequestStatus } from "@/lib/data/dealerRequests";

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
