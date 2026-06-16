import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VelocityPillProps {
  velocity: number;
  className?: string;
}

export function VelocityPill({ velocity, className }: VelocityPillProps) {
  const isRising = velocity > 3;
  const isCooling = velocity > 0 && velocity <= 3;

  if (!isRising && !isCooling) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        isRising
          ? "border border-neon/30 bg-neon/10 text-neon"
          : "border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text-3)]",
        className
      )}
    >
      {isRising ? (
        <TrendingUp className="h-3 w-3" aria-hidden />
      ) : (
        <TrendingDown className="h-3 w-3" aria-hidden />
      )}
      {isRising ? `Rising +${Math.round(velocity)}/hr` : "Cooling"}
    </div>
  );
}
