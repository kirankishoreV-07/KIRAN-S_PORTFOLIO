# Kiran Kishore Venkatesan — Portfolio

A cinematic single-page portfolio for an AI developer working on agentic AI,
computer vision and applied machine learning. Built with React, TypeScript and
Vite, with two real-time WebGL film sequences driven by matte-extracted video.

**Live:** deployed on Vercel · **Stack:** React 19 · TypeScript · Vite · Three.js · GSAP

---

## Highlights

- **One take.** The page plays as a single continuous camera move. A fixed
  stage layer is re-lit per scene (registered CSS custom properties), so
  sections never hard-cut: cool key light for the opening, warm for Origins,
  each project's own colour in Selected Work, daylight for the Toolkit and
  Method, tungsten for the finale.
- **Two character films, bookending the story.** Alpha-matted video composited
  in WebGL: Kiran walks in and stands in front of his own title in the hero,
  and adjusts his tie in the closing scene beside the contact details.
- **Scroll choreography** with GSAP ScrollTrigger + Lenis: a pinned chapter
  sequence for education, a pinned horizontal tracking shot through five
  projects, and case studies that expand out of the clicked project frame.
- **One motion vocabulary.** Shared eases and a declarative reveal system
  (`data-reveal="lines|fade|rule|clip|stagger|count"`) instead of per-section
  one-off tweens.
- **Accessible by default.** Keyboard navigation, focus-trapped case files,
  ARIA tab patterns where the chapters are pinned, a visible Motion toggle,
  full `prefers-reduced-motion` support, and reflow at 200% text size.

## Getting started

Requires Node 18+ and npm.

```bash
npm install
npm run dev        # start the dev server (http://127.0.0.1:5173)
npm run build      # type-check and produce the production build in dist/
npm run preview    # preview the production build locally
npm run test       # run the Playwright suite
```

## Deploying to Vercel

The repository is configured for zero-config deployment.

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Vercel detects Vite automatically; the settings are also pinned in
   [`vercel.json`](./vercel.json):
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
3. Deploy. No environment variables are required.

Static assets under `/assets` are served with a long-lived immutable cache header.

## Project structure

```
public/assets/       fonts, logos, résumé and the matte-extracted films
src/
  App.tsx            scene composition, motion state, case-study routing
  data.ts            all portfolio content
  motion/
    gsap.ts          plugin registration and the shared eases
    lenis.ts         smooth scroll on the GSAP ticker, scroll locking
    scenes.ts        running order + the director that re-lights the stage
    reveals.ts       declarative reveal system
  components/
    Hero.tsx         opening shot (name behind the transparent film plate)
    Character.tsx    hero film playback and controls
    alphaStudio.ts   WebGL compositor for the alpha-matted films
    Journey.tsx      pinned chapter sequence
    Work.tsx         pinned horizontal gallery; ProjectVisual.tsx diagrams
    CaseStudy.tsx    expanding case file
    Contact.tsx      finale (tie film), contact and end credits
    ...              header, scene index, loader, toolkit, method
  styles/            tokens, base, stage and one stylesheet per scene
tests/               Playwright coverage for layout, motion, media and a11y
```

## Testing

Playwright drives the suite across desktop, tablet and mobile viewports and
includes axe accessibility audits. Run it against a local server:

```bash
npm run test
```

## License

Personal portfolio. Content and imagery are not licensed for reuse.
