import { Suspense } from "react";
import ResultCard from "./ResultCard";

export const revalidate = 0;

export default function ResultPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <ResultCard />
    </Suspense>
  );
}
