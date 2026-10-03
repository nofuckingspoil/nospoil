// ============================================================
//  Les essais du site, pour l'admin (page /admin/essais).
//
//  Trois choses :
//   1. le carnet des essais (table `essais`) sur la période : d'où venaient
//      les gens, et jusqu'où ils sont allés ;
//   2. les personnes qui ont laissé leur adresse pendant un essai, et si elles
//      ont ensuite créé une vraie soirée ;
//   3. celles qui ont coché « recevoir des nouvelles », les seules à qui l'on
//      a le droit d'écrire pour autre chose que leur essai.
//
//  Protégé par la clé ADMIN_KEY (en-tête x-admin-key), comme le reste.
// ============================================================
import { selectRows } from '../../../../lib/supabase'

export const runtime = 'nodejs'

const PERIODES = { '7': 7, '30': 30, '90': 90, tout: null }

export async function GET(request) {
  const key = request.headers.get('x-admin-key')
  if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return Response.json({ error: 'Accès refusé.' }, { status: 401 })
  }

  const p = new URL(request.url).searchParams.get('periode') || '30'
  const jours = p in PERIODES ? PERIODES[p] : 30
  const depuis = jours ? `&created_at=gte.${new Date(Date.now() - jours * 86400000).toISOString()}` : ''

  const [carnet, adresses] = await Promise.all([
    selectRows('essais', `select=*${depuis}&order=created_at.desc&limit=5000`),
    selectRows('accounts', 'select=id,name,email,langue,tried_demo_at,news_ok_at,news_optout_at&tried_demo_at=not.is.null&order=tried_demo_at.desc&limit=2000'),
  ])
  if (!carnet.ok || !adresses.ok) return Response.json({ error: 'Erreur serveur.' }, { status: 500 })
  const essais = Array.isArray(carnet.data) ? carnet.data : []
  const comptes = Array.isArray(adresses.data) ? adresses.data : []

  // Ceux qui sont passés de l'essai à une vraie soirée : on cherche les
  // soirées créées avec la même adresse, après l'essai.
  const mails = comptes.map((c) => c.email).filter(Boolean)
  const soirees = {}
  if (mails.length) {
    const liste = mails.map((m) => `"${m.replace(/"/g, '')}"`).join(',')
    const { data } = await selectRows(
      'events',
      `select=name,owner_email,created_at,paid_cents&is_demo=is.false&is_test=is.false&owner_email=in.(${encodeURIComponent(liste)})&order=created_at.asc`
    )
    for (const ev of Array.isArray(data) ? data : []) {
      const m = (ev.owner_email || '').toLowerCase()
      ;(soirees[m] ||= []).push(ev)
    }
  }

  const personnes = comptes.map((c) => {
    const apres = (soirees[(c.email || '').toLowerCase()] || []).filter((ev) => ev.created_at >= c.tried_demo_at)
    return {
      nom: c.name,
      email: c.email,
      langue: c.langue,
      essaiLe: c.tried_demo_at,
      nouvelles: !!c.news_ok_at && !c.news_optout_at,
      nouvellesLe: c.news_ok_at,
      soirees: apres.map((ev) => ({ nom: ev.name, le: ev.created_at, euros: (ev.paid_cents || 0) / 100 })),
    }
  })

  // L'entonnoir et les provenances, sur le carnet de la période.
  const compter = (filtre) => essais.filter(filtre).length
  const entonnoir = [
    { id: 'cree', label: 'Lance un essai', n: essais.length },
    { id: 'ouvert', label: 'Arrive sur l’appareil', n: compter((e) => e.ouvert_at || e.inscrit_at || e.photo_at) },
    { id: 'inscrit', label: 'Donne son prénom', n: compter((e) => e.inscrit_at || e.photo_at) },
    { id: 'photo', label: 'Prend une photo', n: compter((e) => e.photo_at) },
    { id: 'album', label: 'Voit l’album révélé', n: compter((e) => e.album_at) },
    { id: 'mail', label: 'Laisse son adresse', n: compter((e) => e.mail_at) },
    { id: 'nouvelles', label: 'Accepte les nouvelles', n: compter((e) => e.nouvelles_at) },
  ]

  const groupes = {}
  for (const e of essais) {
    const cle = `${e.source || 'direct'}|${e.medium || ''}|${e.campagne || ''}`
    const g = (groupes[cle] ||= { source: e.source || 'direct', medium: e.medium || '', campagne: e.campagne || '', n: 0, photo: 0, mail: 0 })
    g.n++
    if (e.photo_at) g.photo++
    if (e.mail_at) g.mail++
  }
  const provenances = Object.values(groupes).sort((a, b) => b.n - a.n)

  // « Comment avez-vous découvert Time to Flash ? », posée après la création.
  const { data: repondus } = await selectRows(
    'events',
    `select=name,decouverte,decouverte_detail,decouverte_at,prov_source,paid_cents&decouverte=not.is.null&is_demo=is.false&is_test=is.false${depuis.replace('created_at', 'decouverte_at')}&order=decouverte_at.desc&limit=2000`
  )
  const reponses = (Array.isArray(repondus) ? repondus : []).map((e) => ({
    soiree: e.name,
    choix: e.decouverte,
    detail: e.decouverte_detail,
    le: e.decouverte_at,
    mesure: e.prov_source,
    euros: (e.paid_cents || 0) / 100,
  }))

  return Response.json({
    periode: p in PERIODES ? p : '30',
    entonnoir,
    via: { qr: compter((e) => e.via === 'qr'), bouton: compter((e) => e.via === 'bouton'), direct: compter((e) => e.via === 'direct') },
    provenances,
    personnes,
    reponses,
    // La date de mise en route du carnet : avant elle, seules les adresses
    // laissées existent, sans provenance ni étapes.
    carnetDepuis: '2026-10-03',
  })
}
