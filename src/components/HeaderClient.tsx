"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditDisplay } from "./CreditDisplay";
import { Logo } from "./Logo";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/utils";

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
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-black/60 backdrop-blur-2xl">
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
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-white"
                    : "text-[var(--text-secondary)] hover:text-white"
                )}
              >
                {active && (
                  <span className="absolute inset-0 rounded-full border border-red-500/30 bg-red-500/10" />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <CreditDisplay />
          {user && profile ? (
            <Link
              href={`/u/${profile.username}`}
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-4 text-sm transition-all hover:border-red-500/40 hover:bg-red-500/10"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-800 text-xs font-bold text-white">
                {profile.username[0]?.toUpperCase()}
              </span>
              <span className="font-medium">{profile.username}</span>
            </Link>
          ) : user ? (
            <Link href="/onboarding" className="btn-hype text-sm">
              Finish setup
            </Link>
          ) : (
            <Link href="/login" className="btn-hype text-sm">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
