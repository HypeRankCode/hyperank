import { createClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";
import { validateUserContent } from "@/lib/moderation";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { content_type, content_id, reason, details, reported_user_id } =
    await request.json();

  if (!content_type || !reason) return apiError("Invalid request");

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: reported_user_id ?? null,
    content_type,
    content_id: content_id ?? null,
    reason,
    details: details ? sanitizeText(details, 500) : null,
  });

  if (error) return apiError("Something went wrong. Try again.", 500);
  return apiOk({ success: true });
}
