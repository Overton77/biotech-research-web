import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SocketProvider } from "@/providers/SocketProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Biotech Research Agent",
  description: "Deep Biotech Research Agent — Coordinator, plans, runs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <QueryProvider>
          <SocketProvider>
            <div className="flex h-screen">
              <aside className="w-56 shrink-0 border-r border-border bg-muted/40 flex flex-col">
                <div className="p-4 border-b border-border">
                  <h1 className="text-sm font-semibold tracking-tight">
                    Biotech Research
                  </h1>
                </div>
                <nav className="flex-1 p-2 space-y-0.5">
                  <Link
                    href="/"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    <svg
                      className="w-4 h-4 opacity-60"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    Threads
                  </Link>
                </nav>
              </aside>
              <main className="flex-1 overflow-hidden">{children}</main>
            </div>
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
