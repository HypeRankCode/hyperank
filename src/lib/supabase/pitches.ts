import { createClient } from "./server";
import type { HypePitchWithAuthor } from "@/lib/types/database";

type ProfileSnippet = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type PitchRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  pitch_key: string;
  vote_count: number;
  status: string;
  trend_id: string | null;
  won_on: string | null;
  created_at: string;
  profiles: ProfileSnippet | ProfileSnippet[] | null;
};

function resolveProfile(
  profiles: PitchRow["profiles"]
): ProfileSnippet | null {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles;
}

function mapPitch(row: PitchRow): HypePitchWithAuthor {
  const profile = resolveProfile(row.profiles);
  return {
    id: row.id,
    user_id: row.user_id,
    title: row.title,
    description: row.description,
    pitch_key: row.pitch_key,
    vote_count: row.vote_count,
    status: row.status as HypePitchWithAuthor["status"],
    trend_id: row.trend_id,
    won_on: row.won_on,
    created_at: row.created_at,
    author: {
      username: profile?.username ?? "unknown",
      display_name: profile?.display_name ?? null,
      avatar_url: profile?.avatar_url ?? null,
    },
  };
}

const PITCH_SELECT = `
  id, user_id, title, description, pitch_key, vote_count, status,
  trend_id, won_on, created_at,
  profiles!hype_pitches_user_id_fkey (username, display_name, avatar_url)
`;

export async function getActivePitches(limit = 20): Promise<HypePitchWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hype_pitches")
    .select(PITCH_SELECT)
    .eq("status", "active")
    .order("vote_count", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as PitchRow[]).map(mapPitch);
}

export async function getTodaysWinningPitch(): Promise<HypePitchWithAuthor | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("hype_pitches")
    .select(PITCH_SELECT)
    .eq("status", "won")
    .eq("won_on", today)
    .order("vote_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return mapPitch(data as unknown as PitchRow);
}

export async function getRecentWinningPitches(
  limit = 5
): Promise<HypePitchWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hype_pitches")
    .select(PITCH_SELECT)
    .eq("status", "won")
    .order("won_on", { ascending: false })
    .limit(limit);

  return ((data ?? []) as unknown as PitchRow[]).map(mapPitch);
}

export async function getUserPitchVotes(
  userId: string
): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hype_pitch_votes")
    .select("pitch_id")
    .eq("user_id", userId);

  return new Set((data ?? []).map((v) => v.pitch_id));
}
