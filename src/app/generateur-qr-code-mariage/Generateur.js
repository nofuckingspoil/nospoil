'use client'

// ============================================================
//  Générateur d'affiche « scannez pour partager vos photos ».
//
//  Écran en deux colonnes : les réglages à gauche, l'affiche à droite qui se
//  redessine à chaque clic. Tout se passe dans le navigateur : aucune donnée
//  ne part sur un serveur.
//
//  Le dessin vit dans lib/poster-art.js (l'affiche) et lib/qr-art.js (le code).
// ============================================================

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  STYLES, DOT_SHAPES, EYE_SHAPES, CENTERS, FONTS, DEFAULTS,
  pickStyle, buildPlan, toSVG, drawOn, normalizeUrl, fileName,
} from '../../lib/qr-art'
import {
  FORMATS, MODELES, POSTER_DEFAULTS, buildPoster, buildSheet, diagnosePoster,
} from '../../lib/poster-art'

// Le champ hexadécimal existe parce qu'un mariage a souvent une charte
// précise : « notre vert, c'est le #3F5236 », pas « à peu près ce vert-là ».
function ColorField({ label, value, onChange }) {
  return (
    <div className="qg-color">
      <span className="qg-color-lbl">{label}</span>
      <label className="qg-color-swatch" style={{ background: value }}>
        <input type="color" value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={label} />
      </label>
      <input
        type="text" className="qg-hex" value={value} spellCheck="false"
        onChange={(e) => {
          let v = e.target.value.trim().toUpperCase()
          if (v && !v.startsWith('#')) v = `#${v}`
          onChange(v.slice(0, 7))
        }}
      />
    </div>
  )
}

function Choice({ items, value, onChange, name }) {
  return (
    <div className="qg-choice" role="radiogroup" aria-label={name}>
      {items.map((it) => (
        <button key={it.key} type="button" role="radio" aria-checked={value === it.key}
          className={`qg-chip ${value === it.key ? 'on' : ''}`}
          onClick={() => onChange(it.key)}>
          {it.label}
        </button>
      ))}
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="qg-field">
      <span>{label}</span>
      <input type="text" spellCheck="false" {...props} />
    </label>
  )
}

