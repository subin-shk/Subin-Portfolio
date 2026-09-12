/**
 * Ink for the About scrapbook.
 *
 * Everything here is decoration — each piece is `aria-hidden` and carries no
 * meaning the surrounding copy doesn't already state. Strokes are drawn with
 * `currentColor` so the caller picks the ink with a text colour, and every
 * viewBox is authored square-ish then scaled by the parent's width, which is
 * what keeps the marker weight looking hand-held rather than hairline-thin at
 * large sizes.
 */

type Props = { className?: string };

const pen = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Long swash under the name — one stroke, lifted at the tail. */
export function Swash({ className = "" }: Props) {
  return (
    <svg aria-hidden viewBox="0 0 240 22" className={className}>
      <path
        {...pen}
        strokeWidth={3.4}
        d="M6 15C52 4 128 2 186 8c14 1.4 26 3.6 34 6.6"
      />
      <path {...pen} strokeWidth={2.6} d="M198 18c12-3 24-4.6 36-4.6" />
    </svg>
  );
}

/**
 * Torn strip of tape.
 *
 * Neutral grey rather than white: the same strip has to read over the
 * polaroid's white border *and* over the near-black sticky note, so it
 * darkens one and lightens the other instead of vanishing into either.
 */
export function Tape({ className = "" }: Props) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none block h-[1.05rem] w-[3.6rem] ${className}`}
      style={{
        background:
          "linear-gradient(150deg, rgba(146,156,172,0.4), rgba(146,156,172,0.26) 55%, rgba(146,156,172,0.36))",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
        /* Ragged on the two torn ends, clean along the pulled edges. */
        clipPath:
          "polygon(4% 0%, 96% 3%, 100% 26%, 97% 54%, 100% 96%, 6% 100%, 2% 68%, 5% 38%, 0% 12%)",
      }}
    />
  );
}
