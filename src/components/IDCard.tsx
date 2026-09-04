import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { personalInfo } from "../data/portfolioData";
import { useReducedMotion } from "../lib/motion";
import badgePortrait from "../images/subin-shk-hero2.jpg";

const ROLE = "Software QA Automation Engineer";

/** Degrees/pixels of give per normalized (-1..1) pointer offset. */
const MAX_TILT = 9;
const MAX_SWING_DEG = 6;
const MAX_SWING_PX = 9;

/** Hard ceiling on the *rendered* value, independent of the spring math —
 * a defensive clamp so a fast flick or a retargeted-mid-flight spring can
 * never visually fling the badge past a believable swing. */
const SWING_CLAMP = MAX_SWING_DEG + 4;
const TILT_CLAMP = MAX_TILT + 3;
const SWAY_CLAMP = MAX_SWING_PX + 6;

/** Close to critically damped: a little give, no wild overshoot. */
const TILT_SPRING = { stiffness: 60, damping: 15, mass: 1 };
const SWING_SPRING = { stiffness: 42, damping: 15, mass: 1.1 };
const SWAY_SPRING = { stiffness: 50, damping: 14, mass: 1 };

/** Snap-back after a drag release: seeded with the release velocity so
 * a fast flick returns faster and overshoots more, like a real tether. */
const RETURN_SPRING = { type: "spring", stiffness: 260, damping: 18, mass: 0.7 } as const;

/**
 * A physical employee-badge hanging from a lanyard, built as a small
 * two-layer spring system rather than a looping float animation:
 *
 * - The outer layer (lanyard + clip + card) swings on `rotateZ`/`x`,
 *   pivoted from the clip like a pendulum on a string.
 * - The card itself carries its own `rotateX`/`rotateY` 3D tilt, so it
 *   can catch the light independently of the swing.
 *
 * Both layers settle from a one-time mount "disturbance" via spring
 * physics — there's no pointer-driven hover tilt, only the drag layer
 * below responds to the mouse.
 *
 * The outermost layer makes the whole thing draggable: it owns its own
 * x/y motion values that Framer's `drag` gesture animates directly, kept
 * on a short elastic tether (`dragConstraints` + `dragElastic`) so
 * tugging the badge stretches the "lanyard" a little and it springs back
 * on release, rather than flying off with the pointer.
 */
