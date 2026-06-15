import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export default async function AdminModerationPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Moderation</h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Ban, mute, or warn users. Use Supabase dashboard for direct edits until UI is expanded.
      </p>
    </div>
  );
}
