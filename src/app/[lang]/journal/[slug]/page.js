import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteNav from '../../../../components/SiteNav'
import SitePied from '../../../../components/SitePied'
import { BRAND } from '../../../../lib/brand'
import { POSTS, getPostEnLangue, postsEnLangue, gradientFor, avatarColor, formatDate } from '../../../../lib/journal'
import { langueDeParams, alternates, lien, localeOG, SITE_URL } from '../../../../lib/langue-lien'
import { t, LOCALES } from '../../../../lib/i18n'

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const lang = await langueDeParams(params)
  const p = getPostEnLangue(slug, lang)
  if (!p) return {}
  const url = `${SITE_URL}${lien(`/journal/${p.slug}`, lang)}`
  const img = p.image ? [{ url: `${SITE_URL}${p.image}`, alt: p.caption || p.title }] : undefined
  return {
    title: p.title,
    description: p.excerpt,
    alternates: alternates(`/journal/${p.slug}`, lang),
    openGraph: {
      type: 'article',
      url,
      locale: localeOG(lang),
      title: p.title,
      description: p.excerpt,
      publishedTime: p.date,
      ...(p.updated ? { modifiedTime: p.updated } : {}),
      authors: [p.author],
      siteName: BRAND.name,
      images: img,
    },
    twitter: { card: 'summary_large_image', title: p.title, description: p.excerpt, images: img },
  }
}

// « À lire ensuite » : même catégorie d'abord, puis les plus récents, hors
// article courant. Dans la catégorie, on prend les articles qui SUIVENT
// l'article courant (en boucle) : avant, tous les articles d'une catégorie
// montraient les trois mêmes, et dix articles n'étaient suggérés nulle part.
function relatedPosts(current, lang) {
  const tous = postsEnLangue(lang)
  const memeCat = tous.filter((p) => p.cat === current.cat)
  const i = memeCat.findIndex((p) => p.slug === current.slug)
  const suivants = [...memeCat.slice(i + 1), ...memeCat.slice(0, Math.max(i, 0))]
  const rest = tous.filter((p) => p.cat !== current.cat)
  return [...suivants, ...rest].slice(0, 3)
}

// La page vitrine qui prolonge chaque article : la page mariage qui colle au
// sujet, ou la page de l'occasion. Sans ce lien, les pages mariage n'étaient
// reliées à aucune page du site.
const PAGES_LIEES = [
  {
    href: '/appareil-jetable-mariage',
    slugs: ['appareil-photo-jetable-mariage', 'application-appareil-photo-jetable-mariage', 'photos-mariage-effet-argentique', 'dix-cliches', 'revelation-photos-lendemain-mariage'],
    titre: { fr: "L'appareil photo jetable de ton mariage", en: 'The disposable camera for your wedding', de: 'Die digitale Einwegkamera für Ihre Hochzeit' },
  },
  {
    href: '/photobooth-mariage',
    slugs: ['prix-photobooth-mariage', 'alternative-photobooth-mariage', 'comparatif-animations-photo-mariage', 'budget-photo-mariage'],
    titre: { fr: 'Une alternative au photobooth, pour 14,99 €', en: 'A photo booth alternative for €14.99', de: 'Eine Fotobox-Alternative für 14,99 €' },
  },
  {
    href: '/cadeau-mariage-temoins',
    slugs: ['brief-invites', '120-mariages', 'mariage-sans-telephone-unplugged', 'ou-poser-le-qr-code', 'pas-de-reseau-salle-mariage', 'evenement-cree-et-maintenant'],
    titre: { fr: 'Témoin ? Offre-leur les photos de leurs invités', en: 'In the wedding party? Give them their guests’ photos', de: 'Trauzeuge? Schenken Sie dem Paar die Fotos seiner Gäste' },
  },
  {
    href: '/anniversaire-30-ans',
    slugs: ['idees-anniversaire-30-ans'],
    titre: { fr: 'Un appareil jetable partagé pour tes 30 ans', en: 'A shared disposable camera for your 30th', de: 'Eine geteilte digitale Einwegkamera für Ihren 30.' },
  },
  {
    href: '/depart-retraite',
    slugs: ['idees-pot-de-depart-retraite'],
    titre: { fr: "L'album photo du pot de départ", en: 'The photo album of the retirement party', de: 'Das Fotoalbum der Abschiedsfeier' },
  },
  {
    href: '/evjf-evg',
    slugs: ['appareil-photo-jetable-evjf'],
    titre: { fr: "L'appareil jetable de l'EVJF, sans le carton", en: 'The hen party disposable camera, minus the cardboard', de: 'Die JGA-Einwegkamera, ohne Pappe' },
  },
  {
    href: '/week-end-entre-amis',
    slugs: ['photos-week-end-entre-amis'],
    titre: { fr: 'Les photos du week-end, révélées le lundi', en: 'The weekend photos, revealed on Monday', de: 'Die Wochenendfotos, präsentiert am Montag' },
  },
]
// Par défaut (les autres articles de mariage) : les photos des invités.
const PAGE_LIEE_DEFAUT = {
  href: '/photos-mariage-invites',
  titre: { fr: 'Les photos de ton mariage, vues par tes invités', en: 'Your wedding, seen through your guests’ eyes', de: 'Ihre Hochzeit, mit den Augen Ihrer Gäste' },
}
// Bandeau des articles pour prestataires : le lecteur est un pro, pas un marié.
function BandeauPro({ lang }) {
  return (
    <div className="dj-guide dj-pro">
      <div>
        <h3>{t({ fr: 'Vous êtes prestataire de mariage ?', en: 'Are you a wedding professional?', de: 'Sie sind Hochzeitsdienstleister?' }, lang)}</h3>
        <span>{t({
          fr: 'Référencez-vous et obtenez un code gratuit pour faire découvrir Time to Flash à vos mariés.',
          en: 'Get listed and receive a free code to introduce Time to Flash to your couples.',
          de: 'Lassen Sie sich eintragen und erhalten Sie einen kostenlosen Code, um Time to Flash Ihren Brautpaaren vorzustellen.',
        }, lang)}</span>
      </div>
      <Link className="dj-btn" href={lien('/pro', lang)}>{t({ fr: 'Me référencer', en: 'Get listed', de: 'Eintragen lassen' }, lang)}</Link>
    </div>
  )
}

