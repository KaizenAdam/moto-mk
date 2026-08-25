import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";

type Client = SupabaseClient<Database>;

/** Active listings only — what RLS would return anonymously anyway. */
export async function listActive(supabase: Client) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** All listings owned by the current user, any status (including drafts). */
export async function listOwn(supabase: Client) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** RLS returns this only if the listing is active or owned by the caller. */
export async function getById(supabase: Client, id: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function create(
  supabase: Client,
  listing: Omit<TablesInsert<"listings">, "seller_id">
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("listings")
    .insert({ ...listing, seller_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Tables<"listings">;
}

export async function update(
  supabase: Client,
  id: string,
  updates: TablesUpdate<"listings">
) {
  const { data, error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Tables<"listings">;
}

export async function remove(supabase: Client, id: string) {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}
