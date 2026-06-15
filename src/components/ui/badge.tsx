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
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        variant === "default" &&
          "border border-[var(--border-subtle)] bg-zinc-900 text-[var(--text-secondary)]",
        variant === "hype" &&
          "border border-red-500/20 bg-red-500/10 text-red-400",
        variant === "live" && "pill-live",
        variant === "dead" &&
          "border border-zinc-700 bg-zinc-800/80 text-zinc-400",
        variant === "gold" &&
          "border border-yellow-600/20 bg-yellow-500/10 text-[var(--accent-gold)]",
        variant === "neon" &&
          "border border-emerald-600/20 bg-emerald-500/10 text-emerald-400",
        variant === "outline" &&
          "border border-[var(--border-subtle)] text-[var(--text-secondary)]",
        className
      )}
      {...props}
    />
  );
}
