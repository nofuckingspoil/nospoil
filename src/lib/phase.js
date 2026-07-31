// ============================================================
//  Phase de l'événement — déduite des dates, jamais d'un bouton.
//
//  L'organisateur n'a rien à basculer : le tableau de bord suit
//  le temps qui passe. Trois moments, une seule carte qui change.
// ============================================================

export const AVANT = 'avant'
export const JOUR_J = 'jourj'
export const APRES = 'apres'

// Une soirée ne dure pas éternellement : passé ce délai après l'heure de début,
// on considère qu'on est « le lendemain », même si la révélation est plus loin.
const DUREE_SOIREE_MS = 12 * 60 * 60 * 1000

// ev : { startsAt, revealAt } — dates ISO. `now` injectable pour les tests.
export function eventPhase(ev, now = Date.now()) {
  const reveal = new Date(ev?.revealAt || 0).getTime()
  const start = ev?.startsAt ? new Date(ev.startsAt).getTime() : null

  // Événement d'avant l'ajout du champ « début » : on se rabat sur la révélation.
  if (!start || isNaN(start)) return now >= reveal ? APRES : AVANT

  const fin = Math.min(reveal, start + DUREE_SOIREE_MS)
  if (now < start) return AVANT
  if (now < fin) return JOUR_J
  return APRES
}

// Les photos sont-elles ouvertes aux invités ?
// La suspension d'urgence de l'organisateur prime sur l'heure.
export function isRevealed(ev, now = Date.now()) {
  if (ev?.revealPaused) return false
  return new Date(ev?.revealAt || 0).getTime() <= now
}

// Le quota de photos par invité se fige au début de la soirée : sinon un invité
// arrivé à 20h et un autre à 22h n'auraient pas joué au même jeu.
export function quotaLocked(ev, now = Date.now()) {
  if (!ev?.startsAt) return true
  return new Date(ev.startsAt).getTime() <= now
}
