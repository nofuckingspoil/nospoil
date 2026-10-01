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
  stylesDe, dotShapesDe, eyeShapesDe, centersDe, fontsDe, DEFAULTS,
  pickStyle, buildPlan, toSVG, drawOn, normalizeUrl, fileName,
} from '../../../lib/qr-art'
import {
  formatsDe, modelesDe, posterDefaults, buildPoster, buildSheet, diagnosePoster, reglageCode,
} from '../../../lib/poster-art'
import { useLangue } from '../../../components/Langue'

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
  const { t, lang, lien } = useLangue()
  // Listes de choix et textes d'exemple de l'affiche, dans la langue de la page.
  const { FORMATS, MODELES, STYLES, DOT_SHAPES, EYE_SHAPES, CENTERS, FONTS } = useMemo(() => ({
    FORMATS: formatsDe(lang),
    MODELES: modelesDe(lang),
    STYLES: stylesDe(lang),
    DOT_SHAPES: dotShapesDe(lang),
    EYE_SHAPES: eyeShapesDe(lang),
    CENTERS: centersDe(lang),
    FONTS: fontsDe(lang),
  }), [lang])
  const [o, setO] = useState(() => ({ ...DEFAULTS, ...posterDefaults(lang) }))
  const exemples = useMemo(() => posterDefaults(lang), [lang])
  const [zoom, setZoom] = useState(false)
  const [busy, setBusy] = useState('')
  // Les mesures de texte demandent un vrai navigateur : on ne compose
  // l'affiche qu'une fois la page vivante.
  const [pret, setPret] = useState(false)
  // Arrivée depuis le kit d'impression d'un événement : le lien de l'album
  // est déjà le bon, on évite qu'une retouche maladroite le casse.
  const [verrou, setVerrou] = useState(false)
  const canvasRef = useRef(null)

  const set = (patch) => setO((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    // Adresse pré-remplie par un lien (?url=…) : on arrive avec son album
    // déjà branché, depuis un mail ou un article.
    const q = new URLSearchParams(window.location.search)
    const p = q.get('url')
    if (p) setO((prev) => ({ ...prev, url: p }))
    if (p && q.get('verrou') === '1') setVerrou(true)
    // Venant d'un événement : son nom et sa date remplacent l'exemple. Un
    // paramètre présent mais vide efface le texte d'exemple correspondant.
    const textes = {}
    for (const k of ['titre', 'surtitre', 'date']) if (q.has(k)) textes[k] = q.get(k)
    if (Object.keys(textes).length) setO((prev) => ({ ...prev, ...textes }))
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
  const titreAffiche = t({ fr: 'Affiche mariage :', en: 'Wedding poster:', de: 'Hochzeitsposter:' })
  const titrePlanche = t({ fr: 'Planche à imprimer', en: 'Sheet to print', de: 'Druckbogen' })

  const unit = fmt.bare ? '' : 'mm'
  const svg = useMemo(
    () => (plan ? toSVG(plan, { title: `${titreAffiche} ${o.titre || ''}`, unit }) : ''),
    [plan, o.titre, unit, titreAffiche],
  )
  const svgPrint = useMemo(
    () => (planche ? toSVG(planche, { title: titrePlanche, unit }) : ''),
    [planche, unit, titrePlanche],
  )
  const alerte = useMemo(() => diagnosePoster(o, lang), [o, lang])
  const pastille = useMemo(() => !fmt.bare && reglageCode(o).plaque, [o, fmt])
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
      a.download = fileName(o, ext, lang)
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
    const repli = t({ fr: 'Affiche', en: 'Poster', de: 'Poster' })
    w.document.write(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8">`
      + `<title>${(o.titre || repli).replace(/[<>]/g, '')}</title>`
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
          <h2 className="qg-h">1 · {t({ fr: 'Où mène le QR code ?', en: 'Where does the QR code lead?', de: 'Wohin führt der QR-Code?' })}</h2>
          <input
            type="text" inputMode="url" spellCheck="false"
            placeholder={t({
              fr: 'lien de votre album photo, de votre site de mariage…',
              en: 'link to your photo album, your wedding website…',
              de: 'Link zu Ihrem Fotoalbum, Ihrer Hochzeitswebsite…',
            })}
            value={o.url} onChange={(e) => { if (!verrou) set({ url: e.target.value }) }}
            readOnly={verrou}
            style={verrou ? { opacity: 0.7, cursor: 'not-allowed' } : undefined}
            aria-label={t({
              fr: 'Adresse vers laquelle mène le QR code',
              en: 'Address the QR code leads to',
              de: 'Adresse, zu der der QR-Code führt',
            })}
          />
          {verrou ? (
            <p className="qg-hint">
              {t({
                fr: '🔒 C’est le lien de votre album : il est verrouillé pour que vos invités arrivent au bon endroit. Il ne vous reste qu’à habiller l’affiche.',
                en: '🔒 This is your album link: it is locked so your guests land in the right place. All that’s left is to style the poster.',
                de: '🔒 Das ist der Link zu Ihrem Album: Er ist gesperrt, damit Ihre Gäste am richtigen Ort landen. Sie müssen nur noch das Poster gestalten.',
              })}
            </p>
          ) : <p className="qg-hint">
            {t({
              fr: 'Un album photo, votre site de mariage, une playlist, une cagnotte, un plan d’accès… Rien n’est enregistré : tout reste dans votre navigateur.',
              en: 'A photo album, your wedding website, a playlist, a gift fund, a map… Nothing is saved: everything stays in your browser.',
              de: 'Ein Fotoalbum, Ihre Hochzeitswebsite, eine Playlist, eine Geldsammlung, eine Anfahrtsskizze… Nichts wird gespeichert: Alles bleibt in Ihrem Browser.',
            })}
          </p>}
        </section>

        <section className="qg-block">
          <h2 className="qg-h">2 · {t({ fr: 'Le support', en: 'The format', de: 'Das Format' })}</h2>
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
            <h2 className="qg-h">3 · {t({ fr: 'La mise en page', en: 'The layout', de: 'Das Layout' })}</h2>
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
            <h2 className="qg-h">4 · {t({ fr: 'Vos textes', en: 'Your text', de: 'Ihre Texte' })}</h2>
            <div className="qg-two">
              <Field label={t({ fr: 'Au-dessus', en: 'Above', de: 'Darüber' })} maxLength={28} value={o.surtitre}
                placeholder={exemples.surtitre} onChange={(e) => set({ surtitre: e.target.value })} />
              <Field label={t({ fr: 'La date', en: 'The date', de: 'Das Datum' })} maxLength={30} value={o.date}
                placeholder={exemples.date} onChange={(e) => set({ date: e.target.value })} />
            </div>
            <Field label={t({ fr: 'Vos prénoms', en: 'Your names', de: 'Ihre Vornamen' })} maxLength={40} value={o.titre}
              placeholder="Léa & Tom" onChange={(e) => set({ titre: e.target.value })} />
            <Field label={t({ fr: 'La petite phrase', en: 'The tagline', de: 'Der kleine Satz' })} maxLength={70} value={o.accroche}
              placeholder={exemples.accroche}
              onChange={(e) => set({ accroche: e.target.value })} />
            <Field label={t({ fr: 'La consigne, sous le code', en: 'The instruction, under the code', de: 'Der Hinweis unter dem Code' })} maxLength={44} value={o.consigne}
              placeholder={exemples.consigne}
              onChange={(e) => set({ consigne: e.target.value })} />
            <Field label={t({ fr: 'La ligne du bas', en: 'The bottom line', de: 'Die untere Zeile' })} maxLength={44} value={o.pied}
              placeholder={exemples.pied}
              onChange={(e) => set({ pied: e.target.value })} />
            <p className="qg-hint">
              {t({
                fr: 'Laissez un champ vide pour le faire disparaître de l’affiche.',
                en: 'Leave a field empty to remove it from the poster.',
                de: 'Lassen Sie ein Feld leer, um es vom Poster zu entfernen.',
              })}
            </p>
          </section>
        )}

        <section className="qg-block">
          <h2 className="qg-h">{fmt.bare ? '3' : '5'} · {t({ fr: 'Vos couleurs', en: 'Your colours', de: 'Ihre Farben' })}</h2>
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
            <ColorField label={fmt.bare ? t({ fr: 'Les pixels', en: 'The pixels', de: 'Die Pixel' }) : t({ fr: 'L’encre', en: 'The ink', de: 'Die Schrift' })} value={o.fg}
              onChange={(v) => set({ fg: v, style: '' })} />
            <ColorField label={fmt.bare ? t({ fr: 'Les trois coins', en: 'The three corners', de: 'Die drei Ecken' }) : t({ fr: 'La couleur d’accent', en: 'The accent colour', de: 'Die Akzentfarbe' })} value={o.eye}
              onChange={(v) => set({ eye: v, style: '' })} />
            <ColorField label={fmt.bare ? t({ fr: 'Le fond', en: 'The background', de: 'Der Hintergrund' }) : t({ fr: 'Le papier', en: 'The paper', de: 'Das Papier' })} value={o.bg}
              onChange={(v) => set({ bg: v, style: '' })} />
          </div>
          {fmt.bare && (
            <label className="qg-switch">
              <input type="checkbox" checked={o.transparent}
                onChange={(e) => set({ transparent: e.target.checked })} />
              <span>{t({ fr: 'Fond transparent', en: 'Transparent background', de: 'Transparenter Hintergrund' })} <em>{t({ fr: '(pour poser le code sur une photo)', en: '(to place the code on a photo)', de: '(um den Code auf ein Foto zu setzen)' })}</em></span>
            </label>
          )}
        </section>

        {!fmt.bare && (
          <section className="qg-block">
            <h2 className="qg-h">6 · {t({ fr: 'Les polices', en: 'The fonts', de: 'Die Schriften' })}</h2>
            <div className="qg-row">
              <span className="qg-lbl">{t({ fr: 'Les prénoms', en: 'The names', de: 'Die Vornamen' })}</span>
              <Choice name={t({ fr: 'Police des prénoms', en: 'Font for the names', de: 'Schrift der Vornamen' })} items={FONTS} value={o.titreFont}
                onChange={(v) => set({ titreFont: v })} />
            </div>
            <div className="qg-row">
              <span className="qg-lbl">{t({ fr: 'Le reste', en: 'The rest', de: 'Der Rest' })}</span>
              <Choice name={t({ fr: 'Police du texte', en: 'Font for the text', de: 'Schrift des Textes' })} items={FONTS} value={o.texteFont}
                onChange={(v) => set({ texteFont: v })} />
            </div>
            <p className="qg-hint">
              {t({
                fr: 'Polices choisies parmi celles présentes sur tous les ordinateurs : ce que vous voyez est exactement ce qui sortira de l’imprimante.',
                en: 'Fonts chosen from those available on every computer: what you see is exactly what will come out of the printer.',
                de: 'Schriften, die auf jedem Computer vorhanden sind: Was Sie sehen, kommt genau so aus dem Drucker.',
              })}
            </p>
          </section>
        )}

        <section className="qg-block">
          <h2 className="qg-h">{fmt.bare ? '4' : '7'} · {t({ fr: 'Le style du code', en: 'The code style', de: 'Der Stil des Codes' })}</h2>
          <div className="qg-row">
            <span className="qg-lbl">{t({ fr: 'Les pixels', en: 'The pixels', de: 'Die Pixel' })}</span>
            <Choice name={t({ fr: 'Forme des pixels', en: 'Pixel shape', de: 'Form der Pixel' })} items={DOT_SHAPES} value={o.dots}
              onChange={(v) => set({ dots: v, style: '' })} />
          </div>
          <div className="qg-row">
            <span className="qg-lbl">{t({ fr: 'Les trois coins', en: 'The three corners', de: 'Die drei Ecken' })}</span>
            <Choice name={t({ fr: 'Forme des coins', en: 'Corner shape', de: 'Form der Ecken' })} items={EYE_SHAPES} value={o.eyes}
              onChange={(v) => set({ eyes: v, style: '' })} />
          </div>
          <div className="qg-row">
            <span className="qg-lbl">{t({ fr: 'Au centre', en: 'In the centre', de: 'In der Mitte' })}</span>
            <Choice name={t({ fr: 'Motif central', en: 'Centre motif', de: 'Motiv in der Mitte' })} items={CENTERS} value={o.center}
              onChange={(v) => set({ center: v })} />
          </div>
          {o.center === 'initials' && (
            <input
              type="text" className="qg-mt" maxLength={3} placeholder="L&T"
              value={o.initials} onChange={(e) => set({ initials: e.target.value })}
              aria-label={t({ fr: 'Vos initiales', en: 'Your initials', de: 'Ihre Initialen' })}
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
            {t({ fr: 'Aperçu', en: 'Preview', de: 'Vorschau' })} · {fmt.label}{fmt.per > 1 ? ` · ${t({ fr: `${fmt.per} par page A4`, en: `${fmt.per} per A4 page`, de: `${fmt.per} pro A4-Seite` })}` : ''}
          </div>

          <div className={`qg-stage ${o.transparent && fmt.bare ? 'alpha' : ''}`}>
            {svg
              ? <div className={`qg-svg ${fmt.bare ? 'carre' : ''}`} dangerouslySetInnerHTML={{ __html: svg }} />
              : <p className="muted">{t({ fr: 'Composition…', en: 'Laying out…', de: 'Wird gestaltet…' })}</p>}
          </div>

          {pastille && !alerte && (
            <p className="qg-hint center">
              {t({
                fr: 'Nous avons ajouté un fond blanc derrière le QR code pour que son contraste soit suffisant.',
                en: 'We added a white background behind the QR code so its contrast is high enough.',
                de: 'Wir haben einen weißen Hintergrund hinter den QR-Code gesetzt, damit der Kontrast ausreicht.',
              })}
            </p>
          )}

          {alerte && (
            <div className={`qg-alert ${alerte.level}`}>
              <strong>{alerte.level === 'bad' ? t({ fr: 'Illisible', en: 'Unreadable', de: 'Unlesbar' }) : t({ fr: 'Attention', en: 'Warning', de: 'Achtung' })}</strong>
              <span>{alerte.text}</span>
            </div>
          )}
        </div>

        <div className="qg-tail">
          <button type="button" className="btn btn-ghost" onClick={() => setZoom(true)} disabled={!ok}>
            {t({ fr: 'Tester le scan avec mon téléphone', en: 'Test the scan with my phone', de: 'Scan mit meinem Handy testen' })}
          </button>

          <div className="qg-dl">
            {!fmt.screen && !fmt.bare && (
              <button type="button" className="btn btn-accent" disabled={!ok} onClick={imprimer}>
                {t({ fr: 'Imprimer / enregistrer en PDF', en: 'Print / save as PDF', de: 'Drucken / als PDF speichern' })}
              </button>
            )}
            <button type="button" className={`btn ${fmt.screen || fmt.bare ? 'btn-accent' : 'btn-dark'}`}
              disabled={!ok || busy === 'png'} onClick={() => download('png')}>
              {busy === 'png'
                ? t({ fr: 'Préparation…', en: 'Preparing…', de: 'Wird vorbereitet…' })
                : t({ fr: 'Télécharger en PNG', en: 'Download as PNG', de: 'Als PNG herunterladen' })}
            </button>
            <button type="button" className="btn btn-ghost" disabled={!ok || busy === 'svg'}
              onClick={() => download('svg')}>
              {t({ fr: 'Télécharger en SVG (imprimeur)', en: 'Download as SVG (for printers)', de: 'Als SVG herunterladen (Druckerei)' })}
            </button>
          </div>

          {!ok
            ? <p className="qg-hint center">{t({
                fr: 'Indiquez d’abord l’adresse de destination, en haut.',
                en: 'First enter the destination address, at the top.',
                de: 'Geben Sie zuerst oben die Zieladresse ein.',
              })}</p>
            : <p className="qg-hint center">
                {fmt.per > 1
                  ? t({
                    fr: `L’impression compose une page A4 avec ${fmt.per} exemplaires et les repères de découpe.`,
                    en: `Printing lays out an A4 page with ${fmt.per} copies and crop marks.`,
                    de: `Beim Drucken entsteht eine A4-Seite mit ${fmt.per} Exemplaren und Schnittmarken.`,
                  })
                  : t({
                    fr: 'Dans la fenêtre d’impression, choisissez « Enregistrer en PDF » pour l’envoyer à un imprimeur.',
                    en: 'In the print window, choose “Save as PDF” to send it to a printer.',
                    de: 'Wählen Sie im Druckfenster „Als PDF sichern“, um es an eine Druckerei zu schicken.',
                  })}
              </p>}

          {!verrou && <div className="qg-cross">
            <strong>{t({ fr: 'Pas encore d’album pour vos photos ?', en: 'No album for your photos yet?', de: 'Noch kein Album für Ihre Fotos?' })}</strong>
            <p>
              {t({
                fr: 'Time to Flash transforme le téléphone de chaque invité en appareil jetable : un nombre de clichés limité, et toutes les photos qui se révèlent après la fête. Vous récupérez alors un lien à mettre dans cette affiche.',
                en: 'Time to Flash turns every guest’s phone into a disposable camera: a limited number of shots, and all the photos revealed after the party. You then get a link to put on this poster.',
                de: 'Time to Flash verwandelt das Handy jedes Gastes in eine Einwegkamera: eine begrenzte Anzahl an Aufnahmen, und alle Fotos werden nach der Feier enthüllt. Sie erhalten dann einen Link für dieses Poster.',
              })}
            </p>
            <Link href={lien('/create?tier=5')} className="btn btn-accent">{t({ fr: 'Créer mon album →', en: 'Create my album →', de: 'Mein Album erstellen →' })}</Link>
          </div>}
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
            <p>{t({
              fr: 'Ouvrez l’appareil photo de votre téléphone et visez cet écran.',
              en: 'Open your phone’s camera and point it at this screen.',
              de: 'Öffnen Sie die Kamera Ihres Handys und richten Sie sie auf diesen Bildschirm.',
            })}<br />
              <em>{target}</em></p>
            <button type="button" className="btn btn-ghost" onClick={() => setZoom(false)}>{t({ fr: 'Fermer', en: 'Close', de: 'Schließen' })}</button>
          </div>
        </div>
      )}
    </div>
  )
}
