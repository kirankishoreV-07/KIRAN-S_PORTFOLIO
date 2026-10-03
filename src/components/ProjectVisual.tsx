import type { CSSProperties } from 'react';
import type { Project } from '../data';

const CAPTIONS: Record<string, string> = {
  'sign-language': 'Product UI · prototype · supported-phrase recognition',
  joulet: 'Illustrative flow · simulation-backed prototype',
};
const AGENTS = ['Inspector', 'Architect', 'Builder', 'Deployer', 'Validator'];

function Lazarus() {
  return (
    <div className="pv-media lz">
      <div className="lz-tree num" aria-hidden="true">
        <span className="lz-tree-head">repository /</span>
        <span>├─ src /</span>
        <span>│  ├─ routes /</span>
        <span className="is-hot">│  ├─ services /</span>
        <span>│  └─ models /</span>
        <span>└─ tests /</span>
      </div>
      <div className="lz-core">
        <p className="pv-kicker label">Change → context → confidence</p>
        <p className="pv-headline">Every change. <em>A clearer picture.</em></p>
        <ol className="lz-agents">
          {AGENTS.map((a, i) => <li key={a} style={{ '--i': i } as CSSProperties}><span className="lz-dot" />{a}</li>)}
        </ol>
        <span className="lz-gate label">◇ Developer approval</span>
      </div>
    </div>
  );
}

function SignLink() {
  return (
    <div className="pv-media sl">
      <img className="sl-main" src="/assets/signlink-public-access.png" alt="SignLink public-access interface for selecting service locations" loading="lazy" width="980" height="672" />
      <img className="sl-inset" src="/assets/signlink-live-workspace.png" alt="SignLink live signing and staff communication workspace" loading="lazy" width="990" height="591" />
    </div>
  );
}

function UrbanPulse() {
  return (
    <div className="pv-media up">
      <svg className="up-map" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <pattern id="up-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" /></pattern>
        </defs>
        <rect width="600" height="360" fill="url(#up-grid)" className="up-grid" />
        <path className="up-road" d="M-10 250 C 120 230, 180 120, 320 110 S 520 60, 620 80" />
        <path className="up-road up-road--minor" d="M140 -10 C 170 90, 150 200, 230 370" />
        <path className="up-road up-road--minor" d="M420 -10 C 400 120, 470 220, 450 370" />
      </svg>
      <span className="up-pin up-pin--high" style={{ '--x': '38%', '--y': '34%' } as CSSProperties}><i /></span>
      <span className="up-pin" style={{ '--x': '71%', '--y': '24%' } as CSSProperties}><i /></span>
      <span className="up-pin up-pin--low" style={{ '--x': '60%', '--y': '70%' } as CSSProperties}><i /></span>
      <div className="up-card">
        <p className="label">Illustrative report</p>
        <p className="up-card-title">Road surface damage</p>
        <p className="up-card-meta">Image + location + urgency</p>
        <span className="up-bar"><span /></span>
      </div>
    </div>
  );
}

function Vsyk() {
  return (
    <div className="pv-media vs">
      <div className="vs-phone">
        <p className="label">VSYK</p>
        <p className="pv-headline">Your groups. <em>One place.</em></p>
        {['Groups', 'Installments', 'Auctions'].map((row, i) => (
          <span className="vs-row" key={row} style={{ '--i': i } as CSSProperties}>{row}<i /></span>
        ))}
      </div>
      <div className="vs-admin">
        <p className="label">Administration</p>
        <p className="pv-headline">Clarity across <em>operations.</em></p>
        <ul>{['Members', 'Settlements', 'Reporting'].map((r) => <li key={r}>{r}</li>)}</ul>
      </div>
    </div>
  );
}

function Joulet() {
  return (
    <div className="pv-media jl">
      <div className="jl-source">
        <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="8" /><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11.3 11.3l4.2 4.2M32.5 32.5l4.2 4.2M11.3 36.7l4.2-4.2M32.5 15.5l4.2-4.2" /></svg>
        <span className="label">Signed reading</span>
      </div>
      <div className="jl-oracles">
        {['Oracle 01', 'Oracle 02', 'Oracle 03'].map((o, i) => <span key={o} style={{ '--i': i } as CSSProperties}>{o}</span>)}
      </div>
      <div className="jl-verdict">
        <span className="jl-diamond" aria-hidden="true" />
        <p className="pv-headline">Verify first. <em>Record second.</em></p>
        <div className="jl-blocks" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>
      <span className="jl-packet" aria-hidden="true" />
    </div>
  );
}

const SCENES: Record<string, () => React.JSX.Element> = { lazarus: Lazarus, 'sign-language': SignLink, urbanpulse: UrbanPulse, vsyk: Vsyk, joulet: Joulet };

export function ProjectVisual({ project: p }: { project: Project }) {
  const Scene = SCENES[p.id];
  return (
    <div
      className={'pv pv-' + p.id}
      role="img"
      aria-label={p.id === 'sign-language' ? 'SignLink public-access and communication-desk interface' : 'Illustrative system flow for ' + p.title}
    >
      <div className="pv-chrome label" aria-hidden="true">
        <span>{p.id === 'lazarus' ? 'Lazarus / Doctor' : p.title}</span>
        <span>System study</span>
      </div>
      {Scene && <Scene />}
      <div className="pv-flow" aria-hidden="true">
        {p.steps.map((step, i) => <span key={step} style={{ '--i': i } as CSSProperties}>{step}</span>)}
      </div>
      <p className="pv-caption label" aria-hidden="true">{CAPTIONS[p.id] ?? 'Illustrative system view · not a live interface'}</p>
    </div>
  );
}
