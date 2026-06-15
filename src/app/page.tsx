import Link from "next/link";
import Image from "next/image";
import { getTrends } from "@/lib/supabase/trends";
import { createClient } from "@/lib/supabase/server";
import { DailyDropCountdown } from "@/components/DailyDropCountdown";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell, SectionHeader } from "@/components/PageShell";

export default async function HomePage() {
  const dailyDrops = await getTrends({ dailyDrop: true, limit: 5 });
  const trending = await getTrends({ limit: 10 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userVotes: Record<string, "hype" | "dead"> = {};
  if (user) {
    const { data: votes } = await supabase
      .from("votes")
      .select("trend_id, vote_type")
      .eq("user_id", user.id);
    userVotes = Object.fromEntries(
      (votes ?? []).map((v) => [v.trend_id, v.vote_type as "hype" | "dead"])
    );
  }

  const activeBattle = await supabase
    .from("battles")
    .select("id")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

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
              Vote on internet culture. Stack streaks. Earn credits. Customize
              your avatar and flex on the leaderboard.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild size="lg">
                <Link href="/trends">Start voting</Link>
              </Button>
              <Button asChild variant="glow" size="lg">
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
            <div className="absolute inset-0 rounded-full bg-red-500/20 blur-[80px]" />
            <Image
              src="/logo.png"
              alt="HypeRank"
              width={320}
              height={320}
              className="relative animate-float drop-shadow-[0_0_60px_rgba(255,43,43,0.5)]"
              priority
            />
          </div>
        </div>
      </section>

      <PageShell wide>
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
                No drop today yet. Check back soon.
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
