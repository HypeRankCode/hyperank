import Link from "next/link";
import { getTrends } from "@/lib/supabase/trends";
import {
  getActivePitches,
  getTodaysWinningPitch,
  getUserPitchVotes,
} from "@/lib/supabase/pitches";
import { createClient } from "@/lib/supabase/server";
import { DailyDropCountdown } from "@/components/DailyDropCountdown";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HypeMascot } from "@/components/HypeMascot";
import { HomeQuickNav } from "@/components/home/HomeQuickNav";
import { FeedSection } from "@/components/home/FeedSection";
import { FeaturedPitchBanner } from "@/components/home/FeaturedPitchBanner";
import { PitchCard } from "@/components/pitches/PitchCard";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [dailyDrops, trending, activePitches, featuredPitch, activeBattle] =
    await Promise.all([
      getTrends({ dailyDrop: true, limit: 5 }),
      getTrends({ limit: 8 }),
      getActivePitches(5),
      getTodaysWinningPitch(),
      supabase
        .from("battles")
        .select("id")
        .eq("status", "active")
        .limit(1)
        .maybeSingle(),
    ]);

  let userVotes: Record<string, "hype" | "dead"> = {};
  let votedPitchIds = new Set<string>();

  if (user) {
    const [{ data: votes }, pitchVotes] = await Promise.all([
      supabase
        .from("votes")
        .select("trend_id, vote_type")
        .eq("user_id", user.id),
      getUserPitchVotes(user.id),
    ]);
    userVotes = Object.fromEntries(
      (votes ?? []).map((v) => [v.trend_id, v.vote_type as "hype" | "dead"])
    );
    votedPitchIds = pitchVotes;
  }

  const communityDrop = dailyDrops.find((t) => t.is_community_pick);
  const otherDrops = dailyDrops.filter((t) => !t.is_community_pick);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Compact app header */}
      <div className="border-b border-white/[0.06] bg-gradient-to-b from-red-500/[0.06] to-transparent">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 md:max-w-4xl md:flex-row md:items-center md:py-8">
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <HypeMascot size="sm" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge variant="live" className="mb-2">
                Live now
              </Badge>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">
                What&apos;s{" "}
                <span className="text-gradient-fire">hot</span> today?
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Vote, pitch, battle — stack streaks and credits.
              </p>
              <HomeQuickNav />
            </div>
          </div>
          <div className="shrink-0 self-start md:self-center">
            <DailyDropCountdown />
          </div>
        </div>
      </div>

      {/* Unified feed */}
      <div className="mx-auto max-w-3xl px-4 py-4 md:max-w-4xl">
        <div className="surface-card overflow-hidden rounded-3xl border border-white/[0.08] shadow-2xl shadow-black/40">
          {(featuredPitch || communityDrop) && (
            <FeedSection
              title="Featured today"
              label="Community"
              noPadding
              action={
                <Link
                  href="/pitches"
                  className="text-xs font-medium text-red-400 hover:text-red-300"
                >
                  All auditions →
                </Link>
              }
            >
              {featuredPitch ? (
                <FeaturedPitchBanner pitch={featuredPitch} />
              ) : communityDrop ? (
                <div className="p-4 md:p-6">
                  <TrendCard
                    trend={communityDrop}
                    userVote={userVotes[communityDrop.id] ?? null}
                  />
                </div>
              ) : null}
            </FeedSection>
          )}

          <FeedSection
            title="Today's picks"
            label="Daily drop"
            action={
              <Link
                href="/trends"
                className="text-xs font-medium text-red-400 hover:text-red-300"
              >
                See all →
              </Link>
            }
            noPadding
          >
            {dailyDrops.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[var(--text-secondary)] md:px-6">
                No drop yet today.{" "}
                <Link href="/pitches" className="text-red-400 hover:text-red-300">
                  Pitch the first one →
                </Link>
              </p>
            ) : (
              <div className="flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-none md:px-6">
                {[...(communityDrop ? [communityDrop] : []), ...otherDrops].map(
                  (t) => (
                    <div
                      key={t.id}
                      className="w-[min(100%,280px)] shrink-0 snap-start"
                    >
                      <TrendCard
                        trend={t}
                        userVote={userVotes[t.id] ?? null}
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </FeedSection>

          <FeedSection
            title="Live auditions"
            label="Go viral"
            action={
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
                <Link href="/pitches">Pitch yours</Link>
              </Button>
            }
            noPadding
          >
            {activePitches.length === 0 ? (
              <div className="px-4 py-6 text-center md:px-6">
                <p className="text-sm text-[var(--text-secondary)]">
                  Be the first to audition the next big thing.
                </p>
                <Button asChild size="sm" className="mt-3">
                  <Link href="/pitches">Start an audition</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {activePitches.map((pitch, i) => (
                  <PitchCard
                    key={pitch.id}
                    pitch={pitch}
                    rank={i + 1}
                    compact
                    userVoted={votedPitchIds.has(pitch.id)}
                  />
                ))}
              </div>
            )}
          </FeedSection>

          {activeBattle.data && (
            <FeedSection
              title="Battle arena"
              label="Live"
              action={
                <Link
                  href="/battles"
                  className="text-xs font-medium text-red-400 hover:text-red-300"
                >
                  All battles →
                </Link>
              }
            >
              <Link
                href={`/battles/${activeBattle.data.id}`}
                className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-red-500/20 hover:bg-red-500/5 md:p-5"
              >
                <div>
                  <Badge variant="live" className="mb-2">
                    Head-to-head live
                  </Badge>
                  <p className="font-display font-bold group-hover:text-red-400">
                    Pick a side — votes are rolling in
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Jump in before it closes
                  </p>
                </div>
                <span className="text-3xl">⚔️</span>
              </Link>
            </FeedSection>
          )}

          <FeedSection
            title="Trending now"
            label="Feed"
            action={
              <Link
                href="/trends"
                className="text-xs font-medium text-red-400 hover:text-red-300"
              >
                Full feed →
              </Link>
            }
          >
            {trending.length === 0 ? (
              <p className="py-6 text-center text-sm text-[var(--text-secondary)]">
                No trends yet.
              </p>
            ) : (
              <div className="space-y-4">
                {trending.map((t, i) => (
                  <div key={t.id}>
                    <TrendCard trend={t} userVote={userVotes[t.id] ?? null} />
                    {i === 2 && <AdSlot slot="home-feed-1" />}
                  </div>
                ))}
              </div>
            )}
          </FeedSection>

          {!user && (
            <div className="border-t border-white/[0.06] bg-gradient-to-r from-red-500/5 to-transparent px-4 py-6 text-center md:px-6">
              <p className="text-sm text-[var(--text-secondary)]">
                Sign in to vote, pitch, and earn credits.
              </p>
              <Button asChild className="mt-3" size="sm">
                <Link href="/login">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
