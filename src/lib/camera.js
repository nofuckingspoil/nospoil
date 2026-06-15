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
