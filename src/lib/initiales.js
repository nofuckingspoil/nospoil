// Les initiales du carton de repli, quand la soirée n'a pas de couverture.
//
// « Claire & Martin » donne « C&M ». « Mariage de Romane et Sacha » doit
// donner « R&S », pas « M&S » : on saute le type de soirée et les petits mots
// (« de », « d' », « du »…) pour tomber sur le prénom. « Banc d'essai » ne
// doit pas donner « B&D » : l'esperluette annoncerait un couple là où il n'y a
// qu'un nom. On ne la met donc que si le nom en porte vraiment une, ou un
// « et » entre deux mots. Sinon, une seule lettre suffit.

const MOTS_SOIREE = new Set([
  'mariage', 'anniversaire', 'anniv', 'soirée', 'soiree', 'fête', 'fete',
  'baptême', 'bapteme', 'pacs', 'noces', 'fiançailles', 'fiancailles',
  'evjf', 'evg', 'enterrement', 'vie', 'garçon', 'garcon', 'jeune', 'fille',
  'cérémonie', 'ceremonie', 'réception', 'reception', 'week-end', 'weekend',
  'brunch', 'dîner', 'diner', 'the', 'wedding', 'party', 'of',
  'les', 'le', 'la', 'ans',
])

function premiereLettre(morceau) {
  const mots = morceau.split(/\s+/).filter(Boolean)
  for (const brut of mots) {
    const mot = brut.replace(/^[a-z]{1,2}['’]/i, '') // « d'Anna » → « Anna »
    if (!mot) continue
    const debut = mot[0]
    if (!/\p{L}/u.test(debut)) continue
    if (MOTS_SOIREE.has(mot.toLowerCase())) continue
    if (debut !== debut.toUpperCase()) continue // « de », « du », « la »…
    return debut.toUpperCase()
  }
  // Rien de mieux : la toute première lettre du morceau.
  const lettre = morceau.match(/\p{L}/u)
  return lettre ? lettre[0].toUpperCase() : ''
}

export function initialesDe(nom) {
  const brut = String(nom || '').trim()
  if (!brut) return '✳'
  const couple = brut.split(/\s*(?:&|\+|\bet\b)\s*/i).filter((m) => m.trim())
  if (couple.length >= 2) {
    const a = premiereLettre(couple[0])
    const b = premiereLettre(couple[1])
    if (a && b) return `${a}&${b}`
  }
  return premiereLettre(brut) || '✳'
}
