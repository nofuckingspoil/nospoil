// ============================================================
//  Générateur public d'affiche « scannez pour partager vos photos ».
//
//  Page ouverte à tous, sans compte : elle rend service seule, et fait
//  découvrir l'album photo à ceux qui n'en ont pas encore. L'outil est
//  entièrement dans le navigateur (Generateur.js), le texte autour est là
//  pour Google et pour rassurer avant impression.
// ============================================================

import Link from 'next/link'
import SiteNav from '../../components/SiteNav'
import ConsentReset from '../../components/ConsentReset'
import { BRAND } from '../../lib/brand'
import Generateur from './Generateur'

const URL = 'https://timetoflash.fr/generateur-qr-code-mariage'
const TITRE = "Générateur d'affiche QR code mariage"
const PROMESSE = "Créez gratuitement l'affiche « scannez pour partager vos photos » aux couleurs de votre mariage : vos prénoms, votre date, vos teintes, six mises en page. Affiche A4, chevalets de table, petits cartons — à imprimer chez vous ou chez un imprimeur, sans compte ni filigrane."

export const metadata = {
  title: `${TITRE} gratuit et personnalisé`,
  description: PROMESSE,
  keywords: [
    'affiche qr code mariage',
    'générateur qr code mariage',
    'panneau photos mariage',
    'qr code mariage personnalisé',
    'affiche scannez pour partager vos photos',
    'créer un qr code mariage gratuit',
    'qr code faire-part mariage',
    'qr code photos mariage',
  ],
  alternates: { canonical: '/generateur-qr-code-mariage' },
  openGraph: {
    title: `${TITRE} — ${BRAND.name}`,
    description: PROMESSE,
    url: URL,
    type: 'website',
  },
}

const ETAPES = [
  { n: '1', t: 'Collez votre lien', d: "L'adresse de votre album photo, de votre site de mariage, de votre playlist." },
  { n: '2', t: 'Choisissez le support', d: 'Affiche A4 pour l’entrée, chevalets pour les tables, petits cartons à disperser.' },
  { n: '3', t: 'Habillez-la', d: 'Vos prénoms, votre date, vos couleurs, six mises en page et sept polices.' },
  { n: '4', t: 'Imprimez', d: 'Chez vous en un clic, ou en PDF haute définition à envoyer à un imprimeur.' },
]

const USAGES = [
  {
    t: 'Le panneau « vos photos ici »',
    d: "Le plus demandé : une affiche A4 à l'entrée et des chevalets sur les tables, que les invités scannent pour envoyer leurs clichés dans un album commun.",
  },
  {
    t: 'Le faire-part et le save-the-date',
    d: "Un QR discret dans un coin du carton, qui mène au site du mariage, au plan d'accès ou au formulaire de réponse.",
  },
  {
    t: 'La liste ou la cagnotte',
    d: 'Sur le carton d’invitation ou le panneau d’entrée, plutôt qu’une longue adresse que personne ne recopie.',
  },
  {
    t: 'La playlist de la soirée',
    d: 'Un QR au bar : chacun ajoute son morceau, le DJ n’est plus interrompu toutes les dix minutes.',
  },
  {
    t: 'Le plan de table et le menu',
    d: 'Un QR sur le marque-place qui ouvre le menu détaillé, les allergènes, ou le déroulé de la journée.',
  },
  {
    t: 'Le livre d’or numérique',
    d: 'Un QR sur un chevalet, et les mots des invités arrivent dans un même endroit, avec leurs voix et leurs vidéos.',
  },
]

