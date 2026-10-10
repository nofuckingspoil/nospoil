// ============================================================
//  Demande d'un prestataire de mariage (formulaire de la page /pro).
//
//  Le code n'est jamais donné ici : la demande est enregistrée (table
//  demandes_pro), puis part par mail à l'admin. Clément la lit, crée le code
//  dans /admin/codes et répond lui-même.
//
//  Si l'enregistrement échoue (table absente, base injoignable), le mail
//  d'alerte part quand même : aucune demande ne doit se perdre. Le visiteur
//  reçoit alors une erreur propre et peut réessayer ou écrire.
//
//  Champ piège (`site_web_2`) : invisible pour un humain. Rempli, c'est un
//  robot : on répond « ok » sans rien enregistrer ni envoyer.
// ============================================================
import { after } from 'next/server'
import { insertRow } from '../../../lib/supabase'
import { sendMail } from '../../../lib/mail'
import { adminEmail } from '../../../lib/avis-mail'
import { t } from '../../../lib/i18n'
import { langueRequete } from '../../../lib/langue-serveur'
import { checkEmailShape, normalizeGuestEmail } from '../../../lib/email-check'
import { ipDe, tropDeDemandes, messageTrop } from '../../../lib/rate-limit'
import { CONTACT_EMAIL } from '../../../lib/pricing'
import { LIMITES, estMetier, estVolume, libelleMetier, libelleVolume } from '../../../lib/pro'

export const runtime = 'nodejs'

