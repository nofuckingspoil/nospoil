"""
Le déroulé de la vidéo, en secondes.

C'est la première chose que fabrique le script, et la seule source de vérité :
les images et le son sont ensuite construits à partir de cette même liste.
Sans ce plan commun, chacun compte de son côté et le bruit de déclencheur
dérive de quelques images, ce qui suffit à ruiner l'effet.
"""

from __future__ import annotations

import random
from dataclasses import dataclass
from pathlib import Path

# Combien d'images dure l'arrivée d'un tirage.
FRAMES_ARRIVEE = 10
# Le flash précède l'arrivée : c'est lui qui annonce la photo.
FRAMES_FLASH = 2
# Ce qu'on laisse voir de la pile finie avant que la fin ne s'installe.
ATTENTE_FIN = 0.9
# Durée des fondus vers la carte d'ouverture et vers la fin.
FONDU = 0.45


@dataclass
class Apparition:
    """Un tirage, et tout ce qu'il faut savoir pour le poser."""

    chemin: Path
    legende: str | None
    t_flash: float
    t_pose: float
    t_fin_pose: float
    angle: float
    centre: tuple[int, int]
    largeur: int


@dataclass
class Plan:
    fps: int
    taille: tuple[int, int]
    intro: float
    outro: float
    apparitions: list[Apparition]
    debut_fin: float
    duree: float

    @property
    def nb_frames(self) -> int:
        return int(round(self.duree * self.fps))

    def instants_declencheurs(self) -> list[float]:
        return [a.t_flash for a in self.apparitions]


def construire_plan(
    photos: list[Path],
    legendes: dict[str, str],
    *,
    taille: tuple[int, int] = (1080, 1920),
    fps: int = 30,
    intervalle: float = 0.8,
    intro: float = 2.4,
    outro: float = 2.6,
    graine: int = 0,
    angle_max: float = 8.0,
) -> Plan:
    """Poser le calendrier des apparitions.

    Le hasard n'intervient qu'ici, et il est semé : deux exécutions avec la
    même graine donnent exactement la même vidéo.
    """
    alea = random.Random(graine)
    w, h = taille
    duree_arrivee = FRAMES_ARRIVEE / fps

    # Les tirages sont plus larges que l'image : ils débordent des deux côtés,
    # comme dans les diaporamas dont on s'inspire. Un tirage qui tient tout
    # entier dans le cadre fait « diaporama », pas « pile sur la table ».
    largeur_base = round(w * 1.02)

    apparitions: list[Apparition] = []
    for i, chemin in enumerate(photos):
        t_pose = intro + i * intervalle
        # Le point de chute se promène autour du centre, un peu au-dessus du
        # milieu : c'est là que l'œil regarde sur un téléphone.
        cx = round(w * 0.5 + alea.uniform(-0.13, 0.13) * w)
        cy = round(h * 0.48 + alea.uniform(-0.09, 0.09) * h)
        apparitions.append(
            Apparition(
                chemin=chemin,
                legende=legendes.get(chemin.name),
                t_flash=t_pose - FRAMES_FLASH / fps,
                t_pose=t_pose,
                t_fin_pose=t_pose + duree_arrivee,
                angle=alea.uniform(-angle_max, angle_max),
                centre=(cx, cy),
                largeur=round(largeur_base * alea.uniform(0.94, 1.06)),
            )
        )

    derniere = apparitions[-1].t_fin_pose if apparitions else intro
    debut_fin = derniere + ATTENTE_FIN
    return Plan(
        fps=fps,
        taille=taille,
        intro=intro,
        outro=outro,
        apparitions=apparitions,
        debut_fin=debut_fin,
        duree=debut_fin + outro,
    )
