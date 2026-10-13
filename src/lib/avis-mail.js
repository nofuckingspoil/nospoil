// ============================================================
//  Les mails de l'enquête de satisfaction.
//
//  Deux qui sortent (vers l'organisateur, vers le participant qui n'est jamais allé
//  jusqu'à l'album) et deux qui rentrent (l'alerte immédiate et le récap du
//  lendemain, vers vous).
//
//  Le tri entre « tout de suite » et « demain » est ce qui rend l'ensemble
//  tenable : sans lui, un mariage de cent participants noierait la boîte, et
//  l'alerte qui comptait passerait avec le reste.
// ============================================================
import 'server-only'
import { BRAND } from './brand'
import { CONTACT_EMAIL, TIERS, LIVRE_OR_CENTS, formatPrice } from './pricing'
import { sendMail, layout, bigButton, siteUrl, etoilesAvis } from './mail'
import { accroche, libelle, resumeAppareil, NOTES, notes } from './avis'
import { t, LOCALES } from './i18n'
import { lien as lienLangue } from './langue-lien'
import { nomAffiche } from './event-defaults'

// Votre adresse de réception. Réglable, mais jamais vide : une enquête dont
// les alertes ne partent nulle part n'alerte personne.
export function adminEmail() {
  return (process.env.ADMIN_EMAIL || '').trim() || CONTACT_EMAIL
}

// Le lien porte la clé d'avis de l'événement, jamais celle de l'organisateur :
// un mail se transfère, et cette clé-là n'ouvre que le questionnaire.
export function lienAvisOrga(cleAvis) {
  return `${siteUrl()}/avis?o=${encodeURIComponent(cleAvis)}`
}

// Désinscription en un clic, appelée directement par la messagerie (bouton
// « Se désabonner » de Gmail) : voir /api/feedback/stop.
export function lienDesinscription(token) {
  return `${siteUrl()}/api/feedback/stop?t=${encodeURIComponent(token)}`
}

export function lienAvisInvite(token) {
  return `${siteUrl()}/avis?i=${encodeURIComponent(token)}`
}

