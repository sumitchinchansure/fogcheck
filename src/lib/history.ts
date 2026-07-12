const KEY = "fc_history";
const MAX = 20;

export interface HistoryEntry {
  score: number;
  tier: string;
  aiHours: string;
  ts: number;
}

export function saveResult(score: number, tier: string, aiHours: string): void {
  if (typeof window === "undefined") return;
  const h = getHistory();
  h.unshift({ score, tier, aiHours, ts: Date.now() });
  try {
    localStorage.setItem(KEY, JSON.stringify(h.slice(0, MAX)));
  } catch {}
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as HistoryEntry[];
  } catch {
    return [];
  }
}

function dayIndex(ts: number): number {
  return Math.floor(ts / 86_400_000);
}

export interface Streak {
  count: number;
  active: boolean; // true if tested today
}

export function getStreak(): Streak {
  const history = getHistory();
  if (history.length === 0) return { count: 0, active: false };

  const daySet = new Set(history.map((e) => dayIndex(e.ts)));
  const today = dayIndex(Date.now());
  const active = daySet.has(today);
  const startDay = active ? today : daySet.has(today - 1) ? today - 1 : null;
  if (startDay === null) return { count: 0, active: false };

  let count = 0;
  let d = startDay;
  while (daySet.has(d)) {
    count++;
    d--;
  }
  return { count, active };
}
