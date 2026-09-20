import {useEffect,useRef} from 'react';
export type ArtState={progress:number;selection:number};
export function SceneArt({kind,motion,state}:{kind:'journey'|'work';motion:boolean;state:ArtState}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{let cancelled=false,dispose:(()=>void)|undefined;void import('./world').then(({createWorld})=>{if(!cancelled&&host.current)dispose=createWorld(host.current,kind,motion,state);}).catch(()=>{});return()=>{cancelled=true;dispose?.();};},[kind,motion,state]);
 useEffect(()=>{host.current?.dispatchEvent(new Event('scenechange'));},[state.selection,state.progress]);
 return <div ref={host} className={'scene-art scene-art-'+kind} aria-hidden="true">
  <svg className="art-fallback" viewBox="0 0 900 600"><defs><radialGradient id={'pool-'+kind}><stop stopColor="#dc9264" stopOpacity=".18"/><stop offset="1" stopColor="#dc9264" stopOpacity="0"/></radialGradient></defs><ellipse cx="600" cy="510" rx="270" ry="65" fill={'url(#pool-'+kind+')'}/><g fill="none" stroke="#b68057"><circle cx="610" cy="280" r="180" opacity=".4"/><circle cx="610" cy="280" r="154" opacity=".18"/><ellipse cx="610" cy="490" rx="220" ry="44" opacity=".3"/><path d="M610 280L728 170M610 280L527 300" opacity=".6"/></g></svg>
 </div>;
}
