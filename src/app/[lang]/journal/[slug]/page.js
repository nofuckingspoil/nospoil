import Link from 'next/link'
import { notFound } from 'next/navigation'
import SiteNav from '../../../../components/SiteNav'
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

// « À lire ensuite » : même catégorie d'abord, puis les plus récents, hors article courant.
function relatedPosts(current, lang) {
  const others = postsEnLangue(lang).filter((p) => p.slug !== current.slug)
  const sameCat = others.filter((p) => p.cat === current.cat)
  const rest = others.filter((p) => p.cat !== current.cat)
  return [...sameCat, ...rest].slice(0, 3)
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

          <div className="dj-cta">
            <div>
              <h3>{t({ fr: 'Essaie sur ton mariage', en: 'Try it at your wedding', de: 'Probieren Sie es auf Ihrer Hochzeit aus' }, lang)}</h3>
              <span>{t({
                fr: 'Un appareil jetable partagé, prêt en 2 minutes. Paiement unique.',
                en: 'A shared disposable camera, ready in 2 minutes. One-off payment.',
                de: 'Eine gemeinsame Einwegkamera, in 2 Minuten bereit. Einmalige Zahlung.',
              }, lang)}</span>
            </div>
            <Link className="dj-btn dj-btn--dark" href={lien('/create', lang)}>{t({ fr: 'Créer le mien', en: 'Create mine', de: 'Meine erstellen' }, lang)}</Link>
          </div>

          {/* Pas encore prêt à créer son événement ? Le guide récupère ceux
              qui préparent leur fête et repartiraient sans rien laisser. */}
          <div className="dj-guide">
            <div>
              <h3>{t({ fr: "Le guide de l'organisateur", en: 'The host’s guide', de: 'Der Leitfaden für Gastgeber' }, lang)}</h3>
              <span>{t({
                fr: "Combien de clichés donner, quand révéler l'album, comment faire scanner tout le monde. Sept chapitres, gratuits.",
                en: 'How many shots to give, when to reveal the album, how to get everyone scanning. Seven chapters, free.',
                de: 'Wie viele Aufnahmen pro Gast, wann das Album enthüllt wird, wie alle zum Scannen kommen. Sieben Kapitel, kostenlos.',
              }, lang)}</span>
            </div>
            <Link className="dj-btn" href={lien('/guide', lang)}>{t({ fr: 'Lire le guide', en: 'Read the guide', de: 'Leitfaden lesen' }, lang)}</Link>
          </div>
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
    </main>
  )
}
