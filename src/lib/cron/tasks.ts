import { subHours, differenceInDays } from "date-fns";
import { createServiceClient } from "@/lib/supabase/admin";
import { calcHypeScore, slugify } from "@/lib/hype-score";
import { awardCredits } from "@/lib/credits";
import { checkAndUnlockCosmetics } from "@/lib/cosmetics";
import trendsSeed from "../../../public/trends.json";

export async function runDailyDrop() {
  const admin = createServiceClient();
  const today = new Date().toISOString().split("T")[0];

  await admin
    .from("trends")
    .update({ is_daily_drop: false })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: allTrends } = await admin
    .from("trends")
    .select("id")
    .eq("status", "active");

  if (!allTrends?.length) {
    for (const t of trendsSeed) {
      const slug = slugify(t.name);
      const hype = (t as { fire?: number }).fire ?? 0;
      const dead = (t as { dead?: number }).dead ?? 0;
      await admin.from("trends").upsert(
        {
          slug,
          name: (t as { label?: string }).label ?? t.name,
          description: t.description,
          hype_votes: hype,
          dead_votes: dead,
          hype_score: calcHypeScore(hype, dead),
          status: "active",
        },
        { onConflict: "slug" }
      );
    }
  }

  const { data: trends } = await admin
    .from("trends")
    .select("id")
    .eq("status", "active")
    .order("vote_velocity", { ascending: false })
    .limit(20);

  const shuffled = (trends ?? []).sort(() => Math.random() - 0.5).slice(0, 5);

  for (const t of shuffled) {
    await admin
      .from("trends")
      .update({ is_daily_drop: true, daily_drop_date: today })
      .eq("id", t.id);
  }

  return { daily_drop_count: shuffled.length };
}

/** Runs once daily on Hobby — uses 24h vote window instead of 10min. */
export async function runVoteVelocity() {
  const admin = createServiceClient();
  const since = subHours(new Date(), 24).toISOString();

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

  return { updated: Object.keys(counts).length };
}

export async function runResolvePredictions() {
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
          correct_predictions: profile.correct_predictions + (won ? 1 : 0),
          total_predictions: profile.total_predictions + 1,
        })
        .eq("id", p.user_id);
    }
    resolved++;
  }

  return { resolved };
}

export async function runResolveBattles() {
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

  return { completed: expired?.length ?? 0 };
}

export async function runStreakCheck() {
  const admin = createServiceClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, streak_days, last_voted_at, streak_shield")
    .gt("streak_days", 0);

  let broken = 0;
  for (const p of profiles ?? []) {
    if (!p.last_voted_at) continue;
    const days = differenceInDays(new Date(), new Date(p.last_voted_at));
    if (days >= 2) {
      if (p.streak_shield && days === 2) {
        await admin
          .from("profiles")
          .update({ streak_shield: false })
          .eq("id", p.id);
      } else {
        await admin
          .from("profiles")
          .update({ streak_days: 0 })
          .eq("id", p.id);
        broken++;
      }
    }
  }

  return { streaks_broken: broken };
}

export async function runCosmeticUnlockCheck() {
  const admin = createServiceClient();
  const since = subHours(new Date(), 24).toISOString();

  const { data: votes } = await admin
    .from("votes")
    .select("user_id")
    .gte("voted_at", since);

  const userIds = [...new Set((votes ?? []).map((v) => v.user_id))];
  for (const userId of userIds) {
    await checkAndUnlockCosmetics(userId);
  }

  return { users_checked: userIds.length };
}

export async function runDropEnd() {
  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: ended } = await admin
    .from("shop_drops")
    .select("id")
    .eq("is_active", true)
    .lte("ends_at", now);

  for (const d of ended ?? []) {
    await admin.from("shop_drops").update({ is_active: false }).eq("id", d.id);
  }

  return { ended: ended?.length ?? 0 };
}

export async function runExpireTrades() {
  const admin = createServiceClient();
  const now = new Date().toISOString();

  await admin
    .from("trade_offers")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", now);

  return { ok: true };
}

export async function runUpdateFloorPrices() {
  const admin = createServiceClient();
  const { data: cosmetics } = await admin.from("cosmetics").select("id");

  for (const c of cosmetics ?? []) {
    const { data: listings } = await admin
      .from("marketplace_listings")
      .select("asking_price")
      .eq("cosmetic_id", c.id)
      .eq("is_active", true)
      .order("asking_price", { ascending: true })
      .limit(1);

    const floor = listings?.[0]?.asking_price ?? 0;
    await admin
      .from("cosmetics")
      .update({ floor_price: floor })
      .eq("id", c.id);
  }

  return { ok: true };
}

export async function runUnbanCheck() {
  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: banned } = await admin
    .from("profiles")
    .select("id")
    .eq("is_banned", true)
    .not("ban_expires_at", "is", null)
    .lte("ban_expires_at", now);

  for (const p of banned ?? []) {
    await admin
      .from("profiles")
      .update({ is_banned: false, ban_reason: null, ban_expires_at: null })
      .eq("id", p.id);
  }

  return { unbanned: banned?.length ?? 0 };
}

export async function runWeeklyReport() {
  const admin = createServiceClient();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const { data: trends } = await admin
    .from("trends")
    .select("id, vote_velocity, hype_score")
    .eq("status", "active")
    .order("vote_velocity", { ascending: false });

  const sorted = trends ?? [];
  const riser = sorted[0]?.id;
  const faller = [...sorted].sort(
    (a, b) => a.vote_velocity - b.vote_velocity
  )[0]?.id;
  const controversial = [...sorted].sort(
    (a, b) => Math.abs(a.hype_score - 50) - Math.abs(b.hype_score - 50)
  )[0]?.id;

  await admin.from("weekly_reports").insert({
    week_start: weekStart.toISOString().split("T")[0],
    week_end: new Date().toISOString().split("T")[0],
    biggest_riser_id: riser,
    biggest_faller_id: faller,
    most_controversial_id: controversial,
    report_data: { generated: true },
  });

  return { ok: true };
}

export async function runWeeklyDrop() {
  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: drops } = await admin
    .from("shop_drops")
    .select("id")
    .lte("drop_date", now)
    .eq("is_active", false);

  for (const d of drops ?? []) {
    await admin.from("shop_drops").update({ is_active: true }).eq("id", d.id);
  }

  return { activated: drops?.length ?? 0 };
}

/** All jobs that run on the once-daily Hobby cron (midnight UTC). */
export async function runDailyMaintenance() {
  const results: Record<string, unknown> = {};

  results.daily_drop = await runDailyDrop();
  results.vote_velocity = await runVoteVelocity();
  results.resolve_predictions = await runResolvePredictions();
  results.resolve_battles = await runResolveBattles();
  results.streak_check = await runStreakCheck();
  results.cosmetic_unlock_check = await runCosmeticUnlockCheck();
  results.drop_end = await runDropEnd();
  results.expire_trades = await runExpireTrades();
  results.update_floor_prices = await runUpdateFloorPrices();
  results.unban_check = await runUnbanCheck();

  // Sunday = 0
  if (new Date().getUTCDay() === 0) {
    results.weekly_report = await runWeeklyReport();
  }

  return results;
}

/** Monday shop drop activation (noon UTC cron on Hobby). */
export async function runWeeklyMaintenance() {
  const results: Record<string, unknown> = {};

  if (new Date().getUTCDay() === 1) {
    results.weekly_drop = await runWeeklyDrop();
  }

  return results;
}
