import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";

const quickLinks = [
  { href: "/locker", label: "Your Locker", desc: "Avatar & cosmetics", icon: "🎒" },
  { href: "/trends", label: "Vote", desc: "Cast your votes", icon: "🔥" },
  { href: "/shop/drop", label: "Weekly Drop", desc: "Limited items", icon: "✨" },
  { href: "/shop/market", label: "Marketplace", desc: "Buy & sell", icon: "🏪" },
  { href: "/dashboard/trades", label: "Trades", desc: "Pending offers", icon: "🤝" },
  { href: "/settings", label: "Settings", desc: "Account & privacy", icon: "⚙️" },
];

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
    <PageShell>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="hype" className="mb-3">
            Dashboard
          </Badge>
          <h1 className="font-display text-4xl font-extrabold">
            Hey, <span className="text-gradient-fire">{profile.username}</span>
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Your command center. Vote, earn, flex.
          </p>
        </div>
        <Link
          href={`/u/${profile.username}`}
          className="btn-ghost-glow text-sm"
        >
          View public profile →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-red-500/20">
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-secondary)]">
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakDisplay days={profile.streak_days} />
          </CardContent>
        </Card>
        <Card className="border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-secondary)]">
              Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-extrabold text-gold">
              {profile.credits.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-[var(--text-secondary)]">
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-extrabold">
              {profile.correct_predictions}
              <span className="text-lg text-[var(--text-secondary)]">
                /{profile.total_predictions}
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">correct</p>
          </CardContent>
        </Card>
      </div>

      <SectionHeader
        className="mt-12"
        label="Quick nav"
        title="Where to next?"
      />

      <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="surface-card-hover group flex items-center gap-4 p-5"
          >
            <span className="text-2xl">{l.icon}</span>
            <div>
              <p className="font-display font-bold group-hover:text-red-400">
                {l.label}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">{l.desc}</p>
            </div>
          </Link>
        ))}
      </nav>
    </PageShell>
  );
}
