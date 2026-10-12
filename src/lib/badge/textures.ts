import { CARD_H, CARD_W, SLOT } from "./physics";

/** Badge artwork painted into canvases. Layout is in CSS px of a 250px-wide card. */

const CW = 250;
const CH = CW / 0.64;
const CARD_TEX_W = 1024;
const CARD_TEX_H = 1600;
const S = CARD_TEX_W / CW;

export const STRAP_TEX_W = 128;
export const STRAP_TEX_H = 1024;

const INK = "#1c1c1c";
const MUTED = "#4a4844";
const PANEL = "#e8e5de";
const STRAP_BLUE = "#3156c7";
const EMBER = "#ff6b2c";

/* Front-face row layout, shared with the QR hit rect below. */
const PAD_X = 16;
const PANEL_TOP = CH * 0.58;
const ROW_TOP = PANEL_TOP + 20;
const QR_BOX = 84;
const QR_X = CW - PAD_X - QR_BOX;

/** LinkedIn QR on the front face, in 0–1 texture space (y down). */
export const QR_RECT = {
  x0: QR_X / CW,
  y0: ROW_TOP / CH,
  x1: (QR_X + QR_BOX) / CW,
  y1: (ROW_TOP + QR_BOX) / CH,
};

export interface ArtAssets {
  photo: HTMLImageElement;
  qr: HTMLImageElement;
  /** False if fallback fonts were used because the webfonts were late. */
  fontsLoaded: boolean;
}

const FONTS = [
  '600 74px "Inter Tight"',
  '500 40px "Inter Tight"',
  'italic 600 44px "Inter"',
  '500 36px "Inter"',
  '400 36px "Inter"',
  '500 32px "JetBrains Mono"',
];

export async function loadArtAssets(photoSrc: string, qrSrc: string): Promise<ArtAssets> {
  const fonts = Promise.all(FONTS.map((f) => document.fonts.load(f))).then(
    () => true,
    () => false
  );
  const timeout = new Promise<boolean>((r) => window.setTimeout(() => r(false), 1500));
  const [photo, qr, fontsLoaded] = await Promise.all([
    loadImage(photoSrc),
    loadImage(qrSrc),
    Promise.race([fonts, timeout]),
  ]);
  return { photo, qr, fontsLoaded };
}

function loadImage(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode().then(() => img);
}

export function paintFront(canvas: HTMLCanvasElement, { photo, qr }: ArtAssets) {
  const ctx = cardContext(canvas);

  const base = ctx.createLinearGradient(0, 0, CW * 0.55, CH);
  base.addColorStop(0, "#f4f2ec");
  base.addColorStop(1, "#ddd9d0");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, CW, CH);

  ctx.save();
  ctx.filter = "saturate(0.82) contrast(1.03) brightness(1.02)";
  drawCover(ctx, photo, 0, 0, CW, CH * 0.62, 0.5, 0.2);
  ctx.restore();
  slotRim(ctx, "#efece5", "rgba(0,0,0,0.12)");

  // Info panel with the wavy top edge (the old SVG's 100×27 path).
  const waveH = (CH - PANEL_TOP) * 0.13;
  const wx = (x: number) => (x / 100) * CW;
  const wy = (y: number) => PANEL_TOP + 1 - waveH + (y / 27) * waveH;
  ctx.fillStyle = PANEL;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.14)";
  ctx.shadowBlur = 5 * S;
  ctx.shadowOffsetY = -1 * S;
  ctx.beginPath();
  ctx.moveTo(0, CH);
  ctx.lineTo(0, wy(14));
  ctx.bezierCurveTo(wx(22), wy(2), wx(38), wy(24), wx(60), wy(12));
  ctx.bezierCurveTo(wx(74), wy(4), wx(88), wy(10), wx(100), wy(7));
  ctx.lineTo(CW, CH);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.15)";
  ctx.shadowBlur = 2 * S;
  ctx.shadowOffsetY = 1 * S;
  roundRect(ctx, QR_X, ROW_TOP, QR_BOX, QR_BOX, 6);
  ctx.fillStyle = "#ece9e2";
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, QR_X + 4, ROW_TOP + 4, QR_BOX - 8, QR_BOX - 8, 3);
  ctx.clip();
  ctx.drawImage(qr, QR_X + 4, ROW_TOP + 4, QR_BOX - 8, QR_BOX - 8);
  ctx.restore();

  const top = ROW_TOP + (QR_BOX - 63) / 2;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  text(ctx, "Subin Shakya", PAD_X, top + 11.5, '600 18.4px "Inter Tight"', INK, -0.04 * 18.4);
  ctx.fillStyle = "rgba(74,72,68,0.3)";
  ctx.fillRect(PAD_X, top + 29, 40, 1);
  const titleFont = 'italic 600 10.88px "Inter"';
  text(ctx, "Software", PAD_X, top + 42.8, titleFont, MUTED, 0.22);
  text(ctx, "Quality Assurance", PAD_X, top + 56.4, titleFont, MUTED, 0.22);

  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  text(ctx, "ID: SS-0209", CW - 16, CH - 8, '500 8.8px "Inter"', "rgba(74,72,68,0.7)", 0.18);
}

