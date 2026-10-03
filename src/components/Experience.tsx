import { useRef } from 'react';
import { useReveals } from '../motion/reveals';
import { experience, recognition } from '../data';
import { Credentials } from './Credentials';

const DISCIPLINES = ['Agentic systems', 'Conversational AI'];
const FOCUS = [['Repository intelligence', 'Developer automation'], ['NLP', 'Real-time speech', '3D avatar']];

/** Scene 03. Two internships set like opening credits, then the four
 * finalist selections as a single counted roll. */
export function Experience({ motion }: { motion: boolean }) {
  const root = useRef<HTMLElement>(null);
  useReveals(root, motion);

  return (
    <section id="experience" ref={root} className="experience scene">
      <div className="wrap">
        <div className="scene-slate">
          <p className="label"><span>03</span>Practice</p>
          <p className="label">Experience, credentials &amp; recognition</p>
        </div>
        <div className="scene-head">
          <h2 className="title" data-reveal="lines">Learning by <em>building.</em></h2>
          <p className="lead" data-reveal="fade">
            Ideas become stronger through hands-on work. <strong>Two internships. Three certifications. Four finalist selections.</strong>
          </p>
        </div>

        <ol className="roles">
          {experience.map((r, i) => (
            <li className="role" key={r.org}>
              <span className="role-rule" data-reveal="rule" aria-hidden="true" />
              <div className="role-meta" data-reveal="fade">
                <span className="role-index num">0{i + 1}</span>
                <p className="label">{r.period}</p>
                <p className="label">{r.location}</p>
              </div>
              <div className="role-main">
                <p className="label role-discipline">{DISCIPLINES[i]}</p>
                <h3 className="role-title" data-reveal="lines">{r.role}</h3>
                <p className="role-org">{r.org}</p>
              </div>
              <div className="role-body" data-reveal="fade" data-reveal-delay="0.1">
                <p className="body-copy">{r.body}</p>
                <div className="tag-list">{FOCUS[i].map((t) => <span className="tag" key={t}>{t}</span>)}</div>
              </div>
            </li>
          ))}
        </ol>

        <Credentials motion={motion} />

        <div className="recognition">
          <div className="recognition-count">
            <span className="recognition-num" data-reveal="count" data-value="4">4</span>
            <p className="label">Hackathon finalist<br />selections</p>
          </div>
          <div className="recognition-body">
            <h3 className="recognition-title" data-reveal="lines">Built to compete. <em>Selected to present.</em></h3>
            <ul className="finalists" data-reveal="stagger">
              {recognition.map((entry, i) => {
                const [name, venue] = entry.split(' · ');
                return (
                  <li className="finalist" key={entry}>
                    <span className="num finalist-index">0{i + 1}</span>
                    <span className="finalist-name">{name}</span>
                    <span className="finalist-venue">{venue ?? 'Hackathon finalist'}</span>
                    <span className="finalist-badge label">Finalist</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
