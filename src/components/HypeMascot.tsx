"use client";

import dynamic from "next/dynamic";

const HypeMascotScene = dynamic(
  () =>
    import("./mascot/HypeMascotScene").then((m) => ({
      default: m.HypeMascotScene,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-32 w-32 animate-pulse rounded-full bg-red-500/20" />
      </div>
    ),
  }
);

interface HypeMascotProps {
  size?: "hero" | "md" | "sm";
  className?: string;
}

const SIZES = {
  hero: "h-[360px] w-[360px] md:h-[420px] md:w-[420px]",
  md: "h-40 w-40",
  sm: "h-24 w-24",
};

export function HypeMascot({ size = "hero", className = "" }: HypeMascotProps) {
  return (
    <div
      className={`relative overflow-visible ${SIZES[size]} ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 rounded-full bg-red-500/25 blur-[70px]" />
      <div className="relative h-full w-full overflow-visible pt-4 animate-float drop-shadow-[0_0_50px_rgba(255,43,43,0.45)]">
        <HypeMascotScene size={size} />
      </div>
    </div>
  );
}
