import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { awardCredits } from "@/lib/credits";
import { rateLimit } from "@/lib/rateLimit";
import { apiError, apiOk } from "@/lib/api/errors";
import { addDays } from "date-fns";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const rl = rateLimit(`predict:${user.id}`, 50, 60 * 60 * 1000);
  if (!rl.ok) return apiError("Rate limit exceeded", 429);

  const { trend_id, predicted_outcome, credits_wagered } = await request.json();

  if (!trend_id || !["hype", "dead"].includes(predicted_outcome)) {
    return apiError("Invalid request");
  }

  const wager = Number(credits_wagered);
  if (wager < 10 || wager > 200) {
    return apiError("Wager must be 10–200 credits.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned) {
    return apiError("You can't do that right now.", 403);
  }
  if (profile.credits < wager) return apiError("Not enough credits.");

  const admin = createServiceClient();
  await admin
    .from("profiles")
    .update({ credits: profile.credits - wager })
    .eq("id", user.id);

  const { error } = await supabase.from("predictions").insert({
    user_id: user.id,
    trend_id,
    predicted_outcome,
    credits_wagered: wager,
    resolves_at: addDays(new Date(), 7).toISOString(),
  });

  if (error) return apiError("Something went wrong. Try again.", 500);

  return apiOk({ success: true, credits_remaining: profile.credits - wager });
}
