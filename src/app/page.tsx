import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import { signOut } from "@/app/actions/auth";

export default async function Home() {
  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-4 text-center">
      <h1 className="text-3xl font-bold text-amber-400">Just5Up!</h1>
      <p className="max-w-sm text-sm text-zinc-400">
        North Macedonia&rsquo;s motorcycle marketplace — backend scaffold.
      </p>

      {profile ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-6 py-4 text-left text-sm text-zinc-300">
          <p>
            Signed in as <span className="text-white">{profile.name ?? "(no name set)"}</span>
          </p>
          <p className="text-zinc-500">Account type: {profile.account_type}</p>
          <form action={signOut} className="mt-4">
            <button
              type="submit"
              className="rounded bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded bg-amber-400 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-300"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded border border-zinc-700 px-4 py-2 text-sm font-semibold text-white hover:border-amber-400"
          >
            Sign up
          </Link>
        </div>
      )}
    </main>
  );
}
