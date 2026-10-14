import { CARD_H, CARD_W, SLOT } from "./physics";

/** Badge artwork painted into canvases. Layout is in CSS px of a 250px-wide card. */

const CW = 250;
const CH = CW / 0.64;
const CARD_TEX_W = 1024;
const CARD_TEX_H = 1600;
const S = CARD_TEX_W / CW;

export const STRAP_TEX_W = 128;
export const STRAP_TEX_H = 1024;

// Pure black: the card's clearcoat sheen and tone mapping lift and wash out
// anything lighter.
const INK = "#000000";
const STRAP_BLUE = "#3156c7";
const EMBER = "#ff6b2c";

const PAD_X = 18;

/** What the back's barcode encodes. */
const SITE = "shakyasubin.com.np";

/* Front: the photo runs down behind a white panel whose top edge steps from
   PANEL_HIGH on the left to PANEL_LOW on the right in one S-curve. */
const PANEL_HIGH = 262;
const PANEL_LOW = 290;
const CURVE_X0 = 156;
const CURVE_X1 = 228;
/** Portrait cut-out placement: card px per image px, and where the head sits. */
const PORTRAIT = { scale: 0.62, headTop: 58, headY: 90, centreX: 266 };

export interface ArtAssets {
  photo: HTMLImageElement;
  /** False if fallback fonts were used because the webfonts were late. */
  fontsLoaded: boolean;
}

const CARD_FONT = '"Manrope"';

const FONTS = [
  '600 40px "Inter Tight"',
  `500 22px ${CARD_FONT}`,
  `600 10px ${CARD_FONT}`,
  '400 48px "Instrument Serif"',
  'italic 400 48px "Instrument Serif"',
];

export async function loadArtAssets(photoSrc: string): Promise<ArtAssets> {
  const fonts = Promise.all(FONTS.map((f) => document.fonts.load(f))).then(
    () => true,
    () => false
  );
  const timeout = new Promise<boolean>((r) => window.setTimeout(() => r(false), 1500));
  const [photo, fontsLoaded] = await Promise.all([
    loadImage(photoSrc),
    Promise.race([fonts, timeout]),
  ]);
  return { photo, fontsLoaded };
}

function loadImage(src: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  return img.decode().then(() => img);
}

export function paintFront(canvas: HTMLCanvasElement, { photo }: ArtAssets) {
  const ctx = cardContext(canvas);

  // Soft studio backdrop behind the cut-out portrait.
  const wall = ctx.createLinearGradient(0, 0, CW * 0.4, PANEL_LOW);
  wall.addColorStop(0, "#9ea7ad");
  wall.addColorStop(1, "#7d878d");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, CW, CH);

  const { scale, headTop, headY, centreX } = PORTRAIT;
  const pw = photo.naturalWidth * scale;
  const ph = photo.naturalHeight * scale;
  ctx.save();
  ctx.filter = "saturate(0.92) contrast(1.03)";
  ctx.drawImage(photo, CW / 2 - centreX * scale, headTop - headY * scale, pw, ph);
  ctx.restore();
  slotRim(ctx, "#aab2b7", "rgba(0,0,0,0.14)");

  // White panel, stepping down to the right in one smooth curve.
  const mid = (CURVE_X0 + CURVE_X1) / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.12)";
  ctx.shadowBlur = 4 * S;
  ctx.shadowOffsetY = -1 * S;
  ctx.beginPath();
  ctx.moveTo(0, CH);
  ctx.lineTo(0, PANEL_HIGH);
  ctx.lineTo(CURVE_X0, PANEL_HIGH);
  ctx.bezierCurveTo(mid, PANEL_HIGH, mid, PANEL_LOW, CURVE_X1, PANEL_LOW);
  ctx.lineTo(CW, PANEL_LOW);
  ctx.lineTo(CW, CH);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  const name = `500 22px ${CARD_FONT}`;
  text(ctx, "Subin", PAD_X, PANEL_HIGH + 34, name, INK, -0.3);
  text(ctx, "Shakya", PAD_X, PANEL_HIGH + 61, name, INK, -0.3);

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(PAD_X, CH - 38, CW - PAD_X * 2, 1);
  text(ctx, "Software QA Engineer", PAD_X, CH - 20, `500 13px ${CARD_FONT}`, INK, 0);
  ctx.textAlign = "right";
  text(ctx, "ID: SS-0209", CW - PAD_X, CH - 20, `600 10px ${CARD_FONT}`, INK, 0.1);
}

