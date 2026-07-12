"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { getTier } from "@/lib/tests";

export default function ResultCard() {
  const params = useSearchParams();
  const score = parseInt(params.get("s") ?? "0", 10);
  const aiHours = params.get("ai") ?? "";
  const tier = getTier(score);
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const shareText = `My AI cognitive load score: ${score}% — ${tier.emoji} ${tier.label}\n\nAfter ${aiHours} of AI coding tools.\n\nTest yours (90 seconds, no signup):`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ maxWidth: 500, width: "100%" }}>

        {/* Score card */}
        <div style={{
          background: "var(--surface)",
          border: `2px solid ${tier.color}40`,
          borderRadius: 24,
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: `0 0 48px ${tier.color}20`,
          marginBottom: 24,
        }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 100, padding: "5px 16px", marginBottom: 24,
          }}>
            <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase" }}>
              Cognitive Load Report
            </span>
          </div>

          {/* Big score */}
          <div style={{ fontSize: 80, fontWeight: 900, lineHeight: 1, color: tier.color, marginBottom: 4 }}>
            {score}
            <span style={{ fontSize: 36, fontWeight: 700 }}>%</span>
          </div>

          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
            {tier.emoji} {tier.label}
          </div>

          {aiHours && (
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
              After {aiHours} of AI coding tools
            </div>
          )}

          <div style={{ height: 1, background: "var(--border)", margin: "20px 0" }} />

          {/* Advice */}
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text)", fontWeight: 600, margin: 0 }}>
            {tier.advice}
          </p>

          {/* Score bar */}
          <div style={{ marginTop: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--muted)" }}>
              <span>Brain Fried</span>
              <span>Clear Head</span>
            </div>
            <div style={{ height: 10, background: "var(--surface2)", borderRadius: 10, overflow: "hidden", position: "relative" }}>
              <div style={{
                height: "100%",
                width: `${score}%`,
                borderRadius: 10,
                background: `linear-gradient(90deg, #ef4444, #f59e0b, #10b981)`,
                transition: "width 1s ease",
              }} />
              <div style={{
                position: "absolute",
                left: `${Math.min(score, 96)}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 14, height: 14,
                background: tier.color,
                borderRadius: "50%",
                border: "2px solid var(--surface)",
              }} />
            </div>
          </div>

          {/* Watermark */}
          <div style={{ marginTop: 24, fontSize: 12, color: "var(--muted)" }}>
            fogcheck.vercel.app · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ textDecoration: "none", width: "100%", fontSize: 16 }}
          >
            𝕏 Share on X
          </a>
          <button
            onClick={copyLink}
            className="btn-ghost"
            style={{ width: "100%", fontSize: 16, cursor: "pointer" }}
          >
            {copied ? "✓ Link copied!" : "🔗 Copy link"}
          </button>
          <Link href="/test" className="btn-ghost" style={{ width: "100%", textDecoration: "none" }}>
            Test again
          </Link>
          <Link href="/" className="btn-ghost" style={{ width: "100%", textDecoration: "none" }}>
            ← Home
          </Link>
        </div>

        {/* Tiers guide */}
        <div style={{ marginTop: 32, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px" }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Score guide</p>
          {[
            { range: "80–100%", label: "Clear Head 🧠", color: "#10b981" },
            { range: "60–79%", label: "Slight Fog 🌫️", color: "#f59e0b" },
            { range: "40–59%", label: "Heavy Fog 🌁", color: "#f97316" },
            { range: "0–39%", label: "Brain Fried 🔥", color: "#ef4444" },
          ].map(({ range, label, color }) => (
            <div key={range} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
              <span style={{ color: "var(--muted)" }}>{range}</span>
              <span style={{ color, fontWeight: 700 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
