import { createClient } from "@/lib/supabase/server";
import { apiError, apiOk } from "@/lib/api/errors";
import { PROCEDURAL_AVATAR_URL } from "@/lib/avatar/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const body = await request.json();
  const equipped = body.equipped ?? body.avatar_config;
  if (!equipped || typeof equipped !== "object") {
    return apiError("Invalid request");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_config")
    .eq("id", user.id)
    .single();

  const prev = (profile?.avatar_config as Record<string, unknown>) ?? {};
  const next = { ...prev, ...equipped };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_config: next })
    .eq("id", user.id);

  if (error) return apiError("Something went wrong. Try again.", 500);
  return apiOk({ success: true });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { appearance, avatar_rpm_url } = await request.json();
  if (!appearance || typeof appearance !== "object") {
    return apiError("Invalid request");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_config")
    .eq("id", user.id)
    .single();

  const prev = (profile?.avatar_config as Record<string, unknown>) ?? {};
  const next = { ...prev, appearance };

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_config: next,
      avatar_rpm_url: avatar_rpm_url ?? PROCEDURAL_AVATAR_URL,
    })
    .eq("id", user.id);

  if (error) return apiError("Something went wrong. Try again.", 500);
  return apiOk({ success: true });
}

/** @deprecated Legacy RPM URL save — use PUT with appearance instead */
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
