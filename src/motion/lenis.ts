import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';

let instance: Lenis | null = null;

export const getLenis = () => instance;

/** Weighted smooth scroll driven by the GSAP ticker so every pin and scrub
 * shares one clock. Off on touch devices and whenever motion is off. */
export function useSmoothScroll(active: boolean) {
  useEffect(() => {
    const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
    if (!active || isTouch) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    instance = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add('lenis');
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
      document.documentElement.classList.remove('lenis');
    };
  }, [active]);
}

let glideUntil = 0;
/** True while a link-triggered glide is running (the header stays put). */
export const isGliding = () => performance.now() < glideUntil;

export function scrollToY(y: number | (() => number), smooth = true) {
  const resolve = () => Math.max(0, Math.round(typeof y === 'function' ? y() : y));
  glideUntil = performance.now() + (smooth ? 1500 : 200);
  // Land on the final position even if layout shifted during the glide.
  const settle = () => {
    const end = resolve();
    if (Math.abs(window.scrollY - end) > 1) {
      if (instance) instance.scrollTo(end, { immediate: true, force: true });
      else window.scrollTo({ top: end, behavior: 'instant' });
    }
  };
  if (instance) instance.scrollTo(resolve(), smooth ? { duration: 1.2, force: true, onComplete: settle } : { immediate: true, force: true });
  else window.scrollTo({ top: resolve(), behavior: 'instant' });
}

export function lockScroll(locked: boolean) {
  if (locked) instance?.stop();
  else instance?.start();
  document.documentElement.classList.toggle('is-locked', locked);
}

/** In-page links glide to their scene. Measured here rather than by Lenis,
 * whose anchor handling lands short of the top; focus follows for keyboard
 * and screen-reader users. */
export function useSceneLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      if (!id || id === 'main' || id.startsWith('case/')) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      // Two frames: lets an open menu close and unlock scrolling first.
      requestAnimationFrame(() => requestAnimationFrame(() =>
        scrollToY(() => (id === 'intro' ? 0 : target.getBoundingClientRect().top + window.scrollY)),
      ));
      if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
