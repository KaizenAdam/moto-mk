"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** `message` is a success note shown in place of the form (e.g. "check your email"). */
export type AuthState = { error: string | null; message?: string };

const MIN_PASSWORD = 8;

/**
 * Base URL for links in auth emails. NEXT_PUBLIC_SITE_URL wins when set;
 * otherwise the request's own origin. Supabase only follows redirects on
 * its allow-list (Auth → URL Configuration), so a spoofed Origin can't
 * send anyone elsewhere.
 */
async function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const h = await headers();
  return h.get("origin") ?? `https://${h.get("host")}`;
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");

  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${await siteUrl()}/auth/confirm?next=/`,
    },
  });

  if (error) return { error: error.message };

  // With email confirmation on, there's no session until they click the
  // link — redirecting to "/" would just show them logged out, confused.
  if (!data.session) {
    return {
      error: null,
      message: `Almost there — we've sent a confirmation link to ${email}. Click it to activate your account.`,
    };
  }

  redirect("/");
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/confirm?next=/reset-password`,
  });

  // Only a rate limit is worth surfacing. Anything else gets the same reply
  // as success, so the form can't be used to test which emails have accounts.
  if (error?.status === 429) {
    return { error: "Too many requests — please wait a few minutes and try again." };
  }
  return {
    error: null,
    message: `If ${email} has an account, a reset link is on its way. Check your inbox (and spam).`,
  };
}

export async function updatePassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }
  if (password !== confirm) return { error: "The two passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/");
}
