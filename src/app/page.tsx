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
import { PageShell, SectionHeader } from "@/components/PageShell";
import { HypeMascot } from "@/components/HypeMascot";
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
      getTrends({ limit: 10 }),
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

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.08] via-transparent to-transparent" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-16 text-center md:py-24 lg:flex-row lg:text-left">
          <div className="flex-1">
            <Badge variant="live" className="mb-6">
              Live culture rankings
            </Badge>
            <h1 className="font-display text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
              What&apos;s{" "}
              <span className="text-gradient-fire">hot.</span>
              <br />
              What&apos;s{" "}
              <span className="text-[var(--text-secondary)]">dead.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-lg text-[var(--text-secondary)] lg:mx-0">
              Vote on internet culture. Pitch the next viral thing. Stack
              streaks, earn credits, and flex on the leaderboard.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild size="lg">
                <Link href="/trends">Start voting</Link>
              </Button>
              <Button asChild variant="glow" size="lg">
                <Link href="/pitches">Auditions</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/battles">Live battles</Link>
              </Button>
              {!user && (
                <Button asChild variant="ghost" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-8 lg:justify-start">
              {[
                { label: "Votes cast", value: "∞" },
                { label: "Daily drops", value: "24h" },
                { label: "Your streak", value: user ? "🔥" : "—" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mt-12 flex-shrink-0 lg:mt-0">
            <HypeMascot size="hero" />
          </div>
        </div>
      </section>

      <PageShell wide>
        {(featuredPitch || communityDrop) && (
          <section className="mb-16">
            <SectionHeader
              label="Community"
              title="Featured today"
              subtitle="The top audition pick — pitched and voted on by the crowd."
              action={
                <Link
                  href="/pitches"
                  className="text-sm font-medium text-red-400 hover:text-red-300"
                >
                  All auditions →
                </Link>
              }
            />
            <div className="surface-card overflow-hidden rounded-2xl">
              {featuredPitch ? (
                <FeaturedPitchBanner pitch={featuredPitch} />
              ) : communityDrop ? (
                <div className="p-6">
                  <TrendCard
                    trend={communityDrop}
                    userVote={userVotes[communityDrop.id] ?? null}
                  />
                </div>
              ) : null}
            </div>
          </section>
        )}

        <section className="mb-16">
          <SectionHeader
            label="Daily drop"
            title="Today's picks"
            subtitle="Fresh trends drop every day. Vote before the clock resets."
            action={<DailyDropCountdown />}
          />
          {dailyDrops.length === 0 ? (
            <div className="surface-card rounded-2xl p-12 text-center">
              <p className="text-[var(--text-secondary)]">
                No drop today yet.{" "}
                <Link href="/pitches" className="text-red-400 hover:text-red-300">
                  Pitch the first one →
                </Link>
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {dailyDrops.map((t) => (
                <TrendCard
                  key={t.id}
                  trend={t}
                  userVote={userVotes[t.id] ?? null}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-16">
          <SectionHeader
            label="Go viral"
            title="Live auditions"
            subtitle="Pitch an idea, rally votes — the winner becomes today's featured drop."
            action={
              <Link
                href="/pitches"
                className="text-sm font-medium text-red-400 hover:text-red-300"
              >
                Pitch yours →
              </Link>
            }
          />
          {activePitches.length === 0 ? (
            <div className="surface-card rounded-2xl p-12 text-center">
              <p className="text-[var(--text-secondary)]">
                No auditions yet — be the first to pitch the next big thing.
              </p>
              <Button asChild className="mt-4">
                <Link href="/pitches">Start an audition</Link>
              </Button>
            </div>
          ) : (
            <div className="surface-card divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
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
        </section>

        {activeBattle.data && (
          <section className="mb-16">
            <SectionHeader
              label="Live now"
              title="Battle arena"
              action={
                <Link
                  href="/battles"
                  className="text-sm font-medium text-red-400 hover:text-red-300"
                >
                  View all →
                </Link>
              }
            />
            <Link
              href={`/battles/${activeBattle.data.id}`}
              className="group surface-card-hover block overflow-hidden p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="live" className="mb-3">
                    Battle live
                  </Badge>
                  <p className="font-display text-2xl font-bold group-hover:text-red-400">
                    A head-to-head is happening right now
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Pick your side. Watch the votes roll in.
                  </p>
                </div>
                <span className="hidden text-4xl md:block">⚔️</span>
              </div>
            </Link>
          </section>
        )}

        <section>
          <SectionHeader
            label="Trending"
            title="What's moving"
            subtitle="The pulse of the internet, ranked by the crowd."
          />
          {trending.length === 0 ? (
            <div className="surface-card rounded-2xl p-12 text-center">
              <p className="text-[var(--text-secondary)]">
                No trends yet. Seed via POST /api/seed/trends
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {trending.map((t, i) => (
                <div key={t.id}>
                  <TrendCard trend={t} userVote={userVotes[t.id] ?? null} />
                  {i === 2 && <AdSlot slot="home-feed-1" />}
                </div>
              ))}
            </div>
          )}
        </section>
      </PageShell>
    </>
  );
}
