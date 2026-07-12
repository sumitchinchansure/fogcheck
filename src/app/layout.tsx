import type { Metadata } from "next";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fogcheck.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "FogCheck — Are you too deep in AI to think straight?",
    template: "%s | FogCheck",
  },
  description: "90-second cognitive load test for developers using AI. Find out if your brain is still sharp or if it's time to step away.",
  openGraph: {
    siteName: "FogCheck",
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {children}
      </body>
    </html>
  );
}
