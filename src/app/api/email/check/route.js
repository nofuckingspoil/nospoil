// ============================================================
//  Vérification d'une adresse mail saisie par un participant.
//
//  Appelée pendant la saisie (quand le participant quitte le champ), pas au
//  moment de valider : la correction arrive avant qu'il ait à y revenir.
//
//  Le contrôle le plus utile est le dernier : on demande au DNS si le
//  domaine accepte du courrier. « gmail.co » ou un domaine inventé
//  n'ont aucun serveur de messagerie : c'est imparable, et gratuit.
// ============================================================
import { domaineAccepteDuCourrier } from '../../../../lib/email-domaine'
import { checkEmailShape, normalizeGuestEmail } from '../../../../lib/email-check'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'

export const runtime = 'nodejs'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const langue = langueValide(body.langue) || langueRequete(request)
  const email = normalizeGuestEmail(body.email)

  const forme = checkEmailShape(email, langue)
  if (forme.empty) return Response.json({ status: 'vide' })
  if (!forme.ok) return Response.json({ status: 'invalide', reason: forme.reason })

  // Faute de frappe repérée : on propose la correction sans rien imposer.
  if (forme.suggestion) {
    return Response.json({ status: 'suggestion', suggestion: forme.suggestion })
  }

  const domaine = email.slice(email.lastIndexOf('@') + 1)
  const accepte = await domaineAccepteDuCourrier(domaine)
  if (accepte === false) {
    return Response.json({
      status: 'domaine-inconnu',
      reason: t({
        fr: `« ${domaine} » ne reçoit pas de courrier. Vérifiez l'orthographe.`,
        en: `“${domaine}” does not receive email. Check the spelling.`,
        de: `„${domaine}“ empfängt keine E-Mails. Bitte prüfen Sie die Schreibweise.`,
      }, langue),
    })
  }

  return Response.json({ status: 'ok' })
}
