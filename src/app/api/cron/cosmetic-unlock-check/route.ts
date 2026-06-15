import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";
import { checkAndUnlockCosmetics } from "@/lib/cosmetics";
import { subHours } from "date-fns";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const since = subHours(new Date(), 24).toISOString();

  const { data: votes } = await admin
    .from("votes")
    .select("user_id")
    .gte("voted_at", since);

  const userIds = [...new Set((votes ?? []).map((v) => v.user_id))];
  for (const userId of userIds) {
    await checkAndUnlockCosmetics(userId);
  }

  return NextResponse.json({ ok: true, users_checked: userIds.length });
}
