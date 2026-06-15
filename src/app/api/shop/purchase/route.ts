import { createClient } from "@/lib/supabase/server";
import { apiError, apiOk } from "@/lib/api/errors";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { shop_item_id } = await request.json();
  const { data, error } = await supabase.rpc("purchase_shop_item", {
    p_user_id: user.id,
    p_shop_item_id: shop_item_id,
  });

  if (error) {
    if (error.message.includes("SOLD_OUT")) return apiError("Gone. Check the marketplace.");
    if (error.message.includes("INSUFFICIENT")) return apiError("Not enough credits.");
    return apiError("Something went wrong. Try again.", 500);
  }

  return apiOk(data as Record<string, unknown>);
}
