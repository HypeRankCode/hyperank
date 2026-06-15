import { notFound } from "next/navigation";
import { getProfileByUsername } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import { ProfileHero } from "@/components/ProfileHero";
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
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-2xl">This profile is private.</p>
      </div>
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
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <ProfileHero profile={profile} />

      <section>
        <h2 className="font-display text-xl font-bold">Recent votes</h2>
        <div className="mt-4 space-y-2">
          {(votes ?? []).map((v, i) => {
            const trend = v.trends as unknown as {
              name: string;
              slug: string;
            } | null;
            return (
              <div key={i} className="card-glass flex justify-between p-3 text-sm">
                <span>{trend?.name}</span>
                <span className={v.vote_type === "hype" ? "text-hype" : "text-dead"}>
                  {v.vote_type}
                </span>
              </div>
            );
          })}
          {!votes?.length && (
            <p className="text-[var(--text-secondary)]">No votes yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
