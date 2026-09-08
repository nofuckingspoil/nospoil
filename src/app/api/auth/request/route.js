import { insertRow, updateRow, selectRows } from '../../../../lib/supabase'
import { sendMail, loginEmail, retrouverPhotosEmail, siteUrl } from '../../../../lib/mail'
import { aDesEvenements, participationsDe, normalizeEmail, isValidEmail, makeCode, makeToken } from '../../../../lib/account'
import { ipDe, tropDeDemandes, MESSAGE_TROP } from '../../../../lib/rate-limit'

const FIFTEEN_MIN = 15 * 60 * 1000

// La même réponse dans tous les cas, et c'est délibéré.
//
// Cette route répondait autrefois « aucun événement n'est associé à cette
// adresse » quand elle ne connaissait pas la personne. En essayant des adresses
// une par une, on pouvait donc dresser la liste des organisateurs : le site
// disait lui-même qui était client et qui ne l'était pas. Désormais il répond
// la même chose à tout le monde, et seul celui qui relève la boîte sait s'il y
// a quelque chose dedans.
const REPONSE_NEUTRE = { ok: true }

// Envoie à un participant le lien qui rattache ses photos au téléphone du moment.
//
// Ne renvoie rien, et n'échoue jamais bruyamment : la page de connexion doit
// répondre exactement la même chose que l'adresse soit connue ou non.
async function envoyerLienParticipant(email) {
  // Garde-fou par adresse visée. Sans lui, cette page deviendrait un moyen
  // commode d'arroser la boîte de quelqu'un d'autre : trois rappels par heure
  // suffisent largement à qui cherche vraiment ses photos.
  if (await tropDeDemandes(`mail:${email}`, 'retrouver-photos', { max: 3, minutes: 60 })) return

  const participations = await participationsDe(email)
  if (!participations) return

  const mail = retrouverPhotosEmail({
    albums: participations.albums,
    link: `${siteUrl()}/mes-photos?t=${participations.token}`,
  })
  await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text })
}

// Demande de connexion : on envoie un mail contenant un lien magique ET un code à 6 chiffres.
export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)

  // Seule erreur encore visible : une adresse qui n'en est pas une. Elle ne
  // renseigne sur personne, et se taire empêcherait de corriger une faute de frappe.
  if (!isValidEmail(email)) {
    return Response.json({ error: 'Adresse mail invalide.' }, { status: 400 })
  }

  // Plafond par machine : le garde-fou par adresse, plus bas, ne voit pas
  // celui qui essaie mille adresses différentes.
  if (await tropDeDemandes(ipDe(request), 'auth-request', { max: 20, minutes: 60 })) {
    return Response.json({ error: MESSAGE_TROP }, { status: 429 })
  }

  // Pas organisateur ? Alors peut-être participant, et dans ce cas il ne cherche
  // pas un tableau de bord : il cherche ses photos. C'est un autre mail qui part,
  // avec son lien personnel. Inconnu des deux côtés : on s'arrête là, sans le
  // dire et sans rien écrire en base.
  if (!(await aDesEvenements(email))) {
    await envoyerLienParticipant(email)
    return Response.json(REPONSE_NEUTRE)
  }

  // Garde-fou anti-spam : pas plus d'un mail toutes les 45 secondes par adresse.
  // Il ne s'annonce plus comme une erreur : deux clics de suite sur « envoyer »
  // ne doivent pas révéler, par la différence de réponse, que l'adresse est connue.
  const recent = await selectRows(
    'login_codes',
    `email=eq.${encodeURIComponent(email)}&purpose=eq.connexion&order=created_at.desc&limit=1&select=created_at`
  )
  const last = Array.isArray(recent.data) ? recent.data[0] : null
  if (last && Date.now() - new Date(last.created_at).getTime() < 45 * 1000) {
    return Response.json(REPONSE_NEUTRE)
  }

  // Les demandes précédentes encore valables sont annulées : un seul code actif à la fois.
  await updateRow('login_codes', `email=eq.${encodeURIComponent(email)}&purpose=eq.connexion&used_at=is.null`, {
    used_at: new Date().toISOString(),
  })

  const code = makeCode()
  const token = makeToken()
  const { ok } = await insertRow('login_codes', {
    email,
    code,
    token,
    expires_at: new Date(Date.now() + FIFTEEN_MIN).toISOString(),
  })
  if (!ok) {
    return Response.json({ error: 'Impossible de préparer la connexion. Réessayez.' }, { status: 500 })
  }

  const link = `${siteUrl()}/connexion?t=${token}`
  const mail = loginEmail({ code, link })
  const sent = await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text })
  if (!sent.ok) {
    return Response.json({ error: "L'envoi du mail a échoué. Réessayez dans un instant." }, { status: 502 })
  }

  return Response.json(REPONSE_NEUTRE)
}
