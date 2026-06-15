import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { voted_for } = await request.json();
  if (!voted_for) return apiError("Invalid request");

  const { data: existing } = await supabase
    .from("battle_votes")
    .select("id")
    .eq("user_id", user.id)
    .eq("battle_id", params.id)
    .maybeSingle();

  if (existing) return apiError("You already voted on this one.", 409);

  await supabase.from("battle_votes").insert({
    user_id: user.id,
    battle_id: params.id,
    voted_for,
  });

  const admin = createServiceClient();
  const { data: battle } = await admin
    .from("battles")
    .select("trend_a_id, trend_b_id, votes_a, votes_b")
    .eq("id", params.id)
    .single();

  if (battle) {
    const isA = voted_for === battle.trend_a_id;
    await admin
      .from("battles")
      .update({
        votes_a: battle.votes_a + (isA ? 1 : 0),
        votes_b: battle.votes_b + (isA ? 0 : 1),
      })
      .eq("id", params.id);
  }

  return apiOk({ success: true });
}
