import { createClient } from "@/lib/supabase/server";
import { apiError, apiOk } from "@/lib/api/errors";
import { unlockCosmetic } from "@/lib/cosmetics";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { cosmetic_id } = await request.json();
  const { data: cosmetic } = await supabase
    .from("cosmetics")
    .select("*")
    .eq("id", cosmetic_id)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, owned_cosmetic_ids")
    .eq("id", user.id)
    .single();

  if (!cosmetic || !profile) return apiError("Not found", 404);
  if (profile.owned_cosmetic_ids.includes(cosmetic_id)) {
    return apiError("Already owned");
  }
  if (profile.credits < cosmetic.cost_credits) {
    return apiError("Not enough credits.");
  }

  await supabase
    .from("profiles")
    .update({
      credits: profile.credits - cosmetic.cost_credits,
      owned_cosmetic_ids: [...profile.owned_cosmetic_ids, cosmetic_id],
    })
    .eq("id", user.id);

  await unlockCosmetic(user.id, cosmetic_id);
  return apiOk({ success: true });
}
