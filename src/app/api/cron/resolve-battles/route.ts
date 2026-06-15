import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";
import { awardCredits } from "@/lib/credits";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: expired } = await admin
    .from("battles")
    .select("*")
    .eq("status", "active")
    .lte("ends_at", now);

  for (const battle of expired ?? []) {
    const winnerId =
      battle.votes_a >= battle.votes_b
        ? battle.trend_a_id
        : battle.trend_b_id;

    await admin
      .from("battles")
      .update({ status: "completed", winner_id: winnerId })
      .eq("id", battle.id);

    const { data: winners } = await admin
      .from("battle_votes")
      .select("user_id")
      .eq("battle_id", battle.id)
      .eq("voted_for", winnerId);

    for (const w of winners ?? []) {
      await awardCredits(w.user_id, 5, "battle_win");
    }
  }

  return NextResponse.json({ ok: true, completed: expired?.length ?? 0 });
}
