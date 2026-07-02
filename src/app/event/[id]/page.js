'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { BRAND } from '../../../lib/brand'
import Logo from '../../../components/Logo'
import InstallPrompt from '../../../components/InstallPrompt'
import { getOwnerToken, saveOwnerToken, rememberMyEvent, forgetMyEvent } from '../../../lib/device'

function formatDate(iso) {
  try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }
  catch { return iso }
}
function daysUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'J'
  return 'J-' + Math.ceil(diff / 86400000)
}
// Convertit une date ISO en valeur pour un champ <input type="datetime-local"> (heure locale)
function toLocalInput(iso) {
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EventManage({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [ev, setEv] = useState(null)
  const [error, setError] = useState('')
  const [joinUrl, setJoinUrl] = useState('')
  const [ownerUrl, setOwnerUrl] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [ownerCopied, setOwnerCopied] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [deleting, setDeleting] = useState(false)
  // Gestion des admins (côté organisateur)
  const [adminName, setAdminName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [adminMsg, setAdminMsg] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)
  // Connexion admin (côté ami invité à co-gérer)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginCode, setLoginCode] = useState('')
  const [loginMsg, setLoginMsg] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  // Modifier la date de révélation
  const [editingDate, setEditingDate] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [savingDate, setSavingDate] = useState(false)
  const [dateMsg, setDateMsg] = useState('')
  // Code d'accès à la galerie
  const [galleryCodeInput, setGalleryCodeInput] = useState('')
  const [savingGallery, setSavingGallery] = useState(false)
  const [galleryMsg, setGalleryMsg] = useState('')
  const [galleryCopied, setGalleryCopied] = useState(false)
  const [showContacts, setShowContacts] = useState(false)

  useEffect(() => {
    // Lien privé organisateur ouvert depuis un autre appareil : ?k=<jeton> → on l'enregistre
    // pour reconnaître cet appareil comme organisateur, puis on nettoie l'adresse.
    const params = new URLSearchParams(window.location.search)
    const k = params.get('k')
    if (k) {
      saveOwnerToken(id, k)
      rememberMyEvent(id)
      window.history.replaceState(null, '', `/event/${id}`)
    }

    const token = getOwnerToken(id)
    setJoinUrl(`${window.location.origin}/j/${id}`)
    setOwnerUrl(`${window.location.origin}/event/${id}?k=${token}`)
    fetch(`/api/events/${id}`, { headers: { 'x-owner-token': token } })
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setEv(d)))
      .catch(() => setError("Impossible de charger l'événement."))
  }, [id])

  useEffect(() => {
    if (!joinUrl) return
    QRCode.toDataURL(joinUrl, { width: 440, margin: 1, color: { dark: '#14161F', light: '#FCF8F0' } })
      .then(setQrUrl).catch(() => {})
  }, [joinUrl])

  function copyLink() {
    navigator.clipboard?.writeText(joinUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }
  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title: ev?.name || BRAND.name, text: 'Prenez des photos pour notre appareil jetable 📸', url: joinUrl }) } catch {}
    } else copyLink()
  }

  // --- Accès organisateur : à sauvegarder pour retrouver le tableau de bord depuis n'importe où ---
  function copyOwnerLink() {
    navigator.clipboard?.writeText(ownerUrl).then(() => { setOwnerCopied(true); setTimeout(() => setOwnerCopied(false), 1800) })
  }
  async function saveAccess() {
    // Ouvre le partage natif du téléphone → l'organisateur peut s'envoyer le lien
    // dans ses Notes, par mail, WhatsApp… une appli qu'il a déjà sous la main.
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Accès organisateur — ${ev?.name || BRAND.name}`,
          text: `Mon tableau de bord ${BRAND.name} (à garder précieusement, ne pas partager aux invités) :`,
          url: ownerUrl,
        })
        return
      } catch {}
    }
    copyOwnerLink()
  }
  function pad(n) { return String(n).padStart(2, '0') }
  function icsStamp(d) {
    return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  }
  function addToCalendar() {
    // Crée un rappel le jour de la révélation, avec le lien organisateur dans la description.
    const start = new Date(ev.revealAt)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const esc = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Declic//FR', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `UID:${id}@declic`,
      `DTSTART:${icsStamp(start)}`,
      `DTEND:${icsStamp(end)}`,
      `SUMMARY:${esc(`📸 Révélation des photos — ${ev.name}`)}`,
      `DESCRIPTION:${esc(`Vos photos se révèlent aujourd'hui !\nTableau de bord organisateur (à garder privé) : ${ownerUrl}`)}`,
      'BEGIN:VALARM', 'TRIGGER:-PT0M', 'ACTION:DISPLAY', `DESCRIPTION:${esc(ev.name)}`, 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n')
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'declic-revelation.ics'; a.click()
    URL.revokeObjectURL(url)
  }

  // Recharge les infos de l'événement (après ajout/retrait d'un admin)
  async function reloadEvent() {
    const token = getOwnerToken(id)
    const d = await fetch(`/api/events/${id}`, { headers: { 'x-owner-token': token } }).then((r) => r.json()).catch(() => null)
    if (d && !d.error) setEv(d)
  }

  async function addAdmin(e) {
    e.preventDefault()
    setAdminMsg(''); setAddingAdmin(true)
    try {
      const res = await fetch(`/api/events/${id}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
        body: JSON.stringify({ name: adminName, email: adminEmail, code: adminCode }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || "Impossible d'ajouter cet admin.")
      setAdminName(''); setAdminEmail(''); setAdminCode('')
      await reloadEvent()
    } catch (err) { setAdminMsg(err.message) }
    finally { setAddingAdmin(false) }
  }

  async function removeAdmin(adminId) {
    await fetch(`/api/events/${id}/admins?adminId=${adminId}`, {
      method: 'DELETE', headers: { 'x-owner-token': getOwnerToken(id) },
    }).catch(() => {})
    await reloadEvent()
  }

  async function adminLogin(e) {
    e.preventDefault()
    setLoginMsg(''); setLoggingIn(true)
    try {
      const res = await fetch(`/api/events/${id}/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, code: loginCode }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Mail ou code incorrect.')
      saveOwnerToken(id, d.ownerToken)
      rememberMyEvent(id)
      window.location.reload()
    } catch (err) { setLoginMsg(err.message); setLoggingIn(false) }
  }

  // --- Modifier la date de révélation ---
  function startEditDate() {
    setDateMsg('')
    setNewDate(toLocalInput(ev.revealAt))
    setEditingDate(true)
  }
  async function saveDate(e) {
    e.preventDefault()
    setDateMsg(''); setSavingDate(true)
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
        body: JSON.stringify({ revealAt: newDate }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Modification impossible.')
      setEditingDate(false)
      await reloadEvent()
    } catch (err) { setDateMsg(err.message) }
    finally { setSavingDate(false) }
  }

  // --- Code d'accès à la galerie (activer / retirer) ---
  async function saveGalleryCode(codeValue) {
    setGalleryMsg(''); setSavingGallery(true)
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-owner-token': getOwnerToken(id) },
        body: JSON.stringify({ galleryCode: codeValue }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Modification impossible.')
      setGalleryCodeInput('')
      await reloadEvent()
    } catch (err) { setGalleryMsg(err.message) }
    finally { setSavingGallery(false) }
  }

  // --- Partager le lien de l'album (avec le code s'il est activé) ---
  async function shareGallery() {
    const url = `${window.location.origin}/g/${id}`
    const text = ev.galleryCode
      ? `Les photos de ${ev.name} 📸\nLien : ${url}\nCode d'accès : ${ev.galleryCode}`
      : `Les photos de ${ev.name} 📸\n${url}`
    if (navigator.share) {
      try { await navigator.share({ title: ev.name, text, url }); return } catch {}
    }
    try { await navigator.clipboard.writeText(text); setGalleryCopied(true); setTimeout(() => setGalleryCopied(false), 1800) } catch {}
  }

  async function deleteEvent() {
    setDeleting(true); setError('')
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE', headers: { 'x-owner-token': getOwnerToken(id) } })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Suppression impossible.')
      forgetMyEvent(id)
      router.push('/mes-evenements')
    } catch (err) { setError(err.message); setDeleting(false) }
  }

  if (error) return <main className="screen screen-cream center"><div className="card">{error}</div></main>
  if (!ev) return <main className="center-screen"><p className="muted">Chargement…</p></main>

  return (
    <main className="screen screen-cream">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none' }}><Logo nameSize={22} size={36} /></Link>
        <Link href="/mes-evenements" className="mono small" style={{ color: 'var(--text2)', textDecoration: 'none' }}>Mes événements</Link>
      </div>

      <header style={{ marginTop: 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 className="h2" style={{ margin: 0 }}>{ev.name}</h1>
          <span className={`badge ${ev.revealed ? 'badge-live' : 'badge-wait'}`}>
            <span className="dot" />{ev.revealed ? 'RÉVÉLÉ' : 'EN COURS'}
          </span>
        </div>
        <div className="mono" style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 6 }}>
          révélation {formatDate(ev.revealAt)}
        </div>
      </header>

      {ev.isOwner && (
        <div className="stats" style={{ marginTop: 20 }}>
          <div className="stat"><div className="lbl">Invités</div><div className="val">{ev.guestCount}</div><div className="note">ont rejoint</div></div>
          <div className="stat"><div className="lbl">Souvenirs</div><div className="val" style={{ color: 'var(--accent)' }}>{ev.photoCount}</div><div className="note">photos prises</div></div>
          <div className="stat"><div className="lbl">Clichés / invité</div><div className="val">{ev.shotsPerGuest}</div><div className="note">contrainte argentique</div></div>
          <div className="stat"><div className="lbl">Révélation</div><div className="val">{daysUntil(ev.revealAt)}</div><div className="note">avant ouverture</div></div>
        </div>
      )}

      {/* Carte QR sombre */}
      <div className="card-dark" style={{ marginTop: 16 }}>
        <div className="eyebrow-mute" style={{ color: 'rgba(255,255,255,.5)', marginBottom: 14 }}>Inviter · scannez pour entrer</div>
        <div className="qr-tile">
          {qrUrl ? <img src={qrUrl} alt="QR code de l'événement" /> : <div style={{ width: 220, height: 220 }} />}
        </div>
        <div className="urlbox" style={{ margin: '14px 0 12px' }}>{joinUrl}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-accent" style={{ flex: 1 }} onClick={copyLink}>{copied ? '✓ Copié' : 'Copier le lien'}</button>
          <button className="btn" style={{ flex: '0 0 auto', width: 54, background: 'rgba(255,255,255,.08)', color: '#fff', padding: 14 }} onClick={share} aria-label="Partager">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      {ev.isOwner ? (
        <>
          <Link href={`/g/${id}`} className="btn btn-ghost" style={{ marginTop: 16 }}>
            {ev.revealed ? 'Voir la galerie →' : 'Aperçu des photos (avant révélation) →'}
          </Link>

          {/* Date de révélation : modifiable */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="eyebrow-mute" style={{ marginBottom: 4 }}>🗓️ Date de révélation</div>
            {!editingDate ? (
              <>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
                  {formatDate(ev.revealAt)}
                </div>
                <p className="muted small" style={{ marginBottom: 12 }}>
                  Le moment où les photos s'ouvrent d'un coup pour tous les invités.
                </p>
                <button className="btn btn-ghost" onClick={startEditDate}>Modifier la date</button>
              </>
            ) : (
              <form onSubmit={saveDate} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />
                {dateMsg && <div className="err">{dateMsg}</div>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setEditingDate(false)} disabled={savingDate}>Annuler</button>
                  <button type="submit" className="btn btn-accent" style={{ flex: 1 }} disabled={savingDate}>{savingDate ? 'Enregistrement…' : 'Enregistrer'}</button>
                </div>
              </form>
            )}
          </div>

          {/* Partage de l'album aux invités + code d'accès facultatif */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="eyebrow-mute" style={{ marginBottom: 4 }}>🔗 Partager l'album aux invités</div>
            <p className="muted small" style={{ marginBottom: 12 }}>
              Envoyez ce lien à vos invités pour qu'ils voient et téléchargent toutes les photos (à la révélation).
            </p>
            <button className="btn btn-accent" onClick={shareGallery}>
              {galleryCopied ? '✓ Copié' : "Partager le lien de l'album"}
            </button>

            <div style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 14 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>🔒 Protéger par un code (facultatif)</div>
              {ev.galleryCode ? (
                <>
                  <p className="muted small" style={{ marginBottom: 10 }}>
                    L'album est protégé. Les invités doivent entrer ce code : <strong style={{ color: 'var(--ink)' }}>{ev.galleryCode}</strong>
                  </p>
                  <button className="btn btn-ghost" onClick={() => saveGalleryCode('')} disabled={savingGallery}>
                    {savingGallery ? '…' : 'Retirer le code'}
                  </button>
                </>
              ) : (
                <>
                  <p className="muted small" style={{ marginBottom: 10 }}>
                    Ajoutez un code pour que seules les personnes qui l'ont puissent ouvrir l'album.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input type="text" placeholder="Choisir un code (ex : 1234)" value={galleryCodeInput}
                      onChange={(e) => setGalleryCodeInput(e.target.value)}
                      style={{ width: '100%', textAlign: 'center', fontSize: 17, letterSpacing: '.08em' }} />
                    <button className="btn btn-dark" style={{ width: '100%' }} onClick={() => saveGalleryCode(galleryCodeInput)} disabled={savingGallery || !galleryCodeInput.trim()}>
                      {savingGallery ? 'Activation…' : 'Activer le code'}
                    </button>
                  </div>
                </>
              )}
              {galleryMsg && <div className="err" style={{ marginTop: 8 }}>{galleryMsg}</div>}
            </div>
          </div>

          {Array.isArray(ev.contacts) && ev.contacts.length > 0 && (
            <div className="card" style={{ marginTop: 16 }}>
              <button
                onClick={() => setShowContacts((v) => !v)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', color: 'var(--ink)' }}
              >
                <div>
                  <div className="eyebrow-mute" style={{ marginBottom: 4 }}>Numéros collectés</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 }}>
                    {ev.contacts.length} invité{ev.contacts.length > 1 ? 's ont' : ' a'} laissé son numéro
                  </div>
                </div>
                <span style={{ fontSize: 20, color: 'var(--text3)', transform: showContacts ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>⌄</span>
              </button>

              {showContacts && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                    {ev.contacts.map((c, i) => (
                      <a key={i} href={`tel:${c.phone}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 12, background: 'var(--screen)', textDecoration: 'none', color: 'var(--ink)' }}>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                        <span className="mono" style={{ color: 'var(--text2)' }}>{c.phone}</span>
                      </a>
                    ))}
                  </div>
                  <div className="hint" style={{ marginTop: 10 }}>Pour partager le lien de l'album final avec eux.</div>
                </>
              )}
            </div>
          )}
          {/* Accès organisateur : à sauvegarder pour retrouver son tableau de bord depuis n'importe où */}
          <div className="card" style={{ marginTop: 16, borderColor: 'rgba(238,122,69,.35)', background: 'linear-gradient(180deg, rgba(247,194,107,.10), transparent)' }}>
            <div className="eyebrow-mute" style={{ marginBottom: 4 }}>🔐 Votre accès organisateur</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
              Enregistrez ce lien pour le retrouver
            </div>
            <p className="muted small" style={{ marginBottom: 14 }}>
              C'est <strong>votre</strong> tableau de bord privé : vous y reviendrez après la fête pour voir et
              télécharger toutes les photos. Gardez-le pour vous — <strong>ne le donnez pas à vos invités</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-accent" onClick={saveAccess}>
                {typeof navigator !== 'undefined' && navigator.share ? '💾 Enregistrer mon lien (Notes, mail, WhatsApp…)' : '💾 Enregistrer / copier mon lien'}
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={copyOwnerLink}>{ownerCopied ? '✓ Copié' : 'Copier le lien'}</button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={addToCalendar}>🗓️ Ajouter au calendrier</button>
              </div>
            </div>
            <div className="hint" style={{ marginTop: 10 }}>
              Astuce : « Ajouter au calendrier » place un rappel le jour de la révélation, avec ce lien dedans.
            </div>
          </div>
          {/* Admins de l'événement : co-organisateurs qui se connectent avec mail + code */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="eyebrow-mute" style={{ marginBottom: 4 }}>👥 Admins de l'événement</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
              Donnez les mêmes pouvoirs à vos proches
            </div>
            <p className="muted small" style={{ marginBottom: 14 }}>
              Ajoutez un admin avec un mail et un code que vous choisissez. Transmettez-lui vous-même ses
              identifiants — il pourra ouvrir ce tableau de bord depuis n'importe quel téléphone.
            </p>

            {Array.isArray(ev.admins) && ev.admins.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {ev.admins.map((a) => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--screen)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>{a.name || a.email}</div>
                      <div className="mono small" style={{ color: 'var(--text2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.email} · code <strong style={{ color: 'var(--ink)' }}>{a.code}</strong>
                      </div>
                    </div>
                    <button onClick={() => removeAdmin(a.id)} className="mono small" style={{ background: 'none', border: 'none', color: '#b23b2e', cursor: 'pointer', textDecoration: 'underline', flex: '0 0 auto' }}>
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={addAdmin} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="text" placeholder="Nom (facultatif)" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
              <input type="email" placeholder="Adresse mail" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              <input type="text" placeholder="Code d'accès (ex : 4821)" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} required />
              {adminMsg && <div className="err">{adminMsg}</div>}
              <button className="btn btn-dark" type="submit" disabled={addingAdmin}>{addingAdmin ? 'Ajout…' : '+ Ajouter cet admin'}</button>
            </form>
          </div>

          <InstallPrompt label="Épinglez votre tableau de bord" />

          {/* Zone de suppression */}
          <div style={{ marginTop: 30, borderTop: '1px solid var(--line)', paddingTop: 20 }}>
            {error && <div className="err" style={{ marginBottom: 12 }}>{error}</div>}
            {!confirmDel ? (
              <button
                onClick={() => { setError(''); setConfirmDel(true) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b23b2e', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.04em', padding: 0, textDecoration: 'underline' }}
              >
                Supprimer cet événement
              </button>
            ) : (
              <div className="card" style={{ borderColor: 'rgba(178,59,46,.35)' }}>
                <h3 className="h3" style={{ marginBottom: 8 }}>Supprimer « {ev.name} » ?</h3>
                <p className="muted small" style={{ marginBottom: 16 }}>
                  Toutes les photos de l'événement et le lien d'invitation seront <strong>définitivement effacés</strong>. Cette action est irréversible.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDel(false)} disabled={deleting}>Annuler</button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={deleteEvent} disabled={deleting}>
                    {deleting ? 'Suppression…' : 'Supprimer définitivement'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Connexion admin : un proche à qui l'organisateur a donné un mail + code */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="eyebrow-mute" style={{ marginBottom: 4 }}>🔑 Vous êtes admin ?</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, marginBottom: 6 }}>
              Connectez-vous au tableau de bord
            </div>
            <p className="muted small" style={{ marginBottom: 14 }}>
              L'organisateur vous a donné une adresse mail et un code ? Entrez-les pour accéder à la gestion de l'événement.
            </p>
            <form onSubmit={adminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="email" placeholder="Adresse mail" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
              <input type="text" placeholder="Code d'accès" value={loginCode} onChange={(e) => setLoginCode(e.target.value)} required />
              {loginMsg && <div className="err">{loginMsg}</div>}
              <button className="btn btn-accent" type="submit" disabled={loggingIn}>{loggingIn ? 'Connexion…' : 'Se connecter'}</button>
            </form>
          </div>

          <div className="notice" style={{ marginTop: 16 }}>
            📷 Vous voulez juste prendre des photos ? <a href={`/j/${id}`} style={{ color: 'var(--accent-deep)', fontWeight: 700 }}>Rejoignez l'événement ici</a>.
          </div>
        </>
      )}
    </main>
  )
}
