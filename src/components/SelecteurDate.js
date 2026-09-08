'use client'

// ============================================================
//  Choisir un jour et une heure, sans la roulette d'iOS.
//
//  Le champ « datetime-local » du navigateur demandait trois gestes et
//  recouvrait l'écran d'un tambour de chiffres. Or c'est l'écran des dates que
//  l'on abandonne le plus : celui où l'organisateur doit se figurer son samedi.
//
//  Un mois entier, donc : on voit les week-ends, on touche le 12, c'est fini.
//  L'heure reste sur sa propre ligne, en dessous : deux décisions, deux
//  contrôles, jamais mélangés.
//
//  LES JOURS IMPOSSIBLES NE SE TOUCHENT PAS. C'est le vrai gain : une fin de
//  fête avant son début n'est plus une erreur qu'on affiche après coup, c'est
//  un jour éteint sur lequel il ne se passe rien.
//
//  Les valeurs entrent et sortent au format des champs du navigateur
//  (« 2026-09-12T19:00 ») : le reste du formulaire n'a rien à savoir d'ici.
// ============================================================

import { useId, useMemo, useState } from 'react'

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const pad = (n) => String(n).padStart(2, '0')

function versValeur(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function versDate(v) {
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

// Minuit du jour d'une date : sert à comparer des jours, jamais des instants.
function jour(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

// Lundi de la semaine où tombe le 1er du mois : le calendrier commence toujours
// sur une colonne « Lun », comme les agendas français.
function debutGrille(annee, mois) {
  const premier = new Date(annee, mois, 1)
  const recul = (premier.getDay() + 6) % 7 // dimanche (0) devient 6
  return new Date(annee, mois, 1 - recul)
}

export default function SelecteurDate({ value, onChange, min, id }) {
  // Une vraie étiquette reliée au champ : « aria-label » suffit aux lecteurs
  // d'écran, pas aux navigateurs, qui signalent un champ sans étiquette.
  const idHeure = useId()
  const choisie = versDate(value) || new Date()
  const minimum = versDate(min)
  const minJour = minimum ? jour(minimum) : null

  // Mois affiché : celui de la date choisie au départ, puis celui que l'on
  // feuillette. Il se recale si la date change depuis l'extérieur.
  const [ancre, setAncre] = useState(() => new Date(choisie.getFullYear(), choisie.getMonth(), 1))
  const [ancreDe, setAncreDe] = useState(value)
  if (ancreDe !== value) {
    setAncreDe(value)
    const m = new Date(choisie.getFullYear(), choisie.getMonth(), 1)
    if (m.getTime() !== ancre.getTime()) setAncre(m)
  }

  const cases = useMemo(() => {
    const depart = debutGrille(ancre.getFullYear(), ancre.getMonth())
    return Array.from({ length: 42 }, (_, i) => new Date(depart.getFullYear(), depart.getMonth(), depart.getDate() + i))
  }, [ancre])

  // Six semaines suffisent toujours, cinq la plupart du temps : on n'affiche
  // pas une ligne vide sous le mois.
  const semaines = []
  for (let i = 0; i < 42; i += 7) {
    const semaine = cases.slice(i, i + 7)
    const utile = semaine.some((d) => d.getMonth() === ancre.getMonth())
    if (utile) semaines.push(semaine)
  }

  const moisTitre = ancre.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  const jourChoisi = jour(choisie)

  function choisirJour(d) {
    const sortie = new Date(d.getFullYear(), d.getMonth(), d.getDate(), choisie.getHours(), choisie.getMinutes())
    onChange(versValeur(sortie))
  }

  function choisirHeure(hhmm) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '')
    if (!m) return
    const sortie = new Date(choisie)
    sortie.setHours(Number(m[1]), Number(m[2]), 0, 0)
    onChange(versValeur(sortie))
  }

  // Un mois entièrement antérieur au minimum n'a rien à montrer : la flèche
  // s'éteint plutôt que d'ouvrir une page de jours gris.
  const moisPrecedentPossible = !minJour || jour(new Date(ancre.getFullYear(), ancre.getMonth(), 0)) >= minJour

  return (
    <div className="cal" id={id}>
      <div className="cal-head">
        <button type="button" className="cal-nav" aria-label="Mois précédent" disabled={!moisPrecedentPossible}
          onClick={() => setAncre(new Date(ancre.getFullYear(), ancre.getMonth() - 1, 1))}>←</button>
        <span className="cal-mois">{moisTitre}</span>
        <button type="button" className="cal-nav" aria-label="Mois suivant"
          onClick={() => setAncre(new Date(ancre.getFullYear(), ancre.getMonth() + 1, 1))}>→</button>
      </div>

      <div className="cal-jours" aria-hidden="true">
        {JOURS.map((j) => <span key={j}>{j}</span>)}
      </div>

      <div className="cal-grille">
        {semaines.flat().map((d) => {
          const horsMois = d.getMonth() !== ancre.getMonth()
          const interdit = minJour !== null && jour(d) < minJour
          const actif = jour(d) === jourChoisi
          return (
            <button key={d.getTime()} type="button" disabled={interdit}
              className={`cal-case${actif ? ' on' : ''}${horsMois ? ' hors' : ''}`}
              aria-current={actif ? 'date' : undefined}
              aria-label={d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              onClick={() => choisirJour(d)}>
              {d.getDate()}
            </button>
          )
        })}
      </div>

      <div className="cal-heure">
        <label className="lbl" htmlFor={idHeure}>Heure</label>
        <input type="time" id={idHeure} name="heure" value={`${pad(choisie.getHours())}:${pad(choisie.getMinutes())}`}
          onChange={(e) => choisirHeure(e.target.value)} />
      </div>
    </div>
  )
}
