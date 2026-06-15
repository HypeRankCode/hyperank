"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useUserStore } from "@/stores/useUserStore";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface PredictionModalProps {
  open: boolean;
  onClose: () => void;
  trendId: string;
  trendName: string;
}

export function PredictionModal({
  open,
  onClose,
  trendId,
  trendName,
}: PredictionModalProps) {
  const [outcome, setOutcome] = useState<"hype" | "dead">("hype");
  const [wager, setWager] = useState(10);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { profile, updateCredits } = useUserStore();
  const requireAuth = useRequireAuth();

  if (!open) return null;

  async function submit() {
    if (!requireAuth("Sign in to make predictions")) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trend_id: trendId,
          predicted_outcome: outcome,
          credits_wagered: wager,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.credits_remaining !== undefined) {
        updateCredits(data.credits_remaining);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="card-glass w-full max-w-sm p-6">
        <h3 className="font-display text-lg font-bold">Predict: {trendName}</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Win 1.8x back after 7 days. Min 10, max 200 credits.
        </p>

        <div className="mt-4 flex gap-2">
          <Button
            variant={outcome === "hype" ? "default" : "secondary"}
            className="flex-1"
            onClick={() => setOutcome("hype")}
          >
            Hype
          </Button>
          <Button
            variant={outcome === "dead" ? "dead" : "secondary"}
            className="flex-1"
            onClick={() => setOutcome("dead")}
          >
            Dead
          </Button>
        </div>

        <div className="mt-4">
          <label className="text-sm text-[var(--text-secondary)]">
            Wager ({profile?.credits ?? 0} available)
          </label>
          <Input
            type="number"
            min={10}
            max={200}
            value={wager}
            onChange={(e) => setWager(Number(e.target.value))}
            className="mt-1"
          />
        </div>

        {error && <p className="mt-2 text-sm text-hype">{error}</p>}

        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" disabled={loading} onClick={submit}>
            {loading ? "..." : "Predict"}
          </Button>
        </div>
      </div>
    </div>
  );
}
