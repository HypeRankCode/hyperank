"use client";

import { useState } from "react";
import { birthYearOptions, ageFromBirthYear, type AgeResult } from "@/lib/age";

interface BirthYearFieldProps {
  onResult: (result: AgeResult) => void;
  defaultYear?: number | null;
  compact?: boolean;
}

export function BirthYearField({
  onResult,
  defaultYear,
  compact,
}: BirthYearFieldProps) {
  const [year, setYear] = useState(
    defaultYear ? String(defaultYear) : ""
  );
  const [error, setError] = useState("");

  function handleChange(value: string) {
    setYear(value);
    setError("");
    const y = parseInt(value, 10);
    if (!y) return;
    const result = ageFromBirthYear(y);
    if (result.blocked) {
      setError("You need to be 13 or older.");
      return;
    }
    onResult(result);
  }

  return (
    <div className={compact ? "" : "space-y-2"}>
      {!compact && (
        <label className="text-sm text-[var(--text-secondary)]">
          Birth year <span className="text-white/40">(required once)</span>
        </label>
      )}
      <select
        value={year}
        onChange={(e) => handleChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 text-sm text-zinc-100 focus:border-[var(--border-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-hype)]/20"
      >
        <option value="" className="bg-[#111]">
          Select year
        </option>
        {birthYearOptions().map((y) => (
          <option key={y} value={y} className="bg-[#111]">
            {y}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
