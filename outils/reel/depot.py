"""
L'accès aux données du site : les événements, leurs photos, leur couverture.

Deux dépôts distincts, comme sur le site : la base Supabase tient la liste des
événements et des photos, Cloudflare R2 tient les fichiers. On n'écrit jamais
rien ici, on ne fait que lire : cet outil sert à fabriquer une vidéo, pas à
toucher aux souvenirs de qui que ce soit.

Les identifiants viennent du fichier `.env` du site, jamais d'un argument de
ligne de commande : une clé tapée dans un terminal reste dans son historique.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import ssl
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urlparse

RACINE = Path(__file__).resolve().parent.parent.parent
ENV = RACINE / ".env"


class ErreurDepot(RuntimeError):
    pass


def _contexte_ssl() -> ssl.SSLContext:
    """Le magasin de certificats.

    Le Python installé depuis python.org sur un Mac n'utilise pas celui du
    système : sans cette précaution, toute connexion échoue sur un « certificate
    verify failed » que rien n'explique. `certifi` accompagne pip, il est donc
    presque toujours là ; sinon on retombe sur la configuration par défaut.
    """
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


SSL = _contexte_ssl()


# ---------- Les identifiants ----------

def lire_env(chemin: Path = ENV) -> dict[str, str]:
    if not chemin.is_file():
        raise ErreurDepot(f"Fichier de configuration introuvable : {chemin}")
    valeurs: dict[str, str] = {}
    for ligne in chemin.read_text(encoding="utf-8").splitlines():
        ligne = ligne.strip()
        if not ligne or ligne.startswith("#") or "=" not in ligne:
            continue
        cle, valeur = ligne.split("=", 1)
        valeurs[cle.strip()] = valeur.strip().strip('"').strip("'")
    return valeurs


class Depot:
    def __init__(self, env: dict[str, str] | None = None):
        self.env = env if env is not None else lire_env()
        manquantes = [
            c for c in ("SUPABASE_URL", "SUPABASE_SERVICE_KEY", "R2_ENDPOINT",
                        "R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY")
            if not self.env.get(c)
        ]
        if manquantes:
            raise ErreurDepot("Clés absentes du .env : " + ", ".join(manquantes))

    # ---------- Supabase ----------

    def _lire(self, table: str, requete: str) -> list[dict]:
        cle = self.env["SUPABASE_SERVICE_KEY"]
        url = f"{self.env['SUPABASE_URL'].rstrip('/')}/rest/v1/{table}?{requete}"
        demande = urllib.request.Request(url, headers={
            "apikey": cle,
            "Authorization": f"Bearer {cle}",
            "Accept": "application/json",
        })
        try:
            with urllib.request.urlopen(demande, timeout=30, context=SSL) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:300]
            raise ErreurDepot(f"Supabase a répondu {e.code} : {detail}") from None
        except urllib.error.URLError as e:
            raise ErreurDepot(f"Supabase injoignable : {e.reason}") from None

    def evenements(self, limite: int = 200) -> list[dict]:
        """Les événements, du plus récent au plus ancien, avec leur compte de photos."""
        lignes = self._lire(
            "events",
            "select=id,name,host_names,cover_url,created_at,reveal_at,status"
            f"&order=created_at.desc&limit={limite}",
        )
        comptes = self.comptes_photos()
        for ev in lignes:
            ev["photo_count"] = comptes.get(ev["id"], 0)
        return lignes

    def comptes_photos(self) -> dict[str, int]:
        # PostgREST ne sait pas grouper : on lit les identifiants et on compte
        # ici. À l'échelle de quelques milliers de photos, c'est instantané.
        lignes = self._lire("photos", "select=event_id&hidden=is.false&limit=100000")
        comptes: dict[str, int] = {}
        for l in lignes:
            comptes[l["event_id"]] = comptes.get(l["event_id"], 0) + 1
        return comptes

    def evenement(self, event_id: str) -> dict | None:
        lignes = self._lire(
            "events",
            f"id=eq.{event_id}&select=id,name,host_names,cover_url,created_at,reveal_at&limit=1",
        )
        return lignes[0] if lignes else None

    def photos(self, event_id: str) -> list[dict]:
        """Les photos visibles d'un événement, avec leur auteur et leurs cœurs."""
        lignes = self._lire(
            "photos",
            f"event_id=eq.{event_id}&hidden=is.false"
            "&select=id,storage_path,thumb_path,taken_at,guest_id,guests(display_name)"
            "&order=taken_at.asc",
        )
        favoris = self._lire("favorites", f"event_id=eq.{event_id}&select=photo_id")
        compte: dict[str, int] = {}
        for f in favoris:
            compte[f["photo_id"]] = compte.get(f["photo_id"], 0) + 1

        return [
            {
                "id": l["id"],
                "chemin": l["storage_path"],
                "vignette": l.get("thumb_path") or l["storage_path"],
                "prise_a": l.get("taken_at"),
                "qui": (l.get("guests") or {}).get("display_name") or "Participant",
                "coeurs": compte.get(l["id"], 0),
            }
            for l in lignes
            if l.get("storage_path")
        ]

    # ---------- Cloudflare R2 ----------

    def _url(self, chemin: str) -> str:
        cle = "/".join(quote(s, safe="") for s in str(chemin).split("/"))
        return f"{self.env['R2_ENDPOINT'].rstrip('/')}/{self.env['R2_BUCKET']}/{cle}"

    def _entetes_signees(self, url: str) -> dict[str, str]:
        """Signer une lecture, à la manière d'Amazon S3 (R2 parle le même langage).

        La signature se calcule ici, sans aucun appel réseau : c'est une simple
        empreinte de la requête, scellée avec la clé secrète.
        """
        u = urlparse(url)
        maintenant = datetime.now(timezone.utc)
        horodatage = maintenant.strftime("%Y%m%dT%H%M%SZ")
        jour = horodatage[:8]
        charge = "UNSIGNED-PAYLOAD"

        entetes = {"host": u.netloc, "x-amz-content-sha256": charge, "x-amz-date": horodatage}
        signees = "host;x-amz-content-sha256;x-amz-date"
        canoniques = "".join(f"{k}:{v}\n" for k, v in sorted(entetes.items()))
        requete = f"GET\n{u.path}\n{u.query}\n{canoniques}\n{signees}\n{charge}"

        portee = f"{jour}/auto/s3/aws4_request"
        a_signer = (
            "AWS4-HMAC-SHA256\n"
            f"{horodatage}\n{portee}\n"
            f"{hashlib.sha256(requete.encode()).hexdigest()}"
        )

        cle = f"AWS4{self.env['R2_SECRET_ACCESS_KEY']}".encode()
        for morceau in (jour, "auto", "s3", "aws4_request"):
            cle = hmac.new(cle, morceau.encode(), hashlib.sha256).digest()
        signature = hmac.new(cle, a_signer.encode(), hashlib.sha256).hexdigest()

        entetes["Authorization"] = (
            f"AWS4-HMAC-SHA256 Credential={self.env['R2_ACCESS_KEY_ID']}/{portee}, "
            f"SignedHeaders={signees}, Signature={signature}"
        )
        return entetes

    def telecharger(self, chemin: str) -> bytes:
        url = self._url(chemin)
        demande = urllib.request.Request(url, headers=self._entetes_signees(url))
        try:
            with urllib.request.urlopen(demande, timeout=60, context=SSL) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            raise ErreurDepot(f"Photo illisible ({e.code}) : {chemin}") from None
        except urllib.error.URLError as e:
            raise ErreurDepot(f"Stockage injoignable : {e.reason}") from None

    def enregistrer(self, chemin: str, destination: Path) -> Path:
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(self.telecharger(chemin))
        return destination