export function paintBack(canvas: HTMLCanvasElement) {
  const ctx = cardContext(canvas);

  const base = ctx.createLinearGradient(0, 0, CW * 0.5, CH);
  base.addColorStop(0, "#efece5");
  base.addColorStop(1, "#e0dcd3");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, CW, CH);

  const bandH = 58;
  const band = ctx.createLinearGradient(0, 0, 0, bandH);
  band.addColorStop(0, "#3a60d2");
  band.addColorStop(1, "#2a4cb6");
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, CW, bandH);
  ctx.fillStyle = EMBER;
  ctx.fillRect(0, bandH, CW, 2.5);
  slotRim(ctx, "rgba(255,255,255,0.2)", "rgba(255,255,255,0.28)");

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const mono = (px: number, weight = 500) => `${weight} ${px}px "JetBrains Mono"`;
  text(ctx, "ACCESS", 16, 38, mono(6.4), "rgba(255,255,255,0.6)", 1.2);
  text(ctx, "ALL ENVIRONMENTS", 16, 48, mono(7.2), "rgba(255,255,255,0.92)", 0.9);
  ctx.textAlign = "right";
  text(ctx, "SS-0209", CW - 16, 48, mono(7.2), "rgba(255,255,255,0.92)", 0.9);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(28,28,28,0.16)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(CW / 2, 138, 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,107,44,0.55)";
  ctx.beginPath();
  ctx.arc(CW / 2, 138, 44.5, -Math.PI * 0.82, -Math.PI * 0.42);
  ctx.stroke();
  text(ctx, "SS", CW / 2, 139, '600 36px "Inter Tight"', INK, -1.4);

  text(ctx, "Subin Shakya", CW / 2, 206, '600 17px "Inter Tight"', INK, -0.6);
  text(ctx, "Software QA Engineer", CW / 2, 225, '500 10.4px "Inter"', MUTED, 0.1);
  text(ctx, "Kathmandu, Nepal", CW / 2, 240, '400 8.8px "Inter"', "rgba(74,72,68,0.72)", 0.1);
  ctx.fillStyle = "rgba(74,72,68,0.28)";
  ctx.fillRect(CW / 2 - 20, 256, 40, 1);
  text(ctx, "AUTOMATION · API · PERFORMANCE", CW / 2, 272, mono(6.6), MUTED, 1.1);

  barcode(ctx, 52, 293, CW - 104, 34);
  text(ctx, "shakyasubin.com.np", CW / 2, 343, mono(7.6), INK, 0.4);
  text(
    ctx,
    "If found, please return to its owner.",
    CW / 2,
    370,
    'italic 500 7px "Inter"',
    "rgba(74,72,68,0.62)",
    0.1
  );
}

/** One seamless repeat of the strap print (U across, V along the strap). */
export function paintStrap(canvas: HTMLCanvasElement) {
  canvas.width = STRAP_TEX_W;
  canvas.height = STRAP_TEX_H;
  const ctx = canvas.getContext("2d")!;
  const W = STRAP_TEX_W;
  const H = STRAP_TEX_H;

  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "#2747ad");
  g.addColorStop(0.18, STRAP_BLUE);
  g.addColorStop(0.82, STRAP_BLUE);
  g.addColorStop(1, "#2747ad");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(6,10,40,0.12)";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1.4);
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  for (let y = 2; y < H; y += 4) ctx.fillRect(0, y, W, 1);

  // 16px dash period divides the tile evenly, so the stitching tiles too.
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.setLineDash([9, 7]);
  for (const x of [10, W - 10]) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  const half = H / 2;
  for (const cy of [half / 2, half + half / 2]) {
    ctx.save();
    ctx.translate(W / 2, cy);
    ctx.rotate(Math.PI / 2);
    trackedCentered(ctx, "SUBIN SHAKYA", 40, 12, "rgba(255,255,255,0.84)");
    ctx.restore();
  }
  for (const by of [0, half, H]) bead(ctx, W / 2, by);
}

