'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '../../../../components/Logo'

// ============================================================
//  Les essais du site : le QR et le bouton « Essayer » de l'accueil.
//
//  Combien de gens essaient, d'où ils viennent, jusqu'où ils vont, et qui
//  laisse son adresse. Les personnes qui ont coché « recevoir des nouvelles »
//  sont les seules qu'on peut exporter pour un envoi : les autres ont donné
//  leur adresse pour leur essai, rien d'autre.
// ============================================================

const KEY_STORE = 'declic_admin_key'
const PERIODES = [['7', '7 jours'], ['30', '30 jours'], ['90', '90 jours'], ['tout', 'Tout']]
const VIA = { qr: 'QR code', bouton: 'bouton « Essayer »', direct: 'lien direct' }
const DECOUVERTE = {
  instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook', bouche: 'Bouche-à-oreille',
  invite: 'Invité à une soirée Time to Flash', google: 'Recherche Google', ia: 'Assistant IA', autre: 'Autre',
}

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0)

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '' }
}

export default function AdminEssaisPage() {
  const [key, setKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [periode, setPeriode] = useState('30')
  const [d, setD] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function load(k, per = periode) {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin/essais?periode=${per}`, { headers: { 'x-admin-key': k } })
      if (res.status === 401) {
        setError('Mot de passe incorrect.'); setAuthed(false)
        sessionStorage.removeItem(KEY_STORE); return
      }
      const r = await res.json()
      if (!res.ok) throw new Error(r.error || 'Erreur.')
      setD(r); setAuthed(true); setKey(k)
      sessionStorage.setItem(KEY_STORE, k)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORE)
    if (k) load(k)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function changerPeriode(p) { setPeriode(p); load(key, p) }

  // Seuls ceux qui ont accepté les nouvelles partent dans le fichier.
  function exporter() {
    const lignes = [['prenom', 'email', 'langue', 'accord_le']]
    for (const p of d.personnes.filter((x) => x.nouvelles)) {
      lignes.push([p.nom || '', p.email, p.langue || '', (p.nouvellesLe || '').slice(0, 10)])
    }
    const csv = lignes.map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url; a.download = 'timetoflash-nouvelles.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  if (!authed) return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        <h2 className="h3" style={{ marginBottom: 6 }}>Essais</h2>
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

  const depart = d?.entonnoir?.[0]?.n || 0
  const abonnes = d?.personnes?.filter((p) => p.nouvelles) || []
  const convertis = d?.personnes?.filter((p) => p.soirees.length) || []

  return (
    <div className="site">
      <nav className="vnav">
        <Logo nameSize={22} size={36} />
        <span className="badge badge-wait"><span className="dot" />ADMIN</span>
      </nav>

      <div className="site-inner" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0 6px', flexWrap: 'wrap' }}>
          <h1 className="h2" style={{ margin: 0 }}>Essais et découverte</h1>
          <Link href="/admin" className="linklike" style={{ fontSize: 14 }}>← Tableau de bord</Link>
        </div>
        <p className="muted small" style={{ marginBottom: 18 }}>
          Les visiteurs qui essaient l&apos;appareil depuis l&apos;accueil (QR code ou bouton « Essayer »).
          Le suivi détaillé existe depuis le {fmtDate(d.carnetDepuis)} ; les adresses, depuis août.
        </p>

        <div className="essais-periodes">
          {PERIODES.map(([id, label]) => (
            <button key={id} className={`avis-opt ${periode === id ? 'on' : ''}`} onClick={() => changerPeriode(id)} disabled={loading}>{label}</button>
          ))}
        </div>

        {/* L'entonnoir : chaque ligne parmi ceux qui ont lancé un essai. */}
        <h2 className="h3" style={{ margin: '26px 0 10px' }}>Jusqu&apos;où vont-ils ?</h2>
        {depart === 0 ? (
          <div className="notice">Aucun essai sur la période.</div>
        ) : (
          <>
            <div className="essais-table">
              {d.entonnoir.map((e) => (
                <div key={e.id} className="essais-ligne">
                  <span>{e.label}</span>
                  <span className="essais-barre"><i style={{ width: `${pct(e.n, depart)}%` }} /></span>
                  <strong>{e.n}</strong>
                  <span className="muted">{pct(e.n, depart)} %</span>
                </div>
              ))}
            </div>
            <p className="muted small" style={{ marginTop: 8 }}>
              Lancés depuis : {Object.entries(d.via).filter(([, n]) => n).map(([k, n]) => `${VIA[k]} ${n}`).join(' · ')}
            </p>

            <h2 className="h3" style={{ margin: '26px 0 10px' }}>D&apos;où viennent-ils ?</h2>
            <div className="essais-table">
              <div className="essais-ligne essais-tete">
                <span>Provenance</span><span>Campagne</span><strong>Essais</strong><span>Photo</span><span>Adresse</span>
              </div>
              {d.provenances.map((g, i) => (
                <div key={i} className="essais-ligne essais-prov">
                  <span>{g.source}{g.medium ? <span className="muted"> · {g.medium}</span> : null}</span>
                  <span className="muted">{g.campagne || '-'}</span>
                  <strong>{g.n}</strong>
                  <span>{g.photo}</span>
                  <span>{g.mail}</span>
                </div>
              ))}
            </div>
            <p className="muted small" style={{ marginTop: 8 }}>
              « direct » : adresse tapée, favori, ou application qui ne dit pas d&apos;où elle vient (souvent WhatsApp ou un mail).
              Pour suivre une pub précisément, ajoutez à son lien <code>?utm_source=instagram&amp;utm_campaign=nom-de-la-pub</code>.
            </p>
          </>
        )}

        {/* Ce que les clients déclarent, juste après avoir créé leur soirée. */}
        <h2 className="h3" style={{ margin: '30px 0 10px' }}>Comment les clients vous ont découvert</h2>
        {d.reponses.length === 0 ? (
          <div className="notice">Aucune réponse sur la période. La question est posée juste après la création d&apos;une soirée.</div>
        ) : (
          <>
            <div className="essais-table">
              {Object.entries(d.reponses.reduce((acc, r) => { acc[r.choix] = (acc[r.choix] || 0) + 1; return acc }, {}))
                .sort((a, b) => b[1] - a[1])
                .map(([choix, n]) => {
                  const details = d.reponses.filter((r) => r.choix === choix && r.detail).map((r) => r.detail)
                  return (
                    <div key={choix} className="essais-ligne">
                      <span>{DECOUVERTE[choix] || choix}{details.length ? <span className="muted"> · {[...new Set(details)].join(', ')}</span> : null}</span>
                      <span className="essais-barre"><i style={{ width: `${pct(n, d.reponses.length)}%` }} /></span>
                      <strong>{n}</strong>
                      <span className="muted">{pct(n, d.reponses.length)} %</span>
                    </div>
                  )
                })}
            </div>
            <details style={{ marginTop: 10 }}>
              <summary className="small muted" style={{ cursor: 'pointer' }}>Voir le détail par soirée ({d.reponses.length})</summary>
              <div className="essais-table" style={{ marginTop: 8 }}>
                {d.reponses.map((r, i) => (
                  <div key={i} className="essais-ligne essais-personne">
                    <span><strong>{r.soiree}</strong></span>
                    <span className="muted">{fmtDate(r.le)}</span>
                    <span>{DECOUVERTE[r.choix] || r.choix}{r.detail ? ` (${r.detail})` : ''}</span>
                    <span className="muted">mesuré : {r.mesure || 'inconnu'}{r.euros ? ` · ${r.euros.toFixed(2).replace('.', ',')} €` : ' · gratuit'}</span>
                  </div>
                ))}
              </div>
            </details>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '30px 0 10px', flexWrap: 'wrap' }}>
          <h2 className="h3" style={{ margin: 0 }}>Les adresses laissées</h2>
          {abonnes.length > 0 && (
            <button className="linklike" style={{ fontSize: 14 }} onClick={exporter}>Exporter les {abonnes.length} abonnés aux nouvelles ↓</button>
          )}
        </div>
        <p className="muted small" style={{ marginBottom: 12 }}>
          {d.personnes.length} personne{d.personnes.length > 1 ? 's' : ''} depuis le début, {abonnes.length} d&apos;accord pour recevoir des nouvelles,
          {' '}{convertis.length} passée{convertis.length > 1 ? 's' : ''} ensuite à une vraie soirée.
          Sans la case « nouvelles », l&apos;adresse a été donnée pour l&apos;essai seulement : un mot personnel reste possible, pas une liste d&apos;envoi.
        </p>
        <div className="essais-table">
          {d.personnes.map((p) => (
            <div key={p.email} className="essais-ligne essais-personne">
              <span><strong>{p.nom || '-'}</strong><br /><span className="muted">{p.email}</span></span>
              <span className="muted">{fmtDate(p.essaiLe)}</span>
              <span>{p.nouvelles ? '✓ nouvelles' : <span className="muted">essai seul</span>}</span>
              <span>{p.soirees.length
                ? p.soirees.map((s) => `${s.nom}${s.euros ? ` (${s.euros.toFixed(2).replace('.', ',')} €)` : ' (gratuit)'}`).join(' · ')
                : <span className="muted">pas de soirée</span>}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
