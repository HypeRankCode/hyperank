import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { awardCredits } from "@/lib/credits";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { data: pitch } = await supabase
    .from("hype_pitches")
    .select("id, status, user_id")
    .eq("id", params.id)
    .single();

  if (!pitch) return apiError("Pitch not found.", 404);
  if (pitch.status !== "active") {
    return apiError("This audition round is over.", 409);
  }

  const { data: existing } = await supabase
    .from("hype_pitch_votes")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("pitch_id", params.id)
    .maybeSingle();

  if (existing) return apiError("You already voted for this pitch.", 409);

  const { error: voteError } = await supabase.from("hype_pitch_votes").insert({
    user_id: user.id,
    pitch_id: params.id,
  });

  if (voteError) return apiError("Something went wrong. Try again.", 500);

  const admin = createServiceClient();
  const { data: current } = await admin
    .from("hype_pitches")
    .select("vote_count")
    .eq("id", params.id)
    .single();

  const newCount = (current?.vote_count ?? 0) + 1;

  await admin
    .from("hype_pitches")
    .update({ vote_count: newCount })
    .eq("id", params.id);

  if (pitch.user_id !== user.id) {
    await awardCredits(pitch.user_id, 1, "pitch_upvote_received");
  }

  return apiOk({ success: true, vote_count: newCount });
}
