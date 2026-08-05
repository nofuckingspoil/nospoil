'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { tierByGuests, formatPrice } from '../../lib/pricing'

const KEY_STORE = 'declic_admin_key'

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

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }) }
  catch { return iso }
}

// Date en langage humain : « dans 3 j », « il y a 2 mois », « aujourd'hui »
function relTime(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  const abs = Math.abs(diff)
  const day = 86400000
  if (abs < day) return "aujourd'hui"
  let val, unit
  if (abs < 30 * day) { val = Math.round(abs / day); unit = 'j' }
  else if (abs < 365 * day) { val = Math.round(abs / (30 * day)); unit = 'mois' }
  else { val = Math.round(abs / (365 * day)); unit = val > 1 ? 'ans' : 'an' }
  return (diff >= 0 ? 'dans ' : 'il y a ') + val + ' ' + unit
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
  const [statusFilter, setStatusFilter] = useState('all') // all | ongoing | revealed | warn
  const [sort, setSort] = useState('recent')               // recent | photos | guests | reveal

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

  // Un événement révélé mais sans aucune photo = à vérifier
  const isWarn = (e) => e.revealed && e.photoCount === 0

  // Suspendre / réactiver : l'album se ferme et plus aucune photo n'entre,
  // mais rien n'est détruit — c'est réversible.
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

  // Suppression définitive : photos, invités et fichiers partent avec.
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
    const t = { guests: 0, photos: 0, downloads: 0, contacts: 0, revenue: 0, revealed: 0, ongoing: 0, tests: 0 }
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
    }
    return t
  }, [events])

  // Moyennes calculées sur les seuls vrais événements.
  const reels = (events || []).filter((e) => !e.isTest).length
  const avg = (n) => (reels ? Math.round(n / reels) : 0)

  const list = useMemo(() => {
    let l = (events || []).filter((e) => {
      if (q && !`${e.name} ${e.hostNames || ''} ${e.ownerEmail || ''}`.toLowerCase().includes(q.toLowerCase())) return false
      if (statusFilter === 'ongoing' && e.revealed) return false
      if (statusFilter === 'revealed' && !e.revealed) return false
      if (statusFilter === 'warn' && !isWarn(e)) return false
      if (statusFilter === 'test' && !e.isTest) return false
      return true
    })
    l = [...l].sort((a, b) => {
      if (sort === 'photos') return b.photoCount - a.photoCount
      if (sort === 'guests') return b.guestCount - a.guestCount
      if (sort === 'reveal') return new Date(a.revealAt) - new Date(b.revealAt)
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
        </div>

        {/* Chiffres clés */}
        <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
          <div className="stat">
            <div className="lbl">Événements</div>
            <div className="val">{reels}</div>
            <div className="note">
              {totals.ongoing} en cours · {totals.revealed} révélés
              {totals.tests > 0 && <> · {totals.tests} test{totals.tests > 1 ? 's' : ''} exclu{totals.tests > 1 ? 's' : ''}</>}
            </div>
          </div>
          <div className="stat">
            <div className="lbl">Invités</div>
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

        {/* Barre d'outils : recherche, filtres, tri */}
        <div className="adash-toolbar">
          <div className="adash-search">
            <input placeholder="Rechercher un événement ou un organisateur…" value={q}
              onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="adash-filters">
            {[
              ['all', `Tous (${events.length})`],
              ['ongoing', `En cours (${totals.ongoing})`],
              ['revealed', `Révélés (${totals.revealed})`],
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
              <option value="guests">Trier : plus d'invités</option>
              <option value="reveal">Trier : révélation</option>
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
                    <span title={fmtDate(e.revealAt)}>{relTime(e.revealAt)}</span>
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
                      <span className="muted" style={{ fontSize: 13 }}>—</span>
                    )}
                  </span>
                  {/* Deux gestes, deux icônes. Le nom de l'événement reste le
                      chemin pour l'ouvrir : un troisième bouton n'aurait fait
                      que répéter ce lien. */}
                  <span className="pc-actions">
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
                  <strong>{aSuspendre.name}</strong> redeviendra accessible : les invités
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
                  <strong>Rien n'est détruit</strong> — les {aSuspendre.photoCount} photos restent
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
              ses {aSupprimer.guestCount} invités seront effacés définitivement, fichiers compris.
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
