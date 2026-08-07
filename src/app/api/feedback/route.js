// ============================================================
//  Enregistrement des avis (enquête de satisfaction).
//
//  Trois portes d'entrée, une seule table :
//   - l'encart de l'album           → { eventId, deviceToken }
//   - le mail d'enquête invité      → { i: jeton d'invité }
//   - le mail d'enquête organisateur → { o: jeton organisateur }
//
//  Aucune n'exige de compte : le jeton du lien suffit à savoir qui parle, et
//  l'album se contente du jeton d'appareil déjà utilisé pour les favoris.
// ============================================================
import { selectRows, insertRow, updateRow } from '../../../lib/supabase'
import { estUneAlerte } from '../../../lib/avis'
import { alerterAdmin } from '../../../lib/avis-mail'

export const runtime = 'nodejs'

const CHAMP_MAX = 600

function texte(v) {
  return (v || '').toString().trim().slice(0, CHAMP_MAX) || null
}

function entier(v, min, max) {
  const n = Number(v)
  if (!Number.isFinite(n) || n < min || n > max) return null
  return Math.round(n)
}

function listeDeSoucis(v) {
  if (!Array.isArray(v)) return []
  return [...new Set(v.map((x) => (x || '').toString().slice(0, 30)).filter(Boolean))].slice(0, 8)
}

// Qui répond ? On ne fait jamais confiance à un rôle annoncé par le navigateur :
// il se déduit du jeton présenté, sans quoi n'importe qui pourrait déposer un
// avis « organisateur » sur l'événement d'un autre.
async function resoudre(body) {
  const jetonOrga = texte(body.o)
  if (jetonOrga) {
    const { data } = await selectRows(
      'events',
      `owner_token=eq.${encodeURIComponent(jetonOrga)}&select=id,name,owner_email,survey_mailed_at&limit=1`
    )
    const ev = Array.isArray(data) ? data[0] : null
    if (!ev) return null
    return { role: 'organisateur', canal: 'mail', ev, guest: null }
  }

  const jetonInvite = texte(body.i)
  if (jetonInvite) {
    const { data } = await selectRows(
      'guests',
      `token=eq.${encodeURIComponent(jetonInvite)}&select=id,event_id,display_name,feedback_at&limit=1`
    )
    const g = Array.isArray(data) ? data[0] : null
    if (!g) return null
    const ev = await evenement(g.event_id)
    return { role: 'invite', canal: 'mail', ev, guest: g }
  }

  const eventId = texte(body.eventId)
  const deviceToken = texte(body.deviceToken)
  if (!eventId || !deviceToken) return null
  const { data } = await selectRows(
    'guests',
    `event_id=eq.${eventId}&device_token=eq.${encodeURIComponent(deviceToken)}&select=id,event_id,display_name,feedback_at&limit=1`
  )
  const g = Array.isArray(data) ? data[0] : null
  const ev = await evenement(eventId)
  if (!ev) return null
  // Sans fiche d'invité (album ouvert depuis un appareil qui n'a jamais joué),
  // l'avis compte quand même : c'est un regard sur l'album, il vaut d'être lu.
  return { role: 'invite', canal: 'album', ev, guest: g }
}

async function evenement(id) {
  if (!id) return null
  const { data } = await selectRows('events', `id=eq.${id}&select=id,name,owner_email&limit=1`)
  return Array.isArray(data) ? data[0] : null
}

// --- Qui suis-je, et ai-je déjà répondu ? (ouverture de la page d'enquête) ---
export async function GET(request) {
  const url = new URL(request.url)
  const qui = await resoudre({ o: url.searchParams.get('o'), i: url.searchParams.get('i') })
  if (!qui) return Response.json({ error: 'Lien inconnu ou expiré.' }, { status: 404 })

  // Une seule réponse par personne : on ne redemande jamais, y compris à
  // quelqu'un qui rouvre le mail des semaines plus tard.
  const deja = qui.role === 'organisateur'
    ? await dejaRepondu('event_id', qui.ev?.id, 'organisateur')
    : !!qui.guest?.feedback_at

  return Response.json({
    role: qui.role,
    eventName: qui.ev?.name || null,
    guestName: qui.guest?.display_name || null,
    deja,
  })
}

