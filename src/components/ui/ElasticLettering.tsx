import { useEffect, useRef, type ReactNode } from "react";

/**
 * A line of letters you can grab, stretch and fling. Each letter is a mass
 * on a spring to its rest spot, and linked to its neighbours by springs of
 * its own — that chain is the band: pull one letter and the ones beside it
 * follow at roughly half the distance each step out, then the lot snaps
 * back with an overshoot.
 *
 * Driven by a rAF loop writing transforms straight to the DOM, and parked
 * as soon as everything is at rest, so a still headline costs nothing.
 */

/** Spring to rest. With DAMP it settles in about a second, wobbling twice. */
const HOME = 120;
/** Spring to each neighbour; against HOME it sets the ~0.5 falloff. */
const LINK = 260;
const DAMP = 9;
/** How far (in em) a letter goes before the band stiffens up. */
const REACH = 1.6;
/** Fastest fling, in em/s, so a flick off a trackpad doesn't explode. */
const MAX_FLING = 40;
/**
 * Hover bounce. It runs on a spring of each letter's own, outside the band,
 * so only the letter under the mouse moves; its neighbours stay put.
 */
const PLUCK = 3;
const HOP_K = 400;
const HOP_DAMP = 12;
const MAX_STRETCH = 0.55;
const SUBSTEPS = 4;

type Mass = { x: number; y: number; vx: number; vy: number };
type Hop = { y: number; v: number };

type Props = {
  text: string;
  /** Wraps each letter's glyph, e.g. for an entrance animation. */
  renderChar?: (ch: string, index: number) => ReactNode;
  className?: string;
  /** Class for the gap a space leaves. */
  spaceClassName?: string;
  /** Renders plain, still letters — for reduced motion. */
  disabled?: boolean;
};

