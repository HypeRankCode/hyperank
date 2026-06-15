import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShopDropExtras } from "@/components/ShopDropExtras";
import { Button } from "@/components/ui/button";

export default async function ShopDropPage() {
  const supabase = await createClient();
  const { data: drop } = await supabase
    .from("shop_drops")
    .select("*, shop_items(*, cosmetics(name, rarity))")
    .eq("is_active", true)
    .order("drop_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Weekly Drop</h1>
      <ShopDropExtras />

      {!drop ? (
        <p className="mt-8 text-[var(--text-secondary)]">
          No active drop. Check back Monday noon UTC.
        </p>
      ) : (
        <>
          <p className="mt-2 text-[var(--text-secondary)]">{drop.name}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {((drop.shop_items as unknown[]) ?? []).map((item: unknown) => {
              const si = item as {
                id: string;
                credit_price: number;
                remaining: number;
                supply: number;
                is_sold_out: boolean;
                cosmetics: { name: string; rarity: string };
              };
              return (
                <div key={si.id} className="card-glass p-4">
                  <p className="font-bold">{si.cosmetics?.name}</p>
                  <p className="text-xs capitalize text-[var(--text-secondary)]">
                    {si.cosmetics?.rarity}
                  </p>
                  <p className="mt-2 font-mono text-gold">
                    {si.credit_price} credits
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {si.remaining}/{si.supply} left
                  </p>
                  {si.is_sold_out ? (
                    <p className="mt-2 text-sm text-dead">Sold out</p>
                  ) : (
                    <div className="mt-2">
                      <ShopBuyButton shopItemId={si.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <Link href="/shop/drops" className="mt-8 inline-block text-hype">
        Past drops
      </Link>
      <span className="mx-2 text-[var(--text-secondary)]">·</span>
      <Link href="/shop/market" className="text-hype">
        Marketplace
      </Link>
    </div>
  );
}

function ShopBuyButton({ shopItemId }: { shopItemId: string }) {
  return (
    <Button size="sm" className="w-full" asChild>
      <Link href={`/shop/drop?buy=${shopItemId}`}>Buy</Link>
    </Button>
  );
}
