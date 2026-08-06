import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { personalInfo } from "../data/portfolioData";
import { EASE, useAnimatedBlur, useReducedMotion, useRise } from "../lib/motion";
import { scrollTo } from "../lib/useSmoothScroll";
import GlassButton from "./ui/GlassButton";
import { useKeyedImage } from "../lib/keyBackground";
import heroPortrait from "../images/subin-shk-hero.jpg";

const NAME = personalInfo.name.toUpperCase();

/**
 * Opening screen.
 *
 * The portrait is a cutout on black, so `screen` blending drops its
 * background out against the near-black page and the figure composites
 * straight into the gradient mesh. A soft mask dissolves its lower edge
 * into the wordmark below, so the two read as one object rather than a
 * photo stacked on a heading.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const blurs = useAnimatedBlur();
  const { src: keyed, ready: keyReady } = useKeyedImage(heroPortrait);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.78], [1, 0]);
  // Held sharp until the hero is already half faded — blurring text that is
  // still legible just makes it unreadable rather than cinematic.
  const filter = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0, 14], {
    clamp: true,
  });
  const blurCss = useTransform(filter, (b) => `blur(${b}px)`);
  const rise = useRise(14, 7);

  const chars = NAME.split("");
  const step = 0.045;
  const nameDone = 0.9 + chars.length * step * 0.35;

  return (
    <section
      id="home"
      ref={ref}
      /* Bottom padding clears the floating dock at every viewport height. */
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pb-[8.5rem] pt-20"
    >
      <motion.div
        style={
          reduced
            ? undefined
            : {
                scale,
                y,
                opacity,
                ...(blurs ? { filter: blurCss } : null),
                transformOrigin: "center 35%",
              }
        }
        className="shell relative z-[2] flex w-full flex-col items-center text-center gpu"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          className="glass edge relative inline-flex items-center gap-2.5 rounded-full px-4 py-2"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="absolute inline-flex h-full w-full rounded-full bg-cyan opacity-70"
              style={{ animation: "ripple-out 2.6s ease-out infinite" }}
            />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
          </span>
          <span className="eyebrow !tracking-[0.28em] !text-white/55">
            {personalInfo.location}
          </span>
        </motion.div>

        <motion.div
          initial={
            reduced
              ? { opacity: 0 }
              : blurs
                ? { opacity: 0, scale: 1.06, filter: "blur(24px)" }
                : { opacity: 0, scale: 1.06 }
          }
          animate={
            blurs
              ? { opacity: 1, scale: 1, filter: "blur(0px)" }
              : { opacity: 1, scale: 1 }
          }
          transition={{ duration: 1.8, ease: EASE, delay: 0.25 }}
          className="pointer-events-none relative -mb-[6vh] w-full sm:-mb-[7vh]"
        >
          <div className="relative mx-auto h-[clamp(20rem,50vh,34rem)] w-full max-w-[38rem]">
            {/* Rim light behind the figure. Static — a pulsing halo behind a
                portrait reads as a gimmick, not as lighting. */}
            <div
              aria-hidden
              className="absolute left-1/2 top-[16%] h-[62%] w-[62%] -translate-x-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(120,170,255,0.30), rgba(155,123,255,0.10) 48%, transparent 72%)",
                filter: "blur(46px)",
              }}
            />

            {/* Real alpha, so the gradient mesh shows right up to the
                silhouette. A bottom fade dissolves the figure into the
                wordmark below. */}
            <motion.img
              src={keyed}
              alt=""
              aria-hidden="true"
              width={1213}
              height={1440}
              fetchPriority="high"
              decoding="async"
              initial={false}
              animate={{ opacity: keyReady ? 1 : 0 }}
              transition={{ duration: 1.1, ease: EASE }}
              className="relative h-full w-full object-contain object-bottom"
              style={{
                filter:
                  "saturate(0.88) contrast(1.05) brightness(1.02) drop-shadow(0 14px 30px rgba(0,0,0,0.8))",
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 62%, transparent 97%)",
                maskImage:
                  "linear-gradient(to bottom, #000 62%, transparent 97%)",
              }}
            />
          </div>
        </motion.div>

        <h1
          className="relative z-[3] whitespace-nowrap font-display font-medium uppercase leading-[0.9] text-white"
          /* Capped so the name always sits on one line: the shell stops
             growing at 78rem, so an uncapped vw size overflows on wide
             screens and wraps mid-word. */
          style={{
            fontSize: "clamp(1.85rem, 9.5vw, 7.5rem)",
            letterSpacing: "-0.05em",
          }}
        >
          <span className="sr-only">{personalInfo.name}</span>
          <span aria-hidden="true" className="flex flex-nowrap justify-center">
            {chars.map((ch, i) =>
              ch === " " ? (
                <span key={i} className="w-[0.26em]" />
              ) : (
                <span
                  key={i}
                  className="inline-block overflow-hidden pb-[0.06em]"
                >
                  <motion.span
                    className="inline-block"
                    initial={
                      reduced
                        ? { opacity: 0 }
                        : blurs
                          ? { y: "110%", opacity: 0, filter: "blur(16px)" }
                          : { y: "110%", opacity: 0 }
                    }
                    animate={
                      blurs
                        ? { y: 0, opacity: 1, filter: "blur(0px)" }
                        : { y: 0, opacity: 1 }
                    }
                    transition={{
                      duration: reduced ? 0.3 : 1.25,
                      ease: EASE,
                      delay: reduced ? 0 : 0.55 + i * step,
                    }}
                  >
                    {ch}
                  </motion.span>
                </span>
              )
            )}
          </span>
        </h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: EASE, delay: nameDone }}
          className="rule my-5 w-full max-w-[28rem] sm:my-6"
        />

        <motion.p
          initial={rise.initial}
          animate={rise.animate}
          transition={{ duration: 1, ease: EASE, delay: nameDone + 0.08 }}
          className="font-display text-[clamp(1.05rem,2.4vw,1.7rem)] font-light tracking-supertight text-white/80"
        >
          {personalInfo.title}
        </motion.p>

        <motion.p
          initial={rise.initial}
          animate={rise.animate}
          transition={{ duration: 1, ease: EASE, delay: nameDone + 0.2 }}
          className="lede mt-4 max-w-[33rem] text-balance !text-[clamp(0.95rem,1.4vw,1.2rem)]"
        >
          {personalInfo.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: nameDone + 0.34 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <GlassButton
            variant="solid"
            onClick={() => scrollTo("#projects")}
            icon={<ArrowDownRight size={16} strokeWidth={1.8} />}
          >
            View My Work
          </GlassButton>
          {/* Falls back to a mailto until a real CV is dropped in public/ —
              a download button that 404s is worse than one that asks. */}
          {personalInfo.hasResume ? (
            <GlassButton
              variant="glass"
              href={personalInfo.resume}
              download="Subin-Shakya-Resume.pdf"
              icon={<Download size={15} strokeWidth={1.8} />}
            >
              Download Resume
            </GlassButton>
          ) : (
            <GlassButton
              variant="glass"
              href={`mailto:${personalInfo.email}?subject=${encodeURIComponent(
                "Resume request"
              )}`}
              icon={<Download size={15} strokeWidth={1.8} />}
            >
              Request Resume
            </GlassButton>
          )}
          <GlassButton
            variant="quiet"
            onClick={() => scrollTo("#contact")}
            icon={<ArrowUpRight size={15} strokeWidth={1.8} />}
          >
            Get In Touch
          </GlassButton>
        </motion.div>
      </motion.div>

      <motion.button
        type="button"
        onClick={() => scrollTo("#about")}
        aria-label="Scroll to continue"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: nameDone + 0.8 }}
        style={reduced ? undefined : { opacity }}
        /* Bottom-left, not centre — the dock owns the centre. */
        className="absolute bottom-8 left-[max(1.25rem,var(--gutter))] z-[2] hidden flex-col items-center gap-2.5 lg:flex"
      >
        <span
          className="eyebrow !text-[0.55rem] !tracking-[0.45em]"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/10">
          <motion.span
            className="absolute inset-x-0 h-4 bg-gradient-to-b from-transparent via-cyan to-transparent"
            animate={reduced ? {} : { y: ["-100%", "280%"] }}
            transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
          />
        </span>
      </motion.button>
    </section>
  );
}
