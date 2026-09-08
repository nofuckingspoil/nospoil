#!/usr/bin/env python3
"""
Fabriquer un Reel Instagram à partir d'un dossier de photos.

    python3 outils/reel/reel.py \
        --photos ~/Desktop/mariage \
        --music outils/reel/assets/musique.mp3 \
        --shutter outils/reel/assets/declencheur.wav \
        --titre "Léa & Tom" --date 2026-06-12 \
        --out ~/Desktop/reel.mp4

Le déroulé : le nom de l'événement et sa date, puis les photos qui tombent une
à une sur la pile dans un flash et un bruit de déclencheur, puis le logo.
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
from datetime import date as Date
from pathlib import Path

ICI = Path(__file__).resolve().parent
if str(ICI) not in sys.path:
    sys.path.insert(0, str(ICI))

import numpy as np  # noqa: E402

from audio import construire_filtres  # noqa: E402
from cartes import carte_ouverture, voile_fin  # noqa: E402
from encodage import ErreurFfmpeg, commande, encoder, ffmpeg_present  # noqa: E402
from fond import Fonds, construire_fond  # noqa: E402
from frames import Scenes, Tirages, frames, frames_solo  # noqa: E402
from plan import ATTENTE_FIN, FRAMES_ARRIVEE, construire_plan  # noqa: E402
from polices import Polices  # noqa: E402
from styles import SOLO, STYLES, style_valide  # noqa: E402

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
LOGO_PAR_DEFAUT = ICI.parent.parent / "public" / "logo-mail.png"
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
        "août", "septembre", "octobre", "novembre", "décembre"]


class Refus(SystemExit):
    """Une entrée manque ou ne convient pas : on le dit et on s'arrête."""

    def __init__(self, message: str):
        print(f"\n  ✕ {message}\n", file=sys.stderr)
        super().__init__(2)


# ---------- Entrées ----------

