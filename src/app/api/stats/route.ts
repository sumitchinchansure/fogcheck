import { NextResponse } from "next/server";
import { getStats } from "@/lib/redis";

export const revalidate = 60;

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats ?? { total: 0, avgScore: 0, tiers: { clear: 0, slight: 0, heavy: 0, fried: 0 } });
}
