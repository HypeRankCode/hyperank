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
          particleCount: 40,
          spread: 50,
          colors: ["#e82222", "#d4a017"],
          origin: { y: 0.8 },
          disableForReducedMotion: true,
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
      <article
        className={`surface-card-hover group p-5 ${
          trend.is_daily_drop ? "border-[var(--border-accent)]" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {trend.is_daily_drop && (
              <Badge variant="hype" className="mb-2.5">
                Daily drop
              </Badge>
            )}
            <Link href={`/trends/${trend.slug}`}>
              <h3 className="font-display text-lg font-semibold text-zinc-100 transition-colors group-hover:text-[var(--accent-hype)]">
                {trend.name}
              </h3>
            </Link>
            {trend.description && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
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

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {velocity > 8 && <Badge variant="live">Rising</Badge>}
          {velocity > 0 && velocity <= 3 && (
            <Badge variant="dead">Declining</Badge>
          )}
          {hotTakeCount > 0 && (
            <span className="text-xs text-[var(--text-secondary)]">
              {hotTakeCount} hot takes
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-end justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-semibold tabular-nums text-zinc-100">
                {hypePercent}%
              </span>
              <span className="text-xs text-[var(--text-secondary)]">hype</span>
            </div>
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              {totalVotes.toLocaleString()} votes
            </span>
          </div>
          <HeatBar velocity={velocity} hypePercent={hypePercent} />
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            className="flex-1"
            variant={userVote === "hype" ? "default" : "secondary"}
            disabled={!!userVote || loading}
            onClick={() => vote("hype")}
          >
            Hype
          </Button>
          <Button
            className="flex-1"
            variant={userVote === "dead" ? "dead" : "secondary"}
            disabled={!!userVote || loading}
            onClick={() => vote("dead")}
          >
            Dead
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPredictOpen(true)}
            title="Predict outcome"
            aria-label="Predict outcome"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </Button>
        </div>

        {trend.is_sponsored && trend.sponsor_cta_url && (
          <a
            href={trend.sponsor_cta_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-lg border border-[var(--border-subtle)] py-2 text-center text-sm text-[var(--text-secondary)] transition-colors hover:border-zinc-600 hover:text-zinc-200"
          >
            {trend.sponsor_cta_label ?? "Learn more"}
          </a>
        )}
      </article>

      <PredictionModal
        open={predictOpen}
        onClose={() => setPredictOpen(false)}
        trendId={trend.id}
        trendName={trend.name}
      />
    </>
  );
}
