import { useLayoutEffect, useRef, type CSSProperties, type PointerEvent } from 'react';
import { gsap } from '../motion/gsap';
import { credentials } from '../data';
import { IconArrowUpRight } from './icons';

const month = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const fmt = (iso: string) => month.format(new Date(iso));

/** Credentials as physical cards: dealt onto the table as the block scrolls
 * in, then lit by the pointer while each badge turns in 3D above its card. Every card links to the issuer's own verification page. */
export function Credentials({ motion }: { motion: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !motion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.cred-card',
        { rotateX: 58, y: 140, z: -220, autoAlpha: 0 },
        { rotateX: 0, y: 0, z: 0, autoAlpha: 1, ease: 'power2.out', stagger: 0.12,
          scrollTrigger: { trigger: '.cred-grid', start: 'top 92%', end: 'top 38%', scrub: 0.7 } });
    }, el);
    return () => ctx.revert();
  }, [motion]);

  const tilt = (e: PointerEvent<HTMLElement>) => {
    if (!motion || e.pointerType !== 'mouse') return;
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    card.style.setProperty('--gx', `${x * 100}%`);
    card.style.setProperty('--gy', `${y * 100}%`);
    // Only the badge turns in 3D; the card body stays flat so its links
    // never shift away from the cursor.
    gsap.to(card.querySelector('.cred-badge'), { rotateY: (x - 0.5) * 34, rotateX: (0.5 - y) * 24, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  };
  const rest = (e: PointerEvent<HTMLElement>) => {
    gsap.to(e.currentTarget.querySelector('.cred-badge'), { rotateY: 0, rotateX: 0, duration: 1, ease: 'elastic.out(1, 0.6)', overwrite: 'auto' });
  };

  return (
    <div className="credentials" ref={root}>
      <div className="cred-head">
        <p className="label">Credentials</p>
        <h3 className="cred-title" data-reveal="lines">Certified. <em>Verified.</em></h3>
        <p className="body-copy" data-reveal="fade">Two AWS certifications and a Cyfrin Updraft completion, each linked to the issuer’s official verification.</p>
      </div>

      <ul className="cred-grid">
        {credentials.map((c) => (
          <li key={c.id} className="cred-card" style={{ '--cred': c.color } as CSSProperties} onPointerMove={tilt} onPointerLeave={rest}>
            <article className="cred-inner" aria-labelledby={'cred-' + c.id}>
              <span className="cred-glare" aria-hidden="true" />
              <div className="cred-badge">
                <img src={c.badge} alt={c.title + ' badge'} width="300" height="300" loading="lazy" />
              </div>
              <div className="cred-body">
                <p className="label cred-issuer">{c.issuer}{c.code && <span> · {c.code}</span>}</p>
                <h4 id={'cred-' + c.id} className="cred-name">{c.title}</h4>
                {c.score ? (
                  <div className="cred-score">
                    <p><span className="cred-score-value serif" data-reveal="count" data-value={String(c.score.value)}>{c.score.value}</span><span className="cred-score-max num"> / {c.score.max}</span></p>
                    <span className="cred-meter" aria-hidden="true"><span data-reveal="rule" style={{ transform: `scaleX(${c.score.value / c.score.max})` }} /></span>
                  </div>
                ) : (
                  <p className="cred-score cred-score--pass"><span className="serif">Passed</span><span className="num"> proficiency exam</span></p>
                )}
                <p className="cred-summary">{c.summary}</p>
                <dl className="cred-meta">
                  <div><dt className="label">Issued</dt><dd>{fmt(c.issued)}</dd></div>
                  {c.expires && <div><dt className="label">Valid until</dt><dd>{fmt(c.expires)}</dd></div>}
                  <div className="cred-id"><dt className="label">Credential ID</dt><dd className="num" title={c.credentialId}>{c.credentialId}</dd></div>
                </dl>
                <div className="tag-list">{c.skills.map((s) => <span className="tag" key={s}>{s}</span>)}</div>
                <div className="cred-actions">
                  <a className="link-line" href={c.verify.url} target="_blank" rel="noreferrer">{c.verify.label} <IconArrowUpRight /></a>
                  {c.certificate && (
                    <a className="link-line cred-cert" href={c.certificate} target="_blank" rel="noreferrer">Certificate (PDF) <IconArrowUpRight /></a>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
