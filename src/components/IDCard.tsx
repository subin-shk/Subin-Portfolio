import { useEffect, type PointerEvent as ReactPointerEvent } from "react";
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
import linkedinQr from "../images/subin-shk-linkedin-qr.png";

/** Degrees/pixels of give per normalized (-1..1) pointer offset. */
const MAX_TILT = 7; // matches GlassCard's default `tilt` prop
const MAX_SWING_DEG = 6;
const MAX_SWING_PX = 9;

/** Hard ceiling on the *rendered* value, independent of the spring math —
 * a defensive clamp so a fast flick or a retargeted-mid-flight spring can
 * never visually fling the badge past a believable swing. */
const SWING_CLAMP = MAX_SWING_DEG + 4;
const TILT_CLAMP = MAX_TILT + 3;
const SWAY_CLAMP = MAX_SWING_PX + 6;

/** Same snappy tuning as GlassCard's own pointer-tilt spring, since this
 * value now drives a matching hover-depth effect. */
const TILT_SPRING = { stiffness: 150, damping: 18, mass: 0.5 };
/** Softer and heavier than a snappy UI spring — more mass, less stiffness,
 * moderately underdamped, so the badge settles over a second or so with a
 * couple of slow, gentle oscillations instead of snapping into place. */
const SWING_SPRING = { stiffness: 20, damping: 7, mass: 1.8 };
const SWAY_SPRING = { stiffness: 26, damping: 8, mass: 1.4 };

/** Snap-back after a drag release: critically damped (no overshoot) and
 * on the soft side, so letting go reads as a smooth glide back to rest
 * rather than a snap — seeded with release velocity so a fast flick still
 * takes proportionally longer to settle. */
const RETURN_SPRING = { type: "spring", stiffness: 110, damping: 22, mass: 1 } as const;

/** First-load drop: the badge starts up near the clip and falls into
 * place. Damped enough not to bounce — a smooth descent, not a boing. */
const DROP_SPRING = { stiffness: 13, damping: 8.5, mass: 2 };
const DROP_START = -160;

/**
 * A physical employee-badge hanging from a lanyard, built as a small
 * multi-layer spring system rather than a looping float animation:
 *
 * - It falls into place on first mount (dropY), then the pendulum layer
 *   (rotateZ/x, pivoted from the clip) settles from a one-time mount
 *   "disturbance".
 * - Hovering the card retargets the *lanyard's* rotateX/rotateY — a 3D
 *   depth tilt toward the pointer, tuned like GlassCard's — while the
 *   card face itself stays flat.
 * - The outermost layer is draggable: it owns its own x/y motion values
 *   that Framer's `drag` gesture animates directly, kept on a short
 *   elastic tether so tugging the badge stretches the "lanyard" a
 *   little and it glides back smoothly on release.
 */
