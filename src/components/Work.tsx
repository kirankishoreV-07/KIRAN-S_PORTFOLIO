import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, ScrollTrigger } from '../motion/gsap';
import { scrollToY } from '../motion/lenis';
import { useReveals } from '../motion/reveals';
import { projects, type Project } from '../data';
import { ProjectVisual } from './ProjectVisual';
import { IconArrowUpRight } from './icons';

const last = projects.length - 1;

/** Scene 04. On large screens the stage pins and vertical scroll becomes a
 * lateral tracking shot past five projects; the stage light takes on the
 * colour of whichever project is in frame. */
export function Work({ motion, onOpen }: { motion: boolean; onOpen: (p: Project, origin: HTMLElement | null) => void }) {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const selected = useRef(-1);
  const [active, setActive] = useState(0);
  useReveals(root, motion);

  useLayoutEffect(() => {
    const el = root.current!;
    const rail = track.current!;
    const cards = gsap.utils.toArray<HTMLElement>('.project-card', el);
    const select = (i: number) => {
      if (selected.current === i) return;
      selected.current = i;
      setActive(i);
      document.documentElement.style.setProperty('--tint', projects[i].color);
    };
    select(0);

    const mm = gsap.matchMedia();
    if (motion) {
      mm.add('(min-width: 1024px) and (min-height: 620px)', () => {
        el.classList.add('is-horizontal');
        // Measured card to card so every project lands on the same mark.
        const distance = () => cards[last].offsetLeft - cards[0].offsetLeft;
        const frames = cards.map((c) => c.querySelector<HTMLElement>('.project-frame'));
        const media = cards.map((c) => c.querySelector<HTMLElement>('.pv-media'));
        const copies = cards.map((c) => c.querySelector<HTMLElement>('.project-copy'));
        const tween = gsap.to(rail, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            pin: '.work-stage',
            start: 'top top',
            end: () => '+=' + distance() * 1.15,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const position = self.progress * last;
              select(Math.round(position));
              if (bar.current) bar.current.style.transform = `scaleX(${(position + 1) / projects.length})`;
              cards.forEach((_, i) => {
                const d = gsap.utils.clamp(-1, 1, i - position);
                gsap.set(frames[i], { scale: 1 - Math.abs(d) * 0.07, rotationY: d * -6, transformPerspective: 1600 });
                gsap.set(media[i], { xPercent: d * 7 });
                gsap.set(copies[i], { autoAlpha: 1 - Math.abs(d) * 0.72, x: d * 60 });
              });
            },
          },
        });
        trigger.current = tween.scrollTrigger ?? null;
        return () => {
          trigger.current = null;
          el.classList.remove('is-horizontal');
        };
      });
      mm.add('(max-width: 1023px), (max-height: 619px)', () => {
        cards.forEach((card) => {
          gsap.fromTo(card.querySelector('.project-frame'),
            { clipPath: 'inset(14% 10% 14% 10% round 28px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 16px)', ease: 'none', scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 40%', scrub: true } });
          gsap.from(card.querySelector('.project-copy'), { y: 34, autoAlpha: 0, duration: 1, ease: 'cine', scrollTrigger: { trigger: card.querySelector('.project-copy'), start: 'top 88%', once: true } });
        });
      });
    }

    const observer = new IntersectionObserver((entries) => {
      if (trigger.current) return;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = cards.indexOf(entry.target as HTMLElement);
        select(i);
        if (bar.current) bar.current.style.transform = `scaleX(${(i + 1) / projects.length})`;
      });
    }, { rootMargin: '-35% 0px -45% 0px' });
    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      mm.revert();
    };
  }, [motion]);

  const go = (i: number, smooth = true) => {
    const t = trigger.current;
    if (t) scrollToY(t.start + (t.end - t.start) * (i / last), smooth);
    else document.getElementById(projects[i].id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  };
  const open = (p: Project, from: Element) => onOpen(p, from.closest('.project-card')?.querySelector<HTMLElement>('.project-frame') ?? null);

  return (
    <section id="work" ref={root} className="work scene" aria-labelledby="work-title">
      <div className="work-stage">
        <div className="wrap work-head">
          <div className="scene-slate">
            <p className="label"><span>04</span>Selected work</p>
            <p className="label">Five ideas. Real systems.</p>
          </div>
          <div className="work-titlebar">
            <h2 id="work-title" className="title" data-reveal="lines">Ideas. <em>In the real world.</em></h2>
            <p className="lead" data-reveal="fade">Five projects. Different challenges. Built with curiosity. Made with purpose.</p>
          </div>
          <nav className="project-nav" aria-label="Choose a project">
            {projects.map((p, i) => (
              <button key={p.id} onClick={() => go(i)} aria-label={'Show ' + p.title} aria-current={active === i ? 'true' : undefined}>
                <span className="num">0{i + 1}</span><span>{p.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="work-window">
          <div className="project-track" ref={track} data-reveal-scope="manual">
            {projects.map((p, i) => (
              <article
                className={'project-card' + (active === i ? ' is-active' : '')}
                id={p.id}
                key={p.id}
                style={{ '--project-color': p.color } as CSSProperties}
                onFocusCapture={() => { if (trigger.current && active !== i) go(i, false); }}
              >
                <div className="project-frame" data-cursor="Open case study" onClick={(e) => open(p, e.currentTarget)}>
                  <ProjectVisual project={p} />
                </div>
                <div className="project-copy">
                  <p className="project-index num">0{i + 1} <span>/ 0{projects.length}</span></p>
                  <p className="label project-category">{p.category}</p>
                  <h3 className="project-title" translate="no">{p.title}</h3>
                  <p className="project-summary">{p.summary}</p>
                  <div className="tag-list">{p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                  {p.id === 'sign-language' && (
                    <p className="metric-note"><strong className="serif">94.44%</strong> repository-reported validation · 17/18 clips · six classes</p>
                  )}
                  <div className="project-actions">
                    <button className="btn magnetic" onClick={(e) => open(p, e.currentTarget)}>Explore case study <IconArrowUpRight /></button>
                    <a className="link-line" href={p.links[0].url} target="_blank" rel="noreferrer" aria-label={'View ' + p.title + ' source'}>Source <IconArrowUpRight /></a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="wrap work-foot">
          <span className="label">Scroll to explore</span>
          <span className="work-progress" aria-hidden="true"><span ref={bar} /></span>
          <span className="label num">0{active + 1} / 0{projects.length}</span>
        </div>
      </div>
    </section>
  );
}
