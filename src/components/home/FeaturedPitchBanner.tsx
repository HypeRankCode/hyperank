import Link from "next/link";
import type { HypePitchWithAuthor } from "@/lib/types/database";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { Badge } from "@/components/ui/badge";

interface FeaturedPitchBannerProps {
  pitch: HypePitchWithAuthor;
}

export function FeaturedPitchBanner({ pitch }: FeaturedPitchBannerProps) {
  return (
    <div className="relative overflow-hidden px-4 py-6 md:px-6 md:py-8">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-red-500/5 to-transparent" />
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/10 blur-3xl" />

      <div className="relative">
        <Badge variant="gold" className="mb-3">
          Community pick · featured today
        </Badge>

        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          Pitched by
        </p>
        <Link
          href={`/u/${pitch.author.username}`}
          className="mt-1 inline-flex items-center gap-2 hover:opacity-90"
        >
          <ProfileAvatar
            avatarUrl={pitch.author.avatar_url}
            username={pitch.author.username}
            size="sm"
            ring
          />
          <span className="font-display text-lg font-bold text-white">
            {pitch.author.display_name ?? pitch.author.username}
          </span>
        </Link>

        <h2 className="mt-4 font-display text-2xl font-extrabold leading-tight text-white md:text-3xl">
          {pitch.title}
        </h2>

        {pitch.description && (
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)] md:text-base">
            {pitch.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <span className="font-mono font-semibold text-gold">
            {pitch.vote_count.toLocaleString()} audition votes
          </span>
          {pitch.trend_id && (
            <Link
              href="/trends"
              className="font-medium text-red-400 hover:text-red-300"
            >
              Vote hype or dead →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
