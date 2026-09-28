'use client'

import { useEffect, useState } from 'react'
import { familleNavigateur } from '../lib/camera'
import { useLangue } from './Langue'

// Icône « réglages » de Chrome (les curseurs, à gauche de l'adresse depuis 2023)
function IconeReglages({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round">
      <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
      <circle cx="16" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="16" r="2" fill="currentColor" stroke="none" />
    </svg>
  )
}

// Cadenas : ce que montrent Safari sur ordinateur et les Chrome plus anciens
function IconeCadenas({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 018 0v3" />
    </svg>
  )
}

// ============================================================
//  Caméra refusée pour de bon : le mode d'emploi pour la rouvrir
// ============================================================
// Affiché seulement quand le navigateur a enregistré le refus : à ce moment-là,
// il ne repose plus la question, et un bouton « Autoriser » ne produirait rien.
// La manipulation se fait dans le navigateur, hors de la page : aucun site ne
// peut ouvrir ces réglages à la place du participant. Restent donc les mots, et
// surtout le dessin de la barre d'adresse : c'est le bouton à toucher que
// personne ne trouve.
export default function CameraBloquee({ onReessayer }) {
  const { t, lien } = useLangue()
  const [famille, setFamille] = useState('android')
  const [hote, setHote] = useState('timetoflash.fr')

  useEffect(() => {
    setFamille(familleNavigateur())
    try { setHote(window.location.host.replace(/^www\./, '')) } catch {}
  }, [])

  const ios = famille === 'ios'

  // La pastille à toucher, dessinée dans la barre d'adresse.
  const pastille = ios
    ? <span className="camfix-chip camfix-aa">aA</span>
    : <span className="camfix-chip"><IconeReglages /></span>

  const iconeReglages = <span className="camfix-inline"><IconeReglages size={13} /></span>
  const iconeCadenas = <span className="camfix-inline"><IconeCadenas size={12} /></span>
  const etapes = ios
    ? [
        t({
          fr: <>Touche <strong>« aA »</strong> à gauche de l'adresse</>,
          en: <>Tap <strong>“aA”</strong> to the left of the address</>,
          de: <>Tippen Sie links neben der Adresse auf <strong>„aA“</strong></>,
        }),
        t({
          fr: <>Choisis <strong>« Réglages du site »</strong></>,
          en: <>Choose <strong>“Website Settings”</strong></>,
          de: <>Wählen Sie <strong>„Website-Einstellungen“</strong></>,
        }),
        t({
          fr: <>Passe <strong>Caméra</strong> sur <strong>« Autoriser »</strong></>,
          en: <>Set <strong>Camera</strong> to <strong>“Allow”</strong></>,
          de: <>Stellen Sie <strong>Kamera</strong> auf <strong>„Erlauben“</strong></>,
        }),
      ]
    : [
        t({
          fr: <>Touche l'icône {iconeReglages} (ou le {iconeCadenas}) à gauche de l'adresse</>,
          en: <>Tap the {iconeReglages} icon (or the {iconeCadenas}) to the left of the address</>,
          de: <>Tippen Sie links neben der Adresse auf das Symbol {iconeReglages} (oder das {iconeCadenas})</>,
        }),
        t({
          fr: <>Choisis <strong>« Autorisations »</strong>, ou <strong>« Paramètres du site »</strong></>,
          en: <>Choose <strong>“Permissions”</strong> or <strong>“Site settings”</strong></>,
          de: <>Wählen Sie <strong>„Berechtigungen“</strong> oder <strong>„Website-Einstellungen“</strong></>,
        }),
        t({
          fr: <>Passe <strong>Caméra</strong> sur <strong>« Autoriser »</strong></>,
          en: <>Set <strong>Camera</strong> to <strong>“Allow”</strong></>,
          de: <>Stellen Sie <strong>Kamera</strong> auf <strong>„Zulassen“</strong></>,
        }),
      ]

  return (
    <div className="camfix">
      <div className="camfix-title">{t({
        fr: 'Ta caméra est bloquée par ton navigateur',
        en: 'Your camera is blocked by your browser',
        de: 'Ihre Kamera wird von Ihrem Browser blockiert',
      })}</div>
      <p className="camfix-sub">
        {t({
          fr: "Un « Refuser » a été retenu : c'est à toi de le lui faire oublier, en trois gestes.",
          en: 'Your browser remembered a “Block”: it’s up to you to undo it, in three taps.',
          de: 'Ihr Browser hat ein „Blockieren“ gespeichert: Sie können das in drei Schritten rückgängig machen.',
        })}
      </p>

      {/* La barre d'adresse du téléphone, en miniature : la pastille à toucher
          clignote, et la flèche part d'elle pour aller vers le haut de l'écran. */}
      <div className="camfix-bar">
        {pastille}
        <span className="camfix-url">{hote}</span>
        <span className="camfix-dots">⋮</span>
      </div>
      <div className="camfix-hint">☝️ {ios
        ? t({ fr: 'en bas de ton écran', en: 'at the bottom of your screen', de: 'unten auf Ihrem Bildschirm' })
        : t({ fr: 'en haut de ton écran', en: 'at the top of your screen', de: 'oben auf Ihrem Bildschirm' })}</div>

      <ol className="camfix-steps">
        {etapes.map((texte, i) => (
          <li key={i}><span className="camfix-num">{i + 1}</span><span>{texte}</span></li>
        ))}
      </ol>

      <button type="button" className="camfix-btn"
        onClick={() => (onReessayer ? onReessayer() : window.location.reload())}>
        {t({ fr: "C'est fait, réessayer", en: 'Done, try again', de: 'Erledigt, erneut versuchen' })}
      </button>

      <p className="camfix-foot">
        {t({
          fr: "Rien ne se perd en attendant : le gros bouton blanc ouvre l'appareil photo de ton téléphone, et tes photos rejoignent l'album exactement pareil.",
          en: 'Nothing is lost in the meantime: the big white button opens your phone’s camera, and your photos join the album just the same.',
          de: 'In der Zwischenzeit geht nichts verloren: Der große weiße Knopf öffnet die Kamera Ihres Handys, und Ihre Fotos landen genauso im Album.',
        })}
      </p>
      <a className="camfix-aide" href={lien('/aide')} target="_blank" rel="noreferrer">{t({ fr: 'Voir les autres solutions →', en: 'See other solutions →', de: 'Weitere Lösungen ansehen →' })}</a>
    </div>
  )
}
