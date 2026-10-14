import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOwnProfile } from "@/lib/data/profiles";
import { signOut } from "@/app/actions/auth";
import NavLinks from "./NavLinks";
import MobileMenu from "./MobileMenu";
import { button } from "./ui";

export default async function SiteHeader() {
  const supabase = await createClient();
  // The header wraps every page, including ones that need no data. If
  // Supabase is unreachable, show the logged-out header rather than taking
  // the whole site down with it.
  const profile = await getOwnProfile(supabase).catch(() => null);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-gradient-to-b from-[#111] to-black">
      <div className="relative mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Just5Up! home">
          {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized PNG wordmark (public/brand), no next/image needed */}
          <img
            src="/brand/wordmark-white.png"
            width={621}
            height={168}
            alt="Just5Up!"
            className="h-9 w-auto drop-shadow-[0_0_6px_rgba(212,175,55,0.25)] xl:h-14"
          />
        </Link>

        {/* Desktop: everything in one row. */}
        <nav className="hidden items-center gap-5 xl:flex">
          <NavLinks variant="bar" />
        </nav>

        <div className="flex items-center gap-2.5 xl:gap-3">
          <div className="hidden items-center gap-3 xl:flex">
            {profile ? (
              <>
                <Link href="/garage" className="text-sm font-semibold whitespace-nowrap text-ink hover:text-gold-bright">
                  My Garage
                </Link>
                {/* Featuring is per listing: My Garage has the button on each live bike. */}
                <Link href="/garage" className="text-sm font-semibold whitespace-nowrap text-gold-bright hover:underline">
                  Feature a bike
                </Link>
                <form action={signOut}>
                  <button type="submit" className={button("outline", "sm")}>
                    Sign out
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className={button("outline")}>
                Log in
              </Link>
            )}
          </div>
          <Link href="/sell" className={button("primary")}>
            <span className="sm:hidden">+ Sell</span>
            <span className="hidden sm:inline">+ Sell your bike</span>
          </Link>
          {/* Below 1280px: the rest lives behind ☰. */}
          <MobileMenu isLoggedIn={!!profile} />
        </div>
      </div>
    </header>
  );
}
