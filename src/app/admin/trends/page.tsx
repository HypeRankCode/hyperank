import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminTrendsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Trend queue</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Approve user-submitted trends here. Submissions coming in a future update.
      </p>
    </div>
  );
}
