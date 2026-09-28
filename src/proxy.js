import { NextResponse } from 'next/server'
import { LANGUE_PAR_DEFAUT, devinerLangue, langueValide } from './lib/i18n'

// ============================================================
//  Aiguillage des langues.
//
//  Les pages vivent toutes dans app/[lang]/. Les adresses publiques sont :
//    timetoflash.fr/...     le français (ou la langue mémorisée du visiteur)
//    timetoflash.fr/en/...  l'anglais
//    timetoflash.fr/de/...  l'allemand
//
//  Le choix du visiteur est mémorisé dans un cookie. Sans choix, on devine
//  d'après la langue du navigateur.
// ============================================================

export const COOKIE_LANGUE = 'ttf_langue'
const UN_AN = 60 * 60 * 24 * 365

// Pages de l'application : liens partagés par QR code, mails, liens
// universels de l'app iPhone. On ne change jamais leur adresse, la langue
// s'applique sans redirection.
const PAGES_APPLI = /^\/(j|g|event|admin|connexion|mes-evenements|mes-photos|avis|create)(\/|$)/

function memoriser(reponse, langue) {
  reponse.cookies.set(COOKIE_LANGUE, langue, { path: '/', maxAge: UN_AN, sameSite: 'lax' })
  return reponse
}

export function proxy(request) {
  const url = request.nextUrl
  const { pathname } = url
  const prefixe = pathname.match(/^\/(fr|en|de)(?=\/|$)/)

  if (prefixe) {
    const langue = prefixe[1]
    if (langue === LANGUE_PAR_DEFAUT) {
      // /fr/... n'existe pas publiquement : le français est à la racine.
      const cible = url.clone()
      cible.pathname = pathname.slice(3) || '/'
      return memoriser(NextResponse.redirect(cible, 308), langue)
    }
    const reponse = NextResponse.next()
    if (request.cookies.get(COOKIE_LANGUE)?.value !== langue) memoriser(reponse, langue)
    return reponse
  }

  const choisie = langueValide(request.cookies.get(COOKIE_LANGUE)?.value)
  const langue = choisie || devinerLangue(request.headers.get('accept-language'))

  // Une page vitrine demandée dans une autre langue que le français : on
  // envoie vers son adresse dédiée (/en/..., /de/...), celle que Google
  // référence.
  if (langue !== LANGUE_PAR_DEFAUT && !PAGES_APPLI.test(pathname) && request.method === 'GET') {
    const cible = url.clone()
    cible.pathname = `/${langue}${pathname === '/' ? '' : pathname}`
    const reponse = NextResponse.redirect(cible, 307)
    reponse.headers.set('Vary', 'Accept-Language, Cookie')
    return reponse
  }

  const cible = url.clone()
  cible.pathname = `/${langue}${pathname}`
  return NextResponse.rewrite(cible)
}

export const config = {
  // Tout sauf l'API, les fichiers (tout ce qui a un point) et les coulisses
  // de Next.
  matcher: ['/((?!api|_next|essai|\\.well-known|.*\\..*).*)'],
}
