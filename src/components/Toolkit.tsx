import { useRef } from 'react';
import { useReveals } from '../motion/reveals';
import { toolkit } from '../data';
import { GENERIC_ICONS } from './icons';
import { Marquee } from './Marquee';

const notes = [
  'The foundations I use to turn ideas into reliable programs.',
  'Tools for understanding images, motion and language.',
  'Models, frameworks and patterns for systems that reason and act.',
  'APIs, applications and the data that connects them.',
  'Infrastructure for deploying and operating software.',
  'The everyday tools that support the development process.',
];
const band = ['PyTorch', 'MediaPipe', 'AWS Bedrock', 'FastAPI', 'OpenCV', 'Supabase', 'Multi-Agent Systems', 'YOLOv11', 'React Native', 'Hugging Face'];
const total = toolkit.reduce((n, c) => n + c.items.length, 0);

/** Scene 05. The lights come up: the whole kit is laid out on the bench,
 * scannable at a glance rather than hidden behind tabs. */
export function Toolkit({ motion }: { motion: boolean }) {
  const root = useRef<HTMLElement>(null);
  useReveals(root, motion);

  return (
    <section id="toolkit" ref={root} className="toolkit scene">
      <Marquee items={band} motion={motion} />
      <div className="wrap">
        <div className="scene-slate">
          <p className="label"><span>05</span>Toolkit</p>
          <p className="label">{total} technologies &amp; practices</p>
        </div>
        <div className="scene-head">
          <h2 className="title" data-reveal="lines">The right tools. <em>For the right problem.</em></h2>
          <p className="lead" data-reveal="fade">Explore the technologies behind my work, from the first experiment to the application around it.</p>
        </div>
        <div className="toolkit-grid">
          {toolkit.map((cat, i) => (
            <section className="tool-group" key={cat.name} aria-labelledby={'tool-group-' + i}>
              <span className="tool-group-rule" data-reveal="rule" aria-hidden="true" />
              <header className="tool-group-head">
                <span className="num">0{i + 1}</span>
                <h3 id={'tool-group-' + i}>{cat.name}</h3>
                <p>{notes[i]}</p>
              </header>
              <ul className="tool-items" data-reveal="stagger" translate="no">
                {cat.items.map((item) => {
                  const Generic = item.generic ? GENERIC_ICONS[item.generic] : null;
                  return (
                    <li className="tool" key={item.name}>
                      {item.logo ? <img src={'/assets/logos/' + item.logo + '.svg'} alt="" width="20" height="20" loading="lazy" /> : Generic ? <Generic /> : null}
                      <span>{item.name}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
