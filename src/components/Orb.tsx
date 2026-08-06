import { useEffect, useRef, useState } from "react";

type Mode = "idle" | "touch" | "media";

/**
 * A soft ring that trails the pointer and widens over interactive elements.
 *
 * It sits *alongside* the native cursor rather than replacing it — hiding
 * the system pointer costs more in usability than the effect is worth. So
 * there's no bright core here; that would just read as a second cursor.
 *
 * Coarse pointers and reduced-motion users get nothing at all.
 */
export default function Orb() {
  const haloRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    const halo = { x, y };
    const trail = { x, y };
    let raf = 0;
    let idle = false;

    const loop = () => {
      halo.x += (x - halo.x) * 0.17;
      halo.y += (y - halo.y) * 0.17;
      trail.x += (x - trail.x) * 0.08;
      trail.y += (y - trail.y) * 0.08;

      if (haloRef.current)
        haloRef.current.style.transform = `translate3d(${halo.x}px, ${halo.y}px, 0) translate(-50%, -50%)`;
      if (trailRef.current)
        trailRef.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`;

      // Stop the loop once it has settled; restarted on the next move.
      if (Math.abs(x - trail.x) < 0.4 && Math.abs(y - trail.y) < 0.4) {
        idle = true;
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      setVisible(true);
      if (idle) {
        idle = false;
        raf = requestAnimationFrame(loop);
      }
    };

    const onOver = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el?.closest) return;
      if (el.closest("[data-orb='media']")) setMode("media");
      else if (el.closest("a, button, input, textarea, [data-orb='touch']"))
        setMode("touch");
      else setMode("idle");
    };

    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      cancelAnimationFrame(raf);
    };
  }, []);

  const haloSize = mode === "media" ? 96 : mode === "touch" ? 62 : 38;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[120] hidden [@media(hover:hover)and(pointer:fine)]:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .35s ease" }}
    >
      {/* Soft residue, furthest behind */}
      <div
        ref={trailRef}
        className="absolute left-0 top-0 h-16 w-16 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(120,170,255,0.28), transparent 68%)",
          opacity: mode === "idle" ? 0.7 : 1,
          transition: "opacity .4s ease",
        }}
      />

      {/* Ring that reacts to what's under the pointer */}
      <div
        ref={haloRef}
        className="absolute left-0 top-0 rounded-full"
        style={{
          width: haloSize,
          height: haloSize,
          border: "1px solid rgba(255,255,255,0.22)",
          background:
            mode === "media"
              ? "radial-gradient(circle, rgba(255,255,255,0.07), transparent 70%)"
              : "radial-gradient(circle, rgba(255,255,255,0.04), transparent 70%)",
          boxShadow: "0 0 22px rgba(120,170,255,0.18)",
          transition:
            "width .42s var(--ease-glass), height .42s var(--ease-glass), background .42s ease",
        }}
      />
    </div>
  );
}
