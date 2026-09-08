#!/usr/bin/env python3
"""
Le studio : choisir un événement, cocher dix photos, obtenir le Reel.

    python3 outils/reel/studio.py

Une page s'ouvre dans le navigateur. Tout tourne sur cette machine : les
identifiants ne quittent jamais le `.env`, et rien n'est envoyé nulle part. Le
serveur n'écoute que sur cet ordinateur, jamais sur le réseau.

Pourquoi une page plutôt qu'une ligne de commande : choisir dix photos parmi
trois cents en tapant des numéros est un supplice. Il faut les voir.
"""

from __future__ import annotations

import argparse
import base64
import html
import io
import json
import shutil
import subprocess
import tempfile
import threading
import traceback
import unicodedata
import uuid
import webbrowser
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from PIL import Image, ImageOps

import numpy as np

import reel as moteur
from depot import Depot, ErreurDepot
from polices import Polices
from styles import STYLES, composer

ICI = Path(__file__).resolve().parent
CACHE = ICI / ".cache"
BUREAU = Path.home() / "Desktop"
COTE_VIGNETTE = 340
MAX_PHOTOS = 12
CIBLE = 10

DEPOT: Depot | None = None
CHANTIERS: dict[str, dict] = {}
# Un seul montage à la fois. Deux montages lancés ensemble se disputaient le
# processeur, et surtout écrivaient dans le même fichier : ffmpeg trouvait la
# place occupée au moment de refermer le sien et rendait un fichier illisible.
VERROU = threading.Lock()


# ============================================================
#  Petits utilitaires
# ============================================================

def code(chemin: str) -> str:
    return base64.urlsafe_b64encode(chemin.encode()).decode()


def decode(valeur: str) -> str:
    return base64.urlsafe_b64decode(valeur.encode()).decode()


def sans_accent(v: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", v or "") if unicodedata.category(c) != "Mn"
    ).lower()


def nom_fichier(v: str) -> str:
    propre = "".join(c if c.isalnum() or c in " -_" else "" for c in sans_accent(v)).strip()
    return "-".join(propre.split()) or "evenement"


def chemin_libre(dossier: Path, base: str) -> Path:
    """Un nom qui n'écrase rien.

    On essaie les styles les uns après les autres pour les comparer : si le
    fichier gardait le même nom, le deuxième effacerait le premier sans rien
    dire, et il n'y aurait jamais rien à comparer.
    """
    cible = dossier / f"{base}.mp4"
    n = 2
    while cible.exists():
        cible = dossier / f"{base}-{n}.mp4"
        n += 1
    return cible


def jolie_date(iso: str | None) -> str:
    if not iso:
        return ""
    try:
        d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return ""
    return f"{d.day} {moteur.MOIS[d.month - 1]} {d.year}"


def date_iso(iso: str | None) -> str:
    return (iso or "")[:10]


# ============================================================
#  Les vignettes
# ============================================================

def vignette(chemin: str) -> bytes:
    """Une petite image, fabriquée une fois puis gardée sous le coude.

    Les photos font plusieurs centaines de kilooctets : en afficher trois cents
    telles quelles reviendrait à télécharger cent mégaoctets pour choisir dix
    images. On les réduit ici, et le cache fait le reste.
    """
    CACHE.mkdir(exist_ok=True)
    cible = CACHE / f"{code(chemin)[-60:]}.jpg"
    if cible.is_file():
        return cible.read_bytes()

    brut = DEPOT.telecharger(chemin)
    with Image.open(io.BytesIO(brut)) as img:
        img = ImageOps.exif_transpose(img).convert("RGB")
        img = ImageOps.fit(img, (COTE_VIGNETTE, COTE_VIGNETTE), Image.LANCZOS, centering=(0.5, 0.45))
        tampon = io.BytesIO()
        img.save(tampon, "JPEG", quality=80)
    octets = tampon.getvalue()
    cible.write_bytes(octets)
    return octets


def _chauffer(event_id: str, style: str) -> None:
    try:
        apercu_style(event_id, style)
    except Exception:
        pass


