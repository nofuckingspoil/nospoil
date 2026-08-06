// ============================================================
//  Page d'atterrissage publicitaire — mariage.
//
//  Elle existe à côté de l'accueil, elle ne le remplace pas. L'accueil parle
//  à tous les événements et travaille pour Google ; celle-ci ne parle qu'aux
//  mariés, et n'a qu'un seul geste à obtenir.
//
//  D'où trois partis pris :
//    · aucun menu, aucun lien de sortie hors mentions légales ;
//    · le même bouton répété, et jamais deux gestes concurrents ;
//    · le mot « événement » banni au profit de « mariage ».
//
//  Aucun témoignage : il n'y en a pas encore de vrai. La preuve repose sur
//  des captures du produit, sur ce que la loi impose d'écrire, et sur une
//  comparaison de prix vérifiable.
// ============================================================

import Link from 'next/link'
import Logo from '../../components/Logo'
import ConsentReset from '../../components/ConsentReset'
import { BRAND } from '../../lib/brand'
import { TIERS, formatPrice } from '../../lib/pricing'

const TITRE = 'Les photos de mariage que votre photographe n\'aura jamais'
const DESCRIPTION =
  "Un QR code sur les tables, un nombre de clichés limité par invité, et toutes les photos de vos invités réunies le lendemain. Sans application. Gratuit jusqu'à 5 invités."

export const metadata = {
  title: TITRE,
  description: DESCRIPTION,
  alternates: { canonical: '/photos-mariage-invites' },
  openGraph: {
    title: `${TITRE} — ${BRAND.name}`,
    description: DESCRIPTION,
    url: 'https://timetoflash.fr/photos-mariage-invites',
    type: 'website',
  },
}

// Le geste unique de la page. Une seule adresse, pour que la mesure
// publicitaire n'ait qu'une chose à compter.
const CTA = '/create?tier=50'

// ------------------------------------------------------------
//  Les premiers retours.
//
//  ⬇️  METTRE À `true` UNIQUEMENT QUAND TINTIN ET CLAIRE AURONT DIT OUI  ⬇️
//  Ce sont des messages privés. Les publier sur une page commerciale, même
//  réduits à un prénom, demande leur accord — et il ne se rattrape pas après
//  coup. Tant que la ligne est à `false`, la section n'existe pas.
// ------------------------------------------------------------
const RETOURS_AUTORISES = true

// ------------------------------------------------------------
//  Les conversations affichées.
//
//  Chaque entrée est UNE conversation, avec ses blocs de messages. Pour en
//  ajouter une, on recopie le bloc ci-dessous et on remplace le contenu :
//  aucune autre ligne du fichier n'est à toucher.
//
//  Règle qui ne se négocie pas : ces phrases doivent avoir été réellement
//  écrites ou dites. Inventer un témoignage client est une pratique
//  commerciale trompeuse (article L121-2 du Code de la consommation), et
//  c'est interdit par les règles publicitaires de Meta comme de Google.
//  Les tournures parlées et les fautes se conservent — c'est exactement ce
//  qu'un faux avis n'a jamais.
// ------------------------------------------------------------
const CONVERSATIONS = [
  {
    // Messages reçus le lendemain de la fête. Surnoms affectueux retirés :
    // ils ne parlent qu'à eux, et brouillent la lecture d'un inconnu.
    blocs: [
      { qui: 'Claire', mots: ['Merci pour tout ! Tu nous as regalé', 'Trop bonne idée la vache'], coeur: true },
      { qui: 'Tintin', mots: ["T'es trop un ouf d'avoir fait ça, merci beaucoup"] },
      { qui: 'Claire', mots: ["C'est hilarant", 'Pour moi rien est à jeter ahhaha', 'Merci merci merci 🤩'], coeur: true },
    ],
  },
]

function Bouton({ children = 'Créer mon album — gratuit', className = '' }) {
  return (
    <Link href={CTA} className={`btn btn-accent ${className}`}>
      {children}
    </Link>
  )
}

