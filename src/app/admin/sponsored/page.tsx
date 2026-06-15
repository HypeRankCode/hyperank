import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminSponsoredPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Sponsored placements</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Manage brand sponsorships and approve requests.
      </p>
    </div>
  );
}
