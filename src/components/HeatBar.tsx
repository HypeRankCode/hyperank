"use client";

import { cn } from "@/lib/utils";

interface HeatBarProps {
  velocity: number;
  hypePercent: number;
}

export function HeatBar({ velocity, hypePercent }: HeatBarProps) {
  const isHot = velocity > 5;

  return (
    <div>
      <div className="heat-bar relative h-1.5 w-full overflow-hidden rounded-full">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            isHot
              ? "bg-[var(--accent-hype)]"
              : "bg-zinc-500"
          )}
          style={{ width: `${hypePercent}%` }}
        />
      </div>
    </div>
  );
}
