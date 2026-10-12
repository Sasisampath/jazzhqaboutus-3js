import Link from "next/link";
import type { ReactNode } from "react";
import type { NavDestination } from "@/data/navigation";

// Renders a real link when a destination exists in this build, otherwise a
// button that looks the same and does nothing.
export function NavItem({
  href,
  className,
  children,
  onNavigate,
  role,
  ariaLabel,
}: {
  href: NavDestination;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
  role?: string;
  ariaLabel?: string;
}) {
  if (href) {
    return <Link href={href} className={className} onClick={onNavigate} role={role} aria-label={ariaLabel}>{children}</Link>;
  }
  return <button type="button" className={className} onClick={onNavigate} role={role} aria-label={ariaLabel}>{children}</button>;
}
