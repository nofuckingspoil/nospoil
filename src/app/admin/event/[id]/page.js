'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Logo from '../../../../components/Logo'

const KEY_STORE = 'declic_admin_key'

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }
  catch { return iso }
}
function relTime(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  const abs = Math.abs(diff); const day = 86400000
  if (abs < day) return "aujourd'hui"
  let val, unit
  if (abs < 30 * day) { val = Math.round(abs / day); unit = 'j' }
  else if (abs < 365 * day) { val = Math.round(abs / (30 * day)); unit = 'mois' }
  else { val = Math.round(abs / (365 * day)); unit = val > 1 ? 'ans' : 'an' }
  return (diff >= 0 ? 'dans ' : 'il y a ') + val + ' ' + unit
}

export default function AdminEvent() {
  const { id } = useParams()
  const router = useRouter()
  const [key, setKey] = useState(null)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORE)
    if (!k) { router.replace('/admin'); return }
    setKey(k)
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/events/${id}`, { headers: { 'x-admin-key': k } })
        if (res.status === 401) { sessionStorage.removeItem(KEY_STORE); router.replace('/admin'); return }
        const d = await res.json()
        if (!res.ok) throw new Error(d.error || 'Erreur.')
        setData(d)
      } catch (err) { setError(err.message) } finally { setLoading(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function remove() {
    setDeleting(true); setError('')
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Suppression impossible.')
      router.replace('/admin')
    } catch (err) { setError(err.message); setDeleting(false); setConfirm(false) }
  }

  return (
    <div className="site">
      <nav className="vnav">
        <Logo nameSize={22} size={36} />
        <span className="badge badge-wait"><span className="dot" />ADMIN</span>
      </nav>

      <div className="site-inner" style={{ paddingBottom: 60 }}>
        <a href="/admin" className="muted small" style={{ display: 'inline-block', margin: '18px 0 10px' }}>← Retour au tableau de bord</a>

        {loading ? (
          <div className="notice">Chargement…</div>
        ) : error && !data ? (
          <div className="err">{error}</div>
        ) : data ? (
          <>
            <div className="ev-head-admin">
              <div>
                <h1 className="h2" style={{ marginBottom: 4 }}>{data.event.name}</h1>
                {data.event.hostNames ? <div className="muted">{data.event.hostNames}</div> : null}
              </div>
              <span className={`badge ${data.event.revealed ? 'badge-live' : 'badge-wait'}`}>
                <span className="dot" />{data.event.revealed ? 'Révélé' : 'En cours'}
              </span>
            </div>

            {/* Chiffres essentiels */}
            <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', marginTop: 16 }}>
              <div className="stat"><div className="lbl">Invités</div><div className="val">{data.event.guestCount}<span style={{ fontSize: 16, color: 'var(--text3)' }}>/{data.event.maxGuests}</span></div></div>
              <div className="stat"><div className="lbl">Photos</div><div className="val" style={{ color: 'var(--accent)' }}>{data.event.photoCount}</div></div>
              <div className="stat"><div className="lbl">Téléchargements</div><div className="val">{data.event.downloadCount}</div></div>
              <div className="stat"><div className="lbl">Numéros</div><div className="val">{data.contacts.length}</div></div>
            </div>

            {/* Méta */}
            <div className="ev-meta">
              <span>Créé le <strong>{fmtDate(data.event.createdAt)}</strong></span>
              <span>Révélation <strong>{fmtDate(data.event.revealAt)}</strong> <span className="muted">({relTime(data.event.revealAt)})</span></span>
              {data.event.galleryCode ? <span>Code album <strong className="mono">{data.event.galleryCode}</strong></span> : null}
              <a href={`/g/${data.event.id}`} target="_blank" rel="noreferrer">Voir l'album public ↗</a>
            </div>

            {/* Numéros collectés */}
            {data.contacts.length > 0 && (
              <>
                <h3 className="h3" style={{ margin: '28px 0 10px' }}>Numéros collectés ({data.contacts.length})</h3>
                <div className="contacts-grid">
                  {data.contacts.map((c, i) => (
                    <div className="contact-item" key={i}>
                      <span>{c.name || 'Invité'}</span>
                      <a href={`tel:${c.phone}`} className="mono">{c.phone}</a>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Photos */}
            <h3 className="h3" style={{ margin: '28px 0 10px' }}>Photos ({data.photos.length})</h3>
            {data.photos.length === 0 ? (
              <div className="notice">Aucune photo pour cet événement.</div>
            ) : (
              <div className="ph-grid">
                {data.photos.map((p) => (
                  <a key={p.id} href={p.fullUrl} target="_blank" rel="noreferrer" className={`ph-item ${p.hidden ? 'hidden' : ''}`} title={`${p.who}${p.hidden ? ' · masquée' : ''}`}>
                    <img src={p.url} alt="" loading="lazy" />
                    {p.hidden ? <span className="ph-tag">masquée</span> : null}
                  </a>
                ))}
              </div>
            )}

            {/* Zone de suppression */}
            <div className="danger-zone">
              <div>
                <strong>Supprimer cet événement</strong>
                <p className="muted small">Efface définitivement l'événement, ses {data.event.photoCount} photos et ses invités. Irréversible.</p>
              </div>
              {error ? <div className="err" style={{ marginBottom: 10 }}>{error}</div> : null}
              {!confirm ? (
                <button className="btn btn-danger" onClick={() => setConfirm(true)}>Supprimer</button>
              ) : (
                <div className="confirm-row">
                  <span className="small">Sûr ? C'est définitif.</span>
                  <button className="btn btn-danger" onClick={remove} disabled={deleting}>{deleting ? 'Suppression…' : 'Oui, supprimer'}</button>
                  <button className="btn btn-ghost" onClick={() => setConfirm(false)} disabled={deleting}>Annuler</button>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
