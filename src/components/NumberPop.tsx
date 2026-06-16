"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NumberPopProps {
  value: number;
  className?: string;
  duration?: number;
  format?: (n: number) => string;
}

export function NumberPop({
  value,
  className,
  duration = 600,
  format = (n) => n.toLocaleString(),
}: NumberPopProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(reduced ? value : 0);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }

    if (started.current) {
      setDisplay(value);
      return;
    }
    started.current = true;

    const start = performance.now();
    const from = 0;
    const to = value;

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value, duration, reduced]);

  return (
    <span className={cn("font-display tabular-nums", className)}>
      {format(display)}
    </span>
  );
}
