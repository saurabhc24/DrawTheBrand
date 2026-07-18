"use client";

import { useEffect, useRef, useState } from "react";
import { scoreDrawing } from "@/lib/drawScore";
import type { Round } from "@/lib/types";

const SIZE = 512;

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
  const lastRef = useRef<{ x: number; y: number } | null>(null);
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

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SIZE,
      y: ((event.clientY - rect.top) / rect.height) * SIZE,
    };
  };

  const snapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    undoRef.current = [...undoRef.current.slice(-9), canvas.toDataURL("image/png")];
    setCanUndo(true);
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    snapshot();
    drawingRef.current = true;
    lastRef.current = point(event);
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !lastRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const next = point(event);
    ctx.strokeStyle = brush;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    lastRef.current = next;
    setHasDrawing(true);
  };

  const stop = () => {
    drawingRef.current = false;
    lastRef.current = null;
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
      if (!(data[i] > 242 && data[i + 1] > 242 && data[i + 2] > 242)) return true;
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

  return (
    <div className="animate-fade flex min-h-0 flex-1 flex-col">
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">
          Draw {round.brand.name} from memory
        </h1>
        <select
          value={width}
          onChange={(event) => setWidth(Number(event.target.value))}
          className="rounded-full border border-ink/20 bg-card px-3 py-1.5 text-sm font-bold"
          aria-label="Brush size"
        >
          <option value={7}>Fine</option>
          <option value={12}>Medium</option>
          <option value={22}>Bold</option>
        </select>
      </div>

      <div className="mt-3 flex shrink-0 items-center gap-2 overflow-x-auto pb-1">
        {[
          ...new Set([
            ...round.brand.colors.map((c) => c.hex.toUpperCase()),
            "#141416",
            "#FFFFFF",
          ]),
        ].map((hex) => (
          <button
            key={hex}
            onClick={() => setBrush(hex)}
            aria-label={`Use ${hex}`}
            className={`h-9 w-9 shrink-0 rounded-xl border ${
              brush.toUpperCase() === hex.toUpperCase() ? "border-ink border-2" : "border-rule"
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>

      {/* The canvas keeps its intrinsic 1:1 ratio; the wrapper absorbs spare
          height so tall screens don't stretch it (and skew the saved sketch). */}
      <div className="mt-3 flex min-h-0 flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
          className="max-h-full max-w-full touch-none rounded-2xl border border-rule bg-card"
          aria-label={`Drawing canvas for ${round.brand.name}`}
        />
      </div>

      <div className="mt-3 grid shrink-0 grid-cols-[1fr_1fr_1.5fr] gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="pressable rounded-full border border-ink/20 bg-card py-3 text-sm font-bold disabled:opacity-40"
        >
          Undo
        </button>
        <button
          onClick={clear}
          className="pressable rounded-full border border-ink/20 bg-card py-3 text-sm font-bold"
        >
          Clear
        </button>
        <button
          onClick={done}
          disabled={scoring}
          className="pressable rounded-full bg-ink py-3 text-sm font-bold text-paper disabled:opacity-60"
        >
          {scoring ? "Scoring…" : hasDrawing ? "Score it" : "Skip drawing"}
        </button>
      </div>
    </div>
  );
}
