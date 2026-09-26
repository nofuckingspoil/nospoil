// La bannière d'iOS, en haut de la page dans Safari.
//
// C'est iOS lui-même qui la dessine, et lui seul sait si l'application est
// installée : elle affiche « OUVRIR » dans ce cas, « OBTENIR » sinon. Aucun
// site ne peut faire cette distinction, c'est délibéré du côté d'Apple.
//
// Elle n'apparaît que dans Safari : les navigateurs de Messenger et
// d'Instagram l'ignorent, comme ils ignorent tout le reste. D'où le bandeau
// maison qui propose d'en sortir (voir OuvrirDansApp).
//
// Seulement là où l'app sert : l'appareil photo, l'album, le tableau de bord
// et « Mes photos ». Surtout pas sur l'accueil ni dans la création : l'app ne
// crée pas d'événement (elle ne vend rien, règle d'Apple), et l'organisateur
// qui la suivait depuis l'accueil s'y retrouvait bloqué.
export const BANNIERE_APP = { 'apple-itunes-app': 'app-id=6801111367' }
