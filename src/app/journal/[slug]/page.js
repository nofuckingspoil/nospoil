import Link from 'next/link'
import { notFound } from 'next/navigation'
import Logo from '../../../components/Logo'
import { BRAND } from '../../../lib/brand'
import { POSTS, getPost, gradientFor, avatarColor, formatDate } from '../../../lib/journal'

const SITE_URL = 'https://timetoflash.fr'

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = getPost(slug)
  if (!p) return {}
  const url = `${SITE_URL}/journal/${p.slug}`
  const img = p.image ? [{ url: `${SITE_URL}${p.image}`, alt: p.caption || p.title }] : undefined
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/journal/${p.slug}` },
    openGraph: {
      type: 'article',
      url,
      title: p.title,
      description: p.excerpt,
      publishedTime: p.date,
      authors: [p.author],
      siteName: BRAND.name,
      images: img,
    },
    twitter: { card: 'summary_large_image', title: p.title, description: p.excerpt, images: img },
  }
}

// « À lire ensuite » : même catégorie d'abord, puis les plus récents, hors article courant.
function relatedPosts(current) {
  const others = POSTS.filter((p) => p.slug !== current.slug)
  const sameCat = others.filter((p) => p.cat === current.cat)
  const rest = others.filter((p) => p.cat !== current.cat)
  return [...sameCat, ...rest].slice(0, 3)
}

export default async function Article({ params }) {
  const { slug } = await params
  const p = getPost(slug)
  if (!p) notFound()

  const url = `${SITE_URL}/journal/${p.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    description: p.excerpt,
    ...(p.image ? { image: [`${SITE_URL}${p.image}`] } : {}),
    datePublished: p.date,
    dateModified: p.date,
    author: { '@type': 'Person', name: p.author },
    publisher: { '@type': 'Organization', name: BRAND.name, url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: 'fr-FR',
  }

  const related = relatedPosts(p)

  return (
    <section className="dj" id="journal" aria-label={p.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="dj-wrap" style={{ paddingTop: 22 }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
      </div>

      <div className="dj-wrap">
        <Link className="dj-back" href="/journal">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Tous les articles
        </Link>
      </div>

      <div className="dj-wrap">
        <header className="dj-art-head">
          <span className="dj-eyebrow" style={{ fontSize: 11.5 }}>{p.cat}</span>
          <h1>{p.title}</h1>
          <div className="dj-art-byline">
            <span className="dj-av" style={{ background: avatarColor(p.author) }}>{p.author[0]}</span>
            <span><strong>{p.author}</strong>{formatDate(p.date)} · {p.read}</span>
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

          <div className="dj-cta">
            <div>
              <h4>Essaie sur ton mariage</h4>
              <span>Un appareil jetable partagé, prêt en 2 minutes. Paiement unique.</span>
            </div>
            <Link className="dj-btn dj-btn--dark" href="/create">Créer le mien</Link>
          </div>
        </div>
      </div>

      <div className="dj-related">
        <div className="dj-wrap">
          <h3>À lire ensuite</h3>
          <div className="dj-grid">
            {related.map((r) => (
              <Link key={r.slug} className="dj-card" href={`/journal/${r.slug}`}>
                <div className="dj-card-media" style={{ background: gradientFor(r.slug) }}>
                  {r.image && <img src={r.image} alt={r.caption || r.title} loading="lazy" decoding="async" />}
                </div>
                <div className="dj-card-body">
                  <span className="dj-eyebrow" style={{ fontSize: 10 }}>{r.cat}</span>
                  <h4>{r.title}</h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
