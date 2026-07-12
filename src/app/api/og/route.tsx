import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

function getTierInfo(score: number) {
  if (score >= 80) return { label: "Clear Head", emoji: "🧠", color: "#10b981" };
  if (score >= 60) return { label: "Slight Fog", emoji: "🌫️", color: "#f59e0b" };
  if (score >= 40) return { label: "Heavy Fog", emoji: "🌁", color: "#f97316" };
  return { label: "Brain Fried", emoji: "🔥", color: "#ef4444" };
}

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const isHome = searchParams.get("home") === "1";
  const score = isHome ? null : parseInt(searchParams.get("s") ?? "0", 10);
  const aiHours = searchParams.get("ai") ?? "";
  const tier = score !== null ? getTierInfo(score) : null;
  const glowColor = tier?.color ?? "#6366f1";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a1a",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${glowColor}18 0%, transparent 70%)`,
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: 22,
            color: "#6366f1",
            fontWeight: 800,
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: isHome ? 32 : 44,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          ⚡ FOGCHECK
        </div>

        {isHome ? (
          /* Home card — no score, brand pitch */
          <>
            <div
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.15,
                maxWidth: 900,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              Are you too deep in AI
            </div>
            <div
              style={{
                fontSize: 54,
                fontWeight: 900,
                color: "#6366f1",
                textAlign: "center",
                lineHeight: 1.15,
                display: "flex",
              }}
            >
              to think straight?
            </div>
            <div
              style={{
                marginTop: 28,
                fontSize: 24,
                color: "#6b7280",
                textAlign: "center",
                display: "flex",
              }}
            >
              90-second cognitive load test for developers
            </div>
            <div
              style={{
                marginTop: 40,
                display: "flex",
                gap: 24,
              }}
            >
              {["🧠 Memory", "🐛 Bug Spot", "⚡ Decision Speed"].map((label) => (
                <div
                  key={label}
                  style={{
                    padding: "12px 24px",
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.35)",
                    borderRadius: 50,
                    fontSize: 20,
                    color: "#a5b4fc",
                    fontWeight: 700,
                    display: "flex",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Score card */
          <>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                lineHeight: 1,
                gap: 4,
              }}
            >
              <span style={{ fontSize: 150, fontWeight: 900, color: tier!.color, lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: 64, fontWeight: 700, color: tier!.color, marginBottom: 20 }}>
                %
              </span>
            </div>
            <div
              style={{
                fontSize: 44,
                fontWeight: 900,
                color: "#ffffff",
                marginTop: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {tier!.emoji} {tier!.label}
            </div>
            {aiHours && (
              <div
                style={{
                  fontSize: 22,
                  color: "#6b7280",
                  marginTop: 18,
                  display: "flex",
                }}
              >
                After {aiHours} of AI coding tools
              </div>
            )}
          </>
        )}

        {/* Bottom tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 18,
            color: "#374151",
            display: "flex",
            letterSpacing: 1,
          }}
        >
          fogcheck.vercel.app · AI Cognitive Load Test · 90 seconds, no signup
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
