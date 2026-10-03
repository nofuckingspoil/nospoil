// ============================================================
//  POST /api/etape : le compteur d'étapes anonyme.
//
//  Sert à voir OÙ les invités et les organisateurs décrochent (page
//  /admin/parcours). Reçoit { eventId?, visiteur, etape, support, detail? }
//  du site, de l'app iPhone et de l'extrait d'app.
//
//  Étapes des invités (eventId obligatoire), dans l'ordre :
//    ouverture     arrivée sur /j/[id] avant la révélation
//    formulaire    le formulaire prénom + mail est affiché
//    inscrit       /api/join a répondu OK (detail : avec_mail | sans_mail)
//    camera_ok     le viseur affiche l'image
//    photo         premier déclic
//    album         ouverture de l'album après la révélation
//  Problèmes (eventId obligatoire), comptés à part :
//    camera_refus  autorisation refusée ou erreur caméra (detail : l'erreur)
//    envoi_coince  une photo n'arrive pas à partir après plusieurs essais
//  Organisateurs (tunnel /create, sans eventId sauf crea_termine) :
//    crea_ouverture, crea_debut, crea_fin, crea_revelation, crea_cliches,
//    crea_revoir, crea_couverture, crea_formule, crea_final,
//    crea_code (gratuit : écran du code), crea_paiement (payant : départ
//    vers Stripe), crea_termine (événement créé, avec son eventId).
//  La liste qui fait foi est dans lib/etapes-liste.js.
//
//  Règles :
//   · répond toujours 204, tout de suite : l'écriture se fait après la
//     réponse. Une mesure ne doit jamais ralentir ni bloquer une page ;
//   · chaque étape ne compte qu'une fois par personne et par soirée (colonne
//     `cle`, doublons ignorés en silence) ;
//   · les soirées inconnues, de test ou d'essai du site ne sont pas comptées ;
//   · rien de personnel n'est gardé : ni IP (elle ne sert qu'au garde-fou de
//     débit, qui l'efface au bout d'un jour), ni prénom, ni mail ; aucun cookie.
// ============================================================
import { after } from 'next/server'
import { insertIgnore, selectRows, updateRow } from '../../../lib/supabase'
import { estUuid } from '../../../lib/params'
import { ipDe, tropDeDemandes } from '../../../lib/rate-limit'
import { etapeConnue, etapeInvite, SUPPORTS } from '../../../lib/etapes-liste'

export const runtime = 'nodejs'

// Généreux exprès : tous les invités d'une salle partagent souvent le même
// wifi, donc la même adresse. Cent personnes qui franchissent six étapes en
// dix minutes, ce n'est pas une attaque, c'est un mariage.
const PLAFOND = { max: 600, minutes: 10 }

const rien = () => new Response(null, { status: 204 })

function lire(corps) {
  const eventIdBrut = corps?.eventId ? String(corps.eventId).trim().toLowerCase() : ''
  const visiteur = typeof corps?.visiteur === 'string' ? corps.visiteur.trim() : ''
  const etape = typeof corps?.etape === 'string' ? corps.etape.trim() : ''
  const support = typeof corps?.support === 'string' ? corps.support.trim() : ''
  const detailBrut = corps?.detail == null ? '' : String(corps.detail).trim()

  if (!etapeConnue(etape)) return null
  if (!SUPPORTS.includes(support)) return null
  if (visiteur.length < 8 || visiteur.length > 80) return null
  if (eventIdBrut && !estUuid(eventIdBrut)) return null
  if (etapeInvite(etape) && !eventIdBrut) return null

  return {
    event_id: eventIdBrut || null,
    visiteur,
    etape,
    support,
    detail: detailBrut ? detailBrut.slice(0, 200) : null,
    cle: `${visiteur}|${eventIdBrut || '-'}|${etape}`,
  }
}

// Les étapes d'un essai qui valent d'être comptées, et leur colonne dans le
// carnet des essais.
const ETAPES_ESSAI = {
  ouverture: 'ouvert_at',
  inscrit: 'inscrit_at',
  photo: 'photo_at',
  album: 'album_at',
}

export async function POST(request) {
  try {
    // sendBeacon n'envoie pas toujours le bon type : on lit le texte brut.
    const texte = await request.text()
    if (!texte || texte.length > 2000) return rien()
    let corps
    try { corps = JSON.parse(texte) } catch { return rien() }

    const ligne = lire(corps)
    if (!ligne) return rien()

    const ip = ipDe(request)
    after(async () => {
      try {
        if (await tropDeDemandes(ip, 'etape', PLAFOND)) return
        // Une soirée inconnue, d'essai ou de démonstration ne compte pas : les
        // essais du site passent par les mêmes pages que les vrais invités, et
        // noieraient l'entonnoir sous des visites qui n'apprennent rien.
        if (ligne.event_id) {
          const { data } = await selectRows(
            'events',
            `id=eq.${ligne.event_id}&select=is_test,is_demo&limit=1`
          )
          const ev = Array.isArray(data) ? data[0] : null
          // Un essai a son propre carnet, à part : on y note l'heure de
          // l'étape franchie, la première fois seulement.
          if (ev?.is_demo) {
            const colonne = ETAPES_ESSAI[ligne.etape]
            if (colonne) {
              await updateRow('essais', `event_id=eq.${ligne.event_id}&${colonne}=is.null`, { [colonne]: new Date().toISOString() })
            }
            return
          }
          if (!ev || ev.is_test) return
        }
        await insertIgnore('etapes', ligne, 'cle')
      } catch (err) {
        console.error('etape : écriture', err)
      }
    })
  } catch {}
  return rien()
}
