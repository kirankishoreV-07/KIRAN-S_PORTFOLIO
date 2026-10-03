import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { gsap } from '../motion/gsap';
import { Character, type CharacterAssets } from './Character';
import { IconArrowDown, IconArrowUpRight } from './icons';

const characterAssets: CharacterAssets = {
  entrance: '/assets/kiran-studio-desktop.mp4',
  mobile: '/assets/kiran-studio-mobile.mp4',
  foldedPoster: '/assets/kiran-studio-poster.jpg',
  mobilePoster: '/assets/kiran-studio-poster-mobile.jpg',
};
const roles = ['AI Developer', 'Generative AI Developer', 'Computer Vision Engineer', 'Backend & Cloud Developer'];

// Projector dust at three depths: behind the title, around the figure, and
// out of focus in front of the lens.
const DUST = Array.from({ length: 34 }, (_, i) => {
  const r = (n: number) => { const v = Math.sin((i + 1) * n) * 43758.5453; return v - Math.floor(v); };
  return { x: r(12.9) * 100, y: r(78.2) * 100, s: 1 + r(37.7) * 3, d: 7 + r(5.3) * 9, layer: i % 3 };
});

// Letters animate individually; assistive tech gets the whole word.
const Letters = ({ text }: { text: string }) => (
  <>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true">{[...text].map((c, i) => <span key={i} className="hero-char">{c}</span>)}</span>
  </>
);

/** Scene 01. The name is set behind the transparent film plate, so Kiran
 * walks in and stands in front of his own title. The opening is a crane shot:
 * every layer starts at its own depth and settles, the title's letters stand
 * up in 3D, a flare crosses the lens, and the settled frame keeps reacting to
 * the pointer with real parallax. */
