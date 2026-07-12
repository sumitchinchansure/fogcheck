import Link from "next/link";
import type { Metadata } from "next";
import { getStats } from "@/lib/redis";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "FogCheck — Are you too deep in AI to think straight?",
  description: "90-second cognitive load test for developers using AI. Find out if your brain is still sharp or if it's time to step away.",
};

export default async function HomePage() {
  const stats = await getStats();
  const showLive = stats && stats.total >= 5;

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", minHeight: "100vh" }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 100, padding: "6px 18px", marginBottom: 32,
        }}>
          <span style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase" }}>
            AI Cognitive Load Test
          </span>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 900, lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-1px" }}>
          Is your brain still{" "}
          <span style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            running the show?
          </span>
        </h1>

        <p style={{ fontSize: 18, color: "var(--muted)", lineHeight: 1.6, margin: "0 0 40px" }}>
          AI removes the friction that used to force breaks. You keep prompting. Your brain quietly degrades.{" "}
          <strong style={{ color: "var(--text)" }}>90 seconds.</strong> Find out where you actually are.
        </p>

        {/* Live stats — shown once enough data exists */}
        {showLive ? (
          <div style={{
            display: "flex", justifyContent: "center", gap: 0, marginBottom: 40,
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
            overflow: "hidden",
          }}>
            {[
              { n: stats.total.toLocaleString(), label: "developers tested" },
              { n: `${stats.avgScore}%`, label: "global average" },
              {
                n: `${Math.round((stats.tiers.clear / stats.total) * 100)}%`,
                label: "scored Clear Head",
              },
            ].map(({ n, label }, idx) => (
              <div key={label} style={{
                flex: 1, textAlign: "center", padding: "18px 8px",
                borderLeft: idx > 0 ? "1px solid var(--border)" : undefined,
              }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "var(--accent2)" }}>{n}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 40, flexWrap: "wrap" }}>
            {[
              { n: "90s", label: "to complete" },
              { n: "3", label: "cognitive tasks" },
              { n: "0", label: "installs needed" },
            ].map(({ n, label }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--accent2)" }}>{n}</div>
                <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        <Link href="/test" className="btn-primary" style={{ fontSize: 18, padding: "18px 48px", borderRadius: 16, textDecoration: "none", display: "inline-block" }}>
          Check my cognitive load →
        </Link>

        <p style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
          No signup. Anonymous scores only.
        </p>

        {/* What it tests */}
        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, textAlign: "left" }}>
          {[
            { icon: "🧠", title: "Memory", desc: "Short-term recall under cognitive load" },
            { icon: "🐛", title: "Pattern speed", desc: "How fast you spot problems in code" },
            { icon: "⚡", title: "Decision clarity", desc: "Speed and accuracy under pressure" },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px 16px" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
