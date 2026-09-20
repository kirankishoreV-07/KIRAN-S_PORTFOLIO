import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, type Project } from '../data';
import { ProjectVisual } from './ProjectVisual';
import {SceneArt} from './SceneArt';
gsap.registerPlugin(ScrollTrigger);
export function Work({motion,onOpen}:{motion:boolean;onOpen:(p:Project)=>void}){
 const root=useRef<HTMLElement>(null),track=useRef<HTMLDivElement>(null);
 const progress=useRef<HTMLSpanElement>(null),trigger=useRef<ScrollTrigger|null>(null);
 const art=useRef({progress:0,selection:0});const selected=useRef(0);const [active,setActive]=useState(0);
 useLayoutEffect(()=>{
  const el=root.current!,rail=track.current!,cards=gsap.utils.toArray<HTMLElement>('.project-card',el);
  const match=gsap.matchMedia();
  const select=(index:number)=>{if(selected.current!==index){selected.current=index;setActive(index);}};
  if(motion)match.add('(min-width: 1024px) and (min-height: 600px)',()=>{
   el.classList.add('is-horizontal');
   const tween=gsap.to(rail,{x:()=>-(rail.scrollWidth-rail.clientWidth),ease:'none',scrollTrigger:{
    trigger:el,pin:'.work-stage',start:'top top',end:()=>'+='+Math.min(4000,window.innerWidth*2.5),scrub:.45,invalidateOnRefresh:true,
    onUpdate:self=>{
     art.current.progress=self.progress;art.current.selection=self.progress*2;const position=self.progress*4;select(Math.min(4,Math.round(position)));
     if(progress.current)gsap.set(progress.current,{scaleX:(self.progress*4+1)/5});
     cards.forEach((card,index)=>{
      const depth=Math.min(1,Math.abs(position-index));
      gsap.set(card.querySelector('.project-visual'),{scale:1-depth*.08,y:depth*28,rotationY:depth*(index<position?-7:7)});
      gsap.set(card.querySelector('.project-copy'),{opacity:1-depth*.12,y:depth*20});
     });
    }
   }});
   trigger.current=tween.scrollTrigger!;
   return()=>{trigger.current=null;el.classList.remove('is-horizontal');};
  });
  const observer=new IntersectionObserver(entries=>{
   if(trigger.current)return;
   entries.forEach(entry=>{if(entry.isIntersecting){const index=cards.indexOf(entry.target as HTMLElement);select(index);if(progress.current)progress.current.style.transform=`scaleX(${(index+1)/5})`;}});
  },{rootMargin:'-15% 0px -40% 0px',threshold:.1});cards.forEach(card=>observer.observe(card));
  return()=>{observer.disconnect();match.revert();};
 },[motion]);
 useLayoutEffect(()=>{
  if(!motion)return;
  const context=gsap.context(()=>{
   const card=track.current?.children[active];if(!card)return;
   gsap.fromTo(card.querySelectorAll('.project-copy > .eyebrow, .project-copy > h3, .project-summary, .tags'),{y:24,opacity:1},{y:0,opacity:1,duration:.65,stagger:.055,ease:'power2.out'});
  },root);
  return()=>context.revert();
 },[active,motion]);
 const go=(index:number)=>{
  const t=trigger.current;
  if(t)window.scrollTo({top:t.start+(t.end-t.start)*index/4,behavior:'instant'});
  else document.getElementById(projects[index].id)?.scrollIntoView({behavior:'instant',block:'start'});
  selected.current=index;setActive(index);
 };
 return <section id="work" ref={root} className="work-section" aria-labelledby="work-title"><div className="work-stage"><SceneArt kind="work" motion={motion} state={art.current}/><div className="chapter-bar"><span>04 / SELECTED WORK</span><span>FIVE IDEAS. REAL SYSTEMS.</span></div>
 <header className="work-header"><div><p className="eyebrow"><span className="accent">THE PROJECT ROOM /</span></p><h2 id="work-title">IDEAS.<br/><span>IN THE REAL WORLD.</span></h2></div><p>Five projects. Different challenges.<br/>Built with curiosity. Made with purpose.</p></header>
 <nav className="project-nav" aria-label="Choose a project">{projects.map((p,i)=><button key={p.id} onClick={()=>go(i)} aria-label={'Show '+p.title} aria-current={active===i?'true':undefined}><span>0{i+1}</span><span>{p.title}</span></button>)}</nav>
 <div className="gallery-window"><div className="project-track" ref={track}>{projects.map((p,i)=><article className={'project-card'+(active===i?' is-active':'')} id={p.id} key={p.id} style={{'--project-color':p.color} as React.CSSProperties} onFocusCapture={()=>{if(trigger.current&&active!==i)go(i);}}>
 <ProjectVisual project={p}/><div className="project-copy"><div className="project-index">0{i+1} <span>/ 05</span></div><p className="eyebrow">{p.category}</p><h3>{p.title}</h3><p className="project-summary">{p.summary}</p><div className="tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div>{p.id==='sign-language'&&<p className="metric-note"><strong>94.44%</strong> repository-reported validation · 17/18 clips · six classes</p>}<div className="project-actions"><button onClick={()=>onOpen(p)}>Explore case study <span>↗</span></button><a href={p.links[0].url} target="_blank" rel="noreferrer" aria-label={'View '+p.title+' source'}>Source ↗</a></div></div>
 </article>)}</div></div><div className="gallery-footer"><span>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span><div className="progress-line"><span ref={progress}/></div><span>0{active+1} <span className="counter-divider">/</span> 05</span></div>
 </div></section>;
}
