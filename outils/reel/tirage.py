"""
Fabriquer un tirage : la photo étalonnée, son cadre blanc, son ombre.

L'étalonnage reprend la recette « jetable » du site (voir src/lib/film.js) :
mêmes tables de couleur par canal, mêmes noirs relevés, même grain de
luminance. La vidéo doit ressembler à ce que les gens voient dans leur album,
sinon on annonce un rendu et on en livre un autre.

Chaque tirage est cuit une seule fois, rotation et ombre comprises. L'animation
n'a plus ensuite qu'à le redimensionner et le poser : c'est ce qui permet de
tenir quarante photos sans y passer la nuit.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

# ---------- La recette « jetable » ----------
CONTRASTE = 1.13
SATURATION = 1.05
SUREXPOSITION = 1.05
# Par canal : (gamma, gain, délavé). Le gamma donne la dominante, le délavé
# relève les noirs, ce qui fait tout le charme d'un tirage bon marché.
CANAUX = {
    "r": (0.94, 1.02, 0.055),
    "g": (1.00, 1.00, 0.048),
    "b": (1.07, 0.95, 0.080),
}
GRAIN = 13.0
TEINTE_DEBUT = (255, 196, 92, 0.22)
TEINTE_FIN = (236, 91, 51, 0.14)
HALO = 0.08
VIGNETTE = 0.45

# ---------- Le cadre ----------
# Mesuré sur un vrai polaroid : une marge fine sur trois côtés, une large en
# bas, celle sur laquelle on écrit au feutre. Exprimé en fraction de la
# largeur, pour que tout suive quand le tirage change de taille.
BORD = 40 / 780
BANDE = 120 / 780
PAPIER = (252, 250, 245)
ENCRE = (37, 53, 92)


def _lut(gamma: float, gain: float, delave: float) -> np.ndarray:
    """Table de correspondance 0→255 pour un canal.

    Calculée une fois, appliquée à des millions de pixels.
    """
    v = np.arange(256, dtype=np.float32) / 255.0
    v = (v - 0.5) * CONTRASTE + 0.5
    v = np.power(np.clip(v, 0.0, None), gamma)
    v *= gain
    v = delave + v * (1.0 - delave)
    return np.clip(v * 255.0, 0, 255)


_LUTS = np.stack([_lut(*CANAUX[c]) for c in "rgb"], axis=1).astype(np.float32)


def _voile(a: np.ndarray) -> np.ndarray:
    """La teinte, le halo du flash et les coins sombres, d'un seul geste."""
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    diag = float(np.hypot(w, h)) / 2.0

    # Dégradé diagonal, en fondu multiplié. À moitié seulement : la dominante
    # est déjà dans les tables de couleur, et deux couches de chaud de suite
    # vireraient à l'orange fluo.
    d = (xx / max(w - 1, 1) + yy / max(h - 1, 1)) / 2.0
    c0 = np.array(TEINTE_DEBUT[:3], np.float32)
    c1 = np.array(TEINTE_FIN[:3], np.float32)
    couleur = c0 * (1 - d)[..., None] + c1 * d[..., None]
    alpha = ((TEINTE_DEBUT[3] * (1 - d) + TEINTE_FIN[3] * d) * 0.55)[..., None]
    a = a * (1 - alpha) + a * (couleur / 255.0) * alpha

    # La lumière chaude au centre, comme un flash de trop près.
    r = np.hypot(xx - w / 2.0, yy - h * 0.42) / (diag * 0.95)
    force = (np.clip(1.0 - r, 0.0, 1.0) * HALO)[..., None]
    a = a * (1 - force) + np.array([255, 240, 205], np.float32) * force

    # Les coins qui s'assombrissent.
    rv = np.hypot(xx - w / 2.0, yy - h / 2.0) / diag
    v = (np.clip((rv - 0.45) / 0.55, 0.0, 1.0) * (VIGNETTE * 0.75))[..., None]
    return a * (1 - v) + np.array([28, 16, 6], np.float32) * v


