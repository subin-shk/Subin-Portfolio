import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "./motion";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** Anchor links and the dock both route through this. */
export function scrollTo(target: string | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.5 });
    return;
  }
  const el =
    typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Installs Lenis and hands ScrollTrigger the same clock, so GSAP
 * scrubs and Lenis' interpolated position never disagree by a frame.
 * Skipped entirely under prefers-reduced-motion — native scroll is
 * what that user asked for.
 */
export function useSmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      ScrollTrigger.refresh();
      return;
    }

    // `lerp` and `duration` are alternative interpolation modes — passing
    // both makes Lenis pick one and silently ignore the other, which is
    // what made the feel inconsistent. Lerp alone tracks the wheel best.
    const instance = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Touch devices already have native momentum; doubling it fights it.
      syncTouch: false,
    });
    lenis = instance;

    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Late-loading images shift section heights; re-measure once settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const settle = window.setTimeout(refresh, 700);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, [reduced]);
}
