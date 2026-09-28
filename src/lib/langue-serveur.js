// La langue d'une requête reçue par l'API.
//
// Dans l'ordre : l'en-tête X-Langue (envoyé par l'app iPhone et l'extrait
// d'app), le cookie du site (choix du visiteur ou langue de la page), puis la
// langue du navigateur. On la mémorise sur l'événement, le participant ou le
// compte, pour que les mails envoyés plus tard (rappels, révélation, tirages)
// partent dans la bonne langue.
import { LANGUE_PAR_DEFAUT, devinerLangue, langueValide } from './i18n'

export function langueRequete(req) {
  const entete = langueValide(req?.headers?.get?.('x-langue'))
  if (entete) return entete
  const cookie = req?.cookies?.get?.('ttf_langue')?.value
  if (langueValide(cookie)) return cookie
  const accept = req?.headers?.get?.('accept-language')
  return accept ? devinerLangue(accept) : LANGUE_PAR_DEFAUT
}

// Langue mémorisée sur une ligne de la base (événement, participant…), avec
// repli sur le français pour tout ce qui existait avant les traductions.
export function langueDe(ligne, secours = LANGUE_PAR_DEFAUT) {
  return langueValide(ligne?.langue) || langueValide(secours) || LANGUE_PAR_DEFAUT
}
