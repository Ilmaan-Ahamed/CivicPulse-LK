import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CivicPulse LK — Community-Verified Infrastructure Reporting",
  description:
    "Transparent, data-driven platform empowering citizens and government authorities in Sri Lanka to report, verify, and resolve public infrastructure issues.",
  keywords: [
    "Sri Lanka",
    "Civic Infrastructure",
    "Public Reporting",
    "Divisional Secretariat",
    "Community Verification",
    "AI Triage",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#0a0f1a] text-slate-100 selection:bg-emerald-500/30">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
