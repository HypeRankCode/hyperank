"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeatBarProps {
  velocity: number;
  hypePercent: number;
}

export function HeatBar({ velocity, hypePercent }: HeatBarProps) {
  const intensity = Math.min(velocity / 20, 1);
  return (
    <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
      <motion.div
        className={cn(
          "absolute inset-y-0 left-0 rounded-full",
          velocity > 5
            ? "bg-gradient-to-r from-hype to-neon"
            : "bg-gradient-to-r from-dead to-[var(--border)]"
        )}
        style={{
          width: `${hypePercent}%`,
          boxShadow:
            intensity > 0.3
              ? `0 0 ${8 + intensity * 12}px rgba(255,60,110,${0.4 + intensity * 0.4})`
              : undefined,
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}
