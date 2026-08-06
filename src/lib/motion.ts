import { useEffect, useState } from "react";

/** Shared easing curve — matches --ease-glass in index.css. */
export const EASE = [0.22, 1, 0.36, 1] as const;

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Live reduced-motion preference. Components read this to swap
 * transform/blur choreography for a plain opacity fade.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/** Live media-query match, for choreography that only makes sense at size. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/**
 * Whether animated `filter: blur()` should run at all.
 *
 * Blur is the most expensive thing on this page: it re-rasterises the element
 * every frame it changes. Phones pay that on a far weaker GPU, and the effect
 * is least visible on a small screen — so below `md` the reveals resolve on
 * opacity and travel alone. Reduced motion drops it for the same reason it
 * drops everything else.
 */
export function useAnimatedBlur(): boolean {
  const reduced = useReducedMotion();
  const phone = useMediaQuery("(max-width: 767px)");
  return !reduced && !phone;
}

/**
 * The page's one reveal recipe: fade up, optionally resolving out of a blur.
 * Callers pass their own travel and softness; this decides how much of it the
 * viewer's device and preferences actually get.
 *
 * `filter` is omitted rather than set to `blur(0px)` when blur is off — a zero
 * blur still builds a stacking context and a raster layer for no visible gain.
 */
export function useRise(y: number, blur: number) {
  const reduced = useReducedMotion();
  const blurs = useAnimatedBlur();

  if (reduced) return { initial: { opacity: 0 }, animate: { opacity: 1 } };

  return {
    initial: blurs
      ? { opacity: 0, y, filter: `blur(${blur}px)` }
      : { opacity: 0, y },
    animate: blurs
      ? { opacity: 1, y: 0, filter: "blur(0px)" }
      : { opacity: 1, y: 0 },
  };
}

/**
 * Viewport trigger used by every reveal, so cadence stays consistent.
 * `amount` is low on purpose: a tall block that needs 30% of itself on
 * screen fires late, which is what leaves text soft while you're reading it.
 */
export const inView = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" };
