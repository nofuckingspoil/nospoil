// ============================================================
//  Envoi de mails transactionnels via Brevo.
//  À n'utiliser QUE dans les routes API (clé secrète).
// ============================================================
import 'server-only'
import { BRAND, marque } from './brand'
import { CONTACT_EMAIL } from './pricing'
import { t, langueValide, LOCALES } from './i18n'
import { lien } from './langue-lien'
import { nomAffiche } from './event-defaults'
import { adresseSansMessagerie } from './email-domaine'
import { selectRows } from './supabase'
import { notes } from './avis'

const API = 'https://api.brevo.com/v3/smtp/email'

// Domaines réservés à la démonstration (RFC 2606 / 6761) : aucune boîte n'existe
// derrière. Un envoi y revient en « hard bounce », et ces retours se comptent
// contre la réputation du domaine expéditeur : quelques-uns suffisent à faire
// tomber les vrais messages en spam. Les jeux d'essai laissés en base ne doivent
// donc jamais atteindre l'API : on les arrête ici plutôt que chez Brevo.
const DOMAINES_FICTIFS = /@(?:[^@]*\.)?(?:example\.(?:com|org|net)|test|invalid|localhost|local)$/i

export function adresseFictive(email) {
  return DOMAINES_FICTIFS.test(String(email || '').trim())
}

// Adresse du site telle qu'elle apparaît aux clients.
const CANONIQUE = 'https://timetoflash.fr'

// SITE_URL permet de surcharger cette adresse, mais elle survit mal aux
// changements de domaine : restée braquée sur l'adresse technique de
// déploiement (*.vercel.app), elle envoyait aux clients des liens portant
// l'ancien nom de la marque. On ne laisse jamais ces adresses sortir.
export function siteUrl() {
  const brut = (process.env.SITE_URL || '').trim().replace(/\/$/, '')
  if (!brut) return CANONIQUE
  try {
    if (/\.vercel\.app$/i.test(new URL(brut).hostname)) return CANONIQUE
  } catch {
    return CANONIQUE // valeur inexploitable : mieux vaut le domaine connu
  }
  return brut
}

// La version texte d'un mail HTML, quand l'appelant n'en fournit pas. Un mail
// sans version texte est plus suspect aux yeux des filtres anti-spam.
function texteDepuisHtml(html) {
  return String(html || '')
    .replace(/<(style|head)[\s\S]*?<\/\1>/gi, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, url, txt) => `${txt.replace(/<[^>]+>/g, '').trim()} (${url})`)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|li|table)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/^[ \t]+|[ \t]+$/gm, '').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Envoie un mail. Ne fait jamais planter l'appelant : renvoie { ok, error }.
//
// `desinscription` : l'adresse qui désinscrit en un clic (mails aux
// participants qu'ils n'ont pas réclamés). Gmail et Yahoo l'exigent des
// expéditeurs réguliers, et l'affichent en haut du mail : la personne qui ne
// veut plus de nos messages se désinscrit au lieu de cliquer sur « Spam », ce
// qui abîmerait la réputation de tout le domaine. Sans elle, une adresse de
// contact fait office de désinscription.
// Dans le doute (base injoignable), on envoie : un code de connexion
// perdu coûte plus cher qu'un refus de Brevo.
async function adresseEcartee(to) {
  try {
    const e = encodeURIComponent(String(to || '').trim().toLowerCase())
    const { data } = await selectRows('guests', `email=eq.${e}&or=(email_ko_at.not.is.null,email_desinscrit_at.not.is.null)&select=id&limit=1`)
    return Array.isArray(data) && data.length > 0
  } catch { return false }
}

export async function sendMail({ to, subject, html, text, desinscription }) {
  const key = process.env.BREVO_API_KEY
  const from = process.env.BREVO_SENDER_EMAIL
  if (!key || !from) {
    console.error('mail: configuration Brevo manquante (BREVO_API_KEY / BREVO_SENDER_EMAIL)')
    return { ok: false, error: 'mail-not-configured' }
  }
  if (adresseFictive(to)) {
    console.warn('mail: adresse de démonstration ignorée', to)
    return { ok: false, error: 'test-address' }
  }
  // Domaine sans messagerie (« hotmail.fom ») : Brevo le classe en rejet
  // temporaire et le retente à chaque envoi, sans jamais le bloquer.
  if (await adresseSansMessagerie(to)) {
    console.warn('mail: domaine sans messagerie, envoi annulé', to)
    return { ok: false, error: 'dead-domain' }
  }
  // Adresse désinscrite ou morte d'après Brevo (voir lib/adresses-brevo) :
  // Brevo refuserait l'envoi, et chaque refus abîme un peu la réputation.
  if (await adresseEcartee(to)) {
    console.warn('mail: adresse désinscrite ou incorrecte, envoi annulé', to)
    return { ok: false, error: 'opted-out' }
  }
  const corps = {
    sender: { email: from, name: BRAND.name },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    // Version texte : elle sert aux clients qui n'affichent pas le HTML,
    // et surtout aux téléphones, qui y lisent le code sans se battre avec
    // la mise en page pour proposer « Saisir le code » au-dessus du clavier.
    textContent: text || texteDepuisHtml(html),
  }
  const enTetes = desinscription
    ? {
        'List-Unsubscribe': `<${desinscription}>, <mailto:${CONTACT_EMAIL}?subject=Desinscription>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      }
    : { 'List-Unsubscribe': `<mailto:${CONTACT_EMAIL}?subject=Desinscription>` }
  const poster = (body) => fetch(API, {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  try {
    let res = await poster({ ...corps, headers: enTetes })
    // Filet de sécurité : si Brevo refusait un jour les en-têtes de
    // désinscription, le mail part quand même sans eux. Un code de
    // vérification qui n'arrive pas bloque toute création d'événement.
    if (res.status === 400) {
      console.error('mail: en-têtes refusés par Brevo, renvoi sans', await res.text().catch(() => ''))
      res = await poster(corps)
    }
    if (res.status >= 300) {
      const detail = await res.text().catch(() => '')
      console.error('mail: échec Brevo', res.status, detail)
      return { ok: false, error: 'send-failed' }
    }
    return { ok: true }
  } catch (err) {
    console.error('mail: erreur réseau', err)
    return { ok: false, error: 'network' }
  }
}

// ---------- Langue des mails ----------
// Chaque mail reçoit `langue` ('fr', 'en', 'de') : celle de l'événement, du
// participant, du compte ou de la commande. Sans langue : le français.
const langueMail = (langue) => langueValide(langue) || 'fr'
const tx = (o, langue) => t(o, langueMail(langue))
const localeMail = (langue) => LOCALES[langueMail(langue)]

// Adresse d'une page vitrine du site, dans la langue du mail.
function pageSite(chemin, langue) {
  return `${siteUrl()}${lien(chemin, langueMail(langue))}`
}

// ---------- Gabarit commun (compatible clients mail : tableaux + styles en ligne) ----------
// Exporté pour les mails d'enquête (voir ./avis-mail), qui doivent avoir
// exactement la même allure que les autres : un questionnaire qui ne ressemble
// pas au reste passe pour un message d'un autre expéditeur.
export function layout({ title, intro, body, footer, logo = false, langue }) {
  // Le logo et l'adresse du site, pour les mails qui présentent une offre :
  // on doit reconnaître l'expéditeur d'un coup d'œil.
  const entete = logo
    ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:10px;"><img src="${siteUrl()}/logo-mail.png" width="36" height="36" alt="Time to Flash" style="display:block;border-radius:9px;" /></td>
        <td style="font-size:15px;font-weight:800;color:#221A12;">timetoflash.fr</td>
      </tr></table>`
    : BRAND.name
  return `<!doctype html><html lang="${langueMail(langue)}"><body style="margin:0;padding:0;background:#E7E1D4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#E7E1D4;padding:32px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#FCF8F0;border-radius:20px;padding:32px 28px;">
        <tr><td style="font-size:13px;letter-spacing:${logo ? '0' : '.12em'};text-transform:${logo ? 'none' : 'uppercase'};color:#EC5B33;font-weight:700;padding-bottom:18px;">${entete}</td></tr>
        <tr><td style="font-size:24px;line-height:1.25;font-weight:800;color:#221A12;padding-bottom:14px;">${title}</td></tr>
        <tr><td style="font-size:15px;line-height:1.6;color:#5f5341;padding-bottom:24px;">${intro}</td></tr>
        <tr><td>${body}</td></tr>
        <tr><td style="font-size:13px;line-height:1.6;color:#8a7c69;padding-top:26px;border-top:1px solid rgba(34,26,18,.1);margin-top:20px;">${footer}</td></tr>
      </table>
      <div style="font-size:12px;color:#8a7c69;padding-top:18px;">${BRAND.name} | ${marque(langueMail(langue)).tagline}</div>
    </td></tr>
  </table>
</body></html>`
}

export function bigButton(url, label) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
    <a href="${url}" style="display:block;background:#EC5B33;color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 24px;border-radius:14px;text-align:center;">${label}</a>
  </td></tr></table>`
}

// Version texte des mails qui portent un code.
//
// L'iPhone (Mail + Safari) sait proposer « Saisir le code » au-dessus du
// clavier, comme pour un SMS, à condition de reconnaître le code dans le
// message. Il le cherche à côté des mots « code de vérification », en début de
// message, et sans rien qui le coupe : d'où cette phrase, toujours la même,
// placée en tête.
function codeEnTexte(code, suite, langue) {
  return tx({
    fr: `Votre code de vérification ${BRAND.name} est ${code}.\n${suite}\n\n` +
      `Ce code est valable 15 minutes et ne sert qu'une fois.`,
    en: `Your ${BRAND.name} verification code is ${code}.\n${suite}\n\n` +
      `This code is valid for 15 minutes and can only be used once.`,
    de: `Ihr ${BRAND.name}-Bestätigungscode lautet ${code}.\n${suite}\n\n` +
      `Dieser Code ist 15 Minuten gültig und kann nur einmal verwendet werden.`,
  }, langue)
}

const CODE_STYLE = 'text-align:center;font-size:34px;font-weight:800;letter-spacing:.2em;text-indent:.2em;color:#221A12;font-family:ui-monospace,Menlo,monospace;'

