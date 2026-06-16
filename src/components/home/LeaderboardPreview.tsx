import Link from "next/link";
import { ProfileAvatar } from "@/components/ProfileAvatar";

interface LeaderRow {
  id: string;
  username: string;
  avatar_url: string | null;
  streak_days?: number;
  credits?: number;
  total_votes?: number;
  hype_score?: number;
}

export function LeaderboardPreview({ leaders }: { leaders: LeaderRow[] }) {
  if (leaders.length === 0) return null;

  const rankColors = ["text-gold", "text-gray-300", "text-amber-700"];

  return (
    <section className="border-t border-[var(--border)] py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-display-md">This week&apos;s top voters</h2>
            <p className="mt-1 text-body-md text-[var(--text-2)]">
              The most active voices on HypeRank.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="text-body-sm font-medium text-hype hover:underline"
          >
            Full leaderboard →
          </Link>
        </div>

        <div className="glass-card divide-y divide-[var(--border)] overflow-hidden">
          {leaders.map((p, i) => (
            <Link
              key={p.id}
              href={`/u/${p.username}`}
              className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--bg-raised)] ${
                i < 3 ? "bg-[var(--bg-raised)]/50" : ""
              }`}
            >
              <span
                className={`w-8 font-display text-2xl font-extrabold ${
                  rankColors[i] ?? "text-[var(--text-3)]"
                }`}
              >
                {i + 1}
              </span>
              <ProfileAvatar
                avatarUrl={p.avatar_url}
                username={p.username}
                size="sm"
                className="h-8 w-8"
              />
              <span className="min-w-0 flex-1 truncate font-medium">
                {p.username}
              </span>
              <div className="hidden items-center gap-4 text-body-sm text-[var(--text-2)] sm:flex">
                <span>🔥 {p.streak_days ?? 0}</span>
                <span>{Math.round(p.hype_score ?? 0)}% acc</span>
                <span className="text-gold">
                  {(p.credits ?? 0).toLocaleString()} cr
                </span>
              </div>
              <span className="font-display font-bold text-[var(--text-1)] sm:hidden">
                {(p.total_votes ?? 0).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