export default function IDCard() {
  const reduced = useReducedMotion();

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  // A little lean while actively being dragged, like the lanyard twisting
  // in your hand — separate from the release-swing kick below. Smoothed
  // through a spring so it lags the raw drag position slightly instead of
  // snapping to it.
  const dragTilt = useSpring(useTransform(dragX, [-70, 70], [-10, 10]), {
    stiffness: 280,
    damping: 22,
  });

  const tiltX = useSpring(reduced ? 0 : 4, TILT_SPRING);
  const tiltY = useSpring(reduced ? 0 : -5, TILT_SPRING);
  const swingZ = useSpring(reduced ? 0 : -7, SWING_SPRING);
  const swayX = useSpring(reduced ? 0 : -5, SWAY_SPRING);

  const tiltXOut = useTransform(tiltX, (v) => clamp(v, -TILT_CLAMP, TILT_CLAMP));
  const tiltYOut = useTransform(tiltY, (v) => clamp(v, -TILT_CLAMP, TILT_CLAMP));
  const swingZOut = useTransform(swingZ, (v) => clamp(v, -SWING_CLAMP, SWING_CLAMP));
  const swayXOut = useTransform(swayX, (v) => clamp(v, -SWAY_CLAMP, SWAY_CLAMP));

  // Sheen drifts opposite the tilt, like light catching plastic.
  const sheenX = useTransform(tiltYOut, [-MAX_TILT, MAX_TILT], [-30, 130]);
  const sheenOpacity = useTransform(
    tiltYOut,
    [-MAX_TILT, 0, MAX_TILT],
    [0.22, 0.1, 0.22]
  );

  useEffect(() => {
    if (reduced) return;
    // The badge starts slightly disturbed and settles — not a repeating
    // loop, just the springs relaxing to rest once.
    const t = window.setTimeout(() => {
      tiltX.set(0);
      tiltY.set(0);
      swingZ.set(0);
      swayX.set(0);
    }, 60);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Drag is free-form while it's happening; on release the badge is pulled
  // back to its resting position by a real spring (seeded with however
  // fast it was moving when you let go), and gets a matching little kick
  // of swing/tilt so the return itself feels like part of the same motion
  // rather than a separate snap.
  const handleDragEnd = (_e: PointerEvent, info: PanInfo) => {
    animate(dragX, 0, { ...RETURN_SPRING, velocity: info.velocity.x });
    animate(dragY, 0, { ...RETURN_SPRING, velocity: info.velocity.y });

    // Both are already at rest (0); seeding a return-to-0 animation with a
    // nonzero velocity makes the spring swing out and back on its own —
    // the same trick as above, applied to the pendulum/tilt layer.
    animate(swingZ, 0, { type: "spring", ...SWING_SPRING, velocity: info.velocity.x / 14 });
    animate(swayX, 0, { type: "spring", ...SWAY_SPRING, velocity: info.velocity.x / 4 });
    animate(tiltY, 0, { type: "spring", ...TILT_SPRING, velocity: info.velocity.x / 22 });
  };

  return (
    <div
      className="relative mx-auto"
      style={{
        width: "clamp(220px, 22vw, 300px)",
        perspective: 1400,
      }}
    >
      <motion.div
        drag={!reduced}
        dragConstraints={{ left: -70, right: 70, top: -35, bottom: 55 }}
        dragElastic={0.3}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.04 }}
        style={{
          x: dragX,
          y: dragY,
          rotateZ: dragTilt,
          transformOrigin: "top center",
          cursor: reduced ? undefined : "grab",
        }}
        className="touch-none select-none"
      >
        <motion.div
          style={{
            rotateZ: swingZOut,
            x: swayXOut,
            transformOrigin: "top center",
          }}
        >
        {/* Lanyard — narrow strip climbing out of frame, cut off by the
            hero's own overflow rather than a hard-coded height. */}
        <div
          aria-hidden
          className="absolute left-1/2 -top-[70vh] h-[72vh] w-[14px] -translate-x-1/2 overflow-hidden rounded-b-sm"
          style={{
            background:
              "linear-gradient(180deg, rgba(60,150,175,0.95), rgba(50,85,190,0.92))",
            boxShadow: "0 0 1px rgba(0,0,0,0.4)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 flex flex-col items-center gap-6 pt-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/70"
            style={{ writingMode: "vertical-rl" }}
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i}>Subin Shakya &bull;</span>
            ))}
          </div>
        </div>

        {/* Clip — the physical joint between lanyard and card. */}
        <div
          aria-hidden
          className="relative z-[1] mx-auto h-4 w-8 rounded-[5px]"
          style={{
            background: "linear-gradient(180deg, #e7ebf0, #b9c1cc)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 1px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.35)",
          }}
        />
        <div
          aria-hidden
          className="relative z-[1] mx-auto -mt-1 h-3 w-3 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 30%, #f4f6f8, #9aa3ad)",
            boxShadow: "0 2px 3px rgba(0,0,0,0.4)",
          }}
        />

        {/* Card */}
        <motion.div
          className="relative -mt-1 overflow-hidden rounded-[18px]"
          style={{
            aspectRatio: "0.64",
            rotateX: tiltXOut,
            rotateY: tiltYOut,
            transformStyle: "preserve-3d",
            background:
              "linear-gradient(165deg, #12151c 0%, #0a0c11 55%, #08090d 100%)",
            boxShadow:
              "0 30px 60px -20px rgba(0,0,0,0.75), 0 2px 0 rgba(255,255,255,0.04) inset",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {/* Portrait */}
          <div className="relative h-[58%] w-full overflow-hidden">
            <img
              src={badgePortrait}
              alt={personalInfo.name}
              loading="eager"
              decoding="async"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="h-full w-full select-none object-cover"
              style={{ objectPosition: "center 20%" }}
            />
            {/* Blends the photo's bottom edge into the info panel. */}
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[45%]"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(8,9,13,0.94) 88%)",
              }}
            />
          </div>

          {/* Info panel */}
          <div className="relative flex h-[42%] flex-col items-center justify-center gap-1.5 px-4 text-center">
            <span className="font-display text-[1.05rem] font-medium leading-tight tracking-supertight text-white">
              {personalInfo.name}
            </span>
            <span className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-cyan/85">
              {ROLE}
            </span>
          </div>

          {/* Diagonal plastic sheen — drifts with the tilt. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              opacity: sheenOpacity,
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.5) 46%, transparent 60%)",
              backgroundSize: "220% 100%",
              backgroundPositionX: useTransform(sheenX, (v) => `${v}%`),
              mixBlendMode: "overlay",
            }}
          />

          {/* Top inner edge highlight, like light along a bevel. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[18px]"
            style={{
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          />
        </motion.div>

        {/* Contact shadow, cast onto the page below the badge. */}
        <motion.div
          aria-hidden
          className="mx-auto mt-3 h-4 rounded-[50%]"
          style={{
            width: "70%",
            background:
              "radial-gradient(closest-side, rgba(0,0,0,0.45), transparent 75%)",
            opacity: useTransform(tiltYOut, [-MAX_TILT, 0, MAX_TILT], [0.6, 0.85, 0.6]),
            x: useTransform(swayXOut, (v) => v * 0.6),
          }}
        />
        </motion.div>
      </motion.div>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
