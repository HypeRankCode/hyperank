import { notFound } from "next/navigation";
import { getTrendBySlug } from "@/lib/supabase/trends";
import { createClient } from "@/lib/supabase/server";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { HotTakeSection } from "@/components/HotTakeSection";
import { calcHypePercent } from "@/lib/hype-score";
import { PageShell } from "@/components/PageShell";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const trend = await getTrendBySlug(params.slug);
  if (!trend) return { title: "Trend | HypeRank" };
  return {
    title: `${trend.name} | HypeRank`,
    description: trend.description ?? undefined,
    openGraph: {
      images: [`/api/og/trend/${params.slug}`],
    },
  };
}

export default async function TrendDetailPage({ params }: Props) {
  const trend = await getTrendBySlug(params.slug);
  if (!trend) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userVote: "hype" | "dead" | null = null;
  if (user) {
    const { data } = await supabase
      .from("votes")
      .select("vote_type")
      .eq("user_id", user.id)
      .eq("trend_id", trend.id)
      .maybeSingle();
    userVote = (data?.vote_type as "hype" | "dead") ?? null;
  }

  const { data: hotTakes } = await supabase
    .from("hot_takes")
    .select("id, content, upvotes, profiles(username)")
    .eq("trend_id", trend.id)
    .order("upvotes", { ascending: false })
    .limit(20);

  const { count } = await supabase
    .from("hot_takes")
    .select("*", { count: "exact", head: true })
    .eq("trend_id", trend.id);

  const hypePercent = calcHypePercent(trend.hype_votes, trend.dead_votes);

  return (
    <PageShell>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendCard
            trend={trend}
            userVote={userVote}
            hotTakeCount={count ?? 0}
          />
          <HotTakeSection trendId={trend.id} initialTakes={hotTakes ?? []} />
        </div>
        <aside>
          <div className="surface-card p-6">
            <p className="section-label mb-2">Stats</p>
            <p className="font-display text-5xl font-extrabold text-red-400">
              {hypePercent}%
            </p>
            <p className="text-sm text-[var(--text-secondary)]">hype score</p>
            <div className="mt-6 space-y-2 font-mono text-sm">
              <p>
                <span className="text-red-400">{trend.hype_votes}</span> hype
              </p>
              <p>
                <span className="text-[var(--text-secondary)]">
                  {trend.dead_votes}
                </span>{" "}
                dead
              </p>
            </div>
          </div>
          <AdSlot slot="trend-sidebar" />
        </aside>
      </div>
    </PageShell>
  );
}