def apercu_style(event_id: str, style: str) -> bytes:
    """Une vignette du style, composée avec une photo de l'événement.

    Choisir un habillage dans une liste déroulante revient à choisir un plat
    sur un menu sans photo. Ici on montre le rendu, avec les photos de la
    soirée qu'on est en train de monter.
    """
    CACHE.mkdir(exist_ok=True)
    cible = CACHE / f"style-{event_id}-{style}.jpg"
    if cible.is_file():
        return cible.read_bytes()

    ev = DEPOT.evenement(event_id)
    chemin = ev.get("cover_url") if ev else None
    if not chemin:
        photos = DEPOT.photos(event_id)
        if not photos:
            raise ErreurDepot("Cet événement n'a aucune photo.")
        chemin = photos[len(photos) // 2]["chemin"]

    with Image.open(io.BytesIO(DEPOT.telecharger(chemin))) as brut:
        img = ImageOps.exif_transpose(brut).convert("RGB")

    contexte = {"nom": (ev.get("host_names") or ev.get("name") or "") if ev else "",
                "polices": Polices(), "alea": np.random.default_rng(1)}
    scene = composer(style, img, (1080, 1920), contexte).resize((300, 533), Image.LANCZOS)
    tampon = io.BytesIO()
    scene.save(tampon, "JPEG", quality=82)
    octets = tampon.getvalue()
    cible.write_bytes(octets)
    return octets


# ============================================================
#  Le montage, en tâche de fond
# ============================================================

def duree_de(fichier: Path) -> float:
    """Ce que dure vraiment le fichier produit.

    Calé sur les temps de la musique, l'intervalle est arrondi : la vidéo
    s'écarte donc un peu de la durée visée. Autant la mesurer que la promettre.
    """
    try:
        sortie = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(fichier)],
            capture_output=True, text=True, timeout=20,
        )
        return round(float(sortie.stdout.strip()), 1)
    except Exception:
        return 0.0


def lancer_chantier(demande: dict) -> str:
    jeton = uuid.uuid4().hex[:12]
    CHANTIERS[jeton] = {"etape": "demarrage", "fait": 0, "total": 0, "message": "Préparation…"}
    threading.Thread(target=_travailler, args=(jeton, demande), daemon=True).start()
    return jeton


def _avance(jeton: str, **champs) -> None:
    CHANTIERS[jeton].update(champs)


def _travailler(jeton: str, demande: dict) -> None:
    if VERROU.locked():
        _avance(jeton, etape="attente", message="Un autre montage est en cours…")
    with VERROU:
        _monter(jeton, demande)


def _monter(jeton: str, demande: dict) -> None:
    atelier = Path(tempfile.mkdtemp(prefix="reel-"))
    try:
        chemins = demande["photos"]
        _avance(jeton, etape="telechargement", total=len(chemins), fait=0,
                message="Récupération des photos…")

        dossier = atelier / "photos"
        dossier.mkdir()
        for i, chemin in enumerate(chemins, 1):
            # Le rang du nom fixe l'ordre : le moteur lit le dossier par ordre
            # alphabétique, et l'ordre choisi à l'écran doit être celui du film.
            DEPOT.enregistrer(chemin, dossier / f"{i:03d}{Path(chemin).suffix or '.jpg'}")
            _avance(jeton, fait=i, message=f"Photo {i} sur {len(chemins)}")

        couverture = None
        if demande.get("couverture"):
            couverture = atelier / "couverture.jpg"
            DEPOT.enregistrer(demande["couverture"], couverture)

        style = demande.get("style") or "pile"
        sortie = chemin_libre(
            BUREAU, f"reel-{nom_fichier(demande.get('titre') or 'evenement')}-{style}"
        )
        arguments = [
            "--photos", str(dossier),
            "--shutter", str(ICI / "assets" / "declencheur.wav"),
            "--out", str(sortie),
            "--titre", demande.get("titre") or "",
            "--date", demande.get("date") or "",
            "--seed", str(demande.get("graine") or 0),
        ]
        arguments += ["--style", style]
        if couverture:
            arguments += ["--cover", str(couverture)]
        if demande.get("muet"):
            arguments += ["--muet"]
        else:
            arguments += ["--music", str(ICI / "assets" / "musique.wav")]
        arguments += ["--duree", str(demande.get("duree") or 22)]
        if demande.get("bpm"):
            arguments += ["--bpm", str(demande["bpm"])]

        _avance(jeton, etape="montage", fait=0, total=0, message="Montage…")
        moteur.main(arguments, sur_avancement=lambda i, n: _avance(
            jeton, fait=i, total=n, message=f"Image {i} sur {n}"))

        _avance(jeton, etape="fini", message=str(sortie), fichier=str(sortie),
                secondes=duree_de(sortie))
    except SystemExit as e:
        # `reel.Refus` s'arrête par un SystemExit après avoir écrit la raison
        # dans le terminal : on renvoie la même idée à l'écran.
        _avance(jeton, etape="erreur",
                message=f"Le montage s'est arrêté (code {e.code}). Le terminal dit pourquoi.")
    except ErreurDepot as e:
        _avance(jeton, etape="erreur", message=str(e))
    except Exception as e:
        traceback.print_exc()
        _avance(jeton, etape="erreur", message=f"{type(e).__name__} : {e}")
    finally:
        shutil.rmtree(atelier, ignore_errors=True)


