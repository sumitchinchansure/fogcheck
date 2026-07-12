export type TaskKind = "memory" | "bugspot" | "decision";

export interface MemoryTask {
  kind: "memory";
  words: string[];
  distractor: { question: string; answer: number };
}

export interface BugspotTask {
  kind: "bugspot";
  prompt: string;
  snippet: string;
  lines: string[];
  bugLine: number; // 0-indexed
  language: string;
}

export interface DecisionTask {
  kind: "decision";
  question: string;
  options: [string, string];
  correct: 0 | 1;
  hint?: string;
}

export type Task = MemoryTask | BugspotTask | DecisionTask;

export const MEMORY_TASK: MemoryTask = {
  kind: "memory",
  words: ["socket", "refactor", "latency", "branch", "deploy"],
  distractor: { question: "Quick: what is 13 + 8?", answer: 21 },
};

export const BUGSPOT_TASKS: BugspotTask[] = [
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "javascript",
    snippet: "",
    lines: [
      "function getUser(id) {",
      "  const users = fetchUsers();",
      "  for (let i = 0; i <= users.length; i++) {",
      "    if (users[i].id === id) return users[i];",
      "  }",
      "  return null;",
      "}",
    ],
    bugLine: 2, // <= should be <
  },
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "python",
    snippet: "",
    lines: [
      "def calculate_average(nums):",
      "  total = 0",
      "  for n in nums:",
      "    total += n",
      "  return total / len(nums - 1)",
      "",
    ],
    bugLine: 4, // len(nums - 1) should be len(nums)
  },
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "typescript",
    snippet: "",
    lines: [
      "async function fetchData(url: string) {",
      "  const res = await fetch(url);",
      "  const data = res.json();",
      "  return data;",
      "}",
      "",
    ],
    bugLine: 2, // missing await
  },
];

export const DECISION_TASKS: DecisionTask[] = [
  {
    kind: "decision",
    question: "You've been debugging the same issue for 90 minutes with AI. What's the smarter move?",
    options: ["Keep prompting — you're almost there", "Take a 15-min break and come back fresh"],
    correct: 1,
  },
  {
    kind: "decision",
    question: "Which variable name is clearer?",
    options: ["const d = new Date().getTime()", "const timestampMs = new Date().getTime()"],
    correct: 1,
  },
  {
    kind: "decision",
    question: "A PR has 800 lines changed. Best approach?",
    options: ["Review it all in one sitting late at night", "Split into smaller PRs, review when fresh"],
    correct: 1,
  },
  {
    kind: "decision",
    question: "Your AI just gave you the same wrong answer 3 times in a row. You should:",
    options: ["Try rephrasing the prompt again", "Step away — you might be asking the wrong question entirely"],
    correct: 1,
  },
  {
    kind: "decision",
    question: "Which is safer before a production deploy?",
    options: ["Deploy at 11pm after a long session", "Deploy after a break when you can monitor it alert"],
    correct: 1,
  },
];

export function pickBugspotTask(): BugspotTask {
  return BUGSPOT_TASKS[Math.floor(Math.random() * BUGSPOT_TASKS.length)];
}

export function pickDecisionTasks(n = 3): DecisionTask[] {
  const shuffled = [...DECISION_TASKS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export interface TestResult {
  memoryScore: number;   // 0-1
  bugScore: number;      // 0-1 (includes speed bonus)
  decisionScore: number; // 0-1
  totalScore: number;    // 0-100 rounded
  aiHours: string;
  durationMs: number;
}

export function calcScore(r: Omit<TestResult, "totalScore">): number {
  const weighted = r.memoryScore * 0.35 + r.bugScore * 0.35 + r.decisionScore * 0.30;
  return Math.round(weighted * 100);
}

export type Tier = { label: string; emoji: string; color: string; advice: string };

export function getTier(score: number): Tier {
  if (score >= 80) return {
    label: "Clear Head",
    emoji: "🧠",
    color: "#10b981",
    advice: "You're sharp. Trust your instincts and keep going.",
  };
  if (score >= 60) return {
    label: "Slight Fog",
    emoji: "🌫️",
    color: "#f59e0b",
    advice: "Take a 10-minute break. Drink water. Come back stronger.",
  };
  if (score >= 40) return {
    label: "Heavy Fog",
    emoji: "🌁",
    color: "#f97316",
    advice: "Step away for 30 minutes. Don't deploy anything right now.",
  };
  return {
    label: "Brain Fried",
    emoji: "🔥",
    color: "#ef4444",
    advice: "Stop coding. Sleep on it. The bug will still be there tomorrow.",
  };
}
