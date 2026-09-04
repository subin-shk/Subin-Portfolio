import type { LucideIcon } from "lucide-react";
import { FlaskConical, Gauge, Globe, Search, Smartphone } from "lucide-react";

type Tag = { label: string; icon: LucideIcon };

const TAGS: Tag[] = [
  { label: "Web Automation", icon: Globe },
  { label: "Mobile Automation", icon: Smartphone },
  { label: "Web Scraping", icon: Search },
  { label: "API Testing", icon: FlaskConical },
  { label: "Performance Testing", icon: Gauge },
];

/** One neutral glass treatment for every pill — a single quiet cyan touch
 * on the icon is the only color, instead of cycling through the full
 * accent palette per tag, which read as too busy/rainbow-ish. */
function Pill({ tag }: { tag: Tag }) {
  const Icon = tag.icon;
  return (
    <span className="glass edge mx-2.5 inline-flex shrink-0 items-center gap-2.5 rounded-xl px-7 py-3.5 text-[1.15rem] font-medium text-white/85 sm:text-[1.3rem]">
      <Icon size={20} strokeWidth={1.8} className="text-cyan/80" />
      {tag.label}
    </span>
  );
}

/** One infinite row: content rendered twice back to back, animated to
 * exactly -50% so the loop seams invisibly. Reduced-motion users get the
 * page-wide animation freeze already declared in index.css. */
function Row({
  tags,
  direction,
  duration,
}: {
  tags: Tag[];
  direction: "left" | "right";
  duration: number;
}) {
  return (
    <div className="fade-x overflow-hidden">
      <div
        className="flex w-max"
        style={{
          animation: `marquee-${direction} ${duration}s linear infinite`,
        }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex w-max shrink-0" aria-hidden={copy === 1}>
            {tags.map((tag, i) => (
              <Pill key={`${copy}-${i}`} tag={tag} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * A quick, scannable strip of what the work actually covers — sits right
 * after the hero, before the narrative sections slow down and explain it.
 * Two rows drifting in opposite directions read as one calm texture
 * rather than two separate tickers.
 */
export default function Focus() {
  // Row (the visual "half" that slides -50%) needs to stay wider than the
  // viewport at any size, or the loop point becomes a visible gap on wide
  // screens — repeating the 5-tag set a few times over guards against that
  // regardless of how wide the browser window gets.
  const REPEATS = 4;
  const rowA = Array.from({ length: REPEATS }, () => TAGS).flat();
  const shifted = [...TAGS.slice(2), ...TAGS.slice(0, 2)];
  const rowB = Array.from({ length: REPEATS }, () => shifted).flat();

  return (
    <section aria-label="Focus areas" className="relative py-10 sm:py-14">
      <div className="flex flex-col gap-4">
        <Row tags={rowA} direction="left" duration={190} />
        <Row tags={rowB} direction="right" duration={215} />
      </div>
    </section>
  );
}