export function paintBack(canvas: HTMLCanvasElement) {
  const ctx = cardContext(canvas);

  const base = ctx.createLinearGradient(0, 0, CW * 0.5, CH);
  base.addColorStop(0, "#0c0c0c");
  base.addColorStop(1, "#050505");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, CW, CH);
  slotRim(ctx, "#121212", "rgba(255,255,255,0.14)");

  // Staggered serif wordmark over a tracked title line.
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  text(ctx, "Subin", 34, 172, '400 50px "Instrument Serif"', "#f4f4f1", -0.5);
  text(ctx, "Shakya", 64, 218, 'italic 400 50px "Instrument Serif"', "#f4f4f1", -0.5);
  ctx.fillStyle = "rgba(244,244,241,0.45)";
  ctx.fillRect(34, 240, 36, 0.8);
  text(ctx, "SOFTWARE QA ENGINEER", 34, 259, `600 8.5px ${CARD_FONT}`, "rgba(244,244,241,0.78)", 2.2);

  // As wide as the card allows: wider bars scan more reliably.
  const lw = 226;
  const lx = (CW - lw) / 2;
  const ly = 294;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, lx, ly, lw, 68, 3);
  ctx.fill();
  barcode(ctx, SITE, lx, ly + 7, lw, 40);
  ctx.textAlign = "center";
  text(ctx, SITE, CW / 2, ly + 61, `600 10.5px ${CARD_FONT}`, INK, 0.2);
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

/** Code 128 bar/space widths for values 0–106; 103–105 start A/B/C, 106 stop. */
const CODE128 = [
  "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213",
  "221312 231212 112232 122132 122231 113222 123122 123221 223211 221132",
  "221231 213212 223112 312131 311222 321122 321221 312212 322112 322211",
  "212123 212321 232121 111323 131123 131321 112313 132113 132311 211313",
  "231113 231311 112133 112331 132131 113123 113321 133121 313121 211331",
  "231131 213113 213311 213131 311123 311321 331121 312113 312311 332111",
  "314111 221411 431111 111224 111422 121124 121421 141122 141221 112214",
  "112412 122114 122411 142112 142211 241211 221114 413111 241112 134111",
  "111242 121142 121241 114212 124112 124211 411212 421112 421211 212141",
  "214121 412121 111143 111341 131141 114113 114311 411113 411311 113141",
  "114131 311141 411131 211412 211214 211232 2331112",
].join(" ").split(" ");

/** Margin either side of the bars, in modules, so scanners can find the edges. */
const QUIET = 10;

/** Bar and space widths for `data` in Code 128 set B, start to stop. */
function code128(data: string) {
  const values = [...data].map((c) => {
    const v = c.charCodeAt(0) - 32;
    if (v < 0 || v > 95) throw new Error(`Code 128 B can't encode "${c}"`);
    return v;
  });
  const check = values.reduce((sum, v, i) => sum + v * (i + 1), 104) % 103;
  return [104, ...values, check, 106].flatMap((v) => [...CODE128[v]].map(Number));
}

/** Scannable Code 128 of `data`, quiet zones included, spanning `w`. */
function barcode(ctx: CanvasRenderingContext2D, data: string, x: number, y: number, w: number, h: number) {
  const widths = code128(data);
  const modules = widths.reduce((a, b) => a + b, 0) + QUIET * 2;
  const m = w / modules;
  ctx.fillStyle = INK;
  let cx = x + QUIET * m;
  widths.forEach((width, i) => {
    if (i % 2 === 0) ctx.fillRect(cx, y, width * m, h);
    cx += width * m;
  });
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
