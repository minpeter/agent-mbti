import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent MBTI - AI Personality Test",
  description: "Discover your AI agent's MBTI personality type. Give us the URL, we'll test the vibes.",
  openGraph: {
    title: "Agent MBTI - AI Personality Test",
    description: "Discover your AI agent's MBTI personality type",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
