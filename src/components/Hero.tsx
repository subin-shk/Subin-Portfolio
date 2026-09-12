import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Download } from "lucide-react";
import { personalInfo } from "../data/portfolioData";
import { EASE, useAnimatedBlur, useReducedMotion, useRise } from "../lib/motion";
import { scrollTo } from "../lib/useSmoothScroll";
import GlassButton from "./ui/GlassButton";
import HeroStraps from "./HeroStraps";
import IDCard from "./IDCard";

const NAME = personalInfo.name.toUpperCase();

/**
 * Opening screen. The portrait used to be a cutout composited into the
 * gradient mesh; it's now a physical ID badge hanging from a lanyard —
 * see IDCard.tsx for the swing/tilt physics.
 */
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const blurs = useAnimatedBlur();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.78], [1, 0]);
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
      {/* Straps ride the hero's own fade so they leave with it rather than
          sliding out from under the next section. Opacity only — the
          content wrapper's scale/blur would cost a re-raster on two
          viewport-sized bands every scroll frame. */}
      <motion.div
        aria-hidden
        style={reduced ? undefined : { opacity }}
        className="pointer-events-none absolute inset-0 z-[1]"
      >
        <HeroStraps />
      </motion.div>

      <motion.div
        style={
          reduced
            ? undefined
            : {
                scale,
                y,
                opacity,
                transformOrigin: "center 35%",
              }
        }
        className="shell relative z-[2] flex w-full flex-col items-center text-center gpu lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-14 lg:text-left"
      >
        <motion.div
          /* Quick, plain fade — IDCard's own drop-in spring is the entrance
             motion here. A slow blur/scale reveal (fine for a static photo)
             would leave the badge still near-transparent by the time its
             drop had already finished, so the drop would read as if it
             wasn't there. */
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
          className="relative mb-2 w-full sm:mb-4 lg:mb-0 lg:w-auto lg:shrink-0"
        >
          <IDCard />
        </motion.div>

        <div className="flex w-full flex-col items-center text-center lg:items-start lg:text-left">
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
          <span aria-hidden="true" className="flex flex-nowrap justify-center lg:justify-start">
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
          className="font-display text-[clamp(1.05rem,2.4vw,1.7rem)] font-light tracking-supertight text-white/78"
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
          className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
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
        </div>
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
