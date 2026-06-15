"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProfileAvatar } from "./ProfileAvatar";
import { Badge } from "./ui/badge";

interface VoterProfile {
  avatar_url: string | null;
  username?: string | null;
}

interface BattleWithTrends {
  id: string;
  votes_a: number;
  votes_b: number;
  ends_at: string;
  status?: string;
  trend_a: { id: string; name: string; slug: string };
  trend_b: { id: string; name: string; slug: string };
  voters_a?: VoterProfile[];
  voters_b?: VoterProfile[];
}

export function BattleCard({ battle }: { battle: BattleWithTrends }) {
  const total = battle.votes_a + battle.votes_b || 1;
  const percentA = Math.round((battle.votes_a / total) * 100);
  const isLive = battle.status === "active";

  return (
    <Link href={`/battles/${battle.id}`}>
      <motion.article
        className="surface-card-hover group relative overflow-hidden p-6"
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {isLive && (
          <div className="absolute right-4 top-4">
            <Badge variant="live">Live</Badge>
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="text-center">
            <p className="font-display text-lg font-bold transition-colors group-hover:text-red-400">
              {battle.trend_a.name}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-red-400">
              {percentA}%
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {(battle.voters_a ?? []).slice(0, 4).map((v, i) => (
                <ProfileAvatar
                  key={i}
                  avatarUrl={v.avatar_url}
                  username={v.username}
                  size="sm"
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="font-display text-2xl font-extrabold text-[var(--text-secondary)]">
              VS
            </span>
          </div>

          <div className="text-center">
            <p className="font-display text-lg font-bold transition-colors group-hover:text-red-400">
              {battle.trend_b.name}
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-[var(--text-secondary)]">
              {100 - percentA}%
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {(battle.voters_b ?? []).slice(0, 4).map((v, i) => (
                <ProfileAvatar
                  key={i}
                  avatarUrl={v.avatar_url}
                  username={v.username}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/60 ring-1 ring-white/[0.06]">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 via-red-400 to-white/20"
            initial={false}
            animate={{ width: `${percentA}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        <p className="mt-3 text-center font-mono text-xs text-[var(--text-secondary)]">
          {battle.votes_a + battle.votes_b} total votes
        </p>
      </motion.article>
    </Link>
  );
}
