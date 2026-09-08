# Générateur de Reel

Fabrique une vidéo verticale à partir d'un dossier de photos : le nom de
l'événement et sa date, puis les photos qui tombent une à une sur la pile dans
un flash et un bruit de déclencheur, puis le logo Time to Flash.

Sortie : 1080x1920, 30 images par seconde, H.264, son AAC, prête à publier.

## Avant la première utilisation

```bash
brew install ffmpeg
pip3 install -r outils/reel/requirements.txt
python3 outils/reel/faire_declencheur.py
python3 outils/reel/faire_musique.py
```

Les deux dernières lignes fabriquent le son : le déclencheur, avec la recette
exacte de l'application, et une musique de fond synthétisée. Cette musique
n'appartient à personne d'autre, elle ne peut donc jamais être coupée par
Instagram. Voir `assets/NOTES.md` pour la remplacer par autre chose.

## Le studio : choisir les photos à l'écran

```bash
python3 outils/reel/studio.py
```

Une page s'ouvre dans le navigateur. Elle liste vos événements, montre leurs
photos, et vous en cochez dix. La vidéo se fabrique et atterrit sur le bureau.
C'est la façon normale d'utiliser l'outil ; tout ce qui suit est la version en
ligne de commande, pour les cas particuliers.

Ce qu'il fait tout seul : l'ordre des photos suit l'ordre où vous les cochez,
la couverture de l'événement ouvre la vidéo, le titre et la date sont préremplis.

Tout tourne sur cette machine. Le serveur n'écoute que sur `127.0.0.1`, jamais
sur le réseau : il lit la base de production avec la clé de service, il n'a
rien à faire ailleurs. Les identifiants viennent du `.env` du site.

## Quelle durée choisir

| | Durée | Pour quoi |
|---|---|---|
| **Story** | 15 s | L'unité historique d'une story. Au-delà, elle se coupe en plusieurs cartes. |
| **Reel** | 20 à 30 s | Le format qui marche : assez long pour raconter, assez court pour être revu. |
| **Posé** | 40 s | Quand les photos méritent qu'on s'arrête. La rétention baisse. |

Un Reel peut techniquement durer bien plus longtemps, mais ce n'est pas la
question : ce qui compte est la part de la vidéo réellement regardée. Avec dix
photos, viser vingt à vingt-cinq secondes laisse deux secondes par image, ce
qui est le minimum pour reconnaître un visage.

## Utilisation en ligne de commande

```bash
python3 outils/reel/reel.py \
  --photos ~/Desktop/mariage-lea-tom \
  --music outils/reel/assets/musique.mp3 \
  --shutter outils/reel/assets/declencheur.wav \
  --titre "Léa & Tom" \
  --date 2026-06-12 \
  --out ~/Desktop/reel-lea-tom.mp4
```

Pendant les réglages, ajoutez `--preview` : seules les cinq premières photos
sont montées, ce qui prend quelques secondes au lieu de quelques minutes.

## Les options

| Option | Ce qu'elle fait |
|---|---|
| `--photos` | Le dossier d'images. Elles passent dans l'ordre alphabétique du nom de fichier. |
| `--music` | La musique de fond. Elle tourne en boucle si elle est plus courte que la vidéo. |
| `--shutter` | Le bruit de déclencheur (un wav court). |
| `--out` | Le fichier MP4 à écrire. |
| `--titre` | Le nom de l'événement, affiché au début. Sans lui, la vidéo commence directement par les photos. |
| `--date` | `2026-06-12` devient « 12 juin 2026 ». Tout autre texte est repris tel quel. |
| `--duree` | Durée totale visée, en secondes. L'intervalle entre deux photos s'en déduit. C'est le réglage à utiliser. |
| `--interval` | Secondes entre deux apparitions, si l'on préfère régler ça directement. 1,5 par défaut. |
| `--bpm` | Cale les apparitions sur un tempo : les photos tombent alors sur la musique. La durée obtenue s'écarte un peu de la durée visée, c'est le prix du calage. |
| `--muet` | Aucune musique, seulement les déclencheurs. À utiliser pour poser un son du moment depuis Instagram. |
| `--cover` | Photo de couverture, montrée pendant l'ouverture derrière le titre. |
| `--captions` | Un CSV `nom_fichier,legende` pour écrire un mot sous chaque photo. |
| `--seed` | Deux exécutions avec la même graine donnent exactement la même vidéo. Changez-la pour rejeter les dés. |
| `--preview` | Ne monte que les cinq premières photos. |
| `--intro` `--outro` | Durée de l'ouverture et de la fin, en secondes. |
| `--gain-declencheur` | Décibels du déclencheur au-dessus de la musique. 6 par défaut. |
| `--crf` | Qualité de l'image : 19 par défaut, 15 pour plus beau et plus lourd, 23 pour l'inverse. |
| `--frames-dir` | Écrit aussi chaque image en PNG, pour aller en regarder une de près. |
| `--police-titre` `--police-manuscrite` | Imposer un fichier de police. |

