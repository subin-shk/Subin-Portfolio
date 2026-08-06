import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { navigationItems } from "../data/portfolioData";
import { EASE, useReducedMotion } from "../lib/motion";
import { scrollTo } from "../lib/useSmoothScroll";

/**
 * visionOS-style floating dock — the only place the page's structure is
 * named. It condenses once you leave the hero so it stays out of the way,
 * and the lit pill follows the section you're actually reading.
 */
export default function Dock() {
  const [active, setActive] = useState(navigationItems[0].href.slice(1));
  const [condensed, setCondensed] = useState(false);
  const reduced = useReducedMotion();

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
          className="glass edge pointer-events-auto relative overflow-hidden rounded-full px-1.5 py-1.5"
          style={{ boxShadow: "0 12px 30px -14px rgba(0,0,0,0.9)" }}
        >
          <ul className="relative flex items-center gap-0.5">
            {navigationItems.map((item) => {
              const id = item.href.slice(1);
              const isActive = active === id;

              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => scrollTo(item.href)}
                    aria-current={isActive ? "true" : undefined}
                    className="relative block rounded-full px-3 py-2 sm:px-4"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="dock-pill"
                        aria-hidden
                        className="absolute inset-0 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.12)",
                          boxShadow:
                            "inset 0 1px 0 rgba(255,255,255,0.22), 0 0 26px -4px rgba(120,170,255,0.75)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 32,
                        }}
                      />
                    )}

                    {/* Label on wide screens, dot on narrow */}
                    <span
                      className={`relative z-[1] hidden text-[0.74rem] font-medium tracking-[-0.005em] transition-colors duration-400 sm:block ${
                        isActive ? "text-white" : "text-white/45 hover:text-white/80"
                      }`}
                    >
                      {item.name}
                    </span>
                    <span
                      className={`relative z-[1] block h-1.5 w-1.5 rounded-full transition-all duration-400 sm:hidden ${
                        isActive ? "bg-white" : "bg-white/30"
                      }`}
                      style={
                        isActive
                          ? { boxShadow: "0 0 10px rgba(160,200,255,0.9)" }
                          : undefined
                      }
                    />
                    <span className="sr-only sm:hidden">{item.name}</span>
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
