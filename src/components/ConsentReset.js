'use client'

import { oublierConsentement } from '../lib/consent'
import { META_PIXEL_ID, GA4_ID, GOOGLE_ADS_ID } from '../lib/tracking'

// Un consentement doit pouvoir être retiré aussi facilement qu'il a été donné.
// Ce lien de pied de page rappelle le bandeau : le visiteur peut alors changer
// sa réponse dans un sens comme dans l'autre.
export default function ConsentReset() {
  if (!META_PIXEL_ID && !GA4_ID && !GOOGLE_ADS_ID) return null

  return (
    <button
      type="button"
      className="ck-reset"
      onClick={() => {
        oublierConsentement()
        // Le bandeau réapparaît en bas : on y emmène le regard.
        try { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }) } catch {}
      }}
    >
      Cookies
    </button>
  )
}
