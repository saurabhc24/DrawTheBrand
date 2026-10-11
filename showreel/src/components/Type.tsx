import React from "react";
import { random, useCurrentFrame } from "remotion";
import { E, tw } from "../theme";

/** Types `text` from frame `at`, `cps` characters a second, with a block cursor. */
export const Typewriter: React.FC<{
  text: string;
  at: number;
  cps?: number;
  style?: React.CSSProperties;
  cursor?: boolean;
}> = ({ text, at, cps = 40, style, cursor = true }) => {
  const frame = useCurrentFrame();
  const raw = ((frame - at) * cps) / 60;
  const shown = Math.max(0, Math.min(text.length, Math.floor(raw)));
  const typing = frame >= at && raw < text.length + 6;
  return (
    <span style={{ whiteSpace: "pre", ...style }}>
      {text.slice(0, shown)}
      {cursor && typing && Math.floor(frame / 8) % 2 === 0 && (
        // Zero-width anchor: the block never shifts centered lines.
        <span style={{ display: "inline-block", width: 0, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 2,
              top: "-0.82em",
              width: "0.55em",
              height: "0.95em",
              background: "currentColor",
            }}
          />
        </span>
      )}
      {/* Invisible remainder keeps the line's width stable while typing. */}
      <span style={{ opacity: 0 }}>{text.slice(shown)}</span>
    </span>
  );
};

const GLYPHS = "0123456789ABCDEF#";

/** Characters churn, then lock left→right into `text` between `at` and `at + dur`. */
export const Scramble: React.FC<{
  text: string;
  at: number;
  dur?: number;
  seed?: string;
  style?: React.CSSProperties;
}> = ({ text, at, dur = 30, seed = "s", style }) => {
  const frame = useCurrentFrame();
  const t = tw(frame, at, at + dur, E.linear);
  const locked = Math.floor(t * text.length);
  const out =
    frame < at
      ? text.replace(/[^#]/g, "?")
      : [...text]
          .map((ch, i) =>
            i < locked || ch === "#"
              ? ch
              : GLYPHS[Math.floor(random(`${seed}${i}${Math.floor(frame / 2)}`) * 16)],
          )
          .join("");
  return <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>{out}</span>;
};

/** Words rise out of a mask one after another, from frame `at`. */
export const WordRise: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  dur?: number;
  style?: React.CSSProperties;
  out?: number;
}> = ({ text, at, stagger = 5, dur = 34, style, out }) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", columnGap: "0.26em", ...style }}>
      {text.split(" ").map((word, i) => {
        const t = tw(frame, at + i * stagger, at + i * stagger + dur);
        const exit = out === undefined ? 0 : tw(frame, out + i * 2, out + i * 2 + 18, E.in);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: "0.08em" }}>
            <span
              style={{
                display: "inline-block",
                translate: `0 ${(1 - t) * 110 - exit * 110}%`,
              }}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  );
};
