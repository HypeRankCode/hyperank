"use client";

import { useUserStore } from "@/stores/useUserStore";
import { NumberPop } from "./NumberPop";
import { Zap } from "lucide-react";

export function CreditDisplay() {
  const profile = useUserStore((s) => s.profile);
  const user = useUserStore((s) => s.user);

  if (!user) return null;

  const credits = profile?.credits ?? null;
  if (credits === null) {
    return (
      <div className="h-8 w-16 animate-pulse rounded-full bg-[var(--bg-raised)]" />
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-sm text-gold"
      aria-label={`${credits} credits`}
    >
      <Zap className="h-3.5 w-3.5 fill-current" aria-hidden />
      <NumberPop value={credits} className="font-bold" />
    </div>
  );
}