const ech = (v) => String(v || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

// Texte nettoyé : chaîne, sans espaces autour, sans caractères de contrôle.
function texte(v) {
  if (typeof v !== 'string') return ''
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
}

export async function POST(request) {
  const langue = langueRequete(request)
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return Response.json({ error: t({ fr: 'Demande illisible.', en: 'Unreadable request.', de: 'Unlesbare Anfrage.' }, langue) }, { status: 400 })
  }

  // Le piège : un robot remplit tout, y compris ce qu'il ne voit pas.
  if (texte(body.site_web_2)) return Response.json({ ok: true })

  const d = {
    prenom: texte(body.prenom),
    nom: texte(body.nom),
    metier: texte(body.metier),
    entreprise: texte(body.entreprise),
    ville: texte(body.ville),
    email: normalizeGuestEmail(body.email),
    telephone: texte(body.telephone),
    site: texte(body.site),
    volume: texte(body.volume),
    message: texte(body.message),
    provenance: texte(body.provenance) || 'site',
    page_origine: texte(body.page_origine),
  }

  // Champs obligatoires.
  const manquants = ['prenom', 'nom', 'metier', 'entreprise', 'ville', 'email', 'volume'].filter((k) => !d[k])
  if (manquants.length) {
    return Response.json({
      error: t({ fr: 'Merci de remplir tous les champs obligatoires.', en: 'Please fill in all required fields.', de: 'Bitte füllen Sie alle Pflichtfelder aus.' }, langue),
      champs: manquants,
    }, { status: 400 })
  }
  if (body.accord !== true) {
    return Response.json({
      error: t({ fr: 'Merci de cocher la case pour que nous puissions vous recontacter.', en: 'Please tick the box so we can get back to you.', de: 'Bitte setzen Sie das Häkchen, damit wir Sie kontaktieren können.' }, langue),
      champs: ['accord'],
    }, { status: 400 })
  }

  // Longueurs : le formulaire les limite déjà, le serveur ne fait confiance à personne.
  const tropLongs = Object.keys(LIMITES).filter((k) => d[k] && d[k].length > LIMITES[k])
  if (tropLongs.length) {
    return Response.json({
      error: t({ fr: 'Un des champs est trop long.', en: 'One of the fields is too long.', de: 'Eines der Felder ist zu lang.' }, langue),
      champs: tropLongs,
    }, { status: 400 })
  }

  const forme = checkEmailShape(d.email, langue)
  if (!forme.ok) return Response.json({ error: forme.reason, champs: ['email'] }, { status: 400 })

  if (!estMetier(d.metier)) {
    return Response.json({ error: t({ fr: 'Choisissez votre métier dans la liste.', en: 'Please choose your profession from the list.', de: 'Bitte wählen Sie Ihren Beruf aus der Liste.' }, langue), champs: ['metier'] }, { status: 400 })
  }
  if (!estVolume(d.volume)) {
    return Response.json({ error: t({ fr: 'Indiquez votre nombre de mariages par an.', en: 'Please tell us how many weddings you work on per year.', de: 'Bitte geben Sie an, wie viele Hochzeiten Sie pro Jahr betreuen.' }, langue), champs: ['volume'] }, { status: 400 })
  }
  if (d.telephone && !/^[0-9+().\s-]{6,30}$/.test(d.telephone)) {
    return Response.json({ error: t({ fr: 'Ce numéro de téléphone ne semble pas valide.', en: 'This phone number does not look valid.', de: 'Diese Telefonnummer scheint ungültig zu sein.' }, langue), champs: ['telephone'] }, { status: 400 })
  }

  // Garde-fou : quelques demandes par heure et par machine suffisent largement.
  if (await tropDeDemandes(ipDe(request), 'demande-pro', { max: 5, minutes: 60 })) {
    return Response.json({ error: messageTrop(langue) }, { status: 429 })
  }

  const ligne = {
    prenom: d.prenom,
    nom: d.nom,
    metier: d.metier,
    entreprise: d.entreprise,
    ville: d.ville,
    email: d.email,
    telephone: d.telephone || null,
    site: d.site || null,
    volume: d.volume,
    message: d.message || null,
    langue,
    provenance: d.provenance,
    page_origine: d.page_origine || null,
  }

  let enregistre = false
  try {
    const res = await insertRow('demandes_pro', ligne)
    enregistre = res.ok
    if (!res.ok) console.error('pro : enregistrement refusé', res.status, res.data)
  } catch (err) {
    console.error('pro : enregistrement impossible', err)
  }

  // L'alerte part dans tous les cas : c'est elle qui garantit qu'on répond.
  after(async () => {
    try {
      const lignes = [
        ['Nom', `${d.prenom} ${d.nom}`],
        ['Métier', libelleMetier(d.metier)],
        ['Entreprise', d.entreprise],
        ['Ville', d.ville],
        ['E-mail', d.email],
        ['Téléphone', d.telephone || '-'],
        ['Site ou Instagram', d.site || '-'],
        ['Mariages par an', libelleVolume(d.volume)],
        ['Langue', langue],
        ['Provenance', d.provenance],
        ['Page d’origine', d.page_origine || '-'],
      ]
      await sendMail({
        to: adminEmail(),
        subject: `Demande partenaire : ${d.entreprise} (${libelleMetier(d.metier)}, ${d.ville})`,
        repondreA: d.email,
        html: `<div style="font-family:sans-serif;font-size:15px;line-height:1.6;">
          ${enregistre ? '' : '<p style="color:#b23b2e;"><strong>Attention : la demande n’a pas pu être enregistrée en base</strong> (table demandes_pro absente ou base injoignable). Tout est dans ce mail.</p>'}
          <table style="border-collapse:collapse;">
            ${lignes.map(([k, v]) => `<tr><td style="padding:3px 14px 3px 0;color:#6E6252;">${ech(k)}</td><td style="padding:3px 0;"><strong>${ech(v)}</strong></td></tr>`).join('')}
          </table>
          ${d.message ? `<p style="margin-top:14px;">« ${ech(d.message).replace(/\n/g, '<br>')} »</p>` : ''}
          <p style="margin-top:14px;">Créer le code : /admin/codes, puis le noter dans /admin/pros. Répondre à ce mail écrit directement à ${ech(d.email)}.</p>
        </div>`,
      })
    } catch (err) { console.error('pro : alerte admin', err) }
  })

  if (!enregistre) {
    return Response.json({
      error: t({
        fr: `Votre demande n’a pas pu être enregistrée. Réessayez dans un instant, ou écrivez-nous à ${CONTACT_EMAIL}.`,
        en: `Your request could not be saved. Please try again in a moment, or email us at ${CONTACT_EMAIL}.`,
        de: `Ihre Anfrage konnte nicht gespeichert werden. Bitte versuchen Sie es gleich noch einmal oder schreiben Sie uns an ${CONTACT_EMAIL}.`,
      }, langue),
    }, { status: 503 })
  }

  return Response.json({ ok: true })
}