// ---------- Mail de connexion : bouton + code, les deux marchent ----------
export function loginEmail({ code, link, langue }) {
  return {
    subject: tx({
      fr: `${code} : votre code de connexion ${BRAND.name}`,
      en: `${code}: your ${BRAND.name} sign-in code`,
      de: `${code}: Ihr Anmeldecode für ${BRAND.name}`,
    }, langue),
    text: codeEnTexte(code, tx({
      fr: 'Saisissez-le sur la page ouverte pour accéder à vos événements.',
      en: 'Enter it on the page you have open to access your events.',
      de: 'Geben Sie ihn auf der geöffneten Seite ein, um auf Ihre Events zuzugreifen.',
    }, langue), langue),
    html: layout({
      langue,
      title: tx({ fr: 'Connexion à votre espace', en: 'Sign in to your account', de: 'Anmeldung in Ihrem Bereich' }, langue),
      intro: tx({
        fr: `Votre code de vérification est <strong>${code}</strong>. Ou cliquez sur le bouton ci-dessous pour accéder directement à vos événements.`,
        en: `Your verification code is <strong>${code}</strong>. Or click the button below to go straight to your events.`,
        de: `Ihr Bestätigungscode lautet <strong>${code}</strong>. Oder klicken Sie auf die Schaltfläche unten, um direkt zu Ihren Events zu gelangen.`,
      }, langue),
      body: `${bigButton(link, tx({ fr: 'Me connecter →', en: 'Sign me in →', de: 'Jetzt anmelden →' }, langue))}
        <div style="text-align:center;font-size:14px;color:#8a7c69;padding:22px 0 10px;">${tx({
          fr: 'ou saisissez ce code sur la page ouverte :',
          en: 'or enter this code on the page you have open:',
          de: 'oder geben Sie diesen Code auf der geöffneten Seite ein:',
        }, langue)}</div>
        <div style="${CODE_STYLE}">${code}</div>`,
      footer: tx({
        fr: `Ce lien et ce code sont valables 15 minutes et ne servent qu'une fois.<br>Si vous n'avez pas demandé cette connexion, ignorez ce message.`,
        en: `This link and code are valid for 15 minutes and can only be used once.<br>If you did not request to sign in, you can ignore this message.`,
        de: `Dieser Link und dieser Code sind 15 Minuten gültig und können nur einmal verwendet werden.<br>Wenn Sie diese Anmeldung nicht angefordert haben, ignorieren Sie diese Nachricht einfach.`,
      }, langue),
    }),
  }
}

// ---------- Invitation d'un co-organisateur ----------
// Ne transporte aucun secret : c'est la connexion par mail qui prouvera son
// identité. Un lien d'invitation volé ne donnerait donc accès à rien.
export function adminInviteEmail({ eventName, loginUrl, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  return {
    subject: tx({
      fr: `Vous co-organisez « ${eventName} » sur ${BRAND.name}`,
      en: `You are co-hosting “${eventName}” on ${BRAND.name}`,
      de: `Sie sind Mitgastgeber von „${eventName}“ auf ${BRAND.name}`,
    }, langue),
    html: layout({
      langue,
      title: tx({ fr: 'Vous êtes co-organisateur', en: 'You are a co-host', de: 'Sie sind Mitgastgeber' }, langue),
      intro: tx({
        fr: `On vous a confié la gestion de « <strong>${eventName}</strong> ». Vous pourrez inviter les convives, veiller sur l'album et régler les dates.`,
        en: `You have been asked to help manage “<strong>${eventName}</strong>”. You can invite guests, keep an eye on the album and set the dates.`,
        de: `Ihnen wurde die Verwaltung von „<strong>${eventName}</strong>“ anvertraut. Sie können Gäste einladen, das Album im Blick behalten und die Termine festlegen.`,
      }, langue),
      body: `${bigButton(loginUrl, tx({ fr: 'Accéder à l’événement →', en: 'Go to the event →', de: 'Zum Event →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${tx({
            fr: `Connectez-vous avec <strong style="color:#221A12;">cette adresse mail</strong> : vous recevrez un code, sans mot de passe à retenir.`,
            en: `Sign in with <strong style="color:#221A12;">this email address</strong>: you will receive a code, no password to remember.`,
            de: `Melden Sie sich mit <strong style="color:#221A12;">dieser E-Mail-Adresse</strong> an: Sie erhalten einen Code, ganz ohne Passwort.`,
          }, langue)}
        </div>`,
      footer: tx({
        fr: `Vous avez accès à toute la gestion de l'événement, sauf à sa suppression, qui reste réservée à son organisateur.`,
        en: `You can manage everything about the event except deleting it, which only its host can do.`,
        de: `Sie können das gesamte Event verwalten, außer es zu löschen: Das bleibt dem Gastgeber vorbehalten.`,
      }, langue),
    }),
  }
}

// ---------- Mail de vérification à la création (code seul, avant création) ----------
export function verifyEmail({ code, langue }) {
  return {
    subject: tx({
      fr: `${code} : votre code de vérification ${BRAND.name}`,
      en: `${code}: your ${BRAND.name} verification code`,
      de: `${code}: Ihr Bestätigungscode für ${BRAND.name}`,
    }, langue),
    text: codeEnTexte(code, tx({
      fr: 'Saisissez-le sur la page pour créer votre événement.',
      en: 'Enter it on the page to create your event.',
      de: 'Geben Sie ihn auf der Seite ein, um Ihr Event zu erstellen.',
    }, langue), langue),
    html: layout({
      langue,
      title: tx({ fr: 'Confirmez votre adresse', en: 'Confirm your email address', de: 'Bestätigen Sie Ihre E-Mail-Adresse' }, langue),
      intro: tx({
        fr: `Votre code de vérification est <strong>${code}</strong>. Saisissez-le sur la page pour créer votre événement : il confirme que cette adresse est bien la vôtre.`,
        en: `Your verification code is <strong>${code}</strong>. Enter it on the page to create your event: it confirms that this address really is yours.`,
        de: `Ihr Bestätigungscode lautet <strong>${code}</strong>. Geben Sie ihn auf der Seite ein, um Ihr Event zu erstellen: So bestätigen Sie, dass diese Adresse Ihnen gehört.`,
      }, langue),
      body: `<div style="${CODE_STYLE}">${code}</div>`,
      footer: tx({
        fr: `Ce code est valable 15 minutes et ne sert qu'une fois.<br>Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
        en: `This code is valid for 15 minutes and can only be used once.<br>If you did not make this request, you can ignore this message.`,
        de: `Dieser Code ist 15 Minuten gültig und kann nur einmal verwendet werden.<br>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese Nachricht einfach.`,
      }, langue),
    }),
  }
}

// ---------- Une photo vient d'être signalée ----------
//
// Apple l'exige (règle 1.2) : il faut un moyen de signaler un contenu choquant
// ET une réponse rapide. La réponse rapide, ici, c'est que la photo est retirée
// de l'album SANS ATTENDRE. Ce mail prévient l'organisateur de ce qui a été
// fait, et lui dit comment revenir dessus : c'est lui qui tranche au final,
// c'est sa soirée.
export function photoSignaleeEmail({ eventName, galleryUrl, motif, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  return {
    subject: tx({
      fr: `Une photo a été signalée : ${eventName}`,
      en: `A photo has been reported: ${eventName}`,
      de: `Ein Foto wurde gemeldet: ${eventName}`,
    }, langue),
    html: layout({
      langue,
      title: tx({ fr: 'Une photo a été signalée', en: 'A photo has been reported', de: 'Ein Foto wurde gemeldet' }, langue),
      intro: tx({
        fr: `Un participant de « ${eventName} » a signalé une photo de l'album. ` +
          'Elle a été <strong>masquée immédiatement</strong>, le temps que vous la regardiez.',
        en: `A guest at “${eventName}” has reported a photo in the album. ` +
          'It has been <strong>hidden straight away</strong> until you have had a look.',
        de: `Ein Gast von „${eventName}“ hat ein Foto im Album gemeldet. ` +
          'Es wurde <strong>sofort ausgeblendet</strong>, bis Sie es sich angesehen haben.',
      }, langue),
      body:
        (motif ? `<p style="margin:0 0 14px"><strong>${tx({ fr: 'Motif indiqué :', en: 'Reason given:', de: 'Angegebener Grund:' }, langue)}</strong> ${motif}</p>` : '') +
        tx({
          fr: `<p style="margin:0 0 14px">Vous seul la voyez désormais. Depuis votre album, vous pouvez la ` +
            `<strong>rétablir</strong> si le signalement n'était pas fondé, ou la <strong>supprimer</strong> ` +
            `définitivement.</p>` +
            `<p style="margin:0"><a href="${galleryUrl}">Ouvrir l'album</a></p>`,
          en: `<p style="margin:0 0 14px">Only you can see it now. From your album, you can ` +
            `<strong>restore</strong> it if the report was unfounded, or <strong>delete</strong> it ` +
            `for good.</p>` +
            `<p style="margin:0"><a href="${galleryUrl}">Open the album</a></p>`,
          de: `<p style="margin:0 0 14px">Nur Sie sehen es jetzt noch. In Ihrem Album können Sie es ` +
            `<strong>wiederherstellen</strong>, falls die Meldung unbegründet war, oder endgültig ` +
            `<strong>löschen</strong>.</p>` +
            `<p style="margin:0"><a href="${galleryUrl}">Album öffnen</a></p>`,
        }, langue),
      footer: tx({
        fr: 'Vous recevez ce message parce que vous organisez cet événement. ' +
          'Un doute, une question ? Écrivez-nous à support@timetoflash.fr.',
        en: 'You are receiving this message because you are hosting this event. ' +
          'Any doubts or questions? Write to us at support@timetoflash.fr.',
        de: 'Sie erhalten diese Nachricht, weil Sie dieses Event veranstalten. ' +
          'Zweifel oder Fragen? Schreiben Sie uns an support@timetoflash.fr.',
      }, langue),
    }),
  }
}

// ---------- Code de confirmation pour supprimer un compte ----------
//
// Un code à part, avec ses propres mots : celui de la vérification d'adresse
// annonce « pour créer votre événement », ce qui serait trompeur ici, et même
// inquiétant. Un mail qui ne dit pas ce qu'il autorise est un mauvais mail.
export function deleteAccountEmail({ code, langue }) {
  return {
    subject: tx({
      fr: `${code} : confirmer la suppression de votre compte ${BRAND.name}`,
      en: `${code}: confirm the deletion of your ${BRAND.name} account`,
      de: `${code}: Löschung Ihres ${BRAND.name}-Kontos bestätigen`,
    }, langue),
    text: codeEnTexte(code, tx({
      fr: 'Saisissez-le dans l\'application pour confirmer la suppression de votre compte.',
      en: 'Enter it in the app to confirm the deletion of your account.',
      de: 'Geben Sie ihn in der App ein, um die Löschung Ihres Kontos zu bestätigen.',
    }, langue), langue),
    html: layout({
      langue,
      title: tx({ fr: 'Supprimer votre compte', en: 'Delete your account', de: 'Ihr Konto löschen' }, langue),
      intro: tx({
        fr: `Votre code de vérification est <strong>${code}</strong>. Saisissez-le dans l'application ` +
          'pour confirmer la suppression de votre compte. Cette opération est définitive.',
        en: `Your verification code is <strong>${code}</strong>. Enter it in the app ` +
          'to confirm the deletion of your account. This cannot be undone.',
        de: `Ihr Bestätigungscode lautet <strong>${code}</strong>. Geben Sie ihn in der App ein, ` +
          'um die Löschung Ihres Kontos zu bestätigen. Dieser Vorgang ist endgültig.',
      }, langue),
      body: `<div style="${CODE_STYLE}">${code}</div>`,
      footer: tx({
        fr: 'Ce code est valable 15 minutes et ne sert qu\'une fois.<br>' +
          '<strong>Si vous n\'êtes pas à l\'origine de cette demande, ignorez ce message :</strong> ' +
          'sans ce code, rien ne sera supprimé.',
        en: 'This code is valid for 15 minutes and can only be used once.<br>' +
          '<strong>If you did not make this request, ignore this message:</strong> ' +
          'without this code, nothing will be deleted.',
        de: 'Dieser Code ist 15 Minuten gültig und kann nur einmal verwendet werden.<br>' +
          '<strong>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese Nachricht:</strong> ' +
          'Ohne diesen Code wird nichts gelöscht.',
      }, langue),
    }),
  }
}

// ---------- Alerte avant suppression définitive des photos ----------
// `remaining` : libellé lisible ('un mois' / 'une semaine', ou sa traduction).
// `urgent` : dernière semaine (sinon déduit du libellé français).
// `purgeDate` : date lisible, déjà dans la langue du mail.
export function purgeWarningEmail({ eventName, galleryUrl, remaining, purgeDate, photoCount, urgent: urgentParam, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  const urgent = urgentParam ?? (remaining === 'une semaine' || remaining === 'one week' || remaining === 'eine Woche')
  const count = photoCount > 0
    ? tx({
        fr: `${photoCount} photo${photoCount > 1 ? 's' : ''}`,
        en: `${photoCount} photo${photoCount > 1 ? 's' : ''}`,
        de: `${photoCount} ${photoCount > 1 ? 'Fotos' : 'Foto'}`,
      }, langue)
    : tx({ fr: 'Vos photos', en: 'Your photos', de: 'Ihre Fotos' }, langue)
  return {
    subject: urgent
      ? tx({
          fr: `⏳ Dernière semaine pour récupérer les photos de « ${eventName} »`,
          en: `⏳ Last week to download the photos from “${eventName}”`,
          de: `⏳ Letzte Woche, um die Fotos von „${eventName}“ zu sichern`,
        }, langue)
      : tx({
          fr: `Vos photos de « ${eventName} » seront supprimées dans un mois`,
          en: `Your photos from “${eventName}” will be deleted in one month`,
          de: `Ihre Fotos von „${eventName}“ werden in einem Monat gelöscht`,
        }, langue),
    html: layout({
      langue,
      title: urgent
        ? tx({ fr: `Plus qu'une semaine`, en: `Only one week left`, de: `Nur noch eine Woche` }, langue)
        : tx({ fr: `Encore un mois pour télécharger vos photos`, en: `One more month to download your photos`, de: `Noch ein Monat, um Ihre Fotos herunterzuladen` }, langue),
      intro: tx({
        fr: `${count} de l'événement « <strong>${eventName}</strong> » seront <strong>définitivement supprimées le ${purgeDate}</strong>, comme prévu lors de la création de votre événement.`,
        en: `${count} from the event “<strong>${eventName}</strong>” will be <strong>permanently deleted on ${purgeDate}</strong>, as planned when your event was created.`,
        de: `${count} vom Event „<strong>${eventName}</strong>“ ${photoCount === 1 ? 'wird' : 'werden'} <strong>am ${purgeDate} endgültig gelöscht</strong>, wie bei der Erstellung Ihres Events vorgesehen.`,
      }, langue),
      body: `${bigButton(galleryUrl, tx({ fr: 'Télécharger mes photos →', en: 'Download my photos →', de: 'Meine Fotos herunterladen →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${tx({
            fr: `Téléchargez l'album complet en une fois depuis votre galerie, et conservez-le
          à l'abri (ordinateur, disque externe, cloud).`,
            en: `Download the whole album in one go from your gallery, and keep it
          somewhere safe (computer, external drive, cloud).`,
            de: `Laden Sie das komplette Album in einem Schritt aus Ihrer Galerie herunter und bewahren Sie es
          sicher auf (Computer, externe Festplatte, Cloud).`,
          }, langue)}
        </div>`,
      footer: urgent
        ? tx({
            fr: `Passé le ${purgeDate}, la suppression est définitive et irréversible : nous ne pourrons pas récupérer ces photos.`,
            en: `After ${purgeDate}, the deletion is permanent and cannot be undone: we will not be able to recover these photos.`,
            de: `Nach dem ${purgeDate} ist die Löschung endgültig und unwiderruflich: Wir können diese Fotos dann nicht mehr wiederherstellen.`,
          }, langue)
        : tx({
            fr: `Cette suppression automatique protège la vie privée de vos participants (RGPD). Elle est définitive et irréversible.`,
            en: `This automatic deletion protects your guests' privacy (GDPR). It is permanent and cannot be undone.`,
            de: `Diese automatische Löschung schützt die Privatsphäre Ihrer Gäste (DSGVO). Sie ist endgültig und unwiderruflich.`,
          }, langue),
    }),
  }
}

