import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../motion/gsap';

/** A slow typographic band that surges with scroll velocity, used
 * once, as the transition beat where the lights come up. Decorative only. */
export function Marquee({ items, motion }: { items: string[]; motion: boolean }) {
  const row = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = row.current;
    if (!el || !motion) return;
    const loop = gsap.to(el, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 });
    const idle = gsap.to(loop, { timeScale: 1, duration: 0.6, paused: true });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      onUpdate: (self) => {
        loop.timeScale(1 + gsap.utils.clamp(0, 8, Math.abs(self.getVelocity()) / 260));
        idle.invalidate().restart();
      },
    });
    return () => {
      trigger.kill();
      idle.kill();
      loop.kill();
      gsap.set(el, { clearProps: 'transform' });
    };
  }, [motion]);

  const run = items.map((item) => (
    <span key={item} className="marquee-item">{item}<i aria-hidden="true" /></span>
  ));
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-row" ref={row}>{run}{run}</div>
    </div>
  );
}
