// Articles ajoutés le 10/10/2026 (grand public + prestataires), un fichier par série.
import * as grandPublic from './grand-public'
import * as retroplanning from './retroplanning'
import * as weddingPlanners from './wedding-planners'
import * as photographes from './photographes'
import * as lieux from './lieux'

const SERIES = [grandPublic, retroplanning, weddingPlanners, photographes, lieux]

export const POSTS_NOUVEAUX = SERIES.flatMap((s) => s.POSTS)
export const POSTS_NOUVEAUX_EN = Object.assign({}, ...SERIES.map((s) => s.POSTS_EN))
export const POSTS_NOUVEAUX_DE = Object.assign({}, ...SERIES.map((s) => s.POSTS_DE))
