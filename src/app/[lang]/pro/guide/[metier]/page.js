// ============================================================
//  Guides partenaires : /pro/guide/wedding-planners, /lieux-de-reception,
//  /photographes. Comment accompagner ses mariés avec Time to Flash.
//  Français seulement ; imprimable (et donc enregistrable en PDF).
// ============================================================
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { langueDeParams } from '../../../../../lib/langue-lien'
import { CLE_PAR_SLUG, METIERS_FICHE, cheminFiche, cheminLanding } from '../../../../../lib/partenaires'
import { GUIDES, REGLAGES, APRES_COMMUN, PIEGES } from '../../../../../lib/guide-partenaires'
import { ProNav, ProBandeau, ProPied } from '../../../../../components/pro/ProCadre'
import { BoutonPdf, Citation } from '../../../../../components/pro/BoutonsGuide'

export const dynamicParams = false
export function generateStaticParams() {
  return Object.keys(CLE_PAR_SLUG).flatMap((metier) => ['fr', 'en', 'de'].map((lang) => ({ lang, metier })))
}

export async function generateMetadata({ params }) {
  const { metier } = await params
  const g = GUIDES[CLE_PAR_SLUG[metier]]
  if (!g) return {}
  return {
    title: g.titreMeta,
    description: g.description,
    alternates: { canonical: `https://timetoflash.fr/pro/guide/${metier}` },
    openGraph: { title: `${g.titreMeta} | Time to Flash`, description: g.description, url: `https://timetoflash.fr/pro/guide/${metier}`, type: 'article', locale: 'fr_FR' },
  }
}

function Etape({ e }) {
  return (
    <section className="pg-etape">
      <div className="pg-etape-tete">
        <span className="pp-num">{e.n}</span>
        <h2>{e.t}</h2>
      </div>
      {e.d && <p className="pg-texte">{e.d}</p>}
      {e.citation && <Citation texte={e.citation} />}
      {e.reglages && (
        <div className="pg-reglages">
          {REGLAGES.map((r) => (
            <div key={r.t} className="pg-reglage"><h3>{r.t}</h3><p>{r.d}</p></div>
          ))}
        </div>
      )}
      {e.apres && (
        <div className="pg-reglages">
          {APRES_COMMUN.map((r) => (
            <div key={r.t} className="pg-reglage"><h3>{r.t}</h3><p>{r.d}</p></div>
          ))}
        </div>
      )}
      {e.liste && <ul className="pg-liste">{e.liste.map((x) => <li key={x}>{x}</li>)}</ul>}
      {e.aide && <p className="pg-aide">{e.aide}</p>}
    </section>
  )
}

export default async function GuidePartenaire({ params }) {
  const { metier } = await params
  const cle = CLE_PAR_SLUG[metier]
  const g = GUIDES[cle]
  if (!g) notFound()
  const lang = await langueDeParams(params)
  if (lang !== 'fr') redirect(`/pro/guide/${metier}`)

  return (
    <div className="pp">
      <ProNav retour={cheminLanding(cle)} />
      <main className="site-inner pg">
        <header className="pg-tete">
          <div className="eyebrow">Guide partenaire · {METIERS_FICHE[cle].pluriel}</div>
          <h1>{g.titre}</h1>
          <p className="pp-intro">{g.intro}</p>
          <div className="pg-tete-actions pp-pas-imprime">
            <BoutonPdf />
            <Link href="/guide" className="pp-ancre">Le guide à transmettre aux mariés →</Link>
          </div>
        </header>

        {g.etapes.map((e) => <Etape key={e.n} e={e} />)}

        <section className="pg-etape">
          <div className="pg-etape-tete"><span className="pp-num">!</span><h2>Ce qui peut coincer</h2></div>
          <div className="pg-reglages">
            {PIEGES.map((r) => <div key={r.t} className="pg-reglage"><h3>{r.t}</h3><p>{r.d}</p></div>)}
          </div>
        </section>

        <section className="pg-etape pg-memo">
          <div className="pg-etape-tete"><span className="pp-num">✓</span><h2>L’aide-mémoire</h2></div>
          <div className="pg-checklist">
            {g.checklist.map((c) => (
              <div key={c.quand} className="pg-check">
                <span className="pg-quand">{c.quand}</span>
                <ul>{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className="pg-liens pp-pas-imprime">
          <Link href="/generateur-qr-code-mariage" className="pp-pourqui">
            <span className="pp-pourqui-metier">Outil gratuit</span>
            <h3>L’affiche QR aux prénoms des mariés</h3>
            <p>Une affiche à poser sur les tables, prête à imprimer.</p>
            <span className="pp-pourqui-cta">Créer l’affiche →</span>
          </Link>
          <Link href="/guide" className="pp-pourqui">
            <span className="pp-pourqui-metier">Pour les mariés</span>
            <h3>Le guide de l’organisateur</h3>
            <p>Sept chapitres pour que les invités jouent le jeu : à leur transmettre tel quel.</p>
            <span className="pp-pourqui-cta">Lire le guide →</span>
          </Link>
        </section>
        <p className="pg-imprime-seulement">timetoflash.fr/pro/guide/{metier}</p>
      </main>
      <div className="pp-pas-imprime">
        <ProBandeau titre="Pas encore partenaire ?" texte="Présentez votre activité : 3 codes par département, un événement offert pour l’un de vos mariés." bouton={{ href: cheminFiche(cle), label: 'Recevoir mon code →' }} />
        <ProPied />
      </div>
    </div>
  )
}
