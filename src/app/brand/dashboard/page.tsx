import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function BrandDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_brand, brand_display_name")
    .eq("id", user.id)
    .single();

  if (!profile?.is_brand) redirect("/brand/apply");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">
        {profile.brand_display_name ?? "Brand"} Dashboard
      </h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Submit sponsored trends and view performance.
      </p>
    </div>
  );
}
