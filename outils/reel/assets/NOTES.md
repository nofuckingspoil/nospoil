# Les fichiers à déposer ici

## `declencheur.wav` (fabriqué, ne rien chercher)

```bash
python3 outils/reel/faire_declencheur.py
```

Le script synthétise les deux clics mécaniques avec la recette exacte de
l'application (voir `playShutter` dans `src/lib/camera.js`). La vidéo et
l'appareil photo font donc le même bruit.

## `musique.wav` (fabriquée aussi)

```bash
python3 outils/reel/faire_musique.py --bpm 118
```

Une boucle rythmée synthétisée sur place : grosse caisse sur les temps,
charleston sur les contretemps, une nappe et une basse. Elle n'appartient à
personne d'autre, elle ne peut donc jamais être réclamée ni coupée.

Ce n'est pas un tube, c'est un fond honnête. Pour un vrai morceau du moment,
la bonne méthode est ailleurs (voir plus bas).

## Un son du moment, celui qu'on entend partout

Ne le mettez pas dans le fichier. **Instagram coupe le son des Reels dont la
musique n'est pas libre de droits**, sans avertissement : la vidéo devient
muette pour tout le monde sauf pour vous.

La méthode qui marche : exportez avec `--muet` (ou la case « Sans musique » du
studio), puis ajoutez le son depuis la bibliothèque d'Instagram au moment de
publier. C'est légal, c'est gratuit, et c'est ce que l'algorithme récompense :
un Reel qui reprend un son en vogue est montré aux gens qui écoutent ce son.

## Une autre musique de fond (facultatif)

Si vous préférez fournir votre propre piste, il faut qu'elle soit explicitement
autorisée pour un usage commercial. Les banques qui conviennent :

- Pixabay Music, Uppbeat, Mixkit : gratuit, usage commercial autorisé
- Epidemic Sound, Artlist : abonnement, catalogue bien plus large

Gardez le justificatif de licence avec le fichier : c'est ce qu'on vous
demandera en cas de réclamation.

### Ce qui marche bien

Une piste instrumentale, sans paroles, sans montée dramatique : la vidéo dure
une trentaine de secondes et les déclencheurs doivent rester audibles par
dessus. Un morceau trop chargé les avale.

Elle peut être plus courte que la vidéo : le script la fait tourner en boucle.

## Polices (facultatif)

Un fichier déposé ici est toujours préféré aux polices du système :

- `titre.ttf` : le nom de l'événement, au début
- `marque.ttf` : « Time to Flash », à la fin
- `mono.ttf` : l'adresse du site
- `manuscrite.ttf` : les légendes sous les photos

Sans rien, le script prend ce qu'il trouve sur la machine.
