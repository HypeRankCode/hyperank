import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StreakDisplay } from "@/components/StreakDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell, SectionHeader } from "@/components/PageShell";

const quickLinks = [
  { href: "/locker", label: "Locker", desc: "Avatar and cosmetics" },
  { href: "/trends", label: "Trends", desc: "Cast your votes" },
  { href: "/shop/drop", label: "Weekly drop", desc: "Limited releases" },
  { href: "/shop/market", label: "Marketplace", desc: "Buy and list items" },
  { href: "/dashboard/trades", label: "Trades", desc: "Pending offers" },
  { href: "/settings", label: "Settings", desc: "Account and privacy" },
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
          <p className="section-label mb-2">Dashboard</p>
          <h1 className="font-display text-3xl font-semibold text-zinc-50">
            {profile.username}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Overview of your activity and account.
          </p>
        </div>
        <ButtonLink href={`/u/${profile.username}`}>Public profile</ButtonLink>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
              Voting streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StreakDisplay days={profile.streak_days} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
              Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold tabular-nums text-[var(--accent-gold)]">
              {profile.credits.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-[var(--text-secondary)]">
              Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold tabular-nums text-zinc-100">
              {profile.correct_predictions}
              <span className="text-base font-normal text-[var(--text-secondary)]">
                /{profile.total_predictions}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">correct</p>
          </CardContent>
        </Card>
      </div>

      <SectionHeader
        className="mt-10 border-0 pb-0"
        label="Navigation"
        title="Quick links"
      />

      <nav className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="surface-card-hover group p-4"
          >
            <p className="font-medium text-zinc-100 group-hover:text-[var(--accent-hype)]">
              {l.label}
            </p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              {l.desc}
            </p>
          </Link>
        ))}
      </nav>
    </PageShell>
  );
}

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-ghost-glow text-sm">
      {children}
    </Link>
  );
}
