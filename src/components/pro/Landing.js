// ============================================================
//  Landing du programme partenaires : /pro (cle = 'general') et
//  /pro/wedding-planners, /pro/lieux-de-reception, /pro/photographes.
//
//  Maquette « Espace pro » (design_handoff_programme_partenaires), textes
//  adaptés à l'offre réelle : un code par professionnel, trois par
//  département. Tous les textes sont dans lib/partenaires.js.
// ============================================================
import Link from 'next/link'
import { getPostEnLangue } from '../../lib/journal'
import { ProNav, ProBandeau, ProPied } from './ProCadre'
import { LANDINGS, POUR_QUI, METIERS_FICHE, OFFRE, cheminFiche, cheminLanding } from '../../lib/partenaires'

// Les articles du blog écrits pour les professionnels (repris de l'ancienne page /pro).
const ARTICLES = {
  general: ['services-wedding-planner', 'photographe-mariage-photos-invites', 'attirer-maries-lieu-reception'],
  planner: ['services-wedding-planner'],
  lieu: ['attirer-maries-lieu-reception'],
  photo: ['photographe-mariage-photos-invites'],
}

export default function Landing({ cle }) {
  const m = LANDINGS[cle]
  const articles = (ARTICLES[cle] || []).map((slug) => getPostEnLangue(slug, 'fr')).filter(Boolean)
  const general = cle === 'general'
  const fiche = cheminFiche(cle)
  const ancres = general
    ? [{ href: '#comment', label: 'Comment ça marche' }, { href: '#pourqui', label: 'Pour qui' }, { href: '#questions', label: 'Questions' }]
    : [{ href: '#avantages', label: 'Vos avantages' }, { href: '#comment', label: 'Comment ça marche' }, { href: '#questions', label: 'Questions' }]
  const autres = ['planner', 'lieu', 'photo', 'general'].filter((k) => k !== cle)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: 'fr-FR',
    mainEntity: m.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <div className="pp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProNav ancres={ancres} bouton={{ href: fiche, label: 'Recevoir mon code' }} />

      <main>
        <div className="site-inner">
          <section className="pp-hero">
            <div>
              <div className="eyebrow">{m.eyebrow}</div>
              <h1>{m.titre}</h1>
              <p className="pp-intro">{m.intro}</p>
              <div className="pp-hero-cta">
                <Link href={fiche} className="btn btn-accent">Recevoir mon code →</Link>
                <span className="pp-mono-note">Sans carte bancaire · Sans engagement</span>
              </div>
            </div>
            <div className="pp-carte-code" aria-label={`Un événement offert, jusqu’à ${OFFRE.invites} participants`}>
              <div className="pp-carte-haut">
                <span><span className="pp-etoile">✱</span> Code partenaire</span>
                <span className="pp-ambre">Mariages {OFFRE.annee}</span>
              </div>
              <div className="pp-carte-titre">1 événement<br />offert</div>
              <div className="pp-carte-sous">Jusqu’à {OFFRE.invites} participants</div>
              <div className="pp-ticket">VOTRE CODE</div>
              <div className="pp-carte-rarete">{OFFRE.codesParDepartement} codes par département, pour les premières fiches validées</div>
              <div className="pp-carte-bas">
                <span>Valeur <s>{OFFRE.valeur}</s></span>
                <strong>0,00 €</strong>
              </div>
            </div>
          </section>
        </div>

        {!general && (
          <section id="avantages" className="pp-avantages">
            <div className="site-inner">
              <div className="pp-sur-ambre">{m.pourLabel}</div>
              <h2>Ce que vous y gagnez</h2>
              <div className="pp-grille-3">
                {m.avantages.map((b) => (
                  <div key={b.k} className="pp-avantage">
                    <span className="pp-lettre">{b.k}</span>
                    <h3>{b.t}</h3>
                    <p>{b.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="site-inner">
          <section id="comment" className="pp-section pp-sans-trait">
            <div className="eyebrow-mute pp-centre">Comment ça marche</div>
            <h2 className="section-title">Une fiche à remplir, rien d’autre</h2>
            <div className="pp-grille-3 pp-espace-haut">
              {m.etapes.map((s) => (
                <div key={s.n} className="pp-etape">
                  <span className="pp-num">{s.n}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
          </section>

          {general && (
            <section id="pourqui" className="pp-section">
              <div className="eyebrow-mute pp-centre">Pour qui</div>
              <h2 className="section-title">Ce que vous y gagnez, selon votre métier</h2>
              <div className="pp-grille-3 pp-espace-haut">
                {POUR_QUI.map((w) => (
                  <Link key={w.cle} href={cheminLanding(w.cle)} className="pp-pourqui">
                    <span className="pp-pourqui-metier">{METIERS_FICHE[w.cle].pluriel}</span>
                    <h3>{w.t}</h3>
                    <p>{w.d}</p>
                    <span className="pp-pourqui-cta">{w.cta}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section id="questions" className="pp-section">
            <h2 className="section-title">Questions fréquentes</h2>
            <div className="pp-faq">
              {m.faq.map((q) => (
                <div key={q.q} className="faq-item">
                  <h3>{q.q}</h3>
                  <p>{q.a}</p>
                </div>
              ))}
            </div>
          </section>

          {articles.length > 0 && (
            <section className="pp-section">
              <div className="eyebrow-mute pp-centre">Pour aller plus loin</div>
              <h2 className="section-title">À lire sur notre journal</h2>
              <div className="pp-grille-articles pp-espace-haut">
                {articles.map((a) => (
                  <Link key={a.slug} href={`/journal/${a.slug}`} className="pp-pourqui">
                    <h3>{a.title}</h3>
                    <p>{a.excerpt}</p>
                    <span className="pp-pourqui-cta">Lire l’article →</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <ProBandeau titre={m.ctaTitre} bouton={{ href: fiche, label: 'Recevoir mon code →' }} autres={general ? null : autres} />
      <ProPied />
    </div>
  )
}

export function metadataLanding(cle) {
  const m = LANDINGS[cle]
  const chemin = cheminLanding(cle)
  return {
    title: m.titreMeta,
    description: m.description,
    alternates: { canonical: `https://timetoflash.fr${chemin}` },
    openGraph: { title: `${m.titreMeta} | Time to Flash`, description: m.description, url: `https://timetoflash.fr${chemin}`, type: 'website', locale: 'fr_FR' },
  }
}
