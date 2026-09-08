import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useMediaQuery, useReducedMotion } from "../lib/motion";

type HoverKind = "default" | "link" | "button" | "project";

const IDLE_DELAY = 2600; // ms of stillness before the star falls asleep
const SIZE = 24; // px, the star's on-screen footprint
const STATIC_TILT = -18; // deg — leans left, like a classic arrow pointer

// Where the star's tip sits inside its own 0-100 viewBox (matches the "M"
// that opens STAR_PATH below). A real cursor's hotspot — the exact pixel
// a click lands on — never moves, so we anchor + pivot every transform on
// this point instead of the shape's center: the tip stays glued to the
// actual mouse position while the tail is the only part that swings, zooms
// or tilts, which is what makes it read as a pointer rather than a charm
// floating near the mouse.
const TIP_X = 50;
const TIP_Y = 4;
const TIP_ORIGIN = `${TIP_X}% ${TIP_Y}%`;

/** Trailing companions: each one lags a bit more than the last. */
const TRAIL = [
  { stiffness: 210, damping: 24, scale: 0.46, opacity: 0.42 },
  { stiffness: 150, damping: 23, scale: 0.36, opacity: 0.3 },
] as const;

const INTERACTIVE_SELECTOR =
  'a[href], button, [role="button"], input[type="submit"], input[type="button"], label[for], select, summary';
const PROJECT_SELECTOR = '[data-cursor="project"]';
const TEXT_SELECTOR = 'input, textarea, [contenteditable="true"]';

/** A slim, needle-like point with a small flared base and two subtle
 * shoulder flicks — reads as an arrow/pointer first, sparkle second. */
const STAR_PATH =
  "M50 4 C54 22 60 34 70 50 C60 44 55 60 50 72 C45 60 40 44 30 50 C40 34 46 22 50 4 Z";

function classifyTarget(el: EventTarget | null): {
  hover: HoverKind;
  text: boolean;
} {
  if (!(el instanceof Element)) return { hover: "default", text: false };
  if (el.closest(TEXT_SELECTOR)) return { hover: "default", text: true };
  if (el.closest(PROJECT_SELECTOR)) return { hover: "project", text: false };
  const interactive = el.closest(INTERACTIVE_SELECTOR);
  if (interactive) {
    const isButton =
      interactive.tagName === "BUTTON" ||
      interactive.getAttribute("role") === "button" ||
      (interactive as HTMLInputElement).type === "submit" ||
      (interactive as HTMLInputElement).type === "button";
    return { hover: isButton ? "button" : "link", text: false };
  }
  return { hover: "default", text: false };
}

/**
 * A small celestial mascot that replaces the system cursor on desktop.
 * Position/lean/squash ride Framer Motion values so mousemove never causes
 * a React re-render; only the (infrequent) awake/hover/click states do.
 * Fully inert on touch devices and heavily simplified under reduced motion.
 */
