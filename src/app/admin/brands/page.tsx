import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminBrandsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Brand accounts</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Grant is_brand flag to approved partners.
      </p>
    </div>
  );
}
