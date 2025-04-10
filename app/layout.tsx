"use client";

import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import { SupabaseProvider } from "@/app/providers/SupabaseProvider";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <body>
        <SupabaseProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-grow container mx-auto px-4">
                {children}
              </main>
              <footer className="py-4 text-center text-sm dark:text-gray-400 light:text-gray-600">
                © 2025 Reel Fling - A fun movie guessing game
              </footer>
            </div>
            <Toaster position="top-center" />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
