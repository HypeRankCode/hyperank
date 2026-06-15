import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: ended } = await admin
    .from("shop_drops")
    .select("id")
    .eq("is_active", true)
    .lte("ends_at", now);

  for (const d of ended ?? []) {
    await admin.from("shop_drops").update({ is_active: false }).eq("id", d.id);
  }

  return NextResponse.json({ ok: true, ended: ended?.length ?? 0 });
}
