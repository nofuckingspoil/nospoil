'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { tierByGuests, formatPrice } from '../../lib/pricing'
import { finDe } from '../../lib/rappels'

const KEY_STORE = 'declic_admin_key'

// Les pages de pub n'ont aucun lien depuis le site vitrine : on les rassemble
// ici, sinon il faut retenir les adresses par cœur.
const LANDINGS = [
  ['/photos-mariage-invites', 'Le photographe'],
  ['/appareil-jetable-mariage', "L'appareil jetable"],
  ['/photobooth-mariage', 'Le prix'],
  ['/revivez-votre-mariage', "L'émotion"],
  ['/cadeau-mariage-temoins', 'Les témoins'],
]

function IconePause() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1.4" /><rect x="14" y="4" width="4" height="16" rx="1.4" />
    </svg>
  )
}
function IconePlay() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 4.8v14.4c0 .9 1 1.4 1.7.9l10.3-7.2c.6-.4.6-1.4 0-1.8L8.7 3.9c-.7-.5-1.7 0-1.7.9z" />
    </svg>
  )
}
// Une flèche qui sort du cadre : on quitte l'admin pour aller voir l'album
// avec les yeux de l'organisateur.
function IconeOuvrir() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
    </svg>
  )
}
function IconePoubelle() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a1 1 0 001 1h10a1 1 0 001-1l1-13M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
    </svg>
  )
}

// Trois barres : l'avis se lit comme une mesure, pas comme un message.
function IconeAvis() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4" y="13" width="4" height="8" rx="1.2" />
      <rect x="10" y="8" width="4" height="13" rx="1.2" />
      <rect x="16" y="3" width="4" height="18" rx="1.2" />
    </svg>
  )
}

// « sam. 27 sept. · 12:00 », à l'heure de Paris : la date exacte, sous le
// « dans 3 j » qui ne dit pas quel jour.
function dateCourte(iso) {
  try {
    const d = new Date(iso)
    if (isNaN(d)) return ''
    const jour = d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', day: 'numeric', month: 'short' })
    const heure = d.toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' })
    return `${jour} · ${heure}`
  } catch { return '' }
}

