'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '../../../components/Logo'
import { TIERS } from '../../../lib/pricing'

// ============================================================
//  Codes promo : accès offerts et affiliation.
//
//  Deux usages dans un seul écran :
//   - « offert » pour les proches ;
//   - remise + commission pour un partenaire (influenceur, UGC), avec le
//     lien pré-rempli à lui transmettre et ce qu'il a rapporté.
// ============================================================

const KEY_STORE = 'declic_admin_key'

// formatPrice() écrit « Gratuit » à zéro : parfait pour une formule, absurde
// pour un chiffre d'affaires. Ici, zéro euro reste zéro euro.
function euros(cents) {
  return ((cents || 0) / 100).toFixed(2).replace('.', ',') + ' €'
}

function fmtDate(iso) {
  if (!iso) return ''
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
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState('')
  const [aSupprimer, setASupprimer] = useState(null) // code en attente de confirmation
  const [suppError, setSuppError] = useState('')

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

  // Fermer la pop-up avec Échap : on y entre par erreur, on doit pouvoir en sortir.
  useEffect(() => {
    if (!openForm && !aSupprimer) return
    const onKey = (e) => { if (e.key === 'Escape') { setOpenForm(false); setASupprimer(null) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openForm, aSupprimer])

  async function creer(e) {
    e.preventDefault()
    setFormError(''); setSaving(true)
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
    } catch (err) { setFormError(err.message) } finally { setSaving(false) }
  }

  async function basculer(c) {
    await fetch(`/api/admin/promos/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ active: !c.active }),
    })
    load(key)
  }

  // Suppression en deux temps : la boîte grise du navigateur se cliquait sans
  // la lire. La confirmation redit ici ce qui va disparaître.
  async function supprimer() {
    if (!aSupprimer) return
    setSuppError(''); setSaving(true)
    try {
      const res = await fetch(`/api/admin/promos/${aSupprimer.id}`, { method: 'DELETE', headers: { 'x-admin-key': key } })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Suppression impossible.')
      setASupprimer(null)
      load(key)
    } catch (err) { setSuppError(err.message) } finally { setSaving(false) }
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
  const partenaires = codes.filter((c) => c.partnerName).length

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
          <button className="btn btn-accent" style={{ marginLeft: 'auto', width: 'auto', padding: '11px 20px' }}
            onClick={() => { setForm(VIDE); setFormError(''); setOpenForm(true) }}>
            + Créer un code
          </button>
        </div>

        <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
          <div className="stat">
            <div className="lbl">Codes</div>
            <div className="val">{codes.length}</div>
            <div className="note">{codes.filter((c) => c.active).length} actifs · {partenaires} partenaire{partenaires > 1 ? 's' : ''}</div>
          </div>
          <div className="stat">
            <div className="lbl">Utilisations</div>
            <div className="val">{totals.uses}</div>
            <div className="note">événements créés avec un code</div>
          </div>
          <div className="stat">
            <div className="lbl">CA généré</div>
            <div className="val" style={{ color: 'var(--accent)' }}>{euros(totals.revenueCents)}</div>
            <div className="note">encaissé, remise déduite</div>
          </div>
          <div className="stat">
            <div className="lbl">Commissions dues</div>
            <div className="val">{euros(totals.commissionCents)}</div>
            <div className="note">à reverser aux partenaires</div>
          </div>
        </div>

        {/* ---- Tableau ---- */}
        <div style={{ marginTop: 24 }}>
          {codes.length === 0 ? (
            <div className="notice">
              Aucun code pour l'instant. Crée-en un pour offrir un événement à un proche,
              ou pour lancer un partenariat.
            </div>
          ) : (
            <div className="evtable">
              <div className="evrow pcrow evhead">
                <span>Code</span>
                <span>Avantage</span>
                <span>Partenaire</span>
                <span>Utilisations</span>
                <span>Encaissé · commission</span>
                <span style={{ textAlign: 'right' }}>Actions</span>
              </div>

              {codes.map((c) => (
                <div className={`evrow pcrow ${c.active ? '' : 'off'}`} key={c.id}>
                  <span className="pc-code">
                    <strong>{c.code}</strong>
                    <span className="pc-tags">
                      {c.marksTest && <span className="badge badge-wait">test</span>}
                      {!c.active && <span className="badge badge-wait">désactivé</span>}
                      {c.expiresAt && <span className="pc-sub">exp. {fmtDate(c.expiresAt)}</span>}
                    </span>
                  </span>

                  <span data-label="Avantage">
                    <span className="pc-strong">{c.label}</span>
                    <span className="pc-sub">
                      {c.maxGuestsAllowed ? `≤ ${c.maxGuestsAllowed} participants` : 'toutes formules'}
                    </span>
                  </span>

                  <span data-label="Partenaire">
                    {c.partnerName
                      ? <>
                          {c.partnerName}
                          <span className="pc-sub">commission {c.commissionPct} %</span>
                        </>
                      : <span className="pc-sub">code perso</span>}
                  </span>

                  <span data-label="Utilisations">
                    <span className="pc-strong">{c.uses}{c.maxUses ? ` / ${c.maxUses}` : ''}</span>
                    <span className="pc-sub">{c.visits > 0 ? `${c.visits} visite${c.visits > 1 ? 's' : ''}` : 'aucune visite'}</span>
                  </span>

                  <span data-label="Encaissé · commission">
                    <span className="pc-strong">{euros(c.revenueCents)}</span>
                    <span className="pc-sub">
                      {c.commissionPct > 0 ? `dont ${euros(c.commissionCents)} à reverser` : 'aucune commission'}
                    </span>
                  </span>

                  <span className="pc-actions">
                    <button className="pc-mini" type="button" onClick={() => copierLien(c)}>
                      {copied === c.code ? '✓ copié' : 'Copier le lien'}
                    </button>
                    <button className="pc-mini" type="button" onClick={() => basculer(c)}>
                      {c.active ? 'Désactiver' : 'Réactiver'}
                    </button>
                    {c.uses === 0 && (
                      <button className="pc-mini danger" type="button"
                        onClick={() => { setSuppError(''); setASupprimer(c) }}>Supprimer</button>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {codes.some((c) => c.note) && (
          <div style={{ marginTop: 18 }}>
            {codes.filter((c) => c.note).map((c) => (
              <p key={c.id} className="muted small" style={{ marginTop: 4 }}>
                <strong>{c.code}</strong> : {c.note}
              </p>
            ))}
          </div>
        )}

        <p className="muted small" style={{ marginTop: 26, lineHeight: 1.7 }}>
          Le lien à partager (<code>timetoflash.fr/?promo=CODE</code>) remplit le code tout seul au
          moment de payer : le partenaire n'a rien à faire recopier à son audience, et les visites
          sont comptées même sans vente.
        </p>
      </div>

      {/* ---- Confirmation de suppression ---- */}
      {aSupprimer && (
        <div className="db-overlay" onClick={(e) => { if (e.target === e.currentTarget) setASupprimer(null) }}>
          <div className="db-sheet" style={{ maxWidth: 420 }}>
            <div className="db-sheet-grip" />
            <h3 className="h3">Supprimer ce code ?</h3>
            <p className="muted small" style={{ lineHeight: 1.65 }}>
              Le code <strong style={{ fontFamily: 'var(--f-mono)' }}>{aSupprimer.code}</strong>
              {aSupprimer.partnerName ? ` (${aSupprimer.partnerName})` : ''} disparaîtra
              définitivement. Personne ne pourra plus l'utiliser, et le lien déjà partagé ne
              fonctionnera plus.
            </p>
            <p className="muted small" style={{ marginTop: 10, lineHeight: 1.65 }}>
              Si tu veux seulement l'empêcher de servir tout en gardant sa trace,
              <strong> désactive-le</strong> plutôt.
            </p>

            {suppError && <div className="err" style={{ marginTop: 14 }}>{suppError}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-ghost" type="button" onClick={() => setASupprimer(null)}>Annuler</button>
              <button className="btn btn-danger" type="button" onClick={supprimer} disabled={saving}>
                {saving ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Pop-up de création ---- */}
      {openForm && (
        <div className="db-overlay" onClick={(e) => { if (e.target === e.currentTarget) setOpenForm(false) }}>
          <form className="db-sheet" style={{ maxWidth: 520 }} onSubmit={creer}>
            <div className="db-sheet-grip" />
            <h3 className="h3">Nouveau code promo</h3>
            <p className="muted small" style={{ marginBottom: 4 }}>
              Un code « offert » pour un proche, ou une remise confiée à un partenaire.
            </p>

            {/* ---- 1. Le code et son avantage ---- */}
            <div className="pc-formblock">
              <span className="lbl">L'avantage pour celui qui l'utilise</span>

              <div className="field" style={{ marginTop: 10 }}>
                <label>Code à saisir</label>
                <input type="text" value={form.code} placeholder="DIANE2026" maxLength={40}
                  autoCapitalize="characters" autoComplete="off" required
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  style={{ textTransform: 'uppercase', fontFamily: 'var(--f-mono)', letterSpacing: '.05em' }} />
                {form.kind === 'free' && (
                  <p className="pc-hint">
                    6 caractères minimum : un code qui offre le service se devine à l'essai,
                    et c'est la formule la plus chère qui part avec.
                  </p>
                )}
              </div>

              <div className="pc-two" style={{ marginTop: 14 }}>
                <div className="field">
                  <label>Avantage</label>
                  <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value, value: '' })}>
                    <option value="free">Événement offert</option>
                    <option value="percent">Réduction en %</option>
                    <option value="amount">Réduction en €</option>
                  </select>
                </div>
                {form.kind !== 'free' ? (
                  <div className="field">
                    <label>{form.kind === 'percent' ? 'Remise (%)' : 'Remise (€)'}</label>
                    <input type="number" inputMode="decimal" min="1" required
                      step={form.kind === 'percent' ? '1' : '0.5'}
                      value={form.value} placeholder={form.kind === 'percent' ? '20' : '5'}
                      onChange={(e) => setForm({ ...form, value: e.target.value })} />
                  </div>
                ) : (
                  <div className="field">
                    <label>Formule maximale</label>
                    <select value={form.maxGuestsAllowed}
                      onChange={(e) => setForm({ ...form, maxGuestsAllowed: e.target.value })}>
                      <option value="">Toutes les formules</option>
                      {TIERS.filter((t) => t.priceCents > 0).map((t) => (
                        <option key={t.maxGuests} value={t.maxGuests}>Jusqu'à {t.maxGuests} participants</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {form.kind !== 'free' && (
                <div className="field" style={{ marginTop: 14 }}>
                  <label>Formule maximale couverte</label>
                  <select value={form.maxGuestsAllowed}
                    onChange={(e) => setForm({ ...form, maxGuestsAllowed: e.target.value })}>
                    <option value="">Toutes les formules</option>
                    {TIERS.filter((t) => t.priceCents > 0).map((t) => (
                      <option key={t.maxGuests} value={t.maxGuests}>Jusqu'à {t.maxGuests} participants</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* ---- 2. Le partenariat ---- */}
            <div className="pc-formblock">
              <span className="lbl">Partenariat (facultatif)</span>
              <p className="pc-hint" style={{ marginTop: 0, marginBottom: 10 }}>
                À remplir seulement si tu confies ce code à quelqu'un (influenceur, UGC) que tu
                rémunères. La commission, c'est <strong>toi qui la décides ici</strong> : c'est le
                pourcentage que tu lui reverses sur chaque vente amenée par son code.
              </p>
              <div className="pc-two">
                <div className="field">
                  <label>Nom du partenaire</label>
                  <input type="text" value={form.partnerName} placeholder="Léa (Instagram)" maxLength={80}
                    onChange={(e) => setForm({ ...form, partnerName: e.target.value })} />
                </div>
                <div className="field">
                  <label>Sa commission (%)</label>
                  <input type="number" min="0" max="100" value={form.commissionPct} placeholder="20"
                    disabled={!form.partnerName.trim()}
                    onChange={(e) => setForm({ ...form, commissionPct: e.target.value })} />
                </div>
              </div>
              {form.kind === 'free' && form.partnerName.trim() ? (
                <div className="notice" style={{ marginTop: 12, fontSize: 12.5 }}>
                  ⚠️ Un code « offert » n'encaisse rien : la commission restera à zéro quoi qu'il
                  arrive. Pour rémunérer ce partenaire, choisis plutôt une remise en % ou en €.
                </div>
              ) : (
                <p className="pc-hint">
                  Calculée sur ce que tu encaisses réellement, remise déduite. Aucun virement
                  automatique : c'est un compteur qui te dit ce que tu lui dois.
                </p>
              )}
            </div>

            {/* ---- 3. Les limites ---- */}
            <div className="pc-formblock">
              <span className="lbl">Limites (facultatif)</span>
              <div className="pc-two" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>Utilisations max.</label>
                  <input type="number" min="1" value={form.maxUses} placeholder="illimité"
                    onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
                </div>
                <div className="field">
                  <label>Expire le</label>
                  <input type="date" value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
              </div>

              <label className="wiz-check" style={{ marginTop: 14 }}>
                <input type="checkbox" checked={form.marksTest}
                  onChange={(e) => setForm({ ...form, marksTest: e.target.checked })} />
                <span>
                  <strong>Code de test.</strong> Les événements créés avec ce code portent un badge
                  « TEST » et sortent des statistiques.
                </span>
              </label>

              <div className="field" style={{ marginTop: 14 }}>
                <label>Note interne</label>
                <input type="text" value={form.note} maxLength={200} placeholder="Story du 12 août"
                  onChange={(e) => setForm({ ...form, note: e.target.value })} />
              </div>
            </div>

            {formError && <div className="err" style={{ marginTop: 14 }}>{formError}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button className="btn btn-ghost" type="button" onClick={() => setOpenForm(false)}>Annuler</button>
              <button className="btn btn-dark" type="submit" disabled={saving}>
                {saving ? 'Création…' : 'Créer le code'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
