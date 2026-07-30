# Déclic NATIF — version entièrement recodée pour iPhone

Cette version ne dépend **plus** de votre site pour l'écran caméra : tout est
recodé en « langage Apple » (Swift), caméra comprise. La caméra est donc
**garantie** de fonctionner (plus de dépendance au navigateur).

Elle parle quand même à **votre serveur existant** (no-spoil.fr) pour rejoindre
l'événement, envoyer les photos, compter les poses, etc. → vous ne touchez à RIEN
côté serveur.

---

## ⚠️ Important à savoir (honnêteté)

- Ce code a été écrit **sans Xcode** (pas encore installé), donc il n'a **pas pu
  être compilé/testé**. C'est une **base fidèle et complète**, mais il faut
  s'attendre à **quelques petits ajustements** une fois ouvert dans Xcode
  (Apple signale parfois des détails à corriger). On les fera **ensemble**.
- C'est normal et habituel : on finalise toujours dans Xcode.

---

## Ce que contient `DeclicNative/`

| Fichier | Rôle |
|---------|------|
| `DeclicNativeApp.swift` | Démarrage (mettez ici l'id d'un événement de test) |
| `RootView.swift` | Aiguille entre les écrans |
| `CoverView.swift` | Écran d'accueil (la pochette) |
| `NameView.swift` | Écran « votre prénom » |
| `CameraScreen.swift` | Écran caméra : viseur, compteur, pellicule, visionneuse |
| `CameraModel.swift` | La caméra native (AVFoundation) + compression photo |
| `CameraPreview.swift` | L'aperçu vidéo en direct |
| `AppState.swift` | La logique (phases, photos, compteur) |
| `API.swift` | Les appels à votre serveur no-spoil.fr |
| `Device.swift` | Le jeton unique de l'appareil |
| `Theme.swift` | Les couleurs de la marque |

---

## Mise en place dans Xcode (une fois installé) — on le fera ensemble

1. **File ▸ New ▸ Project ▸ App** (iOS, SwiftUI, Swift). Nom : `DeclicNative`.
2. Supprimez les fichiers par défaut `ContentView.swift` et `…App.swift`.
3. Glissez **tous** les fichiers du dossier `DeclicNative/` dans le projet
   (« Copy items if needed » coché).
4. **Autorisation caméra** : cible ▸ Info ▸ ajoutez
   **Privacy - Camera Usage Description** = `Pour prendre les photos de l'album.`
5. **DeclicNativeApp.swift** : remplacez `REMPLACER_PAR_ID` par l'id d'un vrai
   événement de test (la partie après `/j/` dans un lien d'invitation no-spoil.fr).
6. Connectez votre **compte Apple gratuit** (Settings ▸ Accounts), activez
   « Automatically manage signing », branchez votre iPhone, appuyez **▶**.

## Le test
- L'app s'ouvre sur la pochette → « Rejoindre » → prénom → caméra native.
- Prenez une photo : elle doit apparaître dans la pellicule et s'envoyer.
- Ouvrez une photo → « Supprimer » pour vérifier la suppression.

---

## Et pour la fameuse bannière au scan (App Clip) ?

Une fois cette version native validée sur votre iPhone, on la transforme en
App Clip (le dossier `DeclicAppClip/` et le `GUIDE-FR.md`). À ce moment-là
seulement, le compte développeur payant (~99 $/an) devient nécessaire.
