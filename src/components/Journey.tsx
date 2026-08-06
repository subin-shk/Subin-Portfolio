import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { GraduationCap, Briefcase } from "lucide-react";
import { educationHistory, experiences, narrative } from "../data/portfolioData";
import { EASE, inView, useReducedMotion, useRise } from "../lib/motion";
import { Rise } from "./ui/Reveal";

type Milestone = {
  id: string;
  kind: "role" | "study";
  title: string;
  place: string;
  duration: string;
  current?: boolean;
  points?: string[];
  tools?: string[];
  aside?: string;
};

/** Roles and study on one chronological rail — the path, not two lists. */
const milestones: Milestone[] = [
  ...experiences.map<Milestone>((e) => ({
    id: `x-${e.id}`,
    kind: "role",
    title: e.role,
    place: e.company,
    duration: e.duration,
    current: e.current,
    points: e.description,
    tools: e.skills.split(",").map((s) => s.trim()),
  })),
  ...educationHistory.map<Milestone>((e) => ({
    id: `e-${e.id}`,
    kind: "study",
    title: e.degree,
    place: e.institution,
    duration: e.duration,
    aside: [e.grade, e.honors].filter(Boolean).join(" · "),
  })),
];

function Node({ item, index }: { item: Milestone; index: number }) {
  const reduced = useReducedMotion();
  const rise = useRise(34, 7);
  const Icon = item.kind === "role" ? Briefcase : GraduationCap;
  const lit = Boolean(item.current);

  return (
    <motion.li
      initial={rise.initial}
      whileInView={rise.animate}
      viewport={inView}
      transition={{ duration: 0.95, ease: EASE, delay: index * 0.05 }}
      className="relative pl-14 sm:pl-20"
    >
      {/* Marker on the rail */}
      <span className="absolute left-0 top-1.5 grid h-9 w-9 place-items-center sm:left-1.5">
        {lit && !reduced && (
          <span
            aria-hidden
            className="absolute h-9 w-9 rounded-full"
            style={{
              border: "1px solid rgba(95,212,232,0.6)",
              animation: "ripple-out 3s ease-out infinite",
            }}
          />
        )}
        <span
          className="glass edge grid h-9 w-9 place-items-center rounded-full"
          style={
            lit
              ? {
                  boxShadow:
                    "0 0 0 1px rgba(95,212,232,0.35), 0 0 30px -4px rgba(95,212,232,0.75)",
                }
              : undefined
          }
        >
          <Icon
            size={13}
            strokeWidth={1.8}
            className={lit ? "text-cyan" : "text-white/45"}
          />
        </span>
      </span>

      <div className="glass edge lit group relative overflow-hidden rounded-[1.4rem] px-6 py-6 transition-transform duration-700 ease-glass hover:-translate-y-1 sm:px-8 sm:py-7">
        {lit && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 100% at 0% 0%, rgba(95,212,232,0.12), transparent 58%)",
            }}
          />
        )}

        <div className="relative flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
          <span className="eyebrow !tracking-[0.22em]">{item.duration}</span>
          {lit && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan/12 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em] text-cyan-soft">
              <span className="h-1 w-1 rounded-full bg-cyan" />
              Now
            </span>
          )}
        </div>

        <h3 className="relative mt-3 font-display text-[clamp(1.15rem,2.2vw,1.6rem)] font-normal leading-tight tracking-supertight text-white">
          {item.title}
        </h3>
        <p className="relative mt-1.5 text-[0.88rem] text-white/48">{item.place}</p>

        {item.points && (
          <ul className="relative mt-5 space-y-2.5">
            {item.points.map((p, i) => (
              <li key={i} className="flex gap-3 text-[0.85rem] leading-relaxed text-white/58">
                <span
                  aria-hidden
                  className="mt-[0.55rem] h-px w-3.5 shrink-0 bg-white/25"
                />
                <span className="max-w-[62ch]">{p}</span>
              </li>
            ))}
          </ul>
        )}

        {item.aside && (
          <p className="relative mt-4 font-mono text-[0.7rem] tracking-[0.1em] text-white/38">
            {item.aside}
          </p>
        )}

        {item.tools && (
          <div className="relative mt-6 flex flex-wrap gap-1.5">
            {item.tools.map((t) => (
              <span
                key={t}
                className="glass-faint rounded-full px-2.5 py-1 text-[0.66rem] tracking-[0.04em] text-white/45"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  );
}

export default function Journey() {
  const railRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start 82%", "end 65%"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <section id="journey" className="relative py-[clamp(6rem,14vh,10rem)]">
      <div className="shell">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Rise>
              <h2
                className="beat"
                dangerouslySetInnerHTML={{ __html: narrative.journey.beat }}
              />
            </Rise>
          </div>
          <div className="flex items-end lg:col-span-5">
            <Rise delay={0.14}>
              <p className="lede max-w-[30ch]">{narrative.journey.body}</p>
            </Rise>
          </div>
        </div>

        <div ref={railRef} className="relative mt-[clamp(3.5rem,8vh,6rem)]">
          {/* Rail: a dim track with a lit line that fills as you descend */}
          <div className="absolute bottom-6 left-[1.125rem] top-2 w-px bg-white/8 sm:left-6" />
          <motion.div
            aria-hidden
            className="absolute bottom-6 left-[1.125rem] top-2 w-px origin-top sm:left-6"
            style={{
              scaleY: reduced ? 1 : drawn,
              background:
                "linear-gradient(180deg, rgba(95,212,232,0.9), rgba(77,124,255,0.7) 45%, rgba(155,123,255,0.35))",
              boxShadow: "0 0 14px rgba(95,212,232,0.55)",
            }}
          />

          <ol className="space-y-5">
            {milestones.map((m, i) => (
              <Node key={m.id} item={m} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
