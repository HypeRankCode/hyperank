import { createClient } from "./server";
import type { Trend } from "@/lib/types/database";

export async function getTrends(options?: {
  dailyDrop?: boolean;
  limit?: number;
  status?: string;
}): Promise<Trend[]> {
  const supabase = await createClient();
  let query = supabase
    .from("trends")
    .select("*")
    .eq("status", options?.status ?? "active")
    .order("vote_velocity", { ascending: false });

  if (options?.dailyDrop) {
    query = query.eq("is_daily_drop", true);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data } = await query;
  return (data ?? []) as Trend[];
}

export async function getTrendBySlug(slug: string): Promise<Trend | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trends")
    .select("*")
    .eq("slug", slug)
    .single();
  return (data as Trend) ?? null;
}

export async function getTrendById(id: string): Promise<Trend | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("trends")
    .select("*")
    .eq("id", id)
    .single();
  return (data as Trend) ?? null;
}
