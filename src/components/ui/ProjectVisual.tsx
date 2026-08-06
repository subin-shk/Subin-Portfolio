import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Accent } from "../../types";
import { useReducedMotion } from "../../lib/motion";

const RGB: Record<Accent, string> = {
  blue: "77,124,255",
  cyan: "95,212,232",
  violet: "155,123,255",
};

/**
 * Cover art for projects that have no screenshot.
 *
 * Deliberately abstract rather than a mocked-up interface — an orbital
 * figure whose ring count and node placement are derived from the project
 * id, so each one is recognisably its own without pretending to be a
 * picture of software that doesn't look like that.
 */
export default function ProjectVisual({
  seed,
  accent,
}: {
  seed: string;
  accent: Accent;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // Six of these exist at once. Left unguarded, every ring in every panel
  // keeps spinning off-screen and the whole stack fights the scroll.
  const onScreen = useInView(ref, { margin: "120px" });
  const rgb = RGB[accent];
  const n = Number(seed) || 1;
  const spin = onScreen && !reduced;

  const rings = [0, 1, 2].map((i) => ({
    r: 58 + i * 34,
    nodes: 3 + ((n + i) % 4),
    dur: 34 + i * 11 + (n % 5) * 3,
    dir: i % 2 === 0 ? 1 : -1,
    opacity: 0.34 - i * 0.055,
  }));

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {/* Bloom */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 60% at 50% 46%, rgba(${rgb},0.30), rgba(${rgb},0.07) 45%, transparent 72%)`,
        }}
      />

      <svg
        viewBox="0 0 400 400"
        className="absolute left-1/2 top-1/2 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`fade-${seed}`}>
            <stop offset="55%" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`mask-${seed}`}>
            <rect width="400" height="400" fill={`url(#fade-${seed})`} />
          </mask>
        </defs>

        <g mask={`url(#mask-${seed})`}>
          {rings.map((ring, i) => (
            <motion.g
              key={i}
              style={{ originX: "200px", originY: "200px" }}
              animate={spin ? { rotate: 360 * ring.dir } : {}}
              transition={{
                duration: ring.dur,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <circle
                cx="200"
                cy="200"
                r={ring.r}
                fill="none"
                stroke={`rgba(${rgb},${ring.opacity})`}
                strokeWidth="0.75"
                strokeDasharray={i % 2 ? "3 7" : undefined}
              />
              {Array.from({ length: ring.nodes }).map((_, k) => {
                const a = (k / ring.nodes) * Math.PI * 2 + i * 0.7;
                return (
                  <circle
                    key={k}
                    cx={200 + Math.cos(a) * ring.r}
                    cy={200 + Math.sin(a) * ring.r}
                    r={i === 0 ? 2.6 : 1.7}
                    fill={`rgba(${rgb},${0.85 - i * 0.14})`}
                  />
                );
              })}
            </motion.g>
          ))}

          {/* Core */}
          <circle
            cx="200"
            cy="200"
            r="7"
            fill="rgba(255,255,255,0.85)"
            style={{ filter: `drop-shadow(0 0 10px rgba(${rgb},0.9))` }}
          />
          <motion.circle
            cx="200"
            cy="200"
            r="7"
            fill="none"
            stroke={`rgba(${rgb},0.6)`}
            strokeWidth="1"
            animate={spin ? { r: [7, 30], opacity: [0.7, 0] } : {}}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut" }}
          />
        </g>
      </svg>

      <div className="grain !opacity-25" />
    </div>
  );
}
