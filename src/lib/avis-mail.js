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
import { CONTACT_EMAIL } from './pricing'
import { sendMail, layout, bigButton, siteUrl, etoilesAvis } from './mail'
import { accroche, libelle, resumeAppareil, NOTES, notes } from './avis'
import { t } from './i18n'
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

// ---------- Les essais : soirée gratuite, aucune photo ----------
// Le lendemain matin de la création (`relance: false`), puis une dernière
// fois si la soirée s'est terminée sans photo ni réponse (`relance: true`).
// Quatre réponses, chacune un lien : un clic et c'est dit.
export function essaiEmail({ eventName, lien, langue, relance = false }) {
  eventName = nomAffiche(eventName, langue)
  const sep = lien.includes('?') ? '&' : '?'
  const choix = [
    ['test', t({ fr: 'Je teste avant ma vraie soirée', en: "I'm testing before my real event", de: 'Ich teste vor meinem echten Event' }, langue)],
    ['temps', t({ fr: "Je n'ai pas encore eu le temps", en: "I haven't had the time yet", de: 'Ich hatte noch keine Zeit' }, langue)],
    ['souci', t({ fr: "J'ai eu un souci", en: 'I ran into a problem', de: 'Ich hatte ein Problem' }, langue)],
    ['pas_pour_moi', t({ fr: "Ce n'est pas pour moi", en: "It's not for me", de: 'Das ist nichts für mich' }, langue)],
  ]
  const boutons = choix.map(([cle, label]) => `<tr><td style="padding:0 0 10px;">
  <a href="${lien}${sep}r=${cle}" style="display:block;background:#F4EBDA;color:#221A12;text-decoration:none;font-size:15px;font-weight:600;padding:14px 16px;border-radius:12px;border:1px solid #e3d6bf;">${label} →</a>
</td></tr>`).join('')
  return {
    subject: relance
      ? t({ fr: `${eventName} : que s'est-il passé ?`, en: `${eventName}: what happened?`, de: `${eventName}: Was ist passiert?` }, langue)
      : t({ fr: 'Vous avez pu essayer Time to Flash ?', en: 'Did you get to try Time to Flash?', de: 'Konnten Sie Time to Flash ausprobieren?' }, langue),
    html: mailPersonnel({
      langue,
      paragraphes: [
        t({ fr: 'Bonjour,', en: 'Hello,', de: 'Hallo,' }, langue),
        relance
          ? t({
              fr: `C'est Clément, le fondateur de Time to Flash. Votre soirée « <strong>${eventName}</strong> » est terminée, et aucune photo n'a été prise. Ça arrive, et j'aimerais comprendre pourquoi, pour améliorer le service.`,
              en: `It's Clément, the founder of Time to Flash. Your event “<strong>${eventName}</strong>” is over, and no photos were taken. It happens, and I'd like to understand why, to improve the service.`,
              de: `Hier ist Clément, der Gründer von Time to Flash. Ihr Event „<strong>${eventName}</strong>“ ist vorbei, und es wurden keine Fotos aufgenommen. Das kommt vor, und ich möchte verstehen, warum, um den Dienst zu verbessern.`,
            }, langue)
          : t({
              fr: `Je suis Clément, le fondateur de Time to Flash. Vous avez créé « <strong>${eventName}</strong> » hier, et je voulais savoir si vous aviez pu l'essayer.`,
              en: `I'm Clément, the founder of Time to Flash. You created “<strong>${eventName}</strong>” yesterday, and I wanted to know if you got to try it.`,
              de: `Ich bin Clément, der Gründer von Time to Flash. Sie haben gestern „<strong>${eventName}</strong>“ erstellt, und ich wollte wissen, ob Sie es ausprobieren konnten.`,
            }, langue),
        t({ fr: 'Où en êtes-vous ? Un clic suffit :', en: 'Where are you at? One click is enough:', de: 'Wie sieht es aus? Ein Klick genügt:' }, langue),
      ],
      apres: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${boutons}</table>
<p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#5f5341;">${t({
        fr: 'Vous pouvez aussi répondre directement à ce mail, je lis tout personnellement.',
        en: 'You can also reply directly to this email, I read everything myself.',
        de: 'Sie können auch direkt auf diese E-Mail antworten, ich lese alles persönlich.',
      }, langue)}</p>`,
      footer: relance
        ? t({ fr: 'Ce sera mon dernier message à ce sujet.', en: 'This will be my last message about this.', de: 'Das ist meine letzte Nachricht dazu.' }, langue)
        : t({ fr: "Si vous ne répondez pas, je ne vous écrirai qu'une dernière fois, après la date de votre soirée.", en: "If you don't reply, I'll only write once more, after the date of your event.", de: 'Wenn Sie nicht antworten, schreibe ich Ihnen nur noch einmal, nach dem Datum Ihres Events.' }, langue),
    }),
  }
}

export function lienRetourEssai(cleAvis) {
  return `${siteUrl()}/retour-essai?o=${encodeURIComponent(cleAvis)}`
}
