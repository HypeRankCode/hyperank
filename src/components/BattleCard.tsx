"use client";

import Link from "next/link";
import { Avatar3D } from "./Avatar3DClient";
import { Badge } from "./ui/badge";

interface BattleWithTrends {
  id: string;
  votes_a: number;
  votes_b: number;
  ends_at: string;
  status?: string;
  trend_a: { id: string; name: string; slug: string };
  trend_b: { id: string; name: string; slug: string };
  voters_a?: { avatar_rpm_url: string | null }[];
  voters_b?: { avatar_rpm_url: string | null }[];
}

export function BattleCard({ battle }: { battle: BattleWithTrends }) {
  const total = battle.votes_a + battle.votes_b || 1;
  const percentA = Math.round((battle.votes_a / total) * 100);
  const isLive = battle.status === "active";

  return (
    <Link href={`/battles/${battle.id}`}>
      <article className="surface-card-hover group p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
            Head-to-head
          </p>
          {isLive && <Badge variant="live">Live</Badge>}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
          <div className="text-center">
            <p className="font-display text-base font-semibold text-zinc-100 group-hover:text-[var(--accent-hype)]">
              {battle.trend_a.name}
            </p>
            <p className="mt-1 font-mono text-xl font-medium tabular-nums text-zinc-200">
              {percentA}%
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {(battle.voters_a ?? []).slice(0, 4).map((v, i) => (
                <Avatar3D
                  key={i}
                  modelUrl={v.avatar_rpm_url ?? ""}
                  size="small"
                />
              ))}
            </div>
          </div>

          <span className="pt-1 text-xs font-medium text-[var(--text-secondary)]">
            vs
          </span>

          <div className="text-center">
            <p className="font-display text-base font-semibold text-zinc-100 group-hover:text-[var(--accent-hype)]">
              {battle.trend_b.name}
            </p>
            <p className="mt-1 font-mono text-xl font-medium tabular-nums text-zinc-200">
              {100 - percentA}%
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {(battle.voters_b ?? []).slice(0, 4).map((v, i) => (
                <Avatar3D
                  key={i}
                  modelUrl={v.avatar_rpm_url ?? ""}
                  size="small"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-[var(--accent-hype)] transition-all duration-500"
            style={{ width: `${percentA}%` }}
          />
        </div>

        <p className="mt-3 text-center font-mono text-xs text-[var(--text-secondary)]">
          {(battle.votes_a + battle.votes_b).toLocaleString()} votes
        </p>
      </article>
    </Link>
  );
}
