import { createClient } from "@/lib/supabase/server";

export async function unlockCosmetic(userId: string, cosmeticId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("owned_cosmetic_ids")
    .eq("id", userId)
    .single();

  if (!profile || profile.owned_cosmetic_ids.includes(cosmeticId)) return;

  await supabase
    .from("profiles")
    .update({
      owned_cosmetic_ids: [...profile.owned_cosmetic_ids, cosmeticId],
    })
    .eq("id", userId);
}

export async function checkAndUnlockCosmetics(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const { data: cosmetics } = await supabase.from("cosmetics").select("*");

  if (!profile || !cosmetics) return;

  for (const cosmetic of cosmetics) {
    if (profile.owned_cosmetic_ids.includes(cosmetic.id)) continue;

    const condition = cosmetic.unlock_condition;
    let shouldUnlock = false;

    if (condition === "default") shouldUnlock = true;
    if (condition === "streak_7" && profile.streak_days >= 7)
      shouldUnlock = true;
    if (condition === "streak_30" && profile.streak_days >= 30)
      shouldUnlock = true;
    if (condition?.startsWith("badge:")) {
      const badgeId = condition.replace("badge:", "");
      shouldUnlock = profile.badge_ids.includes(badgeId);
    }

    if (shouldUnlock) await unlockCosmetic(userId, cosmetic.id);
  }
}
