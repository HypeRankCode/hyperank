"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ProfileAvatar } from "./ProfileAvatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { LiveDot } from "./LiveDot";
import { cn } from "@/lib/utils";

interface BattleWithTrends {
  id: string;
  votes_a: number;
  votes_b: number;
  ends_at: string;
  status?: string;
  trend_a: { id: string; name: string; slug: string };
  trend_b: { id: string; name: string; slug: string };
}

interface BattleCardProps {
  battle: BattleWithTrends;
  compact?: boolean;
  className?: string;
}

function formatTimeLeft(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ending soon";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export function BattleCard({ battle, compact = false, className }: BattleCardProps) {
  const reduced = useReducedMotion();
  const total = battle.votes_a + battle.votes_b || 1;
  const percentA = Math.round((battle.votes_a / total) * 100);
  const isLive = battle.status === "active";
  const timeLeft = formatTimeLeft(battle.ends_at);

  return (
    <motion.article
      className={cn("surface-card-hover relative overflow-hidden p-6", className)}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduced ? undefined : { scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span aria-hidden>⚔️</span>
          <span className="text-label text-[var(--text-2)]">
            {isLive ? "Battle Live" : "Battle"}
          </span>
          {isLive && <LiveDot />}
        </div>
        <span className="font-display text-sm font-bold text-gold">{timeLeft}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <p className="font-display text-lg font-bold text-[var(--text-1)]">
            {battle.trend_a.name}
          </p>
          <p className="font-display text-2xl font-extrabold text-hype">{percentA}%</p>
        </div>
        <span className="font-display text-xl font-extrabold text-[var(--text-3)]">
          VS
        </span>
        <div className="text-right">
          <p className="font-display text-lg font-bold text-[var(--text-1)]">
            {battle.trend_b.name}
          </p>
          <p className="font-display text-2xl font-extrabold text-[var(--text-2)]">
            {100 - percentA}%
          </p>
        </div>
      </div>

      <div className="mt-4">
        <Progress value={percentA} variant="battle" />
      </div>

      {!compact && (
        <div className="mt-5 flex gap-3">
          <Button asChild className="flex-1" size="sm">
            <Link href={`/battles/${battle.id}`}>
              Vote {battle.trend_a.name}
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1" size="sm">
            <Link href={`/battles/${battle.id}`}>
              Vote {battle.trend_b.name}
            </Link>
          </Button>
        </div>
      )}

      {compact && (
        <Link
          href={`/battles/${battle.id}`}
          className="mt-4 block text-center text-body-sm text-hype hover:underline"
        >
          Join the battle →
        </Link>
      )}
    </motion.article>
  );
}
