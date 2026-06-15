import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";
import { calcHypeScore } from "@/lib/hype-score";
import { subHours } from "date-fns";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const since = subHours(new Date(), 1).toISOString();

  const { data: recentVotes } = await admin
    .from("votes")
    .select("trend_id")
    .gte("voted_at", since);

  const counts: Record<string, number> = {};
  for (const v of recentVotes ?? []) {
    counts[v.trend_id] = (counts[v.trend_id] ?? 0) + 1;
  }

  for (const [trendId, count] of Object.entries(counts)) {
    const { data: trend } = await admin
      .from("trends")
      .select("hype_votes, dead_votes")
      .eq("id", trendId)
      .single();

    if (trend) {
      await admin
        .from("trends")
        .update({
          vote_velocity: count,
          hype_score: calcHypeScore(trend.hype_votes, trend.dead_votes),
        })
        .eq("id", trendId);
    }
  }

  return NextResponse.json({ ok: true, updated: Object.keys(counts).length });
}
