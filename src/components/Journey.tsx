import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { gsap, ScrollTrigger } from '../motion/gsap';
import { scrollToY } from '../motion/lenis';
import { useReveals } from '../motion/reveals';
import { journey } from '../data';

const CHAPTERS = [
  { numeral: 'I', node: 'Foundation', title: 'The foundation' },
  { numeral: 'II', node: 'Direction', title: 'A new direction' },
  { numeral: 'III', node: 'Engineering AI', title: 'Building what’s next' },
];

/** Scene 02. On large screens the stage pins and scroll plays the three
 * chapters like a slow dolly along the route; elsewhere it is a readable
 * vertical timeline. */
export function Journey({ motion }: { motion: boolean }) {
  const root = useRef<HTMLElement>(null);
  const route = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  useReveals(root, motion);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !motion) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px) and (min-height: 620px)', () => {
      setPinned(true);
      const tween = gsap.fromTo(route.current, { scaleX: 0 }, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          pin: '.journey-stage',
          start: 'top top',
          end: () => '+=' + window.innerHeight * 2.2,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.min(2, Math.floor(self.progress * 3))),
        },
      });
      trigger.current = tween.scrollTrigger ?? null;
      return () => {
        trigger.current = null;
        setPinned(false);
      };
    });
    mm.add('(max-width: 1023px), (max-height: 619px)', () => {
      gsap.fromTo('.journey-spine-fill', { scaleY: 0 }, {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '.journey-cards', start: 'top 70%', end: 'bottom 60%', scrub: true },
      });
    });
    return () => mm.revert();
  }, [motion]);

  const select = (i: number, smooth = true) => {
    setActive(i);
    const t = trigger.current;
    if (t) scrollToY(t.start + (t.end - t.start) * ((i + 0.5) / 3), smooth);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = (active + (e.key === 'ArrowRight' ? 1 : 2)) % 3;
    select(i, false);
    root.current?.querySelectorAll<HTMLButtonElement>('.journey-node')[i]?.focus();
  };

  return (
    <section id="journey" ref={root} className="journey scene" data-pinned={pinned}>
      <div className="journey-stage wrap">
        <div className="scene-slate">
          <p className="label"><span>02</span>Origins</p>
          <p className="label">Erode → Coimbatore</p>
        </div>

        <div className="journey-grid">
          <div className="journey-intro">
            <p className="label journey-eyebrow">Every idea has an origin</p>
            <h2 className="title" data-reveal="lines">Curiosity. <em>In motion.</em></h2>
            <p className="lead" data-reveal="fade">A few places. A changing perspective. One constant: the urge to understand.</p>
          </div>

          <div className="journey-chapters">
            <div className="journey-numeral" aria-hidden="true">
              <span className="journey-numeral-track" style={{ '--i': active } as CSSProperties}>
                {CHAPTERS.map((c) => <span key={c.numeral}>{c.numeral}</span>)}
              </span>
            </div>
            <div className="journey-cards">
              <span className="journey-spine" aria-hidden="true"><span className="journey-spine-fill" /></span>
              {journey.map((stop, i) => (
                <article
                  key={stop.id}
                  id={'journey-card-' + stop.id}
                  className={'journey-card' + (active === i ? ' is-active' : '')}
                  role={pinned ? 'tabpanel' : undefined}
                  aria-labelledby={pinned ? 'tab-' + stop.id : undefined}
                  inert={pinned && active !== i}
                  aria-hidden={pinned && active !== i ? true : undefined}
                >
                  <span className="journey-card-numeral serif" aria-hidden="true">{CHAPTERS[i].numeral}</span>
                  <p className="label journey-card-kicker" style={{ '--d': 0 } as CSSProperties}>
                    {CHAPTERS[i].title} <span aria-hidden="true">·</span> <b>{stop.period}</b>
                  </p>
                  <h3 className="journey-place" style={{ '--d': 1 } as CSSProperties}>{stop.place}</h3>
                  <p className="body-copy" style={{ '--d': 2 } as CSSProperties}>{stop.body}</p>
                  {stop.id === 'amrita' && (
                    <p className="journey-stat" style={{ '--d': 3 } as CSSProperties}>
                      <span className="journey-stat-value serif" data-reveal="count" data-value="8.06">8.06</span>
                      <span className="label">CGPA · currently pursuing</span>
                    </p>
                  )}
                  <div className="tag-list" style={{ '--d': 4 } as CSSProperties}>
                    {stop.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="journey-route">
          <span className="journey-route-track" aria-hidden="true"><span ref={route} className="journey-route-fill" /></span>
          <div className="journey-nodes" role={pinned ? 'tablist' : undefined} aria-label="Education timeline" onKeyDown={onKey}>
            {journey.map((stop, i) => (
              <button
                key={stop.id}
                id={'tab-' + stop.id}
                className={'journey-node' + (active >= i ? ' is-reached' : '') + (active === i ? ' is-active' : '')}
                style={{ '--x': `${((i + 0.5) / 3) * 100}%` } as CSSProperties}
                role={pinned ? 'tab' : undefined}
                aria-selected={pinned ? active === i : undefined}
                aria-controls={'journey-card-' + stop.id}
                tabIndex={pinned && active !== i ? -1 : 0}
                onClick={() => select(i)}
              >
                <span className="journey-node-dot" aria-hidden="true" />
                <span className="num">0{i + 1}</span>
                <span>{CHAPTERS[i].node}</span>
              </button>
            ))}
          </div>
          <p className="label journey-route-foot"><span>Scroll through the chapters</span><span className="num">0{active + 1} / 03</span></p>
        </div>
      </div>
    </section>
  );
}
