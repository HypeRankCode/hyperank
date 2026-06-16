"use client";

interface StreakDisplayProps {
  days: number;
}

export function StreakDisplay({ days }: StreakDisplayProps) {
  if (days === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        No streak yet. Vote today to start one.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-2xl shadow-hype-sm">
        🔥
      </div>
      <div>
        <p className="font-display text-4xl font-extrabold text-gold">{days}</p>
        <p className="text-xs text-[var(--text-secondary)]">day streak</p>
      </div>
    </div>
  );
}
