import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const isStandbyMode = process.env.NEXT_PUBLIC_STANDBY_MODE === "true";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetrolHead — Fuel Station Intelligence",
  description:
    "AI-powered deep research dashboard for fuel station profiling. Powered by Gemini Deep Research & Perplexity.",
};

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
            P
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            PetrolHead
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            href="/demos"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Demos
          </Link>
          <Link
            href="/researches"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Researches
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen`}
      >
        {!isStandbyMode && <Navbar />}
        <main>{children}</main>
      </body>
    </html>
  );
}
