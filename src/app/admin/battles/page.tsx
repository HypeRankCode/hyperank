import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { AdminBattleForm } from "@/components/AdminBattleForm";

export default async function AdminBattlesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: trends } = await supabase
    .from("trends")
    .select("id, name")
    .eq("status", "active")
    .limit(100);

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Create battle</h1>
      <AdminBattleForm trends={trends ?? []} />
    </div>
  );
}