// Ce qui se perd aujourd'hui. Trois constats que tous les mariés reconnaissent,
// et qui donnent sa raison d'être au produit.
const MANQUE = [
  {
    ic: '🌙',
    t: 'Votre photographe part à minuit',
    s: "Et la fête, elle, continue jusqu'à cinq heures. Les meilleures photos de la soirée sont prises après son départ — par vos invités.",
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

const ETAPES = [
  {
    img: '/accueil/affiche.webp',
    pos: 'center 38%',
    alt: "Affiche à poser sur les tables, avec le QR code du mariage",
    n: '01',
    t: 'Une affiche sur les tables',
    s: "Vos invités scannent le QR code. L'appareil photo s'ouvre dans leur navigateur — aucune application à installer, aucun compte à créer.",
  },
  {
    img: '/accueil/declencheur.webp',
    pos: 'center center',
    alt: "L'appareil photo jetable ouvert dans le navigateur : le viseur, le compteur de poses et le déclencheur",
    n: '02',
    t: 'Un nombre de clichés compté',
    s: "Vous décidez combien de photos chacun peut prendre. Comme un jetable : on ne mitraille pas, on choisit son moment. Et personne ne voit encore rien.",
  },
  {
    img: '/accueil/revelation.webp',
    pos: 'center center',
    alt: 'La galerie du mariage une fois les photos révélées',
    n: '03',
    t: 'La révélation, le lendemain',
    s: "À l'heure que vous avez fixée, tout se développe d'un coup. Des centaines de photos que vous n'aviez jamais vues, prises par ceux qui étaient là.",
  },
]

// Les formules qui concernent un mariage. Les petites tranches existent, mais
// les afficher ici ferait hésiter sur un choix qui n'est pas le sien.
const FORMULES_MARIAGE = TIERS.filter((t) => [50, 100, 150, 300].includes(t.maxGuests))

const FAQ = [
  {
    q: 'Mes invités doivent-ils installer une application ?',
    a: "Non, et c'est tout l'intérêt. Ils scannent le QR code posé sur la table, la caméra s'ouvre dans leur navigateur. Aucun compte, aucun téléchargement, aucune explication à donner — même à votre grand-tante.",
  },
  {
    q: 'Et si une photo est gênante ?',
    a: "Avant la révélation, vous êtes seul à voir les photos. Vous masquez celles que vous ne voulez pas montrer, personne ne le saura jamais. Vous pouvez aussi confier ce tri à un témoin en l'ajoutant comme co-organisateur.",
  },
  {
    q: 'Ça remplace mon photographe ?',
    a: "Non, et ce n'est pas le but. Votre photographe fait les portraits, la cérémonie, les photos de groupe. Time to Flash capte ce qu'il ne voit pas : la table des cousins, le bar à deux heures du matin, les regards entre deux danses.",
  },
  {
    q: 'Combien de photos chacun peut-il prendre ?',
    a: "Entre 3 et 15 clichés, c'est vous qui fixez la limite. Vous pouvez prévoir une recharge de quelques photos pour ceux qui ont tout épuisé. C'est cette contrainte qui fait la qualité : quand on n'a que dix photos, on ne photographie pas ses chaussures.",
  },
  {
    q: 'Combien de temps ai-je pour récupérer les photos ?',
    a: "Six mois après la révélation, puis elles sont supprimées automatiquement. On vous prévient par mail bien avant l'échéance pour que vous puissiez tout télécharger en pleine définition.",
  },
  {
    q: "C'est un abonnement ?",
    a: "Non. Vous payez une fois, pour votre mariage, selon le nombre d'invités. Rien ne se renouvelle, il n'y a rien à résilier.",
  },
]

export default function PageMariage() {
  return (
    <div className="site lp">
      {/* En-tête réduit au strict minimum : le logo rassure, mais il ne mène
          nulle part. Chaque lien de plus est une occasion de partir. */}
      <header className="lp-head">
        <Logo nameSize={20} size={32} />
        <span className="mono small muted lp-head-note">Gratuit jusqu'à 5 invités</span>
      </header>

      <main className="site-inner">
        {/* HERO */}
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
              et tout qui se révèle le lendemain — dans un seul album.
            </p>
            <div className="hero-cta">
              <Bouton />
            </div>
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

        {/* LE MANQUE */}
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

        {/* COMMENT */}
        <section className="section">
          <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>Comment ça se passe</div>
          <h2 className="section-title">Trois gestes, et vous n'y pensez plus</h2>
          <div className="section-sub">
            Vous préparez l'album avant le jour J. Le reste se fait tout seul.
          </div>
          <div className="steps-grid">
            {ETAPES.map((e, i) => (
              <div key={i} className="step-card">
                <div className="step-shot">
                  <span className="step-num">{e.n}</span>
                  <img src={e.img} alt={e.alt} loading="lazy" style={{ objectPosition: e.pos }} />
                </div>
                <h3>{e.t}</h3>
                <p>{e.s}</p>
              </div>
            ))}
          </div>
          <div className="lp-mid-cta">
            <Bouton />
          </div>
        </section>

        {/* LES PREMIERS RETOURS — de vraies phrases, pas des avis polis. Leur
            maladresse est justement ce qui les rend croyables. */}
        {RETOURS_AUTORISES && (
          <section className="section">
            <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>Les premiers retours</div>
            <h2 className="section-title">Ce qu'ils ont écrit le lendemain</h2>
            <div className="section-sub">
              Extraits des messages reçus après leur fête, une fois l'album ouvert.
            </div>
            <div className={`lp-convs ${CONVERSATIONS.length > 1 ? 'multi' : ''}`}>
              {CONVERSATIONS.map((c, k) => (
                <div key={k} className="lp-conv">
                  {c.blocs.map((r, i) => (
                    <div key={i} className="lp-conv-bloc">
                      <span className="lp-conv-qui">{r.qui}</span>
                      {r.mots.map((m, j) => (
                        <p key={j} className="lp-bulle">
                          {m}
                          {/* Le cœur ne se pose que sur le dernier message d'un
                              bloc, là où il l'a été dans la vraie conversation. */}
                          {r.coeur && j === r.mots.length - 1 && (
                            <span className="lp-coeur" aria-hidden="true">❤️</span>
                          )}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LA RÉVÉLATION — le cœur émotionnel du produit. */}
        <section className="section">
          <div className="split split-inverse">
            <div className="split-text">
              <div className="eyebrow-mute" style={{ marginBottom: 10 }}>Le moment qu'on n'oublie pas</div>
              <h2>Tout arrive d'un coup, le lendemain</h2>
              <p>
                Pendant la fête, personne ne voit les photos des autres : un compte
                à rebours retient tout le monde. Puis, à l'heure que vous avez
                choisie, l'album s'ouvre pour tous en même temps.
              </p>
              <ul className="split-list">
                <li><span className="ic">⏳</span><div><b>L'attente fait partie du cadeau</b> — comme une pellicule qu'on porte à développer.</div></li>
                <li><span className="ic">👥</span><div><b>Tout le monde découvre ensemble</b> — vos invités reçoivent le même lien que vous.</div></li>
                <li><span className="ic">📥</span><div><b>Vous téléchargez tout</b> — en pleine définition, d'un seul clic.</div></li>
              </ul>
            </div>
            <div className="phone phone-tilt">
              <img src="/accueil/album-partage.webp" width="640" height="1385" loading="lazy"
                alt="L'album partagé pendant la soirée : le compte à rebours avant la révélation et le nombre de participants." />
            </div>
          </div>
        </section>

        {/* VOUS GARDEZ LA MAIN — l'objection numéro un d'un mariage. */}
        <section className="section">
          <div className="split">
            <div className="phone phone-tilt">
              <img src="/accueil/bilan.webp" width="640" height="1393" loading="lazy"
                alt="Le bilan du mariage : nombre de photos prises, premier et dernier cliché, photographe le plus prolifique." />
            </div>
            <div className="split-text">
              <div className="eyebrow-mute" style={{ marginBottom: 10 }}>Vous gardez la main</div>
              <h2>Rien ne se montre sans votre accord</h2>
              <p>
                C'est votre mariage : vous découvrez les photos en avant-première et
                vous décidez de ce qui apparaît. Une photo ratée, un moment gênant ?
                Vous le retirez avant que qui que ce soit ne le voie.
              </p>
              <ul className="split-list">
                <li><span className="ic">👀</span><div><b>Vous validez en premier</b> — et personne ne saura ce que vous avez masqué.</div></li>
                <li><span className="ic">🤝</span><div><b>À plusieurs si vous voulez</b> — un témoin peut vous aider à trier.</div></li>
                <li><span className="ic">🔒</span><div><b>Jamais public</b> — l'album n'existe que pour ceux qui ont le lien.</div></li>
              </ul>
            </div>
          </div>
        </section>

        {/* COMPARAISON — l'argument le plus concret de la page. */}
        <section className="section">
          <h2 className="section-title">Et par rapport à un photobooth ?</h2>
          <div className="section-sub">
            La borne à selfies coûte le prix d'un traiteur pour dix personnes, et
            occupe un coin de la salle toute la soirée.
          </div>
          <div className="lp-compare">
            <div className="lp-col">
              <div className="lp-col-h">Un photobooth loué</div>
              <ul>
                <li><span>✕</span> 400 à 800 € la soirée</li>
                <li><span>✕</span> Un coin de la salle immobilisé</li>
                <li><span>✕</span> La queue, puis plus personne après 1 h</li>
                <li><span>✕</span> Les photos d'un seul endroit</li>
                <li><span>✕</span> À installer, à rendre</li>
              </ul>
            </div>
            <div className="lp-col lp-col-nous">
              <div className="lp-col-h">{BRAND.name}</div>
              <ul>
                <li><span>✓</span> À partir de {formatPrice(1499)}, une seule fois</li>
                <li><span>✓</span> Rien à poser, sinon une affiche</li>
                <li><span>✓</span> Dans toutes les poches, toute la nuit</li>
                <li><span>✓</span> Les photos de partout à la fois</li>
                <li><span>✓</span> Prêt en deux minutes</li>
              </ul>
            </div>
          </div>
        </section>

        {/* TARIFS */}
        <section className="section" id="tarifs">
          <h2 className="section-title">Un prix, une fois</h2>
          <div className="section-sub">
            Selon le nombre d'invités que vous attendez. Sans abonnement.
          </div>
          <div className="price-grid lp-prices">
            {FORMULES_MARIAGE.map((t) => (
              <div key={t.maxGuests} className={`price-card ${t.popular ? 'popular' : ''}`}>
                {t.popular && <span className="price-pop">LE PLUS CHOISI</span>}
                <div className="price-guests">Jusqu'à</div>
                <div className="price-amount">
                  {t.maxGuests}
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text3)' }}> invités</span>
                </div>
                <div className="price-unit">{formatPrice(t.priceCents)} · paiement unique</div>
                <Link href={`/create?tier=${t.maxGuests}`} className={`btn ${t.popular ? 'btn-accent' : 'btn-ghost'}`}>
                  Choisir
                </Link>
              </div>
            ))}
          </div>
          <p className="mono small muted" style={{ textAlign: 'center', marginTop: 18 }}>
            Vous voulez d'abord essayer ? La formule 5 invités est gratuite, sans carte bancaire.
          </p>
        </section>

        {/* FAQ */}
        <section className="section">
          <h2 className="section-title">Ce qu'on nous demande le plus</h2>
          <div className="section-sub" />
          {FAQ.map((f, i) => (
            <div key={i} className="faq-item">
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}
        </section>

        {/* RÉASSURANCE — sobre, en une ligne, juste avant de demander le clic. */}
        <section className="section">
          <div className="lp-trust">
            <span>🇪🇺 Hébergé en Europe</span>
            <span>🔒 Album privé, jamais public</span>
            <span>🗓️ Supprimé au bout de 6 mois</span>
            <span>💳 Paiement sécurisé Stripe</span>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="cta-band">
          <h3>Votre mariage mérite plus que trente photos</h3>
          <p>Créez votre album en deux minutes. Gratuit jusqu'à 5 invités, sans carte bancaire.</p>
          <Bouton />
        </section>
      </main>

      {/* Pied de page réduit à ce que la loi exige. */}
      <footer className="vfooter">
        <div className="vfooter-inner">
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff', fontSize: 15 }}>
            {BRAND.name}
          </span>
          <nav className="vfooter-links">
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/cgv">CGV</Link>
            <Link href="/politique-de-confidentialite">Confidentialité</Link>
            <ConsentReset />
          </nav>
          <span className="mono">© 2026 · Hébergé en UE · RGPD</span>
        </div>
      </footer>

      {/* Téléphone : le geste reste sous le pouce, du début à la fin. */}
      <Link href={CTA} className="lp-sticky">Créer mon album — gratuit →</Link>
    </div>
  )
}