# ============================================================
#  Les pages
# ============================================================

STYLE = """
:root{--accent:#EC5B33;--accent-deep:#B64627;--ink:#221A12;--screen:#F4EBDA;
--card:#FCF8F0;--line:rgba(34,26,18,.14);--text3:#6E6252;--ok:#1F8A5B}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--screen);color:var(--ink);font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:26px 20px 90px}
.wrap{max-width:1080px;margin:0 auto}
a{color:inherit}
h1{font-size:26px;letter-spacing:-.02em;margin-bottom:4px}
.sur{font:600 11px/1 ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;color:var(--accent-deep);margin-bottom:9px}
.mut{color:var(--text3);font-size:14px}
input[type=text],input[type=date],input[type=search],select{font:inherit;padding:9px 12px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:inherit;width:100%}
input:focus,select:focus{outline:none;border-color:var(--accent)}
.evs{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:18px}
.ev{display:flex;gap:12px;align-items:center;padding:11px;border:1px solid var(--line);border-radius:13px;background:var(--card);text-decoration:none}
.ev:hover{border-color:var(--accent)}
.ev .v{width:56px;height:56px;border-radius:9px;object-fit:cover;flex:none;background:#e6ded0}
.ev b{display:block;font-size:15px;line-height:1.25}
.ev span{font-size:12.5px;color:var(--text3)}
.barre{position:fixed;left:0;right:0;bottom:0;background:rgba(244,235,218,.96);border-top:1px solid var(--line);padding:12px 20px;backdrop-filter:blur(8px);z-index:9}
.barre .in{max-width:1080px;margin:0 auto;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
button{font:700 15px/1 inherit;padding:13px 22px;border-radius:12px;border:none;background:var(--accent-deep);color:#fff;cursor:pointer}
button:disabled{opacity:.4;cursor:not-allowed}
button.sec{background:transparent;color:var(--ink);border:1px solid var(--line);font-weight:600}
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(128px,1fr));gap:9px}
@media (max-width:720px){.styles{grid-template-columns:repeat(2,1fr)}}
.ph{position:relative;aspect-ratio:1;border-radius:11px;overflow:hidden;cursor:pointer;background:#e6ded0;border:2px solid transparent}
.ph img{width:100%;height:100%;object-fit:cover;display:block}
.ph.on{border-color:var(--accent)}
.ph.on img{filter:brightness(.72)}
.ph .n{position:absolute;inset:auto 6px 6px auto;width:25px;height:25px;border-radius:50%;background:var(--accent);color:#fff;font:700 13px/25px sans-serif;text-align:center;display:none}
.ph.on .n{display:block}
.ph .q{position:absolute;left:0;right:0;bottom:0;padding:14px 7px 5px;font-size:10.5px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.6));white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.etape{font:600 10.5px/1 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-deep);margin:26px 0 10px;display:flex;gap:10px;align-items:baseline}
.etape span{color:var(--text3);letter-spacing:.04em;text-transform:none;font-size:11.5px}
.styles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.sty{display:block;padding:0;border:2px solid transparent;border-radius:13px;background:var(--card);cursor:pointer;overflow:hidden;text-align:left;font:inherit;color:inherit}
.sty img{display:block;width:100%;aspect-ratio:9/16;object-fit:cover;background:#e6ded0}
.sty b{display:block;font-size:13.5px;padding:8px 10px 0}
.sty em{display:block;font-style:normal;font-size:11.5px;line-height:1.35;color:var(--text3);padding:2px 10px 10px}
.sty:hover{border-color:var(--line)}
.sty.on{border-color:var(--accent);background:#fdf3e6}
.opts{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;padding:14px;border:1px solid var(--line);border-radius:13px;background:var(--card)}
.opts label{font:600 10.5px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);display:block;margin-bottom:5px}
.ch{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:600}
.ch input{width:17px;height:17px;accent-color:var(--accent-deep)}
.etat{position:fixed;inset:0;background:rgba(34,26,18,.9);color:#FCF8F0;display:none;align-items:center;justify-content:center;z-index:20;padding:24px}
.etat.on{display:flex}
.etat .b{max-width:440px;text-align:center}
.etat h2{font-size:21px;margin-bottom:10px}
.jauge{height:5px;border-radius:3px;background:rgba(252,248,240,.2);margin-top:18px;overflow:hidden}
.jauge i{display:block;height:100%;background:var(--accent);width:0;transition:width .25s}
.vide{padding:40px 0;text-align:center;color:var(--text3)}
"""


