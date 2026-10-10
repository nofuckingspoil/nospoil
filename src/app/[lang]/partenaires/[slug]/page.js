// ============================================================
//  /partenaires/[slug] : la fiche publique d'un partenaire.
//  Rien de privé n'est lu ici (voir lib/partenaires-serveur.js).
// ============================================================
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { langueDeParams } from '../../../../lib/langue-lien'
import { ficheParSlug, fichesPubliees } from '../../../../lib/partenaires-serveur'
import { OFFRE, lienReseau, siteLien } from '../../../../lib/partenaires'
import { ProNav, ProBandeau, ProPied } from '../../../../components/pro/ProCadre'

export const revalidate = 300

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await ficheParSlug(slug)
  if (!p) return {}
  const titre = `${p.entreprise}, ${p.metierLabel.toLowerCase()} · ${p.dept_nom}`
  return {
    title: titre,
    description: p.description,
    alternates: { canonical: `https://timetoflash.fr/partenaires/${p.slug}` },
    openGraph: { title: `${titre} | Time to Flash`, description: p.description, type: 'profile', locale: 'fr_FR', ...(p.photoUrl ? { images: [p.photoUrl] } : {}) },
  }
}

export default async function FichePartenaire({ params }) {
  const { slug } = await params
  const lang = await langueDeParams(params)
  if (lang !== 'fr') redirect(`/partenaires/${slug}`)
  const p = await ficheParSlug(slug)
  if (!p) notFound()
  const voisins = (await fichesPubliees()).filter((x) => x.departement === p.departement && x.slug !== p.slug).slice(0, 6)
  const site = siteLien(p.site)
  const liens = [
    site && { href: site, label: 'Voir le site ↗', cls: 'btn btn-dark' },
    p.instagram && { href: lienReseau('instagram', p.instagram), label: 'Instagram ↗', cls: 'btn btn-ghost' },
    p.tiktok && { href: lienReseau('tiktok', p.tiktok), label: 'TikTok ↗', cls: 'btn btn-ghost' },
    p.facebook && { href: lienReseau('facebook', p.facebook), label: 'Facebook ↗', cls: 'btn btn-ghost' },
  ].filter(Boolean)

  return (
    <div className="pp">
      <ProNav pro={false} bouton={{ href: '/create', label: 'Créer un événement' }} />
      <main className="site-inner">
        <section className="pp-fiche-page">
          <nav className="pp-ariane" aria-label="Fil d’Ariane">
            <Link href="/partenaires">Partenaires</Link><span>/</span>
            <Link href={`/partenaires?dept=${p.departement}`}>{p.dept_nom}</Link><span>/</span>
            <span className="pp-ariane-ici">{p.entreprise}</span>
          </nav>
          <div className="pp-fiche-grille">
            <div className="pp-photo pp-photo-grande" style={p.photoUrl ? { backgroundImage: `url(${p.photoUrl})` } : undefined}>
              {!p.photoUrl && <span>{p.metierLabel}</span>}
            </div>
            <div className="pp-fiche-infos">
              <div className="eyebrow">{p.metierLabel} · {p.dept_nom} ({p.departement})</div>
              <h1>{p.entreprise}</h1>
              <p className="pp-fiche-desc">{p.description}</p>
              {liens.length > 0 && (
                <div className="pp-fiche-btns">
                  {liens.map((l) => <a key={l.href} href={l.href} className={l.cls} target="_blank" rel="noopener">{l.label}</a>)}
                </div>
              )}
              <span className="pp-badge"><span className="pp-etoile">✱</span> Partenaire Time to Flash {OFFRE.annee}</span>
            </div>
          </div>
        </section>
        {voisins.length > 0 && (
          <section className="pp-section">
            <h2 className="pp-h2-gauche">Aussi en {p.dept_nom}</h2>
            <div className="pp-voisins">
              {voisins.map((v) => (
                <Link key={v.slug} href={`/partenaires/${v.slug}`} className="pp-voisin">
                  <div className="pp-vignette" style={v.photoUrl ? { backgroundImage: `url(${v.photoUrl})` } : undefined} />
                  <div>
                    <span className="pp-meta">{v.metierLabel}</span>
                    <h3>{v.entreprise}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <ProBandeau
        surtitre="Pour les mariés de ce partenaire"
        titre="Toutes les photos de votre mariage, prises par vos invités."
        texte={`Vous préparez votre mariage avec ${p.entreprise} ? Parlez-lui de Time to Flash : un QR code sur les tables, et vous découvrez toutes les photos le lendemain.`}
      />
      <ProPied />
    </div>
  )
}
