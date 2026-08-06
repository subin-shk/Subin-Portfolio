/**
 * Turns the flat black backdrop of a cutout photo into real transparency.
 *
 * Straight luminance keying would eat dark hair and a dark suit along with
 * the background, so this floods inward from the frame edges instead and
 * only clears black that is *connected* to the border. Interior darks are
 * left alone. The resulting mask is then feathered so the silhouette has a
 * soft edge rather than a jagged one.
 */

import { useEffect, useState } from "react";

const MAX_EDGE = 1400;
/** Luma allowed above the sampled backdrop before a pixel counts as subject.
 *  Kept tight: black hair sits close to a black backdrop, and a loose
 *  tolerance lets the fill leak through it and eat the whole figure. */
const TOLERANCE = 18;
/** If the fill swallows more than this, the key is wrong — bail to the
 *  original rather than rendering an invisible image. */
const MAX_FILL = 0.85;
const FEATHER = 2; // box-blur passes over the alpha mask

export async function keyBackground(src: string): Promise<string> {
  const img = await load(src);

  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return src;

  ctx.drawImage(img, 0, 0, w, h);
  const image = ctx.getImageData(0, 0, w, h);
  const px = image.data;

  const luma = (i: number) => {
    const o = i * 4;
    return px[o] * 0.299 + px[o + 1] * 0.587 + px[o + 2] * 0.114;
  };

  // Sample the corners rather than assuming pure black — re-encoded cutouts
  // rarely come back at exactly 0.
  const corners = [0, w - 1, (h - 1) * w, h * w - 1].map(luma);
  const cutoff = Math.min(...corners) + TOLERANCE;

  // 255 = keep, 0 = background. Flood inward from every border pixel.
  const alpha = new Uint8ClampedArray(w * h).fill(255);
  const queue = new Int32Array(w * h);
  let head = 0;
  let tail = 0;
  let filled = 0;

  const push = (i: number) => {
    if (alpha[i] === 0 || luma(i) > cutoff) return;
    alpha[i] = 0;
    filled++;
    queue[tail++] = i;
  };

  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }

  while (head < tail) {
    const i = queue[head++];
    const x = i % w;
    const y = (i / w) | 0;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < h - 1) push(i + w);
  }

  // A fill this large means it leaked through the subject.
  if (filled > w * h * MAX_FILL) return src;

  feather(alpha, w, h, FEATHER);

  for (let i = 0; i < alpha.length; i++) px[i * 4 + 3] = alpha[i];
  ctx.putImageData(image, 0, 0);

  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/png")
  );
  return blob ? URL.createObjectURL(blob) : src;
}

/**
 * Returns the keyed version once it's ready, and `false` for `ready` until
 * then, so the caller can hold the image back rather than flashing the
 * un-keyed original. Falls back to the original if keying fails.
 */
export function useKeyedImage(src: string) {
  const [out, setOut] = useState(src);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;

    keyBackground(src)
      .then((result) => {
        if (cancelled) {
          if (result !== src) URL.revokeObjectURL(result);
          return;
        }
        if (result !== src) url = result;
        setOut(result);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [src]);

  return { src: out, ready };
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Separable 3×3 box blur, repeated — cheap and smooth enough for an edge. */
function feather(a: Uint8ClampedArray, w: number, h: number, passes: number) {
  const tmp = new Uint8ClampedArray(a.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const l = a[row + (x > 0 ? x - 1 : x)];
        const c = a[row + x];
        const r = a[row + (x < w - 1 ? x + 1 : x)];
        tmp[row + x] = (l + c + r) / 3;
      }
    }
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const u = tmp[(y > 0 ? y - 1 : y) * w + x];
        const c = tmp[y * w + x];
        const d = tmp[(y < h - 1 ? y + 1 : y) * w + x];
        a[y * w + x] = (u + c + d) / 3;
      }
    }
  }
}
