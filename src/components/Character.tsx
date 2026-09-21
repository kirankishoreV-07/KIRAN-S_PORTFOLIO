import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {useCharacterMedia} from './characterMedia';
import { EntranceScene } from './EntranceScene';

export type CharacterAssets = { entrance:string; mobile:string; foldedPoster:string; mobilePoster:string };

export function Character({ assets, motion=true, ready=true, onSound }: { assets?:CharacterAssets; motion?:boolean;ready?:boolean; onSound?:(s:{muted:boolean;toggle:()=>void;disabled:boolean})=>void }) {
  const video=useRef<HTMLVideoElement>(null);
  const autoStarted=useRef(false),preferredMuted=useRef(false),userPaused=useRef(false);
  const clock=useRef({reveal:motion?0:1,light:motion?.2:1});
  const [failed,setFailed]=useState(false),[photoFailed,setPhotoFailed]=useState(false);
  const [playing,setPlaying]=useState(false),[ended,setEnded]=useState(false),[muted,setMuted]=useState(false),[status,setStatus]=useState('');
  // The packed desktop source contains a full 1920x1080 colour half. Its file
  // size is still modest, so keep that detail on high-density phones as well.
  // The smaller encode remains available as an emergency asset, but selecting
  // it here made the face and suit visibly soft when the character was enlarged.
  const selectedSource=useRef<string|undefined>(undefined);
  if(!selectedSource.current&&assets)selectedSource.current=assets.entrance;
  const source=selectedSource.current;
  const media=useCharacterMedia(source,assets?.foldedPoster||'',video);

  useEffect(()=>{
    const element=video.current;
    if(!element||failed||!ready)return;
    if(!motion)element.pause();
    const host=element.closest<HTMLElement>('#intro');
    let inView=false,cue=false,pendingRestart=true;
    const start=(restart=pendingRestart)=>{
      if(!motion||!cue||!inView||userPaused.current||document.hidden)return;
      if(restart||element.ended){element.currentTime=0;setEnded(false);}
      pendingRestart=false;
      autoStarted.current=true;
      // Try the user's requested audible start first. If browser autoplay policy
      // rejects it, keep the choreography moving silently and expose Sound on.
      element.muted=preferredMuted.current;
      setMuted(element.muted);
      void element.play().catch((error:DOMException)=>{
        if(error.name==='AbortError'||!element.isConnected||element.error)return;
        if(error.name==='NotAllowedError'&&!preferredMuted.current){element.muted=true;setMuted(true);setStatus('The introduction is playing. Select Sound on to hear it.');void element.play().catch(()=>setStatus('Playback is ready. Select Play to begin.'));return;}
        setStatus('Playback is ready. Select Play to begin.');
      });
    };
    const context=gsap.context(()=>{},host||undefined);
    let opening:gsap.core.Timeline|undefined;
    if(motion&&!autoStarted.current){
      context.add(()=>{
        clock.current.reveal=0;clock.current.light=.2;
        opening=gsap.timeline({paused:true})
          .call(()=>{if(host)host.dataset.opening='title';},[],0)
          .fromTo('.intro-greeting',{y:10,opacity:0},{y:0,opacity:1,duration:.5,ease:'power2.out'},.08)
          .fromTo('.name-letter',{yPercent:112,rotateX:-72,rotateY:-8,scale:.94,opacity:0,filter:'blur(9px)',transformOrigin:'50% 100%'},{yPercent:0,rotateX:0,rotateY:0,scale:1,opacity:1,filter:'blur(0px)',duration:.9,stagger:{each:.032,from:'start'},ease:'power4.out'},.16)
          .fromTo('.name-scan',{xPercent:-760,opacity:0},{xPercent:760,opacity:.85,duration:1.12,ease:'power2.inOut'},.28)
          .to('.name-scan',{opacity:0,duration:.22,ease:'power1.out'},1.2)
          .fromTo('.hero-role',{y:18,opacity:0},{y:0,opacity:1,duration:.7,stagger:.1,ease:'power3.out'},.74)
          .fromTo('.hero-actions, .hero-description, .hero-bottom',{y:14,opacity:0},{y:0,opacity:1,duration:.66,stagger:.08,ease:'power2.out'},.92)
          .to(clock.current,{reveal:1,light:1,duration:1.05,ease:'power2.out'},.92)
          .fromTo('.intro-controls',{y:8,opacity:0},{y:0,opacity:1,duration:.5,ease:'power2.out'},1.3)
          .call(()=>{cue=true;start(true);if(host)host.dataset.opening='film';},[],1.12)
          .call(()=>{if(host)host.dataset.opening='settled';},[],2.35);
      });
    }else{cue=true;clock.current.reveal=1;clock.current.light=1;if(host)host.dataset.opening='settled';}
    const observer=new IntersectionObserver(([entry])=>{
      const entering=entry.isIntersecting&&!inView;
      inView=entry.isIntersecting;
      if(!inView){element.pause();pendingRestart=true;userPaused.current=false;}
      else if(entering)start(true);
    },{threshold:.2});observer.observe(element);
    const heroObserver=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&!document.hidden)opening?.play();else opening?.pause();},{threshold:0});if(host)heroObserver.observe(host);
    const hidden=()=>{if(document.hidden){element.pause();opening?.pause();}else if(host&&host.getBoundingClientRect().bottom>0&&host.getBoundingClientRect().top<innerHeight)opening?.play();};
    document.addEventListener('visibilitychange',hidden);
    return()=>{observer.disconnect();heroObserver.disconnect();document.removeEventListener('visibilitychange',hidden);context.revert();element.pause();clock.current.reveal=1;clock.current.light=1;};
  },[source,motion,failed,ready]);

  const play=(restart=false)=>{
    const element=video.current;if(!element||failed)return;
    autoStarted.current=true;userPaused.current=false;clock.current.reveal=1;clock.current.light=1;
    if(restart||element.ended)element.currentTime=0;
    element.muted=preferredMuted.current;setMuted(element.muted);setEnded(false);setStatus('');
    void element.play().catch((error:DOMException)=>{if(error.name!=='AbortError'&&element.isConnected&&!element.error)setStatus('Playback could not start. Select Play to try again.');});
  };
  const pause=()=>{
    const element=video.current;if(!element)return;
    userPaused.current=true;element.pause();
  };
  // Turn the introduction sound on, audibly. This runs from a real user gesture,
  // so the browser permits sound. The clip is short and often already finished by
  // the time the visitor clicks, so restart it from the beginning — otherwise
  // unmuting an ended clip would play nothing.
  const enableSound=()=>{
    const element=video.current;if(!element)return;
    preferredMuted.current=false;userPaused.current=false;
    element.muted=false;setMuted(false);
    element.currentTime=0;setEnded(false);
    void element.play().catch(()=>{});
  };
  const toggleSound=()=>{
    const element=video.current;if(!element)return;
    if(element.muted){enableSound();}
    else{preferredMuted.current=true;element.muted=true;setMuted(true);}
  };

  // Expose the sound state + toggle so the hero can render an always-visible
  // "Sound on / Mute" control above the fold.
  useEffect(()=>{onSound?.({muted,toggle:toggleSound,disabled:!assets||failed});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[muted,failed,assets,onSound]);

  // Autoplay policy blocks audio until a user gesture. If the browser forced the
  // intro to start muted but the visitor has not chosen to mute, unmute + play it
  // from the start on the first interaction anywhere on the page (click/tap/key).
  // Events that originate from the sound control itself are ignored so this does
  // not fight the button's own toggle (which would leave it muted).
  useEffect(()=>{
    if(!motion)return;
    const unlock=(event:Event)=>{
      const target=event.target as HTMLElement|null;
      if(target?.closest?.('.hero-sound,.intro-controls')){remove();return;}
      const element=video.current;
      const host=element?.closest<HTMLElement>('#intro');
      const inView=host?(host.getBoundingClientRect().bottom>0&&host.getBoundingClientRect().top<innerHeight):true;
      if(element&&inView&&!preferredMuted.current&&element.muted)enableSound();
      remove();
    };
    const remove=()=>{['pointerdown','touchstart','keydown'].forEach(e=>window.removeEventListener(e,unlock));};
    ['pointerdown','touchstart','keydown'].forEach(e=>window.addEventListener(e,unlock,{passive:true}));
    return remove;
  },[motion]);

  return <div className="character-area studio-character">
    <div className="portrait-frame">
      {assets&&source&&!failed?<EntranceScene videoRef={video} source={media.source!} alpha={media.media} nativeFallback={media.nativeFallback} onFallback={media.fallback} onLoadedMetadata={media.restore}
        poster={media.poster} muted={muted} motion={motion} clock={clock.current}
        onPlay={()=>{if(userPaused.current){video.current?.pause();return;}setPlaying(true);setEnded(false);setStatus('');}}
        onPause={()=>setPlaying(false)}
        onEnded={()=>{setPlaying(false);setEnded(true);}}
        onError={()=>{if(media.fallback())return;setFailed(true);setPlaying(false);setStatus('Video unavailable. Projects and Resume remain available.');}}
      />:<div className="portrait-fallback">{photoFailed?<div className="portrait-missing">KIRAN<span>AI developer</span></div>:<img className="portrait" src="/assets/kiran-photo.jpeg" alt="Kiran Kishore Venkatesan, wearing glasses and a grey suit" width="685" height="820" onError={()=>setPhotoFailed(true)}/>}</div>}
    </div>
    <div className="intro-controls professional-media-controls" role="group" aria-label="Introduction controls">
      <button className="play-button" disabled={!assets||failed} onClick={()=>playing?pause():play(ended)}><span aria-hidden="true">{playing?'Ⅱ':'▶'}</span> {playing?'Pause':ended?'Play again':'Play'}</button>
      <button className="quiet-button replay-button" disabled={!assets||failed} onClick={()=>play(true)} aria-label="Replay introduction"><span aria-hidden="true">↺</span><span className="control-label">Replay</span></button>
      <button className="quiet-button sound-button" disabled={!assets||failed} onClick={toggleSound} aria-pressed={!muted} aria-label={muted?'Turn sound on':'Mute sound'}><span aria-hidden="true">{muted?'♩':'♪'}</span><span className="control-label">{muted?'Sound on':'Mute'}</span></button>
    </div>
    {status&&<p role="status" className="sr-only">{status}</p>}
  </div>;
}