// Le jour du calendrier à Paris, « 2026-09-27 ». Les écarts se comptent en
// jours du calendrier et non en tranches de 24 h : un lundi à 9 h, une
// révélation mardi à 20 h est « demain », pas « dans 2 j » (35 h arrondies).
const FUSEAU = 'Europe/Paris'
function jourParis(d) {
  return new Date(d).toLocaleDateString('fr-CA', { timeZone: FUSEAU })
}
function ecartJours(iso, maintenant = Date.now()) {
  const a = Date.parse(jourParis(maintenant))
  const b = Date.parse(jourParis(iso))
  return Math.round((b - a) / 86400000)
}
function heureParis(iso) {
  return new Date(iso).toLocaleTimeString('fr-FR', { timeZone: FUSEAU, hour: '2-digit', minute: '2-digit' })
}
function dateHeureParis(iso) {
  return new Date(iso).toLocaleString('fr-FR', { timeZone: FUSEAU, weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
}

// Date en langage humain : « demain », « dans 3 j », « il y a 2 mois ».
function relTime(iso) {
  if (!iso || isNaN(new Date(iso))) return '-'
  const j = ecartJours(iso)
  if (j === 0) return "aujourd'hui"
  if (j === 1) return 'demain'
  if (j === -1) return 'hier'
  if (j === 2) return 'après-demain'
  const abs = Math.abs(j)
  let val, unit
  if (abs < 30) { val = abs; unit = 'j' }
  else if (abs < 365) { val = Math.round(abs / 30); unit = 'mois' }
  else { val = Math.round(abs / 365); unit = val > 1 ? 'ans' : 'an' }
  return (j > 0 ? 'dans ' : 'il y a ') + val + ' ' + unit
}

// Le titre d'un jour dans le bloc « à venir ».
function titreJour(j, iso) {
  if (j === 0) return "Aujourd'hui"
  if (j === 1) return 'Demain'
  const t = new Date(iso).toLocaleDateString('fr-FR', { timeZone: FUSEAU, weekday: 'long', day: 'numeric', month: 'long' })
  return t.charAt(0).toUpperCase() + t.slice(1)
}

const JOURS_A_VENIR = 7

// Où en est une soirée : pas encore commencée, en cours (commencée, pas encore
// révélée), ou terminée (révélée).
function momentDe(e, maintenant = Date.now()) {
  if (e.revealed) return 'termine'
  const debut = Date.parse(e.startsAt)
  if (Number.isFinite(debut) && debut > maintenant) return 'avenir'
  return 'encours'
}

// La fin de la fête : celle qu'a donnée l'organisateur, sinon l'estimation
// habituelle (six heures après le début, jamais après la révélation).
const finDeLaFete = (e) => finDe({ startsAt: e.startsAt, endsAt: e.endsAt, revealAt: e.revealAt })

// Tri par date « au plus proche » : ce qui arrive d'abord, dans l'ordre ;
// puis ce qui est passé, du plus récent au plus ancien. Un tri croissant brut
// mettrait en tête les soirées d'il y a trois mois.
function parProximite(ta, tb, maintenant = Date.now()) {
  const a = Number.isFinite(ta) ? ta : -Infinity
  const b = Number.isFinite(tb) ? tb : -Infinity
  const aVenirA = a >= maintenant, aVenirB = b >= maintenant
  if (aVenirA !== aVenirB) return aVenirA ? -1 : 1
  return aVenirA ? a - b : b - a
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [key, setKey] = useState('')      // clé admin courante, pour les actions
  const [keyInput, setKeyInput] = useState('')
  const [events, setEvents] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Actions directes depuis la liste : une demande urgente ne doit pas obliger
  // à ouvrir la fiche de l'événement pour agir.
  const [aSuspendre, setASuspendre] = useState(null)
  const [aSupprimer, setASupprimer] = useState(null)
  const [actionErr, setActionErr] = useState('')
  const [busy, setBusy] = useState(false)

  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | avenir | encours | termine | warn | test
  const [sort, setSort] = useState('recent')               // recent | debut | fin | reveal | photos | guests

  async function load(key) {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/events', { headers: { 'x-admin-key': key } })
      if (res.status === 401) { setError('Mot de passe incorrect.'); setAuthed(false); sessionStorage.removeItem(KEY_STORE); return }
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      setEvents(d.events); setAuthed(true); setKey(key)
      sessionStorage.setItem(KEY_STORE, key)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORE)
    if (k) load(k)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Les 7 prochains jours : qui fait la fête, qui se révèle, jour par jour.
  // Les tests sont laissés de côté, comme dans les chiffres clés.
  const aVenir = useMemo(() => {
    if (!events) return []
    const jours = new Map()
    const ajouter = (iso, quoi, e) => {
      if (!iso || isNaN(new Date(iso))) return
      const j = ecartJours(iso)
      if (j < 0 || j >= JOURS_A_VENIR) return
      if (quoi === 'revelation' && new Date(iso).getTime() < Date.now()) return
      if (!jours.has(j)) jours.set(j, { j, iso, lignes: [] })
      jours.get(j).lignes.push({ quoi, iso, e })
    }
    for (const e of events) {
      if (e.isTest || e.status === 'suspended') continue
      ajouter(e.startsAt, 'debut', e)
      ajouter(e.revealAt, 'revelation', e)
    }
    return [...jours.values()]
      .sort((a, b) => a.j - b.j)
      .map((d) => ({ ...d, lignes: d.lignes.sort((a, b) => new Date(a.iso) - new Date(b.iso)) }))
  }, [events])

  // Un événement révélé mais sans aucune photo = à vérifier
  const isWarn = (e) => e.revealed && e.photoCount === 0

  // Suspendre / réactiver : l'album se ferme et plus aucune photo n'entre,
  // mais rien n'est détruit : c'est réversible.
  async function suspendre() {
    if (!aSuspendre) return
    setActionErr(''); setBusy(true)
    const cible = aSuspendre.status === 'suspended' ? 'active' : 'suspended'
    try {
      const res = await fetch(`/api/admin/events/${aSuspendre.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify({ status: cible }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Modification impossible.')
      setASuspendre(null)
      load(key)
    } catch (err) { setActionErr(err.message) } finally { setBusy(false) }
  }

  // Suppression définitive : photos, participants et fichiers partent avec.
  async function supprimer() {
    if (!aSupprimer) return
    setActionErr(''); setBusy(true)
    try {
      const res = await fetch(`/api/admin/events/${aSupprimer.id}`, {
        method: 'DELETE', headers: { 'x-admin-key': key },
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Suppression impossible.')
      setASupprimer(null)
      load(key)
    } catch (err) { setActionErr(err.message) } finally { setBusy(false) }
  }

  const totals = useMemo(() => {
    const t = { guests: 0, photos: 0, downloads: 0, contacts: 0, revenue: 0, revealed: 0, ongoing: 0, tests: 0, avenir: 0, encours: 0, termine: 0 }
    for (const e of events || []) {
      // Les événements d'essai ne comptent dans aucun total : sinon les
      // moyennes ne veulent plus rien dire, et le revenu encore moins.
      if (e.isTest) { t.tests++; continue }
      t.guests += e.guestCount; t.photos += e.photoCount
      t.downloads += e.downloadCount; t.contacts += e.contactsCount
      // Ce qui a réellement été encaissé (remise déduite, 0 si offert).
      // Les événements antérieurs à cet enregistrement gardent le prix du palier.
      t.revenue += e.paidCents ?? tierByGuests(e.maxGuests).priceCents
      if (e.revealed) t.revealed++; else t.ongoing++
      t[momentDe(e)]++
    }
    return t
  }, [events])

  // Moyennes calculées sur les seuls vrais événements.
  const reels = (events || []).filter((e) => !e.isTest).length
  const avg = (n) => (reels ? Math.round(n / reels) : 0)

  const list = useMemo(() => {
    let l = (events || []).filter((e) => {
      if (q && !`${e.name} ${e.hostNames || ''} ${e.ownerEmail || ''}`.toLowerCase().includes(q.toLowerCase())) return false
      if (['avenir', 'encours', 'termine'].includes(statusFilter) && (e.isTest || momentDe(e) !== statusFilter)) return false
      if (statusFilter === 'warn' && !isWarn(e)) return false
      if (statusFilter === 'test' && !e.isTest) return false
      return true
    })
    l = [...l].sort((a, b) => {
      if (sort === 'photos') return b.photoCount - a.photoCount
      if (sort === 'guests') return b.guestCount - a.guestCount
      if (sort === 'debut') return parProximite(Date.parse(a.startsAt), Date.parse(b.startsAt))
      if (sort === 'fin') return parProximite(finDeLaFete(a), finDeLaFete(b))
      if (sort === 'reveal') return parProximite(Date.parse(a.revealAt), Date.parse(b.revealAt))
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
    return l
  }, [events, q, statusFilter, sort])

  // ---- Connexion ----
  if (!authed) return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        <h2 className="h3" style={{ marginBottom: 6 }}>Espace admin</h2>
        <p className="muted small" style={{ marginBottom: 18 }}>Réservé à l'équipe Time to Flash.</p>
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

  const warnCount = (events || []).filter(isWarn).length

  // ---- Tableau de bord ----
  return (
    <div className="site">
      <nav className="vnav">
        <Logo nameSize={22} size={36} />
        <span className="badge badge-wait"><span className="dot" />ADMIN</span>
      </nav>

      <div className="site-inner" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0 18px', flexWrap: 'wrap' }}>
          <h1 className="h2" style={{ margin: 0 }}>Tableau de bord</h1>
          <Link href="/admin/codes" className="linklike" style={{ fontSize: 14 }}>Codes promo →</Link>
          <Link href="/admin/avis" className="linklike" style={{ fontSize: 14 }}>Avis →</Link>
          <Link href="/admin/parcours" className="linklike" style={{ fontSize: 14 }}>Parcours →</Link>
        </div>

        {/* Chiffres clés */}
        <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
          <div className="stat">
            <div className="lbl">Événements</div>
            <div className="val">{reels}</div>
            <div className="note">
              {totals.avenir} à venir · {totals.encours} en cours · {totals.termine} terminés
              {totals.tests > 0 && <> · {totals.tests} test{totals.tests > 1 ? 's' : ''} exclu{totals.tests > 1 ? 's' : ''}</>}
            </div>
          </div>
          <div className="stat">
            <div className="lbl">Participants</div>
            <div className="val">{totals.guests}</div>
            <div className="note">≈ {avg(totals.guests)} / événement</div>
          </div>
          <div className="stat">
            <div className="lbl">Photos</div>
            <div className="val" style={{ color: 'var(--accent)' }}>{totals.photos}</div>
            <div className="note">≈ {avg(totals.photos)} / événement</div>
          </div>
          <div className="stat">
            <div className="lbl">Téléchargements</div>
            <div className="val">{totals.downloads}</div>
            <div className="note">albums « tout télécharger »</div>
          </div>
          <div className="stat">
            <div className="lbl">Numéros collectés</div>
            <div className="val">{totals.contacts}</div>
            <div className="note">contacts récupérés</div>
          </div>
          <div className="stat">
            <div className="lbl">Revenu potentiel</div>
            <div className="val" style={{ color: 'var(--ok)' }}>{formatPrice(totals.revenue)}</div>
            <div className="note">selon paliers (paiement à venir)</div>
          </div>
        </div>

        {/* Pages de pub : invisibles depuis le site, accessibles d'ici */}
        <div className="notice" style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <strong style={{ color: 'var(--ink)' }}>Pages de pub</strong>
          {LANDINGS.map(([href, label]) => (
            <a key={href} className="chip" href={href} target="_blank" rel="noreferrer"
              title={href} style={{ textDecoration: 'none' }}>{label} ↗</a>
          ))}
        </div>

        {/* Les 7 prochains jours */}
        <div className="avenir">
          <div className="avenir-titre">Les {JOURS_A_VENIR} prochains jours</div>
          {aVenir.length === 0 ? (
            <div className="muted" style={{ fontSize: 14 }}>Aucune fête ni révélation prévue.</div>
          ) : aVenir.map((d) => (
            <div className="avenir-jour" key={d.j}>
              <div className="avenir-date">{titreJour(d.j, d.iso)}</div>
              {d.lignes.map((l) => (
                <a className="avenir-ligne" key={`${l.quoi}-${l.e.id}`} href={`/admin/event/${l.e.id}`}>
                  <span className="avenir-heure">{heureParis(l.iso)}</span>
                  <span className={`avenir-quoi ${l.quoi}`}>{l.quoi === 'debut' ? 'Jour J' : 'Révélation'}</span>
                  <span className="avenir-nom">{l.e.hostNames || l.e.name}</span>
                  <span className="avenir-chiffres">{l.e.guestCount} part. · {l.e.photoCount} photos</span>
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Barre d'outils : recherche, filtres, tri */}
        <div className="adash-toolbar">
          <div className="adash-search">
            <input placeholder="Rechercher un événement ou un organisateur…" value={q}
              onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="adash-filters">
            {[
              ['all', `Tous (${events.length})`],
              ['avenir', `À venir (${totals.avenir})`],
              ['encours', `En cours (${totals.encours})`],
              ['termine', `Terminés (${totals.termine})`],
              ['warn', `À vérifier (${warnCount})`],
              ['test', `Tests (${totals.tests})`],
            ].map(([val, label]) => (
              <button key={val} className={`chip ${statusFilter === val ? 'on' : ''}`}
                onClick={() => setStatusFilter(val)}>{label}</button>
            ))}
          </div>
          <div className="adash-sort">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recent">Trier : plus récents</option>
              <option value="photos">Trier : plus de photos</option>
              <option value="guests">Trier : plus de participants</option>
              <option value="debut">Trier : date de début</option>
              <option value="fin">Trier : date de fin</option>
              <option value="reveal">Trier : date de révélation</option>
            </select>
          </div>
        </div>

        {/* Liste des événements */}
        {events.length === 0 ? (
          <div className="notice">Aucun événement pour l'instant.</div>
        ) : list.length === 0 ? (
          <div className="notice">Aucun événement ne correspond à cette recherche.</div>
        ) : (
          <div className="evtable">
            <div className="evrow evhead">
              <span className="ev-name">Événement</span>
              <span>Remplissage</span>
              <span>Photos</span>
              <span>Téléch.</span>
              <span>Numéros</span>
              <span>Révélation</span>
              <span>Statut</span>
              <span>Avis</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>
            {list.map((e) => {
              const pct = e.maxGuests ? Math.min(100, Math.round((e.guestCount / e.maxGuests) * 100)) : 0
              const warn = isWarn(e)
              const suspendu = e.status === 'suspended'
              return (
                <div className={`evrow ${warn ? 'warn' : ''} ${suspendu ? 'off' : ''}`} key={e.id}>
                  {/* La ligne n'est plus un lien : elle porte des boutons, et un
                      bouton dans un lien s'active des deux façons à la fois. */}
                  <a className="ev-name" href={`/admin/event/${e.id}`}>
                    {e.coverUrl
                      ? <img className="ev-thumb" src={e.coverUrl} alt="" />
                      : <span className="ev-thumb" />}
                    <span className="t">
                      <strong>
                        {e.isTest && <span className="badge badge-wait" style={{ marginRight: 6, fontSize: 10 }}>TEST</span>}
                        {e.name}
                      </strong>
                      {e.hostNames ? <span className="who">{e.hostNames}</span> : null}
                      {e.ownerEmail
                        ? <span className="who owner-email">✉ {e.ownerEmail}</span>
                        : <span className="who owner-email missing">✉ email inconnu</span>}
                    </span>
                  </a>
                  <span data-label="Remplissage">
                    <span className="fill">
                      <span className="bar"><i style={{ width: `${pct}%` }} /></span>
                      <span className="n">{e.guestCount}/{e.maxGuests}</span>
                    </span>
                  </span>
                  <span data-label="Photos"><span className="big" style={{ color: 'var(--accent)' }}>{e.photoCount}</span></span>
                  <span data-label="Téléch."><span className="big">{e.downloadCount}</span></span>
                  <span data-label="Numéros"><span className="big">{e.contactsCount}</span></span>
                  <span data-label="Révélation">
                    <span className="ev-quand" title={e.revealAt ? dateHeureParis(e.revealAt) : ''}>
                      {relTime(e.revealAt)}
                      <small>{dateCourte(e.revealAt)}</small>
                    </span>
                  </span>
                  <span data-label="Statut">
                    {suspendu
                      ? <span className="badge badge-warn"><span className="dot" />Suspendu</span>
                      : warn
                        ? <span className="badge badge-warn"><span className="dot" />À vérifier</span>
                        : e.revealed
                          ? <span className="badge badge-live"><span className="dot" />Révélé</span>
                          : <span className="badge badge-wait"><span className="dot" />En cours</span>}
                  </span>
                  {/* Les avis de cette soirée, à un clic. La pastille orange
                      signale qu'au moins un problème technique a été coché :
                      c'est la seule chose qu'on veut repérer en balayant la
                      liste des yeux. */}
                  <span data-label="Avis">
                    {e.avisCount > 0 ? (
                      <a className="ev-avis" href={`/admin/avis?event=${e.id}`}
                        title={`${e.avisCount} avis${e.avisSoucis ? ` · ${e.avisSoucis} problème${e.avisSoucis > 1 ? 's' : ''} signalé${e.avisSoucis > 1 ? 's' : ''}` : ''}`}>
                        <IconeAvis />
                        <span className="n">{e.avisCount}</span>
                        {e.avisMoyenne !== null && (
                          <span className="moy">{e.avisMoyenne.toFixed(1)}/4</span>
                        )}
                        {e.avisSoucis > 0 && <span className="pastille" aria-hidden="true" />}
                      </a>
                    ) : (
                      <span className="muted" style={{ fontSize: 13 }}>-</span>
                    )}
                  </span>
                  {/* Le nom de l'événement mène à sa fiche admin ; la flèche,
                      elle, ouvre le vrai tableau de bord de l'organisateur, avec
                      son jeton : c'est le seul moyen de voir ce qu'il voit quand
                      il appelle à l'aide. */}
                  <span className="pc-actions">
                    {e.ownerToken && (
                      <a className="pc-icon" href={`/event/${e.id}?k=${e.ownerToken}`}
                        target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}
                        title="Ouvrir comme l'organisateur" aria-label="Ouvrir comme l'organisateur">
                        <IconeOuvrir />
                      </a>
                    )}
                    <button className="pc-icon" type="button"
                      title={suspendu ? 'Réactiver cet événement' : 'Suspendre cet événement'}
                      aria-label={suspendu ? 'Réactiver cet événement' : 'Suspendre cet événement'}
                      onClick={() => { setActionErr(''); setASuspendre(e) }}>
                      {suspendu ? <IconePlay /> : <IconePause />}
                    </button>
                    <button className="pc-icon danger" type="button"
                      title="Supprimer cet événement" aria-label="Supprimer cet événement"
                      onClick={() => { setActionErr(''); setASupprimer(e) }}>
                      <IconePoubelle />
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ---- Suspendre / réactiver ---- */}
      {aSuspendre && (
        <div className="db-overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) setASuspendre(null) }}>
          <div className="db-sheet" style={{ maxWidth: 430 }}>
            <div className="db-sheet-grip" />
            {aSuspendre.status === 'suspended' ? (
              <>
                <h3 className="h3">Réactiver cet événement ?</h3>
                <p className="muted small" style={{ lineHeight: 1.65 }}>
                  <strong>{aSuspendre.name}</strong> redeviendra accessible : les participants
                  pourront à nouveau photographier, et l'album se rouvrira normalement.
                </p>
              </>
            ) : (
              <>
                <h3 className="h3">Suspendre cet événement ?</h3>
                <p className="muted small" style={{ lineHeight: 1.65 }}>
                  <strong>{aSuspendre.name}</strong> devient immédiatement inaccessible : plus
                  aucune photo ne peut être prise, l'album se ferme, et même l'organisateur n'y
                  entre plus.
                </p>
                <p className="muted small" style={{ marginTop: 10, lineHeight: 1.65 }}>
                  <strong>Rien n'est détruit</strong> : les {aSuspendre.photoCount} photos restent
                  en place, et tu peux réactiver à tout moment.
                </p>
              </>
            )}

            {actionErr && <div className="err" style={{ marginTop: 14 }}>{actionErr}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost" type="button" onClick={() => setASuspendre(null)}>Annuler</button>
              <button className={`btn ${aSuspendre.status === 'suspended' ? 'btn-dark' : 'btn-danger'}`}
                type="button" onClick={suspendre} disabled={busy}>
                {busy ? 'Un instant…' : aSuspendre.status === 'suspended' ? 'Réactiver' : 'Suspendre maintenant'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Supprimer ---- */}
      {aSupprimer && (
        <div className="db-overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) setASupprimer(null) }}>
          <div className="db-sheet" style={{ maxWidth: 430 }}>
            <div className="db-sheet-grip" />
            <h3 className="h3">Supprimer cet événement ?</h3>
            <p className="muted small" style={{ lineHeight: 1.65 }}>
              <strong>{aSupprimer.name}</strong>, ses <strong>{aSupprimer.photoCount} photos</strong> et
              ses {aSupprimer.guestCount} participants seront effacés définitivement, fichiers compris.
              C'est irréversible : personne ne pourra les récupérer, toi non plus.
            </p>
            <p className="muted small" style={{ marginTop: 10, lineHeight: 1.65 }}>
              Pour une demande urgente, <strong>suspendre</strong> suffit le plus souvent : c'est
              immédiat et réversible.
            </p>

            {actionErr && <div className="err" style={{ marginTop: 14 }}>{actionErr}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost" type="button" onClick={() => setASupprimer(null)}>Annuler</button>
              <button className="btn btn-danger" type="button" onClick={supprimer} disabled={busy}>
                {busy ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
