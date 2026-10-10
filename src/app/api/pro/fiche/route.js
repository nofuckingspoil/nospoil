// ============================================================
//  Fiche partenaire (formulaire /pro/fiche).
//
//  Reçoit un FormData : `fiche` (JSON des champs) et `photo` (facultative).
//  La photo est réduite (1600 px, webp) puis rangée dans R2 sous
//  partenaires/<id>.webp. La fiche entre dans demandes_pro au statut
//  « nouvelle », NON publiée : Clément la relit dans /admin/pros, envoie le
//  code à la main, puis coche « Publiée » pour qu'elle sorte sur /partenaires.
//
//  Comme pour /api/pro : l'alerte mail part même si la base refuse, pour
//  qu'aucune fiche ne se perde. Champ piège `site_web_2` contre les robots.
// ============================================================
import { after } from 'next/server'
import sharp from 'sharp'
import { insertRow, selectRows } from '../../../../lib/supabase'
import { uploadPhoto } from '../../../../lib/r2'
import { sendMail } from '../../../../lib/mail'
import { adminEmail } from '../../../../lib/avis-mail'
import { checkEmailShape, normalizeGuestEmail } from '../../../../lib/email-check'
import { ipDe, tropDeDemandes, messageTrop } from '../../../../lib/rate-limit'
import { CONTACT_EMAIL } from '../../../../lib/pricing'
import {
  METIERS_FICHE, estCleMetier, validerFiche, deptDuCodePostal, codePostalDansAdresse,
  versPseudo, slugifier, LIMITES_FICHE,
} from '../../../../lib/partenaires'

export const runtime = 'nodejs'

// Le formulaire réduit la photo avant l'envoi : Vercel refuse les requêtes de plus de 4,5 Mo.
const PHOTO_MAX = 4 * 1024 * 1024
const ech = (v) => String(v || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const texte = (v) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim() : '')
const erreur = (message, status = 400, champs) => Response.json({ error: message, ...(champs ? { champs } : {}) }, { status })

// La commune d'un code postal (service public geo.api.gouv.fr). Facultatif :
// sans réponse rapide, on se contente du département.
async function communeDe(cp) {
  try {
    const ctrl = new AbortController()
    const minuteur = setTimeout(() => ctrl.abort(), 2500)
    const r = await fetch(`https://geo.api.gouv.fr/communes?codePostal=${cp}&fields=nom&limit=5`, { signal: ctrl.signal })
    clearTimeout(minuteur)
    const liste = r.ok ? await r.json() : []
    return Array.isArray(liste) && liste.length === 1 ? liste[0].nom : ''
  } catch { return '' }
}

// Un slug libre : « plan-on-event », sinon « plan-on-event-2 »…
async function slugLibre(base) {
  const { ok, data } = await selectRows('demandes_pro', `select=slug&slug=like.${encodeURIComponent(base)}*&limit=200`)
  const pris = new Set(ok && Array.isArray(data) ? data.map((d) => d.slug) : [])
  if (!pris.has(base)) return base
  for (let i = 2; i < 500; i++) if (!pris.has(`${base}-${i}`)) return `${base}-${i}`
  return `${base}-${Date.now().toString(36)}`
}

