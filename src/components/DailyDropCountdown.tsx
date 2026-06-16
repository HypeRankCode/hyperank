"use client";

import { useEffect, useState } from "react";

function getMsUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

function formatCountdown(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export function DailyDropCountdown() {
  const [remaining, setRemaining] = useState(getMsUntilMidnightUTC());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(getMsUntilMidnightUTC());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#00e676]" />
      <span className="font-mono text-sm text-emerald-400">
        Next drop in {formatCountdown(remaining)}
      </span>
    </div>
  );
}
