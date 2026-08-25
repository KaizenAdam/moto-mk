"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { save, unsave } from "@/lib/data/savedListings";

export async function toggleSavedAction(listingId: string, currentlySaved: boolean) {
  const supabase = await createClient();

  if (currentlySaved) {
    await unsave(supabase, listingId);
  } else {
    await save(supabase, listingId);
  }

  revalidatePath("/listings");
  revalidatePath(`/listings/${listingId}`);
}
