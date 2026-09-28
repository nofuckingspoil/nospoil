// ============================================================
//  Supprimer un compte, une fois le code vérifié.
//
//  Exigé par Apple (règle 5.1.1 v) pour toute application qui permet de créer
//  un compte, et par le règlement européen au titre du droit à l'effacement.
//
//  Ce que la suppression emporte, et ce qu'elle épargne : voir les commentaires
//  de `lib/suppression-compte`. En deux mots, l'identité disparaît toujours ;
//  les événements organisés ne partent que si on le demande, parce qu'ils
//  contiennent les photos des invités.
// ============================================================
import { verifyAndConsumeCode, normalizeEmail, isValidEmail } from '../../../../lib/account'
import { supprimerCompte } from '../../../../lib/suppression-compte'
import { ipDe, tropDeDemandes, messageTrop } from '../../../../lib/rate-limit'
import { t, langueValide } from '../../../../lib/i18n'
import { langueRequete } from '../../../../lib/langue-serveur'

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const email = normalizeEmail(body.email)
  const langue = langueValide(body.langue) || langueRequete(request)
  const code = (body.code || '').toString()
  const supprimerEvenements = body.supprimerEvenements === true

  if (!isValidEmail(email)) {
    return Response.json({ error: t({ fr: 'Adresse mail invalide.', en: 'Invalid email address.', de: 'Ungültige E-Mail-Adresse.' }, langue) }, { status: 400 })
  }

  if (await tropDeDemandes(ipDe(request), 'account-delete', { max: 10, minutes: 60 })) {
    return Response.json({ error: messageTrop(langue) }, { status: 429 })
  }

  // Le code prouve que cette adresse est bien la sienne. Il est consommé au
  // passage : il ne pourra pas resservir.
  const verdict = await verifyAndConsumeCode(email, code, 'suppression', langue)
  if (!verdict.ok) {
    return Response.json({ error: verdict.error }, { status: verdict.status })
  }

  const bilan = await supprimerCompte(email, { supprimerEvenements })
  if (!bilan.ok) {
    return Response.json({ error: t({ fr: 'La suppression a échoué. Réessayez.', en: 'The deletion failed. Please try again.', de: 'Die Löschung ist fehlgeschlagen. Bitte versuchen Sie es erneut.' }, langue) }, { status: 500 })
  }

  return Response.json({
    ok: true,
    evenementsSupprimes: bilan.evenementsSupprimes,
    evenementsDetaches: bilan.evenementsDetaches,
    participations: bilan.participations,
  })
}