// ---------- Mail envoyé à la création d'un événement (filet de sécurité) ----------
export function eventCreatedEmail({ eventName, ownerUrl, joinUrl, revealAt, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  const date = (() => {
    try {
      return new Date(revealAt).toLocaleString(localeMail(langue), {
        weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
      })
    } catch { return '' }
  })()
  const lienGuide = `${pageSite('/guide', langue)}?orga=1`
  return {
    subject: tx({
      fr: `Votre événement « ${eventName} » est prêt 🎞️`,
      en: `Your event “${eventName}” is ready 🎞️`,
      de: `Ihr Event „${eventName}“ ist bereit 🎞️`,
    }, langue),
    html: layout({
      langue,
      title: tx({ fr: `« ${eventName} » est en ligne`, en: `“${eventName}” is live`, de: `„${eventName}“ ist online` }, langue),
      intro: tx({
        fr: `Gardez ce mail : c'est votre accès organisateur. Il vous permet de retrouver votre tableau de bord depuis n'importe quel appareil.`,
        en: `Keep this email: it is your host access. It lets you get back to your dashboard from any device.`,
        de: `Bewahren Sie diese E-Mail auf: Sie ist Ihr Gastgeber-Zugang. Damit gelangen Sie von jedem Gerät aus zu Ihrem Dashboard.`,
      }, langue),
      body: `${bigButton(ownerUrl, tx({ fr: 'Ouvrir mon tableau de bord →', en: 'Open my dashboard →', de: 'Mein Dashboard öffnen →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          <strong style="color:#221A12;">${tx({ fr: 'Le lien à donner à vos participants :', en: 'The link to give your guests:', de: 'Der Link für Ihre Gäste:' }, langue)}</strong><br>
          <a href="${joinUrl}" style="color:#C9431F;word-break:break-all;">${joinUrl}</a>
        </div>
        ${date ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;"><strong style="color:#221A12;">${tx({ fr: 'Révélation des photos :', en: 'Photo reveal:', de: 'Enthüllung der Fotos:' }, langue)}</strong><br>${date}</div>` : ''}
        <!-- « Et maintenant ? » est la question qui suit immédiatement la
             création. On y répond ici plutôt que d'alourdir le tableau de bord. -->
        <div style="margin-top:26px;padding:18px 20px;background:#FCF8F0;border:1px solid rgba(34,26,18,.12);border-radius:14px;">
          <div style="font-size:15px;font-weight:700;color:#221A12;margin-bottom:6px;">${tx({ fr: 'Et maintenant, comment ça se passe ?', en: 'So what happens now?', de: 'Und wie geht es jetzt weiter?' }, langue)}</div>
          <div style="font-size:14px;line-height:1.6;color:#5f5341;">
            ${tx({
              fr: `Où poser le QR code, quoi faire dire au micro, ce que voient vos participants
            pendant la soirée, et comment relire l'album avant la révélation.`,
              en: `Where to put the QR code, what to announce on the mic, what your guests see
            during the party, and how to review the album before the reveal.`,
              de: `Wo Sie den QR-Code aufstellen, was am Mikrofon angesagt werden sollte, was Ihre Gäste
            während der Feier sehen und wie Sie das Album vor der Enthüllung durchsehen.`,
            }, langue)}
          </div>
          <div style="padding-top:12px;">
            <a href="${pageSite('/journal/evenement-cree-et-maintenant', langue)}" style="color:#C9431F;font-weight:700;font-size:14px;text-decoration:underline;">${tx({ fr: 'Lire le déroulé complet (6 min) →', en: 'Read the full walkthrough (6 min) →', de: 'Den kompletten Ablauf lesen (6 Min.) →' }, langue)}</a>
          </div>
          <div style="padding-top:10px;font-size:13px;color:#6E6252;">
            ${tx({
              fr: `Pour aller plus loin, <a href="${lienGuide}" style="color:#6E6252;">le guide de l'organisateur</a>
            vous est ouvert : sept chapitres, rien à redonner.`,
              en: `To go further, <a href="${lienGuide}" style="color:#6E6252;">the host's guide</a>
            is open to you: seven chapters, nothing to fill in.`,
              de: `Wenn Sie tiefer einsteigen möchten, steht Ihnen <a href="${lienGuide}" style="color:#6E6252;">der Leitfaden für Gastgeber</a>
            offen: sieben Kapitel, ohne Anmeldung.`,
            }, langue)}
          </div>
          <div style="padding-top:10px;font-size:13px;color:#6E6252;">
            ${tx({
              fr: `Un participant bloqué le jour J ? Gardez
            <a href="${pageSite('/aide', langue)}" style="color:#6E6252;">la page d'aide</a>
            sous la main : elle se transfère telle quelle.`,
              en: `A guest stuck on the day? Keep
            <a href="${pageSite('/aide', langue)}" style="color:#6E6252;">the help page</a>
            handy: you can forward it as it is.`,
              de: `Ein Gast kommt am großen Tag nicht weiter? Halten Sie
            <a href="${pageSite('/aide', langue)}" style="color:#6E6252;">die Hilfeseite</a>
            bereit: Sie können sie einfach weiterleiten.`,
            }, langue)}
          </div>
        </div>`,
      footer: tx({
        fr: `Ne transmettez pas le lien du tableau de bord à vos participants : il donne accès à la gestion de l'événement.`,
        en: `Do not share the dashboard link with your guests: it gives access to managing the event.`,
        de: `Geben Sie den Dashboard-Link nicht an Ihre Gäste weiter: Er ermöglicht die Verwaltung des Events.`,
      }, langue),
    }),
  }
}

