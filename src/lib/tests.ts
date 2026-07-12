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

// ── Memory ────────────────────────────────────────────────────────────────────

const MEMORY_WORD_POOL = [
  "socket", "refactor", "latency", "branch", "deploy",
  "mutex", "render", "migrate", "webhook", "debounce",
  "throttle", "payload", "rollback", "schema", "cascade",
  "buffer", "pipeline", "singleton", "immutable", "callback",
  "promise", "closure", "context", "runtime", "partition",
  "cache", "cluster", "replica", "timeout", "semaphore",
];

const DISTRACTOR_POOL = [
  { question: "Quick: what is 13 + 8?", answer: 21 },
  { question: "Quick: what is 17 − 9?", answer: 8 },
  { question: "Quick: what is 6 × 4?", answer: 24 },
  { question: "Quick: what is 45 ÷ 9?", answer: 5 },
  { question: "Quick: what is 11 + 14?", answer: 25 },
  { question: "Quick: what is 23 − 7?", answer: 16 },
  { question: "Quick: what is 8 × 3?", answer: 24 },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickMemoryTask(): MemoryTask {
  return {
    kind: "memory",
    words: shuffle(MEMORY_WORD_POOL).slice(0, 5),
    distractor: DISTRACTOR_POOL[Math.floor(Math.random() * DISTRACTOR_POOL.length)],
  };
}

// ── Bug spots (10 total) ──────────────────────────────────────────────────────

export const BUGSPOT_TASKS: BugspotTask[] = [
  // 1. JS: off-by-one with <=
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
    bugLine: 2,
  },
  // 2. Python: len(nums - 1) instead of len(nums)
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
    bugLine: 4,
  },
  // 3. TypeScript: missing await
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
    bugLine: 2,
  },
  // 4. JS: assignment instead of comparison
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "javascript",
    snippet: "",
    lines: [
      "function isAdmin(role) {",
      "  if (role = 'admin') {",
      "    return true;",
      "  }",
      "  return false;",
      "}",
    ],
    bugLine: 1,
  },
  // 5. TypeScript: forEach returns void (should be map)
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "typescript",
    snippet: "",
    lines: [
      "function doubleAll(nums: number[]): number[] {",
      "  return nums.forEach((n) => n * 2);",
      "}",
      "",
    ],
    bugLine: 1,
  },
  // 6. Python: mutable default argument
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "python",
    snippet: "",
    lines: [
      "def add_item(item, items=[]):",
      "  items.append(item)",
      "  return items",
      "",
    ],
    bugLine: 0,
  },
  // 7. Python: returns wrong variable
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "python",
    snippet: "",
    lines: [
      "def celsius_to_fahrenheit(c):",
      "  result = (c * 9/5) + 32",
      "  return c",
      "",
    ],
    bugLine: 2,
  },
  // 8. JS: wrong slice offset
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "javascript",
    snippet: "",
    lines: [
      "function getLastThree(arr) {",
      "  return arr.slice(arr.length - 4);",
      "}",
      "",
    ],
    bugLine: 1,
  },
  // 9. TypeScript: optional chaining needed (will throw at runtime)
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "typescript",
    snippet: "",
    lines: [
      "function getUsername(user?: { name: string }) {",
      "  return user.name.toLowerCase();",
      "}",
      "",
    ],
    bugLine: 1,
  },
  // 10. Python: iterating and mutating same list
  {
    kind: "bugspot",
    prompt: "Which line has the bug?",
    language: "python",
    snippet: "",
    lines: [
      "def remove_negatives(nums):",
      "  for n in nums:",
      "    if n < 0:",
      "      nums.remove(n)",
      "  return nums",
    ],
    bugLine: 3,
  },
];

// ── Decisions (15 total, mixed A/B correct) ───────────────────────────────────

export const DECISION_TASKS: DecisionTask[] = [
  // ── B correct (original 5) ──
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
    options: ["Deploy at 11pm after a long session", "Deploy after a break when you can monitor it"],
    correct: 1,
  },
  // ── B correct (5 new) ──
  {
    kind: "decision",
    question: "Which variable name is better for a user's auth token?",
    options: ["t", "authToken"],
    correct: 1,
  },
  {
    kind: "decision",
    question: "You need to bulk-delete 500k old records. Best approach?",
    options: ["Delete all at once for speed", "Delete in batches with a small delay between each"],
    correct: 1,
  },
  {
    kind: "decision",
    question: "Your daily standup runs 45 minutes every day. You:",
    options: ["Sit through it — it's how things work here", "Raise it with the team — standups should be 15 min max"],
    correct: 1,
  },
  {
    kind: "decision",
    question: "Two functions in your codebase do nearly the same thing. You should:",
    options: ["Keep both — merging could break things", "Refactor into one — duplication creates maintenance debt"],
    correct: 1,
  },
  {
    kind: "decision",
    question: "A junior dev asks how your complex service works. Best response?",
    options: ["Point them to the docs", "Walk them through it and update the docs if they're missing"],
    correct: 1,
  },
  // ── A correct (5 new) ──
  {
    kind: "decision",
    question: "You need to run a DB migration in production. You should:",
    options: ["Test it on staging first, then prod", "Run it directly — it's just adding a column"],
    correct: 0,
  },
  {
    kind: "decision",
    question: "Which commit message is more useful for future you?",
    options: ["fix: prevent race condition in session refresh on token expiry", "fixed stuff"],
    correct: 0,
  },
  {
    kind: "decision",
    question: "It's Friday 5pm. A 'small' deploy is queued. You:",
    options: ["Postpone to Monday — minimal coverage if it breaks", "Push it — small changes are low risk any time"],
    correct: 0,
  },
  {
    kind: "decision",
    question: "A user reports a bug with no reproduction steps. You:",
    options: ["Ask for repro steps and environment details first", "Start changing code and see if the complaints stop"],
    correct: 0,
  },
  {
    kind: "decision",
    question: "CI is failing on your PR. You:",
    options: ["Fix the failing tests before merging", "Merge anyway — CI is probably just being flaky"],
    correct: 0,
  },
];

// ── Pickers ───────────────────────────────────────────────────────────────────

export function pickBugspotTask(): BugspotTask {
  return BUGSPOT_TASKS[Math.floor(Math.random() * BUGSPOT_TASKS.length)];
}

export function pickDecisionTasks(n = 3): DecisionTask[] {
  return shuffle(DECISION_TASKS).slice(0, n);
}

// ── Scoring ───────────────────────────────────────────────────────────────────

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
