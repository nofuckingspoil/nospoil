"""
La fabrication des images, une par une.

Deux économies portent tout le reste :

· la pile est un calque qui s'accumule. Quand un tirage a fini de se poser, il
  rejoint ce calque une fois pour toutes. Une image, c'est donc le fond, plus
  ce calque, plus le seul tirage en train d'arriver. Sans cela, il faudrait
  recomposer quarante tirages trente fois par seconde ;

· les tirages sont fabriqués juste avant d'entrer en scène, et relâchés dès
  qu'ils ont rejoint la pile. Les garder tous en mémoire coûterait près de
  trois cents mégaoctets.
"""

from __future__ import annotations

import numpy as np
from PIL import Image

from PIL import ImageOps

from plan import FONDU, Plan
from styles import FLASH, ZOOM, composer, zoomer
from tirage import fabriquer_tirage

# Le tirage arrive un peu trop grand et se pose : c'est ce petit écart qui
# donne l'impression qu'il tombe vers l'objectif.
ECHELLE_ARRIVEE = 1.15
CHUTE = 26  # pixels dont il descend en se posant
# Ce que chaque nouveau tirage retire de lumière à ceux qui sont dessous.
ATTENUATION = 0.94


def ease_out_back(t: float) -> float:
    """L'arrivée qui dépasse légèrement sa cible avant de se caler."""
    c1 = 1.70158
    c3 = c1 + 1.0
    u = t - 1.0
    return 1.0 + c3 * u * u * u + c1 * u * u


def poser(fond: Image.Image, sprite: Image.Image, centre: tuple[int, int],
          echelle: float = 1.0, opacite: float = 1.0) -> None:
    """Poser un tirage sur l'image, centré sur un point."""
    s = sprite
    if abs(echelle - 1.0) > 0.002:
        s = sprite.resize(
            (max(1, round(sprite.width * echelle)), max(1, round(sprite.height * echelle))),
            Image.BICUBIC,
        )
    if opacite < 0.999:
        alpha = s.getchannel("A").point(lambda v: int(v * opacite))
        s = s.copy()
        s.putalpha(alpha)
    fond.paste(s, (round(centre[0] - s.width / 2), round(centre[1] - s.height / 2)), s)


def _attenuer(img: Image.Image, k: float) -> Image.Image:
    """Retirer de la lumière à un calque, sans le rendre transparent.

    Baisser l'opacité laisserait voir le fond au travers des vieux tirages, ce
    qui ne ressemble à rien. Les assombrir, en revanche, les fait s'enfoncer
    sous la pile, exactement comme sur une vraie table.
    """
    table = [round(i * k) for i in range(256)]
    r, v, b, a = img.split()
    return Image.merge("RGBA", (r.point(table), v.point(table), b.point(table), a))


class Pile:
    """Ce qui est déjà posé, en un seul calque."""

    def __init__(self, taille: tuple[int, int], attenuation: float = ATTENUATION):
        self._img = Image.new("RGBA", taille, (0, 0, 0, 0))
        self._attenuation = attenuation

    def ajouter(self, sprite: Image.Image, centre: tuple[int, int]) -> None:
        self._img = _attenuer(self._img, self._attenuation)
        self._img.alpha_composite(
            sprite, (round(centre[0] - sprite.width / 2), round(centre[1] - sprite.height / 2))
        )

    @property
    def calque(self) -> Image.Image:
        return self._img


class Tirages:
    """Les tirages, fabriqués au dernier moment et relâchés aussitôt posés."""

    def __init__(self, plan: Plan, polices, alea: np.random.Generator):
        self._plan = plan
        self._polices = polices
        self._alea = alea
        self._faits: dict[int, Image.Image] = {}

    def get(self, i: int) -> Image.Image:
        if i not in self._faits:
            ap = self._plan.apparitions[i]
            self._faits[i] = fabriquer_tirage(
                ap.chemin, ap.legende, ap.angle, ap.largeur, self._polices, self._alea
            )
        return self._faits[i]

    def liberer(self, i: int) -> None:
        self._faits.pop(i, None)


def _superposer(fond: Image.Image, calque: Image.Image, opacite: float) -> None:
    if opacite <= 0.002:
        return
    c = calque
    if opacite < 0.999:
        c = calque.copy()
        c.putalpha(calque.getchannel("A").point(lambda v: int(v * opacite)))
    fond.paste(c, (0, 0), c)


def _table_flashs(plan: Plan, force: float = 0.90) -> dict[int, float]:
    """Quelles images sont blanches, et à quel point.

    Deux images : une presque pleine, une moitié moins. C'est court, et c'est
    exactement ce qui vend le déclenchement. La force dépend du décor : sur le
    papier clair du magazine, un flash à quatre-vingt-dix pour cent n'éclaire
    rien, il aveugle.
    """
    table: dict[int, float] = {}
    for ap in plan.apparitions:
        f0 = int(round(ap.t_flash * plan.fps))
        table[f0] = max(table.get(f0, 0.0), force)
        table[f0 + 1] = max(table.get(f0 + 1, 0.0), force * 0.45)
    return table


