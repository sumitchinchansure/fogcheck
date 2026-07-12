import { Suspense } from "react";
import type { Metadata } from "next";
import ResultCard from "./ResultCard";

type Props = {
  searchParams: Promise<{ s?: string; ai?: string; tier?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const score = parseInt(params.s ?? "0", 10);
  const tier = params.tier ?? "";
  const aiHours = params.ai ?? "";

  const title = tier ? `${score}% — ${tier}` : `${score}% score`;
  const description = aiHours
    ? `I scored ${score}% after ${aiHours} of AI coding tools. Test your cognitive load in 90 seconds — no signup needed.`
    : `I scored ${score}% on the AI cognitive load test. Take 90 seconds to check yours.`;

  const ogImage = `/api/og?s=${score}&ai=${encodeURIComponent(aiHours)}`;

  return {
    title,
    description,
    openGraph: {
      title: `My AI cognitive load: ${score}% ${tier}`,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `FogCheck score: ${score}% ${tier}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `My AI cognitive load: ${score}% ${tier}`,
      description,
      images: [ogImage],
    },
  };
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <ResultCard />
    </Suspense>
  );
}