// ---------- Vers l'organisateur, deux jours après la révélation ----------
export function surveyOrgaEmail({ eventName, link, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  const accr = accroche(langue)
  return {
    subject: t({
      fr: `Vous faites partie des 1000 premiers : 2 minutes ?`,
      en: `You are one of our first 1,000: 2 minutes?`,
      de: `Sie gehören zu den ersten 1.000: Haben Sie 2 Minuten?`,
    }, langue),
    html: layout({
      langue,
      title: t({ fr: 'Votre avis, vraiment', en: 'Your honest opinion', de: 'Ihre ehrliche Meinung' }, langue),
      intro: t({
        fr: `${accr} On construit encore beaucoup de choses, et ce que vous direz après « <strong>${eventName}</strong> » pèse lourd à ce stade.`,
        en: `${accr} We are still building a lot, and what you tell us after “<strong>${eventName}</strong>” carries real weight at this stage.`,
        de: `${accr} Wir bauen noch vieles auf, und was Sie uns nach „<strong>${eventName}</strong>“ sagen, hat in dieser Phase großes Gewicht.`,
      }, langue),
      body: `${bigButton(link, t({ fr: 'Répondre (2 minutes) →', en: 'Answer (2 minutes) →', de: 'Antworten (2 Minuten) →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${t({
            fr: `Ce qui vous a plu, ce qui a coincé, ce qui vous a manqué, et un
          espace pour tout dire librement.
          Rien à créer, rien à installer : le lien vous reconnaît.`,
            en: `What you liked, what went wrong, what you missed, and a
          space to say anything you like.
          Nothing to create, nothing to install: the link knows who you are.`,
            de: `Was Ihnen gefallen hat, was gehakt hat, was Ihnen gefehlt hat, und
          ein Feld, in dem Sie frei alles sagen können.
          Nichts anzulegen, nichts zu installieren: Der Link erkennt Sie.`,
          }, langue)}
        </div>`,
      footer: t({
        fr: `Vous ne recevrez ce message qu'une seule fois, et aucune relance ne suivra.`,
        en: `You will only receive this message once, and no reminder will follow.`,
        de: `Sie erhalten diese Nachricht nur ein einziges Mal, und es folgt keine Erinnerung.`,
      }, langue),
    }),
  }
}

// ---------- Vers le participant, le lendemain de la révélation ----------
// Ceux-là sont invisibles pour la question posée dans l'album, et ce sont
// probablement ceux qui ont rencontré le plus de difficultés : c'est
// exactement pour eux que ce mail existe.
export function surveyInviteEmail({ eventName, link, stopLink, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  const accr = accroche(langue)
  return {
    subject: t({
      fr: `Vous faites partie des 1000 premiers : 30 secondes ?`,
      en: `You are one of our first 1,000: 30 seconds?`,
      de: `Sie gehören zu den ersten 1.000: Haben Sie 30 Sekunden?`,
    }, langue),
    html: layout({
      langue,
      title: t({ fr: 'Dites-nous ce que vous en avez pensé', en: 'Tell us what you thought', de: 'Sagen Sie uns Ihre Meinung' }, langue),
      intro: t({
        fr: `Vous avez participé à l'album de « <strong>${eventName}</strong> ». ${accr} Votre avis nous aide à corriger ce qui ne va pas encore.`,
        en: `You took part in the album for “<strong>${eventName}</strong>”. ${accr} Your feedback helps us fix what is not working yet.`,
        de: `Sie haben beim Album von „<strong>${eventName}</strong>“ mitgemacht. ${accr} Ihre Meinung hilft uns, zu verbessern, was noch nicht rund läuft.`,
      }, langue),
      body: `${bigButton(link, t({ fr: 'Répondre (30 secondes) →', en: 'Answer (30 seconds) →', de: 'Antworten (30 Sekunden) →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${t({
            fr: `Trois questions rapides, et un espace pour nous dire librement
          ce que vous en avez pensé : c'est celui qu'on lit en premier.`,
            en: `Three quick questions, and a space to tell us freely
          what you thought: that is the one we read first.`,
            de: `Drei kurze Fragen und ein Feld, in dem Sie uns frei sagen können,
          was Sie davon halten: Das lesen wir als Erstes.`,
          }, langue)}
        </div>`,
      footer: t({
        fr: `Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement. C'est le seul message de ce type que nous vous enverrons, et aucune relance ne suivra. <a href="${stopLink}" style="color:#8a7c69;">Ne plus recevoir de message de ce type</a>.`,
        en: `You are receiving this message because you left your email address when joining this event. It is the only message of this kind we will send you, and no reminder will follow. <a href="${stopLink}" style="color:#8a7c69;">Stop receiving messages like this</a>.`,
        de: `Sie erhalten diese Nachricht, weil Sie beim Beitritt zu diesem Event Ihre E-Mail-Adresse angegeben haben. Es ist die einzige Nachricht dieser Art, die wir Ihnen schicken, und es folgt keine Erinnerung. <a href="${stopLink}" style="color:#8a7c69;">Keine Nachrichten dieser Art mehr erhalten</a>.`,
      }, langue),
    }),
  }
}

// ---------- Vers vous : ce qui ne peut pas attendre demain ----------
function ligne(cle, valeur) {
  if (!valeur) return ''
  return `<tr>
    <td style="font-size:13px;color:#8a7c69;padding:4px 12px 4px 0;vertical-align:top;white-space:nowrap;">${cle}</td>
    <td style="font-size:14px;color:#221A12;padding:4px 0;">${valeur}</td>
  </tr>`
}

function noteLisible(n) {
  const trouve = NOTES.find((x) => x.valeur === n)
  return trouve ? `${n}/5 ${trouve.mot}` : null
}

function soucisLisibles(issues) {
  const vrais = (issues || []).filter((i) => i !== 'ok')
  if (!vrais.length) return null
  return vrais.map((i) => `⚠️ ${libelle(i)}`).join('<br>')
}

export async function alerterAdmin({ avis, eventName, guestName }) {
  const qui = avis.role === 'organisateur'
    ? 'L’organisateur'
    : guestName ? `${guestName} (participant)` : 'Un participant'
  const soucis = soucisLisibles(avis.issues)

  const corps = `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
    ${ligne('Événement', eventName || '-')}
    ${ligne('Qui', qui)}
    ${ligne('Arrivé par', { mail: 'le mail d’enquête', app: 'l’app iPhone', extrait: 'l’extrait d’app' }[avis.canal] || 'l’album (site)')}
    ${ligne('Note', noteLisible(avis.rating))}
    ${ligne('Recommandation', Number.isFinite(avis.nps) ? `${avis.nps}/10` : null)}
    ${ligne('Pourquoi', avis.nps_reason)}
    ${ligne('Problèmes', soucis)}
    ${ligne('Détail', avis.issue_detail)}
    ${ligne('Ce qui a plu', avis.favorite ? libelle(avis.favorite) : null)}
    ${ligne('En toutes lettres', avis.suggestion)}
    ${ligne('Connu par', avis.source ? libelle(avis.source) : null)}
    ${ligne('Referait ?', avis.would_host)}
    ${ligne('Appareil', resumeAppareil(avis.device))}
    ${ligne('Rappel accepté', avis.call_ok ? (avis.phone || 'oui, sans numéro') : null)}
    ${ligne('Son adresse', avis.contact_email)}
  </table>`

  const mail = {
    subject: soucis
      ? `⚠️ Problème signalé : ${eventName || 'événement'}`
      : `Nouvel avis : ${eventName || 'événement'}`,
    html: layout({
      title: soucis ? 'Un problème vient d’être signalé' : 'Nouvel avis',
      intro: soucis
        ? `Quelqu’un a coché une difficulté en répondant à l’enquête.`
        : `Une réponse vient d’arriver.`,
      body: `${corps}
        <div style="padding-top:22px;">${bigButton(`${siteUrl()}/admin/avis`, 'Voir tous les avis →')}</div>`,
      footer: `Les avis sans problème et sans note basse ne déclenchent pas d’alerte : vous les retrouvez dans le récap du lendemain.`,
    }),
  }
  return sendMail({ to: adminEmail(), subject: mail.subject, html: mail.html })
}

// ---------- Vers vous : le récap du lendemain ----------
// Tout ce qui n'a pas alerté. Envoyé seulement s'il y a de quoi le remplir : 
// un récap quotidien vide finit par ne plus être ouvert du tout.
export async function recapAdmin(avisDuJour) {
  const liste = Array.isArray(avisDuJour) ? avisDuJour : []
  if (!liste.length) return { ok: false, error: 'rien-a-dire' }

  const notes = liste.map((a) => a.rating).filter((n) => Number.isFinite(n))
  const moyenne = notes.length ? (notes.reduce((s, n) => s + n, 0) / notes.length).toFixed(1) : null
  const npsList = liste.map((a) => a.nps).filter((n) => Number.isFinite(n))
  const npsMoyen = npsList.length ? (npsList.reduce((s, n) => s + n, 0) / npsList.length).toFixed(1) : null
  const problemes = liste.filter((a) => (a.issues || []).some((i) => i !== 'ok')).length
  const mots = liste
    .map((a) => a.suggestion || a.nps_reason || a.issue_detail)
    .filter(Boolean)
    .slice(0, 8)

  const stat = (v, l) => `<td align="center" style="padding:10px 6px;">
      <div style="font-size:26px;font-weight:800;color:#221A12;">${v}</div>
      <div style="font-size:12px;color:#8a7c69;">${l}</div>
    </td>`

  const html = layout({
    title: `${liste.length} avis hier`,
    intro: `Voici ce qui est arrivé depuis le dernier récap. Les problèmes signalés vous ont déjà été envoyés à part.`,
    body: `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#FCF8F0;border:1px solid rgba(34,26,18,.12);border-radius:14px;">
        <tr>
          ${stat(liste.length, 'avis')}
          ${stat(moyenne ? `${moyenne}/5` : '-', 'note moyenne')}
          ${stat(npsMoyen ? `${npsMoyen}/10` : '-', 'recommandation')}
          ${stat(problemes, problemes > 1 ? 'problèmes' : 'problème')}
        </tr>
      </table>
      ${mots.length ? `<div style="padding-top:22px;">
        <div style="font-size:14px;font-weight:700;color:#221A12;padding-bottom:8px;">Ce qu'ils ont écrit</div>
        ${mots.map((m) => `<div style="font-size:14px;line-height:1.6;color:#5f5341;border-left:3px solid #EC5B33;padding:2px 0 2px 12px;margin-bottom:10px;">« ${m} »</div>`).join('')}
      </div>` : ''}
      <div style="padding-top:22px;">${bigButton(`${siteUrl()}/admin/avis`, 'Ouvrir la synthèse →')}</div>`,
    footer: `${BRAND.name} : récap automatique, envoyé uniquement les jours où il y a eu des réponses.`,
  })

  return sendMail({ to: adminEmail(), subject: `${liste.length} avis hier | ${BRAND.name}`, html })
}

// ============================================================
//  Les mails de Clément (03/10/2026)
//
//  Écrits à la première personne, signés, sans gros visuels : on répond plus
//  volontiers à quelqu'un qu'à un formulaire, et un mail sobre tombe moins
//  souvent dans les indésirables. On peut y répondre directement : la réponse
//  arrive sur l'adresse de contact.
// ============================================================

export const EXPEDITEUR_CLEMENT = 'Clément de Time to Flash'

function mailPersonnel({ langue, paragraphes, apres = '', footer }) {
  const p = (txt) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#221A12;">${txt}</p>`
  const signature = t({
    fr: 'Clément<br><span style="color:#8a7c69;">Fondateur de Time to Flash</span>',
    en: 'Clément<br><span style="color:#8a7c69;">Founder of Time to Flash</span>',
    de: 'Clément<br><span style="color:#8a7c69;">Gründer von Time to Flash</span>',
  }, langue)
  return `<!doctype html><html lang="${langue || 'fr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;"><tr><td>
${paragraphes.map(p).join('\n')}
${apres}
<p style="margin:22px 0 0;font-size:16px;line-height:1.5;color:#221A12;">${signature}</p>
${footer ? `<p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#a0937f;">${footer}</p>` : ''}
</td></tr></table>
</td></tr></table>
</body></html>`
}

// ---------- L'avis de l'organisateur, le lendemain de la révélation ----------
// Les étoiles sont dans le mail : un clic, la note est enregistrée, et la
// page qui s'ouvre propose la suite (facultative).
export function avisOrgaEmail({ eventName, link, langue }) {
  eventName = nomAffiche(eventName, langue)
  const mots = notes(langue).map((n) => n.mot)
  return {
    subject: t({
      fr: `${eventName} : qu'en avez-vous pensé ?`,
      en: `${eventName}: what did you think?`,
      de: `${eventName}: Wie fanden Sie es?`,
    }, langue),
    html: mailPersonnel({
      langue,
      paragraphes: [
        t({ fr: 'Bonjour,', en: 'Hello,', de: 'Hallo,' }, langue),
        t({
          fr: `Je suis Clément, le fondateur de Time to Flash. Les photos de « <strong>${eventName}</strong> » viennent d'être révélées, et j'aimerais beaucoup savoir comment ça s'est passé pour vous.`,
          en: `I'm Clément, the founder of Time to Flash. The photos from “<strong>${eventName}</strong>” have just been revealed, and I'd really love to know how it went for you.`,
          de: `Ich bin Clément, der Gründer von Time to Flash. Die Fotos von „<strong>${eventName}</strong>“ wurden gerade präsentiert, und ich würde sehr gern wissen, wie es für Sie gelaufen ist.`,
        }, langue),
        t({
          fr: 'Un clic sur une étoile suffit :',
          en: 'One click on a star is all it takes:',
          de: 'Ein Klick auf einen Stern genügt:',
        }, langue),
      ],
      apres: `${etoilesAvis(link, mots)}
<p style="margin:16px 0 0;font-size:15px;line-height:1.6;color:#5f5341;">${t({
        fr: "Et si vous avez deux minutes de plus, dites-moi ce qui vous a plu et ce qui a coincé, ou répondez simplement à ce mail : je lis tout, personnellement.",
        en: 'And if you have two more minutes, tell me what you liked and what went wrong, or simply reply to this email: I read everything myself.',
        de: 'Und wenn Sie zwei Minuten mehr haben, sagen Sie mir, was Ihnen gefallen hat und was gehakt hat, oder antworten Sie einfach auf diese E-Mail: Ich lese alles persönlich.',
      }, langue)}</p>`,
      footer: t({
        fr: "Vous ne recevrez ce message qu'une seule fois.",
        en: 'You will only receive this message once.',
        de: 'Sie erhalten diese Nachricht nur ein einziges Mal.',
      }, langue),
    }),
  }
}

