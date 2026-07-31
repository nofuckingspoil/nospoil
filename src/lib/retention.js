// ============================================================
//  Durée de conservation des photos — source de vérité unique.
//
//  Les CGV (article 8) et la politique de confidentialité annoncent une
//  suppression définitive 6 mois après la date de révélation. Toute
//  modification ici doit être répercutée dans src/lib/legal.js.
// ============================================================

export const RETENTION_MONTHS = 6

// Alertes envoyées à l'organisateur avant la suppression, en jours restants.
// L'ordre compte : la plus lointaine d'abord.
export const WARNINGS = [
  { key: 'warned_1m_at', days: 30, label: 'un mois' },
  { key: 'warned_1w_at', days: 7, label: 'une semaine' },
]

// Date de suppression définitive d'un événement.
export function purgeDate(revealAt) {
  const d = new Date(revealAt)
  if (isNaN(d.getTime())) return null
  d.setMonth(d.getMonth() + RETENTION_MONTHS)
  return d
}

// Version ISO, prête pour la base (null si la date de révélation est invalide).
export function purgeDateISO(revealAt) {
  const d = purgeDate(revealAt)
  return d ? d.toISOString() : null
}

// Formatage lisible dans les mails : « mardi 16 décembre 2026 ».
export function formatPurgeDate(value) {
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch {
    return ''
  }
}
