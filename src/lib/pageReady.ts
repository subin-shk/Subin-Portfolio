import { useSyncExternalStore } from "react";

/**
 * What the loading screen waits on: the window's own load, web fonts, and
 * any async work a component registers with `trackLoad` — the 3D badge's
 * chunk and textures arrive after `load` and would otherwise pop in late.
 */
const pending = new Set<Promise<void>>();

/** Holds the loading screen until `work` settles, whether it succeeds or not. */
export function trackLoad<T>(work: Promise<T>): Promise<T> {
  const settled = work.then(noop, noop);
  pending.add(settled);
  settled.then(() => pending.delete(settled));
  return work;
}

export async function whenPageReady() {
  if (document.readyState !== "complete") {
    await new Promise<void>((resolve) =>
      window.addEventListener("load", () => resolve(), { once: true })
    );
  }
  await document.fonts?.ready;
  // Tracked work can register more as it lands, so drain until empty.
  while (pending.size) await Promise.all(pending);
}

/**
 * Flipped as the loading screen lifts. Entrance choreography keys off this
 * rather than mount, or it would play out unseen behind the overlay.
 */
let introReady = false;
const listeners = new Set<() => void>();

export function releaseIntro() {
  if (introReady) return;
  introReady = true;
  listeners.forEach((l) => l());
}

export function isIntroReady() {
  return introReady;
}

export function useIntroReady(): boolean {
  return useSyncExternalStore(subscribe, isIntroReady);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function noop() {}
