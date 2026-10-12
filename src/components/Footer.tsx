import { useEffect, useRef, useState } from "react";
import { personalInfo } from "../data/portfolioData";
import SliceBlade from "./originkit/slice-blade";

const LIVES = 3;

/** Its animation loop never pauses, so only mount it while it's near view. */
function useNearViewport<T extends Element>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, near] as const;
}

export default function Footer() {
  const [gameRef, nearGame] = useNearViewport<HTMLDivElement>();
  const [stats, setStats] = useState({ score: 0, lives: LIVES });

  return (
    <footer className="relative pb-28 pt-10 sm:pb-32">
      <div className="shell">
        <div className="rule" />
        <div className="mt-7 flex justify-center text-center">
          <p className="whisper !text-[0.75rem]">
            © {new Date().getFullYear()} {personalInfo.name} · {personalInfo.location}
          </p>
        </div>

        {/* mix-blend-screen makes the game's black background see-through
            (it clears each frame with that colour, so it can't be made
            transparent itself). */}
        <div
          ref={gameRef}
          className="relative mt-8 h-[40svh] max-h-[340px] min-h-[240px] w-full overflow-hidden border-b border-white/10 mix-blend-screen sm:mt-10 sm:h-[min(48vh,440px)] sm:max-h-none"
        >
          {/* The component ships with a 1200×800 minimum from its preview frame. */}
          {nearGame && (
            <SliceBlade
              lives={LIVES}
              speed={34}
              style={{ minWidth: 0, minHeight: 0 }}
              onStats={(score, lives) => setStats({ score, lives })}
            />
          )}
          <div className="pointer-events-none absolute right-0 top-3 text-right font-mono text-[0.7rem] text-white/60 sm:top-4">
            <p aria-live="polite" className="tabular-nums">
              Score <span className="text-white">{stats.score}</span>
            </p>
            <p className="mt-1" aria-label={`${stats.lives} of ${LIVES} lives left`}>
              {Array.from({ length: LIVES }, (_, i) => (
                <span key={i} className={i < stats.lives ? "text-[#ff4d5e]" : "text-white/20"}>
                  ♥
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* Short and input-agnostic when narrow; wider screens name the input. */}
        <p className="mt-3 text-center text-[0.68rem] text-[var(--faint)] sm:text-right">
          <span className="sm:hidden">Slice the letters · Dodge the red bombs</span>
          <span className="hidden sm:inline sm:[@media(pointer:coarse)]:hidden">
            Sweep your cursor to slice · Dodge the red bombs
          </span>
          <span className="hidden sm:[@media(pointer:coarse)]:inline">
            Swipe to slice · Dodge the red bombs
          </span>
        </p>
      </div>
    </footer>
  );
}
