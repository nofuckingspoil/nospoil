// ============================================================
//  Briques des pages par occasion (/anniversaire, /evjf-evg…) et de la
//  page qui les réunit (/occasions).
//
//  À la différence des pages publicitaires, ce sont des pages faites pour
//  Google : barre du site, pied de page complet, liens vers le journal et
//  vers les autres occasions. Le produit, lui, se décrit pareil.
// ============================================================

import Link from 'next/link'
import { t } from '../../lib/i18n'
import { lien } from '../../lib/langue-lien'
import { TIERS } from '../../lib/pricing'
import { prix } from '../../lib/lp'
import { OCCASIONS } from '../../lib/occasions'
import { getPostEnLangue, gradientFor } from '../../lib/journal'
import { EcranAppareil } from './Ecrans'

// L'adresse de création depuis une occasion : la bonne formule, et l'exemple
// de nom qui va avec (« Ex : Les 30 ans de Thomas »).
export function lienCreation(slug, tier) {
  const p = new URLSearchParams()
  if (tier) p.set('tier', String(tier))
  if (slug) p.set('occasion', slug)
  return `/create?${p}`
}

export function Bouton({ slug, tier, lang, children }) {
  return (
    <Link href={lienCreation(slug, tier)} className="btn btn-accent">
      {children ?? t({ fr: 'Créer mon album (gratuit)', en: 'Create my album (free)', de: 'Mein Album erstellen (kostenlos)' }, lang)}
    </Link>
  )
}

