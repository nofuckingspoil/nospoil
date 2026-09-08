"""
L'appel à ffmpeg.

Les images ne passent pas par le disque : elles vont directement dans ffmpeg
par un tuyau. Écrire mille PNG en 1080x1920 coûterait un aller-retour d'un
gigaoctet et demi sur le disque, pour rien. `--frames-dir` reste là pour aller
regarder une image précise quand le rendu surprend.
"""

from __future__ import annotations

import shutil
import subprocess
import tempfile
from pathlib import Path


class ErreurFfmpeg(RuntimeError):
    pass


def ffmpeg_present() -> bool:
    return shutil.which("ffmpeg") is not None


def commande(
    plan,
    sortie: Path,
    musique: Path | None,
    declencheur: Path,
    nb_declencheurs: int,
    filtres: str,
    *,
    crf: int = 19,
    preset: str = "medium",
) -> list[str]:
    w, h = plan.taille
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pixel_format", "rgb24",
        "-video_size", f"{w}x{h}", "-framerate", str(plan.fps),
        "-i", "pipe:0",
    ]
    if musique is not None:
        # La musique tourne en boucle : une piste plus courte que la vidéo
        # laissait la fin en silence, ce qui se remarque tout de suite.
        cmd += ["-stream_loop", "-1", "-i", str(musique)]
    for _ in range(nb_declencheurs):
        cmd += ["-i", str(declencheur)]

    cmd += [
        "-filter_complex", filtres,
        "-map", "0:v", "-map", "[a]",
        "-c:v", "libx264", "-preset", preset, "-crf", str(crf),
        "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.0",
        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        "-t", f"{plan.duree:.3f}",
        "-movflags", "+faststart",
        str(sortie),
    ]
    return cmd


def encoder(cmd: list[str], images, *, frames_dir: Path | None = None,
            sortie: Path | None = None) -> None:
    """Envoyer les images dans ffmpeg et attendre le fichier."""
    with tempfile.TemporaryFile() as journal:
        proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=journal)
        try:
            for i, img in enumerate(images):
                if frames_dir is not None:
                    img.save(frames_dir / f"{i:06d}.png")
                proc.stdin.write(img.tobytes())
        except BrokenPipeError:
            # ffmpeg est mort en route : son message vaut mieux que le nôtre.
            pass
        finally:
            try:
                proc.stdin.close()
            except BrokenPipeError:
                pass
        code = proc.wait()
        if code != 0:
            # Un montage interrompu laisse un fichier tronqué, sans son index
            # de lecture : il a l'air d'une vidéo, pèse son poids, et aucun
            # lecteur ne veut l'ouvrir. Mieux vaut pas de fichier du tout.
            if sortie is not None:
                try:
                    Path(sortie).unlink(missing_ok=True)
                except OSError:
                    pass
            journal.seek(0)
            details = journal.read().decode("utf-8", "replace").strip()
            raise ErreurFfmpeg(details or f"ffmpeg s'est arrêté (code {code}).")
