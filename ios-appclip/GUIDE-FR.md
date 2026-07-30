# App Clip Déclic — Guide pas à pas (en français)

Objectif : reproduire la bannière « Participez à l'album collectif ! » de Once,
qui s'affiche au scan du QR, **sans que l'invité installe quoi que ce soit**.
On réutilise votre site web existant à l'intérieur d'un mini-programme Apple (App Clip).

---

## ⚠️ À lire d'abord : le risque n°1

L'App Clip affiche votre site dans une fenêtre web. **Le point à valider en priorité :
est-ce que prendre une photo (la caméra) fonctionne dans l'App Clip ?**
- ✅ Si oui → on réutilise ~90 % de votre site, projet rapide.
- ❌ Si non → il faudra recoder la caméra en natif (gros chantier).

On le saura dès le premier test sur un vrai iPhone.

---

## Vos 2 devoirs (à lancer maintenant, ça prend du temps)

### 1. Installer Xcode (gratuit)
- Ouvrez l'**App Store** sur votre Mac → cherchez **« Xcode »** → Installer.
- ~7 Go, comptez 30 min à 1 h selon votre connexion. (Vous avez 93 Go libres ✅)

### 2. Créer un compte développeur Apple (~99 $/an)
- Allez sur https://developer.apple.com/programs/ → « Enroll ».
- Il faut un identifiant Apple + une carte bancaire. La validation peut prendre 24-48 h.

> Tant que ces 2 points ne sont pas faits, on ne peut pas fabriquer l'app.
> Mais le code est déjà prêt (voir ci-dessous), donc on ne perd pas de temps.

---

## Ce qui est déjà prêt (fait par Claude)

Dans ce dossier `ios-appclip/` :
- `DeclicAppClip/DeclicAppClipApp.swift` — démarrage de l'App Clip
- `DeclicAppClip/ContentView.swift` — l'écran
- `DeclicAppClip/WebView.swift` — affiche votre site + autorise la caméra (pièce clé)
- `apple-app-site-association.template.json` — le fichier de liaison du domaine (modèle)

---

## La suite, une fois Xcode installé (on le fera ENSEMBLE, écran partagé)

1. **Créer le projet** dans Xcode : New Project → App → cocher « Include App Clip ».
   - Nom : Déclic · Identifiant (Bundle ID) : `com.declic.app` (par exemple).
2. **Glisser** les 3 fichiers `.swift` ci-dessus dans la cible « App Clip ».
3. **Autoriser la caméra** : dans Info de la cible App Clip, ajouter
   « Privacy - Camera Usage Description » avec un texte type
   « Pour prendre les photos de l'album ».
4. **Activer les domaines associés** : Signing & Capabilities → + Associated Domains →
   `appclips:no-spoil.fr` et `applinks:no-spoil.fr`.
5. **Compléter et publier le fichier de liaison** `apple-app-site-association`
   sur le site (Claude s'en charge côté no-spoil.fr une fois votre Team ID connu).
6. **Tester sur un vrai iPhone** branché : on vérifie LE point clé (la caméra).
7. **Configurer la carte App Clip** dans App Store Connect : c'est là qu'on écrit
   « Participez à l'album collectif ! » + l'image de fond.
8. **Soumettre à Apple** pour validation.

---

## Où on en est

- [x] Code de l'App Clip écrit
- [x] Modèle du fichier de liaison de domaine
- [ ] Xcode installé (À VOUS)
- [ ] Compte développeur Apple (À VOUS)
- [ ] Projet assemblé + test caméra sur iPhone (ENSEMBLE)
- [ ] Carte App Clip + soumission Apple (ENSEMBLE)
