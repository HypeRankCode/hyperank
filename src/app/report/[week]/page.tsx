import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";

export default async function WeekReportPage({
  params,
}: {
  params: { week: string };
}) {
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("week_start", params.week)
    .single();

  if (!report) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Week of {params.week}</h1>
      <div className="card-glass mt-8 space-y-4 p-6">
        <p>Biggest riser: {report.biggest_riser_id ?? "—"}</p>
        <p>Biggest faller: {report.biggest_faller_id ?? "—"}</p>
        <p>Most controversial: {report.most_controversial_id ?? "—"}</p>
      </div>
      <AdSlot slot="report-bottom" />
    </div>
  );
}