export default function IDCard() {
  const reduced = useReducedMotion();

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  // A lean while actively being dragged, in the same direction as the
  // drag — pull it left and the card cants left, like a real badge on a
  // lanyard being tugged sideways. `transformOrigin` is "top center" on
  // this layer: with y increasing downward, a *positive* (clockwise)
  // rotateZ carries the bottom-anchored point to negative x — i.e. left —
  // so a negative (left) drag needs a *positive* rotateZ to lean left.
  // Smoothed through a spring so it lags the raw drag position slightly
  // instead of snapping to it.
  const dragTilt = useSpring(useTransform(dragX, [-70, 70], [14, -14]), {
    stiffness: 140,
    damping: 22,
    mass: 1.1,
  });

  // Falls in from just above rest on first mount, independent of the drag
  // layer below (dropY is its own translate, stacked on top of dragY
  // rather than combined into it, so dragging never fights this).
  const dropY = useSpring(reduced ? 0 : DROP_START, DROP_SPRING);

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
    // The badge starts slightly disturbed (and dropped) and settles —
    // not a repeating loop, just the springs relaxing to rest once.
    const t = window.setTimeout(() => {
      dropY.set(0);
      tiltX.set(0);
      tiltY.set(0);
      swingZ.set(0);
      swayX.set(0);
    }, 60);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // Drag is free-form while it's happening; on release the badge glides
  // back to its resting position by a real spring (seeded with however
  // fast it was moving when you let go).
  const handleDragEnd = (_e: PointerEvent, info: PanInfo) => {
    // Only the position needs to be driven back to 0 — dragTilt already
    // reacts to dragX live (it's `useTransform(dragX, ...)`), so as this
    // settles the lean settles with it, in exactly one motion. Kicking
    // swingZ/tiltY on top of that used to double up the rotation, which
    // was both an over-shaky release and why the badge could rest at a
    // slight (never-guaranteed-zero) angle.
    animate(dragX, 0, { ...RETURN_SPRING, velocity: info.velocity.x });
    animate(dragY, 0, { ...RETURN_SPRING, velocity: info.velocity.y });
  };

  // 3D hover depth: tilts the *lanyard's* rotateX/rotateY toward wherever
  // the pointer is over the card, independent of the swing/drag layers
  // (those are rotateZ/translate — a different axis, so this never
  // fights them). Detection happens on the card (a practical hit target)
  // but the visible tilt lands on the strap, so the card face stays flat.
  // Mouse only: on touch there's no hover to react to.
  const handleCardHover = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    const ny = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    tiltX.set(-ny * MAX_TILT);
    tiltY.set(nx * MAX_TILT);
  };

  const handleCardLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  return (
    <motion.div
      className="relative mx-auto"
      style={{
        width: "clamp(200px, 17vw, 250px)",
        perspective: 1400,
        y: dropY,
      }}
    >
      <motion.div
        drag={!reduced}
        dragConstraints={{ left: -70, right: 70, top: -35, bottom: 55 }}
        dragElastic={0.3}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
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
          /* Explicitly the positioned ancestor for the lanyard's `absolute`
             below — relying on "a transform also creates a containing
             block" left the centering ambiguous in practice. This makes
             it unambiguous: the lanyard centers against *this* box, which
             is exactly as wide as the card. */
          className="relative"
          style={{
            rotateZ: swingZOut,
            x: swayXOut,
            transformOrigin: "top center",
          }}
        >
          {/* Lanyard — narrow strip climbing out of frame, cut off by the
              hero's own overflow. Carries the 3D hover-depth tilt instead
              of the card, so the strap itself is what visibly cants toward
              the pointer while the card face stays flat.

              Height is a fixed px, not 70vh: a rotateX/rotateY tilt on a
              rectangle that tall visibly kinks partway up (perspective
              foreshortening compounds hard over hundreds of extra px of
              length it never needed — only a short sliver near the clip
              is ever actually on screen). 340px comfortably clears the
              space above the card at every breakpoint without the
              distortion. */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 -top-[340px] h-[340px] w-[14px] overflow-hidden rounded-b-sm"
            style={{
              // Centering has to be a motion value here, not the usual
              // `-translate-x-1/2` Tailwind class: once this element also
              // has rotateX/rotateY as motion values, Framer owns the
              // whole `transform` property on it directly and silently
              // drops any transform contributed by a plain CSS class,
              // which was quietly pushing the strap half its own width
              // off-center.
              x: "-50%",
              rotateX: tiltXOut,
              rotateY: tiltYOut,
              /* This element is a tall 72vh strip, but only its very
                 bottom edge (where it meets the clip) is ever visible.
                 Pivoting on the default center would swing that bottom
                 edge sideways by a lot for even a small tilt — pivoting
                 on the bottom edge instead keeps it glued to the clip and
                 lets only the (offscreen) top sway. */
              transformOrigin: "bottom center",
              background:
                "linear-gradient(180deg, rgba(60,150,175,0.95), rgba(50,85,190,0.92))",
              boxShadow: "0 0 1px rgba(0,0,0,0.4)",
            }}
          >
            <div
              aria-hidden
              /* justify-end (not the default top-start) so the text
                 stack is anchored to the *bottom* of this box — the only
                 part of a 72vh-tall strip that's ever actually on screen
                 is the sliver right above the clip. Anchoring from the
                 top meant every repetition landed somewhere in the
                 offscreen upper 70vh and none ever reached the visible
                 bit near the clip. */
              className="absolute inset-0 flex flex-col items-center justify-end gap-4 pb-[28px] text-[9px] font-semibold uppercase tracking-[0.3em] text-white/70"
            >
              {/* Dense enough (and packed with a small enough gap) that the
                 repeat tiles continuously along the whole strip — with only
                 14 sparser copies, whatever fraction of the 72vh strap
                 happens to be visible on a given screen could easily land
                 in a gap between two repetitions instead of on one.

                 writing-mode lives on each item, not the flex container:
                 vertical-rl on the *container* swaps its own block/inline
                 axes, so flex-col ends up stacking items sideways along
                 the (now-horizontal) block axis instead of down the
                 strap — inside a 14px-wide strip that clips everything
                 but one item. Keeping the container in normal writing
                 mode (so flex-col stacks vertically, as intended) and
                 rotating only each span's own text avoids that.

                 shrink-0 matters too: with 60 items' natural height far
                 exceeding the container's, flexbox's default
                 flex-shrink:1 squeezed every item's box down to a
                 fraction of what its own text needs — the text still
                 rendered at full size and spilled out of that shrunken
                 box into its neighbors, so overlapping fragments from
                 different items painted over each other and only
                 "SHAKYA" ever consistently won. shrink-0 keeps each
                 item's box at its actual content size; whatever then
                 doesn't fit the strip is cleanly cropped by the
                 lanyard's own overflow-hidden instead of being squashed
                 into every other item. */}
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="shrink-0"
                  style={{ writingMode: "vertical-rl" }}
                >
                  Subin Shakya.
                </span>
              ))}
            </div>
          </motion.div>

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

          {/* Card — flat; the pointer-tracked 3D depth tilt lives on the
              lanyard above instead (see handleCardHover). This element
              stays the hover hit-target since the strap itself is too
              narrow to hover reliably. */}
          <motion.div
            onPointerMove={handleCardHover}
            onPointerLeave={handleCardLeave}
            className="relative -mt-3 overflow-hidden rounded-[18px]"
            style={{
              aspectRatio: "0.64",
              background: "linear-gradient(165deg, #adaba4 0%, #918f89 100%)",
              boxShadow:
                "0 30px 60px -20px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.35) inset",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            {/* Portrait */}
            <div className="relative h-[62%] w-full overflow-hidden">
              <img
                src={badgePortrait}
                alt={personalInfo.name}
                loading="eager"
                decoding="async"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="h-full w-full select-none object-cover"
                /* `pointer-events: none` keeps the <img> out of hit-testing
                   entirely, so a pointerdown here is never "on the image" at
                   all — it's on the card behind it, which is what Framer's
                   drag gesture is actually listening to. draggable={false}
                   alone wasn't enough: the browser could still treat the
                   gesture as a native image drag before that ever mattered. */
                style={{
                  objectPosition: "center 20%",
                  pointerEvents: "none",
                  filter: "saturate(0.82) contrast(1.03) brightness(1.02)",
                }}
              />
            </div>

            {/* White info panel with a wavy top edge cut into the photo,
                instead of a straight seam — the panel's own shape carries
                that curve rather than a separate overlay. */}
            <div className="absolute inset-x-0 bottom-0 h-[42%] bg-[#c4c1ba]">
              <svg
                aria-hidden
                viewBox="0 0 100 27"
                preserveAspectRatio="none"
                /* Overlaps 1px into the panel below (bottom-[calc(100%-1px)]
                   instead of bottom-full) so there's no hairline gap between
                   the curve and the flat panel it's sitting on. */
                className="absolute inset-x-0 bottom-[calc(100%-1px)] h-[13%] w-full"
              >
                <path
                  d="M0,27 L0,14 C22,2 38,24 60,12 C74,4 88,10 100,7 L100,27 Z"
                  fill="#c4c1ba"
                />
              </svg>

              <span className="absolute bottom-2 right-4 text-[0.55rem] font-medium tracking-[0.02em] text-[#4a4844]/70">
                ID: SS-0209
              </span>

              <div className="relative flex h-full items-start justify-between gap-3 px-4 pt-1 lg:pt-6">
                <div className="flex flex-col items-start gap-1.5 text-left">
                  <span className="font-display text-[1.15rem] font-semibold leading-tight tracking-supertight text-[#1c1c1c]">
                    {personalInfo.name}
                  </span>
                  <span className="h-px w-10 bg-[#4a4844]/30" />
                  <span className="flex flex-col items-start gap-0.5 text-[0.68rem] font-semibold italic leading-tight tracking-[0.02em] text-[#4a4844] lg:gap-1 lg:leading-snug">
                    <span>Software</span>
                    <span>Quality Assurance</span>
                  </span>
                </div>

                {/* LinkedIn QR — a small light card behind it so the code
                    keeps enough contrast against the panel's own tone.
                    Double-click (not single, which the card's own drag
                    gesture already owns) opens the profile directly, for
                    anyone reading this on a screen rather than scanning it
                    with a phone. Sized down a touch on mobile/tablet to
                    fit the tighter panel, but not so far it stops actually
                    being scannable. */}
                <span
                  role="button"
                  tabIndex={0}
                  title="Double-click to open LinkedIn"
                  onDoubleClick={() =>
                    window.open(
                      "https://www.linkedin.com/in/subin-shk/",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      window.open(
                        "https://www.linkedin.com/in/subin-shk/",
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }
                  }}
                  className="shrink-0 cursor-pointer self-center rounded-md bg-[#ece9e2] p-1 shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
                >
                  <img
                    src={linkedinQr}
                    alt="QR code linking to Subin Shakya's LinkedIn profile — double-click to open"
                    draggable={false}
                    className="h-16 w-16 rounded-[3px] select-none lg:h-[4.75rem] lg:w-[4.75rem]"
                    style={{ pointerEvents: "none" }}
                  />
                </span>
              </div>
            </div>

            {/* Diagonal plastic sheen — drifts with the tilt. */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: sheenOpacity,
                background:
                  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 46%, transparent 60%)",
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
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
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
    </motion.div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}
