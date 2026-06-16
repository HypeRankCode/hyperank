"use client";

import { useUserStore } from "@/stores/useUserStore";
import { NumberPop } from "./NumberPop";

export function StreakChip() {
  const profile = useUserStore((s) => s.profile);
  if (!profile || profile.streak_days === 0) return null;

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1.5 text-sm text-gold"
      aria-label={`${profile.streak_days} day streak`}
    >
      <span aria-hidden>🔥</span>
      <NumberPop value={profile.streak_days} className="font-bold" />
    </div>
  );
}
