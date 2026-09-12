import type { CSSProperties } from "react";
import { personalInfo } from "../data/portfolioData";

/**
 * The lower strap names the disciplines, phrased as a lanyard print rather
 * than a list — longer clauses, run together.
 */
const DISCIPLINES = [
  "API Testing",
  "Performance Testing",
  "Web and Mobile Automation",
  "Web Scraping",
];

/**
 * One printed band. The rotation sits on the band and the scroll on the
 * track inside it, so each frame animates a plain translate on an already
 * composited layer instead of re-resolving a rotated transform.
 */
function Strap({
  items,
  tone,
  duration,
  direction,
  placement,
  height,
  repeats,
}: {
  items: string[];
  tone: "light" | "dark";
  duration: number;
  direction: "left" | "right";
  /** Absolute placement and rotation for the band as a whole. */
  placement: string;
  height: string;
  /**
   * How many times the item set is printed per copy. One copy has to be
   * wider than the band that clips it or the -50% loop point opens a
   * visible gap, so this scales inversely with how long the items are.
   */
  repeats: number;
}) {
  const row = Array.from({ length: repeats }, () => items).flat();
  const light = tone === "light";

  const surface: CSSProperties = light
    ? {
        background:
          "linear-gradient(180deg, #ffffff 0%, #f1f2f5 58%, #d6d9df 100%)",
        boxShadow: "0 20px 44px -20px rgba(0,0,0,0.9)",
      }
    : {
        background:
          "linear-gradient(180deg, #262a32 0%, #171a20 58%, #0e1014 100%)",
        boxShadow: "0 20px 44px -22px rgba(0,0,0,0.95)",
      };

  return (
    <div
      className={`absolute w-[200vmax] overflow-hidden ${height} ${placement}`}
      style={surface}
    >
      {/* Rendered twice back to back and slid exactly -50%, so the loop
          seams onto its own identical copy. */}
      <div
        className="flex h-full w-max items-center"
        style={{
          animation: `marquee-${direction} ${duration}s linear infinite`,
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex w-max shrink-0 items-center">
            {row.map((label, i) => (
              <span key={`${copy}-${i}`} className="flex shrink-0 items-center">
                <span className="mx-5 h-[0.38rem] w-[0.38rem] shrink-0 rounded-full bg-ember sm:mx-7" />
                <span
                  className={`whitespace-nowrap font-display text-[0.66rem] font-medium uppercase tracking-[0.17em] sm:text-[0.78rem] ${
                    light ? "text-[#0b0d12]" : "text-white/78"
                  }`}
                >
                  {label}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Two lanyard straps crossing the hero behind the badge. Decorative only —
 * everything they say is already in the heading and the focus ticker, so
 * the whole layer is hidden from assistive tech and inert to the pointer
 * (the badge below it is draggable).
 */
export default function HeroStraps() {
  return (
    <div
      aria-hidden
      /* Under the hero's own content (z-[2]) so both bands pass behind the
         badge, over the fixed atmosphere layer. Held well back — these are
         backdrop, not a third column of content — and dropped entirely on
         phones, where a centred single column leaves a diagonal band
         nowhere to cross that isn't a line of type. */
      className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden opacity-35 md:block"
    >
      <Strap
        items={[personalInfo.name, personalInfo.title]}
        tone="light"
        duration={95}
        direction="left"
        repeats={20}
        height="h-[2.15rem] sm:h-[2.6rem]"
        /* Kept up in the corner the heading never reaches: it enters at the
           top edge right of the name and dives behind the badge, which is
           the only place a 46-degree band can cross without cutting through
           a line of type. */
        placement="left-[72%] top-[14%] -translate-x-1/2 -translate-y-1/2 rotate-[46deg]"
      />
      <Strap
        items={DISCIPLINES}
        tone="dark"
        duration={120}
        direction="right"
        repeats={10}
        height="h-[2.4rem] sm:h-[2.9rem]"
        /* Below the buttons, and shallow enough that the descending end
           still clears the left edge before it reaches the hero's floor —
           steeper angles get cut mid-screen by the section's overflow. */
        placement="left-[50%] top-[74%] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg]"
      />
    </div>
  );
}
