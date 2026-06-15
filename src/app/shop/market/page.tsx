import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ProfileAvatar } from "@/components/ProfileAvatar";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("marketplace_listings")
    .select(
      "id, asking_price, cosmetic_id, serial_number, profiles(username, avatar_url), cosmetics(name, rarity)"
    )
    .eq("is_active", true)
    .order("asking_price", { ascending: true })
    .limit(50);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Marketplace</h1>
        <Link href="/shop/market/list" className="text-sm text-hype">
          List for sale
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(listings ?? []).map((l) => {
          const seller = l.profiles as unknown as {
            username: string;
            avatar_url: string | null;
          };
          const cosmetic = l.cosmetics as unknown as {
            name: string;
            rarity: string;
          };
          return (
            <Link
              key={l.id}
              href={`/shop/market/${l.cosmetic_id}`}
              className="card-glass-hover block p-4"
            >
              <p className="font-bold">{cosmetic?.name}</p>
              <p className="text-xs capitalize text-[var(--text-secondary)]">
                {cosmetic?.rarity}
              </p>
              <p className="mt-2 font-mono text-gold">{l.asking_price} credits</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <ProfileAvatar
                  avatarUrl={seller?.avatar_url}
                  username={seller?.username}
                  size="sm"
                />
                @{seller?.username}
              </div>
            </Link>
          );
        })}
      </div>

      {!listings?.length && (
        <p className="mt-8 text-center text-[var(--text-secondary)]">
          No listings yet.
        </p>
      )}
    </div>
  );
}