// ---------- Les essais gratuits : le parcours ----------
// Un essai, c'est une soirée en formule gratuite, sans code (voir
// estEssai dans avis-envoi). Deux branches :
//  - aucune photo : « Prenez votre première photo » le lendemain matin
//    (essaiPhotoEmail), puis « comment votre test s'est-il passé ? » après
//    la révélation (essaiEmail) ;
//  - des photos : le lendemain de la révélation, le livre d'or offert pour le
//    vrai événement, 7 jours (offreEssaiEmail), puis un rappel la veille de
//    la fin (rappelOffreEmail).

const lienDiscret = (url, texte) => `<a href="${url}" style="color:#EC5B33;">${texte}</a>`

// Mail 1 : aucune photo le lendemain matin de la création.
export function essaiPhotoEmail({ eventName, lienAppareil, qrUrl, langue }) {
  eventName = nomAffiche(eventName, langue)
  const p = (txt) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5f5341;">${txt}</p>`
  return {
    subject: t({
      fr: 'Prenez votre première photo sur Time to Flash',
      en: 'Take your first photo on Time to Flash',
      de: 'Machen Sie Ihr erstes Foto mit Time to Flash',
    }, langue),
    html: mailPersonnel({
      langue,
      paragraphes: [
        t({ fr: 'Bonjour,', en: 'Hello,', de: 'Hallo,' }, langue),
        t({
          fr: `Je suis Clément, le fondateur de Time to Flash. Vous avez créé « <strong>${eventName}</strong> » hier, mais aucune photo n'a encore été prise.`,
          en: `I'm Clément, the founder of Time to Flash. You created “<strong>${eventName}</strong>” yesterday, but no photos have been taken yet.`,
          de: `Ich bin Clément, der Gründer von Time to Flash. Sie haben gestern „<strong>${eventName}</strong>“ erstellt, aber es wurde noch kein Foto aufgenommen.`,
        }, langue),
        t({
          fr: 'Pour poursuivre votre essai, prenez une ou deux photos maintenant, même de votre café. Vous ne les verrez pas tout de suite. Elles se révéleront à la date prévue, comme le jour de votre vrai événement.',
          en: "To continue your trial, take one or two photos now, even of your coffee. You won't see them straight away. They'll be revealed on the planned date, just like on the day of your real event.",
          de: 'Um Ihren Test fortzusetzen, machen Sie jetzt ein oder zwei Fotos, gern auch von Ihrem Kaffee. Sie sehen sie nicht sofort. Sie werden zum geplanten Termin präsentiert, genau wie am Tag Ihres echten Events.',
        }, langue),
      ],
      apres: `${bigButton(lienAppareil, t({ fr: 'Prendre ma première photo', en: 'Take my first photo', de: 'Mein erstes Foto machen' }, langue))}
<div style="height:18px;"></div>
${p(t({
        fr: "Pour voir l'effet à plusieurs, faites scanner ce QR code à un ou deux proches (montrez-leur simplement votre écran) : vous découvrirez leurs photos en même temps que les vôtres.",
        en: "To see how it feels with others, have one or two people close to you scan this QR code (just show them your screen): you'll discover their photos at the same time as yours.",
        de: 'Um den Effekt zu mehreren zu erleben, lassen Sie ein oder zwei Nahestehende diesen QR-Code scannen (zeigen Sie ihnen einfach Ihren Bildschirm): Sie entdecken deren Fotos zur gleichen Zeit wie Ihre.',
      }, langue))}
<div style="text-align:center;margin:0 0 18px;">
  <img src="${qrUrl}" width="180" height="180" alt="QR code" style="display:inline-block;border:1px solid #eadfcc;border-radius:12px;padding:8px;background:#fff;">
  <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#5f5341;">${t({
    fr: `Ou envoyez-leur ${lienDiscret(lienAppareil, 'le lien de votre événement')}.`,
    en: `Or send them ${lienDiscret(lienAppareil, 'your event link')}.`,
    de: `Oder schicken Sie ihnen ${lienDiscret(lienAppareil, 'den Link zu Ihrem Event')}.`,
  }, langue)}</p>
</div>
${p(t({
        fr: 'Un souci ou une question ? Répondez simplement à ce mail, je lis tout personnellement.',
        en: 'A problem or a question? Just reply to this email, I read everything myself.',
        de: 'Ein Problem oder eine Frage? Antworten Sie einfach auf diese E-Mail, ich lese alles persönlich.',
      }, langue))}`,
      footer: t({
        fr: "Si aucune photo n'est prise, je ne vous écrirai qu'une dernière fois, après la date de révélation.",
        en: "If no photos are taken, I'll only write to you once more, after the reveal date.",
        de: 'Wenn kein Foto aufgenommen wird, schreibe ich Ihnen nur noch ein letztes Mal, nach dem Präsentationstermin.',
      }, langue),
    }),
  }
}

