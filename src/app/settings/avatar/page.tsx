"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { RPMEditor } from "@/components/RPMEditor";

export default function AvatarSettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  if (!userId) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Avatar</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Rebuild your character with Ready Player Me.
      </p>
      <div className="mt-6">
        <RPMEditor userId={userId} />
      </div>
    </div>
  );
}
