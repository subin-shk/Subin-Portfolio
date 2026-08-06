import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE, inView, useReducedMotion } from "../../lib/motion";

type RiseProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: number;
  duration?: number;
};

/**
 * Blur-to-sharp rise, used for every scroll-in on the page.
 *
 * The blur is kept light on purpose: enough to read as "resolving into
 * focus", not enough to make the text illegible if the reveal lands late.
 */
export function Rise({
  children,
  className = "",
  delay = 0,
  y = 30,
  blur = 7,
  duration = 0.85,
}: RiseProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={
        reduced ? { opacity: 0 } : { opacity: 0, y, filter: `blur(${blur}px)` }
      }
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={inView}
      transition={{ duration: reduced ? 0.25 : duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
