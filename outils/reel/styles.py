"""
Les habillages : ce qui entoure la photo.

Quatre montages, mais un seul squelette. « La pile » mise à part, les trois
autres font exactement la même chose : une photo à la fois, plein cadre, un
lent zoom, une coupe sur le temps. Seul l'habillage change, c'est-à-dire ce
qu'il y a autour de la photo. Les écrire comme trois montages séparés aurait
triplé le même code pour trois décors.

Le zoom s'applique à la scène entière, une fois composée : le cadre, son ombre
et le fond avancent ensemble, comme si la caméra se rapprochait de la table.
Chaque scène n'est donc composée qu'une fois par photo, et non trente fois par
seconde.

Un gain qui n'est pas décoratif : ici la photo n'est plus recadrée au carré.
La fenêtre garde la forme du cliché, et une photo de groupe cesse de perdre
les gens qui sont aux extrémités.
"""

from __future__ import annotations

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

from tirage import etalonner

STYLES = [
    {"key": "pile", "label": "La pile",
     "sub": "Les tirages s'empilent sur la table"},
    {"key": "vitrine", "label": "La vitrine",
     "sub": "Un tirage à la fois, la photo floutée derrière"},
    {"key": "cinema", "label": "Le cinéma",
     "sub": "Plein cadre sur fond sombre, vos prénoms en bas"},
    {"key": "magazine", "label": "Le magazine",
     "sub": "Plein cadre sur papier, marges larges"},
]

SOLO = {"vitrine", "cinema", "magazine"}

# Force du flash selon le décor : sur le papier clair du magazine, un flash à
# quatre-vingt-dix pour cent ne se voit pas, il aveugle. Une pulsation suffit.
FLASH = {"pile": 0.90, "vitrine": 0.90, "cinema": 0.85, "magazine": 0.35}

# De combien la scène grossit du début à la fin d'une photo.
ZOOM = 0.055

# Jusqu'où l'on a le droit d'écrire.
#
# Instagram pose sa propre interface par-dessus le bas d'un Reel : la légende,
# le nom du compte, le son. Tout ce qui est écrit en dessous de cette limite
# est recouvert, et l'on ne s'en aperçoit qu'une fois publié. Les prénoms et
# l'adresse du site restent donc au-dessus.
BAS_SUR = 0.86

PAPIER_CARTE = (243, 242, 238)
NUIT = (11, 10, 9)
PAPIER = (250, 248, 244)


def style_valide(cle: str) -> str:
    return cle if any(s["key"] == cle for s in STYLES) else "pile"


# ---------- Briques communes ----------

