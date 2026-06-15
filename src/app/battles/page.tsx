import { createClient } from "@/lib/supabase/server";
import { BattleCard } from "@/components/BattleCard";
import { PageShell, SectionHeader } from "@/components/PageShell";

export const metadata = { title: "Battles | HypeRank" };

export default async function BattlesPage() {
  const supabase = await createClient();
  const { data: battles } = await supabase
    .from("battles")
    .select(
      `
      id, votes_a, votes_b, ends_at, status,
      trend_a:trends!battles_trend_a_id_fkey(id, name, slug),
      trend_b:trends!battles_trend_b_id_fkey(id, name, slug)
    `
    )
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <PageShell wide>
      <SectionHeader
        label="Arena"
        title="Battles"
        subtitle="Head-to-head trend matchups. Pick a side and rally the crowd."
      />

      {!battles?.length ? (
        <div className="surface-card p-12 text-center">
          <p className="text-[var(--text-secondary)]">
            No battles scheduled. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {(battles ?? []).map((b) => (
            <BattleCard
              key={b.id}
              battle={{
                ...b,
                trend_a: b.trend_a as unknown as {
                  id: string;
                  name: string;
                  slug: string;
                },
                trend_b: b.trend_b as unknown as {
                  id: string;
                  name: string;
                  slug: string;
                },
              }}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
