import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from './motion/gsap';
import { useSceneLinks, useSmoothScroll } from './motion/lenis';
import { useSceneDirector } from './motion/scenes';
import { LoadingScreen } from './components/LoadingScreen';
import { Header } from './components/Header';
import { SceneRail } from './components/SceneRail';
import { Hero } from './components/Hero';
import { Journey } from './components/Journey';
import { Experience } from './components/Experience';
import { Work } from './components/Work';
import { Toolkit } from './components/Toolkit';
import { Interests } from './components/Interests';
import { Contact, Footer } from './components/Contact';
import { CaseStudy } from './components/CaseStudy';
import { PointerEffects } from './components/PointerEffects';
import { projects, type Project } from './data';

function savedMotion() {
  try {
    return localStorage.getItem('kiran-motion') !== 'off';
  } catch {
    return true;
  }
}
const deepLinked = () => Boolean(location.hash && location.hash !== '#intro');

export default function App() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [enabled, setEnabled] = useState(savedMotion);
  const motion = enabled && !reduced;
  const [opening] = useState(() => motion && !deepLinked());
  const [ready, setReady] = useState(() => !opening);
  const [loading, setLoading] = useState(() => opening);
  const [project, setProject] = useState<Project | null>(null);
  const [origin, setOrigin] = useState<HTMLElement | null>(null);
  const beginOpening = useCallback(() => setReady(true), []);
  const completeLoading = useCallback(() => setLoading(false), []);

  useSmoothScroll(motion && ready);
  useSceneLinks();
  useSceneDirector(ready, motion);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const listener = () => setReduced(query.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? 'on' : 'off';
    try {
      localStorage.setItem('kiran-motion', enabled ? 'on' : 'off');
    } catch {
      /* Storage may be disabled. */
    }
  }, [enabled, motion]);

  useEffect(() => {
    void document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);

  useEffect(() => {
    const readHash = () => {
      const id = location.hash.replace('#case/', '');
      setProject(location.hash.startsWith('#case/') ? projects.find((p) => p.id === id) ?? null : null);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      const id = location.hash.slice(1);
      if (id && !id.startsWith('case/')) document.getElementById(id)?.scrollIntoView({ behavior: 'instant' });
    }, 200);
    return () => {
      window.removeEventListener('hashchange', readHash);
      clearTimeout(timer);
    };
  }, []);

  const open = (p: Project, from: HTMLElement | null) => {
    history.pushState(null, '', '#case/' + p.id);
    setOrigin(from);
    setProject(p);
  };
  const navigate = (p: Project) => {
    history.replaceState(null, '', '#case/' + p.id);
    setOrigin(null);
    setProject(p);
  };
  const close = () => {
    history.replaceState(null, '', '#work');
    setProject(null);
  };

  return (
    <>
      <div className="stage" aria-hidden="true" />
      {loading && <LoadingScreen motion={motion} onOpening={beginOpening} onComplete={completeLoading} />}
      <a className="skip-link" href="#main">Skip to content</a>
      <Header ready={ready} motion={motion} reduced={reduced} onToggleMotion={() => setEnabled((v) => !v)} />
      <SceneRail ready={ready} />
      <main id="main" inert={!ready}>
        <Hero motion={motion} ready={ready} opening={opening} />
        <Journey motion={motion} />
        <Experience motion={motion} />
        <Work motion={motion} onOpen={open} />
        <Toolkit motion={motion} />
        <Interests motion={motion} />
        <Contact motion={motion} />
      </main>
      <Footer motion={motion} />
      <CaseStudy project={project} origin={origin} motion={motion} onClose={close} onNavigate={navigate} />
      <PointerEffects motion={motion} />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