/** Box-X stitch for the strap's fold; the bottom edge is the D-ring end. */
export function paintStitch(canvas: HTMLCanvasElement, aspect: number) {
  const w = 128;
  const h = Math.round(w * aspect);
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const x0 = 17;
  const x1 = w - 17;
  const y0 = 12;
  const y1 = h - 16;
  const lines: [number, number, number, number][] = [
    [x0, y0, x1, y0],
    [x1, y0, x1, y1],
    [x1, y1, x0, y1],
    [x0, y1, x0, y0],
    [x0, y0, x1, y1],
    [x1, y0, x0, y1],
  ];
  ctx.lineCap = "round";
  for (const pass of [0, 1]) {
    ctx.strokeStyle = pass ? "rgba(236,241,255,0.96)" : "rgba(4,8,36,0.5)";
    ctx.lineWidth = pass ? 2.3 : 3;
    for (const [ax, ay, bx, by] of lines) {
      const len = Math.hypot(bx - ax, by - ay);
      const n = Math.floor(len / 10);
      for (let i = 0; i < n; i++) {
        const t0 = (i * 10 + 2) / len;
        const t1 = (i * 10 + 8) / len;
        const o = pass ? 0 : 0.9;
        ctx.beginPath();
        ctx.moveTo(ax + (bx - ax) * t0 + o, ay + (by - ay) * t0 + o);
        ctx.lineTo(ax + (bx - ax) * t1 + o, ay + (by - ay) * t1 + o);
        ctx.stroke();
      }
    }
  }
}

/** Printed reinforcement ring around the punched hole. */
function slotRim(ctx: CanvasRenderingContext2D, fill: string, stroke: string) {
  const k = CW / CARD_W;
  const r = SLOT.r * k + 5;
  const cx = CW / 2;
  const cy = (CARD_H / 2 - SLOT.y) * k;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 3 * S;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

function cardContext(canvas: HTMLCanvasElement) {
  canvas.width = CARD_TEX_W;
  canvas.height = CARD_TEX_H;
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(S, 0, 0, CARD_TEX_H / CH, 0, 0);
  return ctx;
}

function text(
  ctx: CanvasRenderingContext2D,
  str: string,
  x: number,
  y: number,
  font: string,
  color: string,
  tracking = 0
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.letterSpacing = `${tracking}px`;
  ctx.fillText(str, x, y);
  ctx.letterSpacing = "0px";
}

/** Centred on the origin, letter by letter so tracking matches in every browser. */
function trackedCentered(
  ctx: CanvasRenderingContext2D,
  str: string,
  size: number,
  tracking: number,
  color: string
) {
  ctx.font = `600 ${size}px "Inter Tight"`;
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const chars = [...str];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + tracking * (chars.length - 1);
  // Half of Inter's ~0.73em cap height.
  const capHalf = size * 0.364;
  let x = -total / 2;
  chars.forEach((c, i) => {
    ctx.fillText(c, x, capHalf);
    x += widths[i] + tracking;
  });
}

function bead(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const r = 6.5;
  const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, r);
  g.addColorStop(0, "#ffb38a");
  g.addColorStop(0.45, EMBER);
  g.addColorStop(1, "#d9501a");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function barcode(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Seeded from the badge ID so the pattern never changes.
  let seed = 209;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const bars: number[] = [];
  let total = 0;
  while (total < w) {
    const bar = 0.6 + Math.floor(rand() * 3) * 0.7;
    const gap = 0.6 + Math.floor(rand() * 3) * 0.6;
    bars.push(bar, gap);
    total += bar + gap;
  }
  const k = w / total;
  ctx.fillStyle = INK;
  let cx = x;
  for (let i = 0; i < bars.length; i += 2) {
    ctx.fillRect(cx, y, bars[i] * k, h);
    cx += (bars[i] + bars[i + 1]) * k;
  }
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  posX: number,
  posY: number
) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const scale = Math.max(dw / iw, dh / ih);
  const sw = dw / scale;
  const sh = dh / scale;
  ctx.drawImage(img, (iw - sw) * posX, (ih - sh) * posY, sw, sh, dx, dy, dw, dh);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