function pageLiee(slug) {
  return PAGES_LIEES.find((x) => x.slugs.includes(slug)) || PAGE_LIEE_DEFAUT
}

export default async function Article({ params }) {
  const { slug } = await params
  const lang = await langueDeParams(params)
  const p = getPostEnLangue(slug, lang)
  if (!p) notFound()

  const url = `${SITE_URL}${lien(`/journal/${p.slug}`, lang)}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    ...(p.image ? { image: [`${SITE_URL}${p.image}`] } : {}),
    datePublished: p.date,
    dateModified: p.updated || p.date,
    author: { '@type': 'Person', name: p.author },
    publisher: { '@type': 'Organization', name: BRAND.name, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: LOCALES[lang] || 'fr-FR',
  }

  // FAQ facultative : affichée en fin d'article et déclarée à Google, qui
  // peut s'en servir pour ses encadrés « Autres questions ».
  const faqLd = p.faq?.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: LOCALES[lang] || 'fr-FR',
    mainEntity: p.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  } : null

  const related = relatedPosts(p, lang)
  const liee = pageLiee(p.slug)
  // Articles pour wedding planners, photographes et lieux (10/10/2026) :
  // bandeau partenaires en tête, et l'appel final mène à /pro.
  const pro = p.cible === 'pro'

  return (
    <main className="dj" id="journal" aria-label={p.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      <SiteNav large />

      <div className="dj-wrap">
        <Link className="dj-back" href={lien('/journal', lang)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          {t({ fr: 'Tous les articles', en: 'All articles', de: 'Alle Artikel' }, lang)}
        </Link>
      </div>

      <div className="dj-wrap">
        <header className="dj-art-head">
          <span className="dj-eyebrow" style={{ fontSize: 11.5 }}>{p.catLabel}</span>
          <h1>{p.title}</h1>
          <div className="dj-art-byline">
            <span className="dj-av" style={{ background: avatarColor(p.author) }}>{p.author[0]}</span>
            <span><strong>{p.author}</strong>{p.updated
              ? t({ fr: `Mis à jour le ${formatDate(p.updated, lang)}`, en: `Updated ${formatDate(p.updated, lang)}`, de: `Aktualisiert am ${formatDate(p.updated, lang)}` }, lang)
              : formatDate(p.date, lang)} · {p.read}</span>
          </div>
        </header>

        <div className="dj-hero">
          <div className="dj-hero-media" style={{ background: gradientFor(p.slug) }}>
            {p.image && <img src={p.image} alt={p.caption || p.title} fetchPriority="high" decoding="async" />}
          </div>
          {p.caption && <div className="dj-caption">{p.caption}</div>}
        </div>

        <div className="dj-prose">
          <p className="dj-lede">{p.excerpt}</p>
          {pro && <BandeauPro lang={lang} />}
          <div dangerouslySetInnerHTML={{ __html: p.body }} />

          {faqLd && (
            <section aria-label={t({ fr: 'Questions fréquentes', en: 'Frequently asked questions', de: 'Häufige Fragen' }, lang)}>
              <h2>{t({ fr: 'Questions fréquentes', en: 'Frequently asked questions', de: 'Häufige Fragen' }, lang)}</h2>
              {p.faq.map((f) => (
                <div key={f.q}>
                  <h3>{f.q}</h3>
                  <p>{f.a}</p>
                </div>
              ))}
            </section>
          )}

          {pro ? (
            <div className="dj-cta">
              <div>
                <h3>{t({ fr: 'Proposez Time to Flash à vos mariés', en: 'Offer Time to Flash to your couples', de: 'Bieten Sie Time to Flash Ihren Brautpaaren an' }, lang)}</h3>
                <span>{t({
                  fr: 'Référencez-vous comme partenaire et recevez un code gratuit pour l’essayer sur un vrai mariage.',
                  en: 'Join as a partner and get a free code to try it at a real wedding.',
                  de: 'Werden Sie Partner und erhalten Sie einen kostenlosen Code, um es bei einer echten Hochzeit zu testen.',
                }, lang)}</span>
              </div>
              <Link className="dj-btn dj-btn--dark" href={lien('/pro', lang)}>{t({ fr: 'Devenir partenaire', en: 'Become a partner', de: 'Partner werden' }, lang)}</Link>
            </div>
          ) : (<>
          <div className="dj-cta">
            <div>
              <h3>{t(liee.titre, lang)}</h3>
              <span>{t({
                fr: 'Un appareil jetable partagé, prêt en 2 minutes. Paiement unique.',
                en: 'A shared disposable camera, ready in 2 minutes. One-off payment.',
                de: 'Eine gemeinsame Einwegkamera, in 2 Minuten bereit. Einmalige Zahlung.',
              }, lang)}</span>
            </div>
            <Link className="dj-btn dj-btn--dark" href={lien(liee.href, lang)}>{t({ fr: 'Découvrir', en: 'Find out more', de: 'Mehr erfahren' }, lang)}</Link>
          </div>

          {/* Pas encore prêt à créer son événement ? Le guide récupère ceux
              qui préparent leur fête et repartiraient sans rien laisser. */}
          <div className="dj-guide">
            <div>
              <h3>{t({ fr: "Le guide de l'organisateur", en: 'The host’s guide', de: 'Der Leitfaden für Gastgeber' }, lang)}</h3>
              <span>{t({
                fr: "Combien de clichés donner, quand révéler l'album, comment faire scanner tout le monde. Sept chapitres, gratuits.",
                en: 'How many shots to give, when to reveal the album, how to get everyone scanning. Seven chapters, free.',
                de: 'Wie viele Aufnahmen pro Gast, wann das Album präsentiert wird, wie alle zum Scannen kommen. Sieben Kapitel, kostenlos.',
              }, lang)}</span>
            </div>
            <Link className="dj-btn" href={lien('/guide', lang)}>{t({ fr: 'Lire le guide', en: 'Read the guide', de: 'Leitfaden lesen' }, lang)}</Link>
          </div>
          </>)}
        </div>
      </div>

      <div className="dj-related">
        <div className="dj-wrap">
          <h3>{t({ fr: 'À lire ensuite', en: 'Read next', de: 'Weiterlesen' }, lang)}</h3>
          <div className="dj-grid">
            {related.map((r) => (
              <Link key={r.slug} className="dj-card" href={lien(`/journal/${r.slug}`, lang)}>
                <div className="dj-card-media" style={{ background: gradientFor(r.slug) }}>
                  {r.image && <img src={r.image} alt={r.caption || r.title} loading="lazy" decoding="async" />}
                </div>
                <div className="dj-card-body">
                  <span className="dj-eyebrow" style={{ fontSize: 10 }}>{r.catLabel}</span>
                  <h4>{r.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <SitePied lang={lang} />
    </main>
  )
}
