'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '../../../components/Logo'

// ============================================================
//  Les parcours : où les invités et les organisateurs décrochent.
//
//  Deux entonnoirs, tirés du compteur d'étapes anonyme (voir /api/etape).
//  Chaque barre dit combien de personnes, parmi celles arrivées au départ,
//  ont atteint l'étape. Ce qui compte n'est pas la longueur des barres mais
//  l'écart entre deux barres voisines : la plus grosse perte est en rouge,
//  c'est l'écran à regarder en premier.
// ============================================================

const KEY_STORE = 'declic_admin_key'

const COULEURS = { site: 'var(--accent)', app: 'var(--ink)', clip: 'var(--amber)' }
const NOMS_SUPPORT = { site: 'site', app: 'app iPhone', clip: 'extrait d’app' }

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return '' }
}

const pourcent = (n, total) => (total ? Math.round((n / total) * 100) : 0)

function Legende() {
  return (
    <div className="parcours-legende">
      {Object.keys(COULEURS).map((s) => (
        <span key={s}><i style={{ background: COULEURS[s] }} />{NOMS_SUPPORT[s]}</span>
      ))}
    </div>
  )
}

// La barre, découpée par support : sa longueur totale est la part des
// arrivants, chaque tronçon la part venue du site, de l'app ou de l'extrait.
function Piste({ n, depart, supports }) {
  const largeur = pourcent(n, depart)
  return (
    <div className="parcours-piste">
      <div className="plein" style={{ width: `${largeur}%` }}>
        {Object.keys(COULEURS).map((s) => (supports[s] > 0 ? (
          <i key={s} style={{ width: `${pourcent(supports[s], n)}%`, background: COULEURS[s] }} />
        ) : null))}
      </div>
    </div>
  )
}

