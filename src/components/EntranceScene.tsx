import '../character-alpha.css';
import {useEffect,useRef,type RefObject} from 'react';
import type {AlphaMedia} from './characterMedia';
import type {IntroClock} from './studio';
export function EntranceScene({videoRef,source,poster,alpha,nativeFallback,onFallback,onLoadedMetadata,muted,motion,clock,onPlay,onPause,onEnded,onError}:{
 alpha?:AlphaMedia;nativeFallback?:boolean;onFallback:()=>boolean;onLoadedMetadata:()=>void;
 videoRef:RefObject<HTMLVideoElement|null>;source:string;poster:string;muted:boolean;motion:boolean;clock:IntroClock;
 onPlay:()=>void;onPause:()=>void;onEnded:()=>void;onError:()=>void;
}){
 const frame=useRef<HTMLDivElement>(null);
 useEffect(()=>{const host=frame.current?.closest<HTMLElement>('#intro'),video=videoRef.current;if(!host||!frame.current||!video)return;if(nativeFallback){host.dataset.webgl='fallback';host.dataset.rendering='paused';return;}let disposed=false;let cleanup:(()=>void)|undefined;
  const fallback=()=>onFallback();host.addEventListener('characterfallback',fallback);
  void import('./studio').then(({createStudio})=>{if(!disposed&&frame.current)cleanup=createStudio(host,frame.current,video,poster,clock,motion,alpha);}).catch(()=>{if(!disposed){host.dataset.webgl='fallback';onFallback();}});
  return()=>{disposed=true;host.removeEventListener('characterfallback',fallback);cleanup?.();};},[source,poster,motion,clock,videoRef,nativeFallback,alpha]);
 return <div className="entrance-scene" ref={frame}>
  <video ref={videoRef} className="entrance-figure" src={source} poster={poster} style={alpha&&!nativeFallback?{opacity:0}:undefined} playsInline muted={muted} preload="auto" width="1920" height="1080"
   onLoadedMetadata={onLoadedMetadata} onPlay={onPlay} onPause={onPause} onEnded={onEnded} onError={onError} aria-label="Kiran walking into frame, settling and folding his arms"/>
 {alpha&&!nativeFallback&&<img className="alpha-poster" src={poster} alt="" aria-hidden="true" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',opacity:motion?0:undefined,pointerEvents:'none'}}/>}
 </div>;
}