// ---------- Rappel le matin de l'événement ----------
// Objectif : que l'organisateur ouvre son tableau de bord au bon moment,
// avec le QR sous la main. C'est le seul rappel avant la fête.
export function eventDayEmail({ eventName, ownerUrl, shotsPerGuest, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  return {
    subject: tx({
      fr: `C'est aujourd'hui : « ${eventName} » 📸`,
      en: `It's today: “${eventName}” 📸`,
      de: `Heute ist es so weit: „${eventName}“ 📸`,
    }, langue),
    html: layout({
      langue,
      title: tx({ fr: `C'est aujourd'hui`, en: `It's today`, de: `Heute ist es so weit` }, langue),
      intro: tx({
        fr: `Vos participants vont pouvoir scanner. Chacun aura <strong>${shotsPerGuest} photos</strong>, pas une de plus, et personne ne verra rien avant la révélation.`,
        en: `Your guests will be able to scan. Each one gets <strong>${shotsPerGuest} photos</strong>, not one more, and nobody will see anything before the reveal.`,
        de: `Ihre Gäste können gleich scannen. Jeder hat <strong>${shotsPerGuest} Fotos</strong>, kein einziges mehr, und niemand sieht etwas vor der Enthüllung.`,
      }, langue),
      body: `${bigButton(ownerUrl, tx({ fr: 'Ouvrir mon tableau de bord →', en: 'Open my dashboard →', de: 'Mein Dashboard öffnen →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${tx({
            fr: `<strong style="color:#221A12;">Les deux choses à ne pas oublier :</strong><br>
          1. Poser les cartons QR là où on passe : l'entrée, le bar, les tables.<br>
          2. Demander à quelqu'un d'annoncer le jeu au début du repas : c'est ce qui fait décoller la participation.`,
            en: `<strong style="color:#221A12;">The two things not to forget:</strong><br>
          1. Put the QR cards where people pass by: the entrance, the bar, the tables.<br>
          2. Ask someone to announce the game at the start of the meal: that is what gets everyone joining in.`,
            de: `<strong style="color:#221A12;">Die zwei Dinge, die Sie nicht vergessen sollten:</strong><br>
          1. Die QR-Karten dort aufstellen, wo alle vorbeikommen: am Eingang, an der Bar, auf den Tischen.<br>
          2. Jemanden bitten, das Spiel zu Beginn des Essens anzukündigen: Das bringt die Teilnahme richtig in Schwung.`,
          }, langue)}
        </div>
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;">
          ${tx({
            fr: `Un retardataire ? Votre tableau de bord affiche le QR en plein écran, à faire scanner directement.`,
            en: `Someone arriving late? Your dashboard shows the QR code full screen, ready to scan.`,
            de: `Jemand kommt später? Ihr Dashboard zeigt den QR-Code im Vollbild an, direkt zum Scannen.`,
          }, langue)}
        </div>`,
      footer: tx({
        fr: `Vous pouvez suivre en direct qui joue et combien de photos ont été prises, depuis votre tableau de bord.`,
        en: `You can follow live who is playing and how many photos have been taken, from your dashboard.`,
        de: `In Ihrem Dashboard sehen Sie live, wer mitmacht und wie viele Fotos schon aufgenommen wurden.`,
      }, langue),
    }),
  }
}

// ---------- Rappel le lendemain : les photos attendent ----------
// C'est ce mail qui déclenche le partage de l'album : sans lui, beaucoup
// d'organisateurs ne reviennent jamais et l'album reste invisible.
export function afterPartyEmail({ eventName, ownerUrl, photoCount, guestCount, revealDate, quota, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  // `quota` (facultatif) : { maxGuests } quand la formule souscrite est dépassée.
  // On le dit ici, le lendemain de la fête : c'est le dernier moment où
  // l'organisateur peut encore agir tranquillement avant la révélation.
  const alerte = quota ? `
    <div style="margin-top:22px;padding:16px;border:2px solid #EC5B33;border-radius:14px;background:#fff;">
      <div style="font-size:15px;font-weight:700;color:#221A12;">${tx({ fr: 'Votre formule est dépassée', en: 'You have gone over your plan', de: 'Ihr Paket ist überschritten' }, langue)}</div>
      <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:6px;">
        ${tx({
          fr: `Vous étiez <strong style="color:#221A12;">${guestCount} participants</strong> pour une formule
        de <strong style="color:#221A12;">${quota.maxGuests}</strong>. Personne n'a été bloqué pendant
        la fête, et toutes les photos sont bien là. En revanche,
        <strong style="color:#221A12;">l'album ne s'ouvrira pas</strong> tant que votre formule
        ne correspond pas au nombre réel de participants. Vous ne réglerez que la différence.`,
          en: `There were <strong style="color:#221A12;">${guestCount} guests</strong> for a plan
        of <strong style="color:#221A12;">${quota.maxGuests}</strong>. Nobody was blocked during
        the party, and all the photos are safe. However,
        <strong style="color:#221A12;">the album will not open</strong> until your plan
        matches the actual number of guests. You only pay the difference.`,
          de: `Sie waren <strong style="color:#221A12;">${guestCount} Gäste</strong> bei einem Paket
        für <strong style="color:#221A12;">${quota.maxGuests}</strong>. Während der Feier wurde niemand
        ausgesperrt, und alle Fotos sind sicher. Allerdings
        <strong style="color:#221A12;">öffnet sich das Album erst</strong>, wenn Ihr Paket
        der tatsächlichen Gästezahl entspricht. Sie zahlen nur die Differenz.`,
        }, langue)}
      </div>
    </div>` : ''

  const invites = tx({
    fr: `${guestCount} participant${guestCount > 1 ? 's ont' : ' a'} joué le jeu hier soir.`,
    en: `${guestCount} guest${guestCount > 1 ? 's' : ''} joined in last night.`,
    de: `${guestCount} ${guestCount > 1 ? 'Gäste haben' : 'Gast hat'} gestern Abend mitgemacht.`,
  }, langue)

  return {
    subject: quota
      ? tx({
          fr: `Action requise avant la révélation : « ${eventName} »`,
          en: `Action needed before the reveal: “${eventName}”`,
          de: `Handlungsbedarf vor der Enthüllung: „${eventName}“`,
        }, langue)
      : tx({
          fr: `${photoCount} photos vous attendent : « ${eventName} »`,
          en: `${photoCount} photos are waiting for you: “${eventName}”`,
          de: `${photoCount} Fotos warten auf Sie: „${eventName}“`,
        }, langue),
    html: layout({
      langue,
      title: tx({
        fr: `${photoCount} photos vous attendent`,
        en: `${photoCount} photos are waiting for you`,
        de: `${photoCount} Fotos warten auf Sie`,
      }, langue),
      intro: tx({
        fr: `${invites} <strong>Vous seul pouvez déjà les voir</strong> : vos participants devront patienter jusqu'à la révélation.`,
        en: `${invites} <strong>Only you can see them for now</strong>: your guests will have to wait until the reveal.`,
        de: `${invites} <strong>Nur Sie können sie schon sehen</strong>: Ihre Gäste müssen sich bis zur Enthüllung gedulden.`,
      }, langue),
      body: `${bigButton(ownerUrl, tx({ fr: 'Voir les photos →', en: 'See the photos →', de: 'Fotos ansehen →' }, langue))}
        ${alerte}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${tx({
            fr: `Profitez-en pour <strong style="color:#221A12;">masquer celles qui gênent</strong> avant que tout le monde les découvre :
          dans l'album, un bouton sur chaque photo suffit.`,
            en: `Take the chance to <strong style="color:#221A12;">hide any awkward ones</strong> before everyone sees them:
          in the album, one button on each photo does it.`,
            de: `Nutzen Sie die Gelegenheit, <strong style="color:#221A12;">unpassende Fotos auszublenden</strong>, bevor alle sie sehen:
          Im Album genügt ein Klick auf jedem Foto.`,
          }, langue)}
        </div>
        ${revealDate ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:14px;"><strong style="color:#221A12;">${tx({ fr: 'Révélation prévue :', en: 'Reveal scheduled for:', de: 'Geplante Enthüllung:' }, langue)}</strong><br>${revealDate}</div>` : ''}`,
      footer: tx({
        fr: `Le jour de la révélation, votre tableau de bord vous proposera un message tout prêt à envoyer à vos participants.`,
        en: `On reveal day, your dashboard will offer you a ready-made message to send to your guests.`,
        de: `Am Tag der Enthüllung schlägt Ihnen Ihr Dashboard eine fertige Nachricht für Ihre Gäste vor.`,
      }, langue),
    }),
  }
}

