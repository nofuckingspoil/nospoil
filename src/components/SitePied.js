// ============================================================
//  Pied de page du site public.
//
//  Il n'avait que les pages légales, l'aide et le générateur de QR code :
//  les pages mariage n'étaient reliées à rien, et Google les connaissait à
//  peine. Il relie maintenant chaque page vitrine à toutes les autres :
//  mariage, autres occasions, ressources.
//
//  Les pages d'atterrissage publicitaires gardent leur pied réduit
//  (PiedLp) : là, chaque lien est une occasion de partir.
// ============================================================

import Link from 'next/link'
import ConsentReset from './ConsentReset'
import { SelecteurLangue } from './Langue'
import { BRAND } from '../lib/brand'
import { t } from '../lib/i18n'
import { lien } from '../lib/langue-lien'
import { OCCASIONS } from '../lib/occasions'

const MARIAGE = [
  ['/appareil-jetable-mariage', { fr: 'Appareil photo jetable de mariage', en: 'Wedding disposable camera', de: 'Einwegkamera zur Hochzeit' }],
  ['/photobooth-mariage', { fr: 'Alternative au photobooth', en: 'Photo booth alternative', de: 'Fotobox-Alternative' }],
  ['/photos-mariage-invites', { fr: 'Les photos des invités', en: "Your guests' photos", de: 'Die Fotos Ihrer Gäste' }],
  ['/cadeau-mariage-temoins', { fr: 'Le cadeau des témoins', en: 'A gift from the wedding party', de: 'Geschenk der Trauzeugen' }],
  ['/generateur-qr-code-mariage', { fr: 'Affiche QR code de mariage', en: 'Wedding QR code poster', de: 'QR-Code-Plakat zur Hochzeit' }],
]

const RESSOURCES = [
  ['/journal', { fr: 'Le blog', en: 'Blog', de: 'Blog' }],
  ['/guide', { fr: "Le guide de l'organisateur", en: 'The host’s guide', de: 'Leitfaden für Gastgeber' }],
  ['/aide', { fr: 'Aide', en: 'Help', de: 'Hilfe' }],
  ['/create', { fr: 'Créer un événement', en: 'Create an event', de: 'Event erstellen' }],
]

function Colonne({ titre, liens, lang }) {
  return (
    <div className="vfooter-col">
      <div className="vfooter-col-h">{t(titre, lang)}</div>
      <ul>
        {liens.map(([href, libelle]) => (
          <li key={href}><Link href={href === '/create' ? href : lien(href, lang)}>{t(libelle, lang)}</Link></li>
        ))}
      </ul>
    </div>
  )
}

export default function SitePied({ lang = 'fr' }) {
  const occasions = [
    ...OCCASIONS.map((o) => [`/${o.slug}`, o.nom]),
    ['/occasions', { fr: 'Toutes les occasions', en: 'All occasions', de: 'Alle Anlässe' }],
  ]
  return (
    <footer className="vfooter vfooter-riche">
      <div className="vfooter-cols">
        <Colonne lang={lang} titre={{ fr: 'Mariage', en: 'Weddings', de: 'Hochzeit' }} liens={MARIAGE} />
        <Colonne lang={lang} titre={{ fr: 'Autres occasions', en: 'Other occasions', de: 'Weitere Anlässe' }} liens={occasions} />
        <Colonne lang={lang} titre={{ fr: 'Ressources', en: 'Resources', de: 'Ratgeber' }} liens={RESSOURCES} />
      </div>
      <div className="vfooter-inner">
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>{BRAND.name}</span>
        <nav className="vfooter-links">
          <Link href={lien('/mentions-legales', lang)}>{t({ fr: 'Mentions légales', en: 'Legal notice', de: 'Impressum' }, lang)}</Link>
          <Link href={lien('/cgv', lang)}>{t({ fr: 'CGV', en: 'Terms of sale', de: 'AGB' }, lang)}</Link>
          <Link href={lien('/politique-de-confidentialite', lang)}>{t({ fr: 'Confidentialité', en: 'Privacy', de: 'Datenschutz' }, lang)}</Link>
          <ConsentReset />
        </nav>
        <SelecteurLangue style={{ color: '#fff' }} />
        <span className="mono">{t({ fr: '© 2026 · Hébergé en UE · RGPD', en: '© 2026 · Hosted in the EU · GDPR', de: '© 2026 · In der EU gehostet · DSGVO' }, lang)}</span>
      </div>
    </footer>
  )
}
