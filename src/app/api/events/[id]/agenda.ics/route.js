// ============================================================
//  Fichier .ics « Ajouter à mon agenda » pour les participants.
//  Un tap sur le lien ouvre directement l'appli Calendrier du
//  téléphone (iPhone comme Android) avec la date de révélation
//  et, surtout, le lien de l'événement gardé au chaud.
// ============================================================
import { selectRows } from '../../../../../lib/supabase'
import { estUuid, identifiantInvalide } from '../../../../../lib/params'
import { finDe, momentsRappels } from '../../../../../lib/rappels'
import { t, langueValide } from '../../../../../lib/i18n'
import { langueRequete } from '../../../../../lib/langue-serveur'
import { nomAffiche } from '../../../../../lib/event-defaults'

// Échappement des textes selon la norme iCalendar
function esc(s = '') {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Date au format iCalendar UTC : 20261210T130000Z
function stamp(d) {
  return new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// Les lignes de plus de 75 octets doivent être repliées, sinon
// certains agendas tronquent le lien au milieu.
function fold(line) {
  const out = []
  let cur = ''
  let len = 0
  for (const ch of line) {
    const w = Buffer.byteLength(ch, 'utf8')
    if (len + w > 73) { out.push(cur); cur = ' '; len = 1 }
    cur += ch
    len += w
  }
  out.push(cur)
  return out.join('\r\n')
}

export async function GET(request, { params }) {
  const { id } = await params
  // La langue : ?lang= (lien construit par l'écran), sinon celle de la requête.
  const langue = langueValide(new URL(request.url).searchParams.get('lang')) || langueRequete(request)
  if (!estUuid(id)) return identifiantInvalide(langue)

  const { ok, data } = await selectRows('events', `id=eq.${id}&select=id,name,host_names,starts_at,ends_at,reveal_at,reminder_offsets`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ok || !ev) return new Response(t({ fr: 'Événement introuvable.', en: 'Event not found.', de: 'Event nicht gefunden.' }, langue), { status: 404 })

  // On repart du domaine sur lequel le participant se trouve : le lien mis en
  // agenda est exactement celui qu'il utilise déjà.
  const origin = new URL(request.url).origin
  const joinUrl = `${origin}/j/${id}`
  const galleryUrl = `${origin}/g/${id}`

  const title = ev.host_names || nomAffiche(ev.name, langue) || 'Time to Flash'
  const links = [
    t({
      fr: `Mon appareil photo (et mes photos) : ${joinUrl}`,
      en: `My camera (and my photos): ${joinUrl}`,
      de: `Meine Kamera (und meine Fotos): ${joinUrl}`,
    }, langue),
    t({
      fr: `L'album de tous les participants : ${galleryUrl}`,
      en: `Everyone's album: ${galleryUrl}`,
      de: `Das Album aller Gäste: ${galleryUrl}`,
    }, langue),
  ].join('\n')

  const H = 60 * 60 * 1000
  const now = Date.now()
  const reveal = new Date(ev.reveal_at).getTime()

  // Les vraies dates de la fête, désormais connues. À défaut (événement d'avant
  // le champ « début »), on retombe sur l'ancienne estimation : le participant
  // scanne le QR en arrivant.
  const dates = {
    startsAt: ev.starts_at,
    endsAt: ev.ends_at,
    revealAt: ev.reveal_at,
    rappels: ev.reminder_offsets,
  }
  const debut = ev.starts_at ? new Date(ev.starts_at).getTime() : now
  const shootStart = Number.isFinite(debut) ? debut : now
  const finConnue = finDe(dates)
  const shootEnd = Number.isFinite(finConnue) && finConnue > shootStart
    ? finConnue
    : Math.min(shootStart + 6 * H, reveal > shootStart ? reveal : shootStart + 6 * H)

  // Les rappels « pense à shooter », aux moments prévus pour cet événement.
  // `g` (l'identifiant du participant, facultatif) lui donne son propre
  // décalage de quelques minutes : deux agendas ne sonnent pas ensemble.
  const cle = new URL(request.url).searchParams.get('g')
  const rappels = momentsRappels(dates, cle, now)

  // Un VEVENT = un rendez-vous dans l'agenda.
  const vevent = ({ uid, start, end, summary, description, alarm }) => [
    'BEGIN:VEVENT',
    `UID:${uid}-${id}@timetoflash.fr`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(description)}`,
    `URL:${joinUrl}`,
    ...(alarm ? [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `TRIGGER:${alarm.trigger}`,
      `DESCRIPTION:${esc(alarm.text)}`,
      'END:VALARM',
    ] : []),
    'END:VEVENT',
  ]

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Time to Flash//FR',
    'CALSCALE:GREGORIAN',

    // 1 · La soirée photo
    ...vevent({
      uid: 'shoot',
      start: shootStart,
      end: shootEnd,
      summary: t({ fr: `📸 Soirée photo : ${title}`, en: `📸 Photo party: ${title}`, de: `📸 Fotoabend: ${title}` }, langue),
      description: t({
        fr: `C'est parti ! Sortez votre appareil et immortalisez la soirée.\n\n${links}`,
        en: `Here we go! Get your camera out and capture the party.\n\n${links}`,
        de: `Los geht's! Holen Sie Ihre Kamera heraus und halten Sie die Feier fest.\n\n${links}`,
      }, langue),
    }),

    // 2 · Les rappels « pense à shooter », répartis dans la fête
    ...rappels.flatMap((quand, i) => vevent({
      uid: `nudge${i + 1}`,
      start: quand,
      end: quand + 15 * 60 * 1000,
      summary: t({ fr: "🔔 N'oubliez pas de prendre des photos !", en: "🔔 Don't forget to take photos!", de: '🔔 Vergessen Sie nicht, Fotos zu machen!' }, langue),
      description: t({
        fr: `Il vous reste des clichés à croquer.\n\n${links}`,
        en: `You still have shots left to take.\n\n${links}`,
        de: `Sie haben noch Aufnahmen übrig.\n\n${links}`,
      }, langue),
      alarm: { trigger: '-PT0S', text: t({ fr: "N'oubliez pas de prendre des photos !", en: "Don't forget to take photos!", de: 'Vergessen Sie nicht, Fotos zu machen!' }, langue) },
    })),

    // 3 · La révélation de l'album
    ...vevent({
      uid: 'reveal',
      start: reveal,
      end: reveal + 1 * H,
      summary: t({ fr: `✨ Révélation des photos : ${title}`, en: `✨ Photo reveal: ${title}`, de: `✨ Präsentation der Fotos: ${title}` }, langue),
      description: t({
        fr: `Les photos de « ${title} » se révèlent.\n\n${links}`,
        en: `The photos from “${title}” are being revealed.\n\n${links}`,
        de: `Die Fotos von „${title}“ werden jetzt für alle sichtbar.\n\n${links}`,
      }, langue),
      alarm: { trigger: '-PT15M', text: t({ fr: 'Vos photos se révèlent dans 15 minutes', en: 'Your photos will be revealed in 15 minutes', de: 'Ihre Fotos werden in 15 Minuten präsentiert' }, langue) },
    }),

    'END:VCALENDAR',
  ]

  const body = lines.map(fold).join('\r\n') + '\r\n'

  return new Response(body, {
    headers: {
      // « inline » : iOS ouvre Calendrier directement au lieu de ranger
      // le fichier dans l'appli Fichiers.
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="time-to-flash.ics"',
      'Cache-Control': 'no-store',
    },
  })
}
