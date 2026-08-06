// ============================================================
//  Deux règlements pour un seul agrandissement.
//
//  Depuis qu'un co-organisateur peut payer, l'alerte « un invité attend à la
//  porte » part à plusieurs personnes à la fois. Deux d'entre elles peuvent
//  très bien régler en même temps, chacune croyant sauver la soirée. La
//  formule, elle, ne monte qu'une fois.
//
//  Rien ne le signalerait : le second payeur voit un écran normal, et
//  l'événement est bien à niveau. Seul un remboursement manuel répare la
//  chose — encore faut-il savoir qu'il y a lieu de le faire.
// ============================================================
import 'server-only'
import { sendMail, layout, siteUrl } from './mail'
import { adminEmail } from './avis-mail'

export async function alerterDoublePaiement({ eventName, eventId, email, montantCents, sessionId }) {
  const montant = Number.isFinite(montantCents)
    ? (montantCents / 100).toFixed(2).replace('.', ',') + ' €'
    : 'montant inconnu'

  const html = layout({
    title: 'Un règlement à rembourser',
    intro: `Deux personnes ont payé le même agrandissement de formule sur « <strong>${eventName || 'un événement'}</strong> ». La formule n'a monté qu'une fois : ce second règlement est à rembourser.`,
    body: `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="font-size:13px;color:#8a7c69;padding:4px 12px 4px 0;">Montant</td><td style="font-size:14px;color:#221A12;"><strong>${montant}</strong></td></tr>
        <tr><td style="font-size:13px;color:#8a7c69;padding:4px 12px 4px 0;">Payeur</td><td style="font-size:14px;color:#221A12;">${email || 'inconnu'}</td></tr>
        <tr><td style="font-size:13px;color:#8a7c69;padding:4px 12px 4px 0;">Session Stripe</td><td style="font-size:13px;color:#221A12;font-family:ui-monospace,Menlo,monospace;">${sessionId}</td></tr>
        <tr><td style="font-size:13px;color:#8a7c69;padding:4px 12px 4px 0;">Événement</td><td style="font-size:13px;color:#221A12;"><a href="${siteUrl()}/admin/event/${eventId}" style="color:#C9431F;">${eventId}</a></td></tr>
      </table>
      <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:20px;">
        Le remboursement se fait depuis Stripe, sur la session ci-dessus. Prévenez la
        personne : de son côté, rien n'indique qu'elle a payé pour rien.
      </div>`,
    footer: `Ce message n'est envoyé que dans ce cas précis — deux paiements pour un même agrandissement.`,
  })

  return sendMail({ to: adminEmail(), subject: `⚠️ Double paiement à rembourser — ${eventName || 'événement'}`, html })
}
