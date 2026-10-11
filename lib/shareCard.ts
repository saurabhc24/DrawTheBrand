import { loadDrawable } from "./drawScore";
import { SITE_URL } from "./site";
import type { RoundResult } from "./types";

const W = 1080;
const H = 1350;
const X0 = 112; // content edges, inside the trim
const X1 = W - 112;
const INK = "#131313";
const MUTED = "#6F6F74";
const RULE = "#E7E4DE";
const PROOF = "#1E4633";
const FLAG = "#E0442A";

/**
 * The finished session as a 1080×1350 press proof, for the share sheet:
 * score, rank stamp, the color bar, and every logo played. Drawn by hand on a
 * canvas in the page's own fonts — no DOM-to-image dependency.
 */
export async function renderShareCard({
  results,
  title,
  quip,
  ink,
  label,
}: {
  results: RoundResult[];
  /** Rank title, stamped in `ink`. */
  title: string;
  quip: string;
  ink: string;
  /** Mode name for the slug line, e.g. "Mixed". */
  label: string;
}): Promise<Blob> {
  const css = getComputedStyle(document.documentElement);
  const sans = css.getPropertyValue("--font-archivo").trim() || "sans-serif";
  const mono = css.getPropertyValue("--font-plex-mono").trim() || "monospace";
  await Promise.all([
    document.fonts.load(`900 64px ${sans}`),
    document.fonts.load(`500 24px ${mono}`),
  ]);
  // Logos load in parallel; one that fails just leaves its tile blank.
  const logos = await Promise.all(
    results.map((r) => loadDrawable(r.brand.assets.logoFull).catch(() => null)),
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const type = (
    spec: string,
    family: string,
    color: string,
    { stretch = "normal", spacing = "0px", align = "left" } = {},
  ) => {
    ctx.font = `${spec} ${family}`;
    ctx.fontStretch = stretch as CanvasFontStretch;
    ctx.letterSpacing = spacing;
    ctx.textAlign = align as CanvasTextAlign;
    ctx.fillStyle = color;
  };

  ctx.fillStyle = "#FDFCFA";
  ctx.fillRect(0, 0, W, H);

  // Print furniture: trim marks at the corners, registration targets.
  ctx.strokeStyle = "rgba(19,19,19,0.45)";
  ctx.lineWidth = 2;
  const T = 64;
  for (const [x, y, dx, dy] of [
    [T, T, -1, -1],
    [W - T, T, 1, -1],
    [T, H - T, -1, 1],
    [W - T, H - T, 1, 1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x + dx * 12, y);
    ctx.lineTo(x + dx * 46, y);
    ctx.moveTo(x, y + dy * 12);
    ctx.lineTo(x, y + dy * 46);
    ctx.stroke();
  }
  const reg = (x: number, y: number, r = 15) => {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.55, 0, Math.PI * 2);
    ctx.moveTo(x - r, y);
    ctx.lineTo(x + r, y);
    ctx.moveTo(x, y - r);
    ctx.lineTo(x, y + r);
    ctx.stroke();
  };
  ctx.strokeStyle = INK;
  reg(W / 2, 32);
  reg(W / 2, H - 32);

  // Header slug.
  const date = new Date()
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();
  type("900 60px", sans, INK, { stretch: "expanded", spacing: "-2px" });
  ctx.fillText("Brandr", X0, 176);
  type("500 22px", mono, MUTED, { spacing: "3px", align: "right" });
  ctx.fillText("A BRAND MEMORY TEST", X1, 144);
  ctx.fillText(`${label.toUpperCase()} · ${date}`, X1, 178);
  ctx.fillStyle = RULE;
  ctx.fillRect(X0, 212, X1 - X0, 2);

  // The score, sized to fit, then the rank stamp beneath it.
  const correct = results.filter((r) => r.correct).length;
  let size = 380;
  const fit = () => {
    type(`900 ${size}px`, sans, INK, { stretch: "expanded", spacing: "-12px" });
    const big = ctx.measureText(String(correct)).width;
    type(`700 ${size * 0.3}px`, sans, MUTED, { stretch: "expanded" });
    return big + ctx.measureText(`/${results.length}`).width;
  };
  while (fit() > X1 - X0 && size > 200) size -= 20;
  type(`900 ${size}px`, sans, INK, { stretch: "expanded", spacing: "-12px" });
  ctx.fillText(String(correct), X0 - 10, 520);
  const scoreWidth = ctx.measureText(String(correct)).width;
  type(`700 ${size * 0.3}px`, sans, MUTED, { stretch: "expanded" });
  ctx.fillText(`/${results.length}`, X0 + scoreWidth + 4, 520);

  // The rank stamp gets its own layer, so the worn-ink flecks knocked out of
  // it never punch through the paper.
  const layer = document.createElement("canvas");
  layer.width = W;
  layer.height = 220;
  const s = layer.getContext("2d")!;
  s.font = `600 34px ${mono}`;
  s.letterSpacing = "5px";
  const stampText = title.toUpperCase();
  const bw = s.measureText(stampText).width + 52;
  const bh = 72;
  s.translate(X0 + 18 + bw / 2, 110);
  s.rotate((-4 * Math.PI) / 180);
  s.strokeStyle = s.fillStyle = ink;
  s.lineWidth = 5;
  s.beginPath();
  s.roundRect(-bw / 2, -bh / 2, bw, bh, 10);
  s.stroke();
  s.lineWidth = 2.5;
  s.beginPath();
  s.roundRect(-bw / 2 - 9, -bh / 2 - 9, bw + 18, bh + 18, 15);
  s.stroke();
  s.textAlign = "center";
  s.textBaseline = "middle";
  s.fillText(stampText, 3, 3);
  s.setTransform(1, 0, 0, 1, 0, 0);
  s.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 1600; i++) {
    s.globalAlpha = 0.3 + Math.random() * 0.7;
    s.fillRect(
      X0 + Math.random() * (bw + 60),
      Math.random() * 220,
      1 + Math.random() * 2.5,
      1 + Math.random() * 2,
    );
  }
  ctx.drawImage(layer, 0, 606 - 110);

  type("400 32px", sans, MUTED);
  ctx.fillText(quip, X0, 712);

  // The color bar between registration targets.
  const barY = 752;
  const barH = 56;
  reg(X0 + 15, barY + barH / 2);
  reg(X1 - 15, barY + barH / 2);
  const gap = 8;
  const left = X0 + 44;
  const chipW = (X1 - 44 - left - gap * (results.length - 1)) / results.length;
  results.forEach((r, i) => {
    const x = left + i * (chipW + gap);
    ctx.fillStyle = r.correct ? r.brand.colors[0].hex : RULE;
    ctx.beginPath();
    ctx.roundRect(x, barY, chipW, barH, 10);
    ctx.fill();
    if (!r.correct) {
      ctx.save();
      ctx.clip();
      ctx.fillStyle = FLAG;
      ctx.fillRect(x, barY + barH - 8, chipW, 8);
      ctx.restore();
    }
  });

  // Every logo played, badged with the outcome.
  const cols = 5;
  const tile = 150;
  const tileGap = (X1 - X0 - cols * tile) / (cols - 1);
  results.forEach((r, i) => {
    const x = X0 + (i % cols) * (tile + tileGap);
    const y = 848 + Math.floor(i / cols) * (tile + 20);
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = RULE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, tile, tile, 18);
    ctx.fill();
    ctx.stroke();
    const logo = logos[i];
    if (logo) {
      ctx.save();
      ctx.clip();
      ctx.globalAlpha = r.correct ? 1 : 0.35;
      ctx.drawImage(logo.img, x, y, tile, tile);
      ctx.restore();
      logo.cleanup();
    }
    const bx = x + tile - 20;
    const by = y + 20;
    ctx.fillStyle = r.correct ? PROOF : r.skipped || r.timedOut ? MUTED : FLAG;
    ctx.beginPath();
    ctx.arc(bx, by, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (r.correct) {
      ctx.moveTo(bx - 7, by + 1);
      ctx.lineTo(bx - 2, by + 6);
      ctx.lineTo(bx + 7, by - 5);
    } else if (r.skipped || r.timedOut) {
      ctx.moveTo(bx - 7, by);
      ctx.lineTo(bx + 7, by);
    } else {
      ctx.moveTo(bx - 6, by - 6);
      ctx.lineTo(bx + 6, by + 6);
      ctx.moveTo(bx + 6, by - 6);
      ctx.lineTo(bx - 6, by + 6);
    }
    ctx.stroke();
  });

  // Footer slug.
  type("500 24px", mono, INK, { spacing: "1px" });
  ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), X0, 1228);
  type("500 22px", mono, MUTED, { spacing: "3px", align: "right" });
  ctx.fillText("CAN YOU BEAT IT?", X1, 1228);

  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png",
    ),
  );
}
