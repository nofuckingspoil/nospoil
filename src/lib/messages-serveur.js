// ============================================================
//  Messages d'erreur renvoyés par l'API, dans la langue du visiteur.
//
//  Certains viennent tout faits de la base (fonctions SQL join_event,
//  take_photo, delete_photo…) et sont écrits en français : on les traduit
//  ici au passage, sans toucher à la base. Un message inconnu ressort tel
//  quel.
// ============================================================
import { t } from './i18n'

const MESSAGES_BASE = {
  'Événement introuvable.': { en: 'Event not found.', de: 'Event nicht gefunden.' },
  'Photo introuvable.': { en: 'Photo not found.', de: 'Foto nicht gefunden.' },
  'Tu as utilisé tous tes clichés.': { en: 'You have used all your shots.', de: 'Sie haben alle Ihre Aufnahmen verbraucht.' },
  'Code manquant.': { en: 'Code missing.', de: 'Code fehlt.' },
  'Code promo invalide ou épuisé.': { en: 'Invalid or used-up promo code.', de: 'Ungültiger oder aufgebrauchter Gutscheincode.' },
}

export function messageBase(message, langue) {
  const m = MESSAGES_BASE[message]
  return m ? t({ fr: message, ...m }, langue) : message
}

// Les messages qui reviennent dans beaucoup de routes.
export const ERREURS = {
  serveur: { fr: 'Erreur serveur.', en: 'Server error.', de: 'Serverfehler.' },
  nonAutorise: { fr: 'Non autorisé.', en: 'Not authorised.', de: 'Nicht berechtigt.' },
  introuvable: { fr: 'Événement introuvable.', en: 'Event not found.', de: 'Event nicht gefunden.' },
  parametres: { fr: 'Paramètres manquants.', en: 'Missing parameters.', de: 'Fehlende Parameter.' },
}

export function erreur(cle, langue) {
  return t(ERREURS[cle] || ERREURS.serveur, langue)
}
