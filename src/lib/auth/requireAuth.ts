import { createClient } from "@/lib/supabase/server";

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.id !== process.env.ADMIN_USER_ID) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
