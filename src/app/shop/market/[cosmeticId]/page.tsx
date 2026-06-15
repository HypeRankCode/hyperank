import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function CosmeticMarketPage({
  params,
}: {
  params: { cosmeticId: string };
}) {
  const supabase = await createClient();
  const { data: cosmetic } = await supabase
    .from("cosmetics")
    .select("*")
    .eq("id", params.cosmeticId)
    .single();

  if (!cosmetic) notFound();

  const { data: listings } = await supabase
    .from("marketplace_listings")
    .select("id, asking_price, profiles(username)")
    .eq("cosmetic_id", params.cosmeticId)
    .eq("is_active", true)
    .order("asking_price");

  const { data: history } = await supabase
    .from("price_history")
    .select("sale_price, sold_at")
    .eq("cosmetic_id", params.cosmeticId)
    .order("sold_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">{cosmetic.name}</h1>
      <p className="mt-1 capitalize text-[var(--text-secondary)]">
        {cosmetic.rarity} · Floor: {cosmetic.floor_price} credits
      </p>

      <h2 className="mt-8 font-display text-lg font-bold">Listings</h2>
      <div className="mt-4 space-y-2">
        {(listings ?? []).map((l) => {
          const seller = l.profiles as unknown as { username: string };
          return (
            <div key={l.id} className="card-glass flex justify-between p-3">
              <span>@{seller?.username}</span>
              <span className="font-mono text-gold">{l.asking_price}</span>
            </div>
          );
        })}
        {!listings?.length && (
          <p className="text-[var(--text-secondary)]">No active listings.</p>
        )}
      </div>

      {history && history.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-lg font-bold">Recent sales</h2>
          <div className="mt-4 space-y-1 text-sm text-[var(--text-secondary)]">
            {history.map((h, i) => (
              <p key={i}>
                {h.sale_price} credits ·{" "}
                {new Date(h.sold_at).toLocaleDateString()}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
