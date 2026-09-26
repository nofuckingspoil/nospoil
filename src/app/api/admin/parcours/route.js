// ============================================================
//  Les parcours, pour l'admin du site (page /admin/parcours).
//
//  Lit la table `etapes` (le compteur anonyme, voir /api/etape) et en tire
//  deux entonnoirs : celui des invités, celui des organisateurs.
//
//  COMMENT ON COMPTE
//  On part des personnes qui ont franchi la première étape pendant la période
//  (l'arrivée sur la soirée, ou sur la création). Pour chacune, on regarde
//  jusqu'où elle est allée sur le chemin principal : atteindre une étape
//  compte aussi pour toutes celles d'avant. Quelqu'un qui revient avec son
//  lien personnel ne revoit pas le formulaire, et le viseur de secours
//  (appareil photo du téléphone) n'affiche jamais « camera_ok » ; ils ont
//  pourtant franchi ces marches, puisqu'ils ont pris une photo.
//
//  Les étapes hors du chemin (l'album, le code, le paiement) se comptent parmi
//  les mêmes personnes, sans rien supposer. Les problèmes se comptent à part.
//
//  Protégé par la clé ADMIN_KEY (en-tête x-admin-key), comme le reste.
// ============================================================
import { selectRows } from '../../../../lib/supabase'
import { estUuid, identifiantInvalide } from '../../../../lib/params'
import { ETAPES_INVITE, ETAPES_PROBLEME, ETAPES_ORGA, SUPPORTS } from '../../../../lib/etapes-liste'

export const runtime = 'nodejs'

const PAGE = 1000
const PLAFOND_LIGNES = 100000
const PERIODES = { '7': 7, '30': 30 }

// PostgREST ne rend jamais plus de mille lignes d'un coup : on tourne les pages.
async function toutLire(table, query) {
  const lignes = []
  for (let offset = 0; offset < PLAFOND_LIGNES; offset += PAGE) {
    const { ok, data } = await selectRows(table, `${query}&limit=${PAGE}&offset=${offset}`)
    if (!ok || !Array.isArray(data)) return null
    lignes.push(...data)
    if (data.length < PAGE) break
  }
  return lignes
}

function supportsVides() {
  return Object.fromEntries(SUPPORTS.map((s) => [s, 0]))
}

// Les précisions les plus fréquentes d'une liste de lignes.
function classerDetails(lignes, max = 6) {
  const acc = {}
  for (const l of lignes) {
    if (!l.detail) continue
    acc[l.detail] = (acc[l.detail] || 0) + 1
  }
  return Object.entries(acc)
    .map(([detail, n]) => ({ detail, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, max)
}

// Un entonnoir. `parPersonne` : clé de personne → { étape → ligne }.
function entonnoir(parPersonne, liste, depart) {
  const chaine = liste.filter((e) => e.chaine).map((e) => e.id)
  const cohorte = [...parPersonne.values()].filter((p) => p[depart])

  const etapes = liste.map((e) => {
    const rang = chaine.indexOf(e.id)
    const supports = supportsVides()
    const lignes = []
    let n = 0
    for (const p of cohorte) {
      let atteinte
      if (rang >= 0) {
        // Plus loin sur le chemin = passé par ici.
        atteinte = chaine.slice(rang).some((id) => p[id])
      } else {
        atteinte = !!p[e.id]
      }
      if (!atteinte) continue
      n++
      // Le support de l'étape elle-même quand on l'a, sinon celui de l'arrivée.
      const ligne = p[e.id] || p[depart]
      if (supports[ligne.support] !== undefined) supports[ligne.support]++
      if (p[e.id]) lignes.push(p[e.id])
    }
    return {
      id: e.id,
      label: e.label,
      chaine: !!e.chaine,
      n,
      // Combien l'ont réellement envoyée : l'écart avec `n` se lit comme
      // « passés par là sans que la page le voie » (reconnexion, viseur de
      // secours).
      vus: lignes.length,
      supports,
      details: classerDetails(lignes, 4),
    }
  })

  return { depart: cohorte.length, etapes }
}

export async function GET(request) {
  const key = request.headers.get('x-admin-key')
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return Response.json({ error: 'Accès refusé.' }, { status: 401 })
  }

  const sp = new URL(request.url).searchParams
  const eventId = sp.get('event') || ''
  if (eventId && !estUuid(eventId)) return identifiantInvalide()
  const jours = PERIODES[sp.get('periode')] || null
  const depuis = jours ? new Date(Date.now() - jours * 86400000).toISOString() : null

  // Les vraies soirées, pour le filtre, et les essais, pour les écarter : la
  // route d'écriture les refuse déjà, mais une soirée peut être marquée
  // « test » après coup.
  const evRes = await selectRows(
    'events',
    'select=id,name,created_at,is_test,is_demo&order=created_at.desc'
  )
  if (!evRes.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  const tousEvents = Array.isArray(evRes.data) ? evRes.data : []
  const exclus = new Set(tousEvents.filter((e) => e.is_test || e.is_demo).map((e) => e.id))
  const events = tousEvents
    .filter((e) => !e.is_test && !e.is_demo)
    .map((e) => ({ id: e.id, name: e.name, createdAt: e.created_at }))

  const filtreDate = depuis ? `created_at=gte.${depuis}&` : ''
  const select = 'select=event_id,visiteur,etape,support,detail,created_at&order=id.asc'

  const [lignesInvites, lignesOrga, premiere] = await Promise.all([
    toutLire('etapes', `${filtreDate}event_id=${eventId ? `eq.${eventId}` : 'not.is.null'}&etape=not.like.crea_*&${select}`),
    toutLire('etapes', `${filtreDate}etape=like.crea_*&${select}`),
    selectRows('etapes', 'select=created_at&order=created_at.asc&limit=1'),
  ])
  if (!lignesInvites || !lignesOrga) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })

  // --- Invités : une personne = un appareil dans une soirée.
  const invites = new Map()
  const problemes = Object.fromEntries(ETAPES_PROBLEME.map((e) => [e.id, []]))
  let albumTotal = 0
  for (const l of lignesInvites) {
    if (exclus.has(l.event_id)) continue
    if (problemes[l.etape]) { problemes[l.etape].push(l); continue }
    if (l.etape === 'album') albumTotal++
    const cle = `${l.visiteur}|${l.event_id}`
    const p = invites.get(cle) || {}
    p[l.etape] = l
    invites.set(cle, p)
  }

  // --- Organisateurs : une personne = un appareil (le tunnel n'a pas encore
  // de soirée, sauf à la toute fin).
  const orgas = new Map()
  for (const l of lignesOrga) {
    if (l.event_id && exclus.has(l.event_id)) continue
    const p = orgas.get(l.visiteur) || {}
    if (!p[l.etape]) p[l.etape] = l
    orgas.set(l.visiteur, p)
  }

  const debut = Array.isArray(premiere.data) && premiere.data[0] ? premiere.data[0].created_at : null

  return Response.json({
    debut,
    events,
    invites: {
      ...entonnoir(invites, ETAPES_INVITE, 'ouverture'),
      albumTotal,
      problemes: ETAPES_PROBLEME.map((e) => {
        const lignes = problemes[e.id]
        const supports = supportsVides()
        for (const l of lignes) if (supports[l.support] !== undefined) supports[l.support]++
        return { id: e.id, label: e.label, n: lignes.length, supports, details: classerDetails(lignes) }
      }),
    },
    orgas: entonnoir(orgas, ETAPES_ORGA, 'crea_ouverture'),
  })
}
