'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Logo from '../../../../components/Logo'
import { STATUTS, LIMITES, libelleMetier, libelleVolume } from '../../../../lib/pro'

// ============================================================
//  Les demandes des prestataires de mariage (formulaire de /pro).
//
//  Le circuit : la demande arrive (statut « nouvelle », et un mail d'alerte),
//  on crée le code dans /admin/codes, on l'envoie soi-même par mail, puis on
//  note ici le code envoyé et on passe la demande en « code envoyé ».
// ============================================================

const KEY_STORE = 'declic_admin_key'

function fmtDate(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '' }
}

// Une adresse saisie librement (« monsite.fr », « @mon_insta ») devient un lien cliquable.
function lienSite(s) {
  const v = String(s || '').trim()
  if (!v) return null
  if (/^https?:\/\//i.test(v)) return v
  if (/^@[\w.]+$/.test(v)) return `https://instagram.com/${v.slice(1)}`
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(v)) return `https://${v}`
  return null
}

function Fiche({ d, adminKey, onSaved }) {
  const [statut, setStatut] = useState(d.statut || 'nouvelle')
  const [code, setCode] = useState(d.code_envoye || '')
  const [note, setNote] = useState(d.note || '')
  const [etat, setEtat] = useState('')
  const [busy, setBusy] = useState(false)
  const modifie = statut !== (d.statut || 'nouvelle') || code !== (d.code_envoye || '') || note !== (d.note || '')

  async function enregistrer() {
    setBusy(true); setEtat('')
    try {
      const res = await fetch('/api/admin/pros', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
        body: JSON.stringify({ id: d.id, statut, code_envoye: code, note }),
      })
      const r = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(r.error || 'Erreur.')
      setEtat('Enregistré.')
      onSaved(r.demande || { ...d, statut, code_envoye: code || null, note: note || null })
    } catch (err) { setEtat(err.message) } finally { setBusy(false) }
  }

  const site = lienSite(d.site)
  return (
    <div className={`apro-fiche ${d.statut === 'nouvelle' ? 'nouvelle' : ''}`}>
      <div className="apro-tete">
        <h3>{d.entreprise} <span className="muted" style={{ fontWeight: 500 }}>· {libelleMetier(d.metier)} · {d.ville}</span></h3>
        <span className="apro-date">{fmtDate(d.created_at)}</span>
      </div>
      <div className="apro-infos">
        <span>Contact : <b>{d.prenom} {d.nom}</b></span>
        <span>E-mail : <a href={`mailto:${d.email}`}>{d.email}</a></span>
        <span>Téléphone : <b>{d.telephone ? <a href={`tel:${d.telephone}`}>{d.telephone}</a> : '-'}</b></span>
        <span>Site : {d.site ? (site ? <a href={site} target="_blank" rel="noopener noreferrer">{d.site}</a> : <b>{d.site}</b>) : <b>-</b>}</span>
        <span>Mariages par an : <b>{d.volume ? libelleVolume(d.volume) : '-'}</b></span>
        <span>Langue : <b>{(d.langue || 'fr').toUpperCase()}</b></span>
        <span>Provenance : <b>{d.provenance || '-'}</b></span>
        <span style={{ wordBreak: 'break-all' }}>Page d’origine : <b>{d.page_origine || '-'}</b></span>
        {d.traite_at && <span>Traitée le : <b>{fmtDate(d.traite_at)}</b></span>}
      </div>
      {d.message && <p className="apro-message">{d.message}</p>}

      <div className="apro-suivi">
        <label>Statut
          <select value={statut} onChange={(e) => setStatut(e.target.value)}>
            {STATUTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
        <label>Code envoyé
          <input type="text" value={code} maxLength={LIMITES.code_envoye} placeholder="ex. PRO-DUPONT"
            onChange={(e) => setCode(e.target.value.toUpperCase())} />
        </label>
        <label className="apro-note">Note
          <input type="text" value={note} maxLength={LIMITES.note} placeholder="Échange, rappel, impressions…"
            onChange={(e) => setNote(e.target.value)} />
        </label>
        <button className="btn btn-dark" type="button" onClick={enregistrer} disabled={busy || !modifie}>
          {busy ? '…' : 'Enregistrer'}
        </button>
      </div>
      {etat && <div className="apro-etat">{etat}</div>}
    </div>
  )
}

export default function AdminProsPage() {
  const [key, setKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [demandes, setDemandes] = useState(null)
  const [filtre, setFiltre] = useState('tout')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(k) {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/pros', { headers: { 'x-admin-key': k } })
      if (res.status === 401) {
        setError('Mot de passe incorrect.'); setAuthed(false)
        sessionStorage.removeItem(KEY_STORE); return
      }
      setAuthed(true); setKey(k)
      sessionStorage.setItem(KEY_STORE, k)
      const r = await res.json()
      if (!res.ok) throw new Error(r.error || 'Erreur.')
      setDemandes(r.demandes)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORE)
    if (k) load(k)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const compte = useMemo(() => {
    const c = { tout: (demandes || []).length }
    for (const s of STATUTS) c[s.id] = (demandes || []).filter((d) => (d.statut || 'nouvelle') === s.id).length
    return c
  }, [demandes])

  const visibles = (demandes || []).filter((d) => filtre === 'tout' || (d.statut || 'nouvelle') === filtre)

  if (!authed) return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        <h2 className="h3" style={{ marginBottom: 6 }}>Demandes partenaires</h2>
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

  return (
    <div className="site">
      <nav className="vnav">
        <Logo nameSize={22} size={36} />
        <span className="badge badge-wait"><span className="dot" />ADMIN</span>
      </nav>

      <div className="site-inner" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0 6px', flexWrap: 'wrap' }}>
          <h1 className="h2" style={{ margin: 0 }}>Demandes partenaires</h1>
          <Link href="/admin" className="linklike" style={{ fontSize: 14 }}>← Tableau de bord</Link>
          <Link href="/admin/codes" className="linklike" style={{ fontSize: 14 }}>Créer un code →</Link>
          <a href="/pro" target="_blank" rel="noopener noreferrer" className="linklike" style={{ fontSize: 14 }}>Voir la page /pro</a>
        </div>
        <p className="muted small" style={{ marginBottom: 16 }}>
          Les prestataires qui ont rempli le formulaire de la page /pro. Créez le code dans « Codes promo »,
          envoyez-le par mail, puis notez-le ici et passez la demande en « Code envoyé ».
        </p>

        {error && <div className="err" style={{ marginBottom: 16 }}>{error}</div>}

        {demandes && (
          <>
            <div className="apro-filtres">
              {[{ id: 'tout', label: 'Toutes' }, ...STATUTS].map((s) => (
                <button key={s.id} className={`avis-opt ${filtre === s.id ? 'on' : ''}`} onClick={() => setFiltre(s.id)}>
                  {s.label} ({compte[s.id] || 0})
                </button>
              ))}
            </div>

            {visibles.length === 0 ? (
              <div className="notice">Aucune demande{filtre !== 'tout' ? ' avec ce statut' : ' pour le moment'}.</div>
            ) : (
              <div className="apro-liste">
                {visibles.map((d) => (
                  <Fiche key={d.id} d={d} adminKey={key}
                    onSaved={(maj) => setDemandes((old) => old.map((x) => (x.id === maj.id ? { ...x, ...maj } : x)))} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