def page(titre: str, corps: str) -> bytes:
    return f"""<!doctype html><html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(titre)}</title><style>{STYLE}</style></head>
<body><div class="wrap">{corps}</div></body></html>""".encode("utf-8")


def page_evenements(recherche: str = "") -> bytes:
    evs = [e for e in DEPOT.evenements() if e.get("photo_count")]
    if recherche:
        q = sans_accent(recherche)
        evs = [e for e in evs
               if q in sans_accent(e.get("host_names") or "") or q in sans_accent(e.get("name") or "")]

    cartes = []
    for e in evs:
        nom = e.get("host_names") or e.get("name") or "Sans nom"
        couv = (f'<img class="v" src="/v?c={code(e["cover_url"])}" alt="" loading="lazy">'
                if e.get("cover_url") else '<div class="v"></div>')
        cartes.append(
            f'<a class="ev" href="/e/{e["id"]}">{couv}<div><b>{html.escape(nom)}</b>'
            f'<span>{e["photo_count"]} photo{"s" if e["photo_count"] > 1 else ""}'
            f' · {jolie_date(e.get("created_at"))}</span></div></a>'
        )

    liste = "".join(cartes) or '<p class="vide">Aucun événement avec des photos.</p>'
    return page("Studio Reel", f"""
<div class="sur">Time to Flash</div>
<h1>Quel événement ?</h1>
<p class="mut">Choisissez un événement, puis cochez {CIBLE} photos.</p>
<form method="get" style="margin-top:16px;max-width:360px">
  <input type="search" name="q" placeholder="Chercher un nom" value="{html.escape(recherche)}">
</form>
<div class="evs">{liste}</div>""")


