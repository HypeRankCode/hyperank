export { requireAdmin, requireAuth } from "./requireAuth";

export async function requireBrand() {
  const { requireAuth } = await import("./requireAuth");
  const user = await requireAuth();
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_brand")
    .eq("id", user.id)
    .single();
  if (!profile?.is_brand) throw new Error("FORBIDDEN");
  return user;
}
