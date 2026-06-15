import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { verifyCron } from "@/lib/cron/verify";

export async function GET(request: Request) {
  const denied = verifyCron(request);
  if (denied) return denied;

  const admin = createServiceClient();
  const { data: cosmetics } = await admin.from("cosmetics").select("id");

  for (const c of cosmetics ?? []) {
    const { data: listings } = await admin
      .from("marketplace_listings")
      .select("asking_price")
      .eq("cosmetic_id", c.id)
      .eq("is_active", true)
      .order("asking_price", { ascending: true })
      .limit(1);

    const floor = listings?.[0]?.asking_price ?? 0;
    await admin
      .from("cosmetics")
      .update({ floor_price: floor })
      .eq("id", c.id);
  }

  return NextResponse.json({ ok: true });
}
