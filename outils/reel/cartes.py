"""
L'ouverture et la fin.

Ni l'une ni l'autre n'est une image pleine : ce sont des calques posés sur la
scène. L'ouverture est une étiquette blanche qui flotte sur la première photo
floutée, la fin est un voile sombre qui éteint la pile pour laisser le logo
respirer. Une carte opaque aurait coupé la vidéo en trois morceaux sans
rapport ; là, tout se tient.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

PAPIER = (250, 248, 243)
ENCRE = (28, 22, 16)
GRIS = (110, 98, 82)
ORANGE = (236, 91, 51)


def _lignes(texte: str, police, largeur_max: int, dessin: ImageDraw.ImageDraw) -> list[str]:
    """Couper un titre trop long entre les mots, jamais au milieu d'un."""
    mots = texte.split()
    lignes: list[str] = []
    courante = ""
    for mot in mots:
        essai = f"{courante} {mot}".strip()
        if dessin.textlength(essai, font=police) <= largeur_max or not courante:
            courante = essai
        else:
            lignes.append(courante)
            courante = mot
    if courante:
        lignes.append(courante)
    return lignes


def _texte_centre(dessin, y: int, texte: str, police, couleur, largeur: int, interlettre: int = 0):
    """Écrire une ligne centrée, avec un interlettrage facultatif.

    Pillow ne sait pas espacer les lettres : on les pose une par une quand il
    le faut, ce qui n'arrive que pour les petites capitales de la marque.
    """
    if interlettre <= 0:
        l = dessin.textlength(texte, font=police)
        dessin.text(((largeur - l) / 2, y), texte, font=police, fill=couleur)
        return y + police.size

    total = sum(dessin.textlength(c, font=police) for c in texte) + interlettre * (len(texte) - 1)
    x = (largeur - total) / 2
    for c in texte:
        dessin.text((x, y), c, font=police, fill=couleur)
        x += dessin.textlength(c, font=police) + interlettre
    return y + police.size


def carte_ouverture(titre: str, date: str, taille: tuple[int, int], polices) -> Image.Image:
    """L'étiquette blanche du début : le nom de l'événement, et la date."""
    w, h = taille
    calque = Image.new("RGBA", taille, (0, 0, 0, 0))
    dessin = ImageDraw.Draw(calque)

    p_titre = polices.get("titre", round(w * 0.088))
    p_date = polices.get("titre", round(w * 0.042))
    marge = round(w * 0.055)
    largeur_boite = round(w * 0.79)
    largeur_texte = largeur_boite - marge * 2

    lignes = _lignes(titre, p_titre, largeur_texte, dessin) if titre else []
    interligne = round(p_titre.size * 1.22)
    hauteur = marge * 2 + interligne * len(lignes)
    if date:
        hauteur += round(p_date.size * 1.9)

    x0 = (w - largeur_boite) // 2
    y0 = round(h * 0.30) - hauteur // 2

    # Une ombre très douce, pour que l'étiquette se détache du fond flou sans
    # avoir l'air posée par-dessus au montage.
    ombre = Image.new("RGBA", taille, (0, 0, 0, 0))
    ImageDraw.Draw(ombre).rectangle(
        [x0, y0 + 6, x0 + largeur_boite, y0 + hauteur + 6], fill=(0, 0, 0, 70)
    )
    calque = Image.alpha_composite(calque, ombre.filter(ImageFilter.GaussianBlur(18)))
    dessin = ImageDraw.Draw(calque)
    # Un filet très discret : sans lui, l'étiquette disparaissait sur les
    # habillages à fond papier, où le blanc se pose sur du blanc.
    dessin.rectangle([x0, y0, x0 + largeur_boite, y0 + hauteur],
                     fill=(*PAPIER, 246), outline=(28, 22, 16, 38), width=2)

    y = y0 + marge
    for ligne in lignes:
        l = dessin.textlength(ligne, font=p_titre)
        dessin.text(((w - l) / 2, y), ligne, font=p_titre, fill=ENCRE)
        y += interligne

    if date:
        y += round(p_date.size * 0.35)
        l = dessin.textlength(date, font=p_date)
        dessin.text(((w - l) / 2, y), date, font=p_date, fill=GRIS)

    return calque


def voile_fin(taille: tuple[int, int], logo: Path | None, polices,
              surtitre: str = "Captured by", marque: str = "Time to Flash",
              adresse: str = "timetoflash.fr") -> Image.Image:
    """Le voile de fin : la pile s'éteint, la signature s'allume.

    « Captured by » avant le logo, et non après : on lit de haut en bas, et la
    phrase doit se terminer sur le nom, pas commencer par lui.
    """
    w, h = taille
    calque = Image.new("RGBA", taille, (12, 9, 7, 214))
    dessin = ImageDraw.Draw(calque)

    y = round(h * 0.375)
    p_sur = polices.get("mono", round(w * 0.026))
    y = _texte_centre(dessin, y, surtitre.upper(), p_sur, (235, 226, 210, 190), w,
                      interlettre=round(p_sur.size * 0.28))
    y += round(h * 0.022)

    if logo and Path(logo).exists():
        with Image.open(logo) as brut:
            vignette = brut.convert("RGBA")
        cote = round(w * 0.20)
        vignette = vignette.resize((cote, cote), Image.LANCZOS)
        calque.alpha_composite(vignette, ((w - cote) // 2, y))
        y += cote + round(h * 0.020)

    p_marque = polices.get("marque", round(w * 0.066))
    y = _texte_centre(dessin, y, marque, p_marque, (255, 252, 246, 255), w)
    y += round(h * 0.016)

    p_mono = polices.get("mono", round(w * 0.028))
    _texte_centre(dessin, y, adresse.upper(), p_mono, (*ORANGE, 255), w,
                  interlettre=round(p_mono.size * 0.22))

    return calque
