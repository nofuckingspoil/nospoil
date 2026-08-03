'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import { formatPrice, TIERS } from '../../../lib/pricing'

// ============================================================
//  Codes promo : accès offerts et affiliation.
//
//  Deux usages dans un seul écran :
//   - « offert » pour les proches ;
//   - remise + commission pour un partenaire (influenceur, UGC), avec le
//     lien pré-rempli à lui transmettre et ce qu'il a rapporté.
// ============================================================

const KEY_STORE = 'declic_admin_key'

function fmtDate(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' }) }
  catch { return iso }
}

const VIDE = {
  code: '', kind: 'free', value: '', partnerName: '', commissionPct: '',
  maxUses: '', maxGuestsAllowed: '', expiresAt: '', note: '', marksTest: false,
}

export default function AdminCodes() {
  const [key, setKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState(VIDE)
  const [openForm, setOpenForm] = useState(false)
  const [formError, setFormError] = useState('')
  const [copied, setCopied] = useState('')

  async function load(k) {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/promos', { headers: { 'x-admin-key': k } })
      if (res.status === 401) { setError('Mot de passe incorrect.'); setAuthed(false); sessionStorage.removeItem(KEY_STORE); return }
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      setData(d); setAuthed(true); setKey(k)
      sessionStorage.setItem(KEY_STORE, k)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  useEffect(() => {
    const k = sessionStorage.getItem(KEY_STORE)
    if (k) load(k)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function creer(e) {
    e.preventDefault()
    setFormError('')
    const payload = {
      ...form,
      // Une remise en euros se saisit en euros et se stocke en centimes.
      value: form.kind === 'amount' ? Math.round(parseFloat(form.value || '0') * 100) : parseInt(form.value || '0', 10),
    }
    try {
      const res = await fetch('/api/admin/promos', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Erreur.')
      setForm(VIDE); setOpenForm(false)
      load(key)
    } catch (err) { setFormError(err.message) }
  }

  async function basculer(c) {
    await fetch(`/api/admin/promos/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ active: !c.active }),
    })
    load(key)
  }

  async function supprimer(c) {
    if (!confirm(`Supprimer définitivement le code ${c.code} ?`)) return
    const res = await fetch(`/api/admin/promos/${c.id}`, { method: 'DELETE', headers: { 'x-admin-key': key } })
    const d = await res.json().catch(() => ({}))
    if (!res.ok) { alert(d.error || 'Suppression impossible.'); return }
    load(key)
  }

  function copierLien(c) {
    const lien = `${window.location.origin}/?promo=${c.code}`
    try { navigator.clipboard.writeText(lien) } catch {}
    setCopied(c.code)
    setTimeout(() => setCopied(''), 1800)
  }

  // ---- Connexion ----
  if (!authed) return (
    <main className="screen screen-cream center">
      <div className="spacer" />
      <Logo />
      <div className="card" style={{ marginTop: 24, width: '100%' }}>
        <h2 className="h3" style={{ marginBottom: 6 }}>Codes promo</h2>
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

  const codes = data?.codes || []
  const totals = data?.totals || { uses: 0, revenueCents: 0, commissionCents: 0 }

  return (
    <div className="site">
      <nav className="vnav">
        <Logo nameSize={22} size={36} />
        <span className="badge badge-wait"><span className="dot" />ADMIN</span>
      </nav>

      <div className="site-inner" style={{ paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0 18px', flexWrap: 'wrap' }}>
          <h1 className="h2" style={{ margin: 0 }}>Codes promo</h1>
          <Link href="/admin" className="linklike" style={{ fontSize: 14 }}>← retour aux événements</Link>
        </div>

        <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
          <div className="stat">
            <div className="lbl">Codes</div>
            <div className="val">{codes.length}</div>
            <div className="note">{codes.filter((c) => c.active).length} actifs</div>
          </div>
          <div className="stat">
            <div className="lbl">Utilisations</div>
            <div className="val">{totals.uses}</div>
            <div className="note">événements créés avec un code</div>
          </div>
          <div className="stat">
            <div className="lbl">CA généré</div>
            <div className="val" style={{ color: 'var(--accent)' }}>{formatPrice(totals.revenueCents)}</div>
            <div className="note">encaissé, remise déduite</div>
          </div>
          <div className="stat">
            <div className="lbl">Commissions dues</div>
            <div className="val">{formatPrice(totals.commissionCents)}</div>
            <div className="note">à reverser aux partenaires</div>
          </div>
        </div>

        <button className="btn btn-accent" style={{ marginTop: 22 }} onClick={() => setOpenForm((v) => !v)}>
          {openForm ? 'Annuler' : '+ Créer un code'}
        </button>

        {openForm && (
          <form className="card" style={{ marginTop: 16 }} onSubmit={creer}>
            <div className="field">
              <label>Code</label>
              <input value={form.code} placeholder="DIANE" maxLength={40} autoCapitalize="characters"
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                style={{ textTransform: 'uppercase' }} required />
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>Avantage</label>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value, value: '' })}>
                <option value="free">Événement offert</option>
                <option value="percent">Réduction en %</option>
                <option value="amount">Réduction en €</option>
              </select>
            </div>

            {form.kind !== 'free' && (
              <div className="field" style={{ marginTop: 14 }}>
                <label>{form.kind === 'percent' ? 'Pourcentage de remise' : 'Montant de la remise (€)'}</label>
                <input type="number" inputMode="decimal" min="1" step={form.kind === 'percent' ? '1' : '0.5'}
                  value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.kind === 'percent' ? '20' : '5'} required />
              </div>
            )}

            <div className="field" style={{ marginTop: 14 }}>
              <label>Partenaire <span className="muted">(vide = code perso)</span></label>
              <input value={form.partnerName} placeholder="Léa — Instagram" maxLength={80}
                onChange={(e) => setForm({ ...form, partnerName: e.target.value })} />
            </div>

            {form.partnerName.trim() && (
              <div className="field" style={{ marginTop: 14 }}>
                <label>Commission du partenaire (%)</label>
                <input type="number" min="0" max="100" value={form.commissionPct}
                  onChange={(e) => setForm({ ...form, commissionPct: e.target.value })} placeholder="20" />
                <p className="muted small" style={{ marginTop: 6 }}>
                  Calculée sur ce qui est réellement encaissé. Aucun virement automatique : c'est un
                  simple compteur pour savoir ce que tu lui dois.
                </p>
              </div>
            )}

            <div className="field" style={{ marginTop: 14 }}>
              <label>Nombre d'utilisations <span className="muted">(vide = illimité)</span></label>
              <input type="number" min="1" value={form.maxUses} placeholder="1"
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>Formule maximale couverte <span className="muted">(vide = toutes)</span></label>
              <select value={form.maxGuestsAllowed} onChange={(e) => setForm({ ...form, maxGuestsAllowed: e.target.value })}>
                <option value="">Toutes les formules</option>
                {TIERS.filter((t) => t.priceCents > 0).map((t) => (
                  <option key={t.maxGuests} value={t.maxGuests}>
                    Jusqu'à {t.maxGuests} invités ({formatPrice(t.priceCents)})
                  </option>
                ))}
              </select>
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>Expire le <span className="muted">(facultatif)</span></label>
              <input type="date" value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>

            <div className="wiz-legal" style={{ marginTop: 16 }}>
              <label className="wiz-check">
                <input type="checkbox" checked={form.marksTest}
                  onChange={(e) => setForm({ ...form, marksTest: e.target.checked })} />
                <span>
                  <strong>Code de test.</strong> Les événements créés avec ce code sont marqués
                  « TEST » et exclus des statistiques (chiffre d'affaires, moyennes, totaux).
                </span>
              </label>
            </div>

            <div className="field" style={{ marginTop: 14 }}>
              <label>Note interne <span className="muted">(facultatif)</span></label>
              <input value={form.note} maxLength={200} placeholder="Story du 12 août"
                onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>

            {formError && <div className="err" style={{ marginTop: 14 }}>{formError}</div>}
            <button className="btn btn-dark" type="submit" style={{ marginTop: 18 }}>Créer le code</button>
          </form>
        )}

        {/* ---- Liste ---- */}
        <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {codes.length === 0 && (
            <p className="muted">Aucun code pour l'instant. Crée-en un pour offrir un événement ou lancer un partenariat.</p>
          )}

          {codes.map((c) => (
            <div key={c.id} className="card" style={{ opacity: c.active ? 1 : 0.55 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 18, letterSpacing: 1 }}>{c.code}</strong>
                <span className="badge">{c.label}</span>
                {c.marksTest && <span className="badge badge-wait">test</span>}
                {!c.active && <span className="badge badge-wait">désactivé</span>}
                {c.partnerName && <span className="muted small">· {c.partnerName}</span>}
              </div>

              <div className="muted small" style={{ marginTop: 8, lineHeight: 1.7 }}>
                Utilisé <strong>{c.uses}</strong>{c.maxUses ? ` / ${c.maxUses}` : ''} fois
                {c.visits > 0 && <> · {c.visits} visite{c.visits > 1 ? 's' : ''} par le lien</>}
                {c.revenueCents > 0 && <> · {formatPrice(c.revenueCents)} encaissés</>}
                {c.commissionPct > 0 && <> · commission {c.commissionPct} % = <strong>{formatPrice(c.commissionCents)}</strong></>}
                <br />
                {c.maxGuestsAllowed ? `Jusqu'à ${c.maxGuestsAllowed} invités` : 'Toutes les formules'}
                {c.expiresAt && <> · expire le {fmtDate(c.expiresAt)}</>}
                {c.note && <> · {c.note}</>}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <button className="btn" type="button" onClick={() => copierLien(c)}>
                  {copied === c.code ? '✓ Lien copié' : 'Copier le lien à partager'}
                </button>
                <button className="btn" type="button" onClick={() => basculer(c)}>
                  {c.active ? 'Désactiver' : 'Réactiver'}
                </button>
                {c.uses === 0 && (
                  <button className="btn" type="button" onClick={() => supprimer(c)}
                    style={{ opacity: .6 }}>Supprimer</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="muted small" style={{ marginTop: 26, lineHeight: 1.7 }}>
          Le lien à partager (<code>timetoflash.fr/?promo=CODE</code>) remplit le code tout seul au
          moment de payer : le partenaire n'a rien à faire recopier à son audience, et les visites
          sont comptées même sans vente.
        </p>
      </div>
    </div>
  )
}
