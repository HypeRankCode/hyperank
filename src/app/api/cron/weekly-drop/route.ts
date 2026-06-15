import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const now = new Date().toISOString();

  const { data: drops } = await admin
    .from("shop_drops")
    .select("id")
    .lte("drop_date", now)
    .eq("is_active", false);

  for (const d of drops ?? []) {
    await admin.from("shop_drops").update({ is_active: true }).eq("id", d.id);
  }

  return NextResponse.json({ ok: true, activated: drops?.length ?? 0 });
}
