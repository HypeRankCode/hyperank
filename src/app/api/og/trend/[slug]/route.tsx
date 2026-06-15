import { ImageResponse } from "next/og";
import { getTrendBySlug } from "@/lib/supabase/trends";

export const runtime = "edge";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const trend = await getTrendBySlug(params.slug);
  if (!trend) {
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
        <div style={{ fontSize: 48, fontWeight: 700 }}>{trend.name}</div>
        <div style={{ fontSize: 32, color: "#ff3c6e", marginTop: 20 }}>
          {trend.hype_score}% hype
        </div>
        <div style={{ fontSize: 24, color: "#8888aa", marginTop: 20 }}>
          hyperank.ca
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
