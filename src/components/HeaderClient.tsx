"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditDisplay } from "./CreditDisplay";
import { useUserStore } from "@/stores/useUserStore";
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/hyperank_icon.png"
            alt="HypeRank"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="font-display text-lg font-bold">
            Hype<span className="text-hype">Rank</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <CreditDisplay />
          {user && profile ? (
            <Link
              href={`/u/${profile.username}`}
              className="rounded-full border border-[var(--border)] px-4 py-1.5 text-sm hover:border-hype/50"
            >
              {profile.username}
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-hype px-4 py-1.5 text-sm font-medium text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
