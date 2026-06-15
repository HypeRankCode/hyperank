import { differenceInDays } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { awardBadge } from "./badges";
import { unlockCosmetic } from "./cosmetics";

export async function updateStreak(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const now = new Date();
  const lastVoted = profile.last_voted_at
    ? new Date(profile.last_voted_at)
    : null;
  const isYesterday =
    lastVoted && differenceInDays(now, lastVoted) === 1;
  const isToday = lastVoted && differenceInDays(now, lastVoted) === 0;

  if (isToday) return;

  const newStreak = isYesterday ? profile.streak_days + 1 : 1;
  const milestoneBonuses = [3, 7, 14, 30, 60, 100];
  const bonusCredits = milestoneBonuses.includes(newStreak)
    ? newStreak * 5
    : 0;

  await supabase
    .from("profiles")
    .update({
      streak_days: newStreak,
      last_voted_at: now.toISOString(),
      credits: profile.credits + bonusCredits,
    })
    .eq("id", userId);

  if (newStreak === 3) await awardBadge(userId, "streak_3");
  if (newStreak === 7) {
    await awardBadge(userId, "streak_7");
    await unlockCosmetic(userId, "hat_flame");
  }
  if (newStreak === 30) {
    await awardBadge(userId, "streak_30");
    await unlockCosmetic(userId, "bg_neon_city");
    await unlockCosmetic(userId, "effect_crown_glow");
  }

  return { newStreak, bonusCredits };
}

export async function awardCredits(
  userId: string,
  amount: number,
  _reason: string
) {
  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (!profile) return;

  await admin
    .from("profiles")
    .update({ credits: Math.max(0, profile.credits + amount) })
    .eq("id", userId);
}
