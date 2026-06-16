import Link from "next/link";
import { getTrends } from "@/lib/supabase/trends";
import { getActivePitches } from "@/lib/supabase/pitches";
import {
  getHomeStats,
  getActiveBattle,
  getActiveShopDrop,
  getLeaderboardPreview,
} from "@/lib/supabase/stats";
import { createClient } from "@/lib/supabase/server";
import { DailyDropCountdown } from "@/components/DailyDropCountdown";
import { TrendCard } from "@/components/TrendCard";
import { BattleCard } from "@/components/BattleCard";
import { PitchCard } from "@/components/pitches/PitchCard";
import { HomeHero } from "@/components/home/HomeHero";
import { TrendingFeed } from "@/components/home/TrendingFeed";
import { ShopTeaser } from "@/components/home/ShopTeaser";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { Button } from "@/components/ui/button";
import { getUserPitchVotes } from "@/lib/supabase/pitches";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    dailyDrops,
    trending,
    activePitches,
    stats,
    activeBattle,
    shopDrop,
    leaders,
  ] = await Promise.all([
    getTrends({ dailyDrop: true, limit: 5 }),
    getTrends({ limit: 20 }),
    getActivePitches(3),
    getHomeStats(),
    getActiveBattle(),
    getActiveShopDrop(),
    getLeaderboardPreview(5),
  ]);

  let userVotes: Record<string, "hype" | "dead"> = {};
  let votedPitchIds = new Set<string>();
  let profile = null;

  if (user) {
    const [{ data: votes }, pitchVotes, profileData] = await Promise.all([
      supabase
        .from("votes")
        .select("trend_id, vote_type")
        .eq("user_id", user.id),
      getUserPitchVotes(user.id),
      supabase
        .from("profiles")
        .select("streak_days, credits, hype_score")
        .eq("id", user.id)
        .maybeSingle(),
    ]);
    userVotes = Object.fromEntries(
      (votes ?? []).map((v) => [v.trend_id, v.vote_type as "hype" | "dead"])
    );
    votedPitchIds = pitchVotes;
    profile = profileData.data;
  }

  const featuredTrend =
    dailyDrops[0] ?? trending.sort((a, b) => b.vote_velocity - a.vote_velocity)[0];
  const risingFast = [...trending]
    .sort((a, b) => b.vote_velocity - a.vote_velocity)
    .slice(0, 3);

  const battleData = activeBattle
    ? {
        id: activeBattle.id,
        votes_a: activeBattle.votes_a,
        votes_b: activeBattle.votes_b,
        ends_at: activeBattle.ends_at,
        status: activeBattle.status,
        trend_a: activeBattle.trend_a as unknown as {
          id: string;
          name: string;
          slug: string;
        },
        trend_b: activeBattle.trend_b as unknown as {
          id: string;
          name: string;
          slug: string;
        },
      }
    : null;

  return (
    <>
      <HomeHero
        stats={stats}
        hasLiveBattle={!!activeBattle}
        featuredTrend={featuredTrend}
        userVote={featuredTrend ? userVotes[featuredTrend.id] ?? null : null}
        userStreak={profile?.streak_days}
      />

      {/* Section 2 — Daily Drop */}
      <section className="bg-[var(--bg-surface)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-display-md">Today&apos;s Drop</h2>
            <DailyDropCountdown />
          </div>

          {dailyDrops.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <p className="text-body-md text-[var(--text-2)]">
                No drop today yet.{" "}
                <Link href="/pitches" className="text-hype hover:underline">
                  Pitch the first one
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-3">
              {dailyDrops.map((t) => (
                <div key={t.id} className="min-w-[300px] shrink-0 md:min-w-0">
                  <TrendCard
                    trend={t}
                    userVote={userVotes[t.id] ?? null}
                    variant="daily"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 3 — What's Moving */}
      <TrendingFeed
        trends={trending}
        userVotes={userVotes}
        risingFast={risingFast}
        battle={battleData}
        isLoggedIn={!!user}
        streak={profile?.streak_days}
        credits={profile?.credits}
        hypeScore={profile?.hype_score}
      />

      {/* Section 4 — Battle Arena */}
      <section className="bg-[var(--bg-void)] py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-display-md">
              {battleData ? "Battle Live Now" : "Battle Arena"}
            </h2>
            <Link
              href="/battles"
              className="text-body-sm font-medium text-hype hover:underline"
            >
              See all battles →
            </Link>
          </div>

          {battleData ? (
            <BattleCard battle={battleData} />
          ) : (
            <div className="glass-card p-12 text-center">
              <p className="text-body-md text-[var(--text-2)]">
                Nothing live right now. Check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section 5 — Auditions */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-display-md">Auditions</h2>
            <Link
              href="/pitches"
              className="text-body-sm font-medium text-hype hover:underline"
            >
              All auditions →
            </Link>
          </div>

          {activePitches.length === 0 ? (
            <div className="glass-card flex flex-col items-center p-12 text-center">
              <p className="text-body-md text-[var(--text-2)]">
                Nothing here yet. Be the first to pitch something.
              </p>
              <Button asChild className="mt-4">
                <Link href="/pitches">Pitch an idea</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {activePitches.map((pitch, i) => (
                <PitchCard
                  key={pitch.id}
                  pitch={pitch}
                  rank={i + 1}
                  userVoted={votedPitchIds.has(pitch.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 6 — Shop Teaser */}
      {shopDrop && (
        <ShopTeaser
          drop={{
            id: shopDrop.id,
            name: shopDrop.name,
            ends_at: shopDrop.ends_at,
            theme: shopDrop.theme,
            shop_items: (shopDrop.shop_items as { id: string }[]) ?? [],
          }}
        />
      )}

      {/* Section 7 — Leaderboard Preview */}
      <LeaderboardPreview leaders={leaders} />
    </>
  );
}
