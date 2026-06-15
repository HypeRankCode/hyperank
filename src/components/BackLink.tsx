import Link from "next/link";
import { cn } from "@/lib/utils";

interface BackLinkProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackLink({
  href = "/",
  label = "Back",
  className,
}: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-red-400",
        className
      )}
    >
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
