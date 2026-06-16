import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: "h-7 w-7 text-xs", text: "text-lg" },
  md: { box: "h-9 w-9 text-sm", text: "text-xl" },
  lg: { box: "h-12 w-12 text-base", text: "text-3xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-hype font-display font-extrabold text-white shadow-hype-sm transition group-hover:shadow-hype",
          s.box
        )}
        aria-hidden
      >
        HR
      </div>
      {showText && (
        <span
          className={cn(
            "font-display font-extrabold tracking-tight text-[var(--text-1)]",
            s.text
          )}
        >
          HypeRank
        </span>
      )}
    </Link>
  );
}
