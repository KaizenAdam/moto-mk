import type { ReactNode } from "react";
import { sectionTitle } from "./ui";

/** A section's gold underlined heading, with an optional link or button on the right. */
export default function SectionHeading({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  if (!action) return <h2 className={sectionTitle}>{children}</h2>;
  return (
    <div className={`${sectionTitle} flex items-center justify-between gap-3`}>
      <h2>{children}</h2>
      {action}
    </div>
  );
}
