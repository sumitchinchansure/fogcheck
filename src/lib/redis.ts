const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redisEnabled = Boolean(REDIS_URL && REDIS_TOKEN);

async function pipeline(commands: (string | number)[][]): Promise<(number | string | null)[]> {
  if (!redisEnabled) return [];
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  const data = (await res.json()) as Array<{ result: number | string | null }>;
  return data.map((d) => d.result);
}

function tierKey(label: string): string {
  return `fc:tier:${label.toLowerCase().replace(/\s+/g, "_")}`;
}

export async function recordResult(score: number, tierLabel: string): Promise<void> {
  await pipeline([
    ["INCR", "fc:total"],
    ["INCRBY", "fc:score_sum", score],
    ["INCR", tierKey(tierLabel)],
  ]);
}

export interface FogStats {
  total: number;
  avgScore: number;
  tiers: { clear: number; slight: number; heavy: number; fried: number };
}

export async function getStats(): Promise<FogStats | null> {
  if (!redisEnabled) return null;
  const results = await pipeline([
    ["GET", "fc:total"],
    ["GET", "fc:score_sum"],
    ["GET", tierKey("Clear Head")],
    ["GET", tierKey("Slight Fog")],
    ["GET", tierKey("Heavy Fog")],
    ["GET", tierKey("Brain Fried")],
  ]);
  const [total, scoreSum, clear, slight, heavy, fried] = results.map((v) =>
    parseInt(String(v ?? "0"), 10) || 0
  );
  return {
    total,
    avgScore: total > 0 ? Math.round(scoreSum / total) : 0,
    tiers: { clear, slight, heavy, fried },
  };
}

export function calcPercentile(score: number, stats: FogStats): number {
  const { clear, slight, heavy, fried } = stats.tiers;
  const total = clear + slight + heavy + fried;
  if (total < 5) return -1;
  if (score >= 80) return Math.round(((slight + heavy + fried) / total) * 100);
  if (score >= 60) return Math.round(((heavy + fried) / total) * 100);
  if (score >= 40) return Math.round((fried / total) * 100);
  return 0;
}
