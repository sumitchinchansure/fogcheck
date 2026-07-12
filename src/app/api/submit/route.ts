import { NextRequest, NextResponse } from "next/server";
import { recordResult } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { score, tier } = (await req.json()) as { score: unknown; tier: unknown };
    if (typeof score !== "number" || typeof tier !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await recordResult(Math.round(score), tier);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
