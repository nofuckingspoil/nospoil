// ============================================================
//  Image d'aperçu des liens partagés (Messenger, WhatsApp, Instagram…).
//
//  Elle est dessinée à la volée plutôt que reprise de la photo de couverture :
//  celle-ci est servie par des adresses signées qui expirent en quelques
//  heures, alors que les messageries gardent l'aperçu en cache bien plus
//  longtemps. Et l'on ne veut pas rendre publiques les photos des participants.
// ============================================================
import 'server-only'
import { ImageResponse } from 'next/og'
import { selectRows } from './supabase'

export const TAILLE_OG = { width: 1200, height: 630 }

// Nom de l'événement, ou null s'il est introuvable.
export async function nomEvenement(id) {
  try {
    const { data } = await selectRows('events', `id=eq.${id}&select=name,host_names`)
    const ev = Array.isArray(data) ? data[0] : null
    if (!ev) return null
    return ev.host_names || ev.name || null
  } catch { return null }
}

// La carte elle-même. `accroche` change selon qu'on invite ou qu'on partage.
export function carteOG({ titre, accroche }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '80px 90px',
          background: 'linear-gradient(150deg,#F7C26B 0%,#EE7A45 45%,#A23D5C 100%)',
          color: '#fff', fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: 0.9 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: '#14161F',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 20, height: 20, borderRadius: 999, border: '3px solid #EE7A45' }} />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>Time to Flash</div>
        </div>

        <div style={{
          display: 'flex', fontSize: titre.length > 40 ? 62 : 78, fontWeight: 800,
          lineHeight: 1.1, marginTop: 40, textShadow: '0 2px 20px rgba(0,0,0,.18)',
        }}>
          {titre}
        </div>

        <div style={{ display: 'flex', fontSize: 32, marginTop: 26, opacity: 0.92 }}>
          {accroche}
        </div>

        <div style={{
          display: 'flex', marginTop: 'auto', fontSize: 22, letterSpacing: 3,
          textTransform: 'uppercase', opacity: 0.75,
        }}>
          Aucune appli · depuis le navigateur
        </div>
      </div>
    ),
    TAILLE_OG
  )
}
