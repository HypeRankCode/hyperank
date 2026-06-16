import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-xl" },
  lg: { icon: 52, text: "text-3xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-500/30 blur-md transition group-hover:bg-red-500/50" />
        <Image
          src="/hyperank_icon.png"
          alt="HypeRank"
          width={s.icon}
          height={s.icon}
          className="relative drop-shadow-[0_0_12px_rgba(255,43,43,0.6)]"
        />
      </div>
      {showText && (
        <span className={cn("font-display font-extrabold tracking-tight", s.text)}>
          Hype<span className="text-gradient-fire">Rank</span>
        </span>
      )}
    </Link>
  );
}
