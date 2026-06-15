import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ShopDropsArchivePage() {
  const supabase = await createClient();
  const { data: drops } = await supabase
    .from("shop_drops")
    .select("id, name, theme, drop_date, ends_at, is_active")
    .order("drop_date", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Drop archive</h1>
      <div className="mt-8 space-y-4">
        {(drops ?? []).map((d) => (
          <div key={d.id} className="card-glass p-4">
            <p className="font-bold">{d.name}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {d.theme} · {new Date(d.drop_date).toLocaleDateString()}
              {d.is_active ? " · Live" : " · Ended"}
            </p>
          </div>
        ))}
        {!drops?.length && (
          <p className="text-[var(--text-secondary)]">No drops yet.</p>
        )}
      </div>
      <Link href="/shop/drop" className="mt-6 inline-block text-hype">
        Current drop
      </Link>
    </div>
  );
}
