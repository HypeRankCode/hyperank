import { NextResponse } from "next/server";
import { verifyCron } from "@/lib/cron/verify";
import { runDailyMaintenance } from "@/lib/cron/tasks";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  try {
    const results = await runDailyMaintenance();
    return NextResponse.json({ ok: true, results });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Cron failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