def frames(plan: Plan, fonds, tirages: Tirages, carte_debut, voile_fin, sur_avancement=None):
    """Rendre la vidéo, une image à la fois."""
    pile = Pile(plan.taille)
    blanc = Image.new("RGB", plan.taille, (255, 255, 255))
    flashs = _table_flashs(plan, FLASH['pile'])
    posees = [False] * len(plan.apparitions)

    for f in range(plan.nb_frames):
        t = f / plan.fps

        # Les tirages arrivés au bout de leur course rejoignent la pile.
        for i, ap in enumerate(plan.apparitions):
            if not posees[i] and t >= ap.t_fin_pose:
                pile.ajouter(tirages.get(i), ap.centre)
                tirages.liberer(i)
                posees[i] = True

        img = fonds.a(t).copy()
        calque = pile.calque
        img.paste(calque, (0, 0), calque)

        # Ceux qui sont encore en train de se poser.
        for i, ap in enumerate(plan.apparitions):
            if ap.t_pose <= t < ap.t_fin_pose:
                avance = (t - ap.t_pose) / max(1e-6, ap.t_fin_pose - ap.t_pose)
                e = ease_out_back(avance)
                echelle = ECHELLE_ARRIVEE + (1.0 - ECHELLE_ARRIVEE) * e
                cx, cy = ap.centre
                poser(
                    img,
                    tirages.get(i),
                    (cx, round(cy - CHUTE * (1.0 - e))),
                    echelle=echelle,
                    opacite=min(1.0, avance / 0.45),
                )

        intensite = flashs.get(f)
        if intensite:
            img = Image.blend(img, blanc, intensite)

        if carte_debut is not None and t < plan.intro:
            montee = min(1.0, t / 0.35)
            reste = plan.intro - t
            descente = 1.0 if reste > FONDU else max(0.0, reste / FONDU)
            _superposer(img, carte_debut, min(montee, descente))

        if voile_fin is not None and t >= plan.debut_fin:
            _superposer(img, voile_fin, min(1.0, (t - plan.debut_fin) / FONDU))

        if sur_avancement is not None:
            sur_avancement(f + 1, plan.nb_frames)
        yield img


# ============================================================
#  Les montages « une photo à la fois »
# ============================================================

class Scenes:
    """Les scènes composées, fabriquées au dernier moment.

    Une scène est une image entière, décor compris : c'est elle qu'on zoome
    ensuite, d'un seul mouvement. La composer trente fois par seconde serait
    absurde, elle ne change pas entre deux photos.

    Le rang -1 est la couverture de l'événement, montrée pendant l'ouverture.
    """

    def __init__(self, plan: Plan, style: str, ctx: dict, ouverture=None):
        self._plan = plan
        self._style = style
        self._ctx = ctx
        # L'ouverture est la même dans tous les habillages : la couverture en
        # plein cadre, l'étiquette par-dessus. Composée dans le décor du
        # montage, elle se cognait à l'étiquette, et l'événement commençait par
        # un empilement de cadres.
        self._ouverture = ouverture
        self._faites: dict[int, Image.Image] = {}

    def _photo(self, i: int) -> Image.Image:
        with Image.open(self._plan.apparitions[i].chemin) as brut:
            return ImageOps.exif_transpose(brut).convert("RGB")

    def get(self, i: int) -> Image.Image:
        if i < 0:
            return self._ouverture if self._ouverture is not None else self.get(0)
        if i not in self._faites:
            self._faites[i] = composer(self._style, self._photo(i), self._plan.taille, self._ctx)
            for vieux in [k for k in self._faites if k < i - 1]:
                del self._faites[vieux]
        return self._faites[i]


def _fenetre(plan: Plan, i: int) -> tuple[float, float]:
    """De quand à quand une photo occupe l'écran."""
    if i < 0:
        return 0.0, max(0.1, plan.intro)
    debut = plan.apparitions[i].t_pose
    if i + 1 < len(plan.apparitions):
        return debut, plan.apparitions[i + 1].t_pose
    return debut, plan.debut_fin


def frames_solo(plan: Plan, style: str, scenes: Scenes, carte_debut, voile_fin,
                sur_avancement=None):
    """Une photo à la fois, plein cadre, avec son lent rapprochement."""
    blanc = Image.new("RGB", plan.taille, (255, 255, 255))
    flashs = _table_flashs(plan, FLASH.get(style, 0.90))
    courant = -1
    scene = scenes.get(-1)
    debut, fin = _fenetre(plan, -1)

    for f in range(plan.nb_frames):
        t = f / plan.fps

        # Quelle photo occupe l'écran. On avance d'un cran à la fois : le
        # montage est linéaire, inutile de tout reparcourir à chaque image.
        while courant + 1 < len(plan.apparitions) and t >= plan.apparitions[courant + 1].t_pose:
            courant += 1
            scene = scenes.get(courant)
            debut, fin = _fenetre(plan, courant)

        avance = 0.0 if fin <= debut else min(1.0, max(0.0, (t - debut) / (fin - debut)))
        img = zoomer(scene, 1.0 + ZOOM * avance)

        intensite = flashs.get(f)
        if intensite:
            img = Image.blend(img, blanc, intensite)

        if carte_debut is not None and t < plan.intro:
            montee = min(1.0, t / 0.35)
            reste = plan.intro - t
            descente = 1.0 if reste > FONDU else max(0.0, reste / FONDU)
            _superposer(img, carte_debut, min(montee, descente))

        if voile_fin is not None and t >= plan.debut_fin:
            _superposer(img, voile_fin, min(1.0, (t - plan.debut_fin) / FONDU))

        if sur_avancement is not None:
            sur_avancement(f + 1, plan.nb_frames)
        yield img