export async function POST(request) {
  let form
  try { form = await request.formData() } catch { return erreur('Demande illisible.') }
  let brut
  try { brut = JSON.parse(String(form.get('fiche') || '')) } catch { return erreur('Demande illisible.') }
  if (!brut || typeof brut !== 'object') return erreur('Demande illisible.')
  if (texte(brut.site_web_2)) return Response.json({ ok: true }) // robot

  const cle = estCleMetier(brut.page) ? brut.page : 'general'
  const metierCle = cle === 'general' ? texte(brut.metier) : cle
  const f = {
    entreprise: texte(brut.entreprise),
    metier: metierCle,
    codePostal: texte(brut.codePostal).replace(/\D/g, '').slice(0, 5),
    adresse: texte(brut.adresse),
    description: texte(brut.description),
    site: texte(brut.site),
    instagram: versPseudo('instagram', texte(brut.instagram)),
    tiktok: versPseudo('tiktok', texte(brut.tiktok)),
    facebook: versPseudo('facebook', texte(brut.facebook)),
    prenom: texte(brut.prenom),
    nom: texte(brut.nom),
    email: normalizeGuestEmail(brut.email),
    telephone: texte(brut.telephone),
    accord: brut.accord === true,
  }
  const erreurs = validerFiche(f, cle === 'general' ? 'general' : cle)
  if (Object.keys(erreurs).length) return erreur('Quelques champs sont à compléter.', 400, erreurs)
  const forme = checkEmailShape(f.email, 'fr')
  if (!forme.ok) return erreur(forme.reason, 400, { email: forme.reason })

  if (await tropDeDemandes(ipDe(request), 'fiche-pro', { max: 5, minutes: 60 })) return erreur(messageTrop('fr'), 429)

  // Département et commune.
  const estLieu = metierCle === 'lieu'
  const cp = estLieu ? codePostalDansAdresse(f.adresse) : f.codePostal
  const dept = deptDuCodePostal(cp)
  let ville = ''
  if (estLieu) {
    const apres = f.adresse.split(cp)[1] || ''
    ville = apres.replace(/^[\s,]+/, '').split(',')[0].trim().slice(0, 80)
  }
  if (!ville) ville = await communeDe(cp)

  // La photo, réduite et convertie, avant tout enregistrement.
  const id = crypto.randomUUID()
  let photoCle = null
  const photo = form.get('photo')
  if (photo && typeof photo === 'object' && photo.size > 0) {
    if (photo.size > PHOTO_MAX) return erreur('La photo est trop lourde (4 Mo maximum).', 400, { photo: 'Photo trop lourde.' })
    try {
      const entree = Buffer.from(await photo.arrayBuffer())
      const sortie = await sharp(entree).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer()
      photoCle = `partenaires/${id}.webp`
      await uploadPhoto(photoCle, sortie, 'image/webp')
    } catch (err) {
      console.error('fiche pro : photo refusée', err)
      return erreur('Cette image n’a pas pu être lue. Essayez une photo JPEG ou PNG.', 400, { photo: 'Image illisible.' })
    }
  }

  const slug = await slugLibre(slugifier(f.entreprise)).catch(() => slugifier(f.entreprise) + '-' + id.slice(0, 6))
  const ligne = {
    id,
    prenom: f.prenom, nom: f.nom, metier: METIERS_FICHE[metierCle].id, entreprise: f.entreprise,
    ville: ville || dept.nom, email: f.email, telephone: f.telephone, site: f.site || null,
    langue: 'fr', provenance: texte(brut.provenance).slice(0, 120) || 'fiche',
    page_origine: texte(brut.page_origine).slice(0, 300) || null,
    type: 'fiche', description: f.description, code_postal: cp, adresse: estLieu ? f.adresse : null,
    departement: dept.num, dept_nom: dept.nom,
    instagram: f.instagram || null, tiktok: f.tiktok || null, facebook: f.facebook || null,
    photo_cle: photoCle, slug, accord_publication: true,
  }
  for (const [k, max] of Object.entries(LIMITES_FICHE)) if (typeof ligne[k] === 'string' && ligne[k].length > max) ligne[k] = ligne[k].slice(0, max)

  let enregistre = false
  try {
    const res = await insertRow('demandes_pro', ligne)
    enregistre = res.ok
    if (!res.ok) console.error('fiche pro : enregistrement refusé', res.status, res.data)
  } catch (err) { console.error('fiche pro : enregistrement impossible', err) }

  after(async () => {
    try {
      const lignes = [
        ['Structure', f.entreprise], ['Métier', METIERS_FICHE[metierCle].label],
        ['Département', `${dept.nom} (${dept.num})`], ['Commune', ville || '-'], ['Adresse', f.adresse || '-'],
        ['Présentation', f.description], ['Site', f.site || '-'],
        ['Réseaux', [f.instagram && `Instagram ${f.instagram}`, f.tiktok && `TikTok ${f.tiktok}`, f.facebook && `Facebook ${f.facebook}`].filter(Boolean).join(' · ') || '-'],
        ['Photo', photoCle ? 'oui' : 'non'], ['Contact', `${f.prenom} ${f.nom}`], ['E-mail', f.email], ['Téléphone', f.telephone],
        ['Provenance', ligne.provenance],
      ]
      await sendMail({
        to: adminEmail(),
        subject: `Fiche partenaire : ${f.entreprise} (${METIERS_FICHE[metierCle].label}, ${dept.num})`,
        repondreA: f.email,
        html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;">
          ${enregistre ? '' : '<p style="color:#b23b2e;"><strong>Attention : la fiche n’a pas pu être enregistrée en base.</strong> Tout est dans ce mail.</p>'}
          <table style="border-collapse:collapse;">
            ${lignes.map(([k, v]) => `<tr><td style="padding:3px 14px 3px 0;color:#6E6252;vertical-align:top;">${ech(k)}</td><td style="padding:3px 0;"><strong>${ech(v)}</strong></td></tr>`).join('')}
          </table>
          <p style="margin-top:14px;">À faire : relire la fiche dans /admin/pros, créer le code dans /admin/codes (s'il en reste dans le département), l'envoyer, puis cocher « Publiée ».</p>
        </div>`,
      })
    } catch (err) { console.error('fiche pro : alerte admin', err) }
  })

  if (!enregistre) return erreur(`Votre fiche n’a pas pu être enregistrée. Réessayez dans un instant, ou écrivez-nous à ${CONTACT_EMAIL}.`, 503)
  return Response.json({ ok: true })
}
