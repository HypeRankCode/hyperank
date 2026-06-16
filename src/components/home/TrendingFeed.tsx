"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TrendCard } from "@/components/TrendCard";
import { BattleCard } from "@/components/BattleCard";
import { AdSlot } from "@/components/AdSlot";
import { StreakDisplay } from "@/components/StreakDisplay";
import { VelocityPill } from "@/components/VelocityPill";
import { NumberPop } from "@/components/NumberPop";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Trend } from "@/lib/types/database";
import { calcHypePercent } from "@/lib/hype-score";

type Filter = "all" | "rising" | "cooling" | "controversial";

interface TrendingFeedProps {
  trends: Trend[];
  userVotes: Record<string, "hype" | "dead">;
  risingFast: Trend[];
  battle: {
    id: string;
    votes_a: number;
    votes_b: number;
    ends_at: string;
    status?: string;
    trend_a: { id: string; name: string; slug: string };
    trend_b: { id: string; name: string; slug: string };
  } | null;
  isLoggedIn: boolean;
  streak?: number;
  credits?: number;
  hypeScore?: number;
}

export function TrendingFeed({
  trends,
  userVotes,
  risingFast,
  battle,
  isLoggedIn,
  streak = 0,
  credits = 0,
  hypeScore = 0,
}: TrendingFeedProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    return trends.filter((t) => {
      if (filter === "rising") return t.vote_velocity > 3;
      if (filter === "cooling")
        return t.vote_velocity > 0 && t.vote_velocity <= 3;
      if (filter === "controversial") {
        const pct = calcHypePercent(t.hype_votes, t.dead_votes);
        return pct >= 40 && pct <= 60;
      }
      return true;
    });
  }, [trends, filter]);

  return (
    <section className="border-t border-[var(--border)] bg-[var(--bg-void)] py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8">
          <h2 className="text-display-md">What&apos;s moving</h2>
          <p className="mt-1 text-body-md text-[var(--text-2)]">
            The pulse of the internet, ranked by the crowd.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Feed */}
          <div>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as Filter)}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="rising">Rising</TabsTrigger>
                <TabsTrigger value="cooling">Cooling</TabsTrigger>
                <TabsTrigger value="controversial">Controversial</TabsTrigger>
              </TabsList>
            </Tabs>

            {filtered.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <p className="text-body-md text-[var(--text-2)]">
                  Nothing matches this filter right now.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFilter("all")}
                >
                  Show all trends
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((t, i) => (
                  <div key={t.id}>
                    <TrendCard trend={t} userVote={userVotes[t.id] ?? null} />
                    {i === 5 && (
                      <div className="mt-4">
                        <AdSlot slot="home-feed-1" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden space-y-4 lg:block">
            <div className="glass-card sticky top-24 space-y-4 p-5">
              <h3 className="text-label text-[var(--text-3)]">Your stats</h3>
              {isLoggedIn ? (
                <div className="space-y-3">
                  <StreakDisplay days={streak} />
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-[var(--text-2)]">Credits</span>
                    <NumberPop
                      value={credits}
                      className="font-bold text-gold"
                    />
                  </div>
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-[var(--text-2)]">Hype score</span>
                    <span className="font-display font-bold">
                      {Math.round(hypeScore)}%
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-body-sm text-[var(--text-2)]">
                    Sign in to track your streak
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/login">Sign in</Link>
                  </Button>
                </div>
              )}
            </div>

            {risingFast.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="mb-4 text-label text-[var(--text-3)]">
                  Rising fast
                </h3>
                <ol className="space-y-3">
                  {risingFast.map((t, i) => (
                    <li key={t.id} className="flex items-center gap-3">
                      <span className="font-display text-lg font-bold text-[var(--text-3)]">
                        {i + 1}
                      </span>
                      <Link
                        href={`/trends/${t.slug}`}
                        className="min-w-0 flex-1 truncate text-body-sm font-medium hover:text-hype"
                      >
                        {t.name}
                      </Link>
                      <VelocityPill velocity={t.vote_velocity} />
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {battle && (
              <div>
                <h3 className="mb-3 text-label text-[var(--text-3)]">
                  Live battle
                </h3>
                <BattleCard battle={battle} compact />
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
