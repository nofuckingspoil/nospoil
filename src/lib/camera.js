'use client'
// ============================================================
//  Outils caméra : détection de navigateur intégré + compression
// ============================================================

// Détecte les navigateurs intégrés (Instagram, Messenger, etc.)
// où l'accès caméra live est souvent bloqué.
export function isInAppBrowser() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  return /Instagram|FBAN|FBAV|FB_IAB|Messenger|Line|Snapchat|Pinterest|LinkedInApp|Twitter|TikTok/i.test(ua)
}

// La caméra live (getUserMedia) est-elle disponible ?
export function supportsLiveCamera() {
  return typeof navigator !== 'undefined'
    && !!navigator.mediaDevices
    && typeof navigator.mediaDevices.getUserMedia === 'function'
    && !isInAppBrowser()
}

// Compresse une image (depuis une <video> ou un <img>) en JPEG.
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

    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Échec de la compression'))),
      'image/jpeg',
      quality
    )
  })
}

// Charge un fichier (input capture) dans une <img> pour pouvoir le compresser.
export function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
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
