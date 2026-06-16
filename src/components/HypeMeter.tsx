"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HypeMeterProps {
  hypePercent: number;
  className?: string;
}

export function HypeMeter({ hypePercent, className }: HypeMeterProps) {
  const reduced = useReducedMotion();

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="hype-meter flex-1">
        <motion.div
          className="hype-meter-fill"
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${hypePercent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <span className="font-display text-sm font-bold text-[var(--text-1)] tabular-nums">
        {hypePercent}%
      </span>
    </div>
  );
}
