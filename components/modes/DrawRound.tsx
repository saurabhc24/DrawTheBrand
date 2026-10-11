"use client";

import { useEffect, useRef, useState } from "react";
import { UndoIcon } from "../Icons";
import { scoreDrawing } from "@/lib/drawScore";
import type { Round } from "@/lib/types";

const SIZE = 512;
const BRUSHES = [
  { px: 7, dot: 4, label: "Fine" },
  { px: 12, dot: 7, label: "Medium" },
  { px: 22, dot: 11, label: "Bold" },
];

type Point = { x: number; y: number };

export function DrawRound({
  round,
  onDone,
  onSkip,
  timeUp = false,
}: {
  round: Round;
  onDone: (drawing: string, score: number) => void;
  onSkip: () => void;
  /** Clock expiry: pens down — score whatever is on the canvas. */
  timeUp?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  // Smoothing state: last raw point and last segment midpoint.
  const lastRef = useRef<Point | null>(null);
  const midRef = useRef<Point | null>(null);
  const undoRef = useRef<string[]>([]);
  const [brush, setBrush] = useState(round.brand.colors[0]?.hex ?? "#141416");
  const [width, setWidth] = useState(12);
  const [canUndo, setCanUndo] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Pens down when the round clock expires.
  useEffect(() => {
    if (timeUp) void done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeUp]);

  const point = (event: { clientX: number; clientY: number }): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SIZE,
      y: ((event.clientY - rect.top) / rect.height) * SIZE,
    };
  };

  const snapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    undoRef.current = [
      ...undoRef.current.slice(-9),
      canvas.toDataURL("image/png"),
    ];
    setCanUndo(true);
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(event.pointerId);
    snapshot();
    drawingRef.current = true;
    const p = point(event);
    lastRef.current = p;
    midRef.current = p;
    // A tap leaves a dot (dots and i-tittles are part of plenty of marks).
    ctx.fillStyle = brush;
    ctx.beginPath();
    ctx.arc(p.x, p.y, width / 2, 0, Math.PI * 2);
    ctx.fill();
    setHasDrawing(true);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = brush;
    ctx.lineWidth = width;
    // Coalesced events recover the samples the browser batched between
    // frames; midpoint quadratics turn them into a smooth curve.
    const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const sample of coalesced.length ? coalesced : [event.nativeEvent]) {
      const last = lastRef.current!;
      const prevMid = midRef.current!;
      const p = point(sample);
      const mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(prevMid.x, prevMid.y);
      ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y);
      ctx.stroke();
      lastRef.current = p;
      midRef.current = mid;
    }
  };

  const stop = () => {
    drawingRef.current = false;
    lastRef.current = null;
    midRef.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    snapshot();
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, SIZE, SIZE);
    setHasDrawing(false);
  };

  const canvasHasInk = (ctx: CanvasRenderingContext2D) => {
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    for (let i = 0; i < data.length; i += 4) {
      if (!(data[i] > 242 && data[i + 1] > 242 && data[i + 2] > 242))
        return true;
    }
    return false;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const previous = undoRef.current.pop();
    if (!canvas || !ctx || !previous) return;
    const image = new Image();
    image.onload = () => {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(image, 0, 0);
      setCanUndo(undoRef.current.length > 0);
      setHasDrawing(canvasHasInk(ctx));
    };
    image.src = previous;
  };

  const done = async () => {
    const canvas = canvasRef.current;
    if (!canvas || scoring) return;
    if (!hasDrawing) {
      onSkip();
      return;
    }
    setScoring(true);
    const drawing = canvas.toDataURL("image/png");
    let score = 0;
    try {
      score = await scoreDrawing(drawing, round.brand.assets.logoFull);
    } catch {
      // Scoring should never block the reveal; a failed load just scores 0.
    }
    onDone(drawing, score);
  };

  const palette = [
    ...new Set([
      ...round.brand.colors.map((c) => c.hex.toUpperCase()),
      "#141416",
      "#FFFFFF",
    ]),
  ];

  return (
    <div className="draw-round animate-fade flex min-h-0 flex-1 flex-col">
      <h1 className="round-question text-[22px] leading-tight font-extrabold tracking-[-0.02em] font-stretch-semi-expanded">
        Draw {round.brand.name} from memory
      </h1>
      <p className="round-hint text-ink-muted mt-1 font-mono text-[10.5px] tracking-[0.12em] uppercase">
        Scored on shape, not color
      </p>

      <div className="draw-tools mt-3 flex shrink-0 items-center justify-between gap-3">
        <div className="brush-palette -m-1 flex items-center gap-2 overflow-x-auto p-1">
          {palette.map((hex) => (
            <button
              key={hex}
              onClick={() => setBrush(hex)}
              aria-label={`Use ${hex}`}
              aria-pressed={brush.toUpperCase() === hex}
              className={`brush-chip pressable h-8 w-8 shrink-0 rounded-full border ${
                brush.toUpperCase() === hex
                  ? "border-ink ring-ink ring-offset-paper ring-2 ring-offset-2"
                  : "border-rule"
              }`}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        <div
          className="brush-size border-rule bg-card flex shrink-0 items-center gap-0.5 rounded-full border p-1"
          role="radiogroup"
          aria-label="Brush size"
        >
          {BRUSHES.map((b) => (
            <button
              key={b.px}
              role="radio"
              aria-checked={width === b.px}
              aria-label={b.label}
              onClick={() => setWidth(b.px)}
              className={`brush-size-option grid h-8 w-8 place-items-center rounded-full transition-colors ${
                width === b.px ? "bg-ink text-paper" : "text-ink hover:bg-tile"
              }`}
            >
              <span
                className="rounded-full bg-current"
                style={{ width: b.dot, height: b.dot }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* The pad stays square at the largest size that fits; the stage
          absorbs spare height so tall screens don't skew the saved sketch. */}
      <div className="canvas-stage [container-type:size] mt-1 flex min-h-56 flex-1 items-center justify-center">
        <div className="canvas-proof crop-marks relative w-[min(100cqw,100cqh)]">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={stop}
            onPointerCancel={stop}
            className="draw-canvas vt-stage border-rule bg-card block aspect-square w-full touch-none rounded-2xl border"
            aria-label={`Drawing canvas for ${round.brand.name}`}
          />
          {/* Drafting-paper dots over the pad; translucent ink, so strokes barely notice. */}
          <div
            aria-hidden
            className="canvas-grid pointer-events-none absolute inset-3 rounded-2xl bg-[radial-gradient(circle,rgb(19_19_19/0.16)_1px,transparent_1.4px)] bg-[length:20px_20px] bg-center"
          />
          {!hasDrawing && (
            <p
              aria-hidden
              className="canvas-hint text-ink-muted pointer-events-none absolute inset-0 grid place-items-center font-mono text-[11px] tracking-[0.14em] uppercase"
            >
              <span className="canvas-hint-chip bg-card rounded-full px-3 py-1.5">
                Sketch the mark here
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="draw-controls mt-2 grid shrink-0 grid-cols-[1fr_1fr_1.5fr] gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="undo-button pressable border-ink/20 bg-card flex items-center justify-center gap-1.5 rounded-full border py-3 text-sm font-bold disabled:opacity-40"
        >
          <UndoIcon className="h-3.5 w-3.5" />
          Undo
        </button>
        <button
          onClick={clear}
          className="clear-button pressable border-ink/20 bg-card rounded-full border py-3 text-sm font-bold"
        >
          Clear
        </button>
        <button
          onClick={done}
          disabled={scoring}
          className="score-button pressable bg-ink text-paper rounded-full py-3 text-sm font-bold disabled:opacity-60"
        >
          {scoring ? "Scoring…" : hasDrawing ? "Score it" : "Skip drawing"}
        </button>
      </div>
    </div>
  );
}
