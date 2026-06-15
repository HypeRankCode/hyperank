import { createClient } from "@/lib/supabase/server";
import { BattleCard } from "@/components/BattleCard";

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Battles</h1>
      <p className="mt-1 text-[var(--text-secondary)]">
        Head-to-head trend matchups.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
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

      {!battles?.length && (
        <p className="mt-8 text-center text-[var(--text-secondary)]">
          No battles live right now. Check back soon.
        </p>
      )}
    </div>
  );
}
