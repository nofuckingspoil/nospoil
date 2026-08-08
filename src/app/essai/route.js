import { insertRow } from '../../lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ============================================================
//  « Essayer Time to Flash » : le QR de la page d'accueil.
//
//  Un événement de démonstration partagé aurait mêlé les photos
//  d'inconnus dans un même album. Chaque visiteur repart donc avec
//  le sien, créé à la volée, qui s'efface le lendemain.
//
//  L'adresse est fixe : le QR imprimé sur la page reste valable,
//  et rien n'est créé tant que personne ne le scanne.
// ============================================================

// Assez court pour qu'on voie l'album se révéler sans s'ennuyer, assez long
// pour comprendre le principe : on prend, on attend, on découvre.
const REVELATION_MIN = 3
const CLICHES = 3

// Les robots d'indexation suivent les liens : sans ce filtre, chaque passage
// de Googlebot fabriquerait un événement.
function estUnRobot(ua = '') {
  return /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|whatsapp|telegram|preview/i.test(ua)
}

export async function GET(request) {
  const base = new URL(request.url).origin

  if (estUnRobot(request.headers.get('user-agent') || '')) {
    return Response.redirect(`${base}/`, 302)
  }

  const maintenant = Date.now()
  const reveal = new Date(maintenant + REVELATION_MIN * 60 * 1000)

  const { ok, data } = await insertRow('events', {
    owner_token: `demo-${Math.random().toString(36).slice(2)}${maintenant.toString(36)}`,
    name: 'Votre essai Time to Flash',
    host_names: 'Essai',
    shots_per_guest: CLICHES,
    bonus_shots: 0,
    starts_at: new Date(maintenant - 60 * 1000).toISOString(), // déjà commencé : on photographie tout de suite
    reveal_at: reveal.toISOString(),
    expires_at: new Date(maintenant + 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    max_guests: 5,
    paid_cents: 0,
    is_demo: true,
    is_test: true, // hors statistiques : un essai n'est pas une vente
  })

  if (!ok || !data?.id) {
    console.error('création démo impossible:', data)
    return Response.redirect(`${base}/?essai=indisponible`, 302)
  }

  return Response.redirect(`${base}/j/${data.id}`, 302)
}
