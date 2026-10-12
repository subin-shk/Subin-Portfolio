import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE, inView, useReducedMotion, useRise } from "../../lib/motion";

type RiseProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
};

/** Fade-up rise, used for every scroll-in on the page. */
export function Rise({
  children,
  className = "",
  delay = 0,
  y = 30,
  duration = 0.85,
}: RiseProps) {
  const reduced = useReducedMotion();
  const rise = useRise(y);

  return (
    <motion.div
      className={className}
      initial={rise.initial}
      whileInView={rise.animate}
      viewport={inView}
      transition={{ duration: reduced ? 0.25 : duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
