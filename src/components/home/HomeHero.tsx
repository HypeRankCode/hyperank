"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { TrendCard } from "@/components/TrendCard";
import { LiveDot } from "@/components/LiveDot";
import { NumberPop } from "@/components/NumberPop";
import { Button } from "@/components/ui/button";
import type { Trend } from "@/lib/types/database";

interface HomeHeroProps {
  stats: { votesToday: number; activeStreaks: number };
  hasLiveBattle: boolean;
  featuredTrend?: Trend | null;
  userVote?: "hype" | "dead" | null;
  userStreak?: number;
}

export function HomeHero({
  stats,
  hasLiveBattle,
  featuredTrend,
  userVote,
  userStreak,
}: HomeHeroProps) {
  const reduced = useReducedMotion();

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-[var(--border)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 50%, var(--hype-glow), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-4 py-16 lg:min-h-[calc(100vh-4rem)] lg:flex-row lg:items-center lg:py-0">
        {/* Left — 60% */}
        <motion.div
          className="flex flex-1 flex-col justify-center lg:max-w-[60%]"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-4 flex items-center gap-2">
            <LiveDot size="md" />
            <span className="text-label text-[var(--text-2)]">
              Live · Internet culture
            </span>
          </div>

          <h1 className="text-display-xl md:text-[4.5rem]">
            What&apos;s{" "}
            <span className="text-hype">hot.</span>
            <br />
            What&apos;s{" "}
            <span className="text-dead-text">not.</span>
          </h1>

          <p className="mt-6 max-w-lg text-body-lg text-[var(--text-2)]">
            Vote on what&apos;s trending. Earn credits. Build your streak. The
            internet&apos;s pulse, live.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="hero">
              <Link href="/trends">Start voting</Link>
            </Button>
            <Button asChild variant="outline" size="hero">
              <Link href="/battles">See the battles</Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <StatChip emoji="🔥" label="votes today">
              <NumberPop value={stats.votesToday} />
            </StatChip>
            <StatChip emoji="⚡" label="active streaks">
              <NumberPop value={stats.activeStreaks} />
            </StatChip>
            {hasLiveBattle && (
              <StatChip emoji="🟢" label="Live now" highlight />
            )}
            {userStreak !== undefined && userStreak > 0 && (
              <StatChip emoji="🔥" label="your streak">
                <NumberPop value={userStreak} />
              </StatChip>
            )}
          </div>
        </motion.div>

        {/* Right — floating trend cards (desktop only) */}
        {featuredTrend && (
          <div className="relative hidden flex-1 items-center justify-center lg:flex">
            <motion.div
              className="absolute right-8 top-8 w-[280px] rotate-[-6deg] opacity-40"
              animate={reduced ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="glass-card h-48 rounded-2xl" />
            </motion.div>
            <motion.div
              className="relative z-10 w-[300px] rotate-[-3deg]"
              animate={reduced ? undefined : { y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              whileHover={reduced ? undefined : { rotate: 0, scale: 1.02 }}
            >
              <TrendCard
                trend={featuredTrend}
                userVote={userVote}
                variant="featured"
              />
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}

function StatChip({
  emoji,
  label,
  children,
  highlight,
}: {
  emoji: string;
  label: string;
  children?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
        highlight
          ? "border-neon/30 bg-neon/10 text-neon"
          : "border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-2)]"
      }`}
    >
      <span aria-hidden>{emoji}</span>
      {children && (
        <span className="font-display font-bold text-[var(--text-1)]">
          {children}
        </span>
      )}
      <span className="text-body-sm">{label}</span>
    </div>
  );
}
