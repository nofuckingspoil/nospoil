"""
Trouver des polices, sans rien exiger de la machine.

On cherche d'abord dans `assets/`, pour qu'un fichier déposé là gagne toujours,
puis parmi les polices du système. Si vraiment rien n'est trouvé, on prend
celle de Pillow : la vidéo sera moins belle, mais elle sortira.
"""

from __future__ import annotations

from pathlib import Path

from PIL import ImageFont

ASSETS = Path(__file__).resolve().parent / "assets"

# Chaque famille est une liste d'essais, du plus souhaitable au dernier
# recours. Un couple (chemin, index) : les fichiers .ttc contiennent
# plusieurs graisses, et l'index dit laquelle prendre.
FAMILLES: dict[str, list[tuple[str, int]]] = {
    "titre": [
        ("/System/Library/Fonts/Supplemental/Georgia Italic.ttf", 0),
        ("/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf", 0),
        ("/System/Library/Fonts/Supplemental/Baskerville.ttc", 2),
        ("/Library/Fonts/Georgia Italic.ttf", 0),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf", 0),
    ],
    "marque": [
        ("/System/Library/Fonts/Avenir Next.ttc", 0),
        ("/System/Library/Fonts/Supplemental/Futura.ttc", 1),
        ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 0),
    ],
    "mono": [
        ("/System/Library/Fonts/Menlo.ttc", 1),
        ("/System/Library/Fonts/Supplemental/Courier New Bold.ttf", 0),
        ("/System/Library/Fonts/Supplemental/Andale Mono.ttf", 0),
        ("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", 0),
    ],
    "manuscrite": [
        ("/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf", 0),
        ("/System/Library/Fonts/Supplemental/SnellRoundhand.ttc", 1),
        ("/System/Library/Fonts/Supplemental/Chalkboard.ttc", 0),
        ("/System/Library/Fonts/Supplemental/Georgia Italic.ttf", 0),
    ],
}

# Les fichiers déposés dans assets/ passent avant tout le reste.
NOMS_ASSETS: dict[str, list[str]] = {
    "titre": ["titre.ttf", "titre.otf"],
    "marque": ["marque.ttf", "marque.otf"],
    "mono": ["mono.ttf", "mono.otf"],
    "manuscrite": ["manuscrite.ttf", "manuscrite.otf"],
}


class Polices:
    """Une fabrique de polices, qui garde en mémoire ce qu'elle a déjà ouvert."""

    def __init__(self, remplacements: dict[str, Path] | None = None):
        self._remplacements = remplacements or {}
        self._resolues: dict[str, tuple[str, int] | None] = {}
        self._cache: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}

    def _resoudre(self, famille: str) -> tuple[str, int] | None:
        if famille in self._resolues:
            return self._resolues[famille]

        essais: list[tuple[str, int]] = []
        impose = self._remplacements.get(famille)
        if impose:
            essais.append((str(impose), 0))
        for nom in NOMS_ASSETS.get(famille, []):
            essais.append((str(ASSETS / nom), 0))
        essais.extend(FAMILLES.get(famille, []))

        trouve = None
        for chemin, index in essais:
            if not Path(chemin).exists():
                continue
            try:
                ImageFont.truetype(chemin, 24, index=index)
                trouve = (chemin, index)
                break
            except OSError:
                continue
        self._resolues[famille] = trouve
        return trouve

    def get(self, famille: str, taille: int) -> ImageFont.FreeTypeFont:
        taille = max(6, int(taille))
        resolue = self._resoudre(famille)
        if resolue is None:
            return ImageFont.load_default(taille)
        cle = (f"{resolue[0]}#{resolue[1]}", taille)
        if cle not in self._cache:
            self._cache[cle] = ImageFont.truetype(resolue[0], taille, index=resolue[1])
        return self._cache[cle]

    def manquantes(self) -> list[str]:
        return [f for f in FAMILLES if self._resoudre(f) is None]