export default function ElasticLettering({
  text,
  renderChar = (ch) => ch,
  className,
  spaceClassName,
  disabled = false,
}: Props) {
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);
  const chars = text.split("");

  useEffect(() => {
    if (disabled) return;
    const els = lettersRef.current.filter((el): el is HTMLSpanElement => !!el);
    if (!els.length) return;

    const masses: Mass[] = els.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const hops: Hop[] = els.map(() => ({ y: 0, v: 0 }));
    const grab = { i: -1, id: -1, ox: 0, oy: 0, tx: 0, ty: 0, vx: 0, vy: 0, lt: 0 };
    let em = parseFloat(getComputedStyle(els[0]).fontSize) || 16;
    let raf = 0;
    let last = 0;

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const step = (h: number) => {
      masses.forEach((m, i) => {
        if (i === grab.i) {
          m.x = grab.tx;
          m.y = grab.ty;
          return;
        }
        let ax = -HOME * m.x - DAMP * m.vx;
        let ay = -HOME * m.y - DAMP * m.vy;
        const prev = masses[i - 1];
        const next = masses[i + 1];
        if (prev) {
          ax += LINK * (prev.x - m.x);
          ay += LINK * (prev.y - m.y);
        }
        if (next) {
          ax += LINK * (next.x - m.x);
          ay += LINK * (next.y - m.y);
        }
        m.vx += ax * h;
        m.vy += ay * h;
      });
      masses.forEach((m, i) => {
        if (i === grab.i) return;
        m.x += m.vx * h;
        m.y += m.vy * h;
      });
      hops.forEach((p) => {
        p.v += (-HOP_K * p.y - HOP_DAMP * p.v) * h;
        p.y += p.v * h;
      });
    };

    const paint = () => {
      let moving = grab.i !== -1;
      masses.forEach((m, i) => {
        const prev = masses[i - 1];
        const next = masses[i + 1];
        const n = (prev ? 1 : 0) + (next ? 1 : 0);
        // Stretch along whatever a letter is pulled away from: its
        // neighbours, plus a little of its own speed so a fling smears.
        const sx = m.x - ((prev?.x ?? 0) + (next?.x ?? 0)) / n + m.vx * 0.015;
        const sy = m.y - ((prev?.y ?? 0) + (next?.y ?? 0)) / n + m.vy * 0.015;
        const a = Math.min(MAX_STRETCH, (Math.hypot(sx, sy) / em) * 0.5);
        const hop = hops[i];
        const rest =
          Math.abs(m.x) + Math.abs(m.y) + Math.abs(hop.y) < 0.05 &&
          Math.abs(m.vx) + Math.abs(m.vy) + Math.abs(hop.v) < 0.5;
        const y = m.y + hop.y;

        if (rest && i !== grab.i) {
          els[i].style.transform = "";
          return;
        }
        moving = true;
        const deg = (Math.atan2(sy, sx) * 180) / Math.PI;
        // Volume-preserving: longer along the pull, thinner across it.
        els[i].style.transform =
          `translate3d(${m.x.toFixed(2)}px, ${y.toFixed(2)}px, 0) ` +
          `rotate(${deg.toFixed(1)}deg) scale(${(1 + a).toFixed(3)}, ${(1 / (1 + a)).toFixed(3)}) rotate(${(-deg).toFixed(1)}deg)`;
      });
      return moving;
    };

    const tick = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      for (let s = 0; s < SUBSTEPS; s += 1) step(dt / SUBSTEPS);
      if (paint()) {
        raf = requestAnimationFrame(tick);
      } else {
        masses.forEach((m) => Object.assign(m, { x: 0, y: 0, vx: 0, vy: 0 }));
        hops.forEach((p) => Object.assign(p, { y: 0, v: 0 }));
        raf = 0;
      }
    };

    const onDown = (i: number) => (e: PointerEvent) => {
      if (e.button !== 0 || grab.i !== -1) return;
      e.preventDefault();
      els[i].setPointerCapture(e.pointerId);
      els[i].style.zIndex = "1";
      em = parseFloat(getComputedStyle(els[i]).fontSize) || em;
      const m = masses[i];
      Object.assign(grab, {
        i,
        id: e.pointerId,
        ox: e.clientX - m.x,
        oy: e.clientY - m.y,
        tx: m.x,
        ty: m.y,
        vx: 0,
        vy: 0,
        lt: performance.now(),
      });
      wake();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== grab.id) return;
      const dx = e.clientX - grab.ox;
      const dy = e.clientY - grab.oy;
      const len = Math.hypot(dx, dy);
      // Rubber-band: free at first, then ever stiffer towards REACH.
      const reach = REACH * em;
      const k = len > 0 ? (reach * Math.tanh(len / reach)) / len : 0;
      const now = performance.now();
      const span = Math.max(1, now - grab.lt) / 1000;
      const tx = dx * k;
      const ty = dy * k;
      grab.vx = grab.vx * 0.3 + ((tx - grab.tx) / span) * 0.7;
      grab.vy = grab.vy * 0.3 + ((ty - grab.ty) / span) * 0.7;
      grab.tx = tx;
      grab.ty = ty;
      grab.lt = now;
      wake();
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== grab.id) return;
      const m = masses[grab.i];
      // Held still before letting go: just release, don't fling.
      const still = performance.now() - grab.lt > 80;
      const cap = MAX_FLING * em;
      const speed = Math.hypot(grab.vx, grab.vy);
      const f = still ? 0 : Math.min(1, cap / Math.max(speed, 1e-6));
      m.vx = grab.vx * f;
      m.vy = grab.vy * f;
      els[grab.i].style.zIndex = "";
      grab.i = -1;
      grab.id = -1;
      wake();
    };

    const onEnter = (i: number) => (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || grab.i !== -1) return;
      const hop = hops[i];
      // A bouncing letter can slip out from under a still mouse and back;
      // re-kicking it then would keep it shaking.
      if (Math.abs(hop.y) > 0.5 || Math.abs(hop.v) > 5) return;
      hop.v -= PLUCK * em;
      wake();
    };

    const off = els.map((el, i) => {
      const down = onDown(i);
      const enter = onEnter(i);
      el.addEventListener("pointerdown", down);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
      el.addEventListener("pointerenter", enter);
      return () => {
        el.removeEventListener("pointerdown", down);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        el.removeEventListener("pointerenter", enter);
      };
    });

    return () => {
      cancelAnimationFrame(raf);
      off.forEach((fn) => fn());
      els.forEach((el) => (el.style.transform = ""));
    };
  }, [disabled, text]);

  let slot = 0;
  return (
    <span aria-hidden="true" className={className}>
      {chars.map((ch, i) => {
        if (ch === " ") return <span key={i} className={spaceClassName} />;
        const at = slot++;
        return (
          <span
            key={i}
            ref={(el) => {
              lettersRef.current[at] = el;
            }}
            className={`relative inline-block select-none${disabled ? "" : " cursor-grab active:cursor-grabbing"}`}
            style={disabled ? undefined : { touchAction: "none" }}
          >
            {renderChar(ch, i)}
          </span>
        );
      })}
    </span>
  );
}
