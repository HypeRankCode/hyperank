import { createClient } from "@/lib/supabase/server";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { inventory_item_id, asking_price } = await request.json();
  const price = Number(asking_price);
  if (price < 1) return apiError("Min price is 1 credit.");

  const { data: item } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", inventory_item_id)
    .eq("owner_id", user.id)
    .single();

  if (!item || item.is_listed_on_market) return apiError("Invalid item");

  const { data: cosmetic } = await supabase
    .from("cosmetics")
    .select("is_tradeable")
    .eq("id", item.cosmetic_id)
    .single();

  if (!cosmetic?.is_tradeable) return apiError("Not tradeable");

  await supabase
    .from("inventory_items")
    .update({ is_listed_on_market: true, listing_price: price })
    .eq("id", inventory_item_id);

  await supabase.from("marketplace_listings").insert({
    seller_id: user.id,
    inventory_item_id,
    cosmetic_id: item.cosmetic_id,
    asking_price: price,
  });

  return apiOk({ success: true });
}
