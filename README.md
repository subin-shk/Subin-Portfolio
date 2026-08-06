# Subin Shakya — Portfolio

An immersive single-page portfolio built as one continuous scroll: no section
headings, no dividers. Each movement opens on a narrative line that picks up
the sentence the last one left hanging, over a single fixed backdrop.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/  (Cloudflare Pages: see cloudflare-pages.yaml)
npm run lint
```

## Before you publish

Two things need your input:

**1. Your CV.** Drop it at `public/Subin-Shakya-Resume.pdf`, then flip
`hasResume: true` in `src/data/portfolioData.ts`. The hero button becomes a
real download. Until then it falls back to a "Request Resume" mailto — the
only PDFs in the repo were test invoices, so nothing was staged.

**2. The contact form.** Copy `.env.example` to `.env.local` and fill in your

[EmailJS](https://dashboard.emailjs.com) ids. Until then the form tells
visitors to email directly rather than showing a success state for a message
that went nowhere. Lock the key down under EmailJS → Account → Security →
Allowed origins.

## Worth a second look

`src/data/portfolioData.ts` is the single source of content. A few figures
there are estimates rather than records:

- `stats.years` runs from the Chulo Solutions start date (Feb 2025).
- Project `year` values are estimates; the source data carried no dates.
- Each project's `challenge` / `solution` / `impact` was drafted from the
  original one-line descriptions. They're accurate in kind but deliberately
  unquantified — add real numbers where you have them.

Projects are split two ways. `featuredProjects` get a full screen each and
carry a `strand` of `automation` or `build`; the first `build` entry is
automatically preceded by an interstitial beat, so the shift from testing
systems to having built them reads as a turn in the story. Everything in
`archiveProjects` renders as the quiet strip underneath.

## How it's put together

| Concern | Where |
| --- | --- |
| Design tokens, glass surfaces, keyframes | `src/index.css` |
| Backdrop: gradient mesh, dust, cursor bloom | `components/Atmosphere.tsx` |
| Pointer replacement | `components/Orb.tsx` |
| Lenis + GSAP ScrollTrigger on one clock | `lib/useSmoothScroll.ts` |
| Reveals, easing, media queries | `lib/motion.ts` |
| Hero portrait background removal | `lib/keyBackground.ts` |
| Reusable surfaces | `components/ui/` |

**The hero portrait** is a cutout on black. `mix-blend-mode` can't reach
across stacking contexts to drop that black out, so `keyBackground.ts` floods
inward from the frame edges and clears only black *connected to the border* —
interior darks (hair, suit) survive. If the fill ever swallows more than 85%
of the image it bails and renders the original untouched.

**Motion.** Every ambient loop, parallax and reveal is gated on
`prefers-reduced-motion`; under it Lenis is never installed and native scroll
takes over. Note that Framer Motion writes its own `transform`, so anything it
animates cannot also rely on a Tailwind `-translate-x-1/2` — centre with flex
or Framer's own `x` instead.

**Images.** Keep them small; there's no build-time image pipeline. The story
portrait was re-encoded to WebP by hand (661 KB → 50 KB).

**Things that are expensive here, so change them carefully.** Scroll
smoothness on this page is dominated by a short list:

- `filter: blur()` on viewport-sized elements. The gradient mesh in
  `Atmosphere.tsx` deliberately has none — multi-stop radial gradients are
  already smooth, and blurring 68vmax of pixels every drift frame was the
  single worst cost on the page.
- Wide-radius `box-shadow` on anything that moves. The project panels scale
  through their whole scroll, so their shadows re-rasterise every frame;
  radii are kept under ~50px for that reason.
- `backdrop-filter` radius, currently 16px on `.glass`.
- Writing CSS custom properties on `:root` per frame — it invalidates style
  for everything that inherits them. The cursor bloom uses `transform`.

Blur is also kept off anything you might be reading: reveals resolve at 7px,
and the hero and project panels only start blurring once they are already
past ~50% and ~65% faded respectively.
