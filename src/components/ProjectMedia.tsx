import { useEffect, useRef, useState } from 'react';
import { IconArrowUpRight } from './icons';
export function ProjectMedia(){
 const [failed,setFailed]=useState(false);const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)el.pause();});observer.observe(el);const pause=()=>{if(document.hidden)el.pause();};document.addEventListener('visibilitychange',pause);return()=>{el.pause();observer.disconnect();document.removeEventListener('visibilitychange',pause);};},[]);
 return <>
  <section className="signlink-ui-gallery" aria-labelledby="signlink-ui-title">
   <div className="signlink-ui-heading"><p className="eyebrow">PRODUCT INTERFACE</p><h3 id="signlink-ui-title">Communication support for busy public places.</h3><p>SignLink gives a signing visitor and a staff member one clear workspace for recognised phrases, visible replies and spoken responses in transport hubs, hospitals, civic offices, campuses and other high-footfall service areas.</p></div>
   <figure><img src="/assets/signlink-public-access.png" alt="SignLink public-access page with service locations for hospitals, civic offices, campuses, public venues and transport hubs" width="980" height="672" loading="lazy"/><figcaption>Public-access experience and place-aware service settings.</figcaption></figure>
   <figure><img src="/assets/signlink-live-workspace.png" alt="SignLink communication desk with a signing-space camera panel and a staff reply panel" width="990" height="591" loading="lazy"/><figcaption>Signing space, recognised message and staff response workspace.</figcaption></figure>
  </section>
  <figure className="project-media">{failed?<p>The demo could not load. <a href="https://github.com/kirankishoreV-07/Continuous-Sign-Language-Recognition/blob/main/Demo.mp4" target="_blank" rel="noreferrer">View the original repository video <IconArrowUpRight/></a></p>:<video ref={ref} src="/assets/sign-demo.mp4" poster="/assets/sign-poster.jpg" controls playsInline preload="none" onError={()=>setFailed(true)} aria-label="Original repository sign-recognition demonstration"/>}<figcaption>Supporting repository demonstration. User-controlled playback; this is not an independent evaluation. Sentence classification in the six-class experiment.</figcaption></figure>
 </>;
}
