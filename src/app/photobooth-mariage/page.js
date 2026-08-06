// ============================================================
//  Page d'atterrissage publicitaire — angle « plutôt qu'un photobooth ».
//
//  L'angle attaque une dépense déjà budgétée. Quelqu'un qui cherche un
//  photobooth a admis le principe (des photos par les invités) et le prix
//  (quelques centaines d'euros) : il ne reste qu'à montrer que la borne est
//  la mauvaise façon d'obtenir ce qu'il veut.
//
//  Désindexée volontairement : le journal a déjà deux articles sur ces mots
//  (/journal/alternative-photobooth-mariage, /journal/prix-photobooth-mariage)
//  et deux pages du même site sur la même recherche se nuisent.
// ============================================================

import { BRAND } from '../../lib/brand'
import { formatPrice } from '../../lib/pricing'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../components/lp/Blocs'

const TITRE = 'Le photobooth de votre mariage coûte 500 €. Le nôtre, 14,99 €'
const DESCRIPTION =
  "Plutôt qu'une borne dans un coin de la salle, un QR code sur les tables : chaque invité devient le photobooth, partout et toute la nuit. Sans application, sans matériel."

export const metadata = {
  title: TITRE,
  description: DESCRIPTION,
  // Page publicitaire : elle ne doit pas concurrencer les articles du journal.
  robots: { index: false, follow: true },
  openGraph: {
    title: `${TITRE} — ${BRAND.name}`,
    description: DESCRIPTION,
    type: 'website',
  },
}

// Ce qu'on reproche vraiment à une borne. Non pas son prix seul, mais le fait
// qu'elle concentre en un point ce qui devrait être partout.
const BORNE = [
  {
    ic: '📍',
    t: "Elle ne voit qu'un mètre carré",
    s: "La borne est dans un coin. Le vin d'honneur est dehors, la table des cousins est à l'autre bout, et la piste de danse ne viendra pas à elle.",
  },
  {
    ic: '⏰',
    t: 'Elle vit deux heures',
    s: "La queue au début, puis plus personne. À une heure du matin — quand la fête commence vraiment — la borne clignote toute seule.",
  },
  {
    ic: '🚚',
    t: 'Il faut la faire venir',
    s: "Livraison, installation, place à prévoir, reprise le lendemain. Un prestataire de plus à coordonner le jour où vous avez le moins de temps.",
  },
]

const COMPARAISON = {
  eux: [
    '400 à 800 € la soirée',
    'Un coin de la salle immobilisé',
    'La queue, puis plus personne après 1 h',
    'Les photos d\'un seul endroit',
    'À installer, à rendre',
    'Des tirages qui se perdent',
  ],
  nous: [
    `À partir de ${formatPrice(1499)}, une seule fois`,
    'Rien à poser, sinon une affiche',
    'Dans toutes les poches, toute la nuit',
    'Les photos de partout à la fois',
    'Prêt en deux minutes',
    'Tout téléchargeable en pleine définition',
  ],
}

const FAQ_ANGLE = [
  {
    q: 'Un photobooth, ce n\'est pas plus amusant sur le moment ?',
    a: "La borne fait rire ceux qui font la queue devant. Ici, l'amusement se déplace : chacun photographie sa table, ses amis, le marié qui n'a rien vu venir. Et la surprise du lendemain, quand tout se révèle d'un coup, aucune borne ne la produit.",
  },
  {
    q: 'Et les accessoires, les tirages papier ?',
    a: "Nous ne fournissons ni perruques ni imprimante. En revanche vous récupérez tous les fichiers en pleine définition : de quoi faire tirer un album, un livre photo ou les quelques clichés que vous voudrez encadrer — pour bien moins que la location d'une borne.",
  },
]

export default function Page() {
  return (
    <div className="site lp">
      <Entete />

      <main className="site-inner">
        <section className="hero hero-split lp-hero">
          <div>
            <div className="eyebrow">Alternative au photobooth · mariage</div>
            <h1>Un photobooth coûte<br />500 €. Le nôtre,<br />{formatPrice(1499)}.</h1>
            <p>
              Et il n'occupe aucun coin de la salle : chacun de vos invités devient
              le photobooth, partout et toute la nuit.
            </p>
            <p style={{ marginTop: 10 }}>
              Un QR code sur les tables, un nombre de clichés compté par personne,
              et tout qui se révèle le lendemain — dans un seul album.
            </p>
            <div className="hero-cta"><Bouton /></div>
            <ul className="lp-ticks">
              <li>Aucun matériel à louer</li>
              <li>Aucune application à installer</li>
              <li>Paiement unique, sans abonnement</li>
            </ul>
          </div>
          <div className="hero-duo">
            <div className="phone phone-avant">
              <img src="/accueil/appareil-photo.webp" width="640" height="1385"
                alt="Le téléphone d'un invité servant d'appareil photo : viseur, compteur de poses et déclencheur." />
            </div>
            <div className="phone phone-arriere">
              <img src="/accueil/galerie-photos.webp" width="640" height="1385"
                alt="L'album du mariage révélé le lendemain : les photos de tous les invités réunies." />
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Le problème d'une borne, ce n'est pas son prix</h2>
          <div className="section-sub">
            C'est qu'elle concentre en un point ce qui devrait être partout.
          </div>
          <div className="steps-grid">
            {BORNE.map((b, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{b.ic}</div>
                <h3>{b.t}</h3>
                <p>{b.s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Point par point</h2>
          <div className="section-sub">
            Le même besoin — des photos prises par ceux qui étaient là — traité de
            deux façons.
          </div>
          <div className="lp-compare">
            <div className="lp-col">
              <div className="lp-col-h">Un photobooth loué</div>
              <ul>
                {COMPARAISON.eux.map((l, i) => <li key={i}><span>✕</span> {l}</li>)}
              </ul>
            </div>
            <div className="lp-col lp-col-nous">
              <div className="lp-col-h">{BRAND.name}</div>
              <ul>
                {COMPARAISON.nous.map((l, i) => <li key={i}><span>✓</span> {l}</li>)}
              </ul>
            </div>
          </div>
          <div className="lp-mid-cta"><Bouton /></div>
        </section>

        <Etapes
          titre="Rien à installer, rien à rendre"
          sousTitre="Une affiche sur les tables remplace la borne, le technicien et le camion."
        />
        <Retours />
        <Revelation />
        <Controle />
        <Tarifs />
        <Faq enPlus={FAQ_ANGLE} />
        <Confiance />
        <CtaFinal
          titre="Gardez les 500 € pour le champagne"
          sous="Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire."
        />
      </main>

      <PiedLp />
      <Sticky />
    </div>
  )
}
