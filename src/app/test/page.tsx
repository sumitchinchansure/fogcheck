"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  MEMORY_TASK, pickBugspotTask, pickDecisionTasks,
  calcScore, getTier,
  type BugspotTask, type DecisionTask,
} from "@/lib/tests";

type Phase =
  | "aiHours"
  | "memoryShow"
  | "memoryDistract"
  | "memoryRecall"
  | "bugspot"
  | "decisions"
  | "done";

const AI_HOUR_OPTIONS = ["< 30 min", "1 hour", "2 hours", "3+ hours"];

export default function TestPage() {
  const router = useRouter();
  const startMs = useRef(Date.now());

  const [phase, setPhase] = useState<Phase>("aiHours");
  const [aiHours, setAiHours] = useState("");
  const [showTimer, setShowTimer] = useState(5);
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [wordInput, setWordInput] = useState("");
  const [distractorInput, setDistractorInput] = useState("");

  const bugTask = useRef<BugspotTask>(pickBugspotTask());
  const [selectedBugLine, setSelectedBugLine] = useState<number | null>(null);
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const bugStartMs = useRef(0);

  const decisionTasks = useRef<DecisionTask[]>(pickDecisionTasks(3));
  const [decisionIdx, setDecisionIdx] = useState(0);
  const [decisionAnswers, setDecisionAnswers] = useState<(0|1)[]>([]);
  const decisionStartMs = useRef(0);
  const [decisionTimes, setDecisionTimes] = useState<number[]>([]);

  const [memScore, setMemScore] = useState(0);
  const [bugScore, setBugScore] = useState(0);

  // Memory show countdown
  useEffect(() => {
    if (phase !== "memoryShow") return;
    if (showTimer <= 0) { setPhase("memoryDistract"); return; }
    const t = setTimeout(() => setShowTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, showTimer]);

  // Bug timing start
  useEffect(() => {
    if (phase === "bugspot") bugStartMs.current = Date.now();
    if (phase === "decisions") decisionStartMs.current = Date.now();
  }, [phase]);

  const submitMemory = useCallback(() => {
    const words = wordInput.toLowerCase().split(/[\s,]+/).map(w => w.trim()).filter(Boolean);
    const correct = words.filter(w => MEMORY_TASK.words.includes(w)).length;
    setRecalledWords(words);
    setMemScore(correct / MEMORY_TASK.words.length);
    setPhase("bugspot");
  }, [wordInput]);

  const submitBug = useCallback(() => {
    if (selectedBugLine === null) return;
    const elapsed = Date.now() - bugStartMs.current;
    const correct = selectedBugLine === bugTask.current.bugLine;
    const speedBonus = correct ? Math.max(0, 1 - elapsed / 30000) * 0.3 : 0;
    setBugScore(correct ? 0.7 + speedBonus : 0);
    setBugSubmitted(true);
    setTimeout(() => setPhase("decisions"), 1200);
  }, [selectedBugLine]);

  const submitDecision = useCallback((choice: 0 | 1) => {
    const elapsed = Date.now() - decisionStartMs.current;
    setDecisionTimes(t => [...t, elapsed]);
    setDecisionAnswers(a => [...a, choice]);
    decisionStartMs.current = Date.now();
    if (decisionIdx + 1 >= decisionTasks.current.length) {
      setPhase("done");
    } else {
      setDecisionIdx(i => i + 1);
    }
  }, [decisionIdx]);

  // Navigate to result when done
  useEffect(() => {
    if (phase !== "done") return;
    const correct = decisionAnswers.filter((a, i) => a === decisionTasks.current[i].correct).length;
    const avgTime = decisionTimes.reduce((a, b) => a + b, 0) / decisionTimes.length;
    const speedBonus = Math.max(0, 1 - avgTime / 10000) * 0.2;
    const decScore = (correct / decisionTasks.current.length) * 0.8 + speedBonus;
    const total = calcScore({ memoryScore: memScore, bugScore, decisionScore: decScore, aiHours, durationMs: Date.now() - startMs.current });
    const tier = getTier(total);
    // Fire-and-forget: record anonymous result for live stats
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: total, tier: tier.label }),
    }).catch(() => {});
    router.push(`/result?s=${total}&ai=${encodeURIComponent(aiHours)}&tier=${encodeURIComponent(tier.label)}`);
  }, [phase]); // eslint-disable-line

  const progress = { aiHours: 0, memoryShow: 15, memoryDistract: 30, memoryRecall: 45, bugspot: 60, decisions: 80, done: 100 }[phase];

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>

        {/* Progress */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>FogCheck</span>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* === AI Hours === */}
        {phase === "aiHours" && (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>🤖</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Before we start</h2>
            <p style={{ color: "var(--muted)", marginBottom: 28 }}>How long have you been using AI coding tools today?</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {AI_HOUR_OPTIONS.map(opt => (
                <button key={opt} onClick={() => { setAiHours(opt); setPhase("memoryShow"); }}
                  style={{
                    padding: "16px", borderRadius: 12, border: "1px solid var(--border)",
                    background: "var(--surface2)", color: "var(--text)", cursor: "pointer",
                    fontWeight: 700, fontSize: 15, transition: "border-color 0.15s",
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onMouseOut={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === Memory Show === */}
        {phase === "memoryShow" && (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--accent2)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Task 1 of 3 — Memory</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Memorise these words</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>Disappearing in {showTimer}s</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
              {MEMORY_TASK.words.map(w => (
                <span key={w} style={{
                  padding: "10px 20px", borderRadius: 10,
                  background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)",
                  fontWeight: 800, fontSize: 18, color: "#a5b4fc",
                }}>{w}</span>
              ))}
            </div>
          </div>
        )}

        {/* === Memory Distractor === */}
        {phase === "memoryDistract" && (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--accent2)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Quick distractor</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>{MEMORY_TASK.distractor.question}</h2>
            <input
              type="number"
              value={distractorInput}
              onChange={e => setDistractorInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") setPhase("memoryRecall"); }}
              placeholder="Type your answer..."
              autoFocus
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "1px solid var(--border)", background: "var(--surface2)",
                color: "var(--text)", fontSize: 18, textAlign: "center", outline: "none",
              }}
            />
            <button className="btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={() => setPhase("memoryRecall")}>
              Next →
            </button>
          </div>
        )}

        {/* === Memory Recall === */}
        {phase === "memoryRecall" && (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--accent2)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Task 1 of 3 — Memory</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>What were the 5 words?</h2>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>Type them separated by spaces or commas</p>
            <textarea
              value={wordInput}
              onChange={e => setWordInput(e.target.value)}
              placeholder="e.g. socket, deploy, branch..."
              rows={3}
              autoFocus
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12,
                border: "1px solid var(--border)", background: "var(--surface2)",
                color: "var(--text)", fontSize: 15, resize: "none", outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button className="btn-primary" style={{ marginTop: 16, width: "100%" }} onClick={submitMemory} disabled={!wordInput.trim()}>
              Submit →
            </button>
          </div>
        )}

        {/* === Bug Spot === */}
        {phase === "bugspot" && (
          <div className="card">
            <div style={{ fontSize: 13, color: "var(--accent2)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Task 2 of 3 — Bug Spot</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{bugTask.current.prompt}</h2>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 20 }}>Click the buggy line. Faster = better score.</p>
            <div style={{ fontFamily: "monospace", fontSize: 14, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
              {bugTask.current.lines.map((line, i) => {
                const isSelected = selectedBugLine === i;
                const isCorrect = bugSubmitted && i === bugTask.current.bugLine;
                const isWrong = bugSubmitted && isSelected && !isCorrect;
                return (
                  <div
                    key={i}
                    onClick={() => { if (!bugSubmitted) setSelectedBugLine(i); }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "10px 16px", cursor: bugSubmitted ? "default" : "pointer",
                      background: isCorrect ? "rgba(16,185,129,0.15)" : isWrong ? "rgba(239,68,68,0.15)" : isSelected ? "rgba(99,102,241,0.15)" : i % 2 === 0 ? "var(--surface2)" : "var(--surface)",
                      borderLeft: `3px solid ${isCorrect ? "#10b981" : isWrong ? "#ef4444" : isSelected ? "#6366f1" : "transparent"}`,
                      transition: "background 0.12s",
                    }}
                  >
                    <span style={{ color: "var(--muted)", minWidth: 20, userSelect: "none", fontSize: 12, paddingTop: 1 }}>{i + 1}</span>
                    <span style={{ color: isCorrect ? "#10b981" : isWrong ? "#ef4444" : "#e2e8f0", whiteSpace: "pre-wrap" }}>{line || " "}</span>
                  </div>
                );
              })}
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 20, width: "100%" }}
              onClick={submitBug}
              disabled={selectedBugLine === null || bugSubmitted}
            >
              {bugSubmitted ? "✓ Checking..." : "Submit →"}
            </button>
          </div>
        )}

        {/* === Decisions === */}
        {phase === "decisions" && decisionIdx < decisionTasks.current.length && (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--accent2)", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Task 3 of 3 — Decision Speed</div>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>Question {decisionIdx + 1} of {decisionTasks.current.length}</p>
            <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 28, lineHeight: 1.4 }}>
              {decisionTasks.current[decisionIdx].question}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {decisionTasks.current[decisionIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => submitDecision(i as 0|1)}
                  style={{
                    padding: "16px 20px", borderRadius: 12, border: "1px solid var(--border)",
                    background: "var(--surface2)", color: "var(--text)", cursor: "pointer",
                    fontWeight: 600, fontSize: 15, textAlign: "left", transition: "border-color 0.12s",
                    lineHeight: 1.4,
                  }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                  onMouseOut={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <span style={{ color: "var(--muted)", marginRight: 10 }}>{i === 0 ? "A" : "B"}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* === Done === */}
        {phase === "done" && (
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>⚙️</div>
            <p style={{ marginTop: 16, color: "var(--muted)" }}>Calculating your score...</p>
          </div>
        )}
      </div>
    </main>
  );
}
