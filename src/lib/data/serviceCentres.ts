import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/** Everything, grouped client-side by town. Public read; small table. */
export async function listServiceCentres(supabase: Client) {
  const { data, error } = await supabase
    .from("service_centres")
    .select("*")
    .order("town")
    .order("verified", { ascending: false })
    .order("name");

  if (error) throw error;
  return data;
}

/** Admin-only writes — enforced by RLS via private.is_admin(). */
export async function createServiceCentre(
  supabase: Client,
  centre: Omit<TablesInsert<"service_centres">, "id" | "created_at" | "updated_at">
) {
  const { error } = await supabase.from("service_centres").insert(centre);
  if (error) throw error;
}

export async function setServiceCentreVerified(supabase: Client, id: string, verified: boolean) {
  const { error } = await supabase.from("service_centres").update({ verified }).eq("id", id);
  if (error) throw error;
}

export async function deleteServiceCentre(supabase: Client, id: string) {
  const { error } = await supabase.from("service_centres").delete().eq("id", id);
  if (error) throw error;
}

/** Places (or clears, with nulls) a centre's map pin. Admin-only via RLS. */
export async function setServiceCentreLocation(
  supabase: Client,
  id: string,
  location: { lat: number; lng: number } | null
) {
  const { error } = await supabase
    .from("service_centres")
    .update({ lat: location?.lat ?? null, lng: location?.lng ?? null })
    .eq("id", id);
  if (error) throw error;
}
