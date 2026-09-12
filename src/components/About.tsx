import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { narrative, personalInfo } from "../data/portfolioData";
import { usePhone, useReducedMotion } from "../lib/motion";
import { Rise } from "./ui/Reveal";
import portrait from "../images/subin_shk.webp";

export default function About() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const phone = usePhone();

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
      /* The photo's glow is inset -10 on every side, which on a phone reaches
         past the gutter and made the whole page pannable sideways. `clip`
         cuts it at the section edge without becoming a scroll container, so
         the vertical parallax bleed is untouched. */
      className="relative overflow-x-clip py-[clamp(7rem,16vh,12rem)]"
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
                className="absolute -inset-10 rounded-full opacity-50 gpu"
              >
                {/* A conic gradient is already smooth all the way round; the
                    blur was only softening its hard outer edge. On a phone a
                    radial mask does that job for nothing. */}
                <div
                  className="h-full w-full rounded-[50%]"
                  style={{
                    background:
                      "conic-gradient(from 210deg at 50% 50%, rgba(95,212,232,0.20), rgba(77,124,255,0.22), rgba(155,123,255,0.20), rgba(95,212,232,0.20))",
                    ...(phone
                      ? {
                          WebkitMaskImage:
                            "radial-gradient(closest-side, #000 30%, rgba(0,0,0,0.45) 62%, transparent 88%)",
                          maskImage:
                            "radial-gradient(closest-side, #000 30%, rgba(0,0,0,0.45) 62%, transparent 88%)",
                        }
                      : { filter: "blur(58px)" }),
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
              </motion.div>

              {/* Front chip — the topmost layer, moving furthest */}
              <motion.div
                style={reduced ? undefined : { y: chipY }}
                className="glass edge absolute -bottom-5 right-2 rounded-2xl px-5 py-3.5 gpu sm:-right-8"
              >
                <p className="eyebrow !tracking-[0.3em]">Currently</p>
                <p className="mt-1.5 text-[0.82rem] font-medium text-white/78">
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
      </div>
    </section>
  );
}