export function Hero({ motion, ready, opening }: { motion: boolean; ready: boolean; opening: boolean }) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !motion || !ready) return;
    const fine = matchMedia('(pointer: fine)').matches;
    let detach = () => {};

    const ctx = gsap.context(() => {
      const parallax = () => {
        if (!fine) return;
        const layers = [
          { sel: '.hero-title', x: -26, y: -14, ry: 5, rx: -3 },
          { sel: '.hero-fore', x: 18, y: 10, ry: -2, rx: 1.5 },
          { sel: '.hero-dust--far', x: -14, y: -8 },
          { sel: '.hero-dust--mid', x: 22, y: 12 },
          { sel: '.hero-dust--near', x: 60, y: 32 },
        ].map((l) => ({
          ...l,
          toX: gsap.quickTo(l.sel, 'x', { duration: 1.1, ease: 'power3' }),
          toY: gsap.quickTo(l.sel, 'y', { duration: 1.1, ease: 'power3' }),
          toRY: l.ry ? gsap.quickTo(l.sel, 'rotationY', { duration: 1.2, ease: 'power3' }) : null,
          toRX: l.rx ? gsap.quickTo(l.sel, 'rotationX', { duration: 1.2, ease: 'power3' }) : null,
        }));
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < 0) return;
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach((l) => {
            l.toX(px * l.x); l.toY(py * l.y);
            l.toRY?.(px * (l.ry ?? 0)); l.toRX?.(py * (l.rx ?? 0));
          });
        };
        const leave = () => layers.forEach((l) => { l.toX(0); l.toY(0); l.toRY?.(0); l.toRX?.(0); });
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        detach = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
      };

      gsap.set('.hero-title, .hero-fore', { transformPerspective: 1400 });
      if (opening) {
        gsap.timeline({ defaults: { ease: 'cine' }, onComplete: parallax })
          // Crane: each layer arrives from its own depth, so the frame has volume.
          .from('.hero-title', { z: -520, rotationX: 14, y: 70, duration: 2.4 }, 0)
          .from('.hero-hello', { y: 26, autoAlpha: 0, duration: 1 }, 0.25)
          .from('.hero-char', {
            rotationX: -100, yPercent: 60, z: -160, autoAlpha: 0, transformOrigin: '50% 100% -40px',
            transformPerspective: 900, duration: 1.5, stagger: { each: 0.055, from: 'start' },
          }, 0.15)
          .fromTo('.hero-flare', { xPercent: -120, autoAlpha: 0 }, { xPercent: 120, autoAlpha: 1, duration: 1.9, ease: 'power2.inOut' }, 0.35)
          .to('.hero-flare', { autoAlpha: 0, duration: 0.6, ease: 'power1.out' }, 1.75)
          .from('.hero-dust', { autoAlpha: 0, duration: 2.2, stagger: 0.25, ease: 'power1.out' }, 0.6)
          .from('[data-hero-in]', { z: 120, rotationX: -18, y: 40, transformOrigin: '0% 100%', autoAlpha: 0, transformPerspective: 1000, duration: 1.3, stagger: 0.1 }, 1.0)
          .from('.hero-roles li, .hero-status-inner', { y: 18, autoAlpha: 0, duration: 0.9, stagger: 0.06 }, 1.45);
      } else {
        parallax();
      }

      // Leaving the opening shot: the title drifts up faster than the figure,
      // the figure dollies back, and the foreground copy clears first.
      const leave = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-title', { yPercent: -22, ease: 'none', scrollTrigger: leave });
      // The figure is drawn on the canvas, so fading the stage element only
      // clears its film controls; the figure itself keeps dollying back.
      gsap.to('.hero-stage', { yPercent: 9, scale: 0.93, autoAlpha: 0, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: leave });
      gsap.to('.hero-fore, .hero-roles, .hero-status', {
        yPercent: -40,
        autoAlpha: 0,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: '55% top', scrub: true },
      });
    }, el);
    return () => {
      detach();
      ctx.revert();
    };
  }, [motion, ready, opening]);

  return (
    <section id="intro" ref={root} className="hero" data-ready={ready}>
      <div className="hero-dust hero-dust--far" aria-hidden="true">
        {DUST.filter((d) => d.layer === 0).map((d, i) => <i key={i} style={{ '--x': d.x + '%', '--y': d.y + '%', '--s': d.s + 'px', '--d': d.d + 's' } as CSSProperties} />)}
      </div>

      <h1 className="hero-title">
        <span className="hero-hello">Hi, I’m</span>{' '}
        <span className="hero-name" translate="no">
          <span className="hero-name-line"><span className="hero-name-inner"><Letters text="Kiran" /></span></span>{' '}
          <span className="hero-name-line hero-name-line--b"><span className="hero-name-inner"><em><Letters text="Kishore" /></em></span></span>
        </span>
      </h1>

      <div className="hero-dust hero-dust--mid" aria-hidden="true">
        {DUST.filter((d) => d.layer === 1).map((d, i) => <i key={i} style={{ '--x': d.x + '%', '--y': d.y + '%', '--s': d.s + 'px', '--d': d.d + 's' } as CSSProperties} />)}
      </div>

      <div className="hero-stage">
        <Character motion={motion} assets={characterAssets} ready={ready} />
      </div>

      <div className="hero-dust hero-dust--near" aria-hidden="true">
        {DUST.filter((d) => d.layer === 2).map((d, i) => <i key={i} style={{ '--x': d.x + '%', '--y': d.y + '%', '--s': d.s * 2.4 + 'px', '--d': d.d + 's' } as CSSProperties} />)}
      </div>
      <span className="hero-flare" aria-hidden="true" />

      <div className="hero-fore">
        <p className="hero-tagline" data-hero-in>
          Turning complex problems <em>into working software.</em>
        </p>
        <div className="hero-actions" data-hero-in>
          <a className="btn primary-button magnetic" href="#work">View selected work <IconArrowUpRight /></a>
          <a className="link-line resume-link" href="/assets/kiran-resume.pdf" download>Download Resume <IconArrowDown /></a>
        </div>
      </div>

      <ul className="hero-roles" aria-label="Professional focus">
        {roles.map((role, i) => (
          <li key={role}><span className="num" aria-hidden="true">0{i + 1}</span>{role}</li>
        ))}
      </ul>

      <p className="hero-status label">
        <span className="hero-status-inner">
          <span className="status-dot" aria-hidden="true" />Kiran Kishore Venkatesan <span aria-hidden="true">·</span> <b>Coimbatore, India</b>
        </span>
      </p>
    </section>
  );
}
