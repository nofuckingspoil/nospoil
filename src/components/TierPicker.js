'use client'

import { TIERS, TOP_TIER, CONTACT_EMAIL, formatPrice } from '../lib/pricing'

// Diamètre de la bille du curseur. Doit rester égal à la largeur définie pour
// .wiz-tierrange dans globals.css : c'est ce qui aligne les nombres sous elle.
const THUMB = 28

// Sélecteur de formule, partagé par les variantes du tunnel de création.
//
// `inline` : posé à demeure sur un écran (pas de bouton de fermeture).
// Sinon : ouvert ponctuellement depuis l'en-tête ou le récapitulatif.
export default function TierPicker({ value, onChange, inline = false, onClose }) {
  const idx = TIERS.findIndex((t) => t.maxGuests === value)
  const tier = TIERS[idx] || TIERS[0]
  const isTop = tier.maxGuests === TOP_TIER.maxGuests

  return (
    <div className={`wiz-tierpick ${inline ? 'wiz-tierpick-inline' : ''}`}>
      <div className="wiz-tierpick-q">Vous serez combien ?</div>
      <div className="wiz-tierpick-val">
        {/* Le dernier palier disait « 300 invités ou plus » : il s'arrête pourtant
            à 300 comme les autres, et le 301e resterait à la porte. On annonce la
            borne, et on renvoie vers nous pour ce qu'il y a au-dessus. */}
        <span className="n">Jusqu&apos;à {tier.maxGuests} invités</span>
        <span className="p">{formatPrice(tier.priceCents)}</span>
      </div>
      <input
        type="range" min={0} max={TIERS.length - 1} step={1} value={idx < 0 ? 0 : idx}
        onChange={(e) => onChange(TIERS[Number(e.target.value)].maxGuests)}
        className="wiz-tierrange" aria-label="Nombre d'invités"
      />
      {/* La bille d'un curseur natif ne parcourt pas toute la largeur : elle
          s'arrête à un demi-diamètre de chaque bord. On place donc chaque nombre
          sur sa position réelle, pas sur une répartition régulière — sinon les
          deux ne tombent jamais en face. */}
      <div className="wiz-tierticks">
        {TIERS.map((t, i) => (
          <button key={t.maxGuests} type="button"
            className={t.maxGuests === tier.maxGuests ? 'on' : ''}
            style={{ left: `calc(${THUMB / 2}px + (100% - ${THUMB}px) * ${i} / ${TIERS.length - 1})` }}
            onClick={() => onChange(t.maxGuests)}>
            {t.maxGuests}
          </button>
        ))}
      </div>
      {/* Le curseur s'arrête à 300 : ceux qui visent plus grand doivent savoir
          qu'il y a une suite, et par où elle passe. */}
      {isTop && (
        <p className="wiz-tierpick-more">
          Plus de {TOP_TIER.maxGuests} invités ?{' '}
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Plus de ${TOP_TIER.maxGuests} invités`)}`}>
            Écrivez-nous
          </a>{' '}
          — nous faisons un tarif sur mesure.
        </p>
      )}
      {!inline && (
        <button type="button" className="btn btn-ghost wiz-tierpick-ok" onClick={onClose}>
          C'est noté
        </button>
      )}
    </div>
  )
}
