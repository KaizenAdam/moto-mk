import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/database.types";
import { getCurrentUser } from "@/lib/data/auth";

type Client = SupabaseClient<Database>;

export async function requestDealerStatus(
  supabase: Client,
  request: { business_name: string; address?: string; phone?: string }
) {
  const user = await getCurrentUser(supabase);
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("dealer_requests")
    .insert({ ...request, profile_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data as Tables<"dealer_requests">;
}

export async function listOwnRequests(supabase: Client) {
  const user = await getCurrentUser(supabase);
  if (!user) return [];

  const { data, error } = await supabase
    .from("dealer_requests")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Every pending dealer request, for the admin review queue. Relies on the
 * admin arm of dealer_requests_select — a non-admin caller gets [] back.
 */
export async function listPendingForAdmin(supabase: Client) {
  const { data, error } = await supabase
    .from("dealer_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Approved dealer requests, so the admin portal's "current dealers"
 * section can show which business each dealer profile runs.
 */
export async function listApprovedForAdmin(supabase: Client) {
  const { data, error } = await supabase
    .from("dealer_requests")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Only succeeds for a caller whose profile has account_type = 'admin' —
 * enforced by the dealer_requests_admin_update RLS policy via is_admin().
 */
export async function setRequestStatus(
  supabase: Client,
  id: string,
  status: "approved" | "rejected"
) {
  const { data, error } = await supabase
    .from("dealer_requests")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Tables<"dealer_requests">;
}
