import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "hype"
    | "dead"
    | "gold"
    | "neon"
    | "outline"
    | "live"
    | "rare"
    | "epic"
    | "legendary"
    | "mythic";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-label",
        variant === "default" &&
          "border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text-2)]",
        variant === "hype" &&
          "border border-hype/40 bg-hype/15 text-hype",
        variant === "live" && "pill-live",
        variant === "dead" &&
          "border border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text-3)]",
        variant === "gold" &&
          "border border-gold/30 bg-gold/10 text-gold",
        variant === "neon" &&
          "border border-neon/30 bg-neon/10 text-neon",
        variant === "outline" &&
          "border border-[var(--border-bright)] text-[var(--text-2)]",
        variant === "rare" && "border border-rare/30 bg-rare/10 text-rare",
        variant === "epic" && "border border-epic/30 bg-epic/10 text-epic",
        variant === "legendary" &&
          "border border-legendary/30 bg-legendary/10 text-legendary",
        variant === "mythic" &&
          "border border-mythic/30 bg-mythic/10 text-mythic",
        className
      )}
      {...props}
    />
  );
}
