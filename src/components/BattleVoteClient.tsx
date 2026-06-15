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
}

export function BattleVoteClient({
  battleId,
  trendAId,
  trendBId,
  trendAName,
  trendBName,
}: Props) {
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState("");
  const requireAuth = useRequireAuth();
  const showAuthModal = useAuthModalStore((s) => s.show);

  async function vote(trendId: string) {
    if (!requireAuth("Sign in to vote in battles")) return;

    const res = await fetch(`/api/battles/${battleId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voted_for: trendId }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401) showAuthModal("Sign in to vote");
      else setError(data.error ?? "Failed");
      return;
    }
    setVoted(true);
    window.location.reload();
  }

  if (voted) return <p className="mt-6 text-center text-neon">Vote recorded.</p>;

  return (
    <div className="mt-8">
      <div className="flex gap-4">
        <Button className="flex-1" onClick={() => vote(trendAId)}>
          Vote {trendAName}
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          onClick={() => vote(trendBId)}
        >
          Vote {trendBName}
        </Button>
      </div>
      {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}
