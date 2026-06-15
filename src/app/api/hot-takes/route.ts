import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";
import { validateUserContent } from "@/lib/moderation";
import { rateLimit } from "@/lib/rateLimit";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const rl = rateLimit(`hottake:${user.id}`, 10, 24 * 60 * 60 * 1000);
  if (!rl.ok) return apiError("Rate limit exceeded", 429);

  const { trend_id, content } = await request.json();
  const cleaned = sanitizeText(content ?? "", 140);
  const validation = validateUserContent(cleaned, 140);
  if (!validation.ok) return apiError(validation.error ?? "Invalid content");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_muted, is_banned")
    .eq("id", user.id)
    .single();

  if (!profile || profile.is_banned || profile.is_muted) {
    return apiError("You can't do that right now.", 403);
  }

  const { data, error } = await supabase
    .from("hot_takes")
    .insert({ trend_id, user_id: user.id, content: cleaned })
    .select()
    .single();

  if (error) return apiError("Something went wrong. Try again.", 500);
  return apiOk({ success: true, hot_take: data });
}
