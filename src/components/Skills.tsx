import { useState } from "react";
import { motion } from "framer-motion";
import {
  Braces,
  GaugeCircle,
  GitBranch,
  Leaf,
  MousePointerClick,
  Radio,
  Workflow,
} from "lucide-react";
import { narrative, skillGroups } from "../data/portfolioData";
import type { Accent, SkillGroup } from "../types";
import { EASE, inView, useReducedMotion } from "../lib/motion";
import { Rise } from "./ui/Reveal";

const ICONS: Record<string, typeof Braces> = {
  automation: MousePointerClick,
  api: Radio,
  performance: GaugeCircle,
  bdd: Leaf,
  rpa: Workflow,
  programming: Braces,
  vcs: GitBranch,
};

const ACCENT: Record<Accent, { rgb: string }> = {
  blue: { rgb: "77,124,255" },
  cyan: { rgb: "95,212,232" },
  violet: { rgb: "155,123,255" },
};

type Hovered = { group: string; index: number } | null;

function Capsule({
  name,
  note,
  group,
  index,
  hovered,
  onHover,
}: {
  name: string;
  note: string;
  group: SkillGroup;
  index: number;
  hovered: Hovered;
  onHover: (h: Hovered) => void;
}) {
  const reduced = useReducedMotion();
  const [rings, setRings] = useState<number[]>([]);
  const accent = ACCENT[group.accent];
  const Icon = ICONS[group.id] ?? Braces;

  const isActive = hovered?.group === group.id && hovered.index === index;
  const isSibling = hovered?.group === group.id && !isActive;
  const isOther = hovered !== null && hovered.group !== group.id;

  // Siblings drift toward whichever capsule is lit, nearest pulling hardest.
  const gap = hovered && isSibling ? hovered.index - index : 0;
  const pull = gap === 0 ? 0 : (gap > 0 ? 1 : -1) * Math.max(3, 11 - Math.abs(gap) * 3);

  const enter = () => {
    onHover({ group: group.id, index });
    if (reduced) return;
    const id = Date.now() + index;
    setRings((r) => [...r, id]);
    window.setTimeout(() => setRings((r) => r.filter((x) => x !== id)), 950);
  };

  return (
    /* Outer element owns the scroll-in; inner owns the hover choreography.
       Sharing one element would let `animate` clobber the entry variant. */
    <motion.div
      variants={{
        hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.94 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.75, ease: EASE },
        },
      }}
      className="shrink-0"
    >
    <motion.div
      onPointerEnter={enter}
      onPointerLeave={() => onHover(null)}
      data-orb="touch"
      animate={
        reduced
          ? undefined
          : {
              x: pull,
              scale: isActive ? 1.055 : isSibling ? 1.02 : 1,
              // Dim rather than blur — blurring a label you might be
              // reading costs legibility for no extra clarity.
              opacity: isOther ? 0.34 : 1,
            }
      }
      transition={{ duration: 0.55, ease: EASE }}
      className="glass edge relative flex items-center gap-2.5 overflow-visible rounded-full py-2.5 pl-3.5 pr-5 gpu"
      style={{
        boxShadow: isActive
          ? `0 0 0 1px rgba(${accent.rgb},0.18), 0 10px 24px -12px rgba(${accent.rgb},0.28), inset 0 1px 0 rgba(255,255,255,0.12)`
          : undefined,
        transition: "box-shadow .55s var(--ease-glass)",
      }}
    >
      {rings.map((id) => (
        <span
          key={id}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            border: `1px solid rgba(${accent.rgb},0.55)`,
            animation: "ripple-out .9s var(--ease-glass) forwards",
          }}
        />
      ))}

      <span
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 25%, rgba(${accent.rgb},0.34), rgba(${accent.rgb},0.10))`,
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12)`,
        }}
      >
        <Icon
          size={13}
          strokeWidth={1.9}
          style={{ color: `rgb(${accent.rgb})` }}
        />
      </span>

      <span className="whitespace-nowrap text-[0.86rem] font-medium tracking-[-0.01em] text-white/88">
        {name}
      </span>

      {/* Qualifier only surfaces on the lit capsule */}
      {note && (
        <motion.span
          aria-hidden={!isActive}
          animate={{
            width: isActive && !reduced ? "auto" : 0,
            opacity: isActive && !reduced ? 1 : 0,
          }}
          transition={{ duration: 0.45, ease: EASE }}
          className="overflow-hidden whitespace-nowrap text-[0.7rem] tracking-[0.06em] text-white/40"
        >
          <span className="pl-2">{note}</span>
        </motion.span>
      )}
    </motion.div>
    </motion.div>
  );
}

export default function Skills() {
  const [hovered, setHovered] = useState<Hovered>(null);

  return (
    <section id="skills" className="relative py-[clamp(6rem,14vh,10rem)]">
      <div className="shell">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Rise>
              <h2
                className="beat"
                dangerouslySetInnerHTML={{ __html: narrative.skills.beat }}
              />
            </Rise>
            <Rise delay={0.14}>
              <p className="lede mt-7 max-w-[34ch]">{narrative.skills.body}</p>
            </Rise>
          </div>

          <div className="lg:col-span-7">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={inView}
              transition={{ staggerChildren: 0.045 }}
              className="flex flex-col gap-7"
            >
              {skillGroups.map((group) => (
                <div key={group.id} className="flex flex-col gap-3">
                  <motion.span
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { duration: 0.6 } },
                    }}
                    className="eyebrow"
                  >
                    {group.label}
                  </motion.span>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {group.items.map((item, i) => (
                      <Capsule
                        key={item.name}
                        name={item.name}
                        note={item.note}
                        group={group}
                        index={i}
                        hovered={hovered}
                        onHover={setHovered}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
