// ============================================================
//  Image d'aperçu des pages publiques (accueil, guide, blog).
//
//  Séparée de lib/og.js, qui dessine les aperçus d'événements et interroge
//  la base : ici rien à charger, la carte est entièrement statique. Ça évite
//  d'embarquer Supabase dans des routes qui n'en ont aucun besoin.
// ============================================================
import { ImageResponse } from 'next/og'

export const TAILLE_OG = { width: 1200, height: 630 }

// Dégradé « argentique » de la marque, repris du handoff design.
const FOND = 'linear-gradient(150deg,#F7C26B 0%,#EE7A45 45%,#A23D5C 100%)'

// `etiquette` situe la page (ex. « Guide gratuit »), `pied` reprend les
// arguments qui lèvent les objections les plus fréquentes.
export function carteSite({ titre, accroche, etiquette = null, pied = 'Aucune appli · Gratuit jusqu\'à 5 invités' }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '76px 90px',
          background: FOND, color: '#fff', fontFamily: 'sans-serif',
        }}
      >
        {/* Logo : la pastille sombre et son cercle orange, comme sur le site. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, background: '#14161F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 21, height: 21, borderRadius: 999, border: '3px solid #EE7A45' }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 1 }}>Time to Flash</div>
          {etiquette && (
            <div style={{
              display: 'flex', marginLeft: 10, padding: '7px 16px', borderRadius: 999,
              background: 'rgba(20,22,31,.28)', fontSize: 19, letterSpacing: 2,
              textTransform: 'uppercase',
            }}>
              {etiquette}
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', fontSize: titre.length > 46 ? 64 : 76, fontWeight: 800,
          lineHeight: 1.08, marginTop: 38, letterSpacing: -1.5,
          textShadow: '0 2px 20px rgba(0,0,0,.18)',
        }}>
          {titre}
        </div>

        <div style={{
          display: 'flex', fontSize: 31, marginTop: 24, lineHeight: 1.35,
          opacity: 0.93, maxWidth: 900,
        }}>
          {accroche}
        </div>

        <div style={{
          display: 'flex', marginTop: 'auto', alignItems: 'center',
          justifyContent: 'space-between', fontSize: 22,
        }}>
          <div style={{ display: 'flex', letterSpacing: 2.5, textTransform: 'uppercase', opacity: 0.78 }}>
            {pied}
          </div>
          <div style={{ display: 'flex', fontWeight: 700, opacity: 0.95 }}>timetoflash.fr</div>
        </div>
      </div>
    ),
    TAILLE_OG
  )
}
