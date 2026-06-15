import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { addDays } from "date-fns";

const STARTER_ITEMS = [
  { cosmetic_id: "shirt_fire", credit_price: 150, supply: 100, rarity: "rare" },
  { cosmetic_id: "hat_crown", credit_price: 500, supply: 25, rarity: "legendary" },
  { cosmetic_id: "shoes_gold", credit_price: 400, supply: 50, rarity: "legendary" },
  { cosmetic_id: "bg_space", credit_price: 300, supply: 75, rarity: "rare" },
];

/** Creates an active shop drop with purchasable items (cosmetics must exist in schema). */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createServiceClient();
  const now = new Date();

  await admin
    .from("shop_drops")
    .update({ is_active: false })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const { data: drop, error: dropError } = await admin
    .from("shop_drops")
    .insert({
      name: "Starter Drop",
      drop_date: now.toISOString(),
      ends_at: addDays(now, 7).toISOString(),
      is_active: true,
      theme: "launch",
    })
    .select("id")
    .single();

  if (dropError || !drop) {
    return NextResponse.json({ error: dropError?.message }, { status: 500 });
  }

  let items = 0;
  for (const item of STARTER_ITEMS) {
    const { error } = await admin.from("shop_items").insert({
      drop_id: drop.id,
      cosmetic_id: item.cosmetic_id,
      rarity: item.rarity,
      supply: item.supply,
      remaining: item.supply,
      credit_price: item.credit_price,
      is_sold_out: false,
    });
    if (!error) items++;
  }

  return NextResponse.json({ ok: true, drop_id: drop.id, items });
}
