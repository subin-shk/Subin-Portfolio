import type { ReactNode } from "react";

/**
 * The "// ● Label" mark that opens a movement. First used on About's
 * corkboard as a plain label above the photo pile; now every section opens
 * on the same mark instead of a line of narrative copy, so the page reads
 * as one voice rather than a different heading style per movement.
 *
 * Sized well past the regular `.eyebrow` caption (group labels, kickers,
 * footlines) — those stay tiny on purpose, but this one is standing in for
 * a heading and needs to read like one at a glance.
 */
export function SectionTitle({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`eyebrow flex items-center gap-3 !text-[clamp(0.95rem,1.6vw,1.25rem)] !tracking-[0.2em] ${className}`}
    >
      <span className="text-white/20">//</span>
      <span
        aria-hidden
        className="h-2 w-2 shrink-0 rounded-full bg-violet shadow-[0_0_9px_rgba(155,123,255,0.9)]"
      />
      {children}
    </p>
  );
}
