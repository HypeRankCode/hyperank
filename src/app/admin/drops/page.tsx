import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminDropsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Shop drops</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Create weekly drops and add items from the cosmetics catalog.
      </p>
    </div>
  );
}