const FAQ = [
  {
    q: 'L’affiche est-elle vraiment gratuite, sans compte ni filigrane ?',
    r: "Oui. Tout est fabriqué dans votre navigateur, vous imprimez ou téléchargez, cela vous appartient. Pas de compte, pas de filigrane, pas d'abonnement, et pas de date d'expiration : le QR est statique, il fonctionnera toujours tant que l'adresse vers laquelle il pointe existe. Méfiez-vous des générateurs qui demandent un abonnement — leurs QR cessent souvent de fonctionner à la fin de l'essai.",
  },
  {
    q: 'Quels formats puis-je imprimer ?',
    r: "Cinq supports : l'affiche A4 pour l'entrée ou le bar, l'affiche A5 (2 par page), le chevalet de table à plier en deux (2 par page), les petits cartons à disperser sur les tables (9 par page) et un carré pour un écran ou les réseaux. Pour les formats multiples, la page A4 est composée automatiquement avec les repères de découpe et le trait de pliage.",
  },
  {
    q: 'Puis-je changer les textes de l’affiche ?',
    r: "Tous : la ligne du haut, vos prénoms, la date, la petite phrase, la consigne sous le code et la ligne du bas. Videz un champ pour le faire disparaître. Les prénoms trop longs voient leur taille s'ajuster automatiquement pour ne jamais déborder.",
  },
  {
    q: 'Mon QR code va-t-il vraiment se scanner avec des couleurs claires ?',
    r: "C'est le piège classique. Un QR pastel sur fond crème est ravissant à l'écran et illisible sur un carton imprimé. L'outil surveille le contraste entre le code et le fond de l'affiche en direct, et vous prévient dès que ça devient risqué. Sur un fond foncé, une case ajoute une pastille claire derrière le code. Utilisez aussi le bouton « Tester le scan » : visez votre écran avec votre propre téléphone avant de commander l'impression.",
  },
  {
    q: 'Quelle taille faut-il pour l’impression ?',
    r: "Les formats proposés sont déjà calibrés : le code fait environ 9 cm sur l'affiche A4, 6 cm sur le chevalet et 3 cm sur les petits cartons — assez pour être lu à bonne distance. Si vous repartez du fichier pour le retravailler, gardez au minimum 3 cm de côté pour un carton en main et 10 cm pour une affiche qu'on scanne à un mètre. Le SVG reste net à n'importe quelle taille, c'est celui que réclament les imprimeurs ; le PNG convient pour Canva ou un écran.",
  },
  {
    q: 'Puis-je mettre notre logo ou nos initiales au centre ?',
    r: "Vous pouvez placer vos initiales, un cœur, deux alliances ou un appareil photo au centre du code. Quand un motif occupe le centre, l'outil augmente automatiquement la redondance du code pour qu'il reste lisible malgré la partie masquée.",
  },
  {
    q: 'Puis-je changer la destination du QR code après l’avoir imprimé ?',
    r: "Non : un QR statique contient l'adresse elle-même, il n'y a pas d'intermédiaire qui pourrait la modifier plus tard. C'est justement ce qui le rend gratuit et éternel. Si vous pensez changer d'avis, faites pointer le QR vers une page que vous maîtrisez (votre site de mariage) et modifiez cette page plutôt que le code.",
  },
  {
    q: 'Mes informations sont-elles enregistrées quelque part ?',
    r: "Non. L'adresse que vous saisissez et les couleurs que vous choisissez ne quittent jamais votre navigateur : aucun envoi vers un serveur, aucun compte, aucune trace.",
  },
]

export default function GenerateurPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: TITRE,
        url: URL,
        description: PROMESSE,
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Web',
        inLanguage: 'fr-FR',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        publisher: { '@type': 'Organization', name: BRAND.name, url: 'https://timetoflash.fr' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.r },
        })),
      },
    ],
  }

  return (
    <div className="dj">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteNav large />

      <main aria-label={TITRE}>
        <div className="dj-wrap dj-head">
          <span className="dj-eyebrow">outil gratuit</span>
          <h1>Votre affiche « scannez pour partager vos photos »</h1>
          <p>{PROMESSE}</p>
        </div>

        <div className="dj-wrap">
          <Generateur />
        </div>

        {/* ---------- Contenu ---------- */}
        <div className="dj-wrap qg-content">
          <section>
            <h2>Comment ça marche</h2>
            <div className="qg-etapes">
              {ETAPES.map((e) => (
                <div key={e.n} className="qg-etape">
                  <span>{e.n}</span>
                  <h3>{e.t}</h3>
                  <p>{e.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Six façons de s’en servir le jour J</h2>
            <div className="qg-uses">
              {USAGES.map((u) => (
                <div key={u.t} className="qg-use">
                  <h3>{u.t}</h3>
                  <p>{u.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Trois erreurs qui ruinent un QR code le jour du mariage</h2>
            <ol className="qg-tips">
              <li>
                <strong>Trop pâle.</strong> Un QR beige sur fond ivoire ne se scanne pas dans une
                salle en lumière tamisée. Gardez un vrai écart entre la couleur des pixels et
                celle du fond — l’outil vous alerte quand l’écart devient trop faible.
              </li>
              <li>
                <strong>Trop petit.</strong> En dessous de 3 cm, un téléphone met dix secondes à
                accrocher, et vos invités abandonnent avant. Sur une affiche à scanner de loin,
                voyez large : 10 cm minimum.
              </li>
              <li>
                <strong>Sans marge.</strong> Un QR collé au bord d’un carton ou posé sur une photo
                chargée devient invisible pour l’appareil. Il lui faut une zone calme tout autour —
                elle est comprise dans les fichiers téléchargés ici, ne la rognez pas.
              </li>
            </ol>
            <p className="qg-note">
              Dernier conseil, le plus utile : imprimez <em>une</em> affiche test et faites-la
              scanner par trois téléphones différents, dont un vieil Android. C’est cinq minutes
              qui évitent 150 cartons inutilisables.
            </p>
          </section>

          <section>
            <h2>Questions fréquentes</h2>
            <div className="qg-faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.r}</p>
                </details>
              ))}
            </div>
          </section>

          <div className="dj-cta">
            <div>
              <h3>Et derrière l’affiche, vos photos ?</h3>
              <span>
                Chaque invité devient photographe, avec un nombre de clichés compté.
                Gratuit jusqu’à 5 invités, sans carte bancaire.
              </span>
            </div>
            <Link className="dj-btn dj-btn--dark" href="/create?tier=5">Créer mon album</Link>
          </div>
        </div>
      </main>

      <footer className="vfooter">
        <div className="vfooter-inner">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>{BRAND.name}</span>
          <nav className="vfooter-links">
            <Link href="/journal">Blog</Link>
            <Link href="/aide">Aide</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/politique-de-confidentialite">Confidentialité</Link>
            <ConsentReset />
          </nav>
          <span className="mono">© 2026 · Hébergé en UE · RGPD</span>
        </div>
      </footer>
    </div>
  )
}
