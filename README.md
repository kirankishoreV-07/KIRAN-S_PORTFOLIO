# Kiran Kishore Venkatesan — Portfolio

A cinematic single-page portfolio for an AI developer working on agentic AI,
computer vision and applied machine learning. Built with React, TypeScript and
Vite, with two real-time WebGL film sequences driven by matte-extracted video.

**Live:** deployed on Vercel · **Stack:** React 19 · TypeScript · Vite · Three.js · GSAP

---

## Highlights

- **Two cinematic character films** rendered in WebGL. A walk-in introduction in
  the hero and a tie-adjust sequence in the experience section, both composited
  from alpha-matted video against a real-time studio environment (lighting,
  floor, particles) rather than a flat video element.
- **Scroll choreography** with GSAP ScrollTrigger: a pinned education timeline,
  a bounded horizontal project gallery, and staggered section reveals.
- **Accessible by default.** Full keyboard navigation, ARIA tab/dialog patterns,
  a visible motion toggle, and complete `prefers-reduced-motion` fallbacks that
  collapse every animation to a still, usable state.
- **Resilient rendering.** If WebGL fails or the context is lost, the original
  video and an SVG poster take over without blocking any content.

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
public/
  assets/            fonts, logos, and the matte-extracted film sources
  favicon.svg
src/
  App.tsx            page shell, section composition, motion setup
  main.tsx           entry point and stylesheet imports
  data.ts            all portfolio content (journey, work, toolkit, contact)
  components/
    Character.tsx    hero film orchestration
    TieAdjust.tsx    experience film orchestration
    alphaStudio.ts   WebGL renderer for the alpha-matted character films
    world.ts         WebGL renderer for the journey and work scenes
    Journey.tsx      pinned education timeline
    Work.tsx         bounded horizontal project gallery
    ...              remaining sections and UI
  *.css              layered stylesheets (site, sections, editorial, polish)
tests/               Playwright coverage for layout, motion and accessibility
```

## Testing

Playwright drives the suite across desktop, tablet and mobile viewports and
includes axe accessibility audits. Run it against a local server:

```bash
npm run test
```

## License

Personal portfolio. Content and imagery are not licensed for reuse.
