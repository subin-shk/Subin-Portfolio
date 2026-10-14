import { useCallback, useEffect, useRef, useState } from "react";
import { personalInfo } from "../data/portfolioData";
import { useReducedMotion } from "../lib/motion";
import { isIntroReady, trackLoad, useIntroReady } from "../lib/pageReady";
import type { BadgeScene } from "../lib/badge/BadgeScene";
import IDCardFlat from "./IDCardFlat";
import badgePortrait from "../images/subin-shk-idcard.png";

const ASPECT = 0.64;
/** Same footprint as the flat badge's clip and shadow, so the hero doesn't shift. */
const CLIP_PAD = 12;
const FOOT_PAD = 28;

/** 3D badge on a simulated lanyard; falls back to the flat badge without WebGL. */
export default function IDCard() {
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);
  return failed ? <IDCardFlat /> : <IDCard3D onFail={fail} />;
}

function IDCard3D({ onFail }: { onFail: () => void }) {
  const reduced = useReducedMotion();
  const reducedRef = useRef(reduced);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BadgeScene | null>(null);
  const introReady = useIntroReady();

  useEffect(() => {
    reducedRef.current = reduced;
    sceneRef.current?.setReducedMotion(reduced);
  }, [reduced]);

  useEffect(() => {
    if (introReady) sceneRef.current?.play();
  }, [introReady]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const hitArea = hitRef.current;
    if (!root || !stage || !hitArea) return;

    let scene: BadgeScene | null = null;
    let cancelled = false;
    let resize: ResizeObserver | undefined;
    let onScreen: IntersectionObserver | undefined;

    // The stage covers the whole hero, reaching just past its top edge so the
    // strap runs out of frame.
    const measure = () => {
      if (!scene) return;
      const cardW = root.clientWidth;
      const cardH = cardW / ASPECT;
      const section = root.closest("section");
      const offset = offsetWithin(root, section);
      const width = section?.clientWidth ?? document.documentElement.clientWidth;
      const sectionH = section?.offsetHeight ?? window.innerHeight;
      const top = offset.y + 16;
      const height = Math.max(sectionH + 16, top + CLIP_PAD + cardH + FOOT_PAD);
      Object.assign(stage.style, {
        left: `${-offset.x}px`,
        top: `${-top}px`,
        width: `${width}px`,
        height: `${height}px`,
      });

      scene.setLayout({
        width,
        height,
        cardWidth: cardW,
        cx: offset.x + cardW / 2,
        cy: top + CLIP_PAD + cardH / 2,
      });
    };

    // The loading screen waits on the chunk and the badge's art.
    trackLoad(
      import("../lib/badge/BadgeScene")
        .then(({ BadgeScene }) => {
          if (cancelled) return;
          scene = new BadgeScene({
            host: stage,
            hitArea,
            photo: badgePortrait,
            reducedMotion: reducedRef.current,
            onContextLost: onFail,
          });
          sceneRef.current = scene;
          if (isIntroReady()) scene.play();
          measure();

          resize = new ResizeObserver(measure);
          resize.observe(root);
          const section = root.closest("section");
          if (section) resize.observe(section);
          window.addEventListener("resize", measure);
          onScreen = new IntersectionObserver(([entry]) => scene?.setVisible(entry.isIntersecting));
          onScreen.observe(stage);

          return scene.load();
        })
        .catch(() => {
          if (!cancelled) onFail();
        })
    );

    return () => {
      cancelled = true;
      resize?.disconnect();
      onScreen?.disconnect();
      window.removeEventListener("resize", measure);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [onFail]);

  return (
    <div
      ref={rootRef}
      className="relative mx-auto"
      style={{ width: "clamp(200px, 17vw, 250px)" }}
    >
      <div
        role="img"
        aria-label={`ID badge: ${personalInfo.name}, Software QA Engineer, ID SS-0209`}
        style={{ paddingTop: CLIP_PAD, paddingBottom: FOOT_PAD }}
      >
        <div style={{ aspectRatio: String(ASPECT) }} />
      </div>

      <div ref={stageRef} aria-hidden className="pointer-events-none absolute">
        {/* Clipped to the card's outline each frame, so the rest of the
            hero stays clickable; touch-action: none stops drags scrolling. */}
        <div
          ref={hitRef}
          className="pointer-events-auto absolute inset-0 cursor-grab select-none active:cursor-grabbing"
          style={{ touchAction: "none", clipPath: "polygon(0 0, 0 0, 0 0)" }}
        />
      </div>

    </div>
  );
}

/** Offset inside `ancestor`, ignoring the hero's scroll-driven transforms. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement | null) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node === ancestor) return { x, y };
  const r = el.getBoundingClientRect();
  const a = ancestor?.getBoundingClientRect() ?? { left: 0, top: -window.scrollY };
  return { x: r.left - a.left, y: r.top - a.top };
}
