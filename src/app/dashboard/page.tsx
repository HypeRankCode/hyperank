import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="text-[var(--text-secondary)]">@{profile.username}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <StreakDisplay days={profile.streak_days} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl text-gold">{profile.credits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono">
              {profile.correct_predictions}/{profile.total_predictions} correct
            </p>
          </CardContent>
        </Card>
      </div>

      <nav className="mt-8 grid gap-2 sm:grid-cols-2">
        {[
          { href: "/locker", label: "Your Locker" },
          { href: "/trends", label: "Vote on trends" },
          { href: "/shop/drop", label: "Weekly drop" },
          { href: "/shop/market", label: "Marketplace" },
          { href: "/dashboard/trades", label: "Trade offers" },
          { href: "/settings", label: "Settings" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="card-glass p-4 text-hype hover:border-hype/30"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
