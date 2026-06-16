"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  variant?: "hype" | "battle";
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, variant = "hype", ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full",
          variant === "hype" ? "bg-dead" : "bg-[var(--bg-raised)]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            variant === "hype"
              ? "bg-hype"
              : "bg-gradient-to-r from-hype via-hype to-purple/60"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
