"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getTier } from "@/lib/tests";
import { calcPercentile, type FogStats } from "@/lib/redis";
import { getHistory, getStreak, type HistoryEntry } from "@/lib/history";

export default function ResultCard() {
  const params = useSearchParams();
  const score = parseInt(params.get("s") ?? "0", 10);
  const aiHours = params.get("ai") ?? "";
  const tier = getTier(score);
  const isShared = params.get("shared") === "1";
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<FogStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [streak, setStreak] = useState({ count: 0, active: false });

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((s: FogStats) => { if (s.total >= 5) setStats(s); })
      .catch(() => {});
    const h = getHistory();
    setHistory(h);
    setStreak(getStreak());
  }, []);

  function copyLink() {
    if (typeof window === "undefined") return;
    const base = window.location.href.replace(/[&?]shared=1/, "");
    const sep = base.includes("?") ? "&" : "?";
    const url = `${base}${sep}shared=1`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const baseUrl = typeof window !== "undefined"
    ? window.location.href.replace(/[&?]shared=1/, "")
    : "";
  const shareText = `My AI cognitive load score: ${score}% — ${tier.emoji} ${tier.label}\n\nAfter ${aiHours} of AI coding tools.\n\nTest yours (90 seconds, no signup):`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(baseUrl)}`;

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ maxWidth: 500, width: "100%" }}>

        {/* Shared banner — shown only when arriving via a shared link */}
        {isShared && (
          <div style={{
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.25)",
            borderRadius: 16,
            padding: "18px 24px",
            marginBottom: 20,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 13, color: "#a5b4fc", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: 2 }}>
              Someone shared their result
            </div>
            <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 14 }}>
              How foggy is <em>your</em> brain after AI coding today?
            </div>
            <Link
              href="/test"
              className="btn-primary"
              style={{ textDecoration: "none", display: "inline-block", padding: "10px 28px", fontSize: 15 }}
            >
              Take the 90-second test →
            </Link>
          </div>
        )}

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
          {/* Badges row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)",
              borderRadius: 100, padding: "5px 16px",
            }}>
              <span style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase" }}>
                {isShared ? "Their Cognitive Load" : "Cognitive Load Report"}
              </span>
            </div>
            {!isShared && streak.count >= 2 && (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)",
                borderRadius: 100, padding: "5px 14px",
              }}>
                <span style={{ fontSize: 14 }}>🔥</span>
                <span style={{ fontSize: 12, color: "#fbbf24", fontWeight: 800 }}>
                  Day {streak.count} streak
                </span>
              </div>
            )}
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

          {/* Live percentile */}
          {stats && (() => {
            const pct = calcPercentile(score, stats);
            return pct >= 0 ? (
              <div style={{
                marginTop: 20,
                background: "rgba(34,211,238,0.08)",
                border: "1px solid rgba(34,211,238,0.2)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "#22d3ee",
                fontWeight: 700,
              }}>
                📊 You scored higher than {pct}% of {stats.total.toLocaleString()} developers
              </div>
            ) : null;
          })()}

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

          {/* History sparkline — only shown to the person who took the test */}
          {!isShared && history.length >= 2 && (() => {
            const recent = history.slice(0, 7).reverse(); // oldest → newest (current is last)
            const prev = history[1]; // history[0] is current, [1] is previous
            const delta = score - prev.score;
            const tierColor = (s: number) =>
              s >= 80 ? "#10b981" : s >= 60 ? "#f59e0b" : s >= 40 ? "#f97316" : "#ef4444";
            return (
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
                    Your history
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 800,
                    color: delta >= 0 ? "#10b981" : "#ef4444",
                  }}>
                    {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)} pts from last session
                  </span>
                </div>
                {/* Sparkline bars */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 44, justifyContent: "center" }}>
                  {recent.map((entry, i) => {
                    const isCurrent = i === recent.length - 1;
                    return (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{
                          width: isCurrent ? 18 : 14,
                          height: Math.max(6, Math.round(entry.score * 0.38)),
                          background: isCurrent ? tierColor(entry.score) : tierColor(entry.score) + "80",
                          borderRadius: 3,
                          border: isCurrent ? `2px solid ${tierColor(entry.score)}` : "none",
                          transition: "height 0.4s ease",
                        }} />
                        <span style={{ fontSize: 9, color: isCurrent ? tierColor(entry.score) : "var(--muted)", fontWeight: isCurrent ? 900 : 600 }}>
                          {entry.score}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Watermark */}
          <div style={{ marginTop: 20, fontSize: 12, color: "var(--muted)" }}>
            fogcheck.vercel.app · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {isShared ? (
            <>
              <Link
                href="/test"
                className="btn-primary"
                style={{ textDecoration: "none", width: "100%", fontSize: 16 }}
              >
                Test my own brain →
              </Link>
              <Link href="/" className="btn-ghost" style={{ width: "100%", textDecoration: "none" }}>
                ← Home
              </Link>
            </>
          ) : (
            <>
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
                {history.length >= 2 && history[1].score < score
                  ? `Test again — beat your ${history[1].score}% →`
                  : history.length >= 2 && history[1].score > score
                  ? `Try again — recover your ${history[1].score}% →`
                  : "Test again"}
              </Link>
              <Link href="/" className="btn-ghost" style={{ width: "100%", textDecoration: "none" }}>
                ← Home
              </Link>
            </>
          )}
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
