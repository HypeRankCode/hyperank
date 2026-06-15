import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 26, text: "text-base" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 44, text: "text-2xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <Image
        src="/hyperank_icon.png"
        alt="HypeRank"
        width={s.icon}
        height={s.icon}
        className="rounded-md"
      />
      {showText && (
        <span className={cn("font-display font-semibold tracking-tight", s.text)}>
          Hype<span className="text-[var(--accent-hype)]">Rank</span>
        </span>
      )}
    </Link>
  );
}
