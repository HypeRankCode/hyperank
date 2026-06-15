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
    <span className="font-mono text-sm text-neon">
      Next drop in {formatCountdown(remaining)}
    </span>
  );
}
