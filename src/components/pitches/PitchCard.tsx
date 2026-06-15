"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { HypePitchWithAuthor } from "@/lib/types/database";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { cn } from "@/lib/utils";

interface PitchCardProps {
  pitch: HypePitchWithAuthor;
  userVoted?: boolean;
  rank?: number;
  compact?: boolean;
}

export function PitchCard({
  pitch,
  userVoted: initialVoted = false,
  rank,
  compact = false,
}: PitchCardProps) {
  const [voteCount, setVoteCount] = useState(pitch.vote_count);
  const [voted, setVoted] = useState(initialVoted);
  const [loading, setLoading] = useState(false);
  const requireAuth = useRequireAuth();

  async function vote() {
    if (voted || loading) return;
    if (!requireAuth("Sign in to vote on auditions")) return;

    setLoading(true);
    setVoteCount((c) => c + 1);
    setVoted(true);

    try {
      const res = await fetch(`/api/pitches/${pitch.id}/vote`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setVoteCount((c) => c - 1);
        setVoted(false);
      } else if (data.vote_count != null) {
        setVoteCount(data.vote_count);
      }
    } catch {
      setVoteCount((c) => c - 1);
      setVoted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article
      className={cn(
        "group flex gap-3 transition-colors",
        compact ? "p-3" : "p-4 md:p-5",
        pitch.status === "won" && "bg-gradient-to-r from-yellow-500/5 to-transparent"
      )}
    >
      {rank != null && (
        <div className="flex w-8 shrink-0 flex-col items-center pt-1">
          <span
            className={cn(
              "font-display text-lg font-bold",
              rank === 1 ? "text-gold" : "text-[var(--text-secondary)]"
            )}
          >
            {rank}
          </span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/u/${pitch.author.username}`}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <ProfileAvatar
              avatarUrl={pitch.author.avatar_url}
              username={pitch.author.username}
              size="xs"
            />
            <span className="text-sm font-medium text-white">
              {pitch.author.display_name ?? pitch.author.username}
            </span>
          </Link>
          {pitch.status === "won" && (
            <Badge variant="gold" className="text-[10px]">
              Today&apos;s pick
            </Badge>
          )}
          <span className="text-xs text-[var(--text-secondary)]">
            {formatDistanceToNow(new Date(pitch.created_at), { addSuffix: true })}
          </span>
        </div>

        <h3
          className={cn(
            "mt-1.5 font-display font-bold text-white",
            compact ? "text-base" : "text-lg"
          )}
        >
          {pitch.title}
        </h3>

        {pitch.description && !compact && (
          <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
            {pitch.description}
          </p>
        )}

        {pitch.trend_id && pitch.status === "won" && (
          <Link
            href={`/trends`}
            className="mt-2 inline-block text-xs font-medium text-red-400 hover:text-red-300"
          >
            Vote on it in today&apos;s drop →
          </Link>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant={voted ? "secondary" : "glow"}
          disabled={voted || loading || pitch.status !== "active"}
          onClick={vote}
          className={cn(
            "min-w-[3.5rem] flex-col gap-0 py-2 h-auto",
            voted && "opacity-80"
          )}
        >
          <span className="text-base leading-none">▲</span>
          <span className="font-mono text-sm font-bold">
            {voteCount.toLocaleString()}
          </span>
        </Button>
      </div>
    </article>
  );
}