// Mail 2 : la révélation est passée, toujours aucune photo. Cinq réponses,
// chacune un lien : un clic et c'est dit.
export function essaiEmail({ eventName, lien, langue }) {
  eventName = nomAffiche(eventName, langue)
  const sep = lien.includes('?') ? '&' : '?'
  const choix = [
    ['decouverte', t({ fr: "Je voulais juste découvrir l'interface", en: 'I just wanted to explore the interface', de: 'Ich wollte mir nur die Oberfläche ansehen' }, langue)],
    ['test', t({ fr: 'Je teste avant mon vrai événement', en: "I'm testing before my real event", de: 'Ich teste vor meinem echten Event' }, langue)],
    ['temps', t({ fr: "Je n'ai pas encore eu le temps", en: "I haven't had the time yet", de: 'Ich hatte noch keine Zeit' }, langue)],
    ['souci', t({ fr: "J'ai eu un souci", en: 'I ran into a problem', de: 'Ich hatte ein Problem' }, langue)],
    ['pas_pour_moi', t({ fr: "Ce n'est pas pour moi", en: "It's not for me", de: 'Das ist nichts für mich' }, langue)],
  ]
  const boutons = choix.map(([cle, label]) => `<tr><td style="padding:0 0 10px;">
  <a href="${lien}${sep}r=${cle}" style="display:block;background:#F4EBDA;color:#221A12;text-decoration:none;font-size:15px;font-weight:600;padding:14px 16px;border-radius:12px;border:1px solid #e3d6bf;">${label} →</a>
</td></tr>`).join('')
  return {
    subject: t({
      fr: `Time to Flash - « ${eventName} » : comment votre test s'est-il passé ?`,
      en: `Time to Flash - “${eventName}”: how did your test go?`,
      de: `Time to Flash - „${eventName}“: Wie ist Ihr Test gelaufen?`,
    }, langue),
    html: mailPersonnel({
      langue,
      paragraphes: [
        t({ fr: 'Bonjour,', en: 'Hello,', de: 'Hallo,' }, langue),
        t({
          fr: `C'est Clément, le fondateur de Time to Flash. Votre événement « <strong>${eventName}</strong> » est terminé, et aucune photo n'a été prise. Ça arrive, et j'aimerais comprendre pourquoi, pour améliorer le service.`,
          en: `It's Clément, the founder of Time to Flash. Your event “<strong>${eventName}</strong>” is over, and no photos were taken. It happens, and I'd like to understand why, to improve the service.`,
          de: `Hier ist Clément, der Gründer von Time to Flash. Ihr Event „<strong>${eventName}</strong>“ ist vorbei, und es wurden keine Fotos aufgenommen. Das kommt vor, und ich möchte verstehen, warum, um den Dienst zu verbessern.`,
        }, langue),
        t({ fr: 'Où en êtes-vous ? Un clic suffit :', en: 'Where are you at? One click is enough:', de: 'Wie sieht es aus? Ein Klick genügt:' }, langue),
      ],
      apres: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${boutons}</table>
<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#5f5341;">${t({
        fr: 'Vous pouvez aussi répondre directement à ce mail, je lis tout personnellement.',
        en: 'You can also reply directly to this email, I read everything myself.',
        de: 'Sie können auch direkt auf diese E-Mail antworten, ich lese alles persönlich.',
      }, langue)}</p>`,
      footer: t({ fr: 'Ce sera mon dernier message à ce sujet.', en: 'This will be my last message about this.', de: 'Das ist meine letzte Nachricht dazu.' }, langue),
    }),
  }
}

// « mercredi 21 octobre », à l'heure de Paris, dans la langue de l'organisateur.
function jourLisible(iso, langue) {
  try {
    return new Date(iso).toLocaleDateString(LOCALES[langue] || 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' })
  } catch { return '' }
}

const prixLivreOr = (langue) => formatPrice(LIVRE_OR_CENTS, langue)

// Mail 3 : l'essai a donné des photos. Le livre d'or offert pour le vrai
// événement, 7 jours. Remplace pour les essais le mail d'avis aux étoiles.
export function offreEssaiEmail({ eventName, photoCount, lienCreer, fin, langue }) {
  eventName = nomAffiche(eventName, langue)
  const n = photoCount
  const p = (txt) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5f5341;">${txt}</p>`
  const jour = jourLisible(fin, langue)
  return {
    subject: n > 1
      ? t({
          fr: `Vos ${n} photos sont révélées. Et pour le vrai événement ?`,
          en: `Your ${n} photos are revealed. What about the real event?`,
          de: `Ihre ${n} Fotos sind präsentiert. Und das echte Event?`,
        }, langue)
      : t({
          fr: 'Votre photo est révélée. Et pour le vrai événement ?',
          en: 'Your photo is revealed. What about the real event?',
          de: 'Ihr Foto ist präsentiert. Und das echte Event?',
        }, langue),
    html: mailPersonnel({
      langue,
      paragraphes: [
        t({ fr: 'Bonjour,', en: 'Hello,', de: 'Hallo,' }, langue),
        n > 1
          ? t({
              fr: `C'est Clément, le fondateur de Time to Flash. Les ${n} photos de « <strong>${eventName}</strong> » viennent d'être révélées : vous avez vu le principe en vrai.`,
              en: `It's Clément, the founder of Time to Flash. The ${n} photos from “<strong>${eventName}</strong>” have just been revealed: you've seen the idea for real.`,
              de: `Hier ist Clément, der Gründer von Time to Flash. Die ${n} Fotos von „<strong>${eventName}</strong>“ wurden gerade präsentiert: Sie haben das Prinzip live erlebt.`,
            }, langue)
          : t({
              fr: `C'est Clément, le fondateur de Time to Flash. La photo de « <strong>${eventName}</strong> » vient d'être révélée : vous avez vu le principe en vrai.`,
              en: `It's Clément, the founder of Time to Flash. The photo from “<strong>${eventName}</strong>” has just been revealed: you've seen the idea for real.`,
              de: `Hier ist Clément, der Gründer von Time to Flash. Das Foto von „<strong>${eventName}</strong>“ wurde gerade präsentiert: Sie haben das Prinzip live erlebt.`,
            }, langue),
        t({
          fr: "Imaginez maintenant la même chose avec tous vos invités : le lendemain, vous découvrez l'événement à travers les yeux de chacun.",
          en: 'Now imagine the same thing with all your guests: the next day, you discover the event through everyone\'s eyes.',
          de: 'Stellen Sie sich das jetzt mit all Ihren Gästen vor: Am nächsten Tag erleben Sie das Event durch die Augen jedes Einzelnen.',
        }, langue),
        t({
          fr: `Pour votre vrai événement, je vous offre <strong>le livre d'or audio</strong> (${prixLivreOr(langue)} d'habitude) : chaque invité vous laisse un message vocal et un selfie, que vous découvrez après l'événement.`,
          en: `For your real event, I'm giving you <strong>the audio guestbook</strong> (usually ${prixLivreOr(langue)}): each guest leaves you a voice message and a selfie, which you discover after the event.`,
          de: `Für Ihr echtes Event schenke ich Ihnen <strong>das Audio-Gästebuch</strong> (sonst ${prixLivreOr(langue)}): Jeder Gast hinterlässt Ihnen eine Sprachnachricht und ein Selfie, die Sie nach dem Event entdecken.`,
        }, langue),
      ],
      apres: `${bigButton(lienCreer, t({ fr: 'Créer mon vrai événement', en: 'Create my real event', de: 'Mein echtes Event erstellen' }, langue))}
<div style="height:18px;"></div>
${p(t({
        fr: `L'offre est valable jusqu'au <strong>${jour}</strong> inclus. Vous ne connaissez pas encore le nombre exact d'invités ? Aucun problème : réservez maintenant, vous pourrez agrandir la formule plus tard depuis votre tableau de bord.`,
        en: `The offer is valid until <strong>${jour}</strong> inclusive. Don't know the exact number of guests yet? No problem: book now, you can upgrade your plan later from your dashboard.`,
        de: `Das Angebot gilt bis einschließlich <strong>${jour}</strong>. Sie kennen die genaue Gästezahl noch nicht? Kein Problem: Buchen Sie jetzt, Sie können Ihr Paket später in Ihrem Dashboard vergrößern.`,
      }, langue))}
