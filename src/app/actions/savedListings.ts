"use server";

import { createClient } from "@/lib/supabase/server";
import { save, unsave } from "@/lib/data/savedListings";

/**
 * No revalidatePath here: the heart already shows the new state, and every
 * page that lists saves renders dynamically, so the next visit is fresh.
 * Revalidating made each click re-run the whole browse page's queries.
 */
export async function toggleSavedAction(listingId: string, currentlySaved: boolean) {
  const supabase = await createClient();

  if (currentlySaved) {
    await unsave(supabase, listingId);
  } else {
    await save(supabase, listingId);
  }
}
