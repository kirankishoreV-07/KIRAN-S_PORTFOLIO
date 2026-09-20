import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {useCharacterMedia} from './characterMedia';
import { TieScene } from './TieScene';

export type TieAssets = { desktop:string; mobile:string; poster:string; mobilePoster:string };

/** A quieter, closer-in beat after the entrance: plays once when it scrolls
 * into view, then holds on the clip's own final "formal standing, hands
 * composed" frame — it never loops the adjustment motion. */
export function TieAdjust({ assets, motion=true }: { assets?:TieAssets; motion?:boolean }) {
  const video=useRef<HTMLVideoElement>(null);
  const hasPlayed=useRef(false);
  const preferredMuted=useRef(false);
  const clock=useRef({reveal:0,light:1});
  const [small,setSmall]=useState(()=>matchMedia('(max-width: 699px)').matches);
  const [failed,setFailed]=useState(false);
  const [playing,setPlaying]=useState(false),[settled,setSettled]=useState(false),[muted,setMuted]=useState(false);
  const selectedSource=useRef<string|undefined>(undefined);
  if(!selectedSource.current&&assets)selectedSource.current=assets.desktop;
  const source=selectedSource.current;
  const media=useCharacterMedia(source,assets?.poster||'',video);
  useEffect(()=>{const query=matchMedia('(max-width: 699px)');const update=()=>setSmall(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
  useEffect(()=>{
    const element=video.current;
    if(!element||failed)return;
    const params=new URLSearchParams(location.search);
    const scrub=params.get('tieT');
    if(scrub){
      clock.current.reveal=1;setSettled(true);
      const seekTo=Math.min(9.99,Math.max(0,Number(scrub)));
      const seek=()=>{element.currentTime=seekTo;};
      if(element.readyState>=1)seek();else element.addEventListener('loadedmetadata',seek,{once:true});
      return()=>element.removeEventListener('loadedmetadata',seek);
    }
    if(!motion){element.pause();clock.current.reveal=1;setSettled(true);return;}
    clock.current.reveal=0;
    let tween:gsap.core.Tween|undefined,inView=false,pendingRestart=true;
    const start=(restart=pendingRestart)=>{
      if(!inView||document.hidden)return;
      if(restart||element.ended){element.currentTime=0;setSettled(false);}
      pendingRestart=false;
      if(!hasPlayed.current){hasPlayed.current=true;tween=gsap.to(clock.current,{reveal:1,duration:1.3,ease:'power2.out'});}
      element.muted=preferredMuted.current;setMuted(element.muted);
      if(element.paused)void element.play().catch((error:DOMException)=>{
        if(error.name==='NotAllowedError'&&!preferredMuted.current){element.muted=true;setMuted(true);void element.play().catch(()=>{});}
      });
    };
    const observer=new IntersectionObserver(([entry])=>{
      const entering=entry.isIntersecting&&!inView;
      inView=entry.isIntersecting;
      if(entering)start(true);
      else if(!inView){pendingRestart=true;if(!element.paused)element.pause();}
    },{threshold:.35});
    observer.observe(element);
    const hidden=()=>{if(document.hidden){if(!element.paused)element.pause();}else start();};
    document.addEventListener('visibilitychange',hidden);
    return()=>{tween?.kill();observer.disconnect();document.removeEventListener('visibilitychange',hidden);};
  },[source,motion,failed]);
  const replay=()=>{
    const element=video.current;if(!element||failed)return;
    hasPlayed.current=true;element.currentTime=0;setSettled(false);element.muted=preferredMuted.current;setMuted(element.muted);
    void element.play().catch(()=>{});
  };
  const toggleSound=()=>{
    const element=video.current;if(!element)return;
    preferredMuted.current=!element.muted;element.muted=preferredMuted.current;setMuted(element.muted);
    if(element.paused&&!element.ended)void element.play().catch(()=>{});
  };
  return <div className={'character-area tie-character-area'+(settled?' is-settled':'')}>
    <div className="portrait-frame">
      {assets&&source&&!failed?<TieScene videoRef={video} source={media.source!} alpha={media.media} nativeFallback={media.nativeFallback} onFallback={media.fallback} onLoadedMetadata={media.restore}
        poster={media.poster} muted={muted} motion={motion} clock={clock.current}
        onPlay={()=>setPlaying(true)}
        onPause={()=>setPlaying(false)}
        onEnded={()=>{setPlaying(false);setSettled(true);}}
        onError={()=>{if(!media.fallback())setFailed(true);}}
      />:assets?<img className="tie-poster-fallback" src={small?assets.mobilePoster:assets.poster} alt="Kiran’s final composed pose from the tie-adjust film"/>:null}
    </div>
    <div className="intro-controls tie-controls" role="group" aria-label="Tie-adjust film controls">
      <button className="quiet-button" disabled={!assets||failed} onClick={replay} aria-label="Replay tie adjustment"><span aria-hidden="true">↺ </span>{playing?'Playing':'Replay movement'}</button>
      <button className="quiet-button sound-button" disabled={!assets||failed} onClick={toggleSound} aria-pressed={!muted} aria-label={muted?'Turn tie film sound on':'Mute tie film'}><span aria-hidden="true">{muted?'♩':'♪'}</span>{muted?' Sound on':' Mute'}</button>
    </div>
  </div>;
}
