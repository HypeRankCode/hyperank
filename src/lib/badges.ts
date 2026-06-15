import { createClient } from "@/lib/supabase/server";

export async function awardBadge(userId: string, badgeId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("badge_ids")
    .eq("id", userId)
    .single();

  if (!profile || profile.badge_ids.includes(badgeId)) return;

  await supabase
    .from("profiles")
    .update({ badge_ids: [...profile.badge_ids, badgeId] })
    .eq("id", userId);
}
