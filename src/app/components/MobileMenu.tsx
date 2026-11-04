"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/app/actions/auth";
import NavLinks from "./NavLinks";
import { ACCOUNT_LINKS } from "./AccountMenu";
import { button } from "./ui";
import { CloseIcon, MenuIcon } from "./icons";
import { useI18n } from "./I18nProvider";

/**
 * Phone-size menu: a ☰ button that drops the navigation down under the
 * header. Closes on navigation, on Escape, and when tapping outside.
 */
export default function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { t } = useI18n();

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
        aria-label={open ? t.common.closeMenu : t.common.openMenu}
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
                  <p className="font-display text-xs tracking-wider text-grey">{t.common.myAccount}</p>
                  {ACCOUNT_LINKS.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={close}
                      className={button(l.href === "/sell" ? "primary" : "outline", "lg")}
                    >
                      {t.common[l.key]}
                    </Link>
                  ))}
                  <form action={signOut} onSubmit={close}>
                    <button type="submit" className={`${button("danger", "lg")} w-full`}>
                      {t.common.signOut}
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" onClick={close} className={button("outline", "lg")}>
                  {t.common.logIn}
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
