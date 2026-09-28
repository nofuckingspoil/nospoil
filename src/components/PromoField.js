'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { formatPrice } from '../lib/pricing'
import { useLangue } from './Langue'

// ============================================================
//  Champ « J'ai un code promo ».
//
//  Volontairement replié derrière un lien discret : un champ de code bien
//  visible donne à ceux qui n'en ont pas le sentiment de payer trop cher, et
//  les envoie en chercher un ailleurs plutôt que d'acheter.
//
//  Le prix affiché ici ne fait foi de rien : le serveur revérifie le code au
//  moment du paiement comme au moment de la création.
// ============================================================

export const PROMO_STORAGE_KEY = 'ttf_promo'

export default function PromoField({ maxGuests, applied, onApplied }) {
  const { t, lang } = useLangue()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const autoTried = useRef(false)

  const verifier = useCallback(async (code, { silencieux = false } = {}) => {
    const propre = (code || '').trim().toUpperCase()
    if (!propre) { setError(t({ fr: 'Entre ton code promo.', en: 'Enter your promo code.', de: 'Geben Sie Ihren Gutscheincode ein.' })); return false }
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/promo/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: propre, maxGuests }),
      })
      const d = await res.json()
      if (!d.valid) {
        onApplied(null)
        if (!silencieux) setError(d.error || t({ fr: "Ce code promo n'est pas valable.", en: 'This promo code is not valid.', de: 'Dieser Gutscheincode ist nicht gültig.' }))
        return false
      }
      onApplied({ code: d.code, label: d.label, priceCents: d.priceCents, free: d.free })
      setValue(d.code)
      setOpen(true)
      return true
    } catch {
      if (!silencieux) setError(t({ fr: 'Vérification impossible. Réessaie.', en: 'Could not check the code. Please try again.', de: 'Überprüfung nicht möglich. Bitte versuchen Sie es erneut.' }))
      return false
    } finally { setBusy(false) }
  }, [maxGuests, onApplied, t])

  // Code arrivé par un lien partenaire : on l'applique tout seul. Demander à
  // quelqu'un de recopier un code qu'on lui a déjà transmis, c'est perdre en
  // route la moitié de ceux à qui le partenaire l'a donné.
  useEffect(() => {
    if (autoTried.current) return
    autoTried.current = true
    let stocke = null
    try { stocke = localStorage.getItem(PROMO_STORAGE_KEY) } catch {}
    if (stocke) verifier(stocke, { silencieux: true })
  }, [verifier])

  // La formule a changé : un code réservé aux petites formules peut ne plus
  // convenir. On revérifie plutôt que d'annoncer un prix qui sera refusé.
  const dernierPalier = useRef(maxGuests)
  useEffect(() => {
    if (dernierPalier.current === maxGuests) return
    dernierPalier.current = maxGuests
    if (applied?.code) verifier(applied.code, { silencieux: false })
  }, [maxGuests, applied, verifier])

  function retirer() {
    onApplied(null)
    setValue('')
    setError('')
    try { localStorage.removeItem(PROMO_STORAGE_KEY) } catch {}
  }

  if (applied) {
    return (
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        background: 'rgba(46,160,90,.10)', border: '1px solid rgba(46,160,90,.35)',
        borderRadius: 12, padding: '11px 14px' }}>
        <span style={{ fontSize: 15 }}>✅</span>
        <span style={{ fontWeight: 700, fontSize: 14.5 }}>
          {applied.free
            ? t({ fr: `Code ${applied.code} : événement offert`, en: `Code ${applied.code}: event free of charge`, de: `Code ${applied.code}: Event geschenkt` })
            : t({ fr: `Code ${applied.code} : ${applied.label} appliqué`, en: `Code ${applied.code}: ${applied.label} applied`, de: `Code ${applied.code}: ${applied.label} angewendet` })}
        </span>
        {!applied.free && (
          <span className="muted" style={{ fontSize: 13.5 }}>{t({ fr: 'soit', en: 'so', de: 'also' })} {formatPrice(applied.priceCents, lang)}</span>
        )}
        <button type="button" onClick={retirer}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', textDecoration: 'underline',
            cursor: 'pointer', fontSize: 13, color: 'inherit', opacity: .7, padding: 0 }}>
          {t({ fr: 'retirer', en: 'remove', de: 'entfernen' })}
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        style={{ marginTop: 14, background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          textDecoration: 'underline', fontSize: 13.5, opacity: .7, color: 'inherit' }}>
        {t({ fr: "J'ai un code promo", en: 'I have a promo code', de: 'Ich habe einen Gutscheincode' })}
      </button>
    )
  }

  return (
    <div className="field" style={{ marginTop: 16 }}>
      <label>{t({ fr: 'Code promo', en: 'Promo code', de: 'Gutscheincode' })}</label>
      {/* .promo-row : sans elle le bouton, large par défaut sur ce site,
          écrase le champ jusqu'à le rendre invisible. */}
      <div className="promo-row">
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value.toUpperCase()); setError('') }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); verifier(value) } }}
          placeholder={t({ fr: 'MONCODE', en: 'MYCODE', de: 'MEINCODE' })} maxLength={40} autoCapitalize="characters" autoComplete="off"
        />
        <button type="button" className="btn btn-ghost promo-go" onClick={() => verifier(value)} disabled={busy}>
          {busy ? '…' : t({ fr: 'Appliquer', en: 'Apply', de: 'Anwenden' })}
        </button>
      </div>
      {error && <div className="err" style={{ marginTop: 10 }}>{error}</div>}
    </div>
  )
}
