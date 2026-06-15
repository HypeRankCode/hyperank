"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const platforms = ["twitter", "tiktok", "instagram", "youtube", "twitch"];

export default function SocialSettingsPage() {
  const [handles, setHandles] = useState<Record<string, string>>({});
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  async function generateCode(platform: string) {
    const code = `HYPERANK-${Math.random().toString(36).slice(2, 8)}`;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("social_claims").upsert({
      profile_id: user.id,
      platform,
      handle: handles[platform] ?? "",
      verification_code: code,
    });

    setCodes((c) => ({ ...c, [platform]: code }));
    setMsg(`Post ${code} on your ${platform} profile, then click Verify.`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Social accounts</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Link and verify your profiles.
      </p>

      <div className="mt-6 space-y-6">
        {platforms.map((p) => (
          <div key={p} className="card-glass p-4">
            <Label className="capitalize">{p}</Label>
            <Input
              placeholder="@handle"
              className="mt-1"
              value={handles[p] ?? ""}
              onChange={(e) =>
                setHandles((h) => ({ ...h, [p]: e.target.value }))
              }
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => generateCode(p)}>
                Get code
              </Button>
            </div>
            {codes[p] && (
              <p className="mt-2 font-mono text-xs text-neon">{codes[p]}</p>
            )}
          </div>
        ))}
      </div>
      {msg && <p className="mt-4 text-sm text-[var(--text-secondary)]">{msg}</p>}
    </div>
  );
}
