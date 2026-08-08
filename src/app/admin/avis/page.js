'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Logo from '../../../components/Logo'
import { libelle, NOTES, estUneAlerte } from '../../../lib/avis'

// ============================================================
//  La synthèse des avis.
//
//  Deux lectures dans une seule page : tous les avis, ou ceux d'un seul
//  événement (?event=…), en arrivant depuis la ligne du tableau de bord.
//
//  Ce qui est mis en avant n'est pas la note (elle rassure sans rien
//  apprendre) mais le classement des problèmes signalés : c'est la liste des
//  corrections à faire, triée par fréquence.
// ============================================================

const KEY_STORE = 'declic_admin_key'

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })
  } catch { return '' }
}

function moyenne(liste) {
  const n = liste.filter((v) => Number.isFinite(v))
  if (!n.length) return null
  return n.reduce((s, v) => s + v, 0) / n.length
}

function noteLisible(n) {
  const t = NOTES.find((x) => x.valeur === n)
  return t ? `${t.emoji} ${t.mot}` : null
}

// Classement décroissant d'une valeur (problème, source, envie de refaire).
function Classement({ titre, entrees, total, neutre = false, vide }) {
  if (!entrees.length) return (
    <div className="notice" style={{ marginBottom: 20 }}>{vide}</div>
  )
  const max = Math.max(...entrees.map((e) => e.n))
  return (
    <div style={{ marginBottom: 26 }}>
      <h3 className="h3" style={{ fontSize: 17, marginBottom: 12 }}>{titre}</h3>
      <div className="avis-barres">
        {entrees.map((e) => (
          <div className={`avis-barre ${neutre ? 'neutre' : ''}`} key={e.id}>
            <span className="t">{e.label}</span>
            <span className="n">{e.n}{total ? ` · ${Math.round((e.n / total) * 100)} %` : ''}</span>
            <span className="piste"><i style={{ width: `${Math.round((e.n / max) * 100)}%` }} /></span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Fiche({ a }) {
  const soucis = (a.issues || []).filter((i) => i !== 'ok')
  return (
    <div className={`avis-fiche ${estUneAlerte(a) ? 'alerte' : ''}`}>
      <div className="avis-fiche-tete">
        <span className="qui">
          {a.role === 'organisateur' ? 'Organisateur' : a.guestName || 'Participant'}
        </span>
        <span className="avis-etiq">{a.role === 'organisateur' ? 'orga' : 'participant'}</span>
        {/* D'où vient la réponse : c'est ce qui permet de comparer ceux qui
            sont allés jusqu'à l'album et ceux qu'il a fallu relancer. */}
        <span className="avis-etiq">{a.canal === 'mail' ? 'par mail' : 'dans l’album'}</span>
        {a.eventName && (
          a.eventId
            ? <Link href={`/admin/event/${a.eventId}`} style={{ color: 'var(--text3)' }}>{a.eventName}</Link>
            : <span>{a.eventName} (supprimé)</span>
        )}
        <span style={{ marginLeft: 'auto' }}>{fmtDate(a.createdAt)}</span>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        {noteLisible(a.rating) && <strong style={{ fontSize: 15 }}>{noteLisible(a.rating)}</strong>}
        {Number.isFinite(a.nps) && (
          <span className="avis-etiq" style={{ fontSize: 11 }}>recommandation {a.nps}/10</span>
        )}
        {a.wouldHost && (
          <span className="avis-etiq" style={{ fontSize: 11 }}>referait : {a.wouldHost}</span>
        )}
      </div>

      {soucis.length > 0 && (
        <p className="souci">⚠️ {soucis.map(libelle).join(' · ')}</p>
      )}
      {a.issueDetail && <p className="cite">« {a.issueDetail} »</p>}
      {a.npsReason && <p className="cite">« {a.npsReason} »</p>}
      {a.suggestion && <p className="cite">« {a.suggestion} »</p>}
      {a.favorite && <p><span className="muted">A préféré :</span> {libelle(a.favorite)}</p>}
      {a.source && <p><span className="muted">Nous a connus par :</span> {libelle(a.source)}</p>}

      {a.callOk && (
        <p style={{ fontWeight: 600, color: 'var(--accent-deep)' }}>
          📞 Accepte un appel de 5 min{a.phone ? ` : ${a.phone}` : ' (sans numéro laissé)'}
          {a.contactEmail ? ` · ${a.contactEmail}` : ''}
        </p>
      )}
      {a.appareil && <div className="meta">{a.appareil}</div>}
    </div>
  )
}

function AvisInner() {
  const sp = useSearchParams()
  const eventId = sp.get('event')

  const [key, setKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [avis, setAvis] = useState([])
  const [eventName, setEventName] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [vue, setVue] = useState('tous') // tous | orga | invite | soucis | rappels

  async function load(k) {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin/avis${eventId ? `?event=${eventId}` : ''}`, {
        headers: { 'x-admin-key': k },
      })
      if (res.status === 401) {
        setError('Mot de passe incorrect.'); setAuthed(false)
        sessionStorage.removeItem(KEY_STORE); return
      }
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      setAvis(d.avis || []); setEventName(d.eventName || null)
      setAuthed(true); setKey(k)
      sessionStorage.setItem(KEY_STORE, k)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORE)
    if (k) load(k)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const stats = useMemo(() => {
    const orga = avis.filter((a) => a.role === 'organisateur')
    const invites = avis.filter((a) => a.role === 'invite')
    const parAlbum = invites.filter((a) => a.canal === 'album')
    const parMail = invites.filter((a) => a.canal === 'mail')

    const compter = (liste, extrait) => {
      const acc = {}
      for (const a of liste) for (const v of extrait(a)) if (v) acc[v] = (acc[v] || 0) + 1
      return Object.entries(acc)
        .map(([id, n]) => ({ id, n, label: libelle(id) }))
        .sort((x, y) => y.n - x.n)
    }

    return {
      total: avis.length,
      orga, invites,
      note: moyenne(avis.map((a) => a.rating)),
      nps: moyenne(orga.map((a) => a.nps)),
      noteAlbum: moyenne(parAlbum.map((a) => a.rating)),
      noteMail: moyenne(parMail.map((a) => a.rating)),
      nAlbum: parAlbum.length,
      nMail: parMail.length,
      soucis: compter(avis, (a) => (a.issues || []).filter((i) => i !== 'ok')),
      sources: compter(orga, (a) => [a.source]),
      preferees: compter(orga, (a) => [a.favorite]),
      referait: compter(invites, (a) => [a.wouldHost]).map((e) => ({ ...e, label: e.id })),
      rappels: orga.filter((a) => a.callOk),
      sansSouci: avis.filter((a) => !(a.issues || []).some((i) => i !== 'ok')).length,
    }
  }, [avis])

  const liste = useMemo(() => {
    if (vue === 'orga') return avis.filter((a) => a.role === 'organisateur')
    if (vue === 'invite') return avis.filter((a) => a.role === 'invite')
    if (vue === 'soucis') return avis.filter((a) => (a.issues || []).some((i) => i !== 'ok'))
    if (vue === 'rappels') return avis.filter((a) => a.callOk)
    return avis
  }, [avis, vue])

  // Export : le jour où l'on voudra croiser ces chiffres avec autre chose.
  // Point-virgule et BOM, parce que c'est ce qu'Excel en français attend.
  function exporter() {
    const colonnes = [
      'date', 'evenement', 'role', 'canal', 'note', 'recommandation', 'pourquoi',
      'problemes', 'detail', 'suggestion', 'preferee', 'source', 'referait',
      'rappel', 'telephone', 'email', 'appareil',
    ]
    const echappe = (v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`
    const lignes = liste.map((a) => [
      fmtDate(a.createdAt), a.eventName, a.role, a.canal, a.rating, a.nps, a.npsReason,
      (a.issues || []).filter((i) => i !== 'ok').map(libelle).join(' | '),
      a.issueDetail, a.suggestion, a.favorite ? libelle(a.favorite) : '',
      a.source ? libelle(a.source) : '', a.wouldHost,
      a.callOk ? 'oui' : '', a.phone, a.contactEmail, a.appareil,
    ].map(echappe).join(';'))

    const csv = '﻿' + [colonnes.join(';'), ...lignes].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `timetoflash-avis${eventId ? '-evenement' : ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!authed) return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        <h2 className="h3" style={{ marginBottom: 6 }}>Avis</h2>
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

  const nb = (v) => (v === null ? '-' : v.toFixed(1))

  return (
    <div className="site">
      <nav className="vnav">
        <Logo nameSize={22} size={36} />
        <span className="badge badge-wait"><span className="dot" />ADMIN</span>
      </nav>

      <div className="site-inner" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0 6px', flexWrap: 'wrap' }}>
          <h1 className="h2" style={{ margin: 0 }}>Avis</h1>
          <Link href="/admin" className="linklike" style={{ fontSize: 14 }}>← Tableau de bord</Link>
          {avis.length > 0 && (
            <button className="linklike" style={{ fontSize: 14 }} onClick={exporter}>Exporter ({liste.length}) ↓</button>
          )}
        </div>
        <p className="muted small" style={{ marginBottom: 22 }}>
          {eventId
            ? <>Les avis de « <strong>{eventName || 'cet événement'}</strong> ». <Link href="/admin/avis" className="linklike">Voir tous les avis</Link></>
            : 'Toutes les réponses reçues, organisateurs et participants confondus.'}
        </p>

        {avis.length === 0 ? (
          <div className="notice">
            Aucun avis pour l&apos;instant. Les questionnaires partent deux jours après
            la révélation pour les organisateurs, trois jours pour les participants qui
            ne sont jamais allés jusqu&apos;à l&apos;album.
          </div>
        ) : (
          <>
            <div className="avis-stats">
              <div className="avis-carte">
                <div className="lbl">Réponses</div>
                <div className="val">{stats.total}</div>
                <div className="note">{stats.orga.length} orga · {stats.invites.length} participants</div>
              </div>
              <div className="avis-carte">
                <div className="lbl">Note moyenne</div>
                <div className="val">{nb(stats.note)}<span style={{ fontSize: 15, color: 'var(--text4)' }}>/4</span></div>
                <div className="note">sur les quatre visages</div>
              </div>
              <div className="avis-carte">
                <div className="lbl">Recommandation</div>
                <div className="val">{nb(stats.nps)}<span style={{ fontSize: 15, color: 'var(--text4)' }}>/10</span></div>
                <div className="note">organisateurs seulement</div>
              </div>
              <div className="avis-carte">
                <div className="lbl">Sans accroc</div>
                <div className="val">{stats.total ? Math.round((stats.sansSouci / stats.total) * 100) : 0} %</div>
                <div className="note">{stats.total - stats.sansSouci} ont signalé quelque chose</div>
              </div>
              {/* La comparaison qui vaut la peine d'exister : ceux qui sont
                  allés jusqu'à l'album contre ceux qu'il a fallu relancer.
                  Un écart marqué veut dire qu'un obstacle se joue en amont,
                  et l'enquête posée dans l'album ne l'aurait jamais montré. */}
              <div className="avis-carte">
                <div className="lbl">Album vs relance</div>
                <div className="val" style={{ fontSize: 21 }}>
                  {nb(stats.noteAlbum)} <span style={{ color: 'var(--text4)' }}>vs</span> {nb(stats.noteMail)}
                </div>
                <div className="note">{stats.nAlbum} venus à l&apos;album · {stats.nMail} relancés par mail</div>
              </div>
              <div className="avis-carte">
                <div className="lbl">À rappeler</div>
                <div className="val" style={{ color: 'var(--accent)' }}>{stats.rappels.length}</div>
                <div className="note">ont accepté un appel de 5 min</div>
              </div>
            </div>

            <Classement
              titre="Ce qui a coincé, par fréquence"
              entrees={stats.soucis}
              total={stats.total}
              vide="Aucun problème signalé pour l'instant."
            />

            {!eventId && (
              <>
                <Classement titre="Ce qui a le plus plu" entrees={stats.preferees} total={stats.orga.length}
                  neutre vide="Pas encore de réponse d'organisateur." />
                <Classement titre="Comment ils nous ont connus" entrees={stats.sources} total={stats.orga.length}
                  neutre vide="Pas encore de réponse d'organisateur." />
                <Classement titre="Les participants utiliseraient-ils Time to Flash pour leur propre fête ?"
                  entrees={stats.referait} total={stats.invites.length}
                  neutre vide="Pas encore de réponse de participant." />
              </>
            )}

            <h3 className="h3" style={{ fontSize: 17, margin: '30px 0 12px' }}>Les réponses</h3>
            <div className="adash-filters" style={{ marginBottom: 16 }}>
              {[
                ['tous', `Tous (${avis.length})`],
                ['orga', `Organisateurs (${stats.orga.length})`],
                ['invite', `Participants (${stats.invites.length})`],
                ['soucis', `Problèmes (${stats.total - stats.sansSouci})`],
                ['rappels', `À rappeler (${stats.rappels.length})`],
              ].map(([val, label]) => (
                <button key={val} className={`chip ${vue === val ? 'on' : ''}`} onClick={() => setVue(val)}>
                  {label}
                </button>
              ))}
            </div>

            {liste.length === 0
              ? <div className="notice">Rien dans cette vue.</div>
              : liste.map((a) => <Fiche key={a.id} a={a} />)}
          </>
        )}
      </div>
    </div>
  )
}

export default function AdminAvisPage() {
  return (
    <Suspense fallback={<main className="center-screen"><p className="muted">Chargement…</p></main>}>
      <AvisInner />
    </Suspense>
  )
}