def _flou(img: Image.Image, taille: tuple[int, int], alea, force: float = 16.0,
          luminosite: float = 0.66) -> Image.Image:
    """La photo elle-même en toile de fond : floutée, assombrie, plein cadre."""
    w, h = taille
    f = ImageOps.fit(img, (w // 2, h // 2), Image.LANCZOS, centering=(0.5, 0.45))
    f = etalonner(f, alea).filter(ImageFilter.GaussianBlur(force))
    return ImageEnhance.Brightness(f).enhance(luminosite).resize((w, h), Image.BICUBIC)


def _ombre(base: Image.Image, calque: Image.Image, x: int, y: int,
           dy: int = 18, rayon: int = 26, force: float = 0.5) -> None:
    marge = rayon * 3
    o = Image.new("RGBA", (calque.width + marge * 2, calque.height + marge * 2), (0, 0, 0, 0))
    sil = Image.new("RGBA", calque.size, (0, 0, 0, 255))
    sil.putalpha(calque.getchannel("A").point(lambda v: int(v * force)))
    o.paste(sil, (marge, marge + dy))
    o = o.filter(ImageFilter.GaussianBlur(rayon))
    base.paste(o, (x - marge, y - marge), o)


def _coins(img: Image.Image, rayon: int) -> Image.Image:
    masque = Image.new("L", img.size, 0)
    ImageDraw.Draw(masque).rounded_rectangle([0, 0, img.width - 1, img.height - 1], rayon, fill=255)
    out = img.convert("RGBA")
    out.putalpha(masque)
    return out


def _centre(dessin, y: int, texte: str, police, couleur, largeur: int, interlettre: int = 0) -> None:
    if interlettre <= 0:
        l = dessin.textlength(texte, font=police)
        dessin.text(((largeur - l) / 2, y), texte, font=police, fill=couleur)
        return
    total = sum(dessin.textlength(c, font=police) for c in texte) + interlettre * (len(texte) - 1)
    x = (largeur - total) / 2
    for c in texte:
        dessin.text((x, y), c, font=police, fill=couleur)
        x += dessin.textlength(c, font=police) + interlettre


def _cadrer(img: Image.Image, taille: tuple[int, int], alea) -> Image.Image:
    return etalonner(
        ImageOps.fit(img, taille, Image.LANCZOS, centering=(0.5, 0.42)), alea
    )


# ---------- La vitrine ----------
# Proportions relevées sur la vidéo de référence : marge de 12 % de la largeur
# du cadre sur trois côtés, bande de 28 % en bas. Le cadre fait 1,56 fois sa
# largeur quand la photo est au format d'un téléphone.
MARGE_CARTE, BANDE_CARTE = 0.120, 0.280


def _vitrine(img, taille, ctx):
    w, h = taille
    # La fenêtre garde la forme de la photo, entre le presque carré et le très
    # allongé : c'est ce qui évite de couper les gens sur les côtés.
    r = max(0.72, min(1.55, img.height / img.width))
    rapport = MARGE_CARTE + (1 - 2 * MARGE_CARTE) * r + BANDE_CARTE
    L = min(w * 0.90, h * 0.80 / rapport)
    marge = L * MARGE_CARTE
    fw = L - marge * 2
    fh = fw * r

    carte = Image.new("RGBA", (round(L), round(L * rapport)), (*PAPIER_CARTE, 255))
    carte.paste(_cadrer(img, (round(fw), round(fh)), ctx["alea"]), (round(marge), round(marge)))
    ImageDraw.Draw(carte).rectangle(
        [round(marge) - 1, round(marge) - 1, round(marge + fw), round(marge + fh)],
        outline=(0, 0, 0, 45),
    )

    base = _flou(img, taille, ctx["alea"])
    x, y = (w - carte.width) // 2, (h - carte.height) // 2
    _ombre(base, carte, x, y)
    base.paste(carte, (x, y), carte)
    return base


# ---------- Le cinéma ----------

def _cinema(img, taille, ctx):
    w, h = taille
    base = Image.new("RGB", (w, h), NUIT)
    marge, haut = round(w * 0.035), round(h * 0.030)
    photo = _coins(_cadrer(img, (w - marge * 2, round(h * 0.762)), ctx["alea"]), round(w * 0.022))
    base.paste(photo, (marge, haut), photo)

    dessin = ImageDraw.Draw(base)
    if ctx["nom"]:
        _centre(dessin, round(h * 0.812), ctx["nom"].upper(),
                ctx["polices"].get("titre", round(w * 0.030)),
                (248, 244, 236), w, interlettre=round(w * 0.0075))
    # Le repère est le BAS du texte : posé sur la limite, il se faisait couper
    # en deux par la légende d'Instagram.
    pied = ctx["polices"].get("mono", round(w * 0.019))
    _centre(dessin, round(h * BAS_SUR - pied.size * 2.2), "TIMETOFLASH.FR", pied,
            (190, 180, 166), w, interlettre=round(w * 0.005))
    return base


# ---------- Le magazine ----------

def _coeur(dessin, cx: int, cy: int, taille: int, couleur) -> None:
    """Le petit cœur tracé à la main, sous la photo."""
    e = max(3, round(taille * 0.16))
    gauche = [(cx - taille, cy - taille * 0.18), (cx - taille * 0.55, cy - taille * 0.92),
              (cx - taille * 0.1, cy - taille * 0.5), (cx, cy - taille * 0.12)]
    droite = [(cx, cy - taille * 0.12), (cx + taille * 0.1, cy - taille * 0.5),
              (cx + taille * 0.55, cy - taille * 0.92), (cx + taille, cy - taille * 0.18),
              (cx, cy + taille * 0.78), (cx - taille, cy - taille * 0.18)]
    dessin.line(gauche, fill=couleur, width=e, joint="curve")
    dessin.line(droite, fill=couleur, width=e, joint="curve")


def _magazine(img, taille, ctx):
    w, h = taille
    base = Image.new("RGB", (w, h), PAPIER)
    marge, haut = round(w * 0.075), round(h * 0.068)
    zw, zh = w - marge * 2, round(h * 0.615)
    photo = _cadrer(img, (zw, zh), ctx["alea"])

    plein = Image.new("RGBA", (zw, zh), (0, 0, 0, 0))
    plein.paste(photo, (0, 0))
    _ombre(base, plein, marge, haut, dy=14, rayon=22, force=0.22)
    base.paste(photo, (marge, haut))

    dessin = ImageDraw.Draw(base)
    _coeur(dessin, w // 2, haut + zh + round(h * 0.050), round(w * 0.026), (62, 52, 42))
    if ctx["nom"]:
        _centre(dessin, haut + zh + round(h * 0.074), ctx["nom"],
                ctx["polices"].get("titre", round(w * 0.040)), (40, 32, 24), w)
    pied = ctx["polices"].get("mono", round(w * 0.018))
    _centre(dessin, round(h * BAS_SUR - pied.size * 2.2), "TIMETOFLASH.FR", pied,
            (150, 138, 122), w, interlettre=round(w * 0.005))
    return base


# ---------- La pile ----------
# Le vrai montage empile les tirages au fil de la vidéo (voir frames.py). Ce
# composeur-ci ne sert qu'à en montrer une image fixe dans le sélecteur : trois
# tirages posés, pour donner l'idée sans rejouer la séquence.
MARGE_TIRAGE, BANDE_TIRAGE = 0.055, 0.17


def _pile(img, taille, ctx):
    w, h = taille
    base = _flou(img, taille, ctx["alea"], force=18.0, luminosite=0.60)
    L = round(w * 0.66)
    cote = round(L * (1 - MARGE_TIRAGE * 2))
    Ht = round(L * (1 + MARGE_TIRAGE + BANDE_TIRAGE))
    photo = _cadrer(img, (cote, cote), ctx["alea"])

    for rang, (dx, dy, angle, lumiere) in enumerate(
        ((-0.07, -0.05, -8, 0.78), (0.06, 0.02, 7, 0.88), (-0.01, 0.07, -3, 1.0))
    ):
        carte = Image.new("RGBA", (L, Ht), (252, 250, 245, 255))
        carte.paste(photo, (round(L * MARGE_TIRAGE), round(L * MARGE_TIRAGE)))
        if lumiere < 1.0:
            table = [round(i * lumiere) for i in range(256)]
            r, v, b, a = carte.split()
            carte = Image.merge("RGBA", (r.point(table), v.point(table), b.point(table), a))
        carte = carte.rotate(angle, resample=Image.BICUBIC, expand=True)
        x = round(w / 2 + dx * w - carte.width / 2)
        y = round(h * 0.48 + dy * h - carte.height / 2)
        _ombre(base, carte, x, y, dy=14, rayon=20, force=0.42)
        base.paste(carte, (x, y), carte)
    return base


COMPOSEURS = {"pile": _pile, "vitrine": _vitrine, "cinema": _cinema, "magazine": _magazine}


def composer(style: str, img: Image.Image, taille: tuple[int, int], ctx: dict) -> Image.Image:
    return COMPOSEURS[style](img, taille, ctx)


def zoomer(scene: Image.Image, facteur: float) -> Image.Image:
    """Rapprocher la caméra, sans jamais montrer le bord de l'image."""
    if facteur <= 1.001:
        return scene
    w, h = scene.size
    cw, ch = round(w / facteur), round(h / facteur)
    x, y = (w - cw) // 2, (h - ch) // 2
    return scene.crop((x, y, x + cw, y + ch)).resize((w, h), Image.BICUBIC)
