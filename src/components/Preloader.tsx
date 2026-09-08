import { useEffect, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown } from "lucide-react";
import { personalInfo } from "../data/portfolioData";
import { useReducedMotion } from "../lib/motion";

/** Scroll distance (px) over which the curtain fully opens. */
const REVEAL_DISTANCE = 480;

/**
 * Full-screen name curtain, up ahead of everything else while the page is
 * still at rest. Scrolling tears it open — top half up, bottom half down —
 * onto the real Hero underneath, instead of it fading out on a timer.
 *
 * Built as two overflow-hidden halves each holding a *doubled*-height copy
 * of the same content, anchored to their own outer edge: that puts both
 * copies' centers exactly on the viewport's vertical center, so together
 * they read as one uncut name even though each half only ever shows its
 * own 50%.
 */
export default function Preloader() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(reduced);
  const { scrollY } = useScroll();

  const progress = useTransform(scrollY, [0, REVEAL_DISTANCE], [0, 1], {
    clamp: true,
  });
  const topY = useTransform(progress, [0, 1], ["0%", "-100%"]);
  const bottomY = useTransform(progress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(progress, [0, 1], [1, 0]);

  useMotionValueEvent(progress, "change", (v) => {
    if (v >= 1) setDone(true);
  });

  // A refresh mid-page would otherwise start half-open with nothing above
  // it left to tear — pin to the top for the one frame this owns.
  useEffect(() => {
    if (!reduced) window.scrollTo(0, 0);
  }, [reduced]);

  if (done) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[300]"
      style={{ opacity }}
    >
      <Half edge="top" y={topY} />
      <Half edge="bottom" y={bottomY} />
    </motion.div>
  );
}

function Half({
  edge,
  y,
}: {
  edge: "top" | "bottom";
  y: MotionValue<string>;
}) {
  return (
    <motion.div
      className={`absolute inset-x-0 h-1/2 overflow-hidden ${
        edge === "top" ? "top-0" : "bottom-0"
      }`}
      style={{ y, background: "var(--ink)" }}
    >
      <div
        className={`absolute inset-x-0 flex h-[200%] items-center justify-center ${
          edge === "top" ? "top-0" : "bottom-0"
        }`}
      >
        <Curtain />
      </div>
    </motion.div>
  );
}

function Curtain() {
  const name = personalInfo.name.toUpperCase();
  return (
    <div className="flex flex-col items-center gap-9 sm:gap-12">
      <h2
        className="font-display font-medium uppercase leading-[0.9] text-white"
        style={{
          fontSize: "clamp(2.4rem, 9vw, 7rem)",
          letterSpacing: "-0.05em",
        }}
      >
        {name}
      </h2>
      <ScrollBadge />
    </div>
  );
}

function ScrollBadge() {
  return (
    <div className="relative grid place-items-center" style={{ width: 92, height: 92 }}>
      <motion.svg
        viewBox="0 0 100 100"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path
            id="preloader-scroll-circle"
            d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
          />
        </defs>
        <text
          className="font-mono"
          fill="rgba(255,255,255,0.55)"
          fontSize="7.2"
          letterSpacing="2"
        >
          <textPath href="#preloader-scroll-circle" startOffset="0%">
            SCROLL · SCROLL · SCROLL · SCROLL ·
          </textPath>
        </text>
      </motion.svg>
      <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70">
        <ArrowDown size={15} strokeWidth={1.8} />
      </span>
    </div>
  );
}