export default function CustomCursor() {
  const isTouch = useMediaQuery("(pointer: coarse)");
  const reduced = useReducedMotion();

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // The star itself tracks the raw pointer 1:1, exactly like the native
  // cursor — no spring, no lag. Only the trailing companions below lag.
  const x = mouseX;
  const y = mouseY;

  // Trailing mini-stars — each its own (softer) spring off the same raw
  // mouse position, so they hang back progressively rather than shift
  // sideways the way a rotation/skew based on lag direction used to.
  const trailX0 = useSpring(mouseX, { ...TRAIL[0], mass: 0.6 });
  const trailY0 = useSpring(mouseY, { ...TRAIL[0], mass: 0.6 });
  const trailX1 = useSpring(mouseX, { ...TRAIL[1], mass: 0.6 });
  const trailY1 = useSpring(mouseY, { ...TRAIL[1], mass: 0.6 });
  const trailSprings = [
    [trailX0, trailY0],
    [trailX1, trailY1],
  ] as const;

  const [visible, setVisible] = useState(false);
  const [awake, setAwake] = useState(true);
  const [hover, setHover] = useState<HoverKind>("default");
  const [overText, setOverText] = useState(false);
  const [burstId, setBurstId] = useState(0);

  const awakeRef = useRef(true);
  const lastMove = useRef(0);
  const hiddenRef = useRef(false);

  useEffect(() => {
    if (isTouch) return;

    document.documentElement.classList.add("custom-cursor-active");

    const onMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      lastMove.current = performance.now();
      if (!visible) setVisible(true);
      if (!awakeRef.current) {
        awakeRef.current = true;
        setAwake(true);
      }
    };

    const onOver = (e: PointerEvent) => {
      const { hover: kind, text } = classifyTarget(e.target);
      setHover((prev) => (prev === kind ? prev : kind));
      setOverText((prev) => (prev === text ? prev : text));
    };

    const onDown = () => {
      setBurstId((n) => n + 1);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    const idleCheck = window.setInterval(() => {
      if (
        awakeRef.current &&
        performance.now() - lastMove.current > IDLE_DELAY
      ) {
        awakeRef.current = false;
        setAwake(false);
      }
    }, 300);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerleave", onLeave);
      window.clearInterval(idleCheck);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouch]);

  if (isTouch) return null;

  const sleeping = awake === false && !reduced;
  const hidden = !visible || overText;
  hiddenRef.current = hidden;

  const glow =
    hover === "project"
      ? "drop-shadow(0 0 9px rgba(95,212,232,0.85)) drop-shadow(0 0 18px rgba(77,124,255,0.45))"
      : hover === "link" || hover === "button"
      ? "drop-shadow(0 0 6px rgba(95,212,232,0.7))"
      : "drop-shadow(0 0 4px rgba(95,212,232,0.45))";

  const bodyScale = sleeping
    ? 0.92
    : hover === "project"
    ? 1.28
    : hover === "button"
    ? 1.22
    : hover === "link"
    ? 1.14
    : 1;

  const trailHidden = hidden || sleeping || reduced;

  return (
    <>
      {!reduced &&
        trailSprings.map(([tx, ty], i) => {
          const cfg = TRAIL[i];
          const trailSize = SIZE * cfg.scale;
          return (
            <motion.svg
              key={i}
              aria-hidden
              viewBox="0 0 100 100"
              width={trailSize}
              height={trailSize}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                x: tx,
                y: ty,
                marginLeft: -(TIP_X / 100) * trailSize,
                marginTop: -(TIP_Y / 100) * trailSize,
                pointerEvents: "none",
                zIndex: 2147483646,
                filter: "drop-shadow(0 0 3px rgba(95,212,232,0.6))",
                rotate: STATIC_TILT,
                transformOrigin: TIP_ORIGIN,
              }}
              animate={{
                scale: [1, 0.82, 1],
                opacity: trailHidden ? 0 : cfg.opacity,
              }}
              transition={{
                scale: {
                  duration: 1.8 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15,
                },
                opacity: { duration: 0.3, ease: "easeOut" },
              }}
            >
              <path
                d={STAR_PATH}
                fill="#a5e9f5"
                stroke="rgba(8,12,20,0.35)"
                strokeWidth={2.5}
              />
            </motion.svg>
          );
        })}

      <motion.div
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          x,
          y,
          width: SIZE,
          height: SIZE,
          marginLeft: -(TIP_X / 100) * SIZE,
          marginTop: -(TIP_Y / 100) * SIZE,
          pointerEvents: "none",
          zIndex: 2147483647,
        opacity: hidden ? 0 : 1,
        transition: "opacity 0.25s ease",
      }}
    >
      <motion.div
        animate={
          reduced
            ? { y: 0 }
            : sleeping
            ? { y: [0, -3, 0] }
            : { y: 0 }
        }
        transition={
          sleeping
            ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.4, ease: "easeOut" }
        }
        style={{ width: "100%", height: "100%" }}
      >
        <motion.svg
          viewBox="0 0 100 100"
          width={SIZE}
          height={SIZE}
          style={{ filter: glow, rotate: STATIC_TILT, transformOrigin: TIP_ORIGIN }}
          animate={{ scale: bodyScale }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.path
            d={STAR_PATH}
            fill="#eaf7ff"
            /* A near-black stroke keeps the star readable over light
               surfaces (the marquee pills, the ID card's light panel,
               etc.) — without it the near-white fill just disappears
               there. */
            stroke="rgba(8,12,20,0.45)"
            strokeWidth={2.5}
            animate={{
              fill: hover === "project" ? "#dff6ff" : "#eaf7ff",
            }}
          />
        </motion.svg>
      </motion.div>

      {/* Click sparkle */}
      <AnimatePresence>
        {burstId > 0 && !reduced && (
          <motion.svg
            key={burstId}
            viewBox="0 0 100 100"
            width={SIZE * 1.8}
            height={SIZE * 1.8}
            style={{
              position: "absolute",
              // Centered on the star's tip (its hotspot — see TIP_ORIGIN),
              // not the box's geometric center, so the sparkle bursts from
              // exactly where the click actually landed.
              top: `${TIP_Y}%`,
              left: `${TIP_X}%`,
              marginLeft: -(SIZE * 1.8) / 2,
              marginTop: -(SIZE * 1.8) / 2,
              pointerEvents: "none",
            }}
            initial={{ opacity: 0.9, scale: 0.3 }}
            animate={{ opacity: 0, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line
                key={deg}
                x1={50}
                y1={50}
                x2={50 + 34 * Math.cos((deg * Math.PI) / 180)}
                y2={50 + 34 * Math.sin((deg * Math.PI) / 180)}
                stroke="rgba(165,233,245,0.9)"
                strokeWidth={3}
                strokeLinecap="round"
              />
            ))}
          </motion.svg>
        )}
      </AnimatePresence>
      </motion.div>
    </>
  );
}
