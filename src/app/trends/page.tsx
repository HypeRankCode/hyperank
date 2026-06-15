import { getTrends } from "@/lib/supabase/trends";
import { createClient } from "@/lib/supabase/server";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { PageShell, SectionHeader } from "@/components/PageShell";

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
    <PageShell wide>
      <SectionHeader
        label="Vote"
        title="All trends"
        subtitle="Cast your vote. One per trend. No take-backs."
      />

      {trends.length === 0 ? (
        <div className="surface-card rounded-2xl p-16 text-center">
          <p className="text-lg text-[var(--text-secondary)]">
            No trends yet. Could be you.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {trends.map((t, i) => (
            <div key={t.id}>
              <TrendCard trend={t} userVote={userVotes[t.id] ?? null} />
              {i === 2 && <AdSlot slot="trends-feed-1" />}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
