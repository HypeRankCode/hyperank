import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createServiceClient } from "@/lib/supabase/admin";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return apiError("FORBIDDEN", 403);
  }

  const { trend_a_id, trend_b_id, ends_at } = await request.json();
  const admin = createServiceClient();

  const { data, error } = await admin.from("battles").insert({
    trend_a_id,
    trend_b_id,
    ends_at,
    status: "active",
  }).select().single();

  if (error) return apiError("Failed", 500);
  return apiOk({ success: true, battle: data });
}
