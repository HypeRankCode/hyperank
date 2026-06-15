import { createClient } from "./server";
import type { Profile } from "@/lib/types/database";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function createProfile(
  userId: string,
  username: string,
  options?: { is_minor?: boolean; age_verified?: boolean }
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username,
      is_minor: options?.is_minor ?? false,
      age_verified: options?.age_verified ?? false,
      is_public: options?.is_minor ? false : true,
    })
    .select()
    .single();

  if (error) return null;
  return data as Profile;
}
