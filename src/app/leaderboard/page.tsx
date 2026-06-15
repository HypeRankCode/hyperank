import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Avatar3D } from "@/components/Avatar3DClient";

export const metadata = { title: "Leaderboard | HypeRank" };

type Tab = "voters" | "prophets" | "credits" | "streaks";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { tab?: Tab };
}) {
  const tab = searchParams.tab ?? "voters";
  const supabase = await createClient();

  let profiles: {
    id: string;
    username: string;
    avatar_rpm_url: string | null;
    total_votes?: number;
    credits?: number;
    streak_days?: number;
    correct_predictions?: number;
    total_predictions?: number;
  }[] = [];

  if (tab === "voters") {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_rpm_url, total_votes")
      .order("total_votes", { ascending: false })
      .limit(50);
    profiles = data ?? [];
  } else if (tab === "credits") {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_rpm_url, credits")
      .order("credits", { ascending: false })
      .limit(50);
    profiles = data ?? [];
  } else if (tab === "streaks") {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_rpm_url, streak_days")
      .order("streak_days", { ascending: false })
      .limit(50);
    profiles = data ?? [];
  } else {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, username, avatar_rpm_url, correct_predictions, total_predictions"
      )
      .gte("total_predictions", 10)
      .order("correct_predictions", { ascending: false })
      .limit(50);
    profiles = data ?? [];
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "voters", label: "Top Voters" },
    { id: "prophets", label: "Trend Prophets" },
    { id: "credits", label: "Credit Kings" },
    { id: "streaks", label: "Streak Hall" },
  ];

  function stat(p: (typeof profiles)[0]) {
    if (tab === "voters") return p.total_votes ?? 0;
    if (tab === "credits") return p.credits ?? 0;
    if (tab === "streaks") return p.streak_days ?? 0;
    const total = p.total_predictions ?? 0;
    const correct = p.correct_predictions ?? 0;
    return total > 0 ? `${Math.round((correct / total) * 100)}%` : "—";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Leaderboard</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/leaderboard?tab=${t.id}`}
            className={`rounded-full px-4 py-1.5 text-sm ${
              tab === t.id
                ? "bg-hype text-white"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-2">
        {profiles.map((p, i) => (
          <Link
            key={p.id}
            href={`/u/${p.username}`}
            className={`card-glass flex items-center gap-4 p-4 ${
              i < 3 ? "ring-1 ring-gold/30" : ""
            }`}
          >
            <span className="w-8 font-mono text-[var(--text-secondary)]">
              {i + 1}
            </span>
            <Avatar3D modelUrl={p.avatar_rpm_url ?? ""} size="small" />
            <span className="flex-1 font-medium">{p.username}</span>
            <span className="font-mono text-gold">{stat(p)}</span>
          </Link>
        ))}
        {profiles.length === 0 && (
          <p className="text-center text-[var(--text-secondary)]">
            No entries yet. Could be you.
          </p>
        )}
      </div>
    </div>
  );
}
