import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hype" | "dead" | "gold" | "neon" | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-[var(--bg-elevated)] text-[var(--text-secondary)]",
        variant === "hype" && "bg-hype/20 text-hype",
        variant === "dead" && "bg-dead/40 text-[var(--text-secondary)]",
        variant === "gold" && "bg-gold/20 text-gold",
        variant === "neon" && "bg-neon/20 text-neon",
        variant === "outline" && "border border-[var(--border)] text-[var(--text-secondary)]",
        className
      )}
      {...props}
    />
  );
}
