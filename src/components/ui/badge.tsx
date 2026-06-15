import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hype" | "dead" | "gold" | "neon" | "outline" | "live";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
        variant === "default" && "border border-white/10 bg-white/5 text-[var(--text-secondary)]",
        variant === "hype" && "border border-red-500/40 bg-red-500/15 text-red-400",
        variant === "live" && "pill-live",
        variant === "dead" && "border border-white/10 bg-white/5 text-[var(--text-secondary)]",
        variant === "gold" && "border border-yellow-500/30 bg-yellow-500/10 text-gold",
        variant === "neon" && "border border-emerald-500/30 bg-emerald-500/10 text-neon",
        variant === "outline" && "border border-white/15 text-[var(--text-secondary)]",
        className
      )}
      {...props}
    />
  );
}
