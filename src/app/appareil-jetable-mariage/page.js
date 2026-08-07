// ============================================================
//  Page d'atterrissage publicitaire — angle « le téléphone devient jetable ».
//
//  L'angle ne vend pas un service photo, il vend une transformation : les
//  cent téléphones déjà dans les poches de vos invités deviennent cent
//  appareils jetables. Rien à louer, rien à distribuer, rien à ramasser.
//
//  Désindexée volontairement : le journal a déjà un article sur ce mot-clé
//  (/journal/appareil-photo-jetable-mariage), et deux pages du même site qui
//  visent la même recherche se privent mutuellement de position. Le trafic
//  d'une page publicitaire vient de la publicité, pas de Google.
// ============================================================

import { BRAND } from '../../lib/brand'
import { formatPrice } from '../../lib/pricing'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../components/lp/Blocs'

const TITRE = 'Transformez les téléphones de vos invités en appareils jetables'
const DESCRIPTION =
  "Un QR code, et chaque téléphone devient un jetable : un nombre de photos compté, aucun aperçu, tout se développe le lendemain. Sans application. Gratuit jusqu'à 5 invités."

export const metadata = {
  title: TITRE,
  description: DESCRIPTION,
  // Page publicitaire : elle ne doit pas concurrencer l'article du journal.
  robots: { index: false, follow: true },
  openGraph: {
    title: `${TITRE} — ${BRAND.name}`,
    description: DESCRIPTION,
    type: 'website',
  },
}

// Ce que le jetable faisait, et que le téléphone a fait disparaître. C'est
// exactement ce que la contrainte réinstalle.
const JETABLE = [
  {
    ic: '🎞️',
    t: 'Un nombre de poses compté',
    s: "Dix photos, pas trois cents. On regarde avant de déclencher, on attend le bon moment. C'est la rareté qui faisait la valeur d'une photo de jetable.",
  },
  {
    ic: '🙈',
    t: 'Aucun aperçu, aucun tri',
    s: "Personne ne revoit son cliché pour le refaire en mieux. Ce qui est pris est pris — avec les yeux fermés, le flou et le fou rire.",
  },
  {
    ic: '🌅',
    t: 'On développe le lendemain',
    s: "L'album reste scellé jusqu'à l'heure que vous fixez. L'attente fait partie du plaisir, exactement comme quand on rapportait la pellicule au labo.",
  },
]

// Le vrai jetable posé sur les tables est la solution que beaucoup envisagent
// avant nous. Elle a un charme réel, et une addition qu'on découvre tard :
// l'appareil, puis le développement, puis la numérisation — à multiplier par
// le nombre de tables, et à ramasser un par un le lendemain.
const CONTRE_LE_VRAI = {
  eux: [
    "12 à 18 € l'appareil, autant pour le développement",
    'À acheter, à poser, puis à récupérer un par un',
    '27 poses pour une table entière',
    'Deux semaines avant de voir quoi que ce soit',
    'Les ratés se paient au même prix',
    'Un appareil oublié, ce sont ses photos perdues',
  ],
  nous: [
    `${formatPrice(1499)} pour tout le mariage, développement compris`,
    'Rien à acheter, rien à ramasser',
    'Le nombre de poses que vous fixez, pour chacun',
    "L'album s'ouvre le lendemain",
    'Une photo ratée se reprend sans en perdre une',
    'Chaque cliché est à l\'abri dès le déclenchement',
  ],
}

const FAQ_ANGLE = [
  {
    q: 'Les photos ressemblent vraiment à du jetable ?',
    a: "Oui, si vous le voulez. L'album propose cinq pellicules, dont une « Jetable » avec le grain, la dominante chaude et la date incrustée dans le coin. L'effet est cuit dans le fichier que vous téléchargez, ce n'est pas juste un filtre d'affichage.",
  },
  {
    q: 'Pourquoi pas de vrais appareils jetables ?',
    a: "Comptez 12 à 15 € l'appareil, plus le développement. Pour cinquante invités, on dépasse vite les 800 €, il faut les distribuer, les récupérer, et espérer qu'aucun ne finisse dans une poche de veste. Ici, l'appareil est déjà dans leur main.",
  },
]

export default function Page() {
  return (
    <div className="site lp">
      <Entete />

      <main className="site-inner">
        <section className="hero hero-split lp-hero">
          <div>
            <div className="eyebrow">Appareil photo jetable · mariage</div>
            <h1>Transformez les<br />téléphones de vos<br />invités en jetables.</h1>
            <p>
              Un nombre de photos compté. Aucun aperçu, aucun tri. Et tout qui se
              développe le lendemain, dans un seul album.
            </p>
            <p style={{ marginTop: 10 }}>
              Cent appareils photo sont déjà dans les poches de vos invités. Il ne
              leur manquait qu'une pellicule.
            </p>
            <div className="hero-cta"><Bouton /></div>
            <ul className="lp-ticks">
              <li>Rien à louer, rien à ramasser</li>
              <li>Aucune application à installer</li>
              <li>Vraie pellicule Jetable à l'export</li>
            </ul>
          </div>
          <div className="hero-duo">
            <div className="phone phone-avant">
              <img src="/accueil/appareil-photo.webp" width="640" height="1385"
                alt="Le téléphone d'un invité transformé en appareil jetable : viseur, compteur de poses et déclencheur." />
            </div>
            <div className="phone phone-arriere">
              <img src="/accueil/galerie-photos.webp" width="640" height="1385"
                alt="L'album développé le lendemain : les photos de tous les invités réunies." />
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Ce qui rendait un jetable irremplaçable</h2>
          <div className="section-sub">
            Ce n'est pas la qualité d'image. C'est la contrainte — et elle se remet.
          </div>
          <div className="steps-grid">
            {JETABLE.map((j, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{j.ic}</div>
                <h3>{j.t}</h3>
                <p>{j.s}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Et de vrais jetables sur les tables ?</h2>
          <div className="section-sub">
            L'idée est belle. C'est l'addition, et le lendemain, qui déçoivent.
          </div>
          <div className="lp-compare">
            <div className="lp-col">
              <div className="lp-col-h">Dix jetables achetés</div>
              <ul>
                {CONTRE_LE_VRAI.eux.map((l, i) => <li key={i}><span>✕</span> {l}</li>)}
              </ul>
            </div>
            <div className="lp-col lp-col-nous">
              <div className="lp-col-h">{BRAND.name}</div>
              <ul>
                {CONTRE_LE_VRAI.nous.map((l, i) => <li key={i}><span>✓</span> {l}</li>)}
              </ul>
            </div>
          </div>
          <p className="mono small muted" style={{ textAlign: 'center', marginTop: 18 }}>
            Dix appareils pour cinquante invités : entre 240 et 360 €, et 270 poses en tout.
          </p>
          <div className="lp-mid-cta"><Bouton /></div>
        </section>

        <Etapes
          titre="Une affiche, un scan, une pellicule"
          sousTitre="Vos invités n'ont rien à installer ni à comprendre. Ils scannent, ils déclenchent."
        />
        <Retours />
        <Revelation />
        <Pellicules />
        <Controle />
        <Tarifs />
        <Faq enPlus={FAQ_ANGLE} />
        <Confiance />
        <CtaFinal
          titre="Donnez une pellicule à chacun de vos invités"
          sous="Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire."
        />
      </main>

      <PiedLp />
      <Sticky />
    </div>
  )
}
