#!/usr/bin/env python3
"""
Fabriquer une musique de fond.

Pourquoi la fabriquer plutôt que la prendre quelque part : **Instagram coupe
le son des Reels dont la musique n'est pas libre de droits**, sans prévenir.
Une piste que l'on a soi-même synthétisée n'appartient à personne d'autre, ne
peut être réclamée par personne, et ne sera jamais coupée.

Elle sert aussi de repère : le montage sait se caler sur son tempo, et les
photos tombent alors sur les temps.

    python3 outils/reel/faire_musique.py --bpm 118

Ce n'est pas un tube. C'est un fond rythmé, propre et sans risque, qui tient
les quinze secondes d'un Reel. Pour un vrai morceau du moment, mieux vaut
exporter la vidéo avec `--muet` et poser le son depuis Instagram : c'est
gratuit, c'est légal, et c'est ce que l'algorithme récompense.
"""

from __future__ import annotations

import argparse
import wave
from pathlib import Path

import numpy as np

FE = 48000

# Une marche mineure qui va avec à peu près n'importe quelles images : la même
# que la moitié des musiques d'ambiance, et pour la même raison.
# La, Fa, Do, Sol, en fréquences (Hz).
ACCORDS = [
    (220.00, 261.63, 329.63),   # La mineur
    (174.61, 220.00, 261.63),   # Fa majeur
    (261.63, 329.63, 392.00),   # Do majeur
    (196.00, 246.94, 293.66),   # Sol majeur
]
BASSES = [110.00, 87.31, 130.81, 98.00]


def _enveloppe(n: int, attaque: float, chute: float, puissance: float = 1.0) -> np.ndarray:
    """Monter vite, redescendre doucement. Sans cela, chaque note claque."""
    t = np.arange(n, dtype=np.float32)
    a = max(1, int(attaque * FE))
    env = np.ones(n, dtype=np.float32)
    env[:a] = np.linspace(0.0, 1.0, a, dtype=np.float32)
    env[a:] = np.power(np.exp(-(t[a:] - a) / max(1e-6, chute * FE)), puissance)
    return env


def grosse_caisse(duree: float = 0.30) -> np.ndarray:
    """Un coup de pied : une sinusoïde qui plonge, et s'éteint aussitôt."""
    n = int(duree * FE)
    t = np.arange(n, dtype=np.float32) / FE
    # La hauteur tombe de 110 à 45 Hz : c'est cette chute qui fait le « boum ».
    f = 45.0 + 65.0 * np.exp(-t * 32.0)
    phase = 2 * np.pi * np.cumsum(f) / FE
    corps = np.sin(phase) * _enveloppe(n, 0.001, 0.075)
    # Un souffle très court au tout début : l'attaque du batteur sur la peau.
    claque = np.random.default_rng(1).uniform(-1, 1, n).astype(np.float32) * _enveloppe(n, 0.0005, 0.004)
    return np.tanh((corps + claque * 0.35) * 1.6)


def charleston(duree: float = 0.07, ouverte: bool = False) -> np.ndarray:
    """Le petit « tss » entre deux temps : du bruit, très filtré, très court."""
    n = int((duree * (3.2 if ouverte else 1.0)) * FE)
    bruit = np.random.default_rng(2 if ouverte else 3).uniform(-1, 1, n).astype(np.float32)
    # Passe-haut du pauvre : la différence d'un signal avec lui-même décalé
    # supprime les graves. Deux passages suffisent à ne garder que l'aigu.
    for _ in range(2):
        bruit = np.diff(bruit, prepend=bruit[0])
    return bruit * _enveloppe(n, 0.0005, 0.012 if not ouverte else 0.06) * 0.5


def nappe(freqs: tuple[float, ...], duree: float) -> np.ndarray:
    """L'accord tenu, légèrement désaccordé pour qu'il respire."""
    n = int(duree * FE)
    t = np.arange(n, dtype=np.float32) / FE
    son = np.zeros(n, dtype=np.float32)
    for f in freqs:
        for desaccord, poids in ((0.997, 0.5), (1.0, 0.7), (1.004, 0.5)):
            son += np.sin(2 * np.pi * f * desaccord * t).astype(np.float32) * poids
        # Une octave au-dessus, en retrait : donne de l'air sans monter le volume.
        son += np.sin(2 * np.pi * f * 2 * t).astype(np.float32) * 0.12
    son /= len(freqs) * 2.0
    return son * _enveloppe(n, 0.35, duree * 0.9, 0.5)


def basse(freq: float, duree: float) -> np.ndarray:
    n = int(duree * FE)
    t = np.arange(n, dtype=np.float32) / FE
    onde = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
    return np.tanh(onde.astype(np.float32) * 1.3) * _enveloppe(n, 0.008, duree * 0.35)


def _poser(piste: np.ndarray, son: np.ndarray, debut: float, gain: float) -> None:
    d = int(debut * FE)
    if d >= len(piste):
        return
    n = min(len(son), len(piste) - d)
    piste[d:d + n] += son[:n] * gain


def fabriquer(bpm: float, duree: float) -> np.ndarray:
    temps = 60.0 / bpm
    mesure = temps * 4
    piste = np.zeros(int(duree * FE) + FE, dtype=np.float32)

    caisse = grosse_caisse()
    hat = charleston()
    hat_ouvert = charleston(ouverte=True)

    n_mesures = int(np.ceil(duree / mesure)) + 1
    for m in range(n_mesures):
        t0 = m * mesure
        accord = ACCORDS[m % len(ACCORDS)]
        _poser(piste, nappe(accord, mesure * 1.05), t0, 0.30)
        _poser(piste, basse(BASSES[m % len(BASSES)], temps * 1.6), t0, 0.34)
        _poser(piste, basse(BASSES[m % len(BASSES)], temps * 1.2), t0 + temps * 2, 0.26)

        for b in range(4):
            _poser(piste, caisse, t0 + b * temps, 0.62)
            # Le contretemps porte tout le mouvement : sans lui, la boucle
            # avance mais ne danse pas.
            ouvert = b == 3
            _poser(piste, hat_ouvert if ouvert else hat, t0 + b * temps + temps / 2,
                   0.30 if ouvert else 0.22)
            if b % 2 == 1:
                _poser(piste, hat, t0 + b * temps + temps * 0.75, 0.12)

    piste = piste[:int(duree * FE)]
    crete = float(np.max(np.abs(piste))) or 1.0
    return np.tanh(piste / crete * 1.15) * 0.86


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
    p = argparse.ArgumentParser(description="Fabriquer une musique de fond libre de tout droit.")
    p.add_argument("--bpm", type=float, default=118, help="tempo (100 = posé, 125 = nerveux)")
    p.add_argument("--duree", type=float, default=45.0, help="durée en secondes")
    p.add_argument("--out", type=Path,
                   default=Path(__file__).resolve().parent / "assets" / "musique.wav")
    args = p.parse_args()

    ecrire(fabriquer(args.bpm, args.duree), args.out)
    print(f"  ✓ {args.out}  ({args.duree:.0f} s à {args.bpm:.0f} bpm)")
    print(f"    Pour caler les photos dessus : --bpm {args.bpm:.0f}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