function Entonnoir({ donnees, vide }) {
  if (!donnees || donnees.depart === 0) return <div className="notice" style={{ marginBottom: 28 }}>{vide}</div>
  const { depart, etapes } = donnees

  // Les pertes se calculent le long du chemin principal seulement : l'album,
  // le code ou le paiement sont des branches, pas la marche suivante.
  const pertes = {}
  let avant = null
  for (const e of etapes) {
    if (!e.chaine) continue
    if (avant) pertes[e.id] = { n: avant.n - e.n, pct: pourcent(avant.n - e.n, avant.n) }
    avant = e
  }
  const pire = Object.entries(pertes)
    .filter(([, p]) => p.n > 0)
    .sort((a, b) => b[1].n - a[1].n)[0]?.[0]

  return (
    <>
      <Legende />
      <div className="parcours-liste">
        {etapes.map((e) => {
          const perte = pertes[e.id]
          const estPire = e.id === pire
          return (
            <div key={e.id} className={`parcours-etape ${e.chaine ? '' : 'hors'} ${estPire ? 'pire' : ''}`}>
              <div className="parcours-tete">
                <span className="t">{e.label}</span>
                <span className="n">{e.n}</span>
                <span className="pct">{pourcent(e.n, depart)} %</span>
                {perte && perte.n > 0 && (
                  <span className={`parcours-perte ${estPire ? 'pire' : ''}`}>
                    −{perte.n} ({perte.pct} %)
                  </span>
                )}
                {!e.chaine && <span className="parcours-perte">à part</span>}
              </div>
              <Piste n={e.n} depart={depart} supports={e.supports} />
              <div className="parcours-support">
                {Object.keys(COULEURS).map((s) => (
                  <span key={s}>{NOMS_SUPPORT[s]} {e.supports[s] || 0}</span>
                ))}
                {e.vus < e.n && (
                  <span title="Personnes passées plus loin sans que cette étape ait été vue (reconnexion, viseur de secours…)">
                    · {e.n - e.vus} déduit{e.n - e.vus > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {e.details.length > 0 && (
                <div className="parcours-details">
                  {e.details.map((d) => <span key={d.detail}><code>{d.detail}</code> {d.n} </span>)}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function Problemes({ liste, inscrits }) {
  return (
    <div className="parcours-liste">
      {liste.map((p) => (
        <div key={p.id} className="parcours-etape">
          <div className="parcours-tete">
            <span className="t">{p.label}</span>
            <span className="n">{p.n}</span>
            {inscrits > 0 && <span className="pct">soit {pourcent(p.n, inscrits)} % des inscrits</span>}
          </div>
          {p.n > 0 && (
            <div className="parcours-support">
              {Object.keys(COULEURS).map((s) => (
                <span key={s}>{NOMS_SUPPORT[s]} {p.supports[s] || 0}</span>
              ))}
            </div>
          )}
          {p.details.length > 0 ? (
            <div className="parcours-details">
              {p.details.map((d) => (
                <div key={d.detail}><code>{d.detail}</code> {d.n}</div>
              ))}
            </div>
          ) : (
            <div className="parcours-details">Rien de signalé sur cette période.</div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function AdminParcours() {
  const [key, setKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [donnees, setDonnees] = useState(null)

  const [onglet, setOnglet] = useState('invites') // invites | orgas | tirages
  const [periode, setPeriode] = useState('30')     // 7 | 30 | tout
  const [eventId, setEventId] = useState('')

  async function load(k, filtres = { periode, eventId }) {
    setLoading(true); setError('')
    try {
      const qs = new URLSearchParams({ periode: filtres.periode })
      if (filtres.eventId) qs.set('event', filtres.eventId)
      const res = await fetch(`/api/admin/parcours?${qs}`, { headers: { 'x-admin-key': k } })
      if (res.status === 401) {
        setError('Mot de passe incorrect.'); setAuthed(false)
        sessionStorage.removeItem(KEY_STORE); return
      }
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      setDonnees(d); setAuthed(true); setKey(k)
      sessionStorage.setItem(KEY_STORE, k)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORE)
    if (k) load(k)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function changer(filtres) {
    const suite = { periode, eventId, ...filtres }
    if ('periode' in filtres) setPeriode(filtres.periode)
    if ('eventId' in filtres) setEventId(filtres.eventId)
    load(key, suite)
  }

  if (!authed) return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        <h2 className="h3" style={{ marginBottom: 6 }}>Parcours</h2>
        <p className="muted small" style={{ marginBottom: 18 }}>Réservé à l&apos;équipe Time to Flash.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (keyInput.trim()) load(keyInput.trim()) }}>
          <input type="password" placeholder="Mot de passe admin" value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)} autoFocus />
          {error && <div className="err" style={{ marginTop: 12 }}>{error}</div>}
          <button className="btn btn-dark" type="submit" disabled={loading} style={{ marginTop: 14 }}>
            {loading ? 'Connexion…' : 'Entrer'}
          </button>
        </form>
      </div>
      <div className="spacer" />
    </main>
  )

  const inv = donnees?.invites
  const inscrits = inv?.etapes.find((e) => e.id === 'inscrit')?.n || 0

  return (
    <div className="site">
      <nav className="vnav">
        <Logo nameSize={22} size={36} />
        <span className="badge badge-wait"><span className="dot" />ADMIN</span>
      </nav>

      <div className="site-inner" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0 6px', flexWrap: 'wrap' }}>
          <h1 className="h2" style={{ margin: 0 }}>Parcours</h1>
          <Link href="/admin" className="linklike" style={{ fontSize: 14 }}>← Tableau de bord</Link>
        </div>
        <p className="muted small" style={{ marginBottom: 20, lineHeight: 1.6 }}>
          {donnees?.debut
            ? <>Mesure en place depuis le <strong>{fmtDate(donnees.debut)}</strong> : rien n&apos;existe avant cette date. </>
            : <>La mesure vient d&apos;être mise en place : les premiers chiffres arriveront avec les prochaines visites. </>}
          Anonyme (un jeton d&apos;appareil, ni prénom ni mail), chaque étape comptée une seule fois
          par personne et par soirée. Les soirées de test et d&apos;essai sont écartées.
        </p>

        <div className="adash-filters" style={{ marginBottom: 14 }}>
          <button className={`chip ${onglet === 'invites' ? 'on' : ''}`} onClick={() => setOnglet('invites')}>Invités</button>
          <button className={`chip ${onglet === 'orgas' ? 'on' : ''}`} onClick={() => setOnglet('orgas')}>Organisateurs</button>
          <button className={`chip ${onglet === 'tirages' ? 'on' : ''}`} onClick={() => setOnglet('tirages')}>Tirages</button>
        </div>

        <div className="parcours-filtres">
          <div className="adash-filters">
            {[['7', '7 jours'], ['30', '30 jours'], ['tout', 'Depuis le début']].map(([val, label]) => (
              <button key={val} className={`chip ${periode === val ? 'on' : ''}`}
                onClick={() => changer({ periode: val })} disabled={loading}>{label}</button>
            ))}
          </div>
          {onglet !== 'orgas' && (
            <select value={eventId} onChange={(e) => changer({ eventId: e.target.value })} disabled={loading}>
              <option value="">Toutes les soirées</option>
              {(donnees?.events || []).map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
          )}
        </div>

        {error && <div className="err" style={{ marginBottom: 14 }}>{error}</div>}
        {loading && <p className="muted small" style={{ marginBottom: 14 }}>Chargement…</p>}

        {onglet === 'invites' ? (
          <>
            <p className="muted small" style={{ marginBottom: 12, lineHeight: 1.6 }}>
              Au départ : <strong>{inv?.depart || 0}</strong> personne{(inv?.depart || 0) > 1 ? 's' : ''} arrivée
              {(inv?.depart || 0) > 1 ? 's' : ''} sur la page d&apos;une soirée avant la révélation.
              Chaque pourcentage se rapporte à ce départ.
            </p>
            <Entonnoir donnees={inv} vide="Aucune arrivée d'invité mesurée sur cette période." />
            {inv && inv.albumTotal > 0 && (
              <p className="muted small" style={{ margin: '-14px 0 24px' }}>
                En tout, {inv.albumTotal} ouverture{inv.albumTotal > 1 ? 's' : ''} d&apos;album sur la
                période, y compris par des personnes arrivées avant (ou sans) l&apos;appareil photo.
              </p>
            )}

            <h3 className="h3" style={{ fontSize: 17, marginBottom: 12 }}>Problèmes</h3>
            {inv && <Problemes liste={inv.problemes} inscrits={inscrits} />}
          </>
        ) : onglet === 'tirages' ? (
          <>
            <p className="muted small" style={{ marginBottom: 12, lineHeight: 1.6 }}>
              Au départ : <strong>{donnees?.tirages?.depart || 0}</strong> personne
              {(donnees?.tirages?.depart || 0) > 1 ? 's' : ''} ayant ouvert un album révélé. La fenêtre
              d&apos;invitation se compte à part : on peut commander sans l&apos;avoir vue (bouton du haut,
              barre, mail). Les précisions de « Commence à choisir » disent par où l&apos;on est arrivé.
            </p>
            <Entonnoir donnees={donnees?.tirages} vide="Aucune ouverture d'album mesurée sur cette période." />
          </>
        ) : (
          <>
            <p className="muted small" style={{ marginBottom: 12, lineHeight: 1.6 }}>
              Au départ : <strong>{donnees?.orgas?.depart || 0}</strong> appareil
              {(donnees?.orgas?.depart || 0) > 1 ? 's' : ''} arrivé{(donnees?.orgas?.depart || 0) > 1 ? 's' : ''} sur
              la création d&apos;événement (/create). Le code par mail (gratuit) et le paiement (payant)
              sont deux branches : chacun n&apos;en voit qu&apos;une.
            </p>
            <Entonnoir donnees={donnees?.orgas} vide="Aucune visite de la création mesurée sur cette période." />
          </>
        )}
      </div>
    </div>
  )
}
