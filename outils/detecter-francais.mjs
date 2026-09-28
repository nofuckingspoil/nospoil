// Repère le français oublié dans un texte censé être anglais ou allemand.
//
//   node outils/detecter-francais.mjs <fichier.txt>   (ou texte sur l'entrée standard)
//
// Exporté aussi pour les autres scripts : phrasesFrancaises(texte).
import fs from 'node:fs'

// Mots très français, rares en anglais et en allemand.
const MOTS = [
  'vous', 'votre', 'vos', 'nous', 'notre', 'avec', 'pour', 'dans', 'sont', 'est-ce', 'aussi',
  'les', 'une', 'aux', 'du', 'au', 'et', 'ou', 'où', 'qui', 'que', 'quoi', 'pas',
  'mais', 'ici', 'déjà', 'soirée', 'invités', 'participants', 'organisateur', 'révélation',
  'appareil', 'télécharger', 'créer', 'événement', 'fête', 'mariage', 'bientôt', 'encore', 'jusqu',
  "c'est", "d'un", "d'une", "l'album", "n'est", "qu'", "s'il", 'cette', 'ces', 'être', 'fois', 'très',
]
const RE_MOT = new RegExp(`(^|[\\s«"'(])(${MOTS.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?=[\\s,.;:!?»"')]|$)`, 'gi')
const ACCENTS_FR = /[éèêàùçœîôû]/i

export function phrasesFrancaises(texte) {
  const suspects = []
  const morceaux = String(texte)
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2)
  for (const s of morceaux) {
    // Noms propres et adresses tolérés.
    const nettoye = s.replace(/Time to Flash|timetoflash\.fr|Français|BLACK BY C|https?:\/\/\S+|\S+@\S+/g, '')
    const mots = nettoye.match(RE_MOT) || []
    const accents = (nettoye.match(new RegExp(ACCENTS_FR.source, 'gi')) || []).length
    // L'allemand a ses propres accents (ä, ö, ü) : on ne compte que les accents français.
    const score = mots.length * 2 + accents
    const court = nettoye.split(/\s+/).length <= 3
    if ((court && (accents >= 1 || mots.length >= 1) && /[a-zéèà]/i.test(nettoye)) || score >= 4) {
      suspects.push(s.slice(0, 200))
    }
  }
  return [...new Set(suspects)]
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const entree = process.argv[2] ? fs.readFileSync(process.argv[2], 'utf8') : fs.readFileSync(0, 'utf8')
  const r = phrasesFrancaises(entree)
  r.forEach((p) => console.log('•', p))
  console.log(r.length ? `${r.length} phrase(s) suspecte(s)` : '✓ aucun français repéré')
}
