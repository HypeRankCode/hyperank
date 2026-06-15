import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { AdminDropForm } from "@/components/AdminDropForm";
import { BackLink } from "@/components/BackLink";

export default async function AdminDropsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: cosmetics } = await supabase.from("cosmetics").select("id, name, rarity, cost_credits");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BackLink href="/admin" label="Admin" />
      <h1 className="mt-4 font-display text-2xl font-bold">Shop drops</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Create a new active drop. Previous drops are deactivated automatically.
      </p>
      <AdminDropForm cosmetics={cosmetics ?? []} />
    </div>
  );
}
