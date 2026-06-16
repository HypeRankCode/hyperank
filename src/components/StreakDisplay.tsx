"use client";

interface StreakDisplayProps {
  days: number;
}

export function StreakDisplay({ days }: StreakDisplayProps) {
  if (days === 0) {
    return (
      <p className="text-body-sm text-[var(--text-2)]">
        No streak yet. Vote once to start.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 text-xl">
        🔥
      </div>
      <div>
        <p className="font-display text-3xl font-extrabold text-gold">{days}</p>
        <p className="text-body-sm text-[var(--text-3)]">day streak</p>
      </div>
    </div>
  );
}
