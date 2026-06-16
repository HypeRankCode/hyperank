"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditDisplay } from "./CreditDisplay";
import { StreakChip } from "./StreakChip";
import { Logo } from "./Logo";
import { ProfileAvatar } from "./ProfileAvatar";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navLinks = [
  { href: "/trends", label: "Trends" },
  { href: "/battles", label: "Battles" },
  { href: "/leaderboard", label: "Ranks" },
  { href: "/shop/drop", label: "Shop" },
];

export function HeaderClient() {
  const user = useUserStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const pathname = usePathname();

  if (pathname === "/login" || pathname.startsWith("/auth/")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-void)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Logo size="sm" />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-[var(--text-1)]"
                    : "text-[var(--text-2)] hover:text-[var(--text-1)]"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-hype" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user && profile && (
            <>
              <StreakChip />
              <CreditDisplay />
              <Link
                href={`/u/${profile.username}`}
                className="rounded-full transition hover:ring-2 hover:ring-hype/40"
                aria-label="Your profile"
              >
                <ProfileAvatar
                  avatarUrl={profile.avatar_url}
                  username={profile.username}
                  size="sm"
                  ring={Boolean(profile.avatar_url)}
                  className="h-6 w-6"
                />
              </Link>
            </>
          )}
          {user && !profile && (
            <Button asChild size="sm">
              <Link href="/onboarding">Finish setup</Link>
            </Button>
          )}
          {!user && (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
