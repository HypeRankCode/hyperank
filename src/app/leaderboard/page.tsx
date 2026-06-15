import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { cn } from "@/lib/utils";

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
    avatar_url: string | null;
    total_votes?: number;
    credits?: number;
    streak_days?: number;
    correct_predictions?: number;
    total_predictions?: number;
  }[] = [];

  if (tab === "voters") {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, total_votes")
      .order("total_votes", { ascending: false })
      .limit(50);
    profiles = data ?? [];
  } else if (tab === "credits") {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, credits")
      .order("credits", { ascending: false })
      .limit(50);
    profiles = data ?? [];
  } else if (tab === "streaks") {
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, streak_days")
      .order("streak_days", { ascending: false })
      .limit(50);
    profiles = data ?? [];
  } else {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, username, avatar_url, correct_predictions, total_predictions"
      )
      .gte("total_predictions", 10)
      .order("correct_predictions", { ascending: false })
      .limit(50);
    profiles = data ?? [];
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "voters", label: "Top Voters" },
    { id: "prophets", label: "Prophets" },
    { id: "credits", label: "Credit Kings" },
    { id: "streaks", label: "Streak Hall" },
  ];

  function stat(p: (typeof profiles)[0]) {
    if (tab === "voters") return (p.total_votes ?? 0).toLocaleString();
    if (tab === "credits") return (p.credits ?? 0).toLocaleString();
    if (tab === "streaks") return `${p.streak_days ?? 0}d`;
    const total = p.total_predictions ?? 0;
    const correct = p.correct_predictions ?? 0;
    return total > 0 ? `${Math.round((correct / total) * 100)}%` : "—";
  }

  const rankColors = ["text-gold", "text-gray-300", "text-amber-700"];

  return (
    <PageShell>
      <SectionHeader
        label="Hall of fame"
        title="Leaderboard"
        subtitle="The biggest voters, prophets, and streak legends."
      />

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/leaderboard?tab=${t.id}`}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-all",
              tab === t.id
                ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-hype-sm"
                : "border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:border-red-500/30 hover:text-white"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        {profiles.map((p, i) => (
          <Link
            key={p.id}
            href={`/u/${p.username}`}
            className={cn(
              "surface-card-hover flex items-center gap-4 p-4",
              i < 3 && "border-yellow-500/20"
            )}
          >
            <span
              className={cn(
                "w-8 font-display text-lg font-bold",
                i < 3 ? rankColors[i] : "text-[var(--text-secondary)]"
              )}
            >
              {i + 1}
            </span>
            <ProfileAvatar
              avatarUrl={p.avatar_url}
              username={p.username}
              size="sm"
            />
            <span className="flex-1 font-medium">{p.username}</span>
            <span className="font-mono font-semibold text-gold">{stat(p)}</span>
          </Link>
        ))}
        {profiles.length === 0 && (
          <div className="surface-card rounded-2xl p-12 text-center">
            <p className="text-[var(--text-secondary)]">
              No entries yet. Could be you.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
