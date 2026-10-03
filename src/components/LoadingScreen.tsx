import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from '../motion/gsap';

const MIN_MS = 1700;
const MAX_MS = 2600;
const OPEN_MS = 1300;
const NAME = 'Kiran Kishore';
const FRAMES = 9;

// Deterministic scatter so the assembly reads the same on every visit.
const rnd = (n: number) => {
  const v = Math.sin(n * 91.7 + 13.1) * 43758.5453;
  return v - Math.floor(v);
};

/** The slate, staged in depth. The camera pushes through a tunnel of film
 * gates while the letters of the name converge out of 3D space as resources
 * load; then the title flies through the lens, the gates warp past and the
 * letterbox parts onto the opening shot. */
export function LoadingScreen({ motion, onOpening, onComplete }: { motion: boolean; onOpening: () => void; onComplete: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!motion || (location.hash && location.hash !== '#intro')) {
      onOpening();
      onComplete();
      return;
    }
    const el = root.current!;
    let alive = true;
    let done = 0;
    let finished = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const started = performance.now();
    const shown = { value: 0 };
    document.documentElement.classList.add('is-locked');

    const chars = gsap.utils.toArray<HTMLElement>('.slate-char', el);
    const assemble = gsap.timeline({ paused: true });
    chars.forEach((c, i) => {
      assemble.fromTo(c,
        { x: (rnd(i) - 0.5) * 1100, y: (rnd(i + 7) - 0.5) * 620, z: -300 - rnd(i + 3) * 1800, rotateX: (rnd(i + 11) - 0.5) * 220, rotateY: (rnd(i + 5) - 0.5) * 300, rotateZ: (rnd(i + 2) - 0.5) * 90, autoAlpha: 0 },
        { x: 0, y: 0, z: 0, rotateX: 0, rotateY: 0, rotateZ: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' },
        i * 0.045);
    });
    // Idle drift so the assembled title keeps breathing while it waits.
    const drift = gsap.to('.slate-word', { rotateY: 8, rotateX: -4, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    const show = (target: number) => {
      gsap.to(shown, {
        value: target,
        duration: 0.9,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: () => {
          assemble.progress(Math.min(1, shown.value / 88));
          if (count.current) count.current.textContent = String(Math.round(shown.value)).padStart(3, '0');
          if (line.current) line.current.style.transform = `scaleX(${shown.value / 100})`;
        },
      });
    };

    const exit = () => {
      if (!alive) return;
      drift.kill();
      gsap.timeline()
        .to('.slate-word', { z: 1100, rotateX: 0, rotateY: 0, autoAlpha: 0, duration: 1.05, ease: 'power3.in' }, 0)
        .to('.slate-char', { z: () => 200 + Math.random() * 900, duration: 1.05, ease: 'power3.in', stagger: { each: 0.02, from: 'center' } }, 0)
        .to('.slate-tunnel', { scale: 3.2, autoAlpha: 0, duration: 1.15, ease: 'power2.in' }, 0)
        .to('.slate-meta, .slate-tag', { autoAlpha: 0, y: 12, duration: 0.45, ease: 'power2.in' }, 0)
        .fromTo('.slate-streak', { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, 0.5)
        .to('.slate-streak', { autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, 1.0)
        .add(() => {
          if (!alive) return;
          setLeaving(true);
          document.documentElement.classList.remove('is-locked');
          onOpening();
          timers.push(setTimeout(() => alive && onComplete(), OPEN_MS));
        }, 0.55);
    };
    const finish = () => {
      if (!alive || finished) return;
      finished = true;
      show(100);
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
      timers.push(setTimeout(exit, wait + 350));
    };

    const poster = matchMedia('(max-width: 699px)').matches
      ? '/assets/kiran-studio-alpha-mobile-poster.png'
      : '/assets/kiran-studio-alpha-desktop-poster.png';
    const tasks: Promise<unknown>[] = [
      document.fonts.load('400 120px "Instrument Serif"'),
      document.fonts.load('400 16px "Geist Variable"'),
      new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = image.onerror = () => resolve();
        image.src = poster;
      }),
      import('./studio'),
    ];
    show(14);
    tasks.forEach((task) =>
      void task.catch(() => {}).then(() => {
        if (!alive || finished) return;
        done += 1;
        show(14 + (done / tasks.length) * 74);
        if (done === tasks.length) finish();
      }),
    );
    timers.push(setTimeout(finish, MAX_MS));

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      drift.kill();
      gsap.killTweensOf(shown);
      document.documentElement.classList.remove('is-locked');
    };
  }, [motion, onOpening, onComplete]);

  return (
    <div ref={root} className={'loading-screen loader' + (leaving ? ' is-open' : '')} role="status" aria-live="polite" aria-label="Opening Kiran Kishore’s portfolio">
      <div className="loader-bar loader-bar--top" aria-hidden="true" />
      <div className="loader-bar loader-bar--bottom" aria-hidden="true" />
      <div className="slate" aria-hidden="true">
        <div className="slate-tunnel">
          {Array.from({ length: FRAMES }, (_, i) => <span key={i} className="slate-frame" style={{ '--i': i } as CSSProperties} />)}
        </div>
        <div className="slate-word">
          {[...NAME].map((c, i) => (
            <span key={i} className={'slate-char' + (i > 5 ? ' is-em' : '') + (c === ' ' ? ' is-space' : '')}>{c === ' ' ? ' ' : c}</span>
          ))}
        </div>
        <p className="slate-tag">Ideas, <em>in motion.</em></p>
        <div className="slate-meta label">
          <span>Scene 01 — Enter</span>
          <span className="slate-line"><span ref={line} /></span>
          <span className="num"><span ref={count}>000</span></span>
        </div>
        <span className="slate-streak" />
      </div>
    </div>
  );
}
