"use server";

import { getI18n } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** `message` is a success note shown in place of the form (e.g. "check your email"). */
export type AuthState = { error: string | null; message?: string };

const MIN_PASSWORD = 8;

type T = Awaited<ReturnType<typeof getI18n>>["t"];

/** Supabase's common sign-in errors in the visitor's language; anything else as Supabase wrote it. */
function authError(message: string, t: T) {
  if (/invalid login credentials/i.test(message)) return t.errors.invalidLogin;
  if (/email not confirmed/i.test(message)) return t.errors.emailNotConfirmed;
  if (/already registered/i.test(message)) return t.errors.alreadyRegistered;
  return message;
}

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

export async function signUp(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "");

  if (password.length < MIN_PASSWORD) {
    return { error: fill(t.errors.passwordLength, { n: MIN_PASSWORD }) };
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

  if (error) return { error: authError(error.message, t) };

  // With email confirmation on, there's no session until they click the
  // link — redirecting to "/" would just show them logged out, confused.
  if (!data.session) {
    return {
      error: null,
      message: fill(t.messages.confirmEmail, { email }),
    };
  }

  redirect("/");
}

export async function signIn(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: authError(error.message, t) };

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordReset(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: t.errors.enterEmail };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteUrl()}/auth/confirm?next=/reset-password`,
  });

  // Only a rate limit is worth surfacing. Anything else gets the same reply
  // as success, so the form can't be used to test which emails have accounts.
  if (error?.status === 429) {
    return { error: t.errors.tooManyRequests };
  }
  return {
    error: null,
    message: fill(t.messages.resetSent, { email }),
  };
}

export async function updatePassword(_prevState: AuthState, formData: FormData): Promise<AuthState> {
  const { t } = await getI18n();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < MIN_PASSWORD) {
    return { error: fill(t.errors.passwordLength, { n: MIN_PASSWORD }) };
  }
  if (password !== confirm) return { error: t.errors.passwordsDiffer };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: authError(error.message, t) };

  redirect("/");
}