export default function Generateur() {
  const [o, setO] = useState({ ...DEFAULTS, ...POSTER_DEFAULTS })
  const [zoom, setZoom] = useState(false)
  const [busy, setBusy] = useState('')
  // Les mesures de texte demandent un vrai navigateur : on ne compose
  // l'affiche qu'une fois la page vivante.
  const [pret, setPret] = useState(false)
  const canvasRef = useRef(null)

  const set = (patch) => setO((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    // Adresse pré-remplie par un lien (?url=…) : on arrive avec son album
    // déjà branché, depuis un mail ou un article.
    const p = new URLSearchParams(window.location.search).get('url')
    if (p) setO((prev) => ({ ...prev, url: p }))
    // Les polices doivent être chargées avant de mesurer les titres.
    const go = () => setPret(true)
    if (document.fonts?.ready) document.fonts.ready.then(go)
    else go()
  }, [])

  const target = normalizeUrl(o.url)
  const fmt = FORMATS.find((f) => f.key === o.format) || FORMATS[0]

  // L'affiche, puis la planche A4 qui en porte plusieurs exemplaires.
  const { plan, planche } = useMemo(() => {
    if (!pret) return { plan: null, planche: null }
    try {
      const p = fmt.bare
        ? buildPlan(target, o)
        : buildPoster({ ...o, target })
      return { plan: p, planche: fmt.bare ? p : buildSheet(p, fmt) }
    } catch {
      return { plan: null, planche: null }
    }
  }, [pret, target, o, fmt])

  const unit = fmt.bare ? '' : 'mm'
  const svg = useMemo(
    () => (plan ? toSVG(plan, { title: `Affiche mariage : ${o.titre || ''}`, unit }) : ''),
    [plan, o.titre, unit],
  )
  const svgPrint = useMemo(
    () => (planche ? toSVG(planche, { title: 'Planche à imprimer', unit }) : ''),
    [planche, unit],
  )
  const alerte = useMemo(() => diagnosePoster(o), [o])
  const ok = Boolean(target) && Boolean(plan)

  async function download(ext) {
    if (!ok) return
    setBusy(ext)
    try {
      if (document.fonts?.ready) await document.fonts.ready
      let href
      if (ext === 'png') {
        const canvas = canvasRef.current || document.createElement('canvas')
        // 2400 px de large : environ 290 dpi sur un A4, la finesse attendue
        // par un imprimeur.
        drawOn(canvas, plan, fmt.bare ? 2400 : Math.round(plan.w * 11.4))
        href = canvas.toDataURL('image/png')
      } else {
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
        href = URL.createObjectURL(blob)
      }
      const a = document.createElement('a')
      a.href = href
      a.download = fileName(o, ext)
      a.click()
      if (ext === 'svg') setTimeout(() => URL.revokeObjectURL(href), 4000)
    } finally {
      setBusy('')
    }
  }

  // L'impression passe par une page à part : le navigateur reçoit une planche
  // A4 seule, sans le reste du site à masquer au chausse-pied.
  function imprimer() {
    if (!ok) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8">`
      + `<title>${(o.titre || 'Affiche').replace(/[<>]/g, '')}</title>`
      + `<style>@page{size:A4 portrait;margin:0}`
      + `html,body{margin:0;padding:0;background:#fff}`
      + `svg{display:block;width:210mm;height:297mm}`
      + `@media screen{body{padding:16px;background:#eee}svg{box-shadow:0 8px 30px rgba(0,0,0,.2);margin:0 auto}}`
      + `</style></head><body>${svgPrint}<script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script></body></html>`)
    w.document.close()
  }

  return (
    <div className="qg">
      {/* ---------- Colonne réglages ---------- */}
      <div className="qg-panel">
        <section className="qg-block">
          <h2 className="qg-h">1 · Où mène le QR code ?</h2>
          <input
            type="text" inputMode="url" spellCheck="false"
            placeholder="lien de votre album photo, de votre site de mariage…"
            value={o.url} onChange={(e) => set({ url: e.target.value })}
            aria-label="Adresse vers laquelle mène le QR code"
          />
          <p className="qg-hint">
            Un album photo, votre site de mariage, une playlist, une cagnotte, un plan d’accès…
            Rien n’est enregistré : tout reste dans votre navigateur.
          </p>
        </section>

        <section className="qg-block">
          <h2 className="qg-h">2 · Le support</h2>
          <div className="qg-frames qg-formats">
            {FORMATS.map((f) => (
              <button key={f.key} type="button"
                className={`qg-frame ${o.format === f.key ? 'on' : ''}`}
                onClick={() => set({ format: f.key })}>
                <span className="tt">{f.label}</span>
                <span className="ss">{f.sub}</span>
              </button>
            ))}
          </div>
        </section>

        {!fmt.bare && (
          <section className="qg-block">
            <h2 className="qg-h">3 · La mise en page</h2>
            <div className="qg-frames">
              {MODELES.map((m) => (
                <button key={m.key} type="button"
                  className={`qg-frame ${o.modele === m.key ? 'on' : ''}`}
                  onClick={() => set({ modele: m.key })}>
                  <span className="tt">{m.label}</span>
                  <span className="ss">{m.sub}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {!fmt.bare && (
          <section className="qg-block">
            <h2 className="qg-h">4 · Vos textes</h2>
            <div className="qg-two">
              <Field label="Au-dessus" maxLength={28} value={o.surtitre}
                placeholder="Le mariage de" onChange={(e) => set({ surtitre: e.target.value })} />
              <Field label="La date" maxLength={30} value={o.date}
                placeholder="12 juin 2027" onChange={(e) => set({ date: e.target.value })} />
            </div>
            <Field label="Vos prénoms" maxLength={40} value={o.titre}
              placeholder="Léa & Tom" onChange={(e) => set({ titre: e.target.value })} />
            <Field label="La petite phrase" maxLength={70} value={o.accroche}
              placeholder="Ce soir, le photographe, c’est vous."
              onChange={(e) => set({ accroche: e.target.value })} />
            <Field label="La consigne, sous le code" maxLength={44} value={o.consigne}
              placeholder="Scannez pour partager vos photos"
              onChange={(e) => set({ consigne: e.target.value })} />
            <Field label="La ligne du bas" maxLength={44} value={o.pied}
              placeholder="Aucune application à installer"
              onChange={(e) => set({ pied: e.target.value })} />
            <p className="qg-hint">
              Laissez un champ vide pour le faire disparaître de l’affiche.
            </p>
          </section>
        )}

        <section className="qg-block">
          <h2 className="qg-h">{fmt.bare ? '3' : '5'} · Vos couleurs</h2>
          <div className="qg-styles">
            {STYLES.map((s) => (
              <button key={s.key} type="button"
                className={`qg-style ${o.style === s.key ? 'on' : ''}`}
                onClick={() => set(pickStyle(s.key))}>
                <span className="qg-style-dots">
                  {s.swatch.map((c, i) => <i key={i} style={{ background: c }} />)}
                </span>
                <span className="qg-style-name">{s.label}</span>
              </button>
            ))}
          </div>
          <div className="qg-mt">
            <ColorField label={fmt.bare ? 'Les pixels' : 'L’encre'} value={o.fg}
              onChange={(v) => set({ fg: v, style: '' })} />
            <ColorField label={fmt.bare ? 'Les trois coins' : 'La couleur d’accent'} value={o.eye}
              onChange={(v) => set({ eye: v, style: '' })} />
            <ColorField label={fmt.bare ? 'Le fond' : 'Le papier'} value={o.bg}
              onChange={(v) => set({ bg: v, style: '' })} />
          </div>
          {fmt.bare ? (
            <label className="qg-switch">
              <input type="checkbox" checked={o.transparent}
                onChange={(e) => set({ transparent: e.target.checked })} />
              <span>Fond transparent <em>(pour poser le code sur une photo)</em></span>
            </label>
          ) : (
            <label className="qg-switch">
              <input type="checkbox" checked={o.plaque}
                onChange={(e) => set({ plaque: e.target.checked })} />
              <span>Pastille claire derrière le code <em>(indispensable sur un fond foncé)</em></span>
            </label>
          )}
        </section>

        {!fmt.bare && (
          <section className="qg-block">
            <h2 className="qg-h">6 · Les polices</h2>
            <div className="qg-row">
              <span className="qg-lbl">Les prénoms</span>
              <Choice name="Police des prénoms" items={FONTS} value={o.titreFont}
                onChange={(v) => set({ titreFont: v })} />
            </div>
            <div className="qg-row">
              <span className="qg-lbl">Le reste</span>
              <Choice name="Police du texte" items={FONTS} value={o.texteFont}
                onChange={(v) => set({ texteFont: v })} />
            </div>
            <p className="qg-hint">
              Polices choisies parmi celles présentes sur tous les ordinateurs : ce que
              vous voyez est exactement ce qui sortira de l’imprimante.
            </p>
          </section>
        )}

        <section className="qg-block">
          <h2 className="qg-h">{fmt.bare ? '4' : '7'} · Le style du code</h2>
          <div className="qg-row">
            <span className="qg-lbl">Les pixels</span>
            <Choice name="Forme des pixels" items={DOT_SHAPES} value={o.dots}
              onChange={(v) => set({ dots: v, style: '' })} />
          </div>
          <div className="qg-row">
            <span className="qg-lbl">Les trois coins</span>
            <Choice name="Forme des coins" items={EYE_SHAPES} value={o.eyes}
              onChange={(v) => set({ eyes: v, style: '' })} />
          </div>
          <div className="qg-row">
            <span className="qg-lbl">Au centre</span>
            <Choice name="Motif central" items={CENTERS} value={o.center}
              onChange={(v) => set({ center: v })} />
          </div>
          {o.center === 'initials' && (
            <input
              type="text" className="qg-mt" maxLength={3} placeholder="L&T"
              value={o.initials} onChange={(e) => set({ initials: e.target.value })}
              aria-label="Vos initiales"
            />
          )}
        </section>
      </div>

      {/* ---------- Colonne aperçu ----------
          Deux blocs séparés : sur téléphone, seul le premier reste collé en
          haut pendant qu'on règle. Le second redescend sous les réglages :
          coller les boutons de téléchargement mangerait la moitié de l'écran. */}
      <div className="qg-side">
        <div className="qg-sticky">
          <div className="eyebrow-mute">
            Aperçu · {fmt.label}{fmt.per > 1 ? ` · ${fmt.per} par page A4` : ''}
          </div>

          <div className={`qg-stage ${o.transparent && fmt.bare ? 'alpha' : ''}`}>
            {svg
              ? <div className={`qg-svg ${fmt.bare ? 'carre' : ''}`} dangerouslySetInnerHTML={{ __html: svg }} />
              : <p className="muted">Composition…</p>}
          </div>

          {alerte && (
            <div className={`qg-alert ${alerte.level}`}>
              <strong>{alerte.level === 'bad' ? 'Illisible' : 'Attention'}</strong>
              <span>{alerte.text}</span>
            </div>
          )}
        </div>

        <div className="qg-tail">
          <button type="button" className="btn btn-ghost" onClick={() => setZoom(true)} disabled={!ok}>
            Tester le scan avec mon téléphone
          </button>

          <div className="qg-dl">
            {!fmt.screen && !fmt.bare && (
              <button type="button" className="btn btn-accent" disabled={!ok} onClick={imprimer}>
                Imprimer / enregistrer en PDF
              </button>
            )}
            <button type="button" className={`btn ${fmt.screen || fmt.bare ? 'btn-accent' : 'btn-dark'}`}
              disabled={!ok || busy === 'png'} onClick={() => download('png')}>
              {busy === 'png' ? 'Préparation…' : 'Télécharger en PNG'}
            </button>
            <button type="button" className="btn btn-ghost" disabled={!ok || busy === 'svg'}
              onClick={() => download('svg')}>
              Télécharger en SVG (imprimeur)
            </button>
          </div>

          {!ok
            ? <p className="qg-hint center">Indiquez d’abord l’adresse de destination, en haut.</p>
            : <p className="qg-hint center">
                {fmt.per > 1
                  ? `L’impression compose une page A4 avec ${fmt.per} exemplaires et les repères de découpe.`
                  : 'Dans la fenêtre d’impression, choisissez « Enregistrer en PDF » pour l’envoyer à un imprimeur.'}
              </p>}

          <div className="qg-cross">
            <strong>Pas encore d’album pour vos photos ?</strong>
            <p>
              Time to Flash transforme le téléphone de chaque invité en appareil jetable :
              un nombre de clichés limité, et toutes les photos qui se révèlent après la fête.
              Vous récupérez alors un lien à mettre dans cette affiche.
            </p>
            <Link href="/create?tier=5" className="btn btn-accent">Créer mon album →</Link>
          </div>
        </div>
      </div>

      {/* Le canvas ne sert qu'à fabriquer le PNG : il n'est jamais montré. */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Vérification grandeur nature : on vise l'écran avec son propre
          téléphone, seul vrai test avant de lancer une impression. */}
      {zoom && (
        <div className="qg-zoom" role="dialog" aria-modal="true" onClick={() => setZoom(false)}>
          <div className="qg-zoom-in" onClick={(e) => e.stopPropagation()}>
            <div className="qg-stage">
              <div className="qg-svg" dangerouslySetInnerHTML={{ __html: svg }} />
            </div>
            <p>Ouvrez l’appareil photo de votre téléphone et visez cet écran.<br />
              <em>{target}</em></p>
            <button type="button" className="btn btn-ghost" onClick={() => setZoom(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  )
}
