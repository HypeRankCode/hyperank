import { createClient } from "@/lib/supabase/server";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { avatar_config } = await request.json();
  if (!avatar_config || typeof avatar_config !== "object") {
    return apiError("Invalid request");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_config })
    .eq("id", user.id);

  if (error) return apiError("Something went wrong. Try again.", 500);
  return apiOk({ success: true });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { avatar_rpm_url } = await request.json();
  if (!avatar_rpm_url) return apiError("Invalid request");

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_rpm_url })
    .eq("id", user.id);

  if (error) return apiError("Something went wrong. Try again.", 500);
  return apiOk({ success: true });
}
