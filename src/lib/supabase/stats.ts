import { createClient } from "./server";
import { startOfDay } from "date-fns";

export async function getHomeStats() {
  const supabase = await createClient();
  const todayStart = startOfDay(new Date()).toISOString();

  const [votesToday, activeStreaks] = await Promise.all([
    supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .gte("voted_at", todayStart),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gt("streak_days", 0),
  ]);

  return {
    votesToday: votesToday.count ?? 0,
    activeStreaks: activeStreaks.count ?? 0,
  };
}

export async function getLeaderboardPreview(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, streak_days, credits, total_votes, hype_score")
    .order("total_votes", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getActiveBattle() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("battles")
    .select(
      `
      id, votes_a, votes_b, status, ends_at, starts_at,
      trend_a:trends!battles_trend_a_id_fkey(id, name, slug),
      trend_b:trends!battles_trend_b_id_fkey(id, name, slug)
    `
    )
    .eq("status", "active")
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getUpcomingBattle() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("battles")
    .select(
      `
      id, starts_at, ends_at,
      trend_a:trends!battles_trend_a_id_fkey(id, name, slug),
      trend_b:trends!battles_trend_b_id_fkey(id, name, slug)
    `
    )
    .eq("status", "active")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getActiveShopDrop() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shop_drops")
    .select("id, name, ends_at, theme, shop_items(id)")
    .eq("is_active", true)
    .order("drop_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}