// ---------- Alerte immédiate : quelqu'un attend à la porte ----------
// Part à la seconde où un participant de trop scanne le QR code. Ce mail est le seul
// lien entre cette personne restée sur le pas de la porte et celui qui peut la
// faire entrer : il doit se lire d'un coup d'œil, au milieu d'une fête, et ne
// demander qu'un seul geste. D'où le prénom dans l'objet : c'est quelqu'un de
// précis qui attend, pas un compteur qui clignote.
// `coOrga` : { ownerName } quand le destinataire est un co-organisateur. Il a
// exactement le même bouton que le propriétaire : il peut régler, et c'est
// heureux : la formule se remplit en pleine soirée, quand celui qui a créé
// l'événement danse ou dort. Une seule chose change, en pied de message : on
// lui dit qui d'autre a été prévenu, pour que deux personnes ne paient pas la
// même chose en même temps.
export function quotaEmail({ eventName, ownerUrl, guestCount, maxGuests, prenom, upgradeMaxGuests, upgradePrice, coOrga, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  const qui = prenom ? `<strong>${prenom}</strong>` : tx({ fr: `Un participant`, en: `A guest`, de: `Ein Gast` }, langue)
  // Pas de palier au-dessus : on est au plus grand format, le tarif se fait à la
  // main. Le bouton mène alors vers nous, pas vers un paiement qui n'existe pas.
  const surMesure = !upgradeMaxGuests
  const offre = surMesure
    ? tx({ fr: 'Nous écrire pour agrandir →', en: 'Write to us to go bigger →', de: 'Schreiben Sie uns für mehr Plätze →' }, langue)
    : tx({
        fr: `Passer à ${upgradeMaxGuests} participants${upgradePrice ? ` (${upgradePrice})` : ''} →`,
        en: `Upgrade to ${upgradeMaxGuests} guests${upgradePrice ? ` (${upgradePrice})` : ''} →`,
        de: `Auf ${upgradeMaxGuests} Gäste erweitern${upgradePrice ? ` (${upgradePrice})` : ''} →`,
      }, langue)
  const objetContact = tx({
    fr: `Plus de ${maxGuests} participants : ${eventName}`,
    en: `More than ${maxGuests} guests: ${eventName}`,
    de: `Mehr als ${maxGuests} Gäste: ${eventName}`,
  }, langue)
  const lienBouton = surMesure ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(objetContact)}` : ownerUrl
  const proprio = coOrga ? coOrga.ownerName : null
  return {
    subject: prenom
      ? tx({
          fr: `${prenom} attend d’entrer : « ${eventName} »`,
          en: `${prenom} is waiting to get in: “${eventName}”`,
          de: `${prenom} wartet auf Einlass: „${eventName}“`,
        }, langue)
      : tx({
          fr: `Un participant attend d’entrer : « ${eventName} »`,
          en: `A guest is waiting to get in: “${eventName}”`,
          de: `Ein Gast wartet auf Einlass: „${eventName}“`,
        }, langue),
    html: layout({
      langue,
      title: prenom
        ? tx({ fr: `${prenom} attend d’entrer`, en: `${prenom} is waiting to get in`, de: `${prenom} wartet auf Einlass` }, langue)
        : tx({ fr: `Un participant attend d’entrer`, en: `A guest is waiting to get in`, de: `Ein Gast wartet auf Einlass` }, langue),
      intro: tx({
        fr: `${qui} vient de scanner le QR code de « <strong>${eventName}</strong> », mais la formule est complète : elle couvre <strong>${maxGuests} participants</strong> et ils sont déjà ${guestCount}.`,
        en: `${qui} has just scanned the QR code for “<strong>${eventName}</strong>”, but the plan is full: it covers <strong>${maxGuests} guests</strong> and there are already ${guestCount}.`,
        de: `${qui} hat gerade den QR-Code von „<strong>${eventName}</strong>“ gescannt, aber das Paket ist voll: Es umfasst <strong>${maxGuests} Gäste</strong>, und es sind bereits ${guestCount}.`,
      }, langue),
      body: `${bigButton(lienBouton, offre)}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${surMesure
            ? tx({
                fr: `Au-delà de ${maxGuests} participants, nous établissons un tarif sur mesure : écrivez-nous et
               nous ouvrons l’accès dans la foulée. <strong style="color:#221A12;">Vos autres participants
               continuent de photographier normalement</strong> pendant ce temps.`,
                en: `Beyond ${maxGuests} guests, we put together a custom price: write to us and
               we will open access right away. <strong style="color:#221A12;">Your other guests
               carry on taking photos as normal</strong> in the meantime.`,
                de: `Ab ${maxGuests} Gästen erstellen wir ein individuelles Angebot: Schreiben Sie uns, und
               wir schalten den Zugang sofort frei. <strong style="color:#221A12;">Ihre anderen Gäste
               fotografieren in der Zwischenzeit ganz normal weiter</strong>.`,
              }, langue)
            : tx({
                fr: `Un seul geste et ${prenom ? 'elle' : 'la personne'} entre aussitôt : son écran s’ouvrira
               tout seul, elle n’a rien à refaire. <strong style="color:#221A12;">Vos autres participants
               continuent de photographier normalement</strong> pendant ce temps.`,
                en: `One tap and ${prenom ? 'they get' : 'the person gets'} in straight away: their screen will open
               on its own, they have nothing to redo. <strong style="color:#221A12;">Your other guests
               carry on taking photos as normal</strong> in the meantime.`,
                de: `Ein einziger Klick, und ${prenom ? prenom : 'die Person'} ist sofort dabei: Der Bildschirm öffnet sich
               von selbst, es muss nichts wiederholt werden. <strong style="color:#221A12;">Ihre anderen Gäste
               fotografieren in der Zwischenzeit ganz normal weiter</strong>.`,
              }, langue)}
        </div>
        ${coOrga ? `<div style="margin-top:20px;padding:14px 16px;background:#FCF8F0;border:1px solid rgba(34,26,18,.12);border-radius:12px;font-size:13.5px;line-height:1.6;color:#5f5341;">
          ${tx({
            fr: `<strong style="color:#221A12;">${proprio || 'L’organisateur'} a reçu la même alerte.</strong>
          Un seul de vous deux a besoin de régler : voyez avec ${proprio || 'lui'} si vous
          êtes ensemble, sinon n’attendez pas : la personne est à la porte.`,
            en: `<strong style="color:#221A12;">${proprio || 'The host'} has received the same alert.</strong>
          Only one of you needs to pay: check with ${proprio || 'them'} if you
          are together, otherwise do not wait: the person is at the door.`,
            de: `<strong style="color:#221A12;">${proprio || 'Der Gastgeber'} hat dieselbe Benachrichtigung erhalten.</strong>
          Nur einer von Ihnen beiden muss bezahlen: Sprechen Sie sich mit ${proprio || 'ihm'} ab, wenn Sie
          zusammen sind, ansonsten warten Sie nicht: Die Person steht vor der Tür.`,
          }, langue)}
        </div>` : ''}`,
      footer: surMesure
        ? tx({
            fr: `Répondez simplement à ce message si c’est plus simple : nous vous recontactons vite.`,
            en: `Just reply to this message if that is easier: we will get back to you quickly.`,
            de: `Antworten Sie einfach auf diese Nachricht, wenn das bequemer ist: Wir melden uns schnell bei Ihnen.`,
          }, langue)
        : tx({
            fr: `Vous ne réglez que la différence : ce qui a déjà été payé reste acquis.`,
            en: `You only pay the difference: what you have already paid still counts.`,
            de: `Sie zahlen nur die Differenz: Bereits Bezahltes wird angerechnet.`,
          }, langue),
    }),
  }
}

// ---------- Lien d'accès personnel d'un participant ----------
// Part dès qu'il laisse son adresse, pendant la soirée. Son identité ne tenait
// jusque-là que dans son navigateur : perdue avec un téléphone changé, elle
// emportait ses poses restantes et l'accès à ses propres photos.
export function guestAccessEmail({ eventName, link, shotsPerGuest, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  return {
    subject: tx({
      fr: `Votre accès aux photos de « ${eventName} »`,
      en: `Your access to the photos from “${eventName}”`,
      de: `Ihr Zugang zu den Fotos von „${eventName}“`,
    }, langue),
    html: layout({
      langue,
      title: tx({ fr: 'Gardez ce lien', en: 'Keep this link', de: 'Bewahren Sie diesen Link auf' }, langue),
      intro: tx({
        fr: `Vous participez à l'album de « <strong>${eventName}</strong> ». Ce message est votre accès personnel : il vous permet de retrouver vos photos et vos poses restantes, même en changeant de téléphone.`,
        en: `You are taking part in the album for “<strong>${eventName}</strong>”. This message is your personal access: it lets you get back to your photos and your remaining shots, even if you change phone.`,
        de: `Sie machen beim Album von „<strong>${eventName}</strong>“ mit. Diese Nachricht ist Ihr persönlicher Zugang: Damit finden Sie Ihre Fotos und Ihre restlichen Aufnahmen wieder, auch auf einem anderen Handy.`,
      }, langue),
      body: `${bigButton(link, tx({ fr: 'Retrouver mes photos →', en: 'Get my photos back →', de: 'Meine Fotos wiederfinden →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${shotsPerGuest ? tx({
            fr: `Vous disposez de <strong style="color:#221A12;">${shotsPerGuest} photos</strong> pour cette soirée. `,
            en: `You have <strong style="color:#221A12;">${shotsPerGuest} photos</strong> for this party. `,
            de: `Sie haben <strong style="color:#221A12;">${shotsPerGuest} Fotos</strong> für diese Feier. `,
          }, langue) : ''}
          ${tx({
            fr: `Vous recevrez l'album complet dès sa révélation, sans rien avoir à faire.`,
            en: `You will receive the full album as soon as it is revealed, without having to do anything.`,
            de: `Sie erhalten das komplette Album, sobald es enthüllt wird, ohne etwas tun zu müssen.`,
          }, langue)}
        </div>`,
      footer: tx({
        fr: `Ce lien vous est personnel : il donne accès à vos photos, ne le transférez pas. Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement, et pour cela uniquement. Elle sera supprimée avec l'album.`,
        en: `This link is personal to you: it gives access to your photos, so do not forward it. You are receiving this message because you left your email address when joining this event, and for that reason only. It will be deleted along with the album.`,
        de: `Dieser Link ist persönlich: Er gibt Zugriff auf Ihre Fotos, leiten Sie ihn bitte nicht weiter. Sie erhalten diese Nachricht, weil Sie beim Beitritt zu diesem Event Ihre E-Mail-Adresse angegeben haben, und nur deshalb. Sie wird zusammen mit dem Album gelöscht.`,
      }, langue),
    }),
  }
}

