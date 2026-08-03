'use client'
// ============================================================
//  Outils caméra : détection de navigateur intégré + compression
// ============================================================

// Détecte les navigateurs intégrés aux messageries (Messenger, WhatsApp,
// Instagram…). La plupart des invités arrivent par là : on ne les écarte pas,
// on adapte seulement le discours.
export function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  if (/Instagram|FBAN|FBAV|FB_IAB|FBIOS|Messenger|WhatsApp|Line|Snapchat|Pinterest|LinkedInApp|Twitter|TikTok|MicroMessenger/i.test(ua)) return true
  if (/\bwv\b/.test(ua)) return true // WebView Android (celle de WhatsApp, entre autres)
  // iPhone : un vrai Safari annonce « Safari » ; une page ouverte dans une appli, non.
  return /iPhone|iPad|iPod/i.test(ua) && /AppleWebKit/i.test(ua) && !/Safari|CriOS|FxiOS/i.test(ua)
}

// La caméra live (getUserMedia) est-elle envisageable ?
// On ne présume plus de l'issue d'après le nom du navigateur : certains
// navigateurs intégrés l'autorisent. On tente, et l'échec fait basculer sur
// l'appareil photo du téléphone.
export function supportsLiveCamera() {
  return typeof navigator !== 'undefined'
    && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getUserMedia === 'function'
}

// Compresse une image (depuis une <video>, un <img> ou un ImageBitmap) en JPEG.
// Réduit la taille pour limiter le coût de stockage.
export function compressToBlob(source, { maxSize = 1600, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    const sw = source.videoWidth || source.naturalWidth || source.width
    const sh = source.videoHeight || source.naturalHeight || source.height
    if (!sw || !sh) return reject(new Error('Source image vide'))

    const scale = Math.min(1, maxSize / Math.max(sw, sh))
    const w = Math.round(sw * scale)
    const h = Math.round(sh * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.drawImage(source, 0, 0, w, h)

    // Repli : dans les navigateurs intégrés, toBlob rend parfois un résultat
    // vide — ou ne rappelle jamais — quand la mémoire manque. toDataURL est
    // synchrone et s'en sort là où toBlob renonce.
    let fini = false
    const parDataUrl = () => {
      if (fini) return
      fini = true
      try { resolve(dataUrlEnBlob(canvas.toDataURL('image/jpeg', quality))) }
      catch { reject(new Error('Échec de la compression')) }
    }
    const minuteur = setTimeout(parDataUrl, 6000)

    try {
      canvas.toBlob(
        (blob) => {
          if (fini) return
          clearTimeout(minuteur)
          if (blob && blob.size) { fini = true; resolve(blob) } else parDataUrl()
        },
        'image/jpeg',
        quality
      )
    } catch { clearTimeout(minuteur); parDataUrl() }
  })
}

function dataUrlEnBlob(dataUrl) {
  const brut = atob(dataUrl.split(',')[1])
  const octets = new Uint8Array(brut.length)
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i)
  return new Blob([octets], { type: 'image/jpeg' })
}

// Charge un fichier (input capture) dans une <img> pour pouvoir le compresser.
export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => { URL.revokeObjectURL(url); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible')) }
    img.src = url
  })
}

// Décode un fichier photo. createImageBitmap d'abord : il consomme beaucoup
// moins de mémoire qu'une balise <img>, ce qui compte dans un navigateur
// intégré, où le budget est bien plus serré que dans Safari ou Chrome.
export async function decodeImage(file) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(file) } catch {}
  }
  return fileToImage(file)
}

// Prépare la photo choisie par l'invité avant l'envoi.
// Une photo qui ne part pas est une photo perdue : on essaie donc plusieurs
// fois, de plus en plus modestement, et en dernier recours on envoie le
// fichier d'origine plutôt que d'abandonner.
export async function prepareUpload(file) {
  const MAX_OCTETS = 8 * 1024 * 1024

  for (const essai of [{ maxSize: 1600, quality: 0.82 }, { maxSize: 1000, quality: 0.7 }]) {
    let source = null
    try {
      source = await decodeImage(file)
      const blob = await compressToBlob(source, essai)
      if (blob && blob.size) return blob
    } catch {}
    finally { try { source?.close?.() } catch {} }
  }

  // Ni l'un ni l'autre : le fichier brut fera l'affaire s'il est déjà un JPEG
  // d'un poids raisonnable (c'est le cas des photos prises depuis le téléphone).
  if (file && file.size && file.size <= MAX_OCTETS && /jpe?g/i.test(file.type || '')) return file

  throw new Error("Cette photo n'a pas pu être préparée. Réessaie, ou importe-la depuis ta galerie.")
}

// Son d'obturateur synthétisé (deux clics mécaniques), sans fichier audio.
let _audioCtx = null
export function playShutter() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    _audioCtx = _audioCtx || new AC()
    if (_audioCtx.state === 'suspended') _audioCtx.resume()
    const ctx = _audioCtx

    const click = (at, gain, freq, dur) => {
      const n = Math.floor(ctx.sampleRate * dur)
      const buf = ctx.createBuffer(1, n, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.4)
      const src = ctx.createBufferSource(); src.buffer = buf
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = freq
      const g = ctx.createGain(); g.gain.value = gain
      src.connect(hp); hp.connect(g); g.connect(ctx.destination)
      src.start(ctx.currentTime + at)
    }
    // clic sec (ouverture) puis clic plus doux (fermeture) ~70ms après
    click(0, 0.55, 1700, 0.05)
    click(0.07, 0.3, 1200, 0.06)
  } catch {}
}
