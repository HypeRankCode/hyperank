"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function PrivacySettingsPage() {
  const [isPublic, setIsPublic] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("is_public")
        .eq("id", user.id)
        .single();
      if (data) setIsPublic(data.is_public);
    });
  }, []);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ is_public: isPublic })
        .eq("id", user.id);
    }
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Privacy</h1>
      <label className="mt-6 flex items-center gap-3">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <span>Public profile</span>
      </label>
      <Button className="mt-6" onClick={save} disabled={saving}>
        Save
      </Button>
    </div>
  );
}
