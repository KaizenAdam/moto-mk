import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import { signOut } from "@/app/actions/auth";

export default async function SiteHeader() {
  const supabase = await createClient();
  const profile = await getOwnProfile(supabase);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-gradient-to-b from-[#111] to-black">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG wordmark, not a candidate for next/image optimization */}
          <img
            src="/brand/wordmark-white.svg"
            alt="Just5Up!"
            className="h-10 w-auto drop-shadow-[0_0_6px_rgba(212,175,55,0.25)] sm:h-14"
          />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/listings"
            className="border-b-2 border-transparent pb-1.5 text-sm font-semibold tracking-wide text-ink-dim uppercase transition hover:border-gold hover:text-gold-bright"
          >
            Buy
          </Link>
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {profile ? (
            <div className="flex items-center gap-3 text-sm text-ink-dim">
              <span>
                Signed in as <span className="text-ink">{profile.name ?? "you"}</span>
              </span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-line px-4 py-2 text-xs font-bold tracking-wide text-ink uppercase transition hover:border-gold"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-line px-[18px] py-[9px] text-[13px] font-bold tracking-wide text-ink uppercase transition hover:border-gold"
            >
              Log in
            </Link>
          )}
          <Link
            href="/sell"
            className="rounded-md bg-gradient-to-br from-gold-bright to-gold px-[18px] py-[9px] text-[13px] font-bold tracking-wide text-[#141414] uppercase shadow-[0_2px_10px_rgba(212,175,55,0.25)] transition hover:brightness-110"
          >
            + Sell your bike
          </Link>
        </div>
      </div>
    </header>
  );
}
