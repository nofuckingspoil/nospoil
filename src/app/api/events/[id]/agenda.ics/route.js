// ============================================================
//  Fichier .ics « Ajouter à mon agenda » pour les invités.
//  Un tap sur le lien ouvre directement l'appli Calendrier du
//  téléphone (iPhone comme Android) avec la date de révélation
//  et, surtout, le lien de l'événement gardé au chaud.
// ============================================================
import { selectRows } from '../../../../../lib/supabase'

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

  const { ok, data } = await selectRows('events', `id=eq.${id}&select=id,name,host_names,reveal_at`)
  const ev = Array.isArray(data) ? data[0] : null
  if (!ok || !ev) return new Response('Événement introuvable.', { status: 404 })

  // On repart du domaine sur lequel l'invité se trouve : le lien mis en
  // agenda est exactement celui qu'il utilise déjà.
  const origin = new URL(request.url).origin
  const joinUrl = `${origin}/j/${id}`
  const galleryUrl = `${origin}/g/${id}`

  const title = ev.host_names || ev.name || 'Time to Flash'
  const links = [
    `Mon appareil photo (et mes photos) : ${joinUrl}`,
    `L'album de tous les invités : ${galleryUrl}`,
  ].join('\n')

  const H = 60 * 60 * 1000
  const now = Date.now()
  const reveal = new Date(ev.reveal_at).getTime()

  // La soirée n'est pas stockée en base : on part du principe que l'invité
  // scanne le QR en arrivant à la fête. Début = maintenant, fin 6 h plus tard
  // (jamais au-delà de la révélation, sinon les blocs se chevauchent).
  const shootStart = now
  const shootEnd = Math.min(now + 6 * H, reveal > now ? reveal : now + 6 * H)

  // Petit coup de pouce 1 h après l'arrivée : « pense à shooter ».
  // Inutile si la révélation tombe avant : on le saute.
  const nudgeAt = now + 1 * H
  const withNudge = !(reveal > now) || nudgeAt < reveal

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
      summary: `📸 Soirée photo — ${title}`,
      description: `C'est parti ! Sortez votre appareil et immortalisez la soirée.\n\n${links}`,
    }),

    // 2 · Le rappel « pense à shooter », 1 h après l'arrivée
    ...(withNudge ? vevent({
      uid: 'nudge',
      start: nudgeAt,
      end: nudgeAt + 15 * 60 * 1000,
      summary: "🔔 N'oubliez pas de prendre des photos !",
      description: `Il vous reste des clichés à croquer.\n\n${links}`,
      alarm: { trigger: '-PT0S', text: "N'oubliez pas de prendre des photos !" },
    }) : []),

    // 3 · La révélation de l'album
    ...vevent({
      uid: 'reveal',
      start: reveal,
      end: reveal + 1 * H,
      summary: `✨ Révélation des photos — ${title}`,
      description: `Les photos de « ${title} » se révèlent.\n\n${links}`,
      alarm: { trigger: '-PT15M', text: 'Vos photos se révèlent dans 15 minutes' },
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
