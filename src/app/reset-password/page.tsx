import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import ResetPasswordForm from "./ResetPasswordForm";

/**
 * Reached from the reset email via /auth/confirm, which has already
 * swapped the link for a session. No session means the link wasn't used
 * (or expired) — send them to ask for a new one.
 */
export default async function ResetPasswordPage() {
  const user = await getCurrentUser(await createClient());
  if (!user) redirect("/forgot-password");

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <ResetPasswordForm />
    </main>
  );
}
