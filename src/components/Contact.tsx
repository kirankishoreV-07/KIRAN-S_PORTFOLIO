import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap } from '../motion/gsap';
import { useReveals } from '../motion/reveals';
import { TieAdjust, type TieAssets } from './TieAdjust';
import { IconArrowDown, IconArrowUp, IconArrowUpRight } from './icons';

const email = 'kiransjobs7@gmail.com';
const tieAssets: TieAssets = {
  desktop: '/assets/kiran-tie-desktop.mp4',
  mobile: '/assets/kiran-tie-mobile.mp4',
  poster: '/assets/kiran-tie-poster.jpg',
  mobilePoster: '/assets/kiran-tie-poster-mobile.jpg',
};
const resources = [
  { href: 'https://www.linkedin.com/in/v-kiran-kishore', kind: 'Professional', title: 'LinkedIn', note: 'Experience and professional connections', external: true },
  { href: 'https://github.com/kirankishoreV-07', kind: 'Code', title: 'GitHub', note: 'Explore repositories and implementation', external: true },
  { href: '/assets/kiran-resume.pdf', kind: 'Profile', title: 'Download Resume', note: 'Education, experience and project overview', external: false },
];

/** Scene 07. The closing beat mirrors the opening: he walked in at the
 * start; here he straightens his tie, ready to start the conversation. */
export function Contact({ motion }: { motion: boolean }) {
  const root = useRef<HTMLElement>(null);
  const [status, setStatus] = useState('');
  useReveals(root, motion);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setStatus('Email copied to clipboard.');
    } catch {
      setStatus('Select the email address above to copy it.');
    }
  }

  return (
    <section id="contact" ref={root} className="contact scene">
      <div className="wrap contact-grid">
        <div className="contact-copy">
          <div className="scene-slate">
            <p className="label"><span>07</span>Ready</p>
            <p className="label">Let’s connect</p>
          </div>
          <h2 className="display contact-title" data-reveal="lines">A good idea starts with <em>a conversation.</em></h2>
          <p className="lead" data-reveal="fade">Hiring, collaborating, or exploring a technical idea? Tell me what you’re working on.</p>

          <a className="email-link" href={'mailto:' + email} data-reveal="fade">
            <span>{email}</span><IconArrowUpRight />
          </a>
          <div className="contact-actions" data-reveal="fade" data-reveal-delay="0.08">
            <a className="btn magnetic" href={'mailto:' + email + '?subject=Let%E2%80%99s%20connect'}>Start a conversation <IconArrowUpRight /></a>
            <button className="btn btn-ghost" onClick={copy}>Copy email</button>
          </div>
          <p className="copy-status" role="status">{status}</p>

          <ul className="contact-links" data-reveal="stagger">
            {resources.map((r, i) => (
              <li key={r.title}>
                <a href={r.href} {...(r.external ? { target: '_blank', rel: 'noreferrer' } : { download: true })}>
                  <span className="label"><span className="num">0{i + 1}</span> {r.kind}</span>
                  <span className="contact-link-title">{r.title} {r.external ? <IconArrowUpRight /> : <IconArrowDown />}</span>
                  <span className="contact-link-note">{r.note}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="contact-elsewhere">
            <span className="label">Elsewhere</span>
            <a className="link-line" href="https://www.instagram.com/_kiran_kishore/" target="_blank" rel="noreferrer">Instagram <IconArrowUpRight /></a>
            <a className="link-line" href="https://x.com/kirann__77" target="_blank" rel="noreferrer">X <IconArrowUpRight /></a>
          </p>
        </div>

        <div className="contact-film">
          <div id="tie-adjust" className="tie-host">
            <TieAdjust motion={motion} assets={tieAssets} />
          </div>
          <p className="label contact-status"><span className="status-dot" aria-hidden="true" />Coimbatore, India <span aria-hidden="true">·</span> <b>Open to opportunities</b></p>
        </div>
      </div>
    </section>
  );
}

const WORDS = [{ text: 'Kiran', em: false }, { text: 'Kishore', em: true }];

/** End title. The full name, set as extruded type, stands up letter by letter
 * as the page reaches its last frame and leans toward the pointer. */
export function Footer({ motion }: { motion: boolean }) {
  const mark = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = mark.current;
    if (!el || !motion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.wm-char',
        { rotateX: -100, yPercent: 35, autoAlpha: 0 },
        { rotateX: 0, yPercent: 0, autoAlpha: 1, ease: 'none', stagger: 0.07,
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: 0.8 } });
    }, el);
    const stage = el.querySelector<HTMLElement>('.wm-stage');
    const fine = matchMedia('(pointer: fine)').matches;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(stage, { rotateY: x * 14, rotateX: -y * 10, duration: 0.9, ease: 'power3.out', overwrite: 'auto' });
    };
    const leave = () => gsap.to(stage, { rotateY: 0, rotateX: 0, duration: 1.2, ease: 'power3.out', overwrite: 'auto' });
    const footer = el.closest('footer');
    if (fine) {
      footer?.addEventListener('pointermove', move);
      footer?.addEventListener('pointerleave', leave);
    }
    return () => {
      footer?.removeEventListener('pointermove', move);
      footer?.removeEventListener('pointerleave', leave);
      ctx.revert();
    };
  }, [motion]);

  let index = 0;
  return (
    <footer className="credits" id="site-footer">
      <div className="wrap">
        <div className="credits-bar">
          <a className="brand-name" href="#intro">Kiran Kishore</a>
          <span className="label">© {new Date().getFullYear()} · Designed &amp; built by Kiran Kishore</span>
          <a className="link-line" href="#intro">Back to top <IconArrowUp /></a>
        </div>
      </div>
      <div className="wordmark" ref={mark} aria-hidden="true" translate="no">
        <div className="wm-stage">
          {WORDS.map((word) => (
            <span key={word.text} className={'wm-word' + (word.em ? ' wm-word--em' : '')}>
              {[...word.text].map((c, i) => (
                <span key={i} className="wm-char" style={{ '--i': index++ } as CSSProperties}>{c}</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
