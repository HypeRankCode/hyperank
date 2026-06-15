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
        className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white backdrop-blur-sm focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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
