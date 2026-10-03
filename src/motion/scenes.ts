import { useLayoutEffect, useSyncExternalStore } from 'react';
import { ScrollTrigger } from './gsap';

export type Scene = { id: string; title: string; tone: 'dark' | 'light'; at?: string };

// The running order of the film. Each id is a section on the page; the stage
// lighting, header tone and scene index all follow whichever one is on camera.
export const SCENES: Scene[] = [
  { id: 'intro', title: 'Enter', tone: 'dark' },
  { id: 'journey', title: 'Origins', tone: 'dark' },
  { id: 'experience', title: 'Practice', tone: 'dark' },
  { id: 'work', title: 'Selected work', tone: 'dark' },
  // The lights come up late, once the marquee has carried the eye past the
  // last project frame.
  { id: 'toolkit', title: 'Toolkit', tone: 'light', at: 'top 22%' },
  { id: 'interests', title: 'Method', tone: 'light' },
  { id: 'contact', title: 'Ready', tone: 'dark' },
];

let current = 'intro';
const listeners = new Set<() => void>();

function apply(id: string) {
  const root = document.documentElement;
  root.dataset.scene = id;
  root.dataset.tone = SCENES.find((s) => s.id === id)?.tone ?? 'dark';
}

export const sceneStore = {
  get: () => current,
  set(id: string) {
    if (id === current) return;
    current = id;
    apply(id);
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useScene = () => useSyncExternalStore(sceneStore.subscribe, sceneStore.get, sceneStore.get);

/** One continuous take: instead of hard section boundaries, the scene on
 * camera re-lights the fixed stage. Rebuilt whenever motion changes, because
 * that re-creates the section pins these positions depend on. */
export function useSceneDirector(ready: boolean, motion: boolean) {
  useLayoutEffect(() => {
    apply(current);
    if (!ready) return;
    const triggers = SCENES.map(({ id, at }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: at ?? 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && sceneStore.set(id),
      });
    });
    // Refresh in document order so pins higher up are measured first.
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => triggers.forEach((t) => t?.kill());
  }, [ready, motion]);
}
