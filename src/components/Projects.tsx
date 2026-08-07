import { Fragment, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { archiveProjects, featuredProjects, narrative } from "../data/portfolioData";
import type { Accent, ArchiveProject, FeaturedProject } from "../types";
import { EASE, inView, useMediaQuery, useReducedMotion } from "../lib/motion";
import { Rise } from "./ui/Reveal";
import GlassCard from "./ui/GlassCard";
import ProjectVisual from "./ui/ProjectVisual";

const RGB: Record<Accent, string> = {
  blue: "77,124,255",
  cyan: "95,212,232",
  violet: "155,123,255",
};

function Panel({
  project,
  position,
  total,
}: {
  project: FeaturedProject;
  position: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const wide = useMediaQuery("(min-width: 1024px)");
  const rgb = RGB[project.accent];
  const flip = position % 2 === 1;

  /* A full card is taller than a phone screen, so the stacking treatment
     is desktop-only; below that the panels simply scroll past. */
  const stacked = wide && !reduced;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Hold at full size through the read, then sink away in the last third.
  const scale = useTransform(scrollYProgress, [0, 0.62, 1], [1, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);
  // Blur starts only once the card is under 35% opaque. Any earlier and it
  // softens text you are still actively reading.
  const blur = useTransform(scrollYProgress, [0, 0.87, 1], [0, 0, 10]);
  const blurCss = useTransform(blur, (b) => `blur(${b}px)`);
  const lift = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const steps = [
    { label: "Challenge", body: project.challenge },
    { label: "Solution", body: project.solution },
    { label: "Impact", body: project.impact },
  ];

  return (
    <div ref={ref} className="relative py-6 lg:h-[178vh] lg:py-0">
      <div className="lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:overflow-hidden">
        <motion.div
          style={
            stacked
              ? { scale, opacity, filter: blurCss, transformOrigin: "center 40%" }
              : undefined
          }
          className="shell w-full gpu"
        >
          <GlassCard tilt={reduced ? 0 : 3}>
            <div
              className="glass edge sheen relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
              style={{
                boxShadow: `0 16px 32px -24px rgba(${rgb},0.32), inset 0 1px 0 rgba(255,255,255,0.08)`,
              }}
            >
              {/* Accent wash keyed to the project */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70"
                style={{
                  background: `radial-gradient(90% 70% at ${
                    flip ? "82%" : "18%"
                  } 8%, rgba(${rgb},0.16), transparent 62%)`,
                }}
              />

              <div
                /* Text gets the larger share — Challenge/Solution/Impact sit
                   in three columns and go unreadable at an even split. */
                className={`relative grid items-stretch lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] ${
                  flip ? "lg:[direction:rtl]" : ""
                }`}
              >
                <div
                  data-orb="media"
                  className="group/vis relative order-1 h-[26vh] min-h-[13rem] overflow-hidden lg:order-none lg:h-auto lg:min-h-[27rem] [direction:ltr]"
                >
                  {/* The orbital field is the constant. A screenshot, when
                      there is one, floats on top of it as a treated plate —
                      full-bleeding a bright UI here would crop it savagely
                      and blow a hole in the dark palette. */}
                  <ProjectVisual seed={project.id} accent={project.accent} />

                  {project.image && project.imageFit === "float" && (
                    /* Cut-out product shot: no frame, no wash. It keeps its
                       own alpha and sits on the accent field, graded just
                       far enough down to belong to the dark palette. */
                    <div className="absolute inset-0 grid place-items-center p-[7%] sm:p-[9%]">
                      <img
                        src={project.image}
                        alt={`${project.name} interface`}
                        loading="lazy"
                        decoding="async"
                        className="max-w-full object-contain transition-transform duration-[1.6s] ease-glass group-hover/vis:scale-[1.04]"
                        style={{
                          maxHeight: project.imageMaxH ?? "100%",
                          filter:
                            "saturate(0.86) brightness(0.86) contrast(1.02) drop-shadow(0 18px 34px rgba(0,0,0,0.75))",
                        }}
                      />
                    </div>
                  )}

                  {project.image && project.imageFit !== "float" && (
                    <div className="absolute inset-0 grid place-items-center p-[9%]">
                      {/* Height follows the image's own aspect, so any
                          screenshot lands uncropped whatever shape it is. */}
                      <div
                        className="relative w-full overflow-hidden rounded-xl edge shadow-[0_16px_34px_-18px_rgba(0,0,0,0.95)]"
                        style={{ background: "rgba(5,5,5,0.6)" }}
                      >
                        <img
                          src={project.image}
                          alt={`${project.name} interface`}
                          loading="lazy"
                          decoding="async"
                          className="block h-auto w-full transition-transform duration-[1.6s] ease-glass group-hover/vis:scale-[1.05]"
                          style={{
                            filter:
                              "saturate(0.74) brightness(0.62) contrast(1.06)",
                          }}
                        />
                        <div
                          aria-hidden
                          className="absolute inset-0"
                          style={{
                            background: `linear-gradient(150deg, rgba(${rgb},0.22), transparent 58%), linear-gradient(0deg, rgba(5,5,5,0.5), transparent 65%)`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Seam: dissolves the visual into the text column */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: flip
                        ? "linear-gradient(270deg, rgba(5,5,5,0.55), transparent 42%)"
                        : "linear-gradient(90deg, rgba(5,5,5,0.55), transparent 42%)",
                    }}
                  />

                  {/* Sits in the outer corner of the card, whichever side
                      the visual landed on. */}
                  <div
                    className={`absolute top-6 [direction:ltr] ${
                      flip ? "right-6" : "left-6"
                    }`}
                  >
                    <span
                      className="font-display text-[2.6rem] font-light leading-none tracking-tightest text-white/22"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {project.index}
                    </span>
                  </div>
                </div>

                <div className="relative order-2 flex flex-col justify-center px-6 py-8 [direction:ltr] sm:px-8 sm:py-10 lg:order-none lg:px-11 lg:py-12">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: `rgb(${rgb})`,
                        boxShadow: `0 0 8px rgba(${rgb},0.42)`,
                      }}
                    />
                    <span className="eyebrow">{project.kicker}</span>
                  </div>

                  <h3 className="mt-4 font-display text-[clamp(1.75rem,3.6vw,3rem)] font-light leading-[1.02] tracking-tightest text-white">
                    {project.name}
                  </h3>

                  <p className="lede mt-5 max-w-[46ch] !text-[1rem] sm:!text-[1.05rem]">
                    {project.overview}
                  </p>

                  <div className="rule my-7 max-w-[22rem]" />

                  <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
                    {steps.map((s) => (
                      <div key={s.label}>
                        <p
                          className="eyebrow !text-[0.55rem]"
                          style={{ color: `rgba(${rgb},0.8)` }}
                        >
                          {s.label}
                        </p>
                        <p className="mt-2.5 text-[0.82rem] leading-[1.65] text-white/58">
                          {s.body}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-9 flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="glass-faint rounded-full px-3 py-1.5 text-[0.68rem] tracking-[0.04em] text-white/55"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-5">
                    {project.github ? (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 text-[0.82rem] text-white/70 transition-colors duration-300 hover:text-white"
                      >
                        <Github size={15} strokeWidth={1.7} />
                        <span className="relative">
                          Source
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white/60 transition-all duration-500 ease-glass group-hover/link:w-full" />
                        </span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-[0.82rem] text-white/28">
                        <Github size={15} strokeWidth={1.7} />
                        Private — internal suite
                      </span>
                    )}

                    {project.liveDemo && (
                      <a
                        href={project.liveDemo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link inline-flex items-center gap-2 text-[0.82rem] text-white/70 transition-colors duration-300 hover:text-white"
                      >
                        <ArrowUpRight size={15} strokeWidth={1.7} />
                        <span className="relative">
                          Live Demo
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white/60 transition-all duration-500 ease-glass group-hover/link:w-full" />
                        </span>
                      </a>
                    )}

                    <span className="ml-auto font-mono text-[0.65rem] tracking-[0.2em] text-white/22">
                      {project.index} / {String(total).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Progress hairline under the stack */}
          <motion.div
            style={stacked ? { y: lift } : undefined}
            className="mx-auto mt-5 hidden h-px w-full max-w-[14rem] overflow-hidden bg-white/8 lg:block"
          >
            <motion.div
              className="h-full"
              style={{
                background: `linear-gradient(90deg, transparent, rgb(${rgb}), transparent)`,
                scaleX: reduced ? 1 : scrollYProgress,
                transformOrigin: "left",
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function ArchiveRow({ item, index }: { item: ArchiveProject; index: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.a
      href={item.github}
      target="_blank"
      rel="noopener noreferrer"
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.08 }}
      className="group relative block border-t border-white/8 py-7 transition-colors duration-500 last:border-b hover:border-white/20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 inset-y-1 -z-10 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 50%, rgba(255,255,255,0.05), transparent 70%)",
        }}
      />
      {/* Name column, blurb and tech meta only fit on one line from `md`.
          Turning the row at `sm` pushed the tech list past the viewport
          between 640px and ~680px — landscape phone territory. */}
      <div className="flex flex-col gap-3 md:flex-row md:items-baseline md:gap-8">
        <h4 className="font-display text-[1.15rem] font-normal tracking-supertight text-white/85 transition-transform duration-500 ease-glass group-hover:translate-x-1.5 md:min-w-[15rem]">
          {item.name}
        </h4>
        <p className="max-w-[42ch] flex-1 text-[0.85rem] leading-relaxed text-white/45">
          {item.description}
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <span className="font-mono text-[0.65rem] tracking-[0.12em] text-white/30">
            {item.tech.join(" · ")}
          </span>
          <ArrowUpRight
            size={16}
            strokeWidth={1.6}
            className="text-white/30 transition-all duration-500 ease-glass group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/80"
          />
        </div>
      </div>
    </motion.a>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative">
      {/* Lead-in beat, then straight into the stack */}
      <div className="shell pb-[clamp(4rem,10vh,7rem)] pt-[clamp(5rem,12vh,9rem)]">
        <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Rise>
              <h2
                className="beat"
                dangerouslySetInnerHTML={{ __html: narrative.projects.beat }}
              />
            </Rise>
          </div>
          <div className="flex items-end lg:col-span-5">
            <Rise delay={0.14}>
              <p className="lede max-w-[32ch]">{narrative.projects.body}</p>
            </Rise>
          </div>
        </div>
      </div>

      {featuredProjects.map((p, i) => (
        <Fragment key={p.id}>
          {/* The stack turns here, from testing systems to having built
              them. A beat rather than a header, so it stays one story. */}
          {p.strand === "build" &&
            featuredProjects[i - 1]?.strand === "automation" && (
              <div className="shell py-[clamp(5rem,13vh,9rem)]">
                <div className="grid gap-x-16 gap-y-6 lg:grid-cols-12">
                  <div className="lg:col-span-6">
                    <Rise>
                      <h2
                        className="beat"
                        dangerouslySetInnerHTML={{
                          __html: narrative.projectsAside.beat,
                        }}
                      />
                    </Rise>
                  </div>
                  <div className="flex items-end lg:col-span-6">
                    <Rise delay={0.14}>
                      <p className="lede max-w-[40ch]">
                        {narrative.projectsAside.body}
                      </p>
                    </Rise>
                  </div>
                </div>
              </div>
            )}

          <Panel
            project={p}
            position={i}
            total={featuredProjects.length}
          />
        </Fragment>
      ))}

      {/* Archive */}
      <div className="shell pb-[clamp(5rem,11vh,8rem)] pt-[clamp(3rem,8vh,6rem)]">
        <Rise>
          <p className="eyebrow mb-8">Also built</p>
        </Rise>
        <div>
          {archiveProjects.map((item, i) => (
            <ArchiveRow key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
