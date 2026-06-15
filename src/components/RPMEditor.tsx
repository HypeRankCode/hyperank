"use client";

import { useEffect } from "react";

export function RPMEditor({ userId }: { userId: string }) {
  const subdomain = process.env.NEXT_PUBLIC_RPM_SUBDOMAIN ?? "hyperank";

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.data?.source !== "readyplayerme") return;
      const url = event.data?.data?.url;
      if (url) {
        fetch("/api/avatar", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar_rpm_url: url }),
        }).then(() => window.location.reload());
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="card-glass overflow-hidden rounded-xl">
      <iframe
        src={`https://${subdomain}.readyplayer.me/avatar?frameApi`}
        className="h-[600px] w-full border-0"
        allow="camera *; microphone *; clipboard-write"
      />
    </div>
  );
}
