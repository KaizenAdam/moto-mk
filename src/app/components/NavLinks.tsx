"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "./I18nProvider";

/** Labels come from the dictionary's `nav` section, by key. */
export const NAV_ITEMS = [
  { href: "/", key: "home" },
  { href: "/bikes", key: "buy" },
  { href: "/parts-gear", key: "partsGear" },
  { href: "/dealers", key: "dealers" },
  { href: "/service-centres", key: "serviceCentres" },
  { href: "/events", key: "events" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/bikes") return pathname.startsWith("/bikes") || pathname.startsWith("/listings");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Main navigation, with the current section marked. */
export default function NavLinks({ variant, onNavigate }: { variant: "bar" | "menu"; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return NAV_ITEMS.map((item) => {
    const active = isActive(pathname, item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={
          variant === "bar"
            ? `font-display whitespace-nowrap pb-1 text-[15px] font-normal tracking-[.06em] transition hover:text-white ${
                active ? "text-white shadow-[inset_0_-3px_0_var(--highlight)]" : "text-[#9a988f]"
              }`
            : `font-display block border-l-2 px-4 py-3 text-lg font-medium tracking-wider ${
                active ? "border-highlight bg-panel2 text-highlight" : "border-transparent text-ink"
              }`
        }
      >
        {t.nav[item.key]}
      </Link>
    );
  });
}
