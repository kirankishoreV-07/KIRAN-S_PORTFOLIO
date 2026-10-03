import { useLayoutEffect, type RefObject } from 'react';
import { gsap, SplitText, DUR } from './gsap';

/**
 * Declarative reveal vocabulary shared by every scene. Markup opts in with
 * `data-reveal`; nothing is hidden unless motion is on, so content is always
 * readable without JavaScript or under reduced motion.
 *
 *   lines   – lines rise out of a mask (headings, leads)
 *   fade    – soft rise and fade
 *   rule    – hairline draws left to right
 *   clip    – image-style wipe upward
 *   stagger – direct children cascade
 *   count   – numeric text counts up to its value
 *
 * Elements inside `[data-reveal-scope="manual"]` are choreographed by their
 * own section (for example the horizontal work track).
 */
export function useReveals(root: RefObject<HTMLElement | null>, active: boolean) {
  useLayoutEffect(() => {
    const host = root.current;
    if (!active || !host) return;
    const splits: SplitText[] = [];
    const ctx = gsap.context(() => {
      host.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (el.parentElement?.closest('[data-reveal-scope="manual"]')) return;
        revealElement(el, splits);
      });
    }, host);
    return () => {
      splits.forEach((s) => {
        s.kill();
        s.revert();
      });
      ctx.revert();
    };
  }, [root, active]);
}

export function revealElement(el: HTMLElement, splits: SplitText[], override?: gsap.TweenVars) {
  const delay = Number(el.dataset.revealDelay || 0);
  const scrollTrigger: ScrollTrigger.Vars = { trigger: el, start: 'top 88%', once: true };
  const base = { delay, scrollTrigger, ...override };
  switch (el.dataset.reveal) {
    case 'lines': {
      let done = false;
      const split = SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          if (done) return;
          return gsap.from(self.lines, {
            yPercent: 115,
            duration: DUR.reveal,
            stagger: 0.085,
            ease: 'cine',
            ...base,
            onComplete() {
              done = true;
              self.kill();
              self.revert();
            },
          });
        },
      });
      splits.push(split);
      break;
    }
    case 'fade':
      gsap.from(el, { y: 26, autoAlpha: 0, duration: 1, ease: 'cine', ...base });
      break;
    case 'rule':
      gsap.from(el, { scaleX: 0, transformOrigin: '0% 50%', duration: DUR.scene, ease: 'cineInOut', ...base });
      break;
    case 'clip':
      gsap.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: DUR.scene, ease: 'cineInOut', ...base });
      break;
    case 'stagger':
      gsap.from(el.children, { y: 22, autoAlpha: 0, duration: 0.9, stagger: 0.07, ease: 'cine', ...base });
      break;
    case 'count': {
      const target = Number(el.dataset.value ?? el.textContent);
      const decimals = (el.dataset.value ?? el.textContent ?? '').split('.')[1]?.length ?? 0;
      const state = { v: 0 };
      gsap.to(state, {
        v: target,
        duration: 1.6,
        ease: 'cine',
        ...base,
        onStart: () => (el.textContent = (0).toFixed(decimals)),
        onUpdate: () => (el.textContent = state.v.toFixed(decimals)),
      });
      break;
    }
  }
}
