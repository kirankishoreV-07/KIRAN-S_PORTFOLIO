import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../motion/gsap';
import { isGliding, lockScroll } from '../motion/lenis';
import { useScene } from '../motion/scenes';
import { IconArrowDown, IconArrowUpRight, IconClose } from './icons';

const NAV = [
  { id: 'journey', label: 'Journey' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];
const EMAIL = 'kiransjobs7@gmail.com';

type Props = { ready: boolean; motion: boolean; reduced: boolean; onToggleMotion: () => void };

export function Header({ ready, motion, reduced, onToggleMotion }: Props) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const scene = useScene();
  const menuButton = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const motionTitle = reduced ? 'Your system requests reduced motion' : 'Toggle animation';

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: 'max',
      // Hidden while reading downward; back during link glides and at the end.
      onUpdate: (self) => setHidden(!isGliding() && self.progress < 0.985 && self.direction === 1 && self.scroll() > window.innerHeight * 0.6),
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const outside = ['main', 'site-footer', 'site-header-bar'].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    outside.forEach((el) => (el.inert = true));
    firstLink.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      lockScroll(false);
      outside.forEach((el) => (el.inert = false));
      window.removeEventListener('keydown', onKey);
      menuButton.current?.focus();
    };
  }, [open]);

  const active = NAV.some((n) => n.id === scene) ? scene : null;

  return (
    <>
      <header className={'site-header' + (hidden && !open ? ' is-hidden' : '')} inert={!ready}>
        <div className="site-header-bar" id="site-header-bar">
          <a className="brand" href="#intro" aria-label="Kiran Kishore, back to the introduction">
            <span className="brand-name" translate="no">Kiran Kishore</span>
            <span className="brand-role label">AI Developer</span>
          </a>
          <nav className="nav" aria-label="Main navigation">
            {NAV.map((item) => (
              <a key={item.id} href={'#' + item.id} aria-current={active === item.id ? 'true' : undefined}>
                <span className="nav-label" data-text={item.label}>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="header-tools">
            <a className="header-resume" href="/assets/kiran-resume.pdf" download>Resume <IconArrowDown /></a>
            <button className="motion-toggle" onClick={onToggleMotion} aria-pressed={motion} title={motionTitle}>
              <span className="motion-dot" aria-hidden="true" />Motion {motion ? 'on' : 'off'}
            </button>
            <button ref={menuButton} className="menu-button" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(true)}>
              Menu
            </button>
          </div>
        </div>
      </header>

      <div id="site-menu" className="menu" role="dialog" aria-modal="true" aria-label="Site menu" hidden={!open} data-lenis-prevent>
        <div className="menu-top">
          <span className="label">Scenes</span>
          <button className="menu-close" onClick={() => setOpen(false)} aria-label="Close menu"><IconClose /></button>
        </div>
        <nav aria-label="Menu navigation">
          <ol className="menu-links">
            {[{ id: 'intro', label: 'Introduction' }, ...NAV.slice(0, 3), { id: 'toolkit', label: 'Toolkit' }, { id: 'interests', label: 'Method' }, NAV[3]].map((item, i) => (
              <li key={item.id} style={{ '--i': i } as React.CSSProperties}>
                <a ref={i === 0 ? firstLink : undefined} href={'#' + item.id} onClick={() => setOpen(false)}>
                  <span className="num">0{i + 1}</span>{item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="menu-foot">
          <a href={'mailto:' + EMAIL}>{EMAIL} <IconArrowUpRight /></a>
          <a href="/assets/kiran-resume.pdf" download>Download Resume <IconArrowDown /></a>
          <button className="menu-motion" onClick={onToggleMotion} aria-pressed={motion} title={motionTitle}>
            <span className="motion-dot" aria-hidden="true" />Motion {motion ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </>
  );
}
