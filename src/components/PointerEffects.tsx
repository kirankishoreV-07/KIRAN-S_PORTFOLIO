import { useEffect, useRef } from 'react';
import { gsap } from '../motion/gsap';

/** Two restrained pointer behaviours, fine pointers only: a label that
 * follows the cursor over elements that declare `data-cursor`, and a gentle
 * magnetic pull on primary calls to action (`.magnetic`). */
export function PointerEffects({ motion }: { motion: boolean }) {
  const label = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = label.current;
    if (!el || !motion || !matchMedia('(pointer: fine)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' });
    let magnet: HTMLElement | null = null;

    const release = () => {
      if (!magnet) return;
      gsap.to(magnet, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: true });
      magnet = null;
    };
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = e.target instanceof Element ? e.target : null;
      const labelled = target?.closest<HTMLElement>('[data-cursor]');
      if (labelled && text.current) {
        text.current.textContent = labelled.dataset.cursor ?? '';
        el.classList.add('is-on');
      } else el.classList.remove('is-on');

      const m = target?.closest<HTMLElement>('.magnetic');
      if (m !== magnet) release();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - (r.left + r.width / 2)) * 0.22, y: (e.clientY - (r.top + r.height / 2)) * 0.3, duration: 0.5, ease: 'power3.out', overwrite: true });
      }
    };
    const leave = () => {
      el.classList.remove('is-on');
      release();
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      release();
    };
  }, [motion]);

  return (
    <div className="cursor-label" ref={label} aria-hidden="true">
      <span ref={text} />
    </div>
  );
}
