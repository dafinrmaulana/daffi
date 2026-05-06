import { ImageResponse } from "next/og"

export const runtime = "edge"

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#0a0a0a",
          padding: 64,
          fontFamily: "Arial",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 0 }}>Dafi Portfolio</div>
        <div style={{ fontSize: 96, lineHeight: 0.95, maxWidth: 900 }}>
          Precise web interfaces for product teams.
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
