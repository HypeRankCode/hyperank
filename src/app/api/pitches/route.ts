import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";
import { validateUserContent } from "@/lib/moderation";
import { rateLimit } from "@/lib/rateLimit";
import { apiError, apiOk } from "@/lib/api/errors";
import { slugify } from "@/lib/hype-score";
import { getActivePitches } from "@/lib/supabase/pitches";

export async function GET() {
  const pitches = await getActivePitches(50);
  return apiOk({ pitches });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const rl = rateLimit(`pitch:${user.id}`, 5, 24 * 60 * 60 * 1000);
  if (!rl.ok) return apiError("You can only submit 5 pitches per day.", 429);

  const body = await request.json();
  const title = sanitizeText(body.title ?? "", 80);
  const description = sanitizeText(body.description ?? "", 280);

  const titleCheck = validateUserContent(title, 80);
  if (!titleCheck.ok) return apiError(titleCheck.error ?? "Invalid title", 400);
  if (title.length < 3) return apiError("Title must be at least 3 characters.", 400);

  if (description) {
    const descCheck = validateUserContent(description, 280);
    if (!descCheck.ok) return apiError(descCheck.error ?? "Invalid description", 400);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_muted, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.is_muted) {
    return apiError("You can't do that right now.", 403);
  }

  const pitchKey = slugify(title);
  if (!pitchKey) return apiError("Title needs letters or numbers.", 400);

  const today = new Date().toISOString().split("T")[0];

  const { data: cooldown } = await supabase
    .from("hype_pitch_cooldowns")
    .select("pitch_key")
    .eq("pitch_key", pitchKey)
    .gte("banned_until", today)
    .maybeSingle();

  if (cooldown) {
    return apiError(
      "That idea won recently — it can't be pitched again for 7 days.",
      409
    );
  }

  const { data: duplicate } = await supabase
    .from("hype_pitches")
    .select("id")
    .eq("pitch_key", pitchKey)
    .eq("status", "active")
    .maybeSingle();

  if (duplicate) {
    return apiError("Someone already pitched that idea today.", 409);
  }

  const { data, error } = await supabase
    .from("hype_pitches")
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      pitch_key: pitchKey,
    })
    .select()
    .single();

  if (error) return apiError("Something went wrong. Try again.", 500);
  return apiOk({ success: true, pitch: data });
}
