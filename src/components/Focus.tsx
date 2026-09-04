import type { LucideIcon } from "lucide-react";
import { FlaskConical, Gauge, Globe, Search, Smartphone } from "lucide-react";

type Tag = { label: string; icon: LucideIcon; rgb: string };

const RGB = {
  cyan: "95,212,232",
  blue: "77,124,255",
  violet: "155,123,255",
} as const;

const TAGS: Tag[] = [
  { label: "Web Automation", icon: Globe, rgb: RGB.cyan },
  { label: "Mobile Automation", icon: Smartphone, rgb: RGB.blue },
  { label: "Web Scraping", icon: Search, rgb: RGB.violet },
  { label: "API Testing", icon: FlaskConical, rgb: RGB.cyan },
  { label: "Performance Testing", icon: Gauge, rgb: RGB.blue },
];

function Pill({ tag }: { tag: Tag }) {
  const Icon = tag.icon;
  return (
    <span
      className="mx-2 inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[0.92rem] font-medium"
      style={{
        background: `rgba(${tag.rgb},0.12)`,
        color: `rgb(${tag.rgb})`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(${tag.rgb},0.16)`,
      }}
    >
      <Icon size={16} strokeWidth={2} />
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
  const rowA = TAGS;
  const rowB = [...TAGS.slice(2), ...TAGS.slice(0, 2)];

  return (
    <section aria-label="Focus areas" className="relative py-10 sm:py-14">
      <div className="flex flex-col gap-4">
        <Row tags={rowA} direction="left" duration={26} />
        <Row tags={rowB} direction="right" duration={30} />
      </div>
    </section>
  );
}
