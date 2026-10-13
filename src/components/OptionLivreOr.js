'use client'

// ============================================================
//  La case « livre d'or audio » des parcours de création payants.
//
//  Une option, posée juste sous la formule : on la coche ou non, le prix à
//  payer suit. Décochée par défaut : on ne glisse rien dans un panier sans
//  qu'on l'ait demandé. Celui qui passe à côté pourra l'acheter plus tard
//  depuis son tableau de bord.
// ============================================================

import { useLangue } from './Langue'
import { formatPrice, LIVRE_OR_CENTS } from '../lib/pricing'

// `offert` : le livre d'or offert après un essai (voir lib/cadeau-essai).
// La case est alors cochée d'office et ne se décoche pas : c'est un cadeau,
// pas un ajout au panier.
export default function OptionLivreOr({ checked, onChange, offert = false }) {
  const { t, lang } = useLangue()
  const coche = offert || checked
  return (
    <label className={`option-livre-or ${coche ? 'on' : ''} ${offert ? 'offert' : ''}`}>
      {offert
        ? <span className="option-livre-or-coche" aria-hidden="true">✓</span>
        : <input type="checkbox" checked={coche} onChange={(e) => onChange?.(e.target.checked)} />}
      <span className="option-livre-or-ic" aria-hidden="true">🎙️</span>
      <span className="option-livre-or-txt">
        {offert ? (
          <b>{t({ fr: 'Livre d’or audio', en: 'Audio guestbook', de: 'Audio-Gästebuch' })} <s>{formatPrice(LIVRE_OR_CENTS, lang)}</s> <em>{t({ fr: 'offert', en: 'free', de: 'geschenkt' })}</em></b>
        ) : (
          <b>{t({ fr: 'Ajouter le livre d’or audio', en: 'Add the audio guestbook', de: 'Audio-Gästebuch hinzufügen' })} <em>+{formatPrice(LIVRE_OR_CENTS, lang)}</em></b>
        )}
        <span>{t({
          fr: 'Chaque invité vous laisse un message vocal, signé d’un selfie. Vous seuls l’écoutez.',
          en: 'Each guest leaves you a voice message, signed with a selfie. Only you can hear it.',
          de: 'Jeder Gast hinterlässt Ihnen eine Sprachnachricht, mit einem Selfie unterschrieben. Nur Sie hören sie.',
        })}</span>
      </span>
    </label>
  )
}
