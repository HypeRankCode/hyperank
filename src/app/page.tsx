import Link from "next/link";
import Image from "next/image";
import { getTrends } from "@/lib/supabase/trends";
import { createClient } from "@/lib/supabase/server";
import { DailyDropCountdown } from "@/components/DailyDropCountdown";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
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
      <section className="border-b border-[var(--border-subtle)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 py-16 lg:flex-row lg:gap-16 lg:px-6 lg:py-20">
          <div className="flex-1 text-center lg:text-left">
            <p className="section-label mb-4">Culture intelligence</p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-5xl lg:text-[3.25rem]">
              Measure what&apos;s{" "}
              <span className="text-[var(--accent-hype)]">hype</span>
              <br className="hidden sm:block" />
              {" "}and what&apos;s fading.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-[var(--text-secondary)] lg:mx-0">
              HypeRank is a community-driven platform for ranking trends, tracking
              momentum, and rewarding consistent participation.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild size="lg">
                <Link href="/trends">Browse trends</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/battles">View battles</Link>
              </Button>
              {!user && (
                <Button asChild variant="ghost" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              )}
            </div>
          </div>

          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-red-500/[0.06] blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
              <Image
                src="/logo.png"
                alt="HypeRank"
                width={280}
                height={280}
                className="mx-auto"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <PageShell wide>
        <section className="mb-14">
          <SectionHeader
            label="Daily drop"
            title="Today's featured trends"
            subtitle="New picks every 24 hours. Vote while they're live."
            action={<DailyDropCountdown />}
          />
          {dailyDrops.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <p className="text-[var(--text-secondary)]">
                No drop available yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <section className="mb-14">
            <SectionHeader
              label="Active"
              title="Live battle"
              action={
                <Link
                  href="/battles"
                  className="text-sm font-medium text-[var(--accent-hype)] hover:underline"
                >
                  All battles
                </Link>
              }
            />
            <Link
              href={`/battles/${activeBattle.data.id}`}
              className="surface-card-hover block p-6 md:p-8"
            >
              <p className="font-display text-xl font-semibold text-zinc-100">
                A head-to-head matchup is in progress
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Cast your vote and follow results in real time.
              </p>
            </Link>
          </section>
        )}

        <section>
          <SectionHeader
            label="Trending"
            title="Popular right now"
            subtitle="Ranked by community votes and recent activity."
          />
          {trending.length === 0 ? (
            <div className="surface-card p-12 text-center">
              <p className="text-[var(--text-secondary)]">
                No trends indexed yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
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
