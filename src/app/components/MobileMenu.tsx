"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import NavLinks from "./NavLinks";
import { button } from "./ui";
import { CloseIcon, MenuIcon } from "./icons";

/**
 * Phone-size menu: a ☰ button that drops the navigation down under the
 * header. Closes on navigation, on Escape, and when tapping outside.
 */
export default function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center border border-line text-ink xl:hidden"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 top-[65px] z-40 bg-black/60 xl:hidden" onClick={close} aria-hidden />
          <div
            id="mobile-menu"
            className="absolute inset-x-0 top-full z-50 border-b border-line bg-[#0e0e11] pb-4 shadow-[0_12px_30px_rgba(0,0,0,0.6)] xl:hidden"
          >
            <nav className="py-2">
              <NavLinks variant="menu" onNavigate={close} />
            </nav>
            <div className="flex flex-col gap-2.5 border-t border-line px-4 pt-4">
              {isLoggedIn ? (
                <>
                  <Link href="/garage" onClick={close} className={button("outline", "lg")}>
                    My Garage
                  </Link>
                  {/* Featuring is per listing: My Garage has the button on each live bike. */}
                  <Link href="/garage" onClick={close} className={button("outline", "lg")}>
                    Feature a bike
                  </Link>
                  <form action={signOut} onSubmit={close}>
                    <button type="submit" className={`${button("outline", "lg")} w-full`}>
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" onClick={close} className={button("outline", "lg")}>
                  Log in
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
