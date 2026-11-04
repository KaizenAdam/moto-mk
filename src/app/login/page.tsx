import LoginForm from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { link } = await searchParams;
  const notice =
    link === "expired" ? "That link has expired or was already used. Log in, or ask for a new reset link." : undefined;
  return <LoginForm notice={notice} />;
}
