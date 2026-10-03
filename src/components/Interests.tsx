import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from '../motion/gsap';
import { useReveals } from '../motion/reveals';
import { approach, interests } from '../data';

const outputs = [
  'A clear problem and its constraints.',
  'A working experiment that tests the idea.',
  'Evidence of what works and what needs attention.',
  'A usable system with documented decisions.',
];

/** Scene 06. The method reads as one continuous line drawn through four
 * steps, then the open questions that keep the work moving. */
export function Interests({ motion }: { motion: boolean }) {
  const root = useRef<HTMLElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const [lit, setLit] = useState(motion ? -1 : approach.length - 1);
  useReveals(root, motion);

  useLayoutEffect(() => {
    if (!motion) {
      setLit(approach.length - 1);
      return;
    }
    const ctx = gsap.context(() => {
      // Each step's marker sits at i / n along the line; it lights as the
      // drawn line reaches it. CSS maps --p to scaleX or scaleY per layout.
      gsap.fromTo(line.current, { '--p': 0 }, {
        '--p': 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.process',
          start: 'top 75%',
          end: 'bottom 55%',
          scrub: 0.6,
          onUpdate: (self) => setLit(self.progress < 0.02 ? -1 : Math.min(approach.length - 1, Math.floor(self.progress * approach.length + 0.02))),
        },
      });
    }, root);
    return () => ctx.revert();
  }, [motion]);

  return (
    <section id="interests" ref={root} className="method scene">
      <div className="wrap">
        <div className="scene-slate">
          <p className="label"><span>06</span>Method</p>
          <p className="label">How I think &amp; build</p>
        </div>
        <div className="scene-head">
          <h2 className="title" data-reveal="lines">Curiosity meets <em>implementation.</em></h2>
          <p className="lead" data-reveal="fade">I explore how intelligent systems work, then build the software that makes them useful. My process connects questions, experiments and evidence.</p>
        </div>

        <div className="process">
          <span className="process-line" aria-hidden="true"><span ref={line} /></span>
          <ol className="process-steps">
            {approach.map((a, i) => (
              <li key={a.step} className={'process-step' + (i <= lit ? ' is-lit' : '')}>
                <span className="process-dot" aria-hidden="true" />
                <span className="num process-index">0{i + 1}</span>
                <h3>{a.step}</h3>
                <p className="body-copy">{a.body}</p>
                <p className="process-output"><span className="label">The output</span>{outputs[i]}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="questions">
          <div className="questions-head">
            <p className="label">Ongoing exploration</p>
            <h3 className="questions-title" data-reveal="lines">Questions that <em>keep me building.</em></h3>
          </div>
          <ol className="question-list" data-reveal="stagger">
            {interests.map((q, i) => (
              <li className="question" key={q.title}>
                <span className="num">0{i + 1}</span>
                <h4>{q.title}</h4>
                <p>{q.note}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
