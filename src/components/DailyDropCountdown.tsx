"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

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
    const tick = () => setRemaining(getMsUntilMidnightUTC());
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-2">
      <Clock className="h-4 w-4 text-gold" aria-hidden />
      <span className="font-display text-sm font-bold text-gold">
        Next drop in {formatCountdown(remaining)}
      </span>
    </div>
  );
}
