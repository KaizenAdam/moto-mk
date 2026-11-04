import LoginForm from "./LoginForm";
import type { Metadata } from "next";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.loginTitle, robots: { index: false } };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ link }, { t }] = await Promise.all([searchParams, getI18n()]);
  const notice = link === "expired" ? t.auth.linkExpired : undefined;
  return <LoginForm notice={notice} />;
}
