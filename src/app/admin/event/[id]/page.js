'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Logo from '../../../../components/Logo'
import { libelle, NOTES, estUneAlerte } from '../../../../lib/avis'

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
  const [avis, setAvis] = useState([])

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
    // Les avis de cette soirée, chargés à part : leur absence ne doit pas
    // empêcher d'ouvrir la fiche, qui sert aussi à tout autre chose.
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/avis?event=${id}`, { headers: { 'x-admin-key': k } })
        const d = await res.json()
        if (res.ok) setAvis(d.avis || [])
      } catch {}
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
                {data.event.ownerEmail
                  ? <div className="muted small" style={{ marginTop: 2 }}>Créé par <a href={`mailto:${data.event.ownerEmail}`} className="mono">{data.event.ownerEmail}</a></div>
                  : <div className="muted small" style={{ marginTop: 2, fontStyle: 'italic' }}>Créateur inconnu (email non renseigné)</div>}
              </div>
              <span className={`badge ${data.event.revealed ? 'badge-live' : 'badge-wait'}`}>
                <span className="dot" />{data.event.revealed ? 'Révélé' : 'En cours'}
              </span>
            </div>

            {/* Chiffres essentiels */}
            <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', marginTop: 16 }}>
              <div className="stat"><div className="lbl">Participants</div><div className="val">{data.event.guestCount}<span style={{ fontSize: 16, color: 'var(--text3)' }}>/{data.event.maxGuests}</span></div></div>
              <div className="stat"><div className="lbl">Photos</div><div className="val" style={{ color: 'var(--accent)' }}>{data.event.photoCount}</div></div>
              <div className="stat"><div className="lbl">Téléchargements</div><div className="val">{data.event.downloadCount}</div></div>
              <div className="stat"><div className="lbl">Numéros</div><div className="val">{data.contacts.length}</div></div>
            </div>

            {/* Méta */}
            <div className="ev-meta">
              <span>Créé le <strong>{fmtDate(data.event.createdAt)}</strong></span>
              <span>Révélation <strong>{fmtDate(data.event.revealAt)}</strong> <span className="muted">({relTime(data.event.revealAt)})</span></span>
              {data.event.galleryCode ? <span>Code album <strong className="mono">{data.event.galleryCode}</strong></span> : null}
              {data.event.expiresAt ? (
                <span>
                  {data.event.purgedAt ? 'Photos supprimées le ' : 'Suppression des photos '}
                  <strong>{fmtDate(data.event.purgedAt || data.event.expiresAt)}</strong>
                  {!data.event.purgedAt && <span className="muted"> ({relTime(data.event.expiresAt)})</span>}
                </span>
              ) : null}
              <a href={`/g/${data.event.id}`} target="_blank" rel="noreferrer">Voir l'album public ↗</a>
            </div>

            {/* Preuve du consentement, utile en cas de litige */}
            <div className="ev-meta" style={{ marginTop: 8 }}>
              {data.event.cgvAcceptedAt ? (
                <span>✅ CGV acceptées le <strong>{fmtDate(data.event.cgvAcceptedAt)}</strong>
                  {data.event.cgvVersion ? <span className="muted"> (version du {data.event.cgvVersion})</span> : null}
                </span>
              ) : (
                <span className="muted">CGV : acceptation non enregistrée (événement antérieur au suivi)</span>
              )}
              {data.event.withdrawalWaivedAt
                ? <span>✅ Rétractation : exécution immédiate demandée le <strong>{fmtDate(data.event.withdrawalWaivedAt)}</strong></span>
                : <span className="muted">Rétractation : pas de renonciation (formule gratuite ou événement ancien)</span>}
            </div>

            {/* Avis de cette soirée. Placés juste au-dessus de la liste des
                participants : « Marie n'a pas retrouvé le lien » se lit à côté de
                la ligne de Marie, ce qu'aucun tableur ne saurait faire. */}
            {avis.length > 0 && (
              <>
                <h3 className="h3" style={{ margin: '28px 0 10px' }}>
                  Avis ({avis.length})
                  <span className="muted small" style={{ fontWeight: 400, marginLeft: 8 }}>
                    {(() => {
                      const notes = avis.map((a) => a.rating).filter((n) => Number.isFinite(n))
                      const moy = notes.length ? (notes.reduce((s, n) => s + n, 0) / notes.length).toFixed(1) : null
                      const soucis = avis.filter((a) => (a.issues || []).some((i) => i !== 'ok')).length
                      return `${moy ? `${moy}/4` : 'sans note'}${soucis ? ` · ${soucis} problème${soucis > 1 ? 's' : ''} signalé${soucis > 1 ? 's' : ''}` : ''}`
                    })()}
                  </span>
                </h3>
                {avis.map((a) => {
                  const soucis = (a.issues || []).filter((i) => i !== 'ok')
                  const note = NOTES.find((n) => n.valeur === a.rating)
                  return (
                    <div className={`avis-fiche ${estUneAlerte(a) ? 'alerte' : ''}`} key={a.id}>
                      <div className="avis-fiche-tete">
                        <span className="qui">{a.role === 'organisateur' ? 'Organisateur' : a.guestName || 'Participant'}</span>
                        <span className="avis-etiq">{a.canal === 'mail' ? 'par mail' : 'dans l’album'}</span>
                        <span style={{ marginLeft: 'auto' }}>{fmtDate(a.createdAt)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                        {note && <strong style={{ fontSize: 15 }}>{note.emoji} {note.mot}</strong>}
                        {Number.isFinite(a.nps) && <span className="avis-etiq" style={{ fontSize: 11 }}>recommandation {a.nps}/10</span>}
                        {a.wouldHost && <span className="avis-etiq" style={{ fontSize: 11 }}>referait : {a.wouldHost}</span>}
                      </div>
                      {soucis.length > 0 && <p className="souci">⚠️ {soucis.map(libelle).join(' · ')}</p>}
                      {a.issueDetail && <p className="cite">« {a.issueDetail} »</p>}
                      {a.npsReason && <p className="cite">« {a.npsReason} »</p>}
                      {a.suggestion && <p className="cite">« {a.suggestion} »</p>}
                      {a.callOk && (
                        <p style={{ fontWeight: 600, color: 'var(--accent-deep)' }}>
                          📞 Accepte un appel de 5 min{a.phone ? ` : ${a.phone}` : ' (sans numéro laissé)'}
                        </p>
                      )}
                      {a.appareil && <div className="meta">{a.appareil}</div>}
                    </div>
                  )
                })}
                <Link href="/admin/avis" className="linklike" style={{ fontSize: 14 }}>
                  Voir la synthèse de tous les avis →
                </Link>
              </>
            )}

            {/* Participants : qui a scanné, qui a joué le jeu, qui n'a rien pris */}
            <h3 className="h3" style={{ margin: '28px 0 10px' }}>
              Participants ({data.guests?.length || 0})
              <span className="muted small" style={{ fontWeight: 400, marginLeft: 8 }}>
                {data.event.shotsPerGuest} clichés
                {data.event.bonusShots > 0 ? ` + ${data.event.bonusShots} de recharge` : ' · sans recharge'}
              </span>
            </h3>
            {!data.guests || data.guests.length === 0 ? (
              <div className="notice">Personne n'a encore scanné le QR code.</div>
            ) : (
              <div className="adm-guests">
                {data.guests.map((g) => (
                  <div className="adm-guest" key={g.id}>
                    <div className="adm-guest-id">
                      <strong>{g.name || 'Participant sans nom'}</strong>
                      <span className="muted small">
                        Arrivé {relTime(g.joinedAt)}
                        {g.lastActiveAt ? ` · vu ${relTime(g.lastActiveAt)}` : ' · jamais revenu'}
                      </span>
                      {(g.email || g.phone) && (
                        <span className="mono small muted">
                          {[g.email, g.phone].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    <div className="adm-guest-shots">
                      {/* Jauge : ce qui a été pris sur ce qui était permis. */}
                      <div className="adm-bar" aria-hidden="true">
                        <span style={{ width: `${Math.min(100, g.shotsTotal ? (g.shotsTaken / g.shotsTotal) * 100 : 0)}%` }} />
                      </div>
                      <span className="mono small">
                        {g.shotsTaken}/{g.shotsTotal}
                        {g.bonusUsed ? ' ⚡' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Numéros collectés */}
            {data.contacts.length > 0 && (
              <>
                <h3 className="h3" style={{ margin: '28px 0 10px' }}>Numéros collectés ({data.contacts.length})</h3>
                <div className="contacts-grid">
                  {data.contacts.map((c, i) => (
                    <div className="contact-item" key={i}>
                      <span>{c.name || 'Participant'}</span>
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
                <p className="muted small">Efface définitivement l'événement, ses {data.event.photoCount} photos et ses participants. Irréversible.</p>
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
