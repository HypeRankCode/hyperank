"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId }: { reportId: string }) {
  const [done, setDone] = useState(false);

  async function update(status: "resolved" | "dismissed") {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report_id: reportId, status }),
    });
    setDone(true);
  }

  if (done) return <span className="text-xs text-[var(--text-secondary)]">Updated</span>;

  return (
    <div className="mt-2 flex gap-2">
      <Button size="sm" variant="secondary" onClick={() => update("resolved")}>
        Resolve
      </Button>
      <Button size="sm" variant="ghost" onClick={() => update("dismissed")}>
        Dismiss
      </Button>
    </div>
  );
}