async function dejaRepondu(colonne, valeur, role) {
  if (!valeur) return false
  const { data } = await selectRows('feedback', `${colonne}=eq.${valeur}&role=eq.${role}&select=id&limit=1`)
  return Array.isArray(data) && data.length > 0
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}))
  const qui = await resoudre(body)
  if (!qui) return Response.json({ error: 'Lien inconnu ou expiré.' }, { status: 404 })

  // Anti-doublon. Côté invité il repose sur la fiche, pas sur le navigateur :
  // quelqu'un qui a répondu par mail ne doit pas revoir la question en ouvrant
  // l'album depuis un autre téléphone, et réciproquement.
  if (qui.role === 'organisateur') {
    if (await dejaRepondu('event_id', qui.ev?.id, 'organisateur')) {
      return Response.json({ deja: true })
    }
  } else if (qui.guest?.feedback_at) {
    return Response.json({ deja: true })
  }

  const soucis = listeDeSoucis(body.issues)
  const ligne = {
    event_id: qui.ev?.id || null,
    // Le nom est recopié : dans six mois l'événement aura disparu, l'avis non.
    event_name: qui.ev?.name || null,
    guest_id: qui.guest?.id || null,
    role: qui.role,
    canal: qui.canal,
    rating: entier(body.rating, 1, 4),
    issues: soucis,
    issue_detail: texte(body.issueDetail),
    suggestion: texte(body.suggestion),
    device: texte(request.headers.get('user-agent')),
  }

  if (qui.role === 'organisateur') {
    ligne.nps = entier(body.nps, 0, 10)
    ligne.nps_reason = texte(body.npsReason)
    ligne.favorite = texte(body.favorite)
    ligne.source = texte(body.source)
    ligne.call_ok = !!body.callOk
    // Le numéro ne se garde que si l'appel est accepté : le champ reste visible
    // une seconde après avoir décoché, il ne doit pas partir malgré tout.
    ligne.phone = body.callOk ? texte(body.phone) : null
    ligne.contact_email = qui.ev?.owner_email || null
  } else {
    const veut = (body.wouldHost || '').toString()
    ligne.would_host = ['oui', 'peut-etre', 'non'].includes(veut) ? veut : null
  }

  const cree = await insertRow('feedback', ligne)
  if (!cree.ok) {
    console.error('avis : enregistrement impossible', cree.data)
    return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  }

  // Marquage anti-doublon. Un échec ici ne doit pas perdre l'avis : au pire la
  // question réapparaîtra une fois, ce qui est moins grave que la perdre.
  try {
    if (qui.role === 'organisateur') {
      // Répondre vaut relance reçue : celui qui a déjà donné son avis ne doit
      // pas trouver le mail d'enquête dans sa boîte le lendemain.
      if (!qui.ev.survey_mailed_at) {
        await updateRow('events', `id=eq.${qui.ev.id}`, { survey_mailed_at: new Date().toISOString() })
      }
    } else if (qui.guest?.id) {
      await updateRow('guests', `id=eq.${qui.guest.id}`, { feedback_at: new Date().toISOString() })
    }
  } catch (err) { console.error('avis : marquage', err) }

  // Ce qui brûle part tout de suite ; le reste attend le récap du lendemain.
  // Sans ce tri, un mariage de cent invités rendrait la boîte inutilisable et
  // l'alerte qui comptait passerait inaperçue.
  if (estUneAlerte({ ...ligne, rating: ligne.rating, nps: ligne.nps }) || qui.role === 'organisateur') {
    try { await alerterAdmin({ avis: { ...ligne, id: cree.data?.id }, eventName: qui.ev?.name, guestName: qui.guest?.display_name }) }
    catch (err) { console.error('avis : alerte admin', err) }
  }

  return Response.json({ ok: true, id: cree.data?.id || null })
}
