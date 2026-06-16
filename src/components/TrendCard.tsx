"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import type { Trend } from "@/lib/types/database";
import { calcHypePercent } from "@/lib/hype-score";
import { BottomHeatBar } from "./BottomHeatBar";
import { VelocityPill } from "./VelocityPill";
import { HypeMeter } from "./HypeMeter";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useUserStore } from "@/stores/useUserStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthModalStore } from "@/stores/useAuthModalStore";
import { cn } from "@/lib/utils";

interface TrendCardProps {
  trend: Trend;
  userVote?: "hype" | "dead" | null;
  variant?: "default" | "daily" | "featured";
  className?: string;
}

export function TrendCard({
  trend,
  userVote: initialVote,
  variant = "default",
  className,
}: TrendCardProps) {
  const reduced = useReducedMotion();
  const [hypeVotes, setHypeVotes] = useState(trend.hype_votes);
  const [deadVotes, setDeadVotes] = useState(trend.dead_votes);
  const [userVote, setUserVote] = useState(initialVote);
  const { setUserVote: storeVote, updateCredits, profile } = useUserStore();
  const requireAuth = useRequireAuth();
  const showAuthModal = useAuthModalStore((s) => s.show);

  const hypePercent = calcHypePercent(hypeVotes, deadVotes);
  const velocity = trend.vote_velocity;
  const totalVotes = hypeVotes + deadVotes;
  const isDaily = variant === "daily" || trend.is_daily_drop;
  const isCooling = velocity <= 0 || hypePercent < 40;
  const isFlipped = isDaily && !!userVote;

  async function vote(type: "hype" | "dead") {
    if (userVote) return;
    if (!requireAuth("Sign in to vote on trends")) return;

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
      if (!res.ok) {
        if (res.status === 401) {
          showAuthModal("Sign in to vote");
          throw new Error("auth");
        }
        if (res.status === 409) {
          toast("Already voted on this one.");
          throw new Error("duplicate");
        }
        throw new Error(data.error ?? "Vote failed");
      }

      toast.success("Vote counted.");
      storeVote(trend.id, type);
      if (data.bonus_credits && profile) {
        updateCredits(profile.credits + data.bonus_credits);
        confetti({
          particleCount: 80,
          spread: 60,
          colors: ["#ff2d6b", "#f0c040", "#00e5a0"],
          origin: { y: 0.6 },
        });
      }
    } catch (e) {
      setHypeVotes(prevHype);
      setDeadVotes(prevDead);
      setUserVote(null);
      if (e instanceof Error && e.message !== "auth" && e.message !== "duplicate") {
        toast.error("Something went wrong. Try again.");
      }
    }
  }

  const cardContent = (
    <div className="relative flex h-full flex-col p-5 pb-6">
      <div className="absolute right-4 top-4">
        <VelocityPill velocity={velocity} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5 pr-24">
        {isDaily && (
          <Badge variant="gold" className="normal-case tracking-normal">
            Today&apos;s drop
          </Badge>
        )}
        {trend.is_community_pick && <Badge variant="neon">Community pick</Badge>}
        {trend.is_sponsored && <Badge variant="outline">Sponsored</Badge>}
      </div>

      <Link href={`/trends/${trend.slug}`} className="group block min-w-0 flex-1">
        <h3 className="font-display text-xl font-bold text-[var(--text-1)] transition-colors group-hover:text-hype">
          {trend.name}
        </h3>
        {trend.description && (
          <p className="mt-1.5 line-clamp-2 text-body-sm text-[var(--text-2)]">
            {trend.description}
          </p>
        )}
      </Link>

      <div className="mt-4">
        <HypeMeter hypePercent={hypePercent} />
        <p className="mt-1.5 text-body-sm text-[var(--text-3)]">
          {totalVotes.toLocaleString()} votes
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <motion.div className="flex-1" whileTap={reduced ? undefined : { scale: 0.92 }}>
          <Button
            className={cn(
              "w-full",
              userVote === "hype" && "shadow-hype"
            )}
            variant={userVote === "hype" ? "default" : "outline"}
            disabled={!!userVote}
            onClick={() => vote("hype")}
            aria-label={`Vote hype on ${trend.name}`}
          >
            {userVote === "hype" ? "🔥 Hype ✓" : "🔥 Hype"}
          </Button>
        </motion.div>
        <motion.div className="flex-1" whileTap={reduced ? undefined : { scale: 0.92 }}>
          <Button
            className="w-full"
            variant={userVote === "dead" ? "dead" : "outline"}
            disabled={!!userVote}
            onClick={() => vote("dead")}
            aria-label={`Vote dead on ${trend.name}`}
          >
            {userVote === "dead" ? "💀 Dead ✓" : "💀 Dead"}
          </Button>
        </motion.div>
      </div>

      {userVote && (
        <p className="mt-2 text-center text-body-sm text-[var(--text-3)]">
          You voted {userVote} · {hypePercent}% agree
        </p>
      )}

      {trend.is_sponsored && trend.sponsor_cta_url && (
        <a
          href={trend.sponsor_cta_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 block rounded-xl border border-[var(--border)] py-2 text-center text-body-sm transition-colors hover:border-hype/40 hover:bg-hype/5"
        >
          {trend.sponsor_cta_label ?? "Learn more"}
        </a>
      )}

      <BottomHeatBar
        velocity={velocity}
        isDead={isCooling && !isDaily}
        forceHot={isDaily}
      />
    </div>
  );

  const backContent = (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center p-6">
      <p className="text-label text-[var(--text-3)]">Result</p>
      <p className="mt-2 font-display text-6xl font-extrabold text-hype">
        {hypePercent}%
      </p>
      <p className="mt-2 text-body-sm text-[var(--text-2)]">hype</p>
      <BottomHeatBar velocity={20} forceHot />
    </div>
  );

  if (isDaily) {
    return (
      <motion.article
        className={cn(
          "flip-card surface-card-hover relative min-h-[300px]",
          isDaily && "min-h-[320px]",
          className
        )}
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className={cn("flip-card-inner h-full", isFlipped && "is-flipped")}>
          <div className="flip-card-front h-full">{cardContent}</div>
          <div className="flip-card-back glass-card h-full">{backContent}</div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      className={cn("surface-card-hover relative", className)}
      initial={reduced ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduced ? undefined : { scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {cardContent}
    </motion.article>
  );
}
