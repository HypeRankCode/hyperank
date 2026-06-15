"use client";

interface StreakDisplayProps {
  days: number;
}

export function StreakDisplay({ days }: StreakDisplayProps) {
  if (days === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        No active streak. Vote today to begin.
      </p>
    );
  }

  return (
    <div>
      <p className="font-display text-3xl font-semibold tabular-nums text-zinc-100">
        {days}
      </p>
      <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
        consecutive {days === 1 ? "day" : "days"}
      </p>
    </div>
  );
}
