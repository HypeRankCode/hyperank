import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ShopDropExtras } from "@/components/ShopDropExtras";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageShell, SectionHeader } from "@/components/PageShell";

const rarityColors: Record<string, string> = {
  common: "border-white/10",
  uncommon: "border-emerald-500/30",
  rare: "border-blue-500/30",
  epic: "border-purple-500/30",
  legendary: "border-yellow-500/40",
};

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
    <PageShell wide>
      <SectionHeader
        label="Shop"
        title="Weekly Drop"
        subtitle="Limited cosmetics. First come, first served."
        action={<ShopDropExtras />}
      />

      {!drop ? (
        <div className="surface-card p-12 text-center">
          <p className="text-[var(--text-secondary)]">
            No active drop. Check back Monday noon UTC.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-6 font-display text-xl font-bold">{drop.name}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {((drop.shop_items as unknown[]) ?? []).map((item: unknown) => {
              const si = item as {
                id: string;
                credit_price: number;
                remaining: number;
                supply: number;
                is_sold_out: boolean;
                cosmetics: { name: string; rarity: string };
              };
              const rarity = si.cosmetics?.rarity ?? "common";
              return (
                <div
                  key={si.id}
                  className={`surface-card-hover p-5 ${rarityColors[rarity] ?? ""}`}
                >
                  <Badge variant="gold" className="mb-3 capitalize">
                    {rarity}
                  </Badge>
                  <p className="font-display text-lg font-bold">
                    {si.cosmetics?.name}
                  </p>
                  <p className="mt-3 font-display text-2xl font-extrabold text-gold">
                    {si.credit_price}
                    <span className="ml-1 text-sm font-normal text-[var(--text-secondary)]">
                      credits
                    </span>
                  </p>
                  <p className="mt-1 font-mono text-xs text-[var(--text-secondary)]">
                    {si.remaining}/{si.supply} remaining
                  </p>
                  {si.is_sold_out ? (
                    <p className="mt-4 text-sm text-[var(--text-secondary)]">
                      Sold out
                    </p>
                  ) : (
                    <div className="mt-4">
                      <ShopBuyButton shopItemId={si.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="mt-10 flex gap-4 text-sm">
        <Link href="/shop/drops" className="text-red-400 hover:underline">
          Past drops
        </Link>
        <Link href="/shop/market" className="text-red-400 hover:underline">
          Marketplace →
        </Link>
      </div>
    </PageShell>
  );
}

function ShopBuyButton({ shopItemId }: { shopItemId: string }) {
  return (
    <Button size="sm" className="w-full" asChild>
      <Link href={`/shop/drop?buy=${shopItemId}`}>Buy now</Link>
    </Button>
  );
}
