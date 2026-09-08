"""
La bande-son, en un seul passage de ffmpeg.

Un déclencheur par apparition, calé à la milliseconde sur l'image du flash,
posé au-dessus de la musique, qui se baisse d'elle-même sous chaque clic. Tout
tient dans un seul graphe de filtres, donc un seul encodage AAC : réencoder la
musique deux fois ne l'améliorerait pas.
"""

from __future__ import annotations

# Tout le monde au même format avant de se mélanger : sans cela, une musique
# en 44,1 kHz mono et un déclencheur en 48 kHz stéréo se disputent, et ffmpeg
# refuse le mixage.
FORMAT = "aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo"


def db_en_lineaire(db: float) -> float:
    return float(10.0 ** (db / 20.0))


def construire_filtres(
    instants: list[float],
    duree: float,
    *,
    muet: bool = False,
    gain_declencheur_db: float = 6.0,
    fade_in: float = 0.3,
    fade_out: float = 1.0,
) -> str:
    """Le graphe de filtres complet, prêt pour `-filter_complex`.

    Les entrées de ffmpeg sont, dans l'ordre : les images (0), la musique (1)
    s'il y en a une, puis un exemplaire du déclencheur par apparition.

    Sans musique, il ne reste que les déclencheurs : c'est le montage qu'on
    publie quand on veut poser un son du moment depuis Instagram.
    """
    if not instants:
        raise ValueError("Aucun déclencheur : il faut au moins une photo.")

    premiere_entree = 1 if muet else 2
    gain = db_en_lineaire(gain_declencheur_db)
    depart_fondu = max(0.0, duree - fade_out)
    parties = []
    if not muet:
        parties.append(
            f"[1:a]{FORMAT},atrim=0:{duree:.3f},asetpts=N/SR/TB,"
            f"afade=t=in:st=0:d={fade_in:.3f},"
            f"afade=t=out:st={depart_fondu:.3f}:d={fade_out:.3f}[mus]"
        )

    for k, t in enumerate(instants):
        ms = max(0, int(round(t * 1000)))
        parties.append(
            f"[{premiere_entree + k}:a]{FORMAT},adelay=all=1:delays={ms},"
            f"volume={gain:.4f}[s{k}]"
        )

    if len(instants) == 1:
        parties.append("[s0]anull[declbrut]")
    else:
        entrees = "".join(f"[s{k}]" for k in range(len(instants)))
        parties.append(
            f"{entrees}amix=inputs={len(instants)}:normalize=0:dropout_transition=0[declbrut]"
        )

    if muet:
        parties.append(f"[declbrut]atrim=0:{duree:.3f},alimiter=limit=0.96[a]")
        return ";".join(parties)

    # La piste des déclencheurs sert deux fois : une fois pour commander la
    # baisse de la musique, une fois pour s'entendre. Un même flux ne peut pas
    # partir vers deux filtres, d'où le dédoublement.
    parties.append(f"[declbrut]atrim=0:{duree:.3f},asplit=2[decl1][decl2]")
    parties.append(
        "[mus][decl1]sidechaincompress="
        "threshold=0.08:ratio=3:attack=8:release=150:makeup=1[musduck]"
    )
    parties.append(
        "[musduck][decl2]amix=inputs=2:normalize=0:duration=first,"
        "alimiter=limit=0.96[a]"
    )

    return ";".join(parties)
