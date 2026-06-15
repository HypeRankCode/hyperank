"use client";

import { Flame } from "lucide-react";

interface StreakDisplayProps {
  days: number;
}

export function StreakDisplay({ days }: StreakDisplayProps) {
  if (days === 0) {
    return (
      <p className="text-[var(--text-secondary)]">
        No streak. Vote today to start one.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Flame className="h-5 w-5 text-gold" />
      <span className="font-mono text-2xl font-bold text-gold">{days}</span>
      <span className="text-[var(--text-secondary)]">day streak</span>
    </div>
  );
}
