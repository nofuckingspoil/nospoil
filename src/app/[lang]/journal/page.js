import Link from 'next/link'
import SiteNav from '../../../components/SiteNav'
import { BRAND } from '../../../lib/brand'
import { CATEGORIES, categorieLabel, postsEnLangue, gradientFor, avatarColor, formatDate } from '../../../lib/journal'
import { langueDeParams, alternates, lien, localeOG, SITE_URL } from '../../../lib/langue-lien'
import { t } from '../../../lib/i18n'
import NewsletterForm from './NewsletterForm'

export async function generateMetadata({ params }) {
  const lang = await langueDeParams(params)
  return {
    title: 'Blog',
    description: t({
      fr: "Conseils photo, organisation et souvenirs pour ton mariage. Des articles courts, écrits avec des mariés et des photographes.",
      en: 'Photo tips, planning and memories for your wedding. Short articles, written with couples and photographers.',
      de: 'Foto-Tipps, Planung und Erinnerungen für Ihre Hochzeit. Kurze Artikel, geschrieben mit Brautpaaren und Fotografen.',
    }, lang),
    alternates: alternates('/journal', lang),
    openGraph: {
      title: `Blog | ${BRAND.name}`,
      description: t({
        fr: "Conseils photo, organisation et souvenirs pour ton mariage.",
        en: 'Photo tips, planning and memories for your wedding.',
        de: 'Foto-Tipps, Planung und Erinnerungen für Ihre Hochzeit.',
      }, lang),
      url: `${SITE_URL}${lien('/journal', lang)}`,
      type: 'website',
      locale: localeOG(lang),
    },
  }
}

function Card({ p, lang }) {
  return (
    <Link className="dj-card" href={lien(`/journal/${p.slug}`, lang)}>
      <div className="dj-card-media" style={{ background: gradientFor(p.slug) }}>
        {p.image && <img src={p.image} alt={p.caption || p.title} loading="lazy" decoding="async" />}
        <span className="dj-chip">{p.catLabel}</span>
      </div>
      <div className="dj-card-body">
        <h4>{p.title}</h4>
        <p>{p.excerpt}</p>
        <div className="dj-meta"><span>{formatDate(p.date, lang)}</span><span>{p.read}</span></div>
      </div>
    </Link>
  )
}

export default async function JournalIndex({ params, searchParams }) {
  const lang = await langueDeParams(params)
  const sp = (await searchParams) || {}
  const cat = typeof sp.cat === 'string' && CATEGORIES.includes(sp.cat) ? sp.cat : 'Tous'

  const posts = postsEnLangue(lang)
  const list = cat === 'Tous' ? posts : posts.filter((p) => p.cat === cat)
  const feat = list[0]
  const rest = list.slice(1)
  const nb = list.length

  return (
    <main className="dj" id="journal" aria-label={`Blog ${BRAND.name}`}>
      {/* Un lecteur convaincu par un article doit pouvoir créer son événement
          sans repasser par l'accueil. */}
      <SiteNav large />

      <div className="dj-wrap dj-head">
        <span className="dj-eyebrow">blog</span>
        <h1>{t({
          fr: <>Tout ce qu’on aurait aimé savoir<br />avant le grand jour.</>,
          en: <>Everything we wish we’d known<br />before the big day.</>,
          de: <>Alles, was wir gern vor dem<br />großen Tag gewusst hätten.</>,
        }, lang)}</h1>
        <p>{t({
          fr: 'Photo, organisation, souvenirs d’invités. Des articles courts, écrits avec des mariés et des photographes.',
          en: 'Photos, planning, guests’ memories. Short articles, written with couples and photographers.',
          de: 'Fotos, Planung, Erinnerungen der Gäste. Kurze Artikel, geschrieben mit Brautpaaren und Fotografen.',
        }, lang)}</p>
      </div>

      <div className="dj-wrap">
        <div className="dj-cats" role="group" aria-label={t({ fr: 'Filtrer par catégorie', en: 'Filter by category', de: 'Nach Kategorie filtern' }, lang)}>
          {CATEGORIES.map((c) => (
            <Link key={c} className="dj-cat" aria-pressed={c === cat}
              href={c === 'Tous' ? lien('/journal', lang) : lien(`/journal?cat=${encodeURIComponent(c)}`, lang)}>
              {categorieLabel(c, lang)}
            </Link>
          ))}
        </div>

        {feat && (
          <Link className="dj-feat" href={lien(`/journal/${feat.slug}`, lang)}>
            <div className="dj-feat-media" style={{ background: gradientFor(feat.slug) }}>
              {feat.image && <img src={feat.image} alt={feat.caption || feat.title} fetchPriority="high" decoding="async" />}
              <span className="dj-badge">{t({ fr: 'à la une', en: 'featured', de: 'im Fokus' }, lang)}</span>
            </div>
            <div className="dj-feat-body">
              <span className="dj-eyebrow" style={{ fontSize: 11 }}>{feat.catLabel}</span>
              <h2>{feat.title}</h2>
              <p>{feat.excerpt}</p>
              <div className="dj-byline">
                <span className="dj-av" style={{ background: avatarColor(feat.author) }}>{feat.author[0]}</span>
                <span><strong>{feat.author}</strong>{formatDate(feat.date, lang)} · {feat.read}</span>
              </div>
            </div>
          </Link>
        )}
      </div>

      <div className="dj-grid-band">
        <div className="dj-wrap">
          <div className="dj-grid-head">
            <h3>{t({ fr: 'Derniers articles', en: 'Latest articles', de: 'Neueste Artikel' }, lang)}</h3>
            <span className="dj-count">{t({
              fr: `${nb}${nb > 1 ? ' articles' : ' article'}`,
              en: `${nb}${nb === 1 ? ' article' : ' articles'}`,
              de: `${nb}${nb === 1 ? ' Artikel' : ' Artikel'}`,
            }, lang)}</span>
          </div>
          <div className="dj-grid">
            {rest.map((p) => <Card key={p.slug} p={p} lang={lang} />)}
          </div>
        </div>
      </div>

      <div className="dj-news-band">
        <div className="dj-wrap">
          <div className="dj-news">
            <div>
              <h3>{t({ fr: 'Un mail par mois, jamais plus', en: 'One email a month, never more', de: 'Eine E-Mail pro Monat, nie mehr' }, lang)}</h3>
              <p>{t({
                fr: `Nos meilleurs conseils photo et organisation, et les nouveautés ${BRAND.name}. Désinscription en un clic.`,
                en: `Our best photo and planning tips, and what’s new at ${BRAND.name}. Unsubscribe in one click.`,
                de: `Unsere besten Foto- und Planungstipps und Neuigkeiten von ${BRAND.name}. Abmeldung mit einem Klick.`,
              }, lang)}</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </main>
  )
}
