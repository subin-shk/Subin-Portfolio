type Tag = { label: string };

const TAGS: Tag[] = [
  { label: "Web Automation" },
  { label: "Mobile Automation" },
  { label: "Web Scraping" },
  { label: "API Testing" },
  { label: "Performance Testing" },
];

/** One infinite row: content rendered twice back to back, animated to
 * exactly -50% so the loop seams invisibly. Reduced-motion users get the
 * page-wide animation freeze already declared in index.css. */
function Row({ tags, duration }: { tags: Tag[]; duration: number }) {
  return (
    <div className="overflow-hidden">
      <div
        className="flex w-max items-center"
        style={{ animation: `marquee-left ${duration}s linear infinite` }}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex w-max shrink-0 items-center"
            aria-hidden={copy === 1}
          >
            {tags.map((tag, i) => (
              <span key={`${copy}-${i}`} className="flex shrink-0 items-center">
                <span className="mx-5 text-pink sm:mx-7">✦</span>
                <span className="whitespace-nowrap text-sm font-bold uppercase tracking-wide text-white sm:text-base">
                  {tag.label}
                </span>
              </span>
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
 * A single dark band sliding one direction, styled after a reference ticker:
 * bold caps, a pink star between each item, one continuous drift.
 */
export default function Focus() {
  // Row (the visual "half" that slides -50%) needs to stay wider than the
  // viewport at any size, or the loop point becomes a visible gap on wide
  // screens — repeating the tag set a few times over guards against that
  // regardless of how wide the browser window gets.
  const REPEATS = 6;
  const row = Array.from({ length: REPEATS }, () => TAGS).flat();

  return (
    <section
      aria-label="Focus areas"
      className="relative overflow-hidden py-4 sm:py-5"
    >
      <Row tags={row} duration={130} />
    </section>
  );
}
