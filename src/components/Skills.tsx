import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Cloud, Cog, Gauge, Globe, SquareCode, Wrench } from "lucide-react";
import { narrative, skillGroups } from "../data/portfolioData";
import type { Accent, SkillGroup, SkillItem } from "../types";
import { EASE, inView, useReducedMotion } from "../lib/motion";
import { Rise } from "./ui/Reveal";
import { Tape } from "./ui/AboutDoodles";
import { DRAWN, DRAWN_TINT, MARKS } from "./ui/SkillLogos";
import scrap from "../images/goodtoolsgreatproduct.png";

/** Ink glyph per group — keyed off `SkillGroup.id`. */
const ICONS: Record<string, typeof Cog> = {
  automation: Cog,
  api: Cloud,
  programming: SquareCode,
  performance: Gauge,
  web: Globe,
  tools: Wrench,
};

/**
 * Highlighter ink per group, as an rgb triplet the marker's gradient
 * interpolates. Cyan is pulled down from the page's `#5fd4e8`: at full
 * brightness it disappears into cream, and a highlighter that leaves no
 * mark is worse than none.
 */
const ACCENT: Record<Accent, string> = {
  blue: "77,124,255",
  cyan: "58,168,190",
  violet: "155,123,255",
};

/**
 * One tool: its own mark over its own name.
 *
 * Nothing is held back for hover. A logo wall is read by scanning, and a
 * qualifier that only exists on hover is a qualifier most visitors never
 * see — so the cell says everything it has to say standing still, and hover
 * only lifts it off the card.
 */
function Tool({ item }: { item: SkillItem }) {
  const reduced = useReducedMotion();

  const mark = MARKS[item.logo];
  const Glyph = DRAWN[item.logo];
  const glyphTint = DRAWN_TINT[item.logo];

  return (
    <motion.li
      variants={{
        hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
      }}
      whileHover={reduced ? undefined : { y: -3 }}
      transition={{ duration: 0.35, ease: EASE }}
      data-orb="touch"
      /* Fixed cell width, not a flexed one: a two-tool card would stretch
         its pair across the whole tray, and the cards only read as one kit
         if every mark sits on the same grid. Wide enough for the longest
         single-word name on the sheet. */
      className="flex w-[4.4rem] flex-col items-center gap-2 gpu"
    >
      {/* Fixed box rather than an auto width: preflight gives every img
          `height:auto`, and an auto-sized mark inside a shrink-to-fit cell
          resolves its max-width against a column that is still waiting on
          the mark — which collapses it to nothing. The box is wider than it
          is tall so the two wordmark logos get their horizontal room. */}
      <span className="flex h-[2.2rem] items-center justify-center">
        {mark ? (
          <img
            src={mark}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            width={34}
            height={34}
            className="h-[2.05rem] w-[2.5rem] select-none object-contain"
          />
        ) : Glyph ? (
          <Glyph
            size={29}
            strokeWidth={1.6}
            className="text-[color:var(--paper-ink-soft)]"
            style={glyphTint ? { color: glyphTint } : undefined}
          />
        ) : null}
      </span>

      <span className="text-center text-[0.63rem] font-semibold leading-[1.24] tracking-[-0.005em] text-[color:var(--paper-ink)]">
        {item.name}
      </span>
    </motion.li>
  );
}

/** One group, as a card ruled off on the sheet. */
function Group({ group }: { group: SkillGroup }) {
  const reduced = useReducedMotion();
  const tint = ACCENT[group.accent];
  const Icon = ICONS[group.id] ?? Cog;

  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={inView}
      transition={{ staggerChildren: 0.045, delayChildren: 0.1 }}
      className="rounded-[15px] px-3.5 pb-3.5 pt-3"
      style={{
        background: "rgba(255,255,255,0.24)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.7), 0 0 0 1px var(--paper-edge)",
      }}
    >
      <header className="flex items-start gap-2.5">
        <Icon
          size={17}
          strokeWidth={1.7}
          aria-hidden
          className="mt-[0.15rem] shrink-0 text-[color:var(--paper-ink-soft)]"
        />

        <h3 className="relative isolate font-display text-[0.98rem] font-semibold tracking-[-0.025em] text-[color:var(--paper-ink)]">
          {/* Swept on rather than faded in: a highlighter is drawn left to
              right, and the stroke only reads as hand-made if it travels. */}
          <motion.span
            aria-hidden
            className="marker"
            style={{ "--mk": tint, originX: 0 } as React.CSSProperties}
            variants={{
              hidden: reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0.9 },
              show: {
                scaleX: 1,
                opacity: 1,
                transition: { duration: 0.6, ease: EASE, delay: 0.1 },
              },
            }}
          />
          {group.label}
        </h3>

        {/* Margin note, in the hand the scraps are written in. */}
        <p
          aria-hidden
          className="ml-auto max-w-[6.5rem] shrink-0 -rotate-[2.5deg] pl-2 pt-px text-right font-hand text-[0.95rem] leading-[1.1] text-[color:var(--paper-ink-faint)]"
        >
          {group.aside}
        </p>
      </header>

      {/* Inner tray. The tools sit in their own ruled box rather than loose
          on the card, which is what keeps a two- and a five-tool group
          reading as the same kind of thing. */}
      <ul
        className="mt-3 flex flex-wrap justify-center gap-x-1.5 gap-y-4 rounded-[12px] px-2.5 py-4 sm:justify-start"
        style={{
          background: "rgba(255,255,255,0.34)",
          boxShadow: "0 0 0 1px var(--paper-edge)",
        }}
      >
        {group.items.map((item) => (
          <Tool key={item.name} item={item} />
        ))}
      </ul>
    </motion.section>
  );
}

