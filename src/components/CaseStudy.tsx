import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from '../motion/gsap';
import { lockScroll } from '../motion/lenis';
import { ProjectMedia } from './ProjectMedia';
import { IconArrowRight, IconArrowUpRight, IconClose } from './icons';
import { projects, type Project } from '../data';

type Props = {
  project: Project | null;
  origin: HTMLElement | null;
  motion: boolean;
  onClose: () => void;
  onNavigate: (p: Project) => void;
};

const inset = (r: DOMRect) =>
  `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round 16px)`;

/** The case file. It grows out of the project frame that was clicked, so the
 * cut from gallery to detail reads as one continuous camera move. */
export function CaseStudy({ project, origin, motion, onClose, onNavigate }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!project) return;
    const dialog = ref.current!;
    const previous = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector<HTMLElement>('.close-button')?.focus({ preventScroll: true });
    lockScroll(true);
    return () => {
      dialog.close();
      lockScroll(false);
      previous?.focus({ preventScroll: true });
    };
    // Re-running on project change would steal focus mid-navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project === null]);

  useLayoutEffect(() => {
    if (!project || !motion) return;
    scroller.current?.scrollTo({ top: 0 });
    const ctx = gsap.context(() => {
      const from = origin?.getBoundingClientRect();
      const tl = gsap.timeline({ defaults: { ease: 'cine' } });
      if (from && from.width > 0 && from.bottom > 0 && from.top < innerHeight) {
        tl.fromTo(panel.current, { clipPath: inset(from) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.05, ease: 'cineInOut' });
      } else {
        tl.fromTo(panel.current, { clipPath: 'inset(100% 0% 0% 0% round 0px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.95, ease: 'cineInOut' });
      }
      tl.from('.case-hero > *', { y: 36, autoAlpha: 0, duration: 1, stagger: 0.07 }, 0.45)
        .from('.case-body', { y: 40, autoAlpha: 0, duration: 1 }, 0.7);
    }, ref);
    return () => ctx.revert();
  }, [project, origin, motion]);

  const close = () => {
    if (closing) return;
    if (!motion || !panel.current) return onClose();
    setClosing(true);
    const to = origin?.getBoundingClientRect();
    const visible = to && to.width > 0 && to.bottom > 0 && to.top < innerHeight;
    gsap.to(panel.current, {
      clipPath: visible ? inset(to) : 'inset(0% 0% 100% 0% round 0px)',
      duration: 0.8,
      ease: 'cineInOut',
      onComplete: () => {
        setClosing(false);
        onClose();
      },
    });
  };

  // Keep Tab and Shift+Tab cycling inside the case file.
  const trapFocus = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== 'Tab') return;
    const focusable = [...e.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])')];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  if (!project) return null;
  const index = projects.findIndex((p) => p.id === project.id);
  const next = projects[(index + 1) % projects.length];
  const sections: [string, string, string][] = [
    ['problem', 'The problem', project.problem],
    ['system', 'The system', project.system],
    ['contribution', 'My contribution', project.contribution],
    ['evidence', 'Evidence & versions', project.evidence],
    ['limitations', 'Scope & limitations', project.limitations],
  ];

  return (
    <dialog
      ref={ref}
      className="case-study"
      aria-labelledby="case-title"
      onCancel={(e) => { e.preventDefault(); close(); }}
      onKeyDown={trapFocus}
      data-lenis-prevent
      style={{ '--project-color': project.color } as CSSProperties}
    >
      <div className="case-panel" ref={panel}>
        <div className="case-scroll" ref={scroller} tabIndex={-1}>
          <div className="case-topbar">
            <p className="label"><span className="num">0{index + 1} / 0{projects.length}</span> Case file</p>
            <button className="close-button" onClick={close} aria-label="Close case study">
              <span aria-hidden="true">Close</span><IconClose />
            </button>
          </div>

          <header className="case-hero wrap">
            <p className="label case-category">{project.category}</p>
            <h2 id="case-title" className="case-title">{project.title}</h2>
            <p className="case-lead">{project.summary}</p>
            <div className="tag-list">{project.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
            <ol className="case-steps" aria-label="How it works">
              {project.steps.map((s, i) => <li key={s}><span className="num">0{i + 1}</span>{s}</li>)}
            </ol>
          </header>

          <div className="case-body wrap">
            <nav className="case-index" aria-label="Case study sections">
              <p className="label">In this case</p>
              <ol>
                {sections.map(([id, title], i) => (
                  <li key={id}>
                    <a href={'#case-' + id} onClick={(e) => { e.preventDefault(); document.getElementById('case-' + id)?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' }); }}>
                      <span className="num">0{i + 1}</span>{title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="case-sections">
              {sections.map(([id, title, body], i) => (
                <section key={id} id={'case-' + id} className="case-section">
                  <p className="num case-section-index">0{i + 1}</p>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </section>
              ))}
              {project.id === 'sign-language' && <ProjectMedia />}
              <div className="source-links">
                {project.links.map((link) => (
                  <a key={link.url} className="link-line" href={link.url} target="_blank" rel="noreferrer">{link.label} <IconArrowUpRight /></a>
                ))}
              </div>
              <p className="source-note">Source review, not an independent runtime audit. Project applications and reported benchmarks were not reproduced for this portfolio.</p>
            </div>
          </div>

          <footer className="case-next wrap">
            <p className="label">Next case</p>
            <button className="case-next-button" onClick={() => onNavigate(next)}>
              <span className="case-next-title">{next.title}</span>
              <span className="case-next-summary">{next.summary}</span>
              <IconArrowRight />
            </button>
          </footer>
        </div>
      </div>
    </dialog>
  );
}