def page_photos(event_id: str) -> bytes:
    ev = DEPOT.evenement(event_id)
    if not ev:
        return page("Introuvable", '<h1>Événement introuvable</h1><p><a href="/">Retour</a></p>')

    # Les quatre aperçus se fabriquent pendant que la page se charge : sinon
    # le sélecteur reste gris une dizaine de secondes, le temps que chaque
    # style se compose, et l'on croit que rien ne marche.
    for st in STYLES:
        threading.Thread(target=lambda k=st["key"]: _chauffer(event_id, k), daemon=True).start()

    photos = DEPOT.photos(event_id)
    nom = ev.get("host_names") or ev.get("name") or ""
    vignettes = "".join(
        f'<div class="ph" data-c="{code(p["chemin"])}">'
        f'<img src="/v?c={code(p["vignette"])}" alt="" loading="lazy">'
        f'<div class="q">{html.escape(p["qui"])}{" ♥" + str(p["coeurs"]) if p["coeurs"] else ""}</div>'
        f'<div class="n"></div></div>'
        for p in photos
    )

    vignettes_styles = "".join(
        f'<button class="sty{" on" if i == 0 else ""}" data-k="{st["key"]}">'
        f'<img src="/apercu?e={event_id}&s={st["key"]}" alt="" loading="lazy">'
        f'<b>{html.escape(st["label"])}</b><em>{html.escape(st["sub"])}</em></button>'
        for i, st in enumerate(STYLES)
    )

    couv = code(ev["cover_url"]) if ev.get("cover_url") else ""
    return page(f"Reel · {nom}", f"""
<div class="sur"><a href="/">← Tous les événements</a></div>
<h1>{html.escape(nom)}</h1>
<p class="mut">{"La couverture de l'événement ouvrira la vidéo." if couv else "Cet événement n'a pas de couverture : la vidéo s'ouvrira sur la première photo."}</p>

<div class="etape">1 · Le style <span>aperçu avec une photo de la soirée</span></div>
<div class="styles">{vignettes_styles}</div>

<div class="etape">2 · Les réglages</div>
<div class="opts">
  <div style="flex:1 1 200px"><label>Titre affiché</label>
    <input type="text" id="titre" value="{html.escape(nom)}"></div>
  <div style="flex:0 1 160px"><label>Date</label>
    <input type="date" id="date" value="{date_iso(ev.get('created_at'))}"></div>
  <div style="flex:0 1 190px"><label>Durée</label>
    <select id="duree">
      <option value="15">Story · environ 15 s</option>
      <option value="22" selected>Reel · environ 22 s</option>
      <option value="30">Posé · environ 30 s</option>
      <option value="40">Long · environ 40 s</option>
    </select></div>
  <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:8px">
    <label class="ch"><input type="checkbox" id="tempo" checked> Caler sur la musique</label>
    <label class="ch"><input type="checkbox" id="muet"> Sans musique</label>
  </div>
</div>

<div class="etape">3 · Les photos <span>{len(photos)} disponibles, cochez-en {CIBLE}</span></div>
<div class="grille">{vignettes}</div>

<div class="barre"><div class="in">
  <strong id="compte">0 photo choisie</strong>
  <span class="mut" id="conseil">Cliquez sur les photos.</span>
  <span style="flex:1"></span>
  <button class="sec" id="vider">Tout décocher</button>
  <button id="go" disabled>Créer le Reel</button>
</div></div>

<div class="etat" id="etat"><div class="b">
  <h2 id="etat-t">Montage en cours</h2>
  <p id="etat-m" class="mut" style="color:inherit;opacity:.75"></p>
  <div class="jauge"><i id="etat-j"></i></div>
  <p style="margin-top:20px"><button class="sec" id="fermer" style="color:#FCF8F0;border-color:rgba(252,248,240,.3);display:none">Fermer</button></p>
</div></div>

<script>
const MAX = {MAX_PHOTOS}, CIBLE = {CIBLE}, COUV = "{couv}";
const choix = [];
let style = 'pile';
const $ = (s) => document.querySelector(s);

document.querySelectorAll('.sty').forEach(el => el.addEventListener('click', () => {{
  style = el.dataset.k;
  document.querySelectorAll('.sty').forEach(o => o.classList.toggle('on', o === el));
}}));

function rafraichir() {{
  document.querySelectorAll('.ph').forEach(el => {{
    const i = choix.indexOf(el.dataset.c);
    el.classList.toggle('on', i >= 0);
    el.querySelector('.n').textContent = i >= 0 ? i + 1 : '';
  }});
  $('#compte').textContent = choix.length + (choix.length > 1 ? ' photos choisies' : ' photo choisie');
  $('#conseil').textContent = choix.length === 0 ? 'Cliquez sur les photos.'
    : choix.length < 3 ? 'Il en faut au moins trois.'
    : choix.length < CIBLE ? (CIBLE - choix.length) + ' de plus pour arriver à ' + CIBLE + '.'
    : choix.length >= MAX ? 'Maximum atteint.' : 'Prêt.';
  $('#go').disabled = choix.length < 3;
}}

document.querySelectorAll('.ph').forEach(el => el.addEventListener('click', () => {{
  const c = el.dataset.c, i = choix.indexOf(c);
  if (i >= 0) choix.splice(i, 1);
  else if (choix.length < MAX) choix.push(c);
  rafraichir();
}}));

$('#vider').addEventListener('click', () => {{ choix.length = 0; rafraichir(); }});

$('#go').addEventListener('click', async () => {{
  const muet = $('#muet').checked;
  const r = await fetch('/api/creer', {{
    method: 'POST', headers: {{'Content-Type': 'application/json'}},
    body: JSON.stringify({{
      photos: choix, couverture: COUV || null, style,
      titre: $('#titre').value, date: $('#date').value,
      duree: parseFloat($('#duree').value), muet,
      bpm: (!muet && $('#tempo').checked) ? 118 : null,
    }}),
  }}).then(r => r.json());
  if (r.erreur) {{ alert(r.erreur); return; }}
  $('#etat').classList.add('on');
  suivre(r.jeton);
}});

async function suivre(jeton) {{
  const e = await fetch('/api/etat?j=' + jeton).then(r => r.json());
  $('#etat-m').textContent = e.message || '';
  $('#etat-t').textContent = e.etape === 'telechargement' ? 'Récupération des photos'
    : e.etape === 'montage' ? 'Montage en cours'
    : e.etape === 'fini' ? 'C\\u2019est prêt' : e.etape === 'erreur' ? 'Ça a coincé' : 'Préparation';
  $('#etat-j').style.width = (e.total ? Math.round(100 * e.fait / e.total) : 0) + '%';
  if (e.etape === 'fini') {{
    $('#etat-j').style.width = '100%';
    $('#etat-m').textContent = 'Sur votre bureau : ' + e.fichier.split('/').pop()
      + (e.secondes ? ' · ' + e.secondes.toString().replace('.', ',') + ' s' : '');
    $('#fermer').style.display = 'inline-block';
    return;
  }}
  if (e.etape === 'erreur') {{ $('#fermer').style.display = 'inline-block'; return; }}
  setTimeout(() => suivre(jeton), 500);
}}

$('#fermer').addEventListener('click', () => $('#etat').classList.remove('on'));
rafraichir();
</script>""")


