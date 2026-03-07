import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SocketProvider } from "@/providers/SocketProvider";
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
        <SocketProvider>
          <div className="flex min-h-screen">
            <aside className="w-64 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
              <nav className="space-y-1">
                <a
                  href="/"
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-800"
                >
                  Threads
                </a>
              </nav>
            </aside>
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </SocketProvider>
      </body>
    </html>
  );
}
