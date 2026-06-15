import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";
import { calcHypeScore } from "@/lib/hype-score";
import { awardCredits } from "@/lib/credits";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: pending } = await admin
    .from("predictions")
    .select("*, trends(hype_votes, dead_votes)")
    .eq("resolved", false)
    .lte("resolves_at", now);

  let resolved = 0;
  for (const p of pending ?? []) {
    const trend = p.trends as { hype_votes: number; dead_votes: number } | null;
    if (!trend) continue;

    const total = trend.hype_votes + trend.dead_votes;
    if (total < 10) continue;

    const score = calcHypeScore(trend.hype_votes, trend.dead_votes);
    const outcome = score >= 50 ? "hype" : "dead";
    const won = outcome === p.predicted_outcome;

    await admin
      .from("predictions")
      .update({ resolved: true, won })
      .eq("id", p.id);

    const { data: profile } = await admin
      .from("profiles")
      .select("credits, correct_predictions, total_predictions")
      .eq("id", p.user_id)
      .single();

    if (profile) {
      const payout = won ? Math.floor(p.credits_wagered * 1.8) : 0;
      await admin
        .from("profiles")
        .update({
          credits: profile.credits + payout,
          correct_predictions:
            profile.correct_predictions + (won ? 1 : 0),
          total_predictions: profile.total_predictions + 1,
        })
        .eq("id", p.user_id);
    }
    resolved++;
  }

  return NextResponse.json({ ok: true, resolved });
}
