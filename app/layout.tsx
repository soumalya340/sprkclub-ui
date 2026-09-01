import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono, Special_Elite } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { Providers } from "@/components/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

// Typography roles are documented in brand.md.
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

// Wordmark only — never body copy.
const specialElite = Special_Elite({
  subsets: ["latin"],
  variable: "--font-special-elite",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sprkclub",
  description: "A DAO + NFT where people make their dreams real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "antialiased font-sans",
        geist.variable,
        plexMono.variable,
        specialElite.variable,
      )}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
