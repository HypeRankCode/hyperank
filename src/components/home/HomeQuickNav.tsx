import Link from "next/link";
import { cn } from "@/lib/utils";

const actions = [
  { href: "/trends", label: "Vote", emoji: "🔥" },
  { href: "/pitches", label: "Auditions", emoji: "🎤" },
  { href: "/battles", label: "Battles", emoji: "⚔️" },
  { href: "/leaderboard", label: "Ranks", emoji: "🏆" },
  { href: "/shop/drop", label: "Shop", emoji: "✨" },
];

export function HomeQuickNav() {
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border border-white/10",
            "bg-white/[0.04] px-4 py-2 text-sm font-medium text-white",
            "transition-all hover:border-red-500/30 hover:bg-red-500/10"
          )}
        >
          <span>{action.emoji}</span>
          {action.label}
        </Link>
      ))}
    </div>
  );
}
