"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeatBarProps {
  velocity: number;
  hypePercent: number;
}

export function HeatBar({ velocity, hypePercent }: HeatBarProps) {
  const intensity = Math.min(velocity / 20, 1);
  const isHot = velocity > 5;

  return (
    <div className="relative">
      <div className="heat-bar relative h-2 w-full overflow-hidden rounded-full bg-black/60 ring-1 ring-white/[0.06]">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isHot
              ? "bg-gradient-to-r from-red-600 via-red-400 to-emerald-400"
              : "bg-gradient-to-r from-[var(--accent-dead)] to-white/20"
          )}
          style={{
            width: `${hypePercent}%`,
            boxShadow: isHot
              ? `0 0 ${12 + intensity * 16}px rgba(255,43,43,${0.5 + intensity * 0.3})`
              : undefined,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${hypePercent}%`, opacity: [0.85, 1, 0.85] }}
          transition={{
            width: { type: "spring", stiffness: 120, damping: 20 },
            opacity: { duration: 2, repeat: Infinity },
          }}
        />
        {/* Dead side fill */}
        <div
          className="absolute inset-y-0 right-0 rounded-full bg-white/5"
          style={{ width: `${100 - hypePercent}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] uppercase tracking-wider text-[var(--text-secondary)]">
        <span className={isHot ? "text-red-400" : ""}>hype</span>
        <span>dead</span>
      </div>
    </div>
  );
}
