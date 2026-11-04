import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/data/auth";
import ResetPasswordForm from "./ResetPasswordForm";
import { AuthShell, HighlightWord } from "@/app/components/Bands";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false } };

/**
 * Reached from the reset email via /auth/confirm, which has already
 * swapped the link for a session. No session means the link wasn't used
 * (or expired) — send them to ask for a new one.
 */
export default async function ResetPasswordPage() {
  const user = await getCurrentUser(await createClient());
  if (!user) redirect("/forgot-password");

  return (
    <AuthShell
      line={
        <>
          New
          <br />
          <HighlightWord>password</HighlightWord>
        </>
      }
      shard={{ shape: "double", className: "top-[-10%] left-[-180px] h-[120%] w-[480px] -scale-x-100 bg-red/[.18]" }}
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
