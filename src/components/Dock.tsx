import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Code2, Home, LayoutGrid, Mail, Route, Trophy, User } from "lucide-react";
import { navigationItems } from "../data/portfolioData";
import { EASE, useMediaQuery, useReducedMotion } from "../lib/motion";
import { scrollTo } from "../lib/useSmoothScroll";

/** Seven labels don't fit a phone, so narrow screens navigate by icon. */
const ICONS: Record<string, typeof Home> = {
  home: Home,
  about: User,
  skills: Code2,
  projects: LayoutGrid,
  journey: Route,
  achievements: Trophy,
  contact: Mail,
};

/** The lit surface behind the active item, shared by both dock modes. */
const PILL = {
  background: "rgba(255,255,255,0.12)",
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 26px -4px rgba(120,170,255,0.75)",
} as const;

/**
 * visionOS-style floating dock — the only place the page's structure is
 * named. It condenses once you leave the hero so it stays out of the way,
 * and the lit pill follows the section you're actually reading.
 */
export default function Dock() {
  const [active, setActive] = useState(navigationItems[0].href.slice(1));
  const [condensed, setCondensed] = useState(false);
  const reduced = useReducedMotion();
  /* Below `sm` the dock is an icon rail and only the active item is named. */
  const compact = useMediaQuery("(max-width: 639px)");

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    restDelta: 0.001,
  });

  /* Active section — whichever crosses the upper third last. */
  useEffect(() => {
    const ids = navigationItems.map((n) => n.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-32% 0px -46% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Monogram, top-left. Doubles as "back to top". */}
      <motion.button
        type="button"
        onClick={() => scrollTo("#home")}
        aria-label="Back to top"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.6 }}
        className="fixed left-[max(1.25rem,var(--gutter))] top-6 z-[90] hidden items-center gap-2.5 md:flex"
      >
        <span className="glass edge grid h-9 w-9 place-items-center rounded-xl font-display text-[0.75rem] font-medium tracking-[0.02em] text-white/80">
          SS
        </span>
      </motion.button>

      {/* Dock */}
      <motion.nav
        aria-label="Sections"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.85 }}
        /* Centred by flex, not by -translate-x-1/2: Framer writes its own
           `transform` for the entry animation and would clobber the class. */
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center sm:bottom-6"
      >
        <motion.div
          animate={{ scale: condensed && !reduced ? 0.92 : 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          /* Seven icons plus the longest label have to clear a 320px phone,
             where the max-width leaves 288px inside. Compact spacing below
             brings them to ~279px; the max-width is the backstop that keeps
             the dock on screen rather than bleeding off the edge. */
          /* The dock is the one panel that floats over live content, so it's
             the one that misses the phone build's absent backdrop blur: a
             translucent film let the text underneath read straight through
             it. Below `md` it gets an opaque backing instead. */
          className="glass edge pointer-events-auto relative max-w-[calc(100vw-1.25rem)] overflow-hidden rounded-full px-1.5 py-1.5 max-md:bg-[#0f1218]/95"
          style={{ boxShadow: "0 12px 30px -14px rgba(0,0,0,0.9)" }}
        >
          <ul className="relative flex items-center gap-0 sm:gap-0.5">
            {navigationItems.map((item) => {
              const id = item.href.slice(1);
              const isActive = active === id;
              const Icon = ICONS[id];

              /* Only the named item may give up width. Every icon stays put,
                 so a label too long for the screen loses its tail rather than
                 pushing a whole destination out of the dock. */
              return (
                <li key={item.href} className={isActive ? "min-w-0" : "shrink-0"}>
                  <button
                    type="button"
                    onClick={() => scrollTo(item.href)}
                    aria-current={isActive ? "true" : undefined}
                    /* The visible label is absent or truncated at some widths,
                       so the accessible name comes from here at every size. */
                    aria-label={item.name}
                    className="relative flex min-w-0 max-w-full items-center rounded-full px-1.5 py-2.5 sm:px-4 sm:py-2"
                  >
                    {isActive &&
                      /* The sliding pill measures its target box once, so it
                         can't track a button that is still widening. Compact
                         mode lets the label expansion carry the motion and
                         just fades the pill in place. */
                      (compact ? (
                        <motion.span
                          key="pill-compact"
                          aria-hidden
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          className="absolute inset-0 rounded-full"
                          style={PILL}
                        />
                      ) : (
                        <motion.span
                          key="pill-wide"
                          layoutId="dock-pill"
                          aria-hidden
                          className="absolute inset-0 rounded-full"
                          style={PILL}
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 32,
                          }}
                        />
                      ))}

                    {/* Icon on narrow screens, label on wide */}
                    {Icon && (
                      <Icon
                        aria-hidden
                        strokeWidth={1.75}
                        className={`relative z-[1] h-4 w-4 shrink-0 transition-colors duration-400 sm:hidden ${
                          isActive ? "text-white" : "text-white/45"
                        }`}
                      />
                    )}

                    {/* Narrow screens name only the section you're reading. */}
                    <AnimatePresence initial={false}>
                      {compact && isActive && (
                        <motion.span
                          key="label"
                          aria-hidden
                          initial={reduced ? { opacity: 0 } : { width: 0, opacity: 0 }}
                          animate={
                            reduced ? { opacity: 1 } : { width: "auto", opacity: 1 }
                          }
                          exit={reduced ? { opacity: 0 } : { width: 0, opacity: 0 }}
                          transition={{ duration: reduced ? 0.2 : 0.44, ease: EASE }}
                          className="relative z-[1] block min-w-0 overflow-hidden whitespace-nowrap text-[0.7rem] font-medium tracking-[-0.005em] text-white"
                        >
                          <span className="block pl-1.5 pr-0.5">{item.name}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>

                    <span
                      aria-hidden
                      className={`relative z-[1] hidden text-[0.74rem] font-medium tracking-[-0.005em] transition-colors duration-400 sm:block ${
                        isActive ? "text-white" : "text-white/45 hover:text-white/80"
                      }`}
                    >
                      {item.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Read-progress hairline along the dock's lower edge */}
          <motion.span
            aria-hidden
            className="absolute inset-x-3 bottom-0 h-px origin-left"
            style={{
              scaleX: progress,
              background:
                "linear-gradient(90deg, rgba(95,212,232,0.9), rgba(77,124,255,0.85), rgba(155,123,255,0.7))",
            }}
          />
        </motion.div>
      </motion.nav>
    </>
  );
}
