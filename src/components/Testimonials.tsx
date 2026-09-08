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
          <div
            className="glass edge edge-strong relative overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-12"
            style={{ boxShadow: "0 24px 60px -28px rgba(0,0,0,0.65)" }}
          >
            {/* Ambient glow, drifts with the active testimonial */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-10 -top-24 h-64 opacity-70"
              style={{
                background:
                  "radial-gradient(50% 100% at 30% 0%, rgba(95,212,232,0.16), transparent 70%)",
              }}
            />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              {/* Quote side */}
              <div className="relative min-h-[22rem] sm:min-h-[18rem]">
                <Quote
                  aria-hidden
                  size={40}
                  strokeWidth={0}
                  className="tint mb-2 -scale-x-100 fill-current opacity-90"
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
                    <p className="font-display max-w-[62ch] text-[clamp(1.05rem,1.7vw,1.3rem)] font-light leading-[1.6] tracking-supertight text-white/92">
                      {active.quote}
                    </p>

                    <div className="mt-8 flex items-center gap-3">
                      <div className="rule w-10" />
                      <div>
                        <p className="text-[0.92rem] font-medium text-white/90">
                          {active.name}
                        </p>
                        <p className="mt-0.5 text-[0.76rem] tracking-[0.04em] text-white/45">
                          {active.role} · {active.company}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="mt-9 flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Previous testimonial"
                    onClick={() => go(index - 1)}
                    className="edge glass-faint grid h-10 w-10 place-items-center rounded-full text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    <ArrowLeft size={16} strokeWidth={1.8} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next testimonial"
                    onClick={() => go(index + 1)}
                    className="edge glass-faint grid h-10 w-10 place-items-center rounded-full text-white/60 transition-colors duration-300 hover:text-white"
                  >
                    <ArrowRight size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {/* Avatar switcher */}
              <div className="flex flex-row gap-4 lg:flex-col lg:items-end">
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
                      {/* Soft conic halo, only ever a glow — never a hard ring */}
                      <span
                        aria-hidden
                        className="absolute -inset-3 rounded-full blur-md transition-opacity duration-700 ease-glass"
                        style={{
                          background:
                            "conic-gradient(from 210deg, rgba(95,212,232,0.85), rgba(77,124,255,0.85), rgba(155,123,255,0.85), rgba(95,212,232,0.85))",
                          opacity: isActive ? 0.9 : 0,
                        }}
                      />
                      <span
                        aria-hidden
                        className="absolute -inset-1 rounded-full transition-opacity duration-500 ease-glass"
                        style={{
                          background:
                            "conic-gradient(from 210deg, rgba(95,212,232,0.95), rgba(77,124,255,0.95), rgba(155,123,255,0.95), rgba(95,212,232,0.95))",
                          opacity: isActive ? 1 : 0,
                          padding: 2,
                          WebkitMask:
                            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                          WebkitMaskComposite: "xor",
                          maskComposite: "exclude",
                        }}
                      />
                      <span
                        className="relative block h-20 w-20 overflow-hidden rounded-full bg-[#12151c] sm:h-24 sm:w-24"
                        style={{
                          opacity: isActive ? 1 : 0.5,
                          boxShadow: isActive
                            ? "0 14px 32px -12px rgba(77,124,255,0.55)"
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
          </div>
        </Rise>
      </div>
    </section>
  );
}
