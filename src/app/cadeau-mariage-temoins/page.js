// ============================================================
//  Page d'atterrissage publicitaire — angle « le cadeau des témoins ».
//
//  Reprend l'angle du one-pager « spécial témoins & proches ». La cible n'est
//  pas la même que les autres pages : ce n'est pas quelqu'un qui organise son
//  mariage, c'est quelqu'un qui cherche quoi offrir. Il ne compare pas des
//  prestataires photo, il compare une enveloppe et une liste de mariage.
//
//  D'où deux différences de fond : le « vous » désigne celui qui offre et non
//  les mariés, et le prix devient un argument (on se cotise à trois) au lieu
//  d'une objection.
//
//  Indexable : aucun article du journal ne vise « cadeau de mariage ».
// ============================================================

import { BRAND } from '../../lib/brand'
import {
  Entete, Bouton, Etapes, Retours, Revelation, Controle,
  Pellicules, Tarifs, Faq, Confiance, CtaFinal, PiedLp, Sticky,
} from '../../components/lp/Blocs'

const TITRE = 'Le cadeau de mariage auquel participent tous les invités'
const DESCRIPTION =
  "Offrez aux mariés leur journée vue par ceux qui l'ont vécue avec eux. Un QR code le jour J, un album surprise qui se révèle après la fête. À partir de 14,99 €, à plusieurs si vous voulez."

export const metadata = {
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: '/cadeau-mariage-temoins' },
  openGraph: {
    title: `${TITRE} — ${BRAND.name}`,
    description: DESCRIPTION,
    url: 'https://timetoflash.fr/cadeau-mariage-temoins',
    type: 'website',
  },
}

// Pourquoi c'est le cadeau. Repris du one-pager, qui visait juste : on
// n'attaque pas le prix des autres cadeaux, on attaque leur banalité.
const CADEAU = [
  {
    ic: '🎁',
    t: 'Ça sort de la liste et de l\'enveloppe',
    s: "Le service à raclette, ils l'auront en double. Personne d'autre n'aura pensé à leur offrir leur propre mariage, raconté par leurs invités.",
  },
  {
    ic: '💞',
    t: 'Ils redécouvrent leur journée',
    s: "Un marié ne voit pas son mariage : il court. Là, il découvre enfin la table des cousins, le vin d'honneur d'en face, la piste de danse à deux heures.",
  },
  {
    ic: '🤫',
    t: 'Vous maîtrisez la surprise',
    s: "L'album reste scellé jusqu'à la date que vous fixez. Vous choisissez le moment où vous leur envoyez le lien — et vous voyez tout avant eux.",
  },
  {
    ic: '🤝',
    t: 'Facile à offrir à plusieurs',
    s: "Cotisez-vous entre témoins et proches. À deux ou trois, ça revient à cinq euros par personne pour un cadeau dont ils reparleront des années.",
  },
]

const FAQ_ANGLE = [
  {
    q: 'Les mariés ont-ils quelque chose à faire ?',
    a: "Rien du tout, et c'est le but. Vous créez l'album, vous partagez le QR code le jour J, et vous leur offrez le lien une fois tout révélé. Ils n'ont qu'à regarder.",
  },
  {
    q: 'Comment on se cotise à plusieurs ?',
    a: "Une seule personne règle et crée l'album, les autres remboursent leur part comme bon leur semble. Vous pouvez ensuite inviter les autres témoins comme co-organisateurs pour préparer et trier ensemble.",
  },
  {
    q: 'Et si je m\'y prends au dernier moment ?',
    a: "L'album se crée en deux minutes, et l'affiche à imprimer se génère dans la foulée. Vous pouvez très bien le mettre en place la veille — ou le matin même.",
  },
  {
    q: 'Qui garde les photos à la fin ?',
    a: "Les mariés, comme tout le monde : une fois l'album révélé, chacun peut le consulter et tout télécharger en pleine définition. Vous pouvez aussi leur transmettre l'accès organisateur pour qu'il devienne vraiment le leur.",
  },
]

export default function Page() {
  return (
    <div className="site lp">
      <Entete />

      <main className="site-inner">
        <section className="hero hero-split lp-hero">
          <div>
            <div className="eyebrow">L'idée cadeau · spécial témoins &amp; proches</div>
            <h1>Offrez-leur leur<br />mariage, vu par<br />ceux qui y étaient.</h1>
            <p>
              Un QR code le jour J, quelques clichés par invité, et un album
              surprise qui se révèle après la fête.
            </p>
            <p style={{ marginTop: 10 }}>
              Ils ont couru toute la journée. Offrez-leur ce qu'ils n'ont pas eu le
              temps de voir.
            </p>
            <div className="hero-cta"><Bouton>Préparer la surprise — gratuit</Bouton></div>
            <ul className="lp-ticks">
              <li>Prêt en deux minutes</li>
              <li>Aucune application, même pour mamie</li>
              <li>À partir de 14,99 €, à plusieurs si vous voulez</li>
            </ul>
          </div>
          <div className="hero-duo">
            <div className="phone phone-avant">
              <img src="/accueil/appareil-photo.webp" width="640" height="1385"
                alt="Le téléphone d'un invité transformé en appareil photo jetable pendant le mariage." />
            </div>
            <div className="phone phone-arriere">
              <img src="/accueil/galerie-photos.webp" width="640" height="1385"
                alt="L'album offert aux mariés : les photos de tous leurs invités réunies." />
            </div>
          </div>
        </section>

        <section className="section">
          <h2 className="section-title">Pourquoi c'est LE cadeau</h2>
          <div className="section-sub">
            Ils recevront des enveloppes et des articles de la liste. Un seul cadeau
            leur rendra leur journée.
          </div>
          <div className="steps-grid">
            {CADEAU.map((c, i) => (
              <div key={i} className="step-card">
                <div className="step-ic">{c.ic}</div>
                <h3>{c.t}</h3>
                <p>{c.s}</p>
              </div>
            ))}
          </div>
          <div className="lp-mid-cta"><Bouton>Préparer la surprise — gratuit</Bouton></div>
        </section>

        <Etapes
          titre="Vous préparez, ils découvrent"
          sousTitre="Tout se fait avant le jour J. Le jour même, vous n'avez qu'à partager le QR code."
        />
        <Retours />
        <Revelation cible="temoins" />
        <Pellicules />
        <Controle cible="temoins" />
        <Tarifs cible="temoins" />
        <Faq enPlus={FAQ_ANGLE} />
        <Confiance />
        <CtaFinal
          titre="Préparez-leur la surprise"
          sous="Créez leur album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire."
        />
      </main>

      <PiedLp />
      <Sticky>Préparer la surprise — gratuit →</Sticky>
    </div>
  )
}
