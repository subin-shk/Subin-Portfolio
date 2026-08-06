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
 * Viewport trigger used by every reveal, so cadence stays consistent.
 * `amount` is low on purpose: a tall block that needs 30% of itself on
 * screen fires late, which is what leaves text soft while you're reading it.
 */
export const inView = { once: true, amount: 0.15, margin: "0px 0px -8% 0px" };
