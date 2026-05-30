import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Devlog — Turn your commits into content",
  description:
    "Devlog monitors your GitHub activity and generates platform-optimized posts for X, LinkedIn, Reddit and more. Build in public without the overhead.",
  openGraph: {
    title: "Devlog — Turn your commits into content",
    description:
      "AI-powered developer content from your GitHub activity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
    >
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
