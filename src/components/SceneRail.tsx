import { useEffect, useRef } from 'react';
import { ScrollTrigger } from '../motion/gsap';
import { SCENES, useScene } from '../motion/scenes';

// The page reads as a short film; the timecode maps scroll progress onto a
// nominal runtime at 24 fps, so position feels like playback.
const RUNTIME_S = 204;
const FPS = 24;
const pad = (n: number) => String(n).padStart(2, '0');

function timecode(progress: number) {
  const frames = Math.round(progress * RUNTIME_S * FPS);
  const s = Math.floor(frames / FPS);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frames % FPS)}`;
}

export function SceneRail({ ready }: { ready: boolean }) {
  const scene = useScene();
  const bar = useRef<HTMLSpanElement>(null);
  const tc = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ready) return;
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (bar.current) bar.current.style.transform = `scaleY(${self.progress})`;
        if (tc.current) tc.current.textContent = timecode(self.progress);
      },
    });
    return () => trigger.kill();
  }, [ready]);

  return (
    <nav className="scene-rail" aria-label="Scene index" inert={!ready}>
      <ol>
        {SCENES.map((s, i) => (
          <li key={s.id}>
            <a href={'#' + s.id} aria-current={scene === s.id ? 'step' : undefined}>
              <span className="rail-title"><span className="num">{pad(i + 1)}</span> {s.title}</span>
              <span className="rail-tick" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
      <div className="rail-meter" aria-hidden="true">
        <span className="rail-progress"><span ref={bar} /></span>
        <span className="rail-tc num" ref={tc}>00:00:00:00</span>
      </div>
    </nav>
  );
}
