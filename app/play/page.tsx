import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayClient } from "./PlayClient";

export const metadata: Metadata = {
  title: "Play",
  description:
    "Ten rounds against the clock: name brands from their palettes, pick exact hex shades from memory, call out doctored logos, and sketch marks freehand.",
  alternates: { canonical: "/play" },
};

export default function PlayPage() {
  return (
    <Suspense fallback={null}>
      <PlayClient />
    </Suspense>
  );
}
