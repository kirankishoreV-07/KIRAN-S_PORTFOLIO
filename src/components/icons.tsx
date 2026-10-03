// Original, minimal line icons for toolkit entries with no official brand mark.
// Deliberately plain geometry, never mimicking any company's mark.
const common = { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': 'true' as const };

export function IconDatabase() { return <svg {...common}><ellipse cx="11" cy="5" rx="7" ry="2.6" /><path d="M4 5v12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V5" /><path d="M4 11c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" /></svg>; }
export function IconTarget() { return <svg {...common}><circle cx="11" cy="11" r="7.5" /><circle cx="11" cy="11" r="3.6" /><path d="M11 1v3M11 18v3M1 11h3M18 11h3" /></svg>; }
export function IconApi() { return <svg {...common}><rect x="2" y="8" width="6" height="6" rx="1.2" /><rect x="14" y="8" width="6" height="6" rx="1.2" /><path d="M8 11h6" /></svg>; }
export function IconNetwork() { return <svg {...common}><circle cx="11" cy="4" r="2.2" /><circle cx="4" cy="18" r="2.2" /><circle cx="18" cy="18" r="2.2" /><path d="M11 6.2V12M11 12 5.4 16.2M11 12l5.6 4.2" /></svg>; }
export function IconBrain() { return <svg {...common}><path d="M8.5 3.2a3 3 0 0 0-3 3v.4A2.8 2.8 0 0 0 4 9.2a2.8 2.8 0 0 0 .8 4.9 3 3 0 0 0 3.4 3.9 3 3 0 0 0 2.8-2V6.2a3 3 0 0 0-2.5-3Z" /><path d="M13.5 3.2a3 3 0 0 1 3 3v.4a2.8 2.8 0 0 1 1.5 2.6 2.8 2.8 0 0 1-.8 4.9 3 3 0 0 1-3.4 3.9 3 3 0 0 1-2.8-2V6.2a3 3 0 0 1 2.5-3Z" /></svg>; }

export const GENERIC_ICONS = { database: IconDatabase, target: IconTarget, api: IconApi, network: IconNetwork, brain: IconBrain };

// Arrows and media glyphs as vectors: text glyphs such as ↗ ▶ ♪ render as
// inconsistent emoji on some platforms.
const glyph = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, className: 'icon-arrow', 'aria-hidden': 'true' as const };

export function IconArrowUpRight() { return <svg {...glyph}><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>; }
export function IconArrowRight() { return <svg {...glyph}><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></svg>; }
export function IconArrowLeft() { return <svg {...glyph}><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></svg>; }
export function IconArrowDown() { return <svg {...glyph}><path d="M12 4v12" /><path d="m6 12 6 6 6-6" /><path d="M5 20h14" /></svg>; }
export function IconArrowUp() { return <svg {...glyph}><path d="M12 20V8" /><path d="m6 12 6-6 6 6" /></svg>; }
export function IconClose() { return <svg {...glyph}><path d="M6 6l12 12M18 6 6 18" /></svg>; }
export function IconPlay() { return <svg {...glyph} fill="currentColor" stroke="none"><path d="M8 5.5v13a.6.6 0 0 0 .9.5l10.4-6.5a.6.6 0 0 0 0-1L8.9 5a.6.6 0 0 0-.9.5Z" /></svg>; }
export function IconPause() { return <svg {...glyph} fill="currentColor" stroke="none"><rect x="6.5" y="5" width="3.6" height="14" rx="1" /><rect x="13.9" y="5" width="3.6" height="14" rx="1" /></svg>; }
export function IconReplay() { return <svg {...glyph}><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4.5h4.5" /></svg>; }
export function IconSound({ muted }: { muted: boolean }) {
  return <svg {...glyph}><path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4z" />{muted ? <path d="M16.5 9.5l4 5m0-5l-4 5" /> : <><path d="M15.5 9a4 4 0 0 1 0 6" /><path d="M18 6.8a7 7 0 0 1 0 10.4" /></>}</svg>;
}
