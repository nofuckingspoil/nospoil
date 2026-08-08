// ============================================================
//  Page d'atterrissage publicitaire : angle « le photographe part à minuit ».
//
//  L'accueil parle à tous les événements et travaille pour Google ; celle-ci
//  ne parle qu'aux mariés, sans menu ni second geste, et n'existe que pour un
//  clic. Les briques communes vivent dans components/lp/Blocs.js : ici, seul
//  ce qui distingue cet angle.
//
//  Celle-ci reste indexable : son angle n'entre en concurrence avec aucun
//  article du journal. Ses deux sœurs, si.
// ============================================================

import { BRAND } from '../../lib/brand'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../components/lp/Blocs'

const TITRE = "Les photos de mariage que votre photographe n'aura jamais"
const DESCRIPTION =
  "Un QR code sur les tables, un nombre de clichés limité par invité, et toutes les photos de vos invités réunies le lendemain. Sans application. Gratuit jusqu'à 5 invités."

export const metadata = {
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: '/photos-mariage-invites' },
  openGraph: {
    title: `${TITRE} | ${BRAND.name}`,
    description: DESCRIPTION,
    url: 'https://timetoflash.fr/photos-mariage-invites',
    type: 'website',
  },
}

// Ce qui se perd aujourd'hui. Trois constats que tous les mariés reconnaissent.
const MANQUE = [
  {
    ic: '🌙',
    t: 'Votre photographe part à minuit',
    s: "Et la fête, elle, continue jusqu'à cinq heures. Les meilleures photos de la soirée sont prises après son départ, par vos invités.",
  },
  {
    ic: '📱',
    t: 'Vos invités gardent tout',
    s: "Chacun repart avec quarante photos dans son téléphone. Vous n'en verrez qu'une poignée, celles que trois personnes auront pensé à vous envoyer.",
  },
  {
    ic: '💬',
    t: 'Les groupes WhatsApp se perdent',
    s: "Trois conversations différentes, des photos compressées, et plus rien de retrouvable six mois plus tard. Le lien Drive, personne ne l'a ouvert.",
  },
]

const FAQ_ANGLE = [
  {
    q: 'Ça remplace mon photographe ?',
    a: "Non, et ce n'est pas le but. Votre photographe fait les portraits, la cérémonie, les photos de groupe. Time to Flash capte ce qu'il ne voit pas : la table des cousins, le bar à deux heures du matin, les regards entre deux danses.",
  },
]

export default function Page() {
  return (
    <div className="site lp">
      <Entete />

      <main className="site-inner">
        <section className="hero hero-split lp-hero">
          <div>
            <div className="eyebrow">Photos de mariage par vos invités</div>
            <h1>Les photos que<br />votre photographe<br />n'aura jamais.</h1>
            <p>
              Celles de trois heures du matin. Celles de la table des cousins.
              Celles que vos invités ont vues, et pas lui.
            </p>
            <p style={{ marginTop: 10 }}>
              Un QR code sur les tables, un nombre de clichés compté par personne,
              et tout qui se révèle le lendemain, dans un seul album.
            </p>
            <div className="hero-cta"><Bouton /></div>
            <ul className="lp-ticks">
              <li>Aucune application à installer</li>
              <li>Prêt en deux minutes</li>
              <li>Paiement unique, sans abonnement</li>
            </ul>
          </div>
          <div className="hero-duo">
            <div className="phone phone-avant">
              <img src="/accueil/appareil-photo.webp" width="640" height="1385"
                alt="L'appareil photo jetable ouvert dans le navigateur d'un invité, pendant un mariage." />
            </div>
            <div className="phone phone-arriere">
              <img src="/accueil/galerie-photos.webp" width="640" height="1385"
                alt="L'album du mariage révélé le lendemain : les photos de tous les invités réunies." />
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Le lendemain, il vous manquera 700 photos</h2>
          <div className="section-sub">
            Vos invités en prendront des centaines. Vous en verrez une trentaine.
          </div>
          <div className="steps-grid">
            {MANQUE.map((m, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{m.ic}</div>
                <h3>{m.t}</h3>
                <p>{m.s}</p>
              </div>
            ))}
          </div>
        </section>

        <Etapes
          titre="Trois gestes, et vous n'y pensez plus"
          sousTitre="Vous préparez l'album avant le jour J. Le reste se fait tout seul."
        />
        <Retours />
        <Revelation />
        <Pellicules />
        <Controle />
        <Tarifs />
        <Faq enPlus={FAQ_ANGLE} />
        <Confiance />
        <CtaFinal
          titre="Votre mariage mérite plus que trente photos"
          sous="Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire."
        />
      </main>

      <PiedLp />
      <Sticky />
    </div>
  )
}
