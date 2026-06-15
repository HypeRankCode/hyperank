"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeText } from "@/lib/sanitize";
import { validateUserContent } from "@/lib/moderation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
      supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.username) router.push("/dashboard");
        });
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleaned = sanitizeText(username, 20);
    const validation = validateUserContent(cleaned, 20);
    if (!validation.ok || !/^[a-zA-Z0-9_]{3,20}$/.test(cleaned)) {
      setError("Use 3–20 characters: letters, numbers, underscore.");
      setLoading(false);
      return;
    }

    const ageRaw = sessionStorage.getItem("hyperank_age");
    const ageData = ageRaw ? JSON.parse(ageRaw) : { isMinor: false };

    const supabase = createClient();
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      username: cleaned,
      is_minor: ageData.isMinor ?? false,
      age_verified: true,
      is_public: !ageData.isMinor,
      parent_email: ageData.parentEmail ?? null,
      parental_consent_given: !ageData.isMinor,
    });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "Username taken."
          : "Something went wrong. Try again."
      );
      setLoading(false);
      return;
    }

    sessionStorage.removeItem("hyperank_age");
    router.push("/locker");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Pick a username</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              required
            />
            {error && <p className="text-sm text-hype">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
