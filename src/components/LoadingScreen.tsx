import {useEffect,useRef,useState} from 'react';

/** A finite cinematic prelude. Optional resources never hold the page: it
 * opens as soon as they are ready, or after a short fallback deadline. */
export function LoadingScreen({motion,onOpening,onComplete}:{motion:boolean;onOpening:()=>void;onComplete:()=>void}){
 const [progress,setProgress]=useState(0),[leaving,setLeaving]=useState(false);const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 useEffect(()=>{
  if(!motion||(location.hash&&location.hash!=='#intro')){onOpening();onComplete();return;}
  let alive=true,ready=0,finished=false;const start=performance.now();const oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const finish=()=>{if(!alive||finished)return;finished=true;const delay=Math.max(0,1150-(performance.now()-start));timers.current.push(setTimeout(()=>{if(!alive)return;setLeaving(true);onOpening();timers.current.push(setTimeout(()=>{if(alive)onComplete();},950));},delay));};
  const poster=matchMedia('(max-width:699px)').matches?'/assets/kiran-studio-alpha-mobile-poster.png':'/assets/kiran-studio-alpha-desktop-poster.png';
  const tasks=[document.fonts.load('600 100px "Poster"'),new Promise<void>(resolve=>{const image=new Image();image.onload=()=>resolve();image.onerror=()=>resolve();image.src=poster;}),import('./studio')];
  tasks.forEach(task=>void Promise.resolve(task).catch(()=>{}).then(()=>{if(!alive||finished)return;setProgress(++ready);if(ready===3)finish();}));
  timers.current.push(setTimeout(()=>{if(alive){setProgress(3);finish();}},1800));
  return()=>{alive=false;timers.current.forEach(clearTimeout);document.body.style.overflow=oldOverflow;};
 },[motion,onOpening,onComplete]);
 return <div className={'loading-screen cinematic-loader'+(leaving?' is-done':'')} role="status" aria-live="polite" aria-label="Opening Kiran Kishore's portfolio">
  <div className="load-curtain load-curtain-left" aria-hidden="true"/><div className="load-curtain load-curtain-right" aria-hidden="true"/>
  <div className="load-corner">KIRAN KISHORE / AI DEVELOPER</div>
  <svg className="load-orbit" viewBox="0 0 600 600" aria-hidden="true"><circle cx="300" cy="300" r="240"/><circle cx="300" cy="300" r="198"/><path d="M60 300H540M300 60V540"/><circle className="load-spark" cx="300" cy="60" r="4"/></svg>
  <div className="load-title" aria-hidden="true"><span>PORTFOLIO 2026</span><strong><span>KIRAN</span><span>KISHORE</span></strong><p>AGENTIC AI · COMPUTER VISION · CLOUD</p></div>
  <div className="load-axis" aria-hidden="true"/>
  <div className="load-bottom"><span>{leaving?'OPENING':progress>=3?'READY':'LOADING EXPERIENCE'}</span><div className="load-progress" aria-hidden="true"><span style={{transform:`scaleX(${Math.min(progress,3)/3})`}}/></div></div>
 </div>;
}