${p(t({
        fr: 'Et si vous avez un avis sur cet essai, bon ou mauvais, répondez simplement à ce mail : je lis tout personnellement.',
        en: 'And if you have any thoughts on this trial, good or bad, just reply to this email: I read everything myself.',
        de: 'Und wenn Sie eine Meinung zu diesem Test haben, ob gut oder schlecht, antworten Sie einfach auf diese E-Mail: Ich lese alles persönlich.',
      }, langue))}`,
      footer: t({
        fr: "Je ne vous écrirai qu'une fois de plus à ce sujet, la veille de la fin de l'offre.",
        en: "I'll only write to you once more about this, the day before the offer ends.",
        de: 'Ich schreibe Ihnen dazu nur noch einmal, am Tag vor Ablauf des Angebots.',
      }, langue),
    }),
  }
}

// Mail 4 : la veille de la fin de l'offre, si rien n'a été créé entre-temps.
export function rappelOffreEmail({ lienCreer, fin, langue }) {
  const jour = jourLisible(fin, langue)
  const cellule = 'padding:8px 14px;border-top:1px solid #f0e7d8;'
  const lignes = TIERS.filter((x) => x.priceCents > 0).map((x) => `<tr><td style="${cellule}">${t({
    fr: `${x.maxGuests} invités`, en: `${x.maxGuests} guests`, de: `${x.maxGuests} Gäste`,
  }, langue)}</td><td style="${cellule}text-align:right;">${formatPrice(x.priceCents, langue)}</td></tr>`).join('')
  const tableau = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:1px solid #eadfcc;border-radius:12px;border-collapse:separate;font-size:15px;color:#221A12;">
<tr style="background:#FBF6EE;"><td style="padding:10px 14px;color:#8a7c69;font-weight:600;">${t({ fr: "Jusqu'à", en: 'Up to', de: 'Bis zu' }, langue)}</td><td style="padding:10px 14px;color:#8a7c69;font-weight:600;text-align:right;">${t({ fr: 'Prix (paiement unique)', en: 'Price (one-off payment)', de: 'Preis (einmalige Zahlung)' }, langue)}</td></tr>
${lignes}
<tr style="background:#FFF4EF;"><td style="${cellule}font-weight:700;">${t({ fr: "Livre d'or audio", en: 'Audio guestbook', de: 'Audio-Gästebuch' }, langue)}</td><td style="${cellule}text-align:right;"><s style="color:#a0937f;">${prixLivreOr(langue)}</s> <strong style="color:#EC5B33;">${t({ fr: 'offert', en: 'free', de: 'geschenkt' }, langue)}</strong></td></tr>
</table>`
  const p = (txt) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5f5341;">${txt}</p>`
  return {
    subject: t({
      fr: "Votre livre d'or offert s'arrête demain",
      en: 'Your free audio guestbook ends tomorrow',
      de: 'Ihr geschenktes Audio-Gästebuch endet morgen',
    }, langue),
    html: mailPersonnel({
      langue,
      paragraphes: [
        t({ fr: 'Bonjour,', en: 'Hello,', de: 'Hallo,' }, langue),
        t({
          fr: `Un petit rappel : le livre d'or audio que je vous ai offert pour votre événement (<strong>${prixLivreOr(langue)}</strong> d'habitude) est valable jusqu'à demain, <strong>${jour}</strong>.`,
          en: `A quick reminder: the audio guestbook I gave you for your event (usually <strong>${prixLivreOr(langue)}</strong>) is valid until tomorrow, <strong>${jour}</strong>.`,
          de: `Eine kurze Erinnerung: Das Audio-Gästebuch, das ich Ihnen für Ihr Event geschenkt habe (sonst <strong>${prixLivreOr(langue)}</strong>), gilt bis morgen, <strong>${jour}</strong>.`,
        }, langue),
      ],
      apres: `${p(t({
        fr: "Pour vous donner une idée, voici le prix des formules. Le livre d'or offert vaut souvent plus que la formule elle-même :",
        en: "To give you an idea, here are the plan prices. The free guestbook is often worth more than the plan itself:",
        de: 'Zur Orientierung hier die Preise der Pakete. Das geschenkte Gästebuch ist oft mehr wert als das Paket selbst:',
      }, langue))}
${tableau}
${bigButton(lienCreer, t({ fr: 'Créer mon vrai événement', en: 'Create my real event', de: 'Mein echtes Event erstellen' }, langue))}
<div style="height:18px;"></div>
${p(t({
        fr: "Pas besoin de connaître le nombre d'invités ni d'avoir tout organisé : vous réservez votre date aujourd'hui, et vous ajustez le reste quand vous voulez.",
        en: "No need to know the number of guests or to have everything planned: book your date today, and adjust the rest whenever you like.",
        de: 'Sie müssen weder die Gästezahl kennen noch alles geplant haben: Sie reservieren Ihr Datum heute und passen den Rest an, wann Sie wollen.',
      }, langue))}`,
      footer: t({ fr: "C'est mon dernier message à ce sujet.", en: 'This is my last message about this.', de: 'Das ist meine letzte Nachricht dazu.' }, langue),
    }),
  }
}

// Le bouton « Créer mon vrai événement » : la création, avec le cadeau
// attaché. Le jeton est la clé d'avis de l'essai (rien de plus n'est exposé).
export function lienCadeau(cleAvis, langue) {
  return `${siteUrl()}${lienLangue('/create', langue)}?cadeau=${encodeURIComponent(cleAvis)}`
}

export function lienRetourEssai(cleAvis) {
  return `${siteUrl()}/retour-essai?o=${encodeURIComponent(cleAvis)}`
}
