"use client";

import { cn } from "@/lib/utils";

interface BottomHeatBarProps {
  velocity: number;
  isDead?: boolean;
  forceHot?: boolean;
}

export function BottomHeatBar({
  velocity,
  isDead = false,
  forceHot = false,
}: BottomHeatBarProps) {
  const intensity = Math.min(Math.max(velocity, 0) / 20, 1);
  const isHot = forceHot || (!isDead && velocity > 2);
  const glowBlur = isHot ? Math.round(4 + intensity * 16) : 0;
  const glowSpread = isHot ? Math.round(2 + intensity * 8) : 0;
  const pulseDuration = velocity > 10 ? "0.8s" : velocity > 5 ? "1.2s" : "1.8s";

  return (
    <div
      className={cn(
        "heat-bar-bottom",
        isDead && !forceHot && "is-dead",
        isHot && "is-pulse"
      )}
      style={
        isHot
          ? ({
              boxShadow: `0 0 ${glowBlur}px ${glowSpread}px var(--hype-glow)`,
              ["--pulse-duration" as string]: pulseDuration,
            } as React.CSSProperties)
          : undefined
      }
      aria-hidden
    />
  );
}
