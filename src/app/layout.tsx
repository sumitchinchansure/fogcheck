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
    title: "FogCheck — Are you too deep in AI to think straight?",
    description: "90-second cognitive load test for developers using AI. Find out if your brain is still sharp or if it's time to step away.",
    images: [{ url: `${APP_URL}/api/og?home=1`, width: 1200, height: 630, alt: "FogCheck" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FogCheck — Are you too deep in AI to think straight?",
    description: "90-second cognitive load test for developers using AI.",
    images: [`${APP_URL}/api/og?home=1`],
  },
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
