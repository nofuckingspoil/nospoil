import { BRAND } from '../lib/brand'

// Logo Déclic : marque orange + objectif d'appareil photo.
// size = taille de la pastille ; dark = variante pour fond sombre.
export default function Logo({ size = 46, showName = true, dark = false, nameSize = 30 }) {
  const lens = Math.round(size * 0.5)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.26, background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 8px 20px rgba(236,91,51,.32)', position: 'relative', flex: '0 0 auto',
      }}>
        <div style={{
          width: lens, height: lens, borderRadius: '50%',
          border: '3px solid #FCF8F0', background: '#14161F',
          boxShadow: 'inset 0 0 0 3px #14161F, inset 0 0 0 5px rgba(244,193,78,.9)',
        }} />
        <div style={{ position: 'absolute', top: size * 0.15, right: size * 0.15, width: size * 0.15, height: size * 0.15, borderRadius: 2, background: 'var(--amber)' }} />
      </div>
      {showName && (
        <span style={{
          fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800,
          fontSize: nameSize, letterSpacing: '-.03em', color: dark ? '#fff' : 'var(--ink)',
        }}>{BRAND.name}</span>
      )}
    </div>
  )
}
