import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { updateStreak, awardCredits } from "@/lib/credits";
import { awardBadge } from "@/lib/badges";
import { calcHypeScore } from "@/lib/hype-score";
import { rateLimit } from "@/lib/rateLimit";
import { apiError, apiOk } from "@/lib/api/errors";
import type { VoteType } from "@/lib/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return apiError("UNAUTHORIZED", 401);

  const rl = rateLimit(`vote:${user.id}`, 100, 60 * 60 * 1000);
  if (!rl.ok) return apiError("Rate limit exceeded", 429);

  const body = await request.json();
  const trendId = body.trend_id as string;
  const voteType = body.vote_type as VoteType;

  if (!trendId || !["hype", "dead"].includes(voteType)) {
    return apiError("Invalid request");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned) {
    return apiError("You can't do that right now.", 403);
  }

  const { data: existing } = await supabase
    .from("votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("trend_id", trendId)
    .maybeSingle();

  if (existing) return apiError("You already voted on this one.", 409);

  const { error: voteError } = await supabase.from("votes").insert({
    user_id: user.id,
    trend_id: trendId,
    vote_type: voteType,
  });

  if (voteError) return apiError("Something went wrong. Try again.", 500);

  const admin = createServiceClient();
  const { data: trend } = await admin
    .from("trends")
    .select("hype_votes, dead_votes, is_daily_drop")
    .eq("id", trendId)
    .single();

  if (trend) {
    const hypeVotes =
      trend.hype_votes + (voteType === "hype" ? 1 : 0);
    const deadVotes =
      trend.dead_votes + (voteType === "dead" ? 1 : 0);

    await admin
      .from("trends")
      .update({
        hype_votes: hypeVotes,
        dead_votes: deadVotes,
        hype_score: calcHypeScore(hypeVotes, deadVotes),
      })
      .eq("id", trendId);
  }

  await admin
    .from("profiles")
    .update({ total_votes: profile.total_votes + 1 })
    .eq("id", user.id);

  const streakResult = await updateStreak(user.id);

  if (profile.total_votes === 0) {
    await awardBadge(user.id, "first_vote");
  }

  if (trend?.is_daily_drop) {
    await awardCredits(user.id, 1, "daily_drop_vote");
  }

  return apiOk({
    success: true,
    vote_type: voteType,
    streak: streakResult?.newStreak,
    bonus_credits: streakResult?.bonusCredits ?? 0,
  });
}
