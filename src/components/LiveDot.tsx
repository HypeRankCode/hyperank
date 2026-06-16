import { cn } from "@/lib/utils";

interface LiveDotProps {
  className?: string;
  size?: "sm" | "md";
}

export function LiveDot({ className, size = "sm" }: LiveDotProps) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full bg-neon",
        size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2",
        "animate-live-pulse shadow-neon",
        className
      )}
      aria-hidden
    />
  );
}
