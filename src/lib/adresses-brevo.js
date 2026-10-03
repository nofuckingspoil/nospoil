// ============================================================
//  Ce que Brevo sait de nos adresses, recopié chez nous.
//
//  Brevo voit passer deux choses que le site ignore :
//  - les adresses qui ne recevront jamais rien (boîte inconnue, domaine
//    inexistant) : l'organisateur doit le savoir, pour prévenir ce
//    participant autrement ;
//  - les désinscriptions faites depuis le lien du mail : Brevo refuse
//    ensuite tout envoi, et chaque refus déclenchait une alerte inutile.
//
//  On interroge son journal plutôt que d'y brancher un webhook : le compte
//  Brevo est partagé avec The Wokies, on n'y change aucun réglage. Le
//  journal mêle les deux maisons : on ne garde que nos expéditions.
//
//  Protégé par la tâche planifiée qui l'appelle (CRON_SECRET).
// ============================================================
import { selectRows, updateRow } from './supabase'

const API = 'https://api.brevo.com/v3/smtp/statistics/events'
const PAGE = 2500

// Un rejet « temporaire » n'est pas une adresse morte : boîte pleine,
// serveur lent… Seul un domaine introuvable l'est sans aucun doute.
const DOMAINE_MORT = /unable to find mx|domain not found|no mx|nxdomain|host or domain name not found|does not exist/i

function domaineExpediteur() {
  const from = (process.env.BREVO_SENDER_EMAIL || '').toLowerCase()
  return from.slice(from.lastIndexOf('@') + 1) || 'timetoflash.fr'
}

// Une page du journal Brevo pour un type d'événement, sur `jours` jours.
async function journal(evenement, jours) {
  const key = process.env.BREVO_API_KEY
  if (!key) throw new Error('BREVO_API_KEY manquante')
  const domaine = domaineExpediteur()
  const tous = []
  for (let offset = 0; offset < 20 * PAGE; offset += PAGE) {
    const res = await fetch(`${API}?event=${evenement}&days=${jours}&limit=${PAGE}&offset=${offset}&sort=desc`, {
      headers: { 'api-key': key, accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`Brevo ${evenement} : ${res.status} ${await res.text().catch(() => '')}`)
    const d = await res.json().catch(() => ({}))
    const page = Array.isArray(d.events) ? d.events : []
    tous.push(...page)
    if (page.length < PAGE) break
  }
  return tous.filter((e) => (e.from || '').toLowerCase().endsWith('@' + domaine) && e.email)
}

// Les participants qui portent cette adresse, tous événements confondus.
async function marquer(email, patch, champ) {
  const q = `email=eq.${encodeURIComponent(email.toLowerCase())}&${champ}=is.null`
  const { data } = await selectRows('guests', `${q}&select=id`)
  const n = Array.isArray(data) ? data.length : 0
  if (n) await updateRow('guests', q, patch)
  return n
}

// Recopie les adresses mortes et les désinscriptions des `jours` derniers jours.
export async function synchroniserAdresses(jours = 1) {
  const [durs, mous, invalides, desinscrits] = await Promise.all([
    journal('hardBounces', jours),
    journal('softBounces', jours),
    journal('invalid', jours),
    journal('unsubscribed', jours),
  ])

  const mortes = new Map() // adresse → raison
  for (const e of [...durs, ...invalides]) mortes.set(e.email.toLowerCase(), e.reason || e.event || 'rejet')
  for (const e of mous) if (DOMAINE_MORT.test(e.reason || '')) mortes.set(e.email.toLowerCase(), e.reason)

  let adressesKo = 0
  for (const [email, raison] of mortes) {
    adressesKo += await marquer(email, {
      email_ko_at: new Date().toISOString(),
      email_ko_raison: String(raison).slice(0, 300),
    }, 'email_ko_at')
  }

  let desinscriptions = 0
  const vus = new Set()
  for (const e of desinscrits) {
    const email = e.email.toLowerCase()
    if (vus.has(email)) continue
    vus.add(email)
    // `survey_optout` arrête aussi l'enquête et les relances de tirages :
    // Brevo les bloquerait de toute façon.
    desinscriptions += await marquer(email, {
      email_desinscrit_at: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
      survey_optout: true,
    }, 'email_desinscrit_at')
  }

  return { adressesKo, desinscriptions }
}

// Le bilan de la semaine : sur les personnes à qui on a écrit, combien se
// sont désinscrites. Les deux chiffres viennent du même journal, donc du
// même périmètre (nos expéditions seulement).
export async function bilanDesinscriptions(jours = 7) {
  const [envois, desinscrits] = await Promise.all([
    journal('requests', jours),
    journal('unsubscribed', jours),
  ])
  const destinataires = new Set(envois.map((e) => e.email.toLowerCase()))
  const partis = new Map()
  for (const e of desinscrits) {
    const email = e.email.toLowerCase()
    if (!partis.has(email)) partis.set(email, e.subject || '')
  }
  return {
    envois: envois.length,
    destinataires: destinataires.size,
    desinscrits: partis.size,
    // Le mail qui a fait partir chacun : c'est ce qui dit quoi changer.
    parMail: [...partis.values()].reduce((acc, sujet) => {
      acc[sujet] = (acc[sujet] || 0) + 1
      return acc
    }, {}),
  }
}