export function Hero({ T, slug, tier, lang, photo, viseur, titreFete }) {
  return (
    <section className="hero hero-split">
      <div>
        <div className="eyebrow">{T.eyebrow}</div>
        <h1>{T.h1}</h1>
        {T.intro.map((p, i) => <p key={i} style={i ? { marginTop: 10 } : undefined}>{p}</p>)}
        <div className="hero-cta">
          <Bouton slug={slug} tier={tier} lang={lang} />
          <span className="mono small muted">{t({ fr: "Gratuit jusqu'à 5 participants", en: 'Free for up to 5 guests', de: 'Kostenlos bis 5 Gäste' }, lang)}</span>
        </div>
        <ul className="lp-ticks">
          {T.ticks.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </div>
      <div className="hero-duo occ-duo">
        <div className="phone phone-avant">
          {viseur
            ? <EcranAppareil titre={titreFete} photo={viseur} lang={lang} />
            : <img src="/accueil/appareil-photo.webp" width="640" height="1385"
                alt={t({
                  fr: "L'appareil photo jetable ouvert dans le navigateur : le viseur, le compteur de poses et le déclencheur.",
                  en: 'The disposable camera open in the browser: viewfinder, shot counter and shutter button.',
                  de: 'Die Einwegkamera im Browser: Sucher, Bildzähler und Auslöser.',
                }, lang)} />}
        </div>
        {/* La fête elle-même, en tirage : on voit tout de suite de quelle
            occasion parle la page, là où deux captures d'appli se
            ressemblaient d'une page à l'autre. */}
        <figure className="occ-tirage">
          <img src={photo || '/accueil/galerie-photos.webp'} width="900" height="1200" fetchPriority="high" alt={T.h1} />
        </figure>
      </div>
    </section>
  )
}

// « À quoi ressemblera l'album » : quatre photos d'une même fête, comme on
// les découvre le lendemain. C'est ce qui vend : le résultat, pas l'outil.
export function Album({ slug, lang }) {
  return (
    <section className="section">
      <h2 className="section-title">{t({ fr: 'Ce que vous découvrirez le lendemain', en: "What you'll discover the next day", de: 'Was Sie am nächsten Tag entdecken' }, lang)}</h2>
      <div className="section-sub">
        {t({
          fr: "Des photos prises par vos invités, sur le vif, que personne n'avait vues avant la révélation.",
          en: "Photos taken by your guests, in the moment, that nobody had seen before the reveal.",
          de: 'Fotos Ihrer Gäste, mitten aus dem Moment, die vor der Enthüllung niemand gesehen hat.',
        }, lang)}
      </div>
      <div className="occ-album">
        {[1, 2, 3, 4].map((i) => (
          <img key={i} src={`/occasions/${slug}/album-${i}.webp`} width="720" height="960" loading="lazy" decoding="async"
            alt={t({ fr: `Photo ${i} de l'album, prise par un invité`, en: `Album photo ${i}, taken by a guest`, de: `Albumfoto ${i}, von einem Gast aufgenommen` }, lang)} />
        ))}
      </div>
    </section>
  )
}

export function Cartes({ titre, sous, cartes }) {
  return (
    <section className="section">
      <h2 className="section-title">{titre}</h2>
      {sous && <div className="section-sub">{sous}</div>}
      <div className="steps-grid">
        {cartes.map((c, i) => (
          <div key={i} className="step-card">
            {c.ic && <div className="step-ic">{c.ic}</div>}
            <h3>{c.t}</h3>
            <p>{c.s}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const IMAGES_ETAPES = [
  { img: '/accueil/affiche.webp', pos: 'center 38%' },
  { img: '/accueil/declencheur.webp', pos: 'center center' },
  { img: '/accueil/revelation.webp', pos: 'center center' },
]

export function Etapes({ etapes, lang, visuels }) {
  return (
    <section className="section">
      <div className="eyebrow-mute" style={{ textAlign: 'center', marginBottom: 10 }}>{t({ fr: 'Comment ça marche', en: 'How it works', de: "So funktioniert's" }, lang)}</div>
      <h2 className="section-title">{t({ fr: 'Trois étapes, rien à installer', en: 'Three steps, nothing to install', de: 'Drei Schritte, nichts zu installieren' }, lang)}</h2>
      <div className="section-sub" />
      <div className="steps-grid">
        {etapes.map((s, i) => (
          <div key={i} className="step-card">
            <div className={`step-shot ${visuels?.[i] ? 'step-shot-ecran' : ''}`}>
              <span className="step-num">{String(i + 1).padStart(2, '0')}</span>
              {visuels?.[i] || <img src={IMAGES_ETAPES[i]?.img} alt="" loading="lazy" style={{ objectPosition: IMAGES_ETAPES[i]?.pos }} />}
            </div>
            <h3>{s.t}</h3>
            <p>{s.s}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// Le contenu de fond : idées, conseils. Rendu en texte courant, dans la
// colonne de lecture du journal, pour que la page se lise aussi.
export function Idees({ T }) {
  return (
    <section className="section">
      <h2 className="section-title">{T.ideesTitre}</h2>
      {T.ideesSous && <div className="section-sub">{T.ideesSous}</div>}
      <ol className="occ-idees">
        {T.idees.map((x, i) => (
          <li key={i}>
            <h3>{x.t}</h3>
            <p>{x.s}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function Texte({ titre, paragraphes }) {
  return (
    <section className="section occ-texte">
      <h2 className="section-title">{titre}</h2>
      <div className="section-sub" />
      {paragraphes.map((p, i) => <p key={i}>{p}</p>)}
    </section>
  )
}

export function Tarifs({ slug, tiers, lang }) {
  const formules = TIERS.filter((f) => tiers.includes(f.maxGuests))
  const conseillee = formules.find((f) => f.maxGuests === tiers[1]) ? tiers[1] : formules[0]?.maxGuests
  return (
    <section className="section" id="tarifs">
      <h2 className="section-title">{t({ fr: 'Un prix, une fois', en: 'One price, paid once', de: 'Ein Preis, einmal bezahlt' }, lang)}</h2>
      <div className="section-sub">
        {t({
          fr: 'Selon le nombre de participants. Sans abonnement, rien à résilier.',
          en: 'Based on the number of guests. No subscription, nothing to cancel.',
          de: 'Je nach Anzahl der Gäste. Ohne Abo, nichts zu kündigen.',
        }, lang)}
      </div>
      <div className="price-grid lp-prices">
        {formules.map((f) => {
          const pop = f.maxGuests === conseillee
          return (
            <div key={f.maxGuests} className={`price-card ${pop ? 'popular' : ''}`}>
              {pop && <span className="price-pop">{t({ fr: 'CONSEILLÉ', en: 'RECOMMENDED', de: 'EMPFOHLEN' }, lang)}</span>}
              <div className="price-guests">{t({ fr: "Jusqu'à", en: 'Up to', de: 'Bis zu' }, lang)}</div>
              <div className="price-amount">
                {f.maxGuests}
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text3)' }}>
                  {t({ fr: ' participants', en: ' guests', de: ' Gäste' }, lang)}
                </span>
              </div>
              <div className="price-unit">
                {f.priceCents
                  ? <>{prix(f.priceCents, lang)}{t({ fr: ' · paiement unique', en: ' · one-off payment', de: ' · einmalige Zahlung' }, lang)}</>
                  : t({ fr: 'Gratuit, sans carte bancaire', en: 'Free, no card needed', de: 'Kostenlos, ohne Kreditkarte' }, lang)}
              </div>
              <Link href={lienCreation(slug, f.maxGuests)} className={`btn ${pop ? 'btn-accent' : 'btn-ghost'}`}>
                {t({ fr: 'Choisir', en: 'Choose', de: 'Auswählen' }, lang)}
              </Link>
            </div>
          )
        })}
      </div>
      <p className="mono small muted" style={{ textAlign: 'center', marginTop: 18 }}>
        {t({
          fr: "Vous voulez d'abord essayer ? Jusqu'à 5 participants, c'est gratuit.",
          en: 'Want to try it first? Up to 5 guests, it is free.',
          de: 'Erst einmal ausprobieren? Bis 5 Gäste ist es kostenlos.',
        }, lang)}
      </p>
    </section>
  )
}

export function Faq({ faq, lang }) {
  return (
    <section className="section">
      <h2 className="section-title">{t({ fr: 'Questions fréquentes', en: 'Frequently asked questions', de: 'Häufige Fragen' }, lang)}</h2>
      <div className="section-sub" />
      {faq.map((f, i) => (
        <div key={i} className="faq-item">
          <h3>{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </section>
  )
}

export function faqLd(faq, locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: locale,
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }
}

// Les articles du journal liés à l'occasion. Ceux qui n'existent pas (ou
// plus) sont simplement ignorés.
export function Articles({ slugs, lang }) {
  const posts = slugs.map((s) => getPostEnLangue(s, lang)).filter(Boolean)
  if (!posts.length) return null
  return (
    <section className="section">
      <h2 className="section-title">{t({ fr: 'À lire sur le blog', en: 'From the blog', de: 'Aus dem Blog' }, lang)}</h2>
      <div className="section-sub" />
      <div className="occ-articles">
        {posts.map((p) => (
          <Link key={p.slug} className="occ-article" href={lien(`/journal/${p.slug}`, lang)}>
            <div className="occ-article-media" style={{ background: gradientFor(p.slug) }}>
              {p.image && <img src={p.image} alt="" loading="lazy" decoding="async" />}
            </div>
            <div className="occ-article-body">
              <span className="mono small muted">{p.catLabel}</span>
              <h3>{p.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// Les autres occasions, et le mariage, pour que chaque page mène aux autres.
export function AutresOccasions({ sauf, lang, titre, sous }) {
  const liste = [
    ...OCCASIONS.filter((o) => o.slug !== sauf).map((o) => ({ href: `/${o.slug}`, ic: o.ic, nom: t(o.nom, lang), img: `/occasions/${o.slug}/hero.webp` })),
    { href: '/appareil-jetable-mariage', ic: '💍', nom: t({ fr: 'Mariage', en: 'Wedding', de: 'Hochzeit' }, lang), img: '/occasions/tuile-mariage.webp' },
  ]
  return (
    <section className="section">
      <h2 className="section-title">{titre ?? t({ fr: 'Pour une autre occasion', en: 'For another occasion', de: 'Für einen anderen Anlass' }, lang)}</h2>
      <div className="section-sub">{sous}</div>
      <div className="occ-grille">
        {liste.map((o) => (
          <Link key={o.href} href={lien(o.href, lang)} className="occ-tuile">
            <img src={o.img} alt="" width="360" height="270" loading="lazy" decoding="async" />
            <span className="occ-tuile-nom"><span aria-hidden="true">{o.ic}</span> {o.nom}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function CtaFinal({ titre, sous, slug, tier, lang }) {
  return (
    <section className="cta-band">
      <h3>{titre}</h3>
      <p>{sous}</p>
      <Bouton slug={slug} tier={tier} lang={lang} />
    </section>
  )
}
