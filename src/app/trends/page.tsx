import { getTrends } from "@/lib/supabase/trends";
import { createClient } from "@/lib/supabase/server";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";

export const metadata = { title: "Trends | HypeRank" };

export default async function TrendsPage() {
  const trends = await getTrends({ limit: 50 });
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Trends</h1>
      <p className="mt-1 text-[var(--text-secondary)]">
        Vote on what&apos;s hype and what&apos;s dead.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {trends.map((t, i) => (
          <div key={t.id}>
            <TrendCard trend={t} userVote={userVotes[t.id] ?? null} />
            {i === 2 && <AdSlot slot="trends-feed-1" />}
          </div>
        ))}
      </div>

      {trends.length === 0 && (
        <p className="mt-8 text-center text-[var(--text-secondary)]">
          No trends yet. Could be you.
        </p>
      )}
    </div>
  );
}
