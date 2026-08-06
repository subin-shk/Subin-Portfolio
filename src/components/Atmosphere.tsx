import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/motion";

type Mote = {
  x: number;
  y: number;
  z: number; // 0..1 depth — drives size, opacity and drift speed
  vx: number;
  vy: number;
  sprite: number;
  phase: number;
};

const HUES = [
  [95, 212, 232], // cyan
  [77, 124, 255], // blue
  [155, 123, 255], // violet
  [255, 255, 255], // white glint
];

const SPRITE = 32; // px, pre-rendered mote texture

/**
 * The permanent backdrop: a slow gradient mesh, a cursor-tracked bloom,
 * floating dust, and film grain. Fixed behind every movement so the page
 * reads as one continuous space rather than a stack of sections.
 *
 * Two things here are deliberate performance choices:
 *  - The bloom is moved with `transform`, not by writing CSS custom
 *    properties on :root. Root-level var writes invalidate style for every
 *    element that inherits them — once per frame, that alone cost more than
 *    the rest of the page combined.
 *  - Motes are drawn from a pre-rendered sprite. Building a radial gradient
 *    per mote per frame was ~80 gradient allocations every 16ms.
 */
export default function Atmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const bloom = bloomRef.current;
    if (!bloom || reduced) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let sx = x;
    let sy = y;
    let raf = 0;
    let idle = false;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(loop);
      }
    };

    const loop = () => {
      // Trail the pointer — the light has mass, it shouldn't snap.
      sx += (x - sx) * 0.06;
      sy += (y - sy) * 0.06;
      bloom.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(
        1
      )}px, 0) translate(-50%, -50%)`;

      // Park the loop once it has caught up; a still pointer costs nothing.
      if (Math.abs(x - sx) < 0.4 && Math.abs(y - sy) < 0.4) {
        idle = true;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // One sprite per hue, drawn once up front.
    const sprites = HUES.map(([r, g, b]) => {
      const s = document.createElement("canvas");
      s.width = s.height = SPRITE;
      const sc = s.getContext("2d");
      if (sc) {
        const half = SPRITE / 2;
        const grad = sc.createRadialGradient(half, half, 0, half, half, half);
        grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
        grad.addColorStop(0.35, `rgba(${r},${g},${b},0.35)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
        sc.fillStyle = grad;
        sc.fillRect(0, 0, SPRITE, SPRITE);
      }
      return s;
    });

    let w = 0;
    let h = 0;
    let motes: Mote[] = [];
    let raf = 0;
    let running = true;
    let t = 0;

    const seed = () => {
      const count = Math.min(36, Math.round((w * h) / 46000));
      motes = Array.from({ length: count }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          vx: (Math.random() - 0.5) * 0.11 * (0.35 + z),
          vy: -(0.05 + Math.random() * 0.14) * (0.35 + z),
          sprite: Math.floor(Math.random() * sprites.length),
          phase: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      // Dust is soft by nature; rendering it above 1.5x buys nothing.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      if (!running) return;
      t += 0.006;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const m of motes) {
        m.x += m.vx + Math.sin(t + m.phase) * 0.14 * m.z;
        m.y += m.vy;

        // Wrap rather than respawn — no popping at the edges.
        if (m.y < -20) {
          m.y = h + 20;
          m.x = Math.random() * w;
        }
        if (m.x < -20) m.x = w + 20;
        if (m.x > w + 20) m.x = -20;

        const twinkle = 0.55 + Math.sin(t * 2.1 + m.phase) * 0.45;
        // Near motes are bigger and brighter — cheap depth of field.
        const size = SPRITE * (0.32 + m.z * 0.7);
        ctx.globalAlpha = (0.07 + m.z * 0.26) * twinkle;
        ctx.drawImage(sprites[m.sprite], m.x - size / 2, m.y - size / 2, size, size);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    // Don't burn frames on a backgrounded tab.
    const onVisibility = () => {
      running = !document.hidden;
      if (running) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: "var(--ink)" }}
    >
      {/* ---- Gradient mesh: three slow, overlapping light sources ----
           No `filter: blur()` here. These are viewport-sized elements, and
           blurring them forced a full re-rasterise of ~68vmax of pixels on
           every drift frame — it was the single most expensive thing on the
           page. Multi-stop radial gradients are already perfectly smooth;
           the blur was rendering softness that was there anyway. */}
      <div className="absolute inset-0 opacity-[0.62]">
        <div
          className="absolute rounded-full gpu"
          style={{
            width: "68vmax",
            height: "68vmax",
            top: "-22vmax",
            left: "-14vmax",
            background:
              "radial-gradient(closest-side, rgba(77,124,255,0.40), rgba(77,124,255,0.22) 32%, rgba(77,124,255,0.08) 58%, transparent 78%)",
            animation: "drift-a 34s var(--ease-liquid) infinite",
          }}
        />
        <div
          className="absolute rounded-full gpu"
          style={{
            width: "58vmax",
            height: "58vmax",
            top: "26vmax",
            right: "-18vmax",
            background:
              "radial-gradient(closest-side, rgba(155,123,255,0.34), rgba(155,123,255,0.19) 32%, rgba(155,123,255,0.07) 58%, transparent 78%)",
            animation: "drift-b 42s var(--ease-liquid) infinite",
          }}
        />
        <div
          className="absolute rounded-full gpu"
          style={{
            width: "50vmax",
            height: "50vmax",
            bottom: "-16vmax",
            left: "22vw",
            background:
              "radial-gradient(closest-side, rgba(95,212,232,0.28), rgba(95,212,232,0.15) 34%, rgba(95,212,232,0.05) 60%, transparent 80%)",
            animation: "drift-c 50s var(--ease-liquid) infinite",
          }}
        />
      </div>

      <div
        ref={bloomRef}
        className="absolute left-0 top-0 h-[60rem] w-[60rem] gpu"
        style={{
          background:
            "radial-gradient(circle, rgba(120,170,255,0.13), rgba(95,212,232,0.05) 38%, transparent 66%)",
          transform: "translate3d(50vw, 50vh, 0) translate(-50%, -50%)",
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0" />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 88% at 50% 42%, transparent 32%, rgba(5,5,5,0.55) 78%, rgba(5,5,5,0.9) 100%)",
        }}
      />

      <div className="grain" />
    </div>
  );
}
