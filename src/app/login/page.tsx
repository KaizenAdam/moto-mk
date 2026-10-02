import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { link } = await searchParams;
  const notice =
    link === "expired"
      ? "That link has expired or was already used. Log in, or ask for a new reset link."
      : undefined;
  return <LoginForm notice={notice} />;
}
