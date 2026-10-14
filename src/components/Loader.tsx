import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ParticleSurge from "./originkit/particle-surge";
import { EASE, useReducedMotion } from "../lib/motion";
import { releaseIntro, whenPageReady } from "../lib/pageReady";
import { setScrollLocked } from "../lib/useSmoothScroll";

/** Held at least this long, so a fast load reads as intent, not a flicker. */
const MIN_SHOW = 1500;
/** A stalled asset shouldn't hold the whole site hostage. */
const MAX_WAIT = 10000;
/** Width-led on portrait phones, height-led elsewhere, so orb and caption always fit. */
const ORB_SIZE = "clamp(120px, min(48vw, 36vh), 350px)";

/**
 * Opening loading screen: the Particle Surge orb over the backdrop until the
 * page, its fonts and the 3D badge have all landed.
 */
export default function Loader() {
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();

    Promise.race([whenPageReady(), wait(MAX_WAIT)])
      .then(() => wait(MIN_SHOW - (performance.now() - started)))
      .then(() => {
        if (!cancelled) setDone(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (done) {
      // Set in index.html so content is hidden from the first byte.
      delete document.documentElement.dataset.loading;
      releaseIntro();
      return;
    }
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.25 : 0.8, ease: EASE }}
          /* No fill of its own: the live Atmosphere shows through, so the
             backdrop doesn't change when this lifts. */
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-4 sm:gap-6"
        >
          <ParticleSurge
            accentColor="#5fd4e8"
            speed={reduced ? 20 : 50}
            style={{ width: ORB_SIZE, height: ORB_SIZE }}
          />
          <span className="eyebrow">Loading</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, ms)));
}
