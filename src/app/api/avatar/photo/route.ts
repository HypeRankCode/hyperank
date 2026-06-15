import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { image, pose, background } = await request.json();
  if (!image || typeof image !== "string" || !image.startsWith("data:image/")) {
    return apiError("Invalid image");
  }

  const base64 = image.split(",")[1];
  if (!base64) return apiError("Invalid image data");

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > 2_000_000) {
    return apiError("Image too large (max 2MB)");
  }

  const path = `${user.id}/profile-${Date.now()}.png`;
  const admin = createServiceClient();

  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(path, buffer, {
      contentType: "image/png",
      upsert: true,
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error(uploadError);
    return apiError(
      "Upload failed. Ensure the avatars storage bucket exists (see supabase/patch_avatars_storage.sql).",
      500
    );
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("avatars").getPublicUrl(path);

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_config")
    .eq("id", user.id)
    .single();

  const prev = (profile?.avatar_config as Record<string, unknown>) ?? {};
  const next = {
    ...prev,
    profile_photo: {
      pose: pose ?? "default",
      background: background ?? "default",
      updated_at: new Date().toISOString(),
    },
  };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      avatar_config: next,
    })
    .eq("id", user.id);

  if (updateError) return apiError("Could not save profile", 500);

  return apiOk({ success: true, avatar_url: publicUrl });
}
