import { useEffect, useRef } from 'react';
import { ProjectMedia } from './ProjectMedia';
import type { Project } from '../data';
export function CaseStudy({project,onClose}:{project:Project|null;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{if(!project)return;const dialog=ref.current!;const previous=document.activeElement as HTMLElement;dialog.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=old;previous?.focus();};},[project]);
 if(!project)return null;
 return <dialog ref={ref} className="case-study" aria-labelledby="case-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="case-inner"><button className="close-button" onClick={onClose} autoFocus aria-label="Close case study">Close ×</button><p className="eyebrow">{project.category}</p><h2 id="case-title">{project.title}</h2><p className="case-lead">{project.summary}</p>{[['The problem',project.problem],['The system',project.system],['My contribution',project.contribution],['Evidence & versions',project.evidence],['Scope & limitations',project.limitations]].map(([title,body])=><section key={title}><h3>{title}</h3><p>{body}</p></section>)}{project.id==='sign-language'&&<ProjectMedia/>}<div className="source-links">{project.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div><p className="source-note">Source review, not an independent runtime audit. Project applications and reported benchmarks were not reproduced for this portfolio.</p></div></dialog>;
}