def etalonner(img: Image.Image, alea: np.random.Generator) -> Image.Image:
    """Développer la photo : surexposition, contraste, dominante, grain."""
    a = np.asarray(img.convert("RGB"), dtype=np.float32)

    # Saturation avant les tables, comme dans l'album.
    lum = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    a = lum[..., None] + (a - lum[..., None]) * SATURATION
    a = np.clip(a * SUREXPOSITION, 0, 255)

    index = a.astype(np.uint8)
    a = np.stack([_LUTS[:, k][index[..., k]] for k in range(3)], axis=-1)

    a = _voile(a)

    if GRAIN:
        # Un grain de luminance (le même écart sur les trois canaux) : le bruit
        # coloré fait « photo numérique abîmée », pas « pellicule ».
        bruit = alea.uniform(-GRAIN / 2.0, GRAIN / 2.0, a.shape[:2]).astype(np.float32)
        a = a + bruit[..., None]

    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "RGB")


def recadrer_carre(img: Image.Image, cote: int) -> Image.Image:
    """Recadrer au carré par le centre.

    Portrait ou paysage, tout rentre dans le même cadre : c'est ce qui rend la
    pile régulière alors que les photos ne le sont pas.
    """
    img = ImageOps.exif_transpose(img).convert("RGB")
    return ImageOps.fit(img, (cote, cote), method=Image.LANCZOS, centering=(0.5, 0.45))


def _legende(cadre: Image.Image, texte: str, police, largeur: int, haut_bande: int, bas: int) -> None:
    """Le mot écrit au feutre sur la bande blanche, jamais tout à fait droit."""
    calque = Image.new("RGBA", (largeur, bas - haut_bande), (0, 0, 0, 0))
    d = ImageDraw.Draw(calque)
    boite = d.textbbox((0, 0), texte, font=police)
    d.text(
        ((calque.width - (boite[2] - boite[0])) / 2 - boite[0],
         (calque.height - (boite[3] - boite[1])) / 2 - boite[1]),
        texte,
        font=police,
        fill=(*ENCRE, 235),
    )
    calque = calque.rotate(-2.2, resample=Image.BICUBIC, expand=False)
    cadre.alpha_composite(calque, (0, haut_bande))


def _avec_ombre(sprite: Image.Image, largeur: int) -> Image.Image:
    """Poser l'ombre portée sous le tirage, une fois pour toutes."""
    flou = max(6, round(largeur * 0.022))
    dx, dy = round(largeur * 0.004), round(largeur * 0.016)
    marge = flou * 3 + max(abs(dx), abs(dy))

    canevas = Image.new("RGBA", (sprite.width + marge * 2, sprite.height + marge * 2), (0, 0, 0, 0))
    silhouette = Image.new("RGBA", sprite.size, (30, 20, 10, 255))
    silhouette.putalpha(sprite.getchannel("A").point(lambda v: int(v * 0.46)))
    ombre = Image.new("RGBA", canevas.size, (0, 0, 0, 0))
    ombre.paste(silhouette, (marge + dx, marge + dy))
    ombre = ombre.filter(ImageFilter.GaussianBlur(flou))

    canevas = Image.alpha_composite(canevas, ombre)
    canevas.paste(sprite, (marge, marge), sprite)
    return canevas


def fabriquer_tirage(
    chemin: Path,
    legende: str | None,
    angle: float,
    largeur: int,
    polices,
    alea: np.random.Generator,
) -> Image.Image:
    """Un tirage complet, tourné, ombré, prêt à être posé."""
    bord = round(largeur * BORD)
    bande = round(largeur * BANDE)
    cote = largeur - bord * 2
    hauteur = bord + cote + bande

    with Image.open(chemin) as brut:
        photo = etalonner(recadrer_carre(brut, cote), alea)

    cadre = Image.new("RGBA", (largeur, hauteur), (*PAPIER, 255))
    cadre.paste(photo, (bord, bord))

    # Un filet très clair au bord de la photo : sans lui, la photo semble
    # découpée au ciseau et collée sur le papier.
    ImageDraw.Draw(cadre).rectangle(
        [bord - 1, bord - 1, bord + cote, bord + cote], outline=(0, 0, 0, 40)
    )

    if legende:
        _legende(cadre, legende, polices.get("manuscrite", round(largeur * 0.062)),
                 largeur, bord + cote, hauteur - round(bande * 0.18))

    tourne = cadre.rotate(angle, resample=Image.BICUBIC, expand=True)
    return _avec_ombre(tourne, largeur)
