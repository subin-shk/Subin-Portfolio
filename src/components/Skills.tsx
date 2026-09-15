import { motion } from "framer-motion";
import {
  Braces,
  GaugeCircle,
  GitBranch,
  Leaf,
  MousePointerClick,
  Radio,
} from "lucide-react";
import { narrative, skillGroups } from "../data/portfolioData";
import { EASE, inView } from "../lib/motion";
import { Rise } from "./ui/Reveal";
import { SectionTitle } from "./ui/SectionTitle";

const ICONS: Record<string, typeof Braces> = {
  automation: MousePointerClick,
  api: Radio,
  performance: GaugeCircle,
  bdd: Leaf,
  programming: Braces,
  vcs: GitBranch,
};

/** A plain glass chip — icon plus label, no hover choreography. It only
 * ever animates once, in on scroll; nothing about it reacts to the
 * pointer anymore. */
function Capsule({ name, groupId }: { name: string; groupId: string }) {
  const Icon = ICONS[groupId] ?? Braces;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.94 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.75, ease: EASE },
        },
      }}
      /* Same chip as the disciplines in About: glass, a hairline edge, and a
         plain white icon — no per-group colour, so the eye reads the set as
         one kit rather than six palettes. */
      className="glass edge flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2"
    >
      <Icon
        size={16}
        strokeWidth={1.6}
        className="h-4 w-4 shrink-0 text-white/55"
      />
      <span className="whitespace-nowrap text-[0.86rem] font-medium tracking-[-0.01em] text-white/92">
        {name}
      </span>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="relative py-[clamp(6rem,14vh,10rem)]">
      <div className="shell">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Rise>
              <SectionTitle>Skills</SectionTitle>
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
                    {group.items.map((item) => (
                      <Capsule key={item.name} name={item.name} groupId={group.id} />
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
