import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

export default async function ReportPage() {
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("weekly_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Weekly Hype Report</h1>
      {!report ? (
        <p className="mt-4 text-[var(--text-secondary)]">
          No reports generated yet.
        </p>
      ) : (
        <div className="card-glass mt-8 p-6">
          <p className="text-sm text-[var(--text-secondary)]">
            {report.week_start} — {report.week_end}
          </p>
          <Link
            href={`/report/${report.week_start}`}
            className="mt-4 inline-block text-hype"
          >
            Read full report
          </Link>
        </div>
      )}
      <AdSlot slot="report-bottom" />
    </div>
  );
}
