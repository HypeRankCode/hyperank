import type { User } from "@supabase/supabase-js";

export interface AgeResult {
  isMinor: boolean;
  blocked: boolean;
  birthYear: number;
}

export function ageFromBirthYear(birthYear: number): AgeResult {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return {
    birthYear,
    blocked: age < 13,
    isMinor: age >= 13 && age < 18,
  };
}

/** Best-effort: Google/Discord rarely expose DOB in default scopes. */
export function birthYearFromOAuthUser(user: User): number | null {
  const meta = user.user_metadata ?? {};
  const candidates = [
    meta.birthday,
    meta.birthdate,
    meta.date_of_birth,
    meta.dob,
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const match = String(raw).match(/(\d{4})/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year > 1900 && year <= new Date().getFullYear()) return year;
    }
  }
  return null;
}

export function birthYearOptions(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: 100 }, (_, i) => current - 13 - i);
}
