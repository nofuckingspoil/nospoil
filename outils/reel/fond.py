"""
Le fond de la vidéo.

Dans les diaporamas dont on s'inspire, les tirages tombent sur un plan filmé
qui remplit l'écran. On n'a pas de plan filmé, on a des photos : le fond est
donc la dernière photo arrivée, floutée et assombrie, en plein cadre. Elle
change à chaque déclenchement, ce qui donne le mouvement qu'un aplat de
couleur n'aurait jamais eu, et elle habille les bords que les tirages ne
couvrent pas.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

from tirage import etalonner

# Le fond met une demi-seconde à passer d'une photo à l'autre : sans ce fondu,
# chaque déclenchement faisait sauter l'arrière-plan d'un coup.
DUREE_FONDU = 0.5


def construire_fond(
    chemin: Path,
    taille: tuple[int, int],
    alea: np.random.Generator,
    *,
    flou: float = 14.0,
    luminosite: float = 0.62,
) -> Image.Image:
    """Une photo transformée en toile de fond.

    Le travail se fait en demi-résolution : le résultat est flou de toute
    façon, et le flou gaussien coûte quatre fois moins cher sur une image deux
    fois plus petite.
    """
    demi = (taille[0] // 2, taille[1] // 2)
    with Image.open(chemin) as brut:
        img = ImageOps.exif_transpose(brut).convert("RGB")
        img = ImageOps.fit(img, demi, method=Image.LANCZOS, centering=(0.5, 0.42))
    img = etalonner(img, alea)
    img = img.filter(ImageFilter.GaussianBlur(flou))
    img = ImageEnhance.Brightness(img).enhance(luminosite)
    return img.resize(taille, Image.BICUBIC)


class Fonds:
    """Le fond du moment, avec le fondu d'une photo à la suivante.

    Deux images seulement sont gardées en mémoire : celle qui s'en va et celle
    qui arrive. Quarante fonds en pleine taille tiendraient un quart de gigaoctet.

    La couverture de l'événement, quand il y en a une, occupe le rang -1 : c'est
    elle qu'on voit pendant l'ouverture, à peine floutée, parce qu'elle a été
    choisie pour être regardée. Les photos qui suivent, elles, ne sont qu'un
    décor derrière les tirages, et se retirent donc bien davantage.
    """

    def __init__(self, plan, alea: np.random.Generator, couverture: Path | None = None,
                 fondu: float = DUREE_FONDU, **options):
        self._plan = plan
        self._alea = alea
        self._couverture = couverture
        # Sur un rythme lent, un fondu d'une demi-seconde laissait le fond figé
        # pendant deux secondes entre deux photos. Il s'étire avec le montage.
        self._fondu = max(0.3, fondu)
        self._options = options
        self._cache: dict[int, Image.Image] = {}

    def _image(self, i: int) -> Image.Image:
        if i not in self._cache:
            if i < 0:
                self._cache[i] = construire_fond(
                    self._couverture, self._plan.taille, self._alea, flou=3.0, luminosite=0.86
                )
            else:
                self._cache[i] = construire_fond(
                    self._plan.apparitions[i].chemin, self._plan.taille, self._alea, **self._options
                )
                for vieux in [k for k in self._cache if k < i - 1]:
                    del self._cache[vieux]
        return self._cache[i]

    def _index(self, t: float) -> int:
        i = -1 if self._couverture else 0
        for k, ap in enumerate(self._plan.apparitions):
            if t >= ap.t_flash:
                i = k
        return i

    def a(self, t: float) -> Image.Image:
        if not self._plan.apparitions:
            return Image.new("RGB", self._plan.taille, (28, 24, 20))
        i = self._index(t)
        if i < 0:
            return self._image(-1)
        depart = self._plan.apparitions[i].t_flash
        premier = i == 0 and not self._couverture
        if premier or t >= depart + self._fondu:
            return self._image(i)
        avance = max(0.0, (t - depart) / self._fondu)
        return Image.blend(self._image(i - 1), self._image(i), avance)
