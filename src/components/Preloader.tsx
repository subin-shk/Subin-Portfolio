import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { personalInfo } from "../data/portfolioData";
import { EASE, useReducedMotion } from "../lib/motion";
import { startScroll, stopScroll } from "../lib/useSmoothScroll";

/** How long the tear takes once triggered — a fixed, eased duration rather
 * than something scrubbed 1:1 with scroll delta, so it always reads as one
 * smooth gesture regardless of how hard or lightly it was triggered. */
const OPEN_DURATION = 1.15;

/**
 * Full-screen name curtain, up ahead of everything else while the page is
 * still at rest. The first scroll/swipe/key doesn't move the real page at
 * all — it's just the trigger for a one-shot open animation (top half up,
 * bottom half down, at a fixed smooth duration) that tears the curtain off
 * the real Hero underneath. Real scrolling stays locked for that one beat
 * so the page is still sitting at the very top, Hero in view, once it
 * finishes — instead of having already crept down by whatever the trigger
 * gesture's own scroll delta happened to be.
 *
 * Both halves stay fully opaque for their entire time on screen — this is
 * a solid panel sliding out of the way, not something dissolving away.
 */
export default function Preloader() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(reduced);
  const openedRef = useRef(false);

  const topY = useMotionValue("0%");
  const bottomY = useMotionValue("0%");

  useEffect(() => {
    if (reduced) return;

    window.scrollTo(0, 0);
    stopScroll();
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const unlock = () => {
      window.scrollTo(0, 0);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      startScroll();
    };

    const open = () => {
      if (openedRef.current) return;
      openedRef.current = true;

      animate(topY, "-100%", { duration: OPEN_DURATION, ease: EASE });
      animate(bottomY, "100%", {
        duration: OPEN_DURATION,
        ease: EASE,
        onComplete: () => {
          unlock();
          setDone(true);
        },
      });
    };

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) open();
    };
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchStartY;
      if (touchStartY - y > 12) open();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "Spacebar"].includes(e.key)) open();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      // Only undo the lock here if the open animation never got to —
      // `unlock` above already ran it once on the success path, and
      // running it twice is harmless but the effect could also unmount
      // (e.g. fast refresh) mid-lock with no animation ever kicking off.
      if (!openedRef.current) unlock();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  if (done) return null;

  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[300]">
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
  y: ReturnType<typeof useMotionValue<string>>;
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
