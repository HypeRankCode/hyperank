"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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

  async function vote(trendId: string) {
    const res = await fetch(`/api/battles/${battleId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ voted_for: trendId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed");
      return;
    }
    setVoted(true);
    window.location.reload();
  }

  if (voted) return <p className="mt-6 text-center text-neon">Vote recorded.</p>;

  return (
    <div className="mt-8 flex gap-4">
      <Button className="flex-1" onClick={() => vote(trendAId)}>
        Vote {trendAName}
      </Button>
      <Button className="flex-1" variant="secondary" onClick={() => vote(trendBId)}>
        Vote {trendBName}
      </Button>
      {error && <p className="text-sm text-hype">{error}</p>}
    </div>
  );
}