// Pied de page commun des mails envoyés aux participants.
function piedParticipant(langue) {
  return tx({
    fr: `Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement. Elle n'est ni vendue ni transmise à qui que ce soit, et sera supprimée avec l'album.`,
    en: `You are receiving this message because you left your email address when joining this event. It is never sold or passed on to anyone, and will be deleted along with the album.`,
    de: `Sie erhalten diese Nachricht, weil Sie beim Beitritt zu diesem Event Ihre E-Mail-Adresse angegeben haben. Sie wird weder verkauft noch an Dritte weitergegeben und zusammen mit dem Album gelöscht.`,
  }, langue)
}

// ---------- Envoi du lien de l'album aux participants qui ont laissé leur mail ----------
// C'est la seule raison pour laquelle on demande leur adresse : le message
// le dit, et le pied de page le rappelle.
// Un encart du mail de révélation : icône, titre, phrase, et ce qu'on y fait.
function encartAlbum({ icone, titre, texte, action, fond = '#FBF4EA', bord = '#EFE2CF' }) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;border-collapse:separate;"><tr>
    <td style="background:${fond};border:1px solid ${bord};border-radius:16px;padding:18px 20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
        <td style="width:44px;vertical-align:top;"><div style="width:34px;height:34px;line-height:34px;text-align:center;border-radius:10px;background:#fff;font-size:18px;">${icone}</div></td>
        <td style="vertical-align:top;">
          <div style="font-size:16px;font-weight:800;color:#221A12;margin-bottom:3px;">${titre}</div>
          <div style="font-size:14px;line-height:1.55;color:#5f5341;">${texte}</div>
        </td>
      </tr></table>
      ${action ? `<div style="padding-top:14px;">${action}</div>` : ''}
    </td>
  </tr></table>`
}

function lienEncart(url, label) {
  return `<a href="${url}" style="display:inline-block;background:#221A12;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:11px 18px;border-radius:11px;">${label}</a>`
}

// Cinq étoiles, chacune un lien : un seul geste suffit à répondre.
function etoilesAvis(lienAvis, mots) {
  const sep = lienAvis.includes('?') ? '&' : '?'
  const cases = [1, 2, 3, 4, 5].map((n) => `<td align="center" style="width:20%;">
      <a href="${lienAvis}${sep}note=${n}" style="text-decoration:none;display:block;">
        <div style="font-size:34px;line-height:1;color:#EC5B33;">★</div>
        <div style="font-size:11px;color:#8a7c69;padding-top:4px;">${mots[n - 1]}</div>
      </a></td>`).join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:10px 4px;"><tr>${cases}</tr></table>`
}

// Trois photos de la soirée en polaroïds. Chacune ouvre l'album sur elle,
// le cœur déjà posé : voter est le premier geste, pas une consigne à retenir.
function polaroidsVote(galleryUrl, vignettes, labelCoeur) {
  const sep = galleryUrl.includes('?') ? '&' : '?'
  const cases = vignettes.map((v, i) => {
    const pente = [-2, 1.5, -1][i % 3]
    return `<td align="center" valign="top" style="width:33.33%;padding:0 5px;">
      <a href="${galleryUrl}${sep}coeur=${encodeURIComponent(v.id)}" style="text-decoration:none;display:block;background:#fff;padding:6px 6px 0;border-radius:4px;box-shadow:0 3px 10px rgba(34,26,18,.14);transform:rotate(${pente}deg);">
        <img src="${v.url}" width="130" alt="" style="display:block;width:100%;height:auto;border-radius:2px;" />
        <div style="font-size:12px;font-weight:700;color:#EC5B33;padding:7px 0 8px;">♥ ${labelCoeur}</div>
      </a></td>`
  }).join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 0;"><tr>${cases}</tr></table>`
}

