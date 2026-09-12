import { useRef } from "react";
import type { ComponentProps, ComponentType } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Cloud,
  Cog,
  Gauge,
  Github,
  Linkedin,
  MapPin,
  MousePointer2,
} from "lucide-react";
import { narrative, personalInfo } from "../data/portfolioData";
import { useReducedMotion } from "../lib/motion";
import { Rise } from "./ui/Reveal";
import { Swash, Tape } from "./ui/AboutDoodles";
import portrait from "../images/subin_shk.webp";
import skyline from "../images/kathmandu-nepal.png";
import aside from "../images/qualityisfeature.png";
import scrap from "../images/bettertestsbetterproducts.png";

/**
 * The section's reveal: the page's rise, minus its blur-in.
 *
 * Everything here is photographic — a print, a torn scrap, ink on paper — and
 * softening a photograph as it enters reads as the image still loading rather
 * than as focus resolving, which is what the blur buys on type.
 */
function Beat(props: ComponentProps<typeof Rise>) {
  return <Rise blur={0} {...props} />;
}

const about = narrative.about;

/* Loose enough to cover both a lucide icon and the hand-rolled WordPress
   mark, which only takes a className. */
type IconProps = {
  size?: string | number;
  strokeWidth?: string | number;
  className?: string;
};

/** Keyed off `disciplines[].icon`, so the data file stays free of JSX. */
const ICONS: Record<string, ComponentType<IconProps>> = {
  automation: Cog,
  manual: MousePointer2,
  api: Cloud,
  performance: Gauge,
};

/**
 * About, as a corkboard.
 *
 * The rest of the page is glass drifting over a gradient; this one movement
 * is deliberately physical — a taped polaroid, a sticky note printing a
 * manifest, two asides in marker pen. The tilts are fixed rather than random
 * so the composition is identical every load, and everything decorative is
 * `aria-hidden`, leaving a plain heading → copy → links reading order
 * underneath it.
 *
 * It does not use `.shell`. The composition needs the terminal card out at
 * the right margin, clear of a name that is already ~30rem wide, and 78rem
 * isn't enough to hold both without them colliding.
 */
