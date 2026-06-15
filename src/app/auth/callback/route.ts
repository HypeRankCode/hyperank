import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, age_verified")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile?.username) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
        if (!profile.age_verified) {
          return NextResponse.redirect(`${origin}/onboarding/age`);
        }
        return NextResponse.redirect(`${origin}${redirect}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
