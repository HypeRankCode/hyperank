"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { birthYearFromOAuthUser, type AgeResult } from "@/lib/age";
import { BirthYearField } from "@/components/BirthYearField";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

/** For existing accounts missing age_verified — quick one-time screen. */
export default function VerifyAgePage() {
  const router = useRouter();
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);
      const detected = birthYearFromOAuthUser(user);
      if (detected) {
        const year = new Date().getFullYear() - detected;
        setAgeResult({
          birthYear: detected,
          blocked: year < 13,
          isMinor: year >= 13 && year < 18,
        });
      }
      supabase
        .from("profiles")
        .select("age_verified")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.age_verified) router.push("/dashboard");
        });
    });
  }, [router]);

  async function save() {
    if (!ageResult || ageResult.blocked || !userId) {
      setError("Select a valid birth year.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({
        age_verified: true,
        is_minor: ageResult.isMinor,
        is_public: !ageResult.isMinor,
      })
      .eq("id", userId);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-black/50 p-8 backdrop-blur-xl">
        <Logo size="sm" className="mb-6" />
        <h1 className="font-display text-xl font-bold">Quick check</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          What year were you born? Required once for compliance.
        </p>
        <div className="mt-6">
          <BirthYearField onResult={setAgeResult} />
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        <Button className="mt-6 w-full" onClick={save} disabled={loading}>
          Continue
        </Button>
      </div>
    </div>
  );
}
