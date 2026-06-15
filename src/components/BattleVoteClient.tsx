"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useAuthModalStore } from "@/stores/useAuthModalStore";

interface Props {
  battleId: string;
  trendAId: string;
  trendBId: string;
  trendAName: string;
  trendBName: string;
  /** Server-known vote — prevents re-vote UI on return */
  initialVotedFor?: string | null;
  initialVotedName?: string | null;
}

export function BattleVoteClient({
  battleId,
  trendAId,
  trendBId,
  trendAName,
  trendBName,
  initialVotedFor = null,
  initialVotedName = null,
}: Props) {
  const [votedFor, setVotedFor] = useState<string | null>(initialVotedFor);
  const [votedName, setVotedName] = useState<string | null>(initialVotedName);
  const [error, setError] = useState("");
  const requireAuth = useRequireAuth();
  const showAuthModal = useAuthModalStore((s) => s.show);

  async function vote(trendId: string, name: string) {
    if (votedFor) return;
    if (!requireAuth("Sign in to vote in battles")) return;

    const res = await fetch(`/api/battles/${battleId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voted_for: trendId }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) showAuthModal("Sign in to vote");
      else if (res.status === 409) {
        setVotedFor(trendId);
        setVotedName(name);
      } else setError(data.error ?? "Failed");
      return;
    }
    setVotedFor(trendId);
    setVotedName(name);
  }

  if (votedFor) {
    return (
      <div className="mt-8 surface-card rounded-2xl p-6 text-center">
        <p className="font-display text-lg font-bold text-emerald-400">
          You voted for {votedName ?? "your pick"}
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          One vote per battle — you&apos;re locked in.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex gap-4">
        <Button className="flex-1" onClick={() => vote(trendAId, trendAName)}>
          Vote {trendAName}
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          onClick={() => vote(trendBId, trendBName)}
        >
          Vote {trendBName}
        </Button>
      </div>
      {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
