import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { ProfileHero } from "@/components/ProfileHero";
import { PageShell, SectionHeader } from "@/components/PageShell";
import type { Metadata } from "next";

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getProfileByUsername(params.username);
  if (!profile) return { title: "Profile | HypeRank" };
  return {
    title: `${profile.username} | HypeRank`,
    openGraph: { images: [`/api/og/profile/${params.username}`] },
  };
}

export default async function ProfilePage({ params }: Props) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) notFound();

  if (!profile.is_public) {
    return (
      <PageShell>
        <div className="surface-card rounded-2xl p-16 text-center">
          <p className="font-display text-2xl font-bold">Private profile</p>
          <p className="mt-2 text-[var(--text-secondary)]">
            This user has a private profile.
          </p>
        </div>
      </PageShell>
    );
  }

  const supabase = await createClient();
  const { data: votes } = await supabase
    .from("votes")
    .select("vote_type, trends(name, slug)")
    .eq("user_id", profile.id)
    .order("voted_at", { ascending: false })
    .limit(20);

  return (
    <PageShell>
      <ProfileHero profile={profile} />

      <SectionHeader label="Activity" title="Recent votes" className="mt-10" />

      <div className="space-y-2">
        {(votes ?? []).map((v, i) => {
          const trend = v.trends as unknown as {
            name: string;
            slug: string;
          } | null;
          return (
            <div
              key={i}
              className="surface-card-hover flex justify-between p-4 text-sm"
            >
              <span className="font-medium">{trend?.name}</span>
              <span
                className={
                  v.vote_type === "hype"
                    ? "font-mono text-red-400"
                    : "font-mono text-[var(--text-secondary)]"
                }
              >
                {v.vote_type === "hype" ? "🔥 hype" : "💀 dead"}
              </span>
            </div>
          );
        })}
        {!votes?.length && (
          <p className="text-[var(--text-secondary)]">No votes yet.</p>
        )}
      </div>
    </PageShell>
  );
}
