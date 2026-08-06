import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "framer-motion";
import { narrative, personalInfo, stats } from "../data/portfolioData";
import type { Stat } from "../types";
import { EASE, inView, useReducedMotion, useRise } from "../lib/motion";
import { Rise } from "./ui/Reveal";
import portrait from "../images/subin_shk.webp";

function StatTile({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const rise = useRise(24, 7);

  const count = useMotionValue(0);
  const [shown, setShown] = useState("0");
  const [ripples, setRipples] = useState<number[]>([]);

  const decimals = stat.value % 1 === 0 ? 0 : 1;

  useEffect(() => {
    if (!seen) return;
    if (reduced) {
      setShown(stat.value.toFixed(decimals));
      return;
    }
    const controls = animate(count, stat.value, {
      duration: 1.8,
      ease: EASE,
      delay: index * 0.08,
      onUpdate: (v) => setShown(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [seen, stat.value, count, decimals, index, reduced]);

  // Each hover drops a ring that cleans itself up when the animation ends.
  const ripple = () => {
    if (reduced) return;
    const id = Date.now();
    setRipples((r) => [...r, id]);
    window.setTimeout(
      () => setRipples((r) => r.filter((x) => x !== id)),
      1000
    );
  };

  return (
    <motion.div
      ref={ref}
      onPointerEnter={ripple}
      initial={rise.initial}
      whileInView={rise.animate}
      viewport={inView}
      transition={{ duration: 0.9, ease: EASE, delay: index * 0.09 }}
      className="glass edge group relative flex flex-col items-center overflow-hidden rounded-[1.5rem] px-4 py-7 text-center"
    >
      {ripples.map((id) => (
        <span
          key={id}
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 rounded-full"
          style={{
            border: "1px solid rgba(160,200,255,0.5)",
            animation: "ripple-center .95s var(--ease-glass) forwards",
          }}
        />
      ))}

      <span
        className="font-display text-[clamp(2rem,4.4vw,3.1rem)] font-light leading-none tracking-tightest text-white transition-transform duration-700 ease-glass group-hover:-translate-y-0.5"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {shown}
        <span className="tint">{stat.suffix}</span>
      </span>

      <span className="mt-3 max-w-[10ch] text-[0.72rem] leading-snug tracking-[0.08em] text-white/45">
        {stat.label}
      </span>
    </motion.div>
  );
}

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Three depths drifting at different rates — the frame separates as you scroll.
  const backY = useTransform(scrollYProgress, [0, 1], ["-9%", "9%"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const frontY = useTransform(scrollYProgress, [0, 1], ["12%", "-12%"]);
  const chipY = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.1, 0.85]);

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-[clamp(7rem,16vh,12rem)]"
    >
      <div className="shell">
        <div className="grid items-center gap-x-16 gap-y-16 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <div
              className="relative mx-auto aspect-[4/5] w-full max-w-[26rem]"
              style={{ perspective: 1400 }}
            >
              {/* Light source behind the glass */}
              <motion.div
                aria-hidden
                style={reduced ? undefined : { y: backY, scale: glowScale }}
                className="absolute -inset-10 rounded-full opacity-80 gpu"
              >
                <div
                  className="h-full w-full rounded-[50%]"
                  style={{
                    background:
                      "conic-gradient(from 210deg at 50% 50%, rgba(95,212,232,0.30), rgba(77,124,255,0.34), rgba(155,123,255,0.30), rgba(95,212,232,0.30))",
                    filter: "blur(58px)",
                  }}
                />
              </motion.div>

              {/* Back plate — offset up-left, drifts against the photo */}
              <motion.div
                aria-hidden
                style={reduced ? undefined : { y: midY }}
                className="glass-faint edge absolute -left-6 -top-6 h-[86%] w-[78%] rounded-[2rem] gpu"
              />

              {/* Photo */}
              <motion.div
                style={reduced ? undefined : { y: frontY }}
                data-orb="media"
                className="glass edge group absolute inset-0 overflow-hidden rounded-[2rem] gpu"
              >
                <img
                  src={portrait}
                  alt="Subin Shakya"
                  loading="lazy"
                  decoding="async"
                  width={800}
                  height={800}
                  className="h-full w-full scale-[1.04] object-cover object-top transition-transform duration-[1.4s] ease-glass group-hover:scale-[1.1]"
                  style={{ filter: "saturate(0.68) contrast(1.06) brightness(0.72)" }}
                />

                {/* Cools the warm photo into the surrounding palette */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(165deg, rgba(77,124,255,0.26), transparent 45%), linear-gradient(0deg, rgba(5,5,5,0.85), transparent 58%)",
                  }}
                />
                <div className="grain !opacity-20" />

                {/* Reflection sliding across the pane */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(112deg, transparent 38%, rgba(255,255,255,0.10) 50%, transparent 62%)",
                  }}
                />
              </motion.div>

              {/* Front chip — the topmost layer, moving furthest */}
              <motion.div
                style={reduced ? undefined : { y: chipY }}
                className="glass edge absolute -bottom-5 right-2 rounded-2xl px-5 py-3.5 gpu sm:-right-8"
              >
                <p className="eyebrow !tracking-[0.3em]">Currently</p>
                <p className="mt-1.5 text-[0.82rem] font-medium text-white/85">
                  Software QA · ThemeGrill
                </p>
              </motion.div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Rise>
              <h2
                className="beat"
                dangerouslySetInnerHTML={{ __html: narrative.about.beat }}
              />
            </Rise>

            <div className="mt-9 max-w-[46ch] space-y-6">
              {narrative.about.body.map((para, i) => (
                <Rise key={i} delay={0.12 + i * 0.12}>
                  <p className="lede">{para}</p>
                </Rise>
              ))}
            </div>

            <Rise delay={0.4}>
              <div className="rule mt-10 max-w-[26rem]" />
            </Rise>

            <Rise delay={0.48}>
              <p className="whisper mt-8 max-w-[44ch]">
                {personalInfo.summary}
              </p>
            </Rise>
          </div>
        </div>

        <div className="mt-[clamp(4.5rem,9vh,7rem)] grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <StatTile key={s.id} stat={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
