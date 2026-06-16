"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Home,
  TrendingUp,
  Mic,
  Swords,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trends", label: "Vote", icon: TrendingUp },
  { href: "/pitches", label: "Pitch", icon: Mic },
  { href: "/battles", label: "Battles", icon: Swords, badgeKey: "battle" as const },
  { href: "/dashboard", label: "You", icon: User, badgeKey: "streak" as const },
];

interface MobileNavProps {
  hasLiveBattle?: boolean;
}

export function MobileNav({ hasLiveBattle: hasLiveBattleProp }: MobileNavProps) {
  const pathname = usePathname();
  const profile = useUserStore((s) => s.profile);
  const profileHref = profile ? `/u/${profile.username}` : "/dashboard";
  const [hasLiveBattle, setHasLiveBattle] = useState(hasLiveBattleProp ?? false);

  useEffect(() => {
    if (hasLiveBattleProp !== undefined) {
      setHasLiveBattle(hasLiveBattleProp);
      return;
    }
    const supabase = createClient();
    supabase
      .from("battles")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .then(({ count }) => setHasLiveBattle((count ?? 0) > 0));
  }, [hasLiveBattleProp]);

  const needsStreakVote =
    profile &&
    profile.streak_days > 0 &&
    profile.last_voted_at &&
    new Date(profile.last_voted_at).toDateString() !==
      new Date().toDateString();

  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg-void)]/95 backdrop-blur-md md:hidden">
      <div className="flex justify-around px-2 py-2">
        {links.map((link) => {
          const href = link.label === "You" ? profileHref : link.href;
          const active =
            pathname === href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;
          const showBadge =
            (link.badgeKey === "battle" && hasLiveBattle) ||
            (link.badgeKey === "streak" && needsStreakVote);

          return (
            <Link
              key={link.href}
              href={href}
              className={cn(
                "relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-hype" : "text-[var(--text-3)]"
              )}
            >
              <span className="relative">
                <Icon className="h-5 w-5" aria-hidden />
                {showBadge && (
                  <span
                    className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-hype"
                    aria-hidden
                  />
                )}
              </span>
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
