import {useRef,useState,type RefObject} from 'react';
import manifest from '../character-alpha.json';
export type AlphaMedia={source:string;poster:string;texturePoster:string;width:number;height:number;fps:number;boxes:number[][]};
export function useCharacterMedia(original:string|undefined,originalPoster:string,video:RefObject<HTMLVideoElement|null>){
 const media=original?(manifest as Record<string,AlphaMedia>)[original]:undefined;
 const [nativeFallback,setNativeFallback]=useState(false);
 const saved=useRef<{time:number;playing:boolean;muted:boolean}|null>(null);
 const fallback=()=>{
  if(!media||nativeFallback)return false;
  const v=video.current;
  saved.current=v?{time:v.currentTime,playing:!v.paused&&!document.hidden,muted:v.muted}:null;
  setNativeFallback(true);return true;
 };
 const restore=()=>{
  const v=video.current,state=saved.current;if(!v||!state)return;
  saved.current=null;v.muted=state.muted;
  v.currentTime=Math.min(state.time,Math.max(0,v.duration-.04));
  if(state.playing)void v.play().catch(()=>{});else v.pause();
 };
 return {source:media&&!nativeFallback?media.source:original,poster:media&&!nativeFallback?media.poster:originalPoster,media,nativeFallback,fallback,restore};
}
