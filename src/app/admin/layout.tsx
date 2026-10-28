import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { redirect } from "next/navigation";
import "../globals.css";
import { isDemo } from "@/lib/db";

// Eigen root layout voor het beheer (de publieke site heeft haar root layout in [locale]/layout.tsx).
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Beheer", template: "%s · Beheer Rippotai" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  // Zonder eigen database (demomodus) kan er niets bewaard worden: beheer uit.
  if (isDemo) redirect("/it-it");
  return (
    <html lang="nl">
      <body className={`${jost.variable} min-h-dvh bg-paper font-sans text-ink antialiased`}>{children}</body>
    </html>
  );
}
