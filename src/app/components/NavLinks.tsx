"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/bikes", label: "Buy" },
  { href: "/parts-gear", label: "Parts & Gear" },
  { href: "/dealers", label: "Dealers" },
  { href: "/service-centres", label: "Service Centres" },
  { href: "/events", label: "Events" },
  { href: "/advertise", label: "Advertise" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/bikes") return pathname.startsWith("/bikes") || pathname.startsWith("/listings");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Main navigation, with the current section marked. */
export default function NavLinks({
  variant,
  onNavigate,
}: {
  variant: "bar" | "menu";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

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
            ? `font-display whitespace-nowrap border-b-2 pb-1.5 text-[15px] font-medium tracking-wider transition hover:border-gold hover:text-gold-bright ${
                active ? "border-gold text-gold-bright" : "border-transparent text-ink-dim"
              }`
            : `font-display block border-l-2 px-4 py-3 text-lg font-medium tracking-wider ${
                active ? "border-gold bg-panel2 text-gold-bright" : "border-transparent text-ink"
              }`
        }
      >
        {item.label}
      </Link>
    );
  });
}
