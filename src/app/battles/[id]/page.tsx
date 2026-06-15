import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BattleVoteClient } from "@/components/BattleVoteClient";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { BackLink } from "@/components/BackLink";

export default async function BattleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: battle } = await supabase
    .from("battles")
    .select(
      `
      *,
      trend_a:trends!battles_trend_a_id_fkey(id, name, slug),
      trend_b:trends!battles_trend_b_id_fkey(id, name, slug)
    `
    )
    .eq("id", params.id)
    .single();

  if (!battle) notFound();

  const { data: votesA } = await supabase
    .from("battle_votes")
    .select("profiles(avatar_url, username)")
    .eq("battle_id", params.id)
    .eq("voted_for", battle.trend_a_id)
    .limit(8);

  const { data: votesB } = await supabase
    .from("battle_votes")
    .select("profiles(avatar_url, username)")
    .eq("battle_id", params.id)
    .eq("voted_for", battle.trend_b_id)
    .limit(8);

  const trendA = battle.trend_a as { id: string; name: string };
  const trendB = battle.trend_b as { id: string; name: string };
  const total = battle.votes_a + battle.votes_b || 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BackLink href="/battles" label="Battles" />
      <h1 className="mt-4 text-center font-display text-3xl font-bold">Battle</h1>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold">{trendA.name}</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(votesA ?? []).map((v, i) => {
              const p = v.profiles as unknown as {
                avatar_url: string | null;
                username: string;
              } | null;
              return (
                <ProfileAvatar
                  key={i}
                  avatarUrl={p?.avatar_url}
                  username={p?.username}
                  size="md"
                />
              );
            })}
          </div>
        </div>
        <div className="text-center">
          <h2 className="font-display text-xl font-bold">{trendB.name}</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {(votesB ?? []).map((v, i) => {
              const p = v.profiles as unknown as {
                avatar_url: string | null;
                username: string;
              } | null;
              return (
                <ProfileAvatar
                  key={i}
                  avatarUrl={p?.avatar_url}
                  username={p?.username}
                  size="md"
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 h-3 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
        <div
          className="h-full bg-hype transition-all"
          style={{ width: `${(battle.votes_a / total) * 100}%` }}
        />
      </div>

      {battle.status === "active" && (
        <BattleVoteClient
          battleId={battle.id}
          trendAId={trendA.id}
          trendBId={trendB.id}
          trendAName={trendA.name}
          trendBName={trendB.name}
        />
      )}
    </div>
  );
}
