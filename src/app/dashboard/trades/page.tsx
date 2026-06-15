import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function TradesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: offers } = await supabase
    .from("trade_offers")
    .select("*")
    .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Trade offers</h1>
      <div className="mt-6 space-y-3">
        {(offers ?? []).map((o) => (
          <div key={o.id} className="card-glass p-4 text-sm">
            <p>Status: {o.status}</p>
            {o.message && (
              <p className="mt-1 text-[var(--text-secondary)]">{o.message}</p>
            )}
          </div>
        ))}
        {!offers?.length && (
          <p className="text-[var(--text-secondary)]">No pending offers.</p>
        )}
      </div>
    </div>
  );
}
