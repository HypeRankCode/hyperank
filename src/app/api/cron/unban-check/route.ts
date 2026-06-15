import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: banned } = await admin
    .from("profiles")
    .select("id")
    .eq("is_banned", true)
    .not("ban_expires_at", "is", null)
    .lte("ban_expires_at", now);

  for (const p of banned ?? []) {
    await admin
      .from("profiles")
      .update({ is_banned: false, ban_reason: null, ban_expires_at: null })
      .eq("id", p.id);
  }

  return NextResponse.json({ ok: true, unbanned: banned?.length ?? 0 });
}
