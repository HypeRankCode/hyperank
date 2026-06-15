"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Swords, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";

const links = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/battles", icon: Swords, label: "Battles" },
  { href: "/leaderboard", icon: Trophy, label: "Ranks" },
  { href: "/dashboard", icon: User, label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();
  const profile = useUserStore((s) => s.profile);
  const profileHref = profile ? `/u/${profile.username}` : "/dashboard";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--bg-card)] md:hidden">
      <div className="flex justify-around py-2">
        {links.map((link) => {
          const href = link.label === "Profile" ? profileHref : link.href;
          const active = pathname === href;
          return (
            <Link
              key={link.href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs",
                active ? "text-hype" : "text-[var(--text-secondary)]"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