/**
 * Skills, as the bench sheet.
 *
 * The page is a dark board with physical things pinned to it — the polaroid
 * in About, this sheet here. Everything the section knows is written on one
 * piece of taped-down graph paper: six cards, each headed in highlighter,
 * annotated in the margin, and filled with the tools' own marks, so the
 * stack is legible at a glance rather than read word by word.
 *
 * The tilts are fixed rather than random, so the composition is identical
 * every load.
 */
export default function Skills() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // The scrap drifts against the sheet, so the two separate on scroll.
  const scrapY = useTransform(scrollYProgress, [0, 1], ["16%", "-16%"]);

  return (
    <section
      id="skills"
      ref={ref}
      /* The sheet's tilt and its tape reach past the gutter; `clip` cuts
         them at the section edge without becoming a scroll container. */
      className="relative overflow-x-clip py-[clamp(6rem,14vh,10rem)]"
    >
      {/* Warm bloom under the sheet. Cream dropped straight onto near-black
          reads as a pasted rectangle; a little spill of its own light makes
          the board look lit by the same lamp. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[18%] h-[70%]"
        style={{
          background:
            "radial-gradient(58% 46% at 68% 48%, rgba(239,233,221,0.085), transparent 70%)",
        }}
      />

      {/* Not `.shell`. Like About, this composition needs more than 78rem:
          the beat wants a column it can break into three lines, and the
          sheet wants a card wide enough to hold four marks in a row. */}
      <div className="relative mx-auto w-full max-w-[96rem] px-[var(--gutter)]">
        <div className="grid gap-x-10 gap-y-[clamp(2.5rem,6vh,4rem)] lg:grid-cols-12 lg:items-start">
          {/* ——— The board side ——— */}
          <div className="lg:col-span-4">
            <Rise>
              <p className="eyebrow flex items-center gap-3">
                <span className="text-white/20">//</span>
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_9px_rgba(95,212,232,0.9)]"
                />
                Skills
              </p>
            </Rise>

            <Rise delay={0.1}>
              <h2
                className="beat mt-7"
                dangerouslySetInnerHTML={{ __html: narrative.skills.beat }}
              />
            </Rise>

            <Rise delay={0.18}>
              <p className="lede mt-6 max-w-[32ch]">{narrative.skills.body}</p>
            </Rise>

            {/* The scrap, pinned under the copy. It is a photograph of ink on
                torn paper, so it carries its own shadow rather than a panel —
                and it enters without the page's blur, which on a photograph
                reads as still loading rather than as focus resolving. */}
            <Rise delay={0.26} blur={0}>
              <motion.div
                aria-hidden
                style={reduced ? undefined : { y: scrapY }}
                className="mt-[clamp(2rem,5vh,3.25rem)] w-[min(20rem,78%)] -rotate-[3deg] gpu lg:w-full"
              >
                <img
                  src={scrap}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={1530}
                  height={1013}
                  className="w-full select-none"
                  style={{
                    filter:
                      "drop-shadow(0 2px 4px rgba(0,0,0,0.55)) drop-shadow(0 18px 30px rgba(0,0,0,0.8))",
                  }}
                />
              </motion.div>
            </Rise>
          </div>

          {/* ——— The sheet ——— */}
          <div className="lg:col-span-8">
            <Rise blur={0} y={38} duration={0.95}>
              <div className="relative -rotate-[0.55deg] gpu">
                <Tape className="absolute -left-4 -top-3 z-10 -rotate-[24deg]" />
                <Tape className="absolute -right-4 -top-3 z-10 rotate-[22deg]" />

                <div className="paper paper-rule relative overflow-hidden rounded-[5px] px-[clamp(0.9rem,2.6vw,1.9rem)] py-[clamp(1.3rem,3vw,1.9rem)]">
                  {/* Paper tooth. Far lower than the page default — the stock
                      is already warm, and full-strength grain on cream reads
                      as noise rather than fibre. */}
                  <div aria-hidden className="grain !opacity-[0.14]" />

                  <div className="relative">
                    <div className="flex items-baseline justify-between gap-4 px-1">
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.34em] text-[color:var(--paper-ink-faint)]">
                        Bench kit
                      </p>
                      <p className="font-mono text-[0.62rem] tracking-[0.18em] text-[color:var(--paper-ink-faint)]">
                        {skillGroups.reduce((n, g) => n + g.items.length, 0)}{" "}
                        tools
                      </p>
                    </div>

                    {/* Two columns only once a card can hold four marks in a
                        row; below that the cards run full width instead of
                        squeezing the tools into two per line. */}
                    <div className="mt-3.5 grid gap-3 lg:grid-cols-2">
                      {skillGroups.map((group) => (
                        <Group key={group.id} group={group} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Rise>
          </div>
        </div>
      </div>
    </section>
  );
}