// Depuis le 03/10/2026, c'est aussi le DERNIER mail que reçoit un participant :
// les cœurs, les tirages et l'avis, qui partaient en trois mails dans la
// semaine, sont dits ici une fois pour toutes. Cinq mails en huit jours
// faisaient se désinscrire ceux qui étaient juste venus à un mariage.
// `tiragesLien` et `avisLien` sont vides quand ils ne s'appliquent pas
// (inscrit avant la promesse des services, avis déjà donné, désinscrit).
// `vignettes` : trois photos [{ id, url }] (voir lib/vignettes-album.js).
export function albumReadyEmail({ eventName, galleryUrl, photoCount, guestName, vignettes = [], tiragesLien, prixTirage, avisLien, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  const bonjour = guestName
    ? tx({ fr: `Bonjour ${guestName},`, en: `Hello ${guestName},`, de: `Hallo ${guestName},` }, langue)
    : tx({ fr: 'Bonjour,', en: 'Hello,', de: 'Hallo,' }, langue)
  const avecPhotos = Array.isArray(vignettes) && vignettes.length >= 3
  const nb = `${photoCount} photo${photoCount > 1 ? 's' : ''}`
  return {
    subject: tx({
      fr: `Les photos de « ${eventName} » sont en ligne 📸`,
      en: `The photos from “${eventName}” are online 📸`,
      de: `Die Fotos von „${eventName}“ sind online 📸`,
    }, langue),
    html: layout({
      langue,
      title: tx({ fr: 'Les photos sont sorties 🎉', en: 'The photos are out 🎉', de: 'Die Fotos sind da 🎉' }, langue),
      intro: tx({
        fr: `${bonjour} l'album de « <strong>${eventName}</strong> » vient de s'ouvrir : <strong>${nb}</strong> prises par tous les participants, y compris les vôtres.`,
        en: `${bonjour} the album for “<strong>${eventName}</strong>” has just opened: <strong>${photoCount} photo${photoCount > 1 ? 's' : ''}</strong> taken by all the guests, including yours.`,
        de: `${bonjour} das Album von „<strong>${eventName}</strong>“ ist gerade geöffnet worden: <strong>${photoCount} ${photoCount > 1 ? 'Fotos' : 'Foto'}</strong>, aufgenommen von allen Gästen, auch von Ihnen.`,
      }, langue),
      body: `${avecPhotos ? `
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#EC5B33;text-align:center;padding-bottom:14px;">
          ${tx({ fr: 'Votez pour vos préférées', en: 'Vote for your favourites', de: 'Stimmen Sie für Ihre Lieblingsfotos' }, langue)}
        </div>
        ${polaroidsVote(galleryUrl, vignettes.slice(0, 3), tx({ fr: 'J’aime', en: 'Love it', de: 'Gefällt mir' }, langue))}
        <div style="height:26px;line-height:26px;">&nbsp;</div>` : ''}
        ${bigButton(galleryUrl, tx({ fr: "Voir l'album →", en: 'See the album →', de: 'Album ansehen →' }, langue))}
        ${avecPhotos ? '' : `<div style="font-size:13px;line-height:1.6;color:#8a7c69;text-align:center;padding-top:10px;">
          ${tx({ fr: 'Touchez le ♥ sous vos préférées : les plus aimées remontent en tête de l’album.', en: 'Tap the ♥ under your favourites: the most loved rise to the top of the album.', de: 'Tippen Sie auf das ♥ unter Ihren Lieblingsfotos: Die beliebtesten rücken im Album nach oben.' }, langue)}
        </div>`}
        ${tiragesLien ? encartAlbum({
          icone: '🎞️',
          titre: tx({ fr: 'Faites-vous livrer vos photos', en: 'Get your photos delivered', de: 'Lassen Sie sich Ihre Fotos liefern' }, langue),
          texte: tx({
            fr: `Vos préférées en vrais tirages, livrés dans votre boîte aux lettres${prixTirage ? `, dès <strong>${prixTirage}</strong> la photo` : ''}.`,
            en: `Your favourites as real prints, delivered to your letterbox${prixTirage ? `, from <strong>${prixTirage}</strong> per photo` : ''}.`,
            de: `Ihre Lieblingsfotos als echte Abzüge, direkt in Ihren Briefkasten${prixTirage ? `, ab <strong>${prixTirage}</strong> pro Foto` : ''}.`,
          }, langue),
          action: lienEncart(tiragesLien, tx({ fr: 'Choisir mes tirages →', en: 'Choose my prints →', de: 'Abzüge auswählen →' }, langue)),
        }) : ''}
        ${avisLien ? encartAlbum({
          icone: '⭐',
          titre: tx({ fr: 'Et Time to Flash, alors ?', en: 'So, what did you think of Time to Flash?', de: 'Und, wie fanden Sie Time to Flash?' }, langue),
          texte: tx({
            fr: 'Vous faites partie de nos 1000 premiers utilisateurs. Une étoile suffit, ça nous aide énormément.',
            en: 'You are one of our first 1,000 users. One star is all it takes, and it helps us enormously.',
            de: 'Sie gehören zu unseren ersten 1.000 Nutzern. Ein Stern genügt, und es hilft uns enorm.',
          }, langue),
          action: etoilesAvis(avisLien, notes(langue).map((n) => n.mot)),
          fond: '#FDEEE6', bord: '#F6D3C2',
        }) : ''}`,
      // Le pied de page ne peut plus dire « uniquement pour cela » : le mail des
      // photos préférées part quelques jours plus tard. Il dit maintenant la
      // même chose que la phrase affichée quand on laisse son adresse.
      footer: piedParticipant(langue),
    }),
  }
}

// ---------- Les photos préférées, quelques jours après ----------
//
// Le seul autre envoi que reçoit un participant. Il rend un service (les
// images que le groupe a élues, qu'on n'aurait pas retrouvées seul) et il
// ramène du monde dans l'album, ce qui fait remonter les votes.
//
// À n'envoyer qu'aux adresses laissées APRÈS le 10 septembre 2026 : avant
// cette date, la phrase affichée sous le champ mail ne promettait qu'un seul
// envoi, et elle engage.
export function photosPrefereesEmail({ eventName, galleryUrl, top = [], votants, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  const vignettes = top
    .filter((t) => t.url)
    .slice(0, 3)
    .map((t) => `<td width="33%" style="padding:0 4px;">
        <img src="${t.url}" width="140" alt="" style="display:block;width:100%;border-radius:10px;" />
      </td>`)
    .join('')

  const combien = votants > 1
    ? tx({
        fr: `Vous étiez <strong>${votants}</strong> à voter.`,
        en: `<strong>${votants}</strong> of you voted.`,
        de: `<strong>${votants}</strong> Personen haben abgestimmt.`,
      }, langue)
    : tx({ fr: 'Les votes sont tombés.', en: 'The votes are in.', de: 'Die Stimmen sind ausgezählt.' }, langue)

  return {
    subject: tx({
      fr: `Les photos préférées de « ${eventName} » ♥`,
      en: `The favourite photos from “${eventName}” ♥`,
      de: `Die Lieblingsfotos von „${eventName}“ ♥`,
    }, langue),
    html: layout({
      langue,
      title: tx({ fr: 'Les photos que vous avez préférées', en: 'The photos you loved most', de: 'Ihre Lieblingsfotos' }, langue),
      intro: tx({
        fr: `${combien} Voici les clichés de « <strong>${eventName}</strong> » qui ont rassemblé le plus de cœurs.`,
        en: `${combien} Here are the shots from “<strong>${eventName}</strong>” that won the most hearts.`,
        de: `${combien} Hier sind die Aufnahmen von „<strong>${eventName}</strong>“, die die meisten Herzen bekommen haben.`,
      }, langue),
      body: `${vignettes ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;"><tr>${vignettes}</tr></table>` : ''}
        ${bigButton(galleryUrl, tx({ fr: "Revoir l'album →", en: 'See the album again →', de: 'Album noch einmal ansehen →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${tx({
            fr: `Le classement bouge encore : touchez le cœur sous une photo pour ajouter votre voix.`,
            en: `The ranking can still change: tap the heart under a photo to add your vote.`,
            de: `Die Rangliste kann sich noch ändern: Tippen Sie auf das Herz unter einem Foto, um Ihre Stimme abzugeben.`,
          }, langue)}
        </div>`,
      footer: piedParticipant(langue),
    }),
  }
}

// ---------- Les tirages papier, quelques jours après ----------
//
// Part après le mail des photos préférées : le classement du groupe est fait,
// et ce sont précisément ces photos-là qu'on a envie de tenir en main. Le
// bouton ouvre l'album directement sur la sélection des tirages, favoris déjà
// cochés.
export function tiragesEmail({ eventName, lien: lienAlbum, top = [], ratio = 3 / 4, prixAppel, stopLink, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  // Trois photos du même format, affichées entières et à la même taille (voir
  // contenuTirages). Les dimensions sont écrites en dur : les messageries ne
  // savent pas ajuster une image seules.
  const L = ratio >= 1 ? 150 : 130
  const H = Math.round(L / ratio)
  const vignettes = top
    .filter((t) => t.url)
    .slice(0, 3)
    .map((t, i) => `<td width="33%" align="center" valign="middle" style="padding:0 5px;">
        <img src="${t.url}" width="${L}" height="${H}" alt="" style="display:block;width:${L}px;max-width:100%;height:auto;border-radius:6px;box-shadow:0 4px 12px rgba(34,26,18,.22);transform:rotate(${[-3, 2, -1][i]}deg);" />
      </td>`)
    .join('')

  return {
    subject: tx({
      fr: `Les photos de « ${eventName} », sur papier 🎞️`,
      en: `The photos from “${eventName}”, on paper 🎞️`,
      de: `Die Fotos von „${eventName}“, auf Papier 🎞️`,
    }, langue),
    html: layout({
      langue,
      logo: true,
      title: tx({
        fr: 'Vos plus belles photos méritent mieux qu\'un écran',
        en: 'Your best photos deserve more than a screen',
        de: 'Ihre schönsten Fotos verdienen mehr als einen Bildschirm',
      }, langue),
      intro: tx({
        fr: `Les photos de « <strong>${eventName}</strong> » que tout le monde a préférées peuvent arriver chez vous en vrais tirages, imprimés sur papier photo.`,
        en: `Everyone's favourite photos from “<strong>${eventName}</strong>” can arrive at your door as real prints, on photo paper.`,
        de: `Die beliebtesten Fotos von „<strong>${eventName}</strong>“ können als echte Abzüge auf Fotopapier zu Ihnen nach Hause kommen.`,
      }, langue),
      body: `${vignettes ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr>${vignettes}</tr></table>` : ''}
        ${bigButton(lienAlbum, tx({ fr: 'Choisir mes tirages →', en: 'Choose my prints →', de: 'Meine Abzüge auswählen →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${tx({
            fr: `Vos favoris sont déjà cochés : il ne reste qu'à ajouter ou retirer des photos.
          Tirages 10 × 15 dès <strong>${prixAppel}</strong> la photo, livrés dans votre boîte aux lettres.`,
            en: `Your favourites are already ticked: all that's left is to add or remove photos.
          10 × 15 cm prints from <strong>${prixAppel}</strong> per photo, delivered to your letterbox.`,
            de: `Ihre Favoriten sind schon ausgewählt: Sie müssen nur noch Fotos hinzufügen oder entfernen.
          Abzüge im Format 10 × 15 ab <strong>${prixAppel}</strong> pro Foto, direkt in Ihren Briefkasten.`,
          }, langue)}
        </div>`,
      footer: tx({
        fr: `Vous recevez ce message parce que vous avez laissé votre adresse en rejoignant cet événement.${stopLink ? ` <a href="${stopLink}" style="color:#8a7c69;">Ne plus recevoir de message de ce type</a>.` : ''}`,
        en: `You are receiving this message because you left your email address when joining this event.${stopLink ? ` <a href="${stopLink}" style="color:#8a7c69;">Stop receiving messages like this</a>.` : ''}`,
        de: `Sie erhalten diese Nachricht, weil Sie beim Beitritt zu diesem Event Ihre E-Mail-Adresse angegeben haben.${stopLink ? ` <a href="${stopLink}" style="color:#8a7c69;">Keine Nachrichten dieser Art mehr erhalten</a>.` : ''}`,
      }, langue),
    }),
  }
}

// ---------- Les tirages commandés : confirmation, puis expédition ----------
//
// Deux mails seulement, et pas un par étape interne : la confirmation juste
// après le paiement (avec le récapitulatif), puis l'expédition avec le lien
// de suivi du colis. L'imprimeur ne sait pas quand le colis est livré : c'est
// le suivi du transporteur qui le dit.

// Les photos commandées, posées sur leur papier : c'est ce qui arrivera, bandes
// blanches comprises. `photos` : [{ url, largeur, hauteur }].
function planchetirages(photos) {
  const cases = photos.slice(0, 4).map((t) => {
    const r = t.largeur && t.hauteur ? t.largeur / t.hauteur : 3 / 4
    const paysage = r > 1
    const PL = paysage ? 120 : 80 // le papier 10 × 15, tourné comme la photo
    const PH = paysage ? 80 : 120
    const w = Math.round(r > PL / PH ? PL - 6 : (PH - 6) * r)
    const h = Math.round(w / r)
    return `<td align="center" valign="bottom" style="padding:0 4px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:2px;box-shadow:0 3px 8px rgba(34,26,18,.18);"><tr>
        <td width="${PL}" height="${PH}" align="center" valign="middle" style="width:${PL}px;height:${PH}px;">
          <img src="${t.url}" width="${w}" height="${h}" alt="" style="display:block;width:${w}px;height:${h}px;" />
        </td>
      </tr></table>
    </td>`
  }).join('')
  return cases ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 22px;"><tr>${cases}</tr></table>` : ''
}

function ligneRecap(libelle, valeur) {
  return `<tr>
    <td style="padding:6px 0;font-size:14px;color:#6E6252;">${libelle}</td>
    <td align="right" style="padding:6px 0;font-size:14px;color:#221A12;font-weight:600;">${valeur}</td>
  </tr>`
}

function piedCommande(reference, langue) {
  return tx({
    fr: `Commande n° ${reference}. Une question sur votre commande ? Écrivez-nous à ${CONTACT_EMAIL}.`,
    en: `Order no. ${reference}. A question about your order? Write to us at ${CONTACT_EMAIL}.`,
    de: `Bestellung Nr. ${reference}. Eine Frage zu Ihrer Bestellung? Schreiben Sie uns an ${CONTACT_EMAIL}.`,
  }, langue)
}

export function tiragesConfirmationEmail({ prenom, eventName, nombre, formatNom, finition, rendu, adresse, total, reference, photos = [], lienAlbum, langue }) {
  eventName = nomAffiche(eventName, langue) // « Mon événement » traduit
  const tirages = tx({
    fr: `${nombre} tirage${nombre > 1 ? 's' : ''}`,
    en: `${nombre} print${nombre > 1 ? 's' : ''}`,
    de: `${nombre} ${nombre > 1 ? 'Abzüge' : 'Abzug'}`,
  }, langue)
  return {
    subject: tx({
      fr: `Votre commande de tirages est confirmée 🎞️`,
      en: `Your print order is confirmed 🎞️`,
      de: `Ihre Bestellung von Abzügen ist bestätigt 🎞️`,
    }, langue),
    html: layout({
      langue,
      logo: true,
      title: tx({
        fr: 'Merci ! Vos tirages partent à l\'impression',
        en: 'Thank you! Your prints are off to be printed',
        de: 'Vielen Dank! Ihre Abzüge gehen in den Druck',
      }, langue),
      intro: tx({
        fr: `${prenom ? `Bonjour ${prenom}, v` : 'V'}otre commande de <strong>${tirages}</strong> des photos de « <strong>${eventName}</strong> » est bien payée.`,
        en: `${prenom ? `Hello ${prenom}, y` : 'Y'}our order of <strong>${tirages}</strong> of the photos from “<strong>${eventName}</strong>” has been paid.`,
        de: `${prenom ? `Hallo ${prenom}, I` : 'I'}hre Bestellung von <strong>${tirages}</strong> der Fotos von „<strong>${eventName}</strong>“ ist bezahlt.`,
      }, langue),
      body: `${planchetirages(photos)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(34,26,18,.1);border-bottom:1px solid rgba(34,26,18,.1);margin-bottom:20px;">
          ${ligneRecap(tx({ fr: 'Tirages', en: 'Prints', de: 'Abzüge' }, langue), `${nombre} × ${formatNom}`)}
          ${ligneRecap(tx({ fr: 'Papier', en: 'Paper', de: 'Papier' }, langue), finition)}
          ${ligneRecap(tx({ fr: 'Rendu', en: 'Style', de: 'Look' }, langue), rendu)}
          ${ligneRecap(tx({ fr: 'Livraison', en: 'Delivery', de: 'Lieferung' }, langue), adresse)}
          ${ligneRecap(tx({ fr: 'Total payé', en: 'Total paid', de: 'Bezahlt insgesamt' }, langue), total)}
        </table>
        <div style="font-size:14px;line-height:1.7;color:#5f5341;">
          ${tx({
            fr: `Vos tirages sont imprimés en France puis postés depuis Rouen : comptez <strong>3 à 4 jours ouvrés</strong> après leur départ. Vous recevrez un second mail le jour où ils partent.`,
            en: `Your prints are printed in France and posted from Rouen: allow <strong>3 to 4 working days</strong> after they are sent. You will receive a second email on the day they leave.`,
            de: `Ihre Abzüge werden in Frankreich gedruckt und in Rouen aufgegeben: Rechnen Sie mit <strong>3 bis 4 Werktagen</strong> nach dem Versand. Sie erhalten eine zweite E-Mail, sobald sie verschickt werden.`,
          }, langue)}
        </div>
        ${lienAlbum ? `<div style="padding-top:22px;">${bigButton(lienAlbum, tx({ fr: 'Revoir l\'album →', en: 'See the album again →', de: 'Album noch einmal ansehen →' }, langue))}</div>` : ''}`,
      footer: piedCommande(reference, langue),
    }),
  }
}

export function tiragesExpeditionEmail({ prenom, nombre, transporteur, suiviUrl, suiviNumero, reference, langue }) {
  const tirages = tx({
    fr: `${nombre} tirage${nombre > 1 ? 's' : ''}`,
    en: `${nombre} print${nombre > 1 ? 's' : ''}`,
    de: `${nombre} ${nombre > 1 ? 'Abzüge' : 'Abzug'}`,
  }, langue)
  return {
    subject: tx({
      fr: `Vos tirages sont expédiés 📦`,
      en: `Your prints have been sent 📦`,
      de: `Ihre Abzüge sind unterwegs 📦`,
    }, langue),
    html: layout({
      langue,
      logo: true,
      title: tx({ fr: 'Vos tirages sont en chemin', en: 'Your prints are on their way', de: 'Ihre Abzüge sind auf dem Weg' }, langue),
      intro: tx({
        fr: `${prenom ? `Bonjour ${prenom}, v` : 'V'}os ${tirages} viennent de partir${transporteur ? ` avec <strong>${transporteur}</strong>` : ''}. Comptez 3 à 4 jours ouvrés avant de les trouver dans votre boîte aux lettres.`,
        en: `${prenom ? `Hello ${prenom}, y` : 'Y'}our ${nombre > 1 ? `${nombre} prints have` : 'print has'} just been sent${transporteur ? ` with <strong>${transporteur}</strong>` : ''}. Allow 3 to 4 working days before ${nombre > 1 ? 'they arrive' : 'it arrives'} in your letterbox.`,
        de: `${prenom ? `Hallo ${prenom}, ` : ''}${nombre > 1 ? `Ihre ${nombre} Abzüge sind` : 'Ihr Abzug ist'} gerade verschickt worden${transporteur ? ` mit <strong>${transporteur}</strong>` : ''}. Rechnen Sie mit 3 bis 4 Werktagen, bis ${nombre > 1 ? 'sie' : 'er'} in Ihrem Briefkasten ${nombre > 1 ? 'liegen' : 'liegt'}.`,
      }, langue),
      body: `${suiviUrl ? bigButton(suiviUrl, tx({ fr: 'Suivre mon colis →', en: 'Track my parcel →', de: 'Sendung verfolgen →' }, langue)) : ''}
        ${suiviNumero ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:${suiviUrl ? 18 : 0}px;">${tx({ fr: 'Numéro de suivi :', en: 'Tracking number:', de: 'Sendungsnummer:' }, langue)} <strong style="font-family:ui-monospace,Menlo,monospace;">${suiviNumero}</strong></div>` : ''}
        ${!suiviUrl && !suiviNumero ? `<div style="font-size:14px;line-height:1.7;color:#5f5341;">${tx({
          fr: `Ils voyagent en lettre, comme une carte postale : il n'y a donc pas de numéro de suivi. Si rien n'est arrivé dans 10 jours, écrivez-nous à ${CONTACT_EMAIL}.`,
          en: `${nombre > 1 ? 'They travel' : 'It travels'} as a letter, like a postcard, so there is no tracking number. If nothing has arrived within 10 days, write to us at ${CONTACT_EMAIL}.`,
          de: `${nombre > 1 ? 'Sie reisen' : 'Er reist'} als Brief, wie eine Postkarte: Deshalb gibt es keine Sendungsnummer. Falls nach 10 Tagen nichts angekommen ist, schreiben Sie uns an ${CONTACT_EMAIL}.`,
        }, langue)}</div>` : ''}`,
      footer: piedCommande(reference, langue),
    }),
  }
}

// Pour nous : une commande payée n'a pas pu partir chez l'imprimeur.
// (Mail d'alerte interne : toujours en français.)
export function tiragesBloqueeEmail({ reference, erreur, eventName }) {
  return {
    subject: `⚠️ Tirages : commande ${reference} bloquée`,
    html: layout({
      title: 'Une commande de tirages est bloquée',
      intro: `La commande ${reference} (« ${eventName || 'album inconnu'} ») est payée, mais n'a pas pu être transmise à l'imprimeur.`,
      body: `<div style="font-size:14px;line-height:1.7;color:#5f5341;">Raison : <strong>${erreur}</strong><br>Elle attend dans la table tirages_commandes, au statut « erreur ».</div>`,
      footer: 'Message automatique.',
    }),
  }
}

// ---------- Le participant a demandé à retrouver ses photos ----------
// Répond à la page de connexion quand l'adresse n'est pas celle d'un
// organisateur, mais celle de quelqu'un qui a photographié une soirée.
// Pas de code à saisir ici : un seul lien, qui rattache toutes ses
// participations au téléphone sur lequel il l'ouvre.
export function retrouverPhotosEmail({ albums, link, langue }) {
  const pasOuvert = tx({ fr: ' (album pas encore ouvert)', en: ' (album not open yet)', de: ' (Album noch nicht geöffnet)' }, langue)
  const liste = albums
    .map((a) => `<li style="margin-bottom:6px;"><strong style="color:#221A12;">${a.name}</strong>${a.revele ? '' : pasOuvert}</li>`)
    .join('')
  const pluriel = albums.length > 1
  return {
    subject: tx({ fr: 'Retrouvez vos photos 📸', en: 'Get your photos back 📸', de: 'Finden Sie Ihre Fotos wieder 📸' }, langue),
    text: tx({
      fr: `Voici votre lien pour retrouver vos photos : ${link}\n\n` +
        `Ouvrez-le sur le téléphone avec lequel vous voulez voir vos photos : il y rattache vos participations.`,
      en: `Here is your link to get your photos back: ${link}\n\n` +
        `Open it on the phone you want to see your photos on: it links your participations to that phone.`,
      de: `Hier ist Ihr Link, um Ihre Fotos wiederzufinden: ${link}\n\n` +
        `Öffnen Sie ihn auf dem Handy, auf dem Sie Ihre Fotos sehen möchten: Ihre Teilnahmen werden dann damit verknüpft.`,
    }, langue),
    html: layout({
      langue,
      title: tx({ fr: 'Vos photos vous attendent', en: 'Your photos are waiting for you', de: 'Ihre Fotos warten auf Sie' }, langue),
      intro: pluriel
        ? tx({
            fr: `Vous avez participé à ces albums :<ul style="margin:12px 0 0;padding-left:18px;">${liste}</ul>`,
            en: `You took part in these albums:<ul style="margin:12px 0 0;padding-left:18px;">${liste}</ul>`,
            de: `Sie haben bei diesen Alben mitgemacht:<ul style="margin:12px 0 0;padding-left:18px;">${liste}</ul>`,
          }, langue)
        : tx({
            fr: `Vous avez participé à l'album de :<ul style="margin:12px 0 0;padding-left:18px;">${liste}</ul>`,
            en: `You took part in the album for:<ul style="margin:12px 0 0;padding-left:18px;">${liste}</ul>`,
            de: `Sie haben bei diesem Album mitgemacht:<ul style="margin:12px 0 0;padding-left:18px;">${liste}</ul>`,
          }, langue),
      body: `${bigButton(link, tx({ fr: 'Retrouver mes photos →', en: 'Get my photos back →', de: 'Meine Fotos wiederfinden →' }, langue))}
        <div style="font-size:14px;line-height:1.7;color:#5f5341;padding-top:22px;">
          ${tx({
            fr: `Ouvrez ce lien sur le téléphone où vous voulez voir vos photos : il y rattache
          ${pluriel ? 'vos participations' : 'votre participation'}, vos poses restantes comprises.
          Aucun code à saisir.`,
            en: `Open this link on the phone where you want to see your photos: it links
          ${pluriel ? 'your participations' : 'your participation'} to it, remaining shots included.
          No code to enter.`,
            de: `Öffnen Sie diesen Link auf dem Handy, auf dem Sie Ihre Fotos sehen möchten: ${pluriel ? 'Ihre Teilnahmen werden' : 'Ihre Teilnahme wird'}
          damit verknüpft, inklusive Ihrer restlichen Aufnahmen.
          Kein Code nötig.`,
          }, langue)}
        </div>`,
      footer: tx({
        fr: `Vous recevez ce message parce que quelqu'un a demandé à retrouver les photos liées à cette adresse. Si ce n'est pas vous, ignorez ce mail : il ne donne accès qu'aux albums auxquels vous avez participé. Ce lien vous est personnel, ne le transférez pas.`,
        en: `You are receiving this message because someone asked to retrieve the photos linked to this address. If it was not you, ignore this email: it only gives access to albums you took part in. This link is personal to you, so do not forward it.`,
        de: `Sie erhalten diese Nachricht, weil jemand angefordert hat, die mit dieser Adresse verknüpften Fotos wiederzufinden. Falls Sie das nicht waren, ignorieren Sie diese E-Mail: Sie gibt nur Zugriff auf Alben, bei denen Sie mitgemacht haben. Dieser Link ist persönlich, leiten Sie ihn bitte nicht weiter.`,
      }, langue),
    }),
  }
}
