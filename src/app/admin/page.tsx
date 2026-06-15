import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { BackLink } from "@/components/BackLink";
import Link from "next/link";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const supabase = await createClient();
  const { count: trendCount } = await supabase
    .from("trends")
    .select("*", { count: "exact", head: true });
  const { count: voteCount } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true });
  const { count: reportCount } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const links = [
    { href: "/admin/trends", label: "Trends" },
    { href: "/admin/battles", label: "Battles" },
    { href: "/admin/sponsored", label: "Sponsored" },
    { href: "/admin/brands", label: "Brands" },
    { href: "/admin/drops", label: "Drops" },
    { href: "/admin/reports", label: `Reports (${reportCount ?? 0})` },
    { href: "/admin/moderation", label: "Moderation" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BackLink href="/" label="Home" />
      <h1 className="mt-4 font-display text-3xl font-bold">Admin</h1>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="card-glass p-4">
          <p className="text-2xl font-mono">{trendCount ?? 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">trends</p>
        </div>
        <div className="card-glass p-4">
          <p className="text-2xl font-mono">{voteCount ?? 0}</p>
          <p className="text-sm text-[var(--text-secondary)]">votes</p>
        </div>
      </div>
      <nav className="mt-8 grid gap-2 sm:grid-cols-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="card-glass p-4 text-hype">
            {l.label}
          </Link>
        ))}
      </nav>
      <form action="/api/seed/trends" method="POST" className="mt-8">
        <SeedTrendsButton />
      </form>
    </div>
  );
}

function SeedTrendsButton() {
  return (
    <button
      type="submit"
      className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:border-hype/50"
    >
      Seed trends from JSON (requires CRON_SECRET header — use API directly)
    </button>
  );
}
