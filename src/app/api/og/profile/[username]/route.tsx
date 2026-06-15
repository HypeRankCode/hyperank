import { ImageResponse } from "next/og";
import { getProfileByUsername } from "@/lib/supabase/profiles";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: { username: string } }
) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0f",
          color: "#f0f0ff",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 60,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700 }}>@{profile.username}</div>
        <div style={{ fontSize: 28, color: "#ffd700", marginTop: 16 }}>
          {profile.streak_days} day streak
        </div>
        <div style={{ fontSize: 28, color: "#00f5a0", marginTop: 8 }}>
          {profile.hype_score}% hype score
        </div>
        <div style={{ fontSize: 24, color: "#8888aa", marginTop: 24 }}>
          hyperank.ca
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
