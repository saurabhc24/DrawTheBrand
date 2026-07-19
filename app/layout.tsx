import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Brandr — how well do you really know logos?",
  description:
    "You recognize every logo instantly. But can you name the exact shade, spot it from a sliver, or place its palette? A quick brand-memory game with Indian and global packs.",
};

export const viewport: Viewport = {
  themeColor: "#fbfbf9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${archivo.variable} ${plexMono.variable} bg-paper text-ink font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
