import { motion } from "framer-motion";
import { Award, Medal, Trophy } from "lucide-react";
import { achievements, narrative } from "../data/portfolioData";
import type { Achievement } from "../types";
import { EASE, inView, useReducedMotion, useRise } from "../lib/motion";
import { Rise } from "./ui/Reveal";
import GlassCard from "./ui/GlassCard";

const ICONS: Record<string, typeof Award> = {
  trophy: Trophy,
  award: Award,
  medal: Medal,
};

/** Accent per position, so the three cards read as a set rather than a row. */
const TONES = ["95,212,232", "77,124,255", "155,123,255"];

function AwardCard({ item, index }: { item: Achievement; index: number }) {
  const reduced = useReducedMotion();
  const rise = useRise(40, 8);
  const Icon = ICONS[item.icon] ?? Award;
  const rgb = TONES[index % TONES.length];

  return (
    <motion.div
      initial={rise.initial}
      whileInView={rise.animate}
      viewport={inView}
      transition={{ duration: 1, ease: EASE, delay: index * 0.12 }}
      className="h-full"
    >
      <GlassCard tilt={reduced ? 0 : 9}>
        <div className="relative h-full">
          <div
            className="glass edge sheen relative flex h-full flex-col overflow-hidden rounded-[1.6rem] px-7 py-8"
            style={{
              boxShadow: `0 14px 28px -22px rgba(${rgb},0.28), inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(90% 60% at 50% 0%, rgba(${rgb},0.18), transparent 62%)`,
              }}
            />

            {/* Medallion */}
            <div className="relative">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl"
                style={{
                  background: `linear-gradient(145deg, rgba(${rgb},0.34), rgba(${rgb},0.08))`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 26px -8px rgba(${rgb},0.7)`,
                }}
              >
                <Icon size={19} strokeWidth={1.6} style={{ color: `rgb(${rgb})` }} />
              </span>
            </div>

            {/* Figure */}
            <div className="relative mt-7 flex items-baseline gap-2.5">
              <span
                className="font-display text-[clamp(2.4rem,5vw,3.4rem)] font-light leading-none tracking-tightest text-white"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {item.metric}
              </span>
              <span className="text-[0.72rem] tracking-[0.12em] text-white/40">
                {item.metricLabel}
              </span>
            </div>

            <div className="rule my-6" />

            <h3 className="relative font-display text-[1.2rem] font-normal tracking-supertight text-white/92">
              {item.title}
            </h3>
            <p
              className="relative mt-1.5 text-[0.72rem] uppercase tracking-[0.16em]"
              style={{ color: `rgba(${rgb},0.75)` }}
            >
              {item.context}
            </p>
            <p className="relative mt-4 text-[0.85rem] leading-[1.7] text-white/52">
              {item.description}
            </p>
          </div>

          {/* Reflection on the surface below the card */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-4 top-full h-16 origin-top scale-y-[-1] rounded-b-[1.6rem] opacity-25 md:blur-[2px]"
            style={{
              background: `linear-gradient(180deg, rgba(${rgb},0.22), transparent 70%)`,
              WebkitMaskImage: "linear-gradient(180deg, #000, transparent)",
              maskImage: "linear-gradient(180deg, #000, transparent)",
            }}
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default function Achievements() {
  return (
    <section id="achievements" className="relative py-[clamp(6rem,14vh,10rem)]">
      <div className="shell">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Rise>
              <h2
                className="beat"
                dangerouslySetInnerHTML={{ __html: narrative.achievements.beat }}
              />
            </Rise>
          </div>
          <div className="flex items-end lg:col-span-5">
            <Rise delay={0.14}>
              <p className="lede max-w-[30ch]">{narrative.achievements.body}</p>
            </Rise>
          </div>
        </div>

        <div className="mt-[clamp(3.5rem,8vh,5.5rem)] grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <AwardCard key={a.id} item={a} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
