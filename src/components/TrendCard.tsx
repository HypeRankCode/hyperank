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
  const totalVotes = hypeVotes + deadVotes;

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
          colors: ["#ff2b2b", "#ffc933", "#00e676"],
          origin: { y: 0.7 },
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
        className={`surface-card-hover group relative overflow-hidden p-6 ${
          trend.is_daily_drop
            ? "border-red-500/30 shadow-hype-sm"
            : ""
        }`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {/* Corner glow on daily drops */}
        {trend.is_daily_drop && (
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-500/20 blur-3xl" />
        )}

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {trend.is_daily_drop && (
              <Badge variant="hype" className="mb-2">
                Today&apos;s drop
              </Badge>
            )}
            <Link href={`/trends/${trend.slug}`}>
              <h3 className="font-display text-xl font-bold transition-colors group-hover:text-red-400">
                {trend.name}
              </h3>
            </Link>
            {trend.description && (
              <p className="mt-1.5 line-clamp-2 text-sm text-[var(--text-secondary)]">
                {trend.description}
              </p>
            )}
          </div>
          {trend.is_sponsored && (
            <Badge variant="outline" className="shrink-0">
              Sponsored
            </Badge>
          )}
        </div>

        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          {velocity > 8 && <Badge variant="live">Rising</Badge>}
          {velocity > 0 && velocity <= 3 && (
            <Badge variant="dead">Cooling off</Badge>
          )}
          {hotTakeCount > 0 && (
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              {hotTakeCount} takes
            </span>
          )}
        </div>

        {/* Hype meter */}
        <div className="relative mt-5">
          <div className="mb-2 flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-extrabold text-red-400">
                {hypePercent}
              </span>
              <span className="text-sm text-[var(--text-secondary)]">% hype</span>
            </div>
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              {totalVotes.toLocaleString()} votes
            </span>
          </div>
          <HeatBar velocity={velocity} hypePercent={hypePercent} />
        </div>

        <div className="relative mt-5 flex gap-2">
          <motion.div className="flex-1" whileTap={{ scale: 0.92 }}>
            <Button
              className={`w-full ${
                userVote === "hype"
                  ? "shadow-hype"
                  : ""
              }`}
              variant={userVote === "hype" ? "default" : "secondary"}
              disabled={!!userVote || loading}
              onClick={() => vote("hype")}
            >
              🔥 Hype
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileTap={{ scale: 0.92 }}>
            <Button
              className="w-full"
              variant={userVote === "dead" ? "dead" : "secondary"}
              disabled={!!userVote || loading}
              onClick={() => vote("dead")}
            >
              💀 Dead
            </Button>
          </motion.div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPredictOpen(true)}
            title="Predict"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </Button>
        </div>

        {trend.is_sponsored && trend.sponsor_cta_url && (
          <a
            href={trend.sponsor_cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-xl border border-white/10 py-2.5 text-center text-sm transition-colors hover:border-red-500/40 hover:bg-red-500/5"
          >
            {trend.sponsor_cta_label ?? "Learn more"}
          </a>
        )}
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
