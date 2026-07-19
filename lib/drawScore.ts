/**
 * Draw-mode scoring (PRD Mode F): compare the player's sketch to the real
 * logo on a fixed grid, forgiving of wobbly lines and stroke order.
 *
 * Method: rasterize both images to a GRID×GRID mask of "ink" pixels,
 * normalize each mask's ink bounding box to the same frame (so position and
 * size don't dominate the score), extract mask EDGES (so an outlined circle
 * and a filled disc compare fairly), then score with a distance-tolerant
 * precision/recall (chamfer): how much of your ink lies near the logo's
 * edges, and how much of the logo's edges you covered. The geometric mean of
 * the two is mapped through a gentle curve to 0–100 — per the PRD, no
 * point-sequence matching (Fréchet/Hausdorff), which punishes stroke order.
 */

const GRID = 256;
const FRAME = 232; // normalized ink box within the grid
const TOLERANCE = 14; // px distance at which ink still counts as matching

function makeCanvas(size: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);
  return { canvas, ctx };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src.slice(0, 64)}`));
    img.src = src;
  });
}

/** Load an image source; .svg files get explicit dimensions so canvas rasterizes them. */
async function loadDrawable(
  src: string,
): Promise<{ img: HTMLImageElement; cleanup: () => void }> {
  if (src.startsWith("data:") || !src.endsWith(".svg")) {
    return { img: await loadImage(src), cleanup: () => {} };
  }
  const text = await (await fetch(src)).text();
  const sized = text.replace(/<svg /, '<svg width="512" height="512" ');
  const url = URL.createObjectURL(new Blob([sized], { type: "image/svg+xml" }));
  try {
    return {
      img: await loadImage(url),
      cleanup: () => URL.revokeObjectURL(url),
    };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/** Ink = anything that isn't near-white paper. */
function toMask(ctx: CanvasRenderingContext2D): Uint8Array {
  const { data } = ctx.getImageData(0, 0, GRID, GRID);
  const mask = new Uint8Array(GRID * GRID);
  for (let i = 0; i < mask.length; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    const a = data[i * 4 + 3];
    if (a > 40 && !(r > 242 && g > 242 && b > 242)) mask[i] = 1;
  }
  return mask;
}

/** Redraw a source canvas so its ink bounding box fills the normalized frame. */
function normalize(source: HTMLCanvasElement, mask: Uint8Array): Uint8Array {
  let minX = GRID,
    minY = GRID,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if (mask[y * GRID + x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return mask; // empty — nothing to normalize

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const scale = Math.min(FRAME / w, FRAME / h);
  const dw = w * scale;
  const dh = h * scale;
  const sx = source.width / GRID; // source may be larger than the grid
  const { ctx } = makeCanvas(GRID);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(
    source,
    minX * sx,
    minY * sx,
    w * sx,
    h * sx,
    (GRID - dw) / 2,
    (GRID - dh) / 2,
    dw,
    dh,
  );
  return toMask(ctx);
}

/** Boundary pixels of the ink mask. */
function edges(mask: Uint8Array): Uint8Array {
  const out = new Uint8Array(mask.length);
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const i = y * GRID + x;
      if (!mask[i]) continue;
      if (
        x === 0 ||
        y === 0 ||
        x === GRID - 1 ||
        y === GRID - 1 ||
        !mask[i - 1] ||
        !mask[i + 1] ||
        !mask[i - GRID] ||
        !mask[i + GRID]
      ) {
        out[i] = 1;
      }
    }
  }
  return out;
}

/** Two-pass chamfer distance transform (city-block) from the set pixels. */
function distanceField(mask: Uint8Array): Float32Array {
  const INF = GRID * 2;
  const dist = new Float32Array(mask.length);
  for (let i = 0; i < mask.length; i++) dist[i] = mask[i] ? 0 : INF;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const i = y * GRID + x;
      if (x > 0) dist[i] = Math.min(dist[i], dist[i - 1] + 1);
      if (y > 0) dist[i] = Math.min(dist[i], dist[i - GRID] + 1);
    }
  }
  for (let y = GRID - 1; y >= 0; y--) {
    for (let x = GRID - 1; x >= 0; x--) {
      const i = y * GRID + x;
      if (x < GRID - 1) dist[i] = Math.min(dist[i], dist[i + 1] + 1);
      if (y < GRID - 1) dist[i] = Math.min(dist[i], dist[i + GRID] + 1);
    }
  }
  return dist;
}

/**
 * Graded distance credit: ink right on the target counts fully, credit fades
 * linearly to zero at TOLERANCE. (A binary cutoff scored a perfectly drawn
 * WRONG logo too well — most shapes sit within a loose band of each other.)
 */
function nearFraction(points: Uint8Array, field: Float32Array): number {
  let total = 0;
  let credit = 0;
  for (let i = 0; i < points.length; i++) {
    if (!points[i]) continue;
    total++;
    credit += Math.max(0, 1 - field[i] / TOLERANCE);
  }
  return total === 0 ? 0 : credit / total;
}

async function rasterize(
  src: string,
): Promise<{ canvas: HTMLCanvasElement; mask: Uint8Array }> {
  const { img, cleanup } = await loadDrawable(src);
  const { canvas, ctx } = makeCanvas(GRID);
  ctx.drawImage(img, 0, 0, GRID, GRID);
  cleanup();
  return { canvas, mask: toMask(ctx) };
}

/**
 * Score a drawing (data URL) against the brand's logo asset. Returns 0–100.
 */
export async function scoreDrawing(
  drawingDataUrl: string,
  logoSrc: string,
): Promise<number> {
  const [drawing, logo] = await Promise.all([
    rasterize(drawingDataUrl),
    rasterize(logoSrc),
  ]);

  const drawn = normalize(drawing.canvas, drawing.mask);
  const reference = normalize(logo.canvas, logo.mask);

  const drawnEdges = edges(drawn);
  const referenceEdges = edges(reference);

  const precision = nearFraction(drawnEdges, distanceField(referenceEdges));
  const recall = nearFraction(referenceEdges, distanceField(drawnEdges));
  const similarity = Math.sqrt(precision * recall);

  // Gentle curve: a clearly recognizable sketch should land 60+, not 40.
  return Math.round(100 * Math.pow(similarity, 0.75));
}

/** A drawing at or above this counts as a "correct" round for score/streak. */
export const DRAW_PASS_SCORE = 60;
