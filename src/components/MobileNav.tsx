"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";

const links = [
  { href: "/", label: "Home" },
  { href: "/trends", label: "Trends" },
  { href: "/battles", label: "Battles" },
  { href: "/leaderboard", label: "Ranks" },
  { href: "/dashboard", label: "Account" },
];

export function MobileNav() {
  const pathname = usePathname();
  const profile = useUserStore((s) => s.profile);
  const profileHref = profile ? `/u/${profile.username}` : "/dashboard";

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]/95 backdrop-blur-md md:hidden">
      <div className="flex justify-around px-1 py-2">
        {links.map((link) => {
          const href = link.label === "Account" ? profileHref : link.href;
          const active =
            pathname === href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[10px] font-medium",
                active
                  ? "text-[var(--accent-hype)]"
                  : "text-[var(--text-secondary)]"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