# ============================================================
#  Le serveur
# ============================================================

class Studio(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):  # le terminal sert à suivre le montage, pas les requêtes
        pass

    def _envoyer(self, octets: bytes, type_mime: str, cache: bool = False, statut: int = 200):
        self.send_response(statut)
        self.send_header("Content-Type", type_mime)
        self.send_header("Content-Length", str(len(octets)))
        if cache:
            self.send_header("Cache-Control", "max-age=86400")
        self.end_headers()
        self.wfile.write(octets)

    def do_GET(self):
        u = urlparse(self.path)
        params = parse_qs(u.query)
        try:
            if u.path == "/":
                self._envoyer(page_evenements((params.get("q") or [""])[0]), "text/html; charset=utf-8")
            elif u.path.startswith("/e/"):
                self._envoyer(page_photos(u.path[3:]), "text/html; charset=utf-8")
            elif u.path == "/v":
                self._envoyer(vignette(decode(params["c"][0])), "image/jpeg", cache=True)
            elif u.path == "/apercu":
                self._envoyer(apercu_style(params["e"][0], params["s"][0]), "image/jpeg", cache=True)
            elif u.path == "/api/etat":
                etat = CHANTIERS.get((params.get("j") or [""])[0], {"etape": "inconnu"})
                self._envoyer(json.dumps(etat).encode(), "application/json")
            else:
                self._envoyer(b"Rien ici.", "text/plain; charset=utf-8", statut=404)
        except ErreurDepot as e:
            self._envoyer(page("Erreur", f"<h1>Ça a coincé</h1><p>{html.escape(str(e))}</p>"),
                          "text/html; charset=utf-8", statut=502)
        except Exception as e:
            traceback.print_exc()
            self._envoyer(f"{type(e).__name__}: {e}".encode(), "text/plain; charset=utf-8", statut=500)

    def do_POST(self):
        if urlparse(self.path).path != "/api/creer":
            return self._envoyer(b"Rien ici.", "text/plain; charset=utf-8", statut=404)
        corps = json.loads(self.rfile.read(int(self.headers.get("Content-Length", 0))) or b"{}")
        chemins = [decode(c) for c in corps.get("photos", [])]
        if not 3 <= len(chemins) <= MAX_PHOTOS:
            return self._envoyer(
                json.dumps({"erreur": f"Choisissez entre 3 et {MAX_PHOTOS} photos."}).encode(),
                "application/json")
        demande = dict(corps)
        demande["photos"] = chemins
        demande["couverture"] = decode(corps["couverture"]) if corps.get("couverture") else None
        self._envoyer(json.dumps({"jeton": lancer_chantier(demande)}).encode(), "application/json")


def main() -> int:
    global DEPOT
    p = argparse.ArgumentParser(description="Choisir des photos et fabriquer le Reel.")
    p.add_argument("--port", type=int, default=4321)
    p.add_argument("--sans-navigateur", action="store_true")
    args = p.parse_args()

    for fichier, remede in (
        ("declencheur.wav", "python3 outils/reel/faire_declencheur.py"),
        ("musique.wav", "python3 outils/reel/faire_musique.py"),
    ):
        if not (ICI / "assets" / fichier).is_file():
            print(f"\n  ✕ Il manque assets/{fichier}.\n    Fabriquez-le : {remede}\n")
            return 2

    try:
        DEPOT = Depot()
    except ErreurDepot as e:
        print(f"\n  ✕ {e}\n")
        return 2

    adresse = f"http://127.0.0.1:{args.port}/"
    # 127.0.0.1 et non 0.0.0.0 : ce serveur lit une base de production avec une
    # clé de service, il n'a rien à faire sur le réseau local.
    serveur = ThreadingHTTPServer(("127.0.0.1", args.port), Studio)
    print(f"\n  Studio ouvert : {adresse}\n  Ctrl+C pour arrêter.\n")
    if not args.sans_navigateur:
        threading.Timer(0.6, lambda: webbrowser.open(adresse)).start()
    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        print("\n  Studio fermé.\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
