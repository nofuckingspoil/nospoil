// ============================================================
//  Ménage automatique (tâche planifiée quotidienne — voir vercel.json).
//
//  1. Prévient l'organisateur 1 mois puis 1 semaine avant la suppression.
//  2. Supprime définitivement les photos 6 mois après la révélation
//     (CGV art. 8 + politique de confidentialité art. 6).
//
//  Protégée par CRON_SECRET : Vercel envoie automatiquement l'en-tête
//  « Authorization: Bearer $CRON_SECRET » quand la variable existe.
// ============================================================
import { selectRows, updateRow, deleteRows, deletePhotos, deletePhoto } from '../../../../lib/supabase'
import { sendMail, purgeWarningEmail, siteUrl } from '../../../../lib/mail'
import { WARNINGS, formatPurgeDate } from '../../../../lib/retention'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Filet de sécurité : on ne traite jamais plus de N événements par passage.
// Le cron repasse chaque jour, donc un éventuel retard se résorbe tout seul.
const BATCH = 50

const DAY = 24 * 60 * 60 * 1000

function authorized(request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false // pas de secret configuré = route fermée
  return request.headers.get('authorization') === `Bearer ${secret}`
}

// --- Étape 1 : alertes avant suppression ---
async function sendWarnings(now) {
  const sent = []
  for (const w of WARNINGS) {
    const horizon = new Date(now.getTime() + w.days * DAY).toISOString()
    const { ok, data } = await selectRows(
      'events',
      `select=id,name,expires_at,owner_email` +
        `&expires_at=gt.${now.toISOString()}` +
        `&expires_at=lte.${horizon}` +
        `&purged_at=is.null` +
        `&${w.key}=is.null` +
        `&owner_email=not.is.null` +
        `&order=expires_at.asc&limit=${BATCH}`
    )
    if (!ok || !Array.isArray(data)) {
      console.error('cron/purge: lecture des alertes impossible', w.key, data)
      continue
    }

    for (const ev of data) {
      // Nombre de photos concernées, pour rendre le mail concret.
      const count = await selectRows('photos', `select=id&event_id=eq.${ev.id}`)
      const photoCount = Array.isArray(count.data) ? count.data.length : 0

      // Un événement sans aucune photo n'a rien à sauvegarder : on marque
      // l'alerte comme traitée sans envoyer de mail inutile.
      if (photoCount === 0) {
        await updateRow('events', `id=eq.${ev.id}`, { [w.key]: now.toISOString() })
        continue
      }

      const mail = purgeWarningEmail({
        eventName: ev.name,
        galleryUrl: `${siteUrl()}/event/${ev.id}`,
        remaining: w.label,
        purgeDate: formatPurgeDate(ev.expires_at),
        photoCount,
      })
      const res = await sendMail({ to: ev.owner_email, subject: mail.subject, html: mail.html })

      // On ne marque l'alerte que si le mail est bien parti : sinon le cron
      // réessaiera demain plutôt que de perdre silencieusement l'avertissement.
      if (res.ok) {
        await updateRow('events', `id=eq.${ev.id}`, { [w.key]: now.toISOString() })
        sent.push({ event: ev.id, warning: w.label, photos: photoCount })
      } else {
        console.error('cron/purge: mail non envoyé', ev.id, res.error)
      }
    }
  }
  return sent
}

// --- Étape 2 : suppression définitive ---
async function purgeExpired(now) {
  const { ok, data } = await selectRows(
    'events',
    `select=id,name,cover_url,expires_at` +
      `&expires_at=lte.${now.toISOString()}` +
      `&purged_at=is.null` +
      `&order=expires_at.asc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('cron/purge: lecture des expirés impossible', data)
    return []
  }

  const purged = []
  for (const ev of data) {
    const photos = await selectRows('photos', `select=storage_path,thumb_path&event_id=eq.${ev.id}`)
    const rows = Array.isArray(photos.data) ? photos.data : []

    // Fichiers R2 : l'original et sa mini-version.
    const paths = rows.flatMap((p) => [p.storage_path, p.thumb_path]).filter(Boolean)
    if (paths.length) await deletePhotos(paths)
    if (ev.cover_url) await deletePhoto(ev.cover_url)

    // Lignes en base : les photos d'abord (elles référencent les invités).
    await deleteRows('photos', `event_id=eq.${ev.id}`)
    await deleteRows('guests', `event_id=eq.${ev.id}`)

    // L'événement lui-même est conservé (historique, facturation) mais vidé.
    await updateRow('events', `id=eq.${ev.id}`, {
      purged_at: now.toISOString(),
      cover_url: null,
    })

    purged.push({ event: ev.id, name: ev.name, photos: rows.length })
    console.log(`cron/purge: événement ${ev.id} purgé (${rows.length} photos)`)
  }
  return purged
}

// --- Étape 3 : les essais du site ---
//
// Chaque visiteur qui scanne le QR de l'accueil repart avec son propre album.
// Ils ne sont pas conservés : passé un jour, il ne reste rien — ni ligne, ni
// fichier. Les adresses laissées volontairement, elles, vivent dans `accounts`
// et survivent à ce ménage.
async function purgeDemos(now) {
  const limite = new Date(now.getTime() - DAY).toISOString()
  const { ok, data } = await selectRows(
    'events',
    `select=id,cover_url&is_demo=is.true&created_at=lte.${limite}&order=created_at.asc&limit=${BATCH}`
  )
  if (!ok || !Array.isArray(data)) {
    console.error('cron/purge: lecture des essais impossible', data)
    return []
  }

  const supprimes = []
  for (const ev of data) {
    const photos = await selectRows('photos', `select=storage_path,thumb_path&event_id=eq.${ev.id}`)
    const rows = Array.isArray(photos.data) ? photos.data : []
    const paths = rows.flatMap((p) => [p.storage_path, p.thumb_path]).filter(Boolean)
    if (paths.length) await deletePhotos(paths)
    if (ev.cover_url) await deletePhoto(ev.cover_url)

    await deleteRows('photos', `event_id=eq.${ev.id}`)
    await deleteRows('guests', `event_id=eq.${ev.id}`)
    await deleteRows('event_admins', `event_id=eq.${ev.id}`)
    // Contrairement à un vrai événement, l'essai ne laisse aucune trace :
    // rien à facturer, rien à archiver.
    await deleteRows('events', `id=eq.${ev.id}`)

    supprimes.push(ev.id)
  }
  if (supprimes.length) console.log(`cron/purge: ${supprimes.length} essai(s) supprimé(s)`)
  return supprimes
}

export async function GET(request) {
  if (!authorized(request)) {
    return Response.json({ error: 'Non autorisé.' }, { status: 401 })
  }

  const now = new Date()
  try {
    // Les alertes d'abord : un événement qui expire aujourd'hui a déjà été
    // prévenu lors des passages précédents, il n'y a pas de collision.
    const warned = await sendWarnings(now)
    const purged = await purgeExpired(now)
    const demos = await purgeDemos(now)
    return Response.json({ ok: true, at: now.toISOString(), warned, purged, demos: demos.length })
  } catch (err) {
    console.error('cron/purge: erreur', err)
    return Response.json({ error: 'Erreur pendant le ménage.' }, { status: 500 })
  }
}
