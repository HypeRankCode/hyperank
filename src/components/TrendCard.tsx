"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import type { Trend } from "@/lib/types/database";
import { calcHypePercent } from "@/lib/hype-score";
import { HeatBar } from "./HeatBar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { PredictionModal } from "./PredictionModal";
import { useUserStore } from "@/stores/useUserStore";

interface TrendCardProps {
  trend: Trend;
  userVote?: "hype" | "dead" | null;
  hotTakeCount?: number;
  showAdAfter?: boolean;
}

export function TrendCard({
  trend,
  userVote: initialVote,
  hotTakeCount = 0,
}: TrendCardProps) {
  const [hypeVotes, setHypeVotes] = useState(trend.hype_votes);
  const [deadVotes, setDeadVotes] = useState(trend.dead_votes);
  const [userVote, setUserVote] = useState(initialVote);
  const [loading, setLoading] = useState(false);
  const [predictOpen, setPredictOpen] = useState(false);
  const { setUserVote: storeVote, updateCredits, profile } = useUserStore();

  const hypePercent = calcHypePercent(hypeVotes, deadVotes);
  const velocity = trend.vote_velocity;

  async function vote(type: "hype" | "dead") {
    if (userVote || loading) return;
    setLoading(true);

    const prevHype = hypeVotes;
    const prevDead = deadVotes;
    if (type === "hype") setHypeVotes((v) => v + 1);
    else setDeadVotes((v) => v + 1);
    setUserVote(type);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trend_id: trend.id, vote_type: type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      storeVote(trend.id, type);
      if (data.bonus_credits && profile) {
        updateCredits(profile.credits + data.bonus_credits);
        confetti({
          particleCount: 80,
          spread: 60,
          colors: ["#ff3c6e", "#ffd700", "#00f5a0"],
        });
      }
    } catch {
      setHypeVotes(prevHype);
      setDeadVotes(prevDead);
      setUserVote(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <motion.article
        className={`card-glass-hover relative overflow-hidden p-5 ${
          trend.is_daily_drop ? "ring-1 ring-hype/50" : ""
        }`}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {trend.is_daily_drop && (
          <Badge variant="hype" className="mb-2">
            Today&apos;s drop
          </Badge>
        )}
        {trend.is_sponsored && (
          <Badge variant="outline" className="absolute right-4 top-4 text-[10px]">
            Sponsored
          </Badge>
        )}

        <Link href={`/trends/${trend.slug}`}>
          <h3 className="font-display text-lg font-bold hover:text-hype">
            {trend.name}
          </h3>
        </Link>
        {trend.description && (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">
            {trend.description}
          </p>
        )}

        <div className="mt-3 flex items-center gap-2">
          {velocity > 8 && <Badge variant="hype">Rising</Badge>}
          {velocity > 0 && velocity <= 3 && <Badge variant="dead">Fading</Badge>}
          {hotTakeCount > 0 && (
            <span className="text-xs text-[var(--text-secondary)]">
              {hotTakeCount} takes
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-mono text-hype">{hypePercent}% hype</span>
          <span className="text-[var(--text-secondary)]">
            {hypeVotes + deadVotes} votes
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <motion.div className="flex-1" whileTap={{ scale: 0.9 }}>
            <Button
              className="w-full"
              variant={userVote === "hype" ? "default" : "secondary"}
              disabled={!!userVote || loading}
              onClick={() => vote("hype")}
            >
              Hype
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileTap={{ scale: 0.9 }}>
            <Button
              className="w-full"
              variant={userVote === "dead" ? "dead" : "secondary"}
              disabled={!!userVote || loading}
              onClick={() => vote("dead")}
            >
              Dead
            </Button>
          </motion.div>
          <Button variant="outline" size="sm" onClick={() => setPredictOpen(true)}>
            Predict
          </Button>
        </div>

        {trend.is_sponsored && trend.sponsor_cta_url && (
          <a
            href={trend.sponsor_cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-full border border-[var(--border)] py-2 text-center text-sm hover:border-hype/50"
          >
            {trend.sponsor_cta_label ?? "Learn more"}
          </a>
        )}

        <div className="mt-4">
          <HeatBar velocity={velocity} hypePercent={hypePercent} />
        </div>
      </motion.article>

      <PredictionModal
        open={predictOpen}
        onClose={() => setPredictOpen(false)}
        trendId={trend.id}
        trendName={trend.name}
      />
    </>
  );
}
