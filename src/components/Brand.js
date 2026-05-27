'use client'
import { useMemo } from 'react'

// "no.spoil" wordmark — variable. The dot is colored as a checkmark dot.
export function Wordmark({ size = 28, white = false }) {
  const color = white ? '#F6F4EE' : 'var(--ink)';
  const dot = 'var(--accent)';
  return (
    <span className="wm" style={{ fontSize: size, color }}>
      <span className="wm-no">no</span>
      <span className="wm-dot" style={{ background: dot }} />
      <span className="wm-spoil">spoil</span>
    </span>
  );
}

// Certified seal — circular sticker, "NO SPOIL · CERTIFIED" curved, checkmark center
export function CertifiedBadge({ size = 140, rotate = -8, dark = false }) {
  const id = useMemo(() => 'curve-' + Math.random().toString(36).slice(2, 8), []);
  const bg = dark ? '#0E0E10' : '#F6F4EE';
  const fg = dark ? '#F6F4EE' : '#0E0E10';
  const accent = 'var(--accent)';
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ transform: `rotate(${rotate}deg)`, display: 'block' }}>
      <defs>
        <path id={id} d="M 100,100 m -78,0 a 78,78 0 1,1 156,0 a 78,78 0 1,1 -156,0" />
      </defs>
      {/* outer scalloped ring */}
      <g>
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const x = 100 + Math.cos(a) * 95;
          const y = 100 + Math.sin(a) * 95;
          return <circle key={i} cx={x} cy={y} r="5" fill={accent} />;
        })}
      </g>
      <circle cx="100" cy="100" r="90" fill={bg} />
      <circle cx="100" cy="100" r="88" fill="none" stroke={fg} strokeWidth="1.5" strokeDasharray="2 4" />
      {/* curved text */}
      <text fill={fg} style={{ fontFamily: 'var(--font-display)', fontSize: 13, letterSpacing: '0.18em', fontWeight: 800 }}>
        <textPath xlinkHref={`#${id}`} startOffset="0">
          NO SPOIL · CERTIFIED · NO SPOIL · CERTIFIED ·
        </textPath>
      </text>
      {/* center */}
      <circle cx="100" cy="100" r="44" fill={accent} />
      <path d="M 80,102 L 95,116 L 122,86" fill="none" stroke={fg} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <text x="100" y="148" textAnchor="middle" fill={fg} style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.25em', fontWeight: 800 }}>
        DEPUIS 2026
      </text>
    </svg>
  );
}

// Cycling pictogram (sketchy)
export function CycleGlyph({ size = 60, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={(size * 60) / 100} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="22" cy="44" r="14" />
      <circle cx="78" cy="44" r="14" />
      <path d="M 22 44 L 45 22 L 65 44 M 45 22 L 56 22 M 50 22 L 78 44" />
      <path d="M 38 12 L 50 12 M 44 12 L 45 22" />
    </svg>
  );
}

// "Eye crossed" icon — anti-spoiler emblem
export function NoEye({ size = 22, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M3 21 L 21 3" />
    </svg>
  );
}
