import { TieAdjust, type TieAssets } from './TieAdjust';
import { experience, recognition } from '../data';
const tieAssets:TieAssets={desktop:'/assets/kiran-tie-desktop.mp4',mobile:'/assets/kiran-tie-mobile.mp4',poster:'/assets/kiran-tie-poster.jpg',mobilePoster:'/assets/kiran-tie-poster-mobile.jpg'};
export function Experience({motion}:{motion:boolean}){
 return <section id="experience" className="experience-section section-padding">
  <div className="section-heading experience-heading"><p className="eyebrow">03 / EXPERIENCE &amp; RECOGNITION</p><h2>Learning by<br/><span>building.</span></h2><p>Ideas become stronger through hands-on work.<br/>Two internships. Four finalist selections.</p></div>
  <div className="experience-grid"><div id="tie-adjust" className="tie-character-host"><div className="tie-glow" aria-hidden="true"/><TieAdjust motion={motion} assets={tieAssets}/></div>
  <div className="experience-copy"><div className="experience-roles">{experience.map((r,i)=><article key={r.org} className="experience-role editorial-reveal"><div className="experience-card-top"><span className="experience-period">{r.period}</span><span className="experience-number">0{i+1}</span></div><p className="experience-discipline">{i===0?'AGENTIC SYSTEMS':'CONVERSATIONAL AI'}</p><h3>{r.role}</h3><h4>{r.org}</h4><span className="experience-location">↗ {r.location}</span><p>{r.body}</p><div className="experience-tags">{(i===0?['Repository intelligence','Developer automation']:['NLP','Real-time speech','3D avatar']).map(t=><span key={t}>{t}</span>)}</div></article>)}</div></div></div>
  <div className="recognition-block"><div className="recognition-heading"><p className="eyebrow">RECOGNITION</p><h3>Built to compete.<br/><span>Selected to present.</span></h3><p>Hackathon finalist selections</p></div><div className="recognition-list">{recognition.map((r,i)=><article className="finalist-card editorial-reveal" key={r}><span className="finalist-mark" aria-hidden="true">✦</span><span className="finalist-status">FINALIST / 0{i+1}</span><h4>{r.split(' · ')[0]}</h4><p>{r.includes(' · ')?r.split(' · ')[1]:'Hackathon finalist'}</p></article>)}</div></div>
 </section>;
}
