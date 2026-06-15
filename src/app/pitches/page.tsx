import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getActivePitches,
  getRecentWinningPitches,
  getUserPitchVotes,
} from "@/lib/supabase/pitches";
import { PageShell } from "@/components/PageShell";
import { PitchCard } from "@/components/pitches/PitchCard";
import { PitchSubmitForm } from "@/components/pitches/PitchSubmitForm";
import { DailyDropCountdown } from "@/components/DailyDropCountdown";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Auditions — HypeRank",
  description:
    "Pitch the next viral trend. Community votes pick today's featured drop.",
};

export default async function PitchesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [activePitches, recentWinners] = await Promise.all([
    getActivePitches(50),
    getRecentWinningPitches(7),
  ]);

  let votedPitchIds = new Set<string>();
  if (user) {
    votedPitchIds = await getUserPitchVotes(user.id);
  }

  return (
    <PageShell wide>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge variant="live" className="mb-3">
            Community auditions
          </Badge>
          <h1 className="font-display text-3xl font-extrabold text-white md:text-4xl">
            Pitch the next hype thing
          </h1>
          <p className="mt-2 max-w-xl text-[var(--text-secondary)]">
            Post your idea, rally votes, and go viral. The top pitch becomes
            today&apos;s featured drop — winners can&apos;t repeat for 7 days.
          </p>
        </div>
        <DailyDropCountdown />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="surface-card overflow-hidden rounded-2xl">
          <div className="border-b border-white/[0.06] px-4 py-3 md:px-6">
            <h2 className="font-display text-lg font-bold">Live auditions</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Sorted by votes · resets at midnight UTC
            </p>
          </div>

          {activePitches.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-secondary)]">
              No pitches yet — be the first to audition.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {activePitches.map((pitch, i) => (
                <PitchCard
                  key={pitch.id}
                  pitch={pitch}
                  rank={i + 1}
                  userVoted={votedPitchIds.has(pitch.id)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="surface-card rounded-2xl p-5">
            <h2 className="font-display text-lg font-bold">Submit yours</h2>
            <p className="mt-1 mb-4 text-xs text-[var(--text-secondary)]">
              One idea per topic while it&apos;s active. Winners enter a 7-day
              cooldown.
            </p>
            <PitchSubmitForm />
          </div>

          {recentWinners.length > 0 && (
            <div className="surface-card overflow-hidden rounded-2xl">
              <div className="border-b border-white/[0.06] px-4 py-3">
                <h2 className="font-display text-sm font-bold">Recent winners</h2>
              </div>
              <div className="divide-y divide-white/[0.06]">
                {recentWinners.map((pitch) => (
                  <PitchCard
                    key={pitch.id}
                    pitch={pitch}
                    compact
                    userVoted={votedPitchIds.has(pitch.id)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-[var(--text-secondary)]">
            <p className="font-medium text-white">How it works</p>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              <li>Pitch a trend you think will blow up</li>
              <li>Others upvote their favorites all day</li>
              <li>Top vote at midnight becomes the featured drop</li>
              <li>Creator gets credit + 50 bonus credits</li>
            </ol>
            <Link
              href="/"
              className="mt-3 inline-block text-red-400 hover:text-red-300"
            >
              Back to home →
            </Link>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
