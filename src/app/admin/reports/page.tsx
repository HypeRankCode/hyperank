import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminReportsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Reports</h1>
      <div className="mt-6 space-y-3">
        {(reports ?? []).map((r) => (
          <div key={r.id} className="card-glass p-4 text-sm">
            <p>
              <strong>{r.content_type}</strong> · {r.reason}
            </p>
            {r.details && <p className="mt-1 text-[var(--text-secondary)]">{r.details}</p>}
          </div>
        ))}
        {!reports?.length && (
          <p className="text-[var(--text-secondary)]">No pending reports.</p>
        )}
      </div>
    </div>
  );
}
