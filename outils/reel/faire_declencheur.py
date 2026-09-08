#!/usr/bin/env python3
"""
Fabriquer le bruit de déclencheur.

L'application n'utilise pas de fichier audio : elle synthétise le clic à la
volée (voir `playShutter` dans src/lib/camera.js). On refait ici exactement la
même recette, pour que la vidéo et l'appareil photo fassent le même bruit.

    python3 outils/reel/faire_declencheur.py

Le fichier atterrit dans outils/reel/assets/declencheur.wav.
"""

from __future__ import annotations

import argparse
import math
import wave
from pathlib import Path

import numpy as np

FE = 48000  # fréquence d'échantillonnage

# Deux clics mécaniques : un sec à l'ouverture, un plus doux à la fermeture,
# soixante-dix millisecondes plus tard.
CLICS = [
    # (départ en secondes, volume, coupure du passe-haut en Hz, durée)
    (0.000, 0.55, 1700.0, 0.050),
    (0.070, 0.30, 1200.0, 0.060),
]
DUREE = 0.22


def passe_haut(x: np.ndarray, coupure: float, q: float = 0.707) -> np.ndarray:
    """Un passe-haut du second ordre, à la main.

    Sans lui, le bruit blanc fait « chut » au lieu de « clac » : ce sont les
    graves qu'il faut retirer pour entendre un mécanisme.
    """
    w0 = 2.0 * math.pi * coupure / FE
    alpha = math.sin(w0) / (2.0 * q)
    cos0 = math.cos(w0)
    b = np.array([(1 + cos0) / 2, -(1 + cos0), (1 + cos0) / 2])
    a = np.array([1 + alpha, -2 * cos0, 1 - alpha])
    b /= a[0]
    a = a / a[0]

    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    for i, xi in enumerate(x):
        yi = b[0] * xi + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2
        y[i] = yi
        x2, x1 = x1, xi
        y2, y1 = y1, yi
    return y


def fabriquer(graine: int = 7) -> np.ndarray:
    alea = np.random.default_rng(graine)
    piste = np.zeros(int(DUREE * FE), dtype=np.float64)

    for depart, gain, coupure, duree in CLICS:
        n = int(duree * FE)
        # Bruit qui s'éteint vite : l'enveloppe fait tout le caractère du clic.
        enveloppe = np.power(1.0 - np.arange(n) / n, 2.4)
        clic = passe_haut(alea.uniform(-1.0, 1.0, n) * enveloppe, coupure) * gain
        d = int(depart * FE)
        piste[d:d + n] += clic

    crete = float(np.max(np.abs(piste))) or 1.0
    return piste / crete * 0.9


def ecrire(piste: np.ndarray, sortie: Path) -> None:
    entiers = np.clip(piste * 32767.0, -32768, 32767).astype("<i2")
    stereo = np.repeat(entiers[:, None], 2, axis=1)
    sortie.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(sortie), "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(FE)
        f.writeframes(stereo.tobytes())


def main() -> int:
    p = argparse.ArgumentParser(description="Fabriquer le wav du déclencheur.")
    p.add_argument("--out", type=Path,
                   default=Path(__file__).resolve().parent / "assets" / "declencheur.wav")
    p.add_argument("--seed", type=int, default=7)
    args = p.parse_args()

    ecrire(fabriquer(args.seed), args.out)
    print(f"  ✓ {args.out}  ({DUREE * 1000:.0f} ms)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