## Les légendes

Un fichier texte, une ligne par photo :

```csv
nom_fichier,legende
IMG_0412.jpg,Camille · 23h47
IMG_0418.jpg,Le discours
```

Les photos absentes du fichier n'ont pas de légende, c'est très bien. Comptez
une vingtaine de caractères au maximum : au-delà, le texte devient minuscule
sur la bande blanche.

## Combien de temps, combien de place

Quarante photos donnent une vidéo d'environ 37 secondes, montée en 2 à 3
minutes sur un Mac récent, pour un fichier de 25 à 40 Mo.

Les images ne passent pas par le disque : elles vont directement dans ffmpeg.
Rien à nettoyer après coup, et jamais plus de deux images en mémoire à la fois.

## Comment c'est fait

| Fichier | Son métier |
|---|---|
| `studio.py` | Le sélecteur de photos, dans le navigateur. |
| `depot.py` | La lecture des événements (Supabase) et des fichiers (Cloudflare R2). |
| `reel.py` | La ligne de commande : vérifier les entrées, tout enchaîner. |
| `plan.py` | Le déroulé en secondes. Le seul endroit où le hasard intervient. |
| `tirage.py` | Un polaroid : la photo étalonnée, le cadre blanc, l'ombre. |
| `fond.py` | La toile de fond : la dernière photo, floutée et assombrie. |
| `cartes.py` | L'étiquette du début et le voile de fin. |
| `frames.py` | La composition, image par image. |
| `audio.py` | Le graphe de filtres ffmpeg : musique, déclencheurs, duck. |
| `encodage.py` | L'appel à ffmpeg. |
| `faire_declencheur.py` | Fabrique le wav du déclencheur. |
| `faire_musique.py` | Fabrique une musique de fond libre de tout droit. |

L'étalonnage des photos reprend la recette « jetable » du site
(`src/lib/film.js`) : mêmes tables de couleur, mêmes noirs relevés, même
grain. La vidéo ressemble donc à ce que les gens voient dans leur album.

## Quand ça ne marche pas

**« ffmpeg est introuvable »** : `brew install ffmpeg`.

**« Musique introuvable »** ou **« Bruit de déclencheur introuvable »** : le
script refuse de continuer sans son plutôt que de sortir une vidéo muette.
Vérifiez le chemin.

**Le son est coupé sur Instagram** : la musique n'est pas libre de droits. Celle
que fabrique `faire_musique.py` ne peut pas l'être. Voir `assets/NOTES.md`.

**Je veux un son du moment, de ceux qu'on entend partout** : exportez avec
`--muet` (ou la case « Sans musique » du studio), publiez, et ajoutez le son
depuis Instagram. C'est le seul moyen légal de les utiliser, et c'est aussi
celui que l'algorithme récompense : un Reel qui reprend un son en vogue est
poussé vers les gens qui écoutent ce son.

**Une photo est de travers** : elle a été prise téléphone à l'horizontale et
enregistrée ainsi dans l'album. Le montage ne fait que la reprendre.

**Une photo perd ses bords** : le cadrage est carré, pris au centre et
légèrement remonté pour attraper les visages. Une photo de groupe très large
ne rentre pas dans un carré sans qu'il en manque aux extrémités. Il faut la
recadrer avant, ou en choisir une autre.
