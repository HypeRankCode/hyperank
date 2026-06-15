"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CreditDisplay } from "./CreditDisplay";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";

const navLinks = [
  { href: "/trends", label: "Trends" },
  { href: "/battles", label: "Battles" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/shop/drop", label: "Shop" },
];

export function HeaderClient() {
  const [user, setUser] = useState<User | null>(null);
  const profile = useUserStore((s) => s.profile);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-8 px-4 lg:px-6">
        <Logo size="sm" />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative py-4 text-sm font-medium transition-colors",
                  active
                    ? "text-zinc-100"
                    : "text-[var(--text-secondary)] hover:text-zinc-200"
                )}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-hype)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <CreditDisplay />
          {user && profile ? (
            <Link
              href={`/u/${profile.username}`}
              className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] py-1 pl-1 pr-3 text-sm transition-colors hover:border-zinc-600"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800 text-xs font-medium text-zinc-200">
                {profile.username[0]?.toUpperCase()}
              </span>
              <span className="font-medium text-zinc-200">{profile.username}</span>
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
