import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Character, type CharacterAssets } from './components/Character';
import { LoadingScreen } from './components/LoadingScreen';
import { Journey } from './components/Journey';
import { Experience } from './components/Experience';
import { Toolkit } from './components/Toolkit';
import { Interests } from './components/Interests';
import { Work } from './components/Work';
import { Contact } from './components/Contact';
import { CaseStudy } from './components/CaseStudy';
import { projects, type Project } from './data';
import { useSmoothScroll } from './useSmoothScroll';
import { IconArrowUpRight, IconArrowDown, IconArrowUp } from './components/icons';
function savedMotion(){try{return localStorage.getItem('kiran-motion')!=='off';}catch{return true;}}
const characterAssets:CharacterAssets={entrance:'/assets/kiran-studio-desktop.mp4',mobile:'/assets/kiran-studio-mobile.mp4',foldedPoster:'/assets/kiran-studio-poster.jpg',mobilePoster:'/assets/kiran-studio-poster-mobile.jpg'};
const heroRoles=['AI Developer','Generative AI Developer','Computer Vision Engineer','Backend & Cloud Developer'];
export default function App(){
 const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),[enabled,setEnabled]=useState(savedMotion),[project,setProject]=useState<Project|null>(null); const hero=useRef<HTMLElement>(null);const motion=enabled&&!reduced;const bypass=!motion||Boolean(location.hash&&location.hash!=='#intro');const [ready,setReady]=useState(()=>bypass),[loading,setLoading]=useState(()=>!bypass);const beginOpening=useCallback(()=>setReady(true),[]),completeLoading=useCallback(()=>setLoading(false),[]);
 const [heroSound,setHeroSound]=useState<{muted:boolean;toggle:()=>void;disabled:boolean}|null>(null);
 useSmoothScroll(motion&&ready);
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion: reduce)');const listener=()=>setReduced(query.matches);query.addEventListener('change',listener);return()=>query.removeEventListener('change',listener);},[]);
 useEffect(()=>{document.documentElement.dataset.motion=motion?'on':'off';try{localStorage.setItem('kiran-motion',enabled?'on':'off');}catch{/* Storage may be disabled. */}},[enabled,motion]);
 useLayoutEffect(()=>{
  if(!motion||!ready)return;
  const context=gsap.context(()=>{
   gsap.utils.toArray<HTMLElement>('.experience-copy, .toolkit-heading, .interests-heading, .contact-content').forEach(element=>gsap.fromTo(element,{y:60,opacity:1},{y:0,opacity:1,duration:1.1,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 88%',once:true}}));
   gsap.fromTo('.tie-character-host',{y:45,scale:.96},{y:0,scale:1,ease:'none',scrollTrigger:{trigger:'#experience',start:'top bottom',end:'center center',scrub:.65}});
   gsap.utils.toArray<HTMLElement>('.editorial-reveal').forEach(element=>gsap.fromTo(element,{y:36},{y:0,duration:.85,ease:'power3.out',scrollTrigger:{trigger:element,start:'top 92%',once:true}}));
   gsap.fromTo('.approach-step',{y:45,opacity:1},{y:0,opacity:1,duration:.85,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:'.approach-list',start:'top 80%',once:true}});
   gsap.fromTo('.contact-glow',{scale:.7,opacity:.2},{scale:1.1,opacity:1,ease:'none',scrollTrigger:{trigger:'#contact',start:'top bottom',end:'center center',scrub:.8}});
  });
  return()=>context.revert();
 },[motion,ready]);
 useEffect(()=>{const readHash=()=>{const id=location.hash.replace('#case/','');setProject(location.hash.startsWith('#case/')?projects.find(p=>p.id===id)||null:null);};readHash();window.addEventListener('hashchange',readHash);const timer=setTimeout(()=>{ScrollTrigger.refresh();const id=location.hash.slice(1);if(id&&!id.startsWith('case/'))document.getElementById(id)?.scrollIntoView();},200);return()=>{window.removeEventListener('hashchange',readHash);clearTimeout(timer);};},[]);
 const open=(p:Project)=>{history.pushState(null,'','#case/'+p.id);setProject(p);};const close=()=>{history.replaceState(null,'','#work');setProject(null);};
 return <>{loading&&<LoadingScreen motion={motion} onOpening={beginOpening} onComplete={completeLoading}/>}<a className="skip-link" href="#main">Skip to content</a><header className="site-header" inert={!ready}><a className="wordmark" href="#intro" aria-label="Kiran, introduction">KIRAN</a><nav aria-label="Main navigation"><a href="#intro">Intro</a><a href="#journey">Journey</a><a href="#work">Work</a><a href="#contact">Contact <span><IconArrowUpRight/></span></a></nav><button className="motion-toggle" onClick={()=>setEnabled(v=>!v)} aria-pressed={motion} title={reduced?'Your system requests reduced motion':'Toggle animation'}>Motion {motion?'on':'off'} <span aria-hidden="true">{motion?'◉':'○'}</span></button></header>
 <main id="main" inert={!ready}><section id="intro" ref={hero} className="hero cinematic-hero" data-ready={ready}>
 <div className="hero-content"><div className="hero-copy"><p className="eyebrow"><span className="status-dot"/> KIRAN KISHORE VENKATESAN</p>
 <h1 aria-label="Hi, I’m Kiran Kishore"><span className="intro-greeting">Hi, I’m</span><span className="intro-name">{['KIRAN','KISHORE'].map((name,line)=><span className="name-line" data-text={name} aria-hidden="true" key={name}>{[...name].map((c,i)=><span className="name-letter" data-letter={c} style={{'--letter':line*7+i} as CSSProperties} key={i}>{c}</span>)}<span className="name-glint" aria-hidden="true">{name}</span></span>)}<span className="name-scan" aria-hidden="true"/></span></h1>
 <p className="hero-description"><span>Turning complex problems</span><br/><strong>into working software.</strong><i aria-hidden="true"/></p><div className="hero-actions"><a className="primary-button" href="#work">View Work <span><IconArrowUpRight/></span></a><a className="resume-link" href="/assets/kiran-resume.pdf" download>Download Resume <span><IconArrowDown/></span></a>{heroSound&&<button className="resume-link hero-sound" onClick={heroSound.toggle} disabled={heroSound.disabled} aria-pressed={!heroSound.muted} aria-label={heroSound.muted?'Turn introduction sound on':'Mute introduction'}><svg className="hero-sound-icon" viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4z"/>{heroSound.muted?<path d="M16.5 9.5l4 5m0-5l-4 5"/>:<><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.8a7 7 0 0 1 0 10.4"/></>}</svg><span>{heroSound.muted?'Sound on':'Mute'}</span></button>}</div></div>
 <div className="hero-stage"><p className="stage-caption">PORTFOLIO / 2026</p><Character motion={motion} assets={characterAssets} ready={ready} onSound={setHeroSound}/></div></div>
 <div className="hero-role role-directory" aria-label="Professional focus">{heroRoles.map((role,index)=><p className="role-item" style={{'--role-index':index} as CSSProperties} key={role}><span className="role-number" aria-hidden="true">0{index+1}</span><span className="role-name">{role}</span></p>)}</div>
 <div className="hero-bottom"><span>BASED IN <b>COIMBATORE, INDIA</b></span><a href="#journey">Explore experience <span><IconArrowDown/></span></a></div></section>
 <Journey motion={motion}/>
 <Experience motion={motion}/>
 <Work motion={motion} onOpen={open}/>
 <Toolkit/>
 <Interests/>
 <Contact/></main><footer><a className="wordmark" href="#intro">KIRAN</a><span>Kiran Kishore · © {new Date().getFullYear()}</span><a href="#intro">Back to top <IconArrowUp/></a></footer><CaseStudy project={project} onClose={close}/></>;
}
