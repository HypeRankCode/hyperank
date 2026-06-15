import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, ends_at, cosmetic_ids } = await request.json();
  if (!name || !Array.isArray(cosmetic_ids) || !cosmetic_ids.length) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createServiceClient();
  const now = new Date().toISOString();

  await admin
    .from("shop_drops")
    .update({ is_active: false })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: drop, error: dropError } = await admin
    .from("shop_drops")
    .insert({
      name,
      drop_date: now,
      ends_at: ends_at ?? now,
      is_active: true,
    })
    .select("id")
    .single();

  if (dropError || !drop) {
    return NextResponse.json({ error: dropError?.message }, { status: 500 });
  }

  const { data: cosmetics } = await admin
    .from("cosmetics")
    .select("id, rarity, cost_credits")
    .in("id", cosmetic_ids);

  let items = 0;
  for (const c of cosmetics ?? []) {
    const price = c.cost_credits > 0 ? c.cost_credits : 100;
    const { error } = await admin.from("shop_items").insert({
      drop_id: drop.id,
      cosmetic_id: c.id,
      rarity: c.rarity,
      supply: 50,
      remaining: 50,
      credit_price: price,
    });
    if (!error) items++;
  }

  return NextResponse.json({ ok: true, drop_id: drop.id, items });
}
