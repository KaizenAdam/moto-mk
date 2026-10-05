"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/", label: "Buy" },
  { href: "/dealers", label: "Dealers" },
  { href: "/service-centres", label: "Service Centres" },
  { href: "/events", label: "Events" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/listings");
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
            ? `border-b-2 pb-1.5 text-sm font-semibold tracking-wide uppercase transition hover:border-gold hover:text-gold-bright ${
                active ? "border-gold text-gold-bright" : "border-transparent text-ink-dim"
              }`
            : `block border-l-2 px-4 py-3 text-base font-semibold tracking-wide uppercase ${
                active ? "border-gold bg-panel2 text-gold-bright" : "border-transparent text-ink"
              }`
        }
      >
        {item.label}
      </Link>
    );
  });
}
