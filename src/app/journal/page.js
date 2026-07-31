import Link from 'next/link'
import Logo from '../../components/Logo'
import { BRAND } from '../../lib/brand'
import { POSTS, CATEGORIES, gradientFor, avatarColor, formatDate } from '../../lib/journal'
import NewsletterForm from './NewsletterForm'

export const metadata = {
  title: 'Journal',
  description: "Conseils photo, organisation et souvenirs pour ton mariage. Des articles courts, écrits avec des mariés et des photographes.",
  alternates: { canonical: '/journal' },
  openGraph: {
    title: `Journal — ${BRAND.name}`,
    description: "Conseils photo, organisation et souvenirs pour ton mariage.",
    url: 'https://timetoflash.fr/journal',
    type: 'website',
  },
}

function Card({ p }) {
  return (
    <Link className="dj-card" href={`/journal/${p.slug}`}>
      <div className="dj-card-media" style={{ background: gradientFor(p.slug) }}>
        {p.image && <img src={p.image} alt={p.caption || p.title} loading="lazy" decoding="async" />}
        <span className="dj-chip">{p.cat}</span>
      </div>
      <div className="dj-card-body">
        <h4>{p.title}</h4>
        <p>{p.excerpt}</p>
        <div className="dj-meta"><span>{formatDate(p.date)}</span><span>{p.read}</span></div>
      </div>
    </Link>
  )
}

export default async function JournalIndex({ searchParams }) {
  const sp = (await searchParams) || {}
  const cat = typeof sp.cat === 'string' && CATEGORIES.includes(sp.cat) ? sp.cat : 'Tous'

  const list = cat === 'Tous' ? POSTS : POSTS.filter((p) => p.cat === cat)
  const feat = list[0]
  const rest = list.slice(1)

  return (
    <main className="dj" id="journal" aria-label={`Journal ${BRAND.name}`}>
      <div className="dj-wrap" style={{ paddingTop: 22 }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
      </div>

      <div className="dj-wrap dj-head">
        <span className="dj-eyebrow">journal</span>
        <h1>Tout ce qu’on aurait aimé savoir<br />avant le grand jour.</h1>
        <p>Photo, organisation, souvenirs d’invités. Des articles courts, écrits avec des mariés et des photographes.</p>
      </div>

      <div className="dj-wrap">
        <div className="dj-cats" role="group" aria-label="Filtrer par catégorie">
          {CATEGORIES.map((c) => (
            <Link key={c} className="dj-cat" aria-pressed={c === cat}
              href={c === 'Tous' ? '/journal' : `/journal?cat=${encodeURIComponent(c)}`}>
              {c}
            </Link>
          ))}
        </div>

        {feat && (
          <Link className="dj-feat" href={`/journal/${feat.slug}`}>
            <div className="dj-feat-media" style={{ background: gradientFor(feat.slug) }}>
              {feat.image && <img src={feat.image} alt={feat.caption || feat.title} fetchPriority="high" decoding="async" />}
              <span className="dj-badge">à la une</span>
            </div>
            <div className="dj-feat-body">
              <span className="dj-eyebrow" style={{ fontSize: 11 }}>{feat.cat}</span>
              <h2>{feat.title}</h2>
              <p>{feat.excerpt}</p>
              <div className="dj-byline">
                <span className="dj-av" style={{ background: avatarColor(feat.author) }}>{feat.author[0]}</span>
                <span><strong>{feat.author}</strong>{formatDate(feat.date)} · {feat.read}</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="dj-grid-band">
        <div className="dj-wrap">
          <div className="dj-grid-head">
            <h3>Derniers articles</h3>
            <span className="dj-count">{list.length}{list.length > 1 ? ' articles' : ' article'}</span>
          </div>
          <div className="dj-grid">
            {rest.map((p) => <Card key={p.slug} p={p} />)}
          </div>
        </div>
      </div>

      <div className="dj-news-band">
        <div className="dj-wrap">
          <div className="dj-news">
            <div>
              <h3>Un mail par mois, jamais plus</h3>
              <p>Nos meilleurs conseils photo et organisation, et les nouveautés {BRAND.name}. Désinscription en un clic.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </main>
  )
}
