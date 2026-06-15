import { notFound } from "next/navigation";
import { getTrendBySlug } from "@/lib/supabase/trends";
import { createClient } from "@/lib/supabase/server";
import { TrendCard } from "@/components/TrendCard";
import { AdSlot } from "@/components/AdSlot";
import { HotTakeSection } from "@/components/HotTakeSection";
import { calcHypePercent } from "@/lib/hype-score";
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
    <div className="mx-auto max-w-4xl px-4 py-8">
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
          <div className="card-glass p-4">
            <h3 className="font-display font-bold">Stats</h3>
            <p className="mt-2 font-mono text-3xl text-hype">{hypePercent}%</p>
            <p className="text-sm text-[var(--text-secondary)]">hype score</p>
            <p className="mt-4 text-sm">
              {trend.hype_votes} hype · {trend.dead_votes} dead
            </p>
          </div>
          <AdSlot slot="trend-sidebar" />
        </aside>
      </div>
    </div>
  );
}
