import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MarketListForm } from "@/components/MarketListForm";

export default async function MarketListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("inventory_items")
    .select("id, cosmetic_id, serial_number, cosmetics(name)")
    .eq("owner_id", user.id)
    .eq("is_listed_on_market", false);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl font-bold">List for sale</h1>
      <MarketListForm
        items={(items ?? []).map((i) => ({
          id: i.id,
          name:
            (i.cosmetics as unknown as { name: string })?.name ??
            i.cosmetic_id,
          serial: i.serial_number,
        }))}
      />
    </div>
  );
}
