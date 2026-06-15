import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const now = new Date().toISOString();

  await admin
    .from("trade_offers")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", now);

  return NextResponse.json({ ok: true });
}
