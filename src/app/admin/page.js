'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Logo from '../../components/Logo'
import { tierByGuests, formatPrice } from '../../lib/pricing'

const KEY_STORE = 'declic_admin_key'

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
  const [keyInput, setKeyInput] = useState('')
  const [events, setEvents] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      setEvents(d.events); setAuthed(true)
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
            </div>
            {list.map((e) => {
              const pct = e.maxGuests ? Math.min(100, Math.round((e.guestCount / e.maxGuests) * 100)) : 0
              const warn = isWarn(e)
              return (
                <a className={`evrow ${warn ? 'warn' : ''}`} key={e.id} href={`/admin/event/${e.id}`}>
                  <span className="ev-name">
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
                  </span>
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
                    {warn
                      ? <span className="badge badge-warn"><span className="dot" />À vérifier</span>
                      : e.revealed
                        ? <span className="badge badge-live"><span className="dot" />Révélé</span>
                        : <span className="badge badge-wait"><span className="dot" />En cours</span>}
                  </span>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
