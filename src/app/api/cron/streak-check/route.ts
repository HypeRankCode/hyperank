import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";
import { differenceInDays } from "date-fns";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id, streak_days, last_voted_at, streak_shield")
    .gt("streak_days", 0);

  let broken = 0;
  for (const p of profiles ?? []) {
    if (!p.last_voted_at) continue;
    const days = differenceInDays(new Date(), new Date(p.last_voted_at));
    if (days >= 2) {
      if (p.streak_shield && days === 2) {
        await admin
          .from("profiles")
          .update({ streak_shield: false })
          .eq("id", p.id);
      } else {
        await admin
          .from("profiles")
          .update({ streak_days: 0 })
          .eq("id", p.id);
        broken++;
      }
    }
  }

  return NextResponse.json({ ok: true, streaks_broken: broken });
}
