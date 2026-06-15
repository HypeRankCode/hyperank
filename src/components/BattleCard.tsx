"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar3D } from "./Avatar3DClient";
import type { Profile } from "@/lib/types/database";

interface BattleWithTrends {
  id: string;
  votes_a: number;
  votes_b: number;
  ends_at: string;
  trend_a: { id: string; name: string; slug: string };
  trend_b: { id: string; name: string; slug: string };
  voters_a?: { avatar_rpm_url: string | null }[];
  voters_b?: { avatar_rpm_url: string | null }[];
}

export function BattleCard({ battle }: { battle: BattleWithTrends }) {
  const total = battle.votes_a + battle.votes_b || 1;
  const percentA = Math.round((battle.votes_a / total) * 100);

  return (
    <Link href={`/battles/${battle.id}`}>
      <motion.article
        className="card-glass-hover p-5"
        whileHover={{ scale: 1.01 }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="font-display font-bold">{battle.trend_a.name}</p>
            <div className="mt-2 flex justify-center gap-1">
              {(battle.voters_a ?? []).slice(0, 4).map((v, i) => (
                <Avatar3D
                  key={i}
                  modelUrl={v.avatar_rpm_url ?? ""}
                  size="small"
                />
              ))}
            </div>
          </div>
          <div className="text-center">
            <p className="font-display font-bold">{battle.trend_b.name}</p>
            <div className="mt-2 flex justify-center gap-1">
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

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
          <motion.div
            className="h-full bg-gradient-to-r from-hype to-dead"
            initial={false}
            animate={{ width: `${percentA}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>

        <p className="mt-2 text-center text-xs text-[var(--text-secondary)]">
          {percentA}% · {battle.votes_a + battle.votes_b} votes
        </p>
      </motion.article>
    </Link>
  );
}
