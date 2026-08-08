// ============================================================
//  Page d'atterrissage publicitaire : angle « revivez votre mariage ».
//
//  Reprise du one-pager d'origine, et volontairement l'exact opposé de
//  /photos-mariage-invites : celle-ci promet quelque chose, l'autre constate
//  un manque. Même cible, même produit, même prix : seul le cadrage change.
//
//  C'est le test le plus classique en publicité, et le plus instructif :
//  selon l'audience, la promesse et le regret ne coûtent pas le même clic.
//  Comparer deux angles proches ne sert à rien s'ils ne diffèrent que par la
//  formulation ; ici ils diffèrent par ce qu'ils font ressentir.
//
//  Désindexée : elle vise les mêmes recherches que sa jumelle, déjà indexée.
// ============================================================

import { BRAND } from '../../lib/brand'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../components/lp/Blocs'

const TITRE = 'Revivez votre mariage, sous un autre angle'
const DESCRIPTION =
  "Les fous rires à table, la piste de danse, les moments volés. Vos invités scannent un QR code, photographient, et tout se développe à la date que vous choisissez, comme une vraie pellicule."

export const metadata = {
  title: TITRE,
  description: DESCRIPTION,
  // Variante publicitaire d'une page déjà indexée : on ne se dédouble pas.
  robots: { index: false, follow: true },
  openGraph: {
    title: `${TITRE} | ${BRAND.name}`,
    description: DESCRIPTION,
    type: 'website',
  },
}

// Ce qu'on gagne, et non ce qu'on perd. La nuance porte toute la page : les
// quatre points promettent, là où les autres angles alertent.
const ADORER = [
  {
    ic: '💞',
    t: "Les moments que personne d'autre ne capte",
    s: "Votre journée vue de l'intérieur : les fous rires à table, la piste de danse à deux heures, les regards que le photographe n'était pas là pour voir.",
  },
  {
    ic: '👵',
    t: 'Même mamie y arrive',
    s: "On scanne, on photographie, c'est fini en cinq secondes. Aucune application, aucun compte, aucune explication à donner pendant le vin d'honneur.",
  },
  {
    ic: '🎞️',
    t: "L'effet pellicule à développer",
    s: "Rien n'apparaît avant l'heure que vous fixez. Le plaisir de tout découvrir d'un coup, ensemble, comme une pellicule qu'on va chercher au labo.",
  },
  {
    ic: '🎛️',
    t: 'Votre tableau de bord privé',
    s: "Le suivi des invités, la photo de couverture, le choix de la pellicule, et tout l'album en un fichier, d'un seul clic, quand vous voulez.",
  },
]

const FAQ_ANGLE = [
  {
    q: 'À quel moment faut-il le mettre en place ?',
    a: "Quand vous voulez, même la veille. L'album se crée en deux minutes et l'affiche à imprimer se génère dans la foulée. Beaucoup s'y prennent la semaine d'avant, le temps de faire imprimer les affiches tranquillement.",
  },
  {
    q: 'Ça marche aussi pour le brunch du lendemain ?',
    a: "Oui : vous choisissez la date de début et celle de la révélation. Une soirée, un week-end entier, ou du vin d'honneur au brunch : c'est le même album, et tout s'y ajoute.",
  },
]

export default function Page() {
  return (
    <div className="site lp">
      <Entete />

      <main className="site-inner">
        <section className="hero hero-split lp-hero">
          <div>
            <div className="eyebrow">L'appareil photo jetable · version mariage</div>
            <h1>Revivez votre<br />mariage, sous un<br />autre angle.</h1>
            <p>
              Les fous rires à table, la piste de danse, les moments volés. Vos
              invités scannent, photographient, et tout se développe à la date de
              révélation, comme une vraie pellicule.
            </p>
            <p style={{ marginTop: 10 }}>
              Un QR code sur chaque table, un nombre de clichés compté par invité,
              et un seul album à la fin.
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
                alt="Le téléphone d'un invité transformé en appareil photo jetable pendant le mariage." />
            </div>
            <div className="phone phone-arriere">
              <img src="/accueil/galerie-photos.webp" width="640" height="1385"
                alt="L'album du mariage révélé : les photos de tous les invités réunies." />
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Pourquoi vous allez l'adorer</h2>
          <div className="section-sub">
            Votre mariage, raconté par les cent personnes qui l'ont vécu avec vous.
          </div>
          <div className="steps-grid">
            {ADORER.map((a, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{a.ic}</div>
                <h3>{a.t}</h3>
                <p>{a.s}</p>
              </div>
            ))}
          </div>
          <div className="lp-mid-cta"><Bouton /></div>
        </section>

        <Etapes
          titre="Comment ça marche"
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
          titre="Votre mariage vous attend, vu d'ailleurs"
          sous="Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire."
        />
      </main>

      <PiedLp />
      <Sticky />
    </div>
  )
}