def analyser_arguments(argv=None) -> argparse.Namespace:
    p = argparse.ArgumentParser(
        prog="reel",
        description="Diaporama Polaroid vertical, prêt à publier en Reel.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    p.add_argument("--photos", type=Path, required=True, help="dossier d'images (ordre alphabétique)")
    p.add_argument("--music", type=Path, help="musique de fond (mp3/wav) ; inutile avec --muet")
    p.add_argument("--muet", action="store_true",
                   help="sans musique, déclencheurs seuls : pour poser un son du moment dans Instagram")
    p.add_argument("--shutter", type=Path, required=True, help="bruit de déclencheur (wav court)")
    p.add_argument("--out", type=Path, required=True, help="chemin du MP4 de sortie")

    p.add_argument("--titre", default="", help="nom de l'événement, affiché au début")
    p.add_argument("--date", default="", help="date de l'événement (2026-06-12, ou texte libre)")
    p.add_argument("--cover", type=Path, help="photo de couverture, montrée pendant l'ouverture")
    p.add_argument("--style", default="pile", choices=[s["key"] for s in STYLES],
                   help="l'habillage : " + " · ".join(f'{s["key"]} ({s["sub"]})' for s in STYLES))
    p.add_argument("--captions", type=Path, help="CSV : nom_fichier,legende")

    p.add_argument("--interval", type=float, default=1.5, help="secondes entre deux apparitions")
    p.add_argument("--duree", type=float,
                   help="durée totale visée en secondes (calcule l'intervalle tout seul)")
    p.add_argument("--bpm", type=float,
                   help="caler les apparitions sur le tempo de la musique")
    p.add_argument("--intro", type=float, default=2.4, help="durée de l'ouverture")
    p.add_argument("--outro", type=float, default=2.6, help="durée de la fin")
    p.add_argument("--fps", type=int, default=30)
    p.add_argument("--seed", type=int, default=0, help="pour reproduire exactement une vidéo")

    p.add_argument("--logo", type=Path, default=LOGO_PAR_DEFAUT)
    p.add_argument("--gain-declencheur", type=float, default=6.0,
                   help="décibels au-dessus de la musique")
    p.add_argument("--crf", type=int, default=19, help="qualité vidéo (plus bas = mieux)")
    p.add_argument("--preview", action="store_true", help="ne rendre que les 5 premières photos")
    p.add_argument("--frames-dir", type=Path, help="écrire aussi les images en PNG, pour inspection")
    p.add_argument("--police-titre", type=Path, help="remplacer la police du titre")
    p.add_argument("--police-manuscrite", type=Path, help="remplacer la police des légendes")
    return p.parse_args(argv)


def verifier_entrees(args: argparse.Namespace) -> list[Path]:
    if not ffmpeg_present():
        raise Refus("ffmpeg est introuvable. Installez-le : brew install ffmpeg")

    if not args.photos.is_dir():
        raise Refus(f"Le dossier de photos n'existe pas : {args.photos}")
    photos = sorted(
        (f for f in args.photos.iterdir() if f.suffix.lower() in EXTENSIONS and not f.name.startswith(".")),
        key=lambda f: f.name.lower(),
    )
    if not photos:
        raise Refus(f"Aucune image dans {args.photos} (attendu : jpg, jpeg, png, webp).")

    # Pas de silence de substitution : une vidéo muette publiée par erreur est
    # pire qu'une vidéo qui n'est pas sortie. Le silence choisi, lui, se demande
    # explicitement avec --muet.
    if args.muet:
        args.music = None
    elif not args.music:
        raise Refus("Il manque --music (ou --muet pour un montage sans musique).")
    elif not args.music.is_file():
        raise Refus(f"Musique introuvable : {args.music}\n"
                    "    Déposez un fichier libre de droits dans outils/reel/assets/.")
    if not args.shutter.is_file():
        raise Refus(f"Bruit de déclencheur introuvable : {args.shutter}\n"
                    "    Fabriquez-en un : python3 outils/reel/faire_declencheur.py")

    if args.captions and not args.captions.is_file():
        raise Refus(f"Fichier de légendes introuvable : {args.captions}")
    if args.cover and not args.cover.is_file():
        raise Refus(f"Photo de couverture introuvable : {args.cover}")
    if args.bpm is not None and not (40 <= args.bpm <= 220):
        raise Refus("--bpm doit être compris entre 40 et 220.")
    if args.duree is not None and args.duree < 5:
        raise Refus("--duree doit valoir au moins 5 secondes.")
    if args.interval <= 0:
        raise Refus("--interval doit être positif.")

    args.out.parent.mkdir(parents=True, exist_ok=True)
    if args.frames_dir:
        args.frames_dir.mkdir(parents=True, exist_ok=True)

    return photos[:5] if args.preview else photos


def lire_legendes(chemin: Path | None) -> dict[str, str]:
    if not chemin:
        return {}
    legendes: dict[str, str] = {}
    with chemin.open(newline="", encoding="utf-8-sig") as f:
        for ligne in csv.reader(f):
            if len(ligne) < 2:
                continue
            nom, texte = ligne[0].strip(), ligne[1].strip()
            # Une ligne d'en-tête ne désigne aucun fichier : on la laisse passer.
            if not nom or nom.lower() in {"nom_fichier", "fichier", "filename"}:
                continue
            legendes[nom] = texte
    return legendes


def cadence(args, nb: int) -> tuple[float, float]:
    """L'intervalle entre deux photos, et la durée d'ouverture qui va avec.

    Trois façons de régler le rythme, de la plus parlante à la plus précise :

    · `--duree` : on dit combien de temps doit durer la vidéo, l'intervalle
      s'en déduit. C'est le bon réglage quand on vise un format (une story se
      regarde en quinze secondes, un Reel en vingt à trente) ;
    · `--interval` : on dit combien de temps reste chaque photo ;
    · `--bpm`, en plus de l'un ou l'autre : l'intervalle est arrondi à un
      nombre entier de temps, et les photos tombent alors sur la musique au
      lieu de défiler à côté. Cela suppose que la piste commence sur un temps,
      ce qui est le cas de celles que fabrique `faire_musique.py`.
    """
    intro = args.intro if args.titre else 0.9
    intervalle = args.interval

    if args.duree and nb > 1:
        # Ce que la vidéo dépense ailleurs que dans le défilé des photos :
        # l'ouverture, l'arrivée du dernier tirage, le temps de le regarder,
        # et la signature.
        fixe = intro + FRAMES_ARRIVEE / args.fps + ATTENTE_FIN + args.outro
        intervalle = max(0.35, (args.duree - fixe) / (nb - 1))

    if args.bpm:
        temps = 60.0 / args.bpm
        intervalle = max(1, round(intervalle / temps)) * temps
        intro = max(intervalle, round(intro / temps) * temps)

    return intervalle, intro


def ecrire_date(valeur: str) -> str:
    """Une date lisible, sans horaire. Le texte libre passe tel quel."""
    if not valeur:
        return ""
    try:
        d = Date.fromisoformat(valeur.strip()[:10])
    except ValueError:
        return valeur
    return f"{d.day} {MOIS[d.month - 1]} {d.year}"


# ---------- Affichage ----------

def barre(i: int, n: int, etiquette: str, largeur: int = 26) -> None:
    # Hors terminal (fichier de journal, tâche automatique), une barre qui se
    # réécrit produit des milliers de lignes illisibles : on jalonne au dixième.
    if not sys.stderr.isatty():
        if n > 0 and (i == n or i % max(1, n // 10) == 0):
            print(f"  {etiquette} {i}/{n}", file=sys.stderr)
        return
    frac = 0.0 if n <= 0 else min(1.0, i / n)
    plein = round(frac * largeur)
    sys.stderr.write(f"\r  {etiquette:<11} [{'█' * plein}{'·' * (largeur - plein)}] {i}/{n}   ")
    if i >= n:
        sys.stderr.write("\n")
    sys.stderr.flush()


# ---------- Le déroulé ----------

def main(argv=None, sur_avancement=None) -> int:
    args = analyser_arguments(argv)
    photos = verifier_entrees(args)
    legendes = lire_legendes(args.captions)

    remplacements = {}
    if args.police_titre:
        remplacements["titre"] = args.police_titre
    if args.police_manuscrite:
        remplacements["manuscrite"] = args.police_manuscrite
    polices = Polices(remplacements)

    intervalle, intro = cadence(args, len(photos))
    plan = construire_plan(
        photos, legendes,
        fps=args.fps, intervalle=intervalle, intro=intro,
        outro=args.outro, graine=args.seed,
    )
    alea = np.random.default_rng(args.seed)

    print(f"\n  {len(photos)} photo{'s' if len(photos) > 1 else ''}"
          f"{' (aperçu)' if args.preview else ''}"
          f" · {plan.duree:.1f} s · {plan.nb_frames} images", file=sys.stderr)

    debut_ouverture = carte_ouverture(
        args.titre, ecrire_date(args.date), plan.taille, polices
    ) if args.titre else None
    fin = voile_fin(plan.taille, args.logo, polices)

    def avancement(i, n):
        barre(i, n, "Images")
        if sur_avancement is not None:
            sur_avancement(i, n)

    style = style_valide(args.style)
    if style in SOLO:
        # Une photo à la fois : pas de pile à empiler, donc pas de tirages ni
        # de toile de fond séparée. Le décor fait partie de la scène.
        contexte = {"nom": args.titre, "polices": polices, "alea": alea}
        ouverture = construire_fond(
            args.cover or photos[0], plan.taille, alea, flou=3.0, luminosite=0.86
        )
        scenes = Scenes(plan, style, contexte, ouverture=ouverture)
        images = frames_solo(plan, style, scenes, debut_ouverture, fin,
                             sur_avancement=avancement)
    else:
        fonds = Fonds(plan, alea, couverture=args.cover, fondu=min(1.2, intervalle * 0.55))
        tirages = Tirages(plan, polices, alea)
        images = frames(plan, fonds, tirages, debut_ouverture, fin, sur_avancement=avancement)

    filtres = construire_filtres(
        plan.instants_declencheurs(), plan.duree,
        muet=args.muet, gain_declencheur_db=args.gain_declencheur,
    )
    # On écrit d'abord à côté, et l'on ne pose le fichier à sa place qu'une
    # fois terminé. Sans cela, un fichier à moitié écrit traîne pendant toute
    # la durée du montage : il porte déjà le bon nom, pèse déjà quelques
    # mégaoctets, et qui l'ouvre ou le copie à ce moment-là récupère un
    # fragment qu'aucun lecteur ne sait lire.
    # Le point initial le rend invisible dans le Finder, et l'extension reste
    # .mp4 : ffmpeg refuse d'écrire dans un fichier dont il ne reconnaît pas le
    # format au nom. Le fichier reste dans le même dossier, sans quoi le
    # déplacement final ne serait plus instantané.
    provisoire = args.out.with_name(f".{args.out.stem}.en-cours.mp4")
    cmd = commande(plan, provisoire, args.music, args.shutter,
                   len(plan.apparitions), filtres, crf=args.crf)

    chrono = time.monotonic()
    try:
        encoder(cmd, images, frames_dir=args.frames_dir, sortie=provisoire)
    except ErreurFfmpeg as e:
        raise Refus(f"ffmpeg a refusé le montage.\n\n{e}")
    # Le déplacement est instantané et indivisible : le fichier apparaît
    # complet, ou pas du tout.
    provisoire.replace(args.out)

    taille_mo = args.out.stat().st_size / (1024 * 1024)
    print(f"\n  ✓ {args.out}  ({taille_mo:.1f} Mo, {time.monotonic() - chrono:.0f} s)\n",
          file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