export default function About() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Each pinned item drifts at its own rate, so the pile separates on scroll.
  const photoY = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const scrapY = useTransform(scrollYProgress, [0, 1], ["14%", "-14%"]);

  return (
    <section
      id="about"
      ref={ref}
      /* The collage's tilted cards reach past the gutter; `clip` cuts them at
         the section edge without becoming a scroll container, so the vertical
         parallax bleed is untouched. */
      className="relative overflow-x-clip py-[clamp(4rem,8vh,6rem)] lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center lg:pb-[clamp(5.25rem,8vh,6.5rem)] lg:pt-[clamp(1.75rem,4.5vh,3.5rem)]"
    >
      {/* Graph paper, faded out well before the edges. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.026) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.026) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage:
            "radial-gradient(115% 75% at 45% 42%, #000 20%, transparent 76%)",
          maskImage:
            "radial-gradient(115% 75% at 45% 42%, #000 20%, transparent 76%)",
        }}
      />

      {/* Everest in the bottom corner — the one piece of the section that is
          purely place rather than practice. The asset is dark ink on
          transparent, drawn for paper, so it is inverted to sit on a near-black
          page; alpha survives `invert()`, only the ink flips. */}
      <img
        src={skyline}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        width={659}
        height={308}
        className="pointer-events-none absolute bottom-[clamp(1.5rem,4vh,3rem)] right-0 w-[min(32rem,46%)] select-none opacity-[0.16] invert"
      />

      <div className="relative mx-auto w-full max-w-[96rem] px-[var(--gutter)]">
        <Beat>
          <p className="eyebrow flex items-center gap-3 md:pl-[4.25rem]">
            <span className="text-white/20">//</span>
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-violet shadow-[0_0_9px_rgba(155,123,255,0.9)]"
            />
            About me
          </p>
        </Beat>

        <div className="mt-8 grid items-center gap-x-[4vw] gap-y-[clamp(2.5rem,6vh,4rem)] lg:mt-[clamp(1rem,2.8vh,2.5rem)] lg:grid-cols-12">
          {/* ——— The pinned-up pile ———
              The polaroid is the only item in flow, so it sets the pile's
              height; the torn note hangs off it. The wrapper's left padding is
              what reserves the overlap that note tucks into. */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[min(34rem,60vh)] pl-[11%]">
              {/* Polaroid */}
              <motion.figure
                style={reduced ? undefined : { y: photoY }}
                className="relative z-10 -rotate-[2.2deg] rounded-[3px] bg-[#f4f2ee] p-[4.5%] pb-[5.5%] shadow-[0_30px_66px_-30px_rgba(0,0,0,0.95)] gpu"
              >
                <Tape className="absolute -left-3 -top-2 -rotate-[28deg]" />
                <Tape className="absolute -right-3 -top-2 rotate-[26deg]" />
                <img
                  src={portrait}
                  alt="Subin Shakya"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={800}
                  className="aspect-[4/5] w-full object-cover object-top"
                  style={{
                    filter: "saturate(0.8) contrast(1.06) brightness(0.86)",
                  }}
                />
              </motion.figure>

              {/* Torn note, pinned over the polaroid's left edge */}
              <motion.div
                aria-hidden
                style={reduced ? undefined : { y: scrapY }}
                /* Sits on the polaroid's bottom-left corner. Width and offset
                   are both percentages of the pile, so the note keeps the same
                   overlap over the print at every width. `bottom` clears the
                   caption's line, landing it level with the print's lower edge
                   rather than the pile's. */
                className="absolute bottom-[2.9rem] left-[-8%] z-20 w-[42%] gpu"
              >
                <img
                  src={scrap}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={1358}
                  height={1159}
                  className="w-full select-none"
                  /* Two drop-shadows rather than one: a tight contact shadow
                     that pins the note to the print, and a soft ambient one
                     that lifts the whole scrap off it. `drop-shadow` follows
                     the torn alpha edge, which a box-shadow could not. */
                  style={{
                    filter:
                      "drop-shadow(0 2px 4px rgba(0,0,0,0.55)) drop-shadow(0 18px 30px rgba(0,0,0,0.8))",
                  }}
                />
              </motion.div>

              {/* Caption, written on the board rather than on the print */}
              <p
                className="mt-5 flex items-center justify-center gap-1.5 font-hand text-[clamp(1rem,1.5vw,1.35rem)] leading-none text-white/70"
              >
                <MapPin
                  size={15}
                  strokeWidth={1.6}
                  aria-hidden
                  className="text-white/45"
                />
                {personalInfo.location}
              </p>
            </div>
          </div>

          {/* ——— The copy ——— */}
          <div className="relative lg:col-span-7">
            {/* Marker aside.

                Pinned to the column's top-right corner rather than set beside
                the name, so it stays out past the 44ch measure the copy is
                held to — the drawing's arrow sweeps down-left through the
                margin the paragraphs never reach. Absolute, so none of it
                costs the copy any width. It sits out below md, where the
                column is too narrow to have a margin to sit in. */}
            <Beat
              delay={0.3}
              className="pointer-events-none absolute right-0 top-0 z-10 hidden w-[12rem] md:block xl:w-[13.5rem]"
            >
              <img
                src={aside}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                width={225}
                height={205}
                className="w-full select-none opacity-90"
              />
            </Beat>

            <div>
              <div className="min-w-0">
                <Beat>
                  <p className="font-mono text-[0.8rem] uppercase tracking-[0.28em] text-violet">
                    {about.greeting}
                  </p>
                </Beat>

                <Beat delay={0.08}>
                  <div className="relative inline-block">
                    <h2 className="mt-2.5 font-display text-[clamp(2.2rem,min(5.4vw,8.6vh),4.4rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
                      {personalInfo.name}
                    </h2>
                    <Swash className="absolute -bottom-1 left-[7%] h-3 w-[72%] text-blue" />
                  </div>
                </Beat>

                <Beat delay={0.16}>
                  <p className="mt-[clamp(0.85rem,2.2vh,1.35rem)] font-mono text-[clamp(0.95rem,min(1.66vw,2.6vh),1.3rem)] tracking-[-0.01em] text-white/80">
                    {personalInfo.title}
                    <span
                      aria-hidden
                      className="ml-2 inline-block text-violet"
                      style={{ animation: "caret 1.1s steps(1) infinite" }}
                    >
                      _
                    </span>
                  </p>
                </Beat>
              </div>
            </div>

            <div className="mt-[clamp(1.1rem,3vh,2.1rem)] max-w-[44ch] space-y-[clamp(0.6rem,1.8vh,1.1rem)]">
              {about.body.map((para, i) => (
                <Beat key={i} delay={0.12 + i * 0.1}>
                  <p
                    className="lede !text-[clamp(0.92rem,min(1.08vw,1.95vh),1.06rem)] [&_strong]:font-medium [&_strong]:text-white/90"
                    dangerouslySetInnerHTML={{ __html: para }}
                  />
                </Beat>
              ))}
            </div>

            {/* What the work actually is, one chip per layer */}
            <Beat delay={0.22}>
              <ul className="mt-[clamp(1rem,2.6vh,1.9rem)] flex flex-wrap gap-2">
                {about.disciplines.map(({ label, icon }) => {
                  const Icon = ICONS[icon];
                  return (
                    <li
                      key={label}
                      className="glass edge flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.78rem] text-white/78"
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.6}
                        className="h-4 w-4 shrink-0 text-white/55"
                      />
                      {label}
                    </li>
                  );
                })}
              </ul>
            </Beat>

            <Beat delay={0.3}>
              <div className="rule mt-[clamp(1rem,2.6vh,2.1rem)]" />
            </Beat>

            <Beat delay={0.36}>
              <dl className="mt-[clamp(1rem,2.6vh,1.75rem)] grid grid-cols-2 gap-y-7 sm:grid-cols-3">
                {about.stats.map(({ value, label }, i) => (
                  <div
                    key={label}
                    className={[
                      "pr-5",
                      i % 2 === 1 ? "border-l border-white/10 pl-5" : "",
                      i === 0 ? "" : "sm:border-l sm:border-white/10 sm:pl-7",
                    ].join(" ")}
                  >
                    <dt className="sr-only">{label}</dt>
                    <dd>
                      <span className="block font-mono text-[clamp(1.25rem,min(1.95vw,3.2vh),1.8rem)] font-medium leading-none text-white">
                        {value}
                      </span>
                      <span className="mt-2.5 block font-mono text-[0.7rem] leading-tight text-white/50">
                        {label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Beat>

            <Beat delay={0.44}>
              <div className="mt-[clamp(1.15rem,3vh,2.4rem)] flex flex-wrap items-center gap-4">
                {[
                  {
                    href: personalInfo.socialLinks.linkedin,
                    label: "LinkedIn",
                    Icon: Linkedin,
                  },
                  {
                    href: personalInfo.socialLinks.github,
                    label: "GitHub",
                    Icon: Github,
                  },
                ].map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${personalInfo.name} on ${label}`}
                    className="glass edge flex h-[3.1rem] w-[3.1rem] items-center justify-center rounded-full text-white/66 transition-colors duration-300 ease-glass hover:text-white"
                  >
                    <Icon size={18} strokeWidth={1.7} aria-hidden />
                  </a>
                ))}
              </div>
            </Beat>
          </div>
        </div>

        {/* The section signing off in its own margin */}
        <Beat delay={0.1}>
          <div className="mt-[clamp(1.25rem,3.2vh,2.75rem)] flex flex-wrap items-center gap-x-4 gap-y-3">
            <p className="eyebrow shrink-0">{about.footline.join(" / ")}</p>
            <div className="rule hidden w-[clamp(6rem,14vw,13rem)] sm:block" />
          </div>
        </Beat>
      </div>
    </section>
  );
}
