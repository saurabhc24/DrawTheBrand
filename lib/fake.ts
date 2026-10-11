import type { CSSProperties } from "react";
import type { FakeSpec } from "./types";

/**
 * The CSS that renders a doctored logo from the real asset. Used by the fake
 * round and again on the reveal screen's "what you saw" comparison, so the
 * player always sees the identical distortion.
 */
export function fakeStyle(fake: FakeSpec | null | undefined): CSSProperties {
  if (!fake) return {};
  switch (fake.kind) {
    case "hue":
      // Exactly the rotation lib/session.ts measured — nothing extra on top.
      return { filter: `hue-rotate(${fake.amount}deg)` };
    case "squashX":
      return { transform: `scaleX(${fake.amount})` };
    case "squashY":
      return { transform: `scaleY(${fake.amount})` };
  }
}
