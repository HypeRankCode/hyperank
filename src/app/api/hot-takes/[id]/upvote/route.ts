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

  const { data: existing } = await supabase
    .from("hot_take_votes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("hot_take_id", params.id)
    .maybeSingle();

  if (existing) return apiError("Already upvoted.", 409);

  await supabase.from("hot_take_votes").insert({
    user_id: user.id,
    hot_take_id: params.id,
  });

  const admin = createServiceClient();
  const { data: take } = await admin
    .from("hot_takes")
    .select("upvotes")
    .eq("id", params.id)
    .single();

  if (take) {
    await admin
      .from("hot_takes")
      .update({ upvotes: take.upvotes + 1 })
      .eq("id", params.id);
  }

  return apiOk({ success: true });
}
