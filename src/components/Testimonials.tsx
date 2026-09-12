import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { narrative, testimonials } from "../data/portfolioData";
import { EASE, useReducedMotion } from "../lib/motion";
import { Rise } from "./ui/Reveal";

export default function Testimonials() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const total = testimonials.length;
  const active = testimonials[index];

  const go = (next: number) => {
    setDirection(next > index || (index === total - 1 && next === 0) ? 1 : -1);
    setIndex(((next % total) + total) % total);
  };

  return (
    <section id="testimonials" className="relative py-[clamp(6rem,15vh,11rem)]">
      <div className="shell">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Rise>
              <h2
                className="beat"
                dangerouslySetInnerHTML={{ __html: narrative.testimonials.beat }}
              />
            </Rise>
          </div>
          <div className="flex items-end lg:col-span-5">
            <Rise delay={0.14}>
              <p className="lede max-w-[30ch]">{narrative.testimonials.body}</p>
            </Rise>
          </div>
        </div>

        <Rise delay={0.22} className="mt-[clamp(3.5rem,8vh,5.5rem)]">
          <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-24">
            {/* Quote side */}
            <div className="relative min-h-[16rem]">
              <Quote
                aria-hidden
                size={46}
                strokeWidth={0}
                className="tint mb-3 -scale-x-100 fill-current opacity-90"
              />

              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={active.id}
                  custom={direction}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 24 * direction, filter: "blur(6px)" }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 * direction, filter: "blur(6px)" }}
                  transition={{ duration: reduced ? 0.25 : 0.55, ease: EASE }}
                >
                  <div className="font-display max-w-[58ch] space-y-4 text-[clamp(1.15rem,1.9vw,1.5rem)] font-light leading-[1.58] tracking-supertight text-white/92 text-left">
                    {active.quote.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center gap-3">
                    <div className="rule w-10" />
                    <div>
                      <p className="text-[0.92rem] font-medium text-white/92">
                        {active.name}
                      </p>
                      <p className="mt-0.5 text-[0.76rem] tracking-[0.04em] text-white/54">
                        {[active.role, active.company].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="mt-9 flex items-center gap-4">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={() => go(index - 1)}
                  className="edge glass-faint grid h-10 w-10 place-items-center rounded-full text-white/66 transition-colors duration-300 hover:text-white"
                >
                  <ArrowLeft size={16} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={() => go(index + 1)}
                  className="edge glass-faint grid h-10 w-10 place-items-center rounded-full text-white/66 transition-colors duration-300 hover:text-white"
                >
                  <ArrowRight size={16} strokeWidth={1.8} />
                </button>
                <span
                  className="ml-1 font-display text-[0.78rem] text-white/54"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Avatar switcher */}
            <div className="relative flex flex-row items-center gap-5 lg:flex-col">
              {/* Connecting thread running through the stack */}
              <div
                aria-hidden
                className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 opacity-25 lg:inset-x-auto lg:left-1/2 lg:top-0 lg:bottom-0 lg:h-auto lg:w-px lg:-translate-x-1/2 lg:translate-y-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)",
                }}
              />

              {testimonials.map((t, i) => {
                const isActive = i === index;
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-label={`Show testimonial from ${t.name}`}
                    aria-current={isActive}
                    onClick={() => go(i)}
                    className="group relative shrink-0 rounded-full transition-transform duration-500 ease-glass hover:!scale-95"
                    style={{
                      transform: isActive ? "scale(1)" : "scale(0.8)",
                    }}
                  >
                    {/* Thin gradient ring, only on the active avatar */}
                    <span
                      aria-hidden
                      className="absolute -inset-1 rounded-full transition-opacity duration-500 ease-glass"
                      style={{
                        background:
                          "conic-gradient(from 210deg, rgba(95,212,232,0.9), rgba(77,124,255,0.9), rgba(155,123,255,0.9), rgba(95,212,232,0.9))",
                        opacity: isActive ? 1 : 0,
                        padding: 2,
                        WebkitMask:
                          "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      }}
                    />
                    <span
                      className="relative block h-16 w-16 overflow-hidden rounded-full bg-[#12151c] sm:h-20 sm:w-20"
                      style={{
                        opacity: isActive ? 1 : 0.5,
                        boxShadow: isActive
                          ? "0 10px 22px -12px rgba(77,124,255,0.4)"
                          : "0 8px 20px -10px rgba(0,0,0,0.7)",
                      }}
                    >
                      <img
                        src={t.image}
                        alt={t.name}
                        loading="lazy"
                        decoding="async"
                        width={96}
                        height={96}
                        className="h-full w-full scale-[1.35] object-cover object-top transition-transform duration-500 ease-glass group-hover:scale-[1.45]"
                        style={{
                          filter: isActive
                            ? "saturate(1.08) contrast(1.03)"
                            : "saturate(0.4) grayscale(0.3)",
                        }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Rise>
      </div>
    </section>
  );
}
