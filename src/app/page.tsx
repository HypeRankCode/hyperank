import Link from "next/link";
import { getTrends } from "@/lib/supabase/trends";
import { createClient } from "@/lib/supabase/server";
import { DailyDropCountdown } from "@/components/DailyDropCountdown";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          What&apos;s hot. What&apos;s dead.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[var(--text-secondary)]">
          Vote on internet culture. Build your streak. Customize your character.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/trends">Browse trends</Link>
          </Button>
          {!user && (
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Get started</Link>
            </Button>
          )}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Daily Drop</h2>
          <DailyDropCountdown />
        </div>
        {dailyDrops.length === 0 ? (
          <div className="card-glass rounded-lg p-8 text-center text-[var(--text-secondary)]">
            <p>No drop today yet.</p>
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
        <section className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold">Battles</h2>
            <Link href="/battles" className="text-sm text-hype">
              View all
            </Link>
          </div>
          <Link
            href={`/battles/${activeBattle.data.id}`}
            className="card-glass block p-6 text-center hover:border-hype/30"
          >
            A battle is live right now.
          </Link>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold">Trending Now</h2>
        {trending.length === 0 ? (
          <div className="card-glass rounded-lg p-8 text-center text-[var(--text-secondary)]">
            No trends yet. Seed data via POST /api/seed/trends with CRON_SECRET.
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
    </div>
  );
}
