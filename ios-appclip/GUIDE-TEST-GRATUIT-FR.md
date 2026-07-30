# Test caméra GRATUIT — pas besoin de payer Apple

But : vérifier que **prendre une photo fonctionne** quand votre site Déclic
est affiché dans une app iOS. Si oui → l'App Clip est jouable. Si non → on revoit l'approche.

Nécessaire : **Xcode** (gratuit) + votre **identifiant Apple** habituel (gratuit) + **votre iPhone** avec son câble.
PAS besoin du compte développeur à 99 $.

---

## Étape 1 — Créer un événement de test sur no-spoil.fr
- Créez un événement bidon sur votre site, récupérez le **lien d'invitation** (du type `https://no-spoil.fr/j/XXXX`).
- Ouvrez `ios-appclip/DeclicTest/DeclicTestApp.swift` et remplacez
  `https://no-spoil.fr/j/REMPLACER_PAR_ID` par ce vrai lien.

## Étape 2 — Créer le projet dans Xcode
1. Ouvrez **Xcode** → *File ▸ New ▸ Project…*
2. Choisissez **App** (iOS) → *Next*.
3. Product Name : `DeclicTest` · Interface : **SwiftUI** · Language : **Swift** → *Next* → enregistrez.

## Étape 3 — Mettre notre code dans le projet
1. Dans Xcode, supprimez le fichier `ContentView.swift` créé par défaut (clic droit ▸ Delete ▸ Move to Trash).
2. Glissez les **3 fichiers** du dossier `DeclicTest/` (`DeclicTestApp.swift`, `ContentView.swift`, `WebView.swift`)
   dans le projet Xcode. Cochez « Copy items if needed ».
   *(Si Xcode a déjà un fichier `…App.swift`, remplacez son contenu par le nôtre.)*

## Étape 4 — Autoriser la caméra
1. Sélectionnez le projet (icône bleue en haut) ▸ onglet **Info** de la cible.
2. Ajoutez une ligne : **Privacy - Camera Usage Description**
   valeur : `Pour prendre les photos de l'album.`

## Étape 5 — Connecter votre compte Apple gratuit
1. Xcode ▸ menu *Xcode ▸ Settings ▸ Accounts* ▸ **+** ▸ Apple ID ▸ connectez-vous.
2. Onglet **Signing & Capabilities** de la cible ▸ cochez **Automatically manage signing**
   ▸ Team : choisissez votre nom (Personal Team).

## Étape 6 — Lancer sur VOTRE iPhone
1. Branchez l'iPhone au Mac (autorisez « Faire confiance » si demandé).
2. En haut de Xcode, choisissez votre iPhone comme destination.
3. Cliquez le bouton **▶ (Play)**.
4. 1ʳᵉ fois : sur l'iPhone, allez dans *Réglages ▸ Général ▸ VPN et gestion de l'appareil*
   ▸ faites confiance à votre profil développeur. Relancez ▶.

## Étape 7 — LE test
- L'app s'ouvre sur votre invitation Déclic.
- Avancez jusqu'à l'écran caméra, autorisez la caméra quand iOS le demande.
- **Essayez de prendre une photo.**
  - ✅ Ça marche → super, l'App Clip est viable. On passe au compte payant.
  - ❌ Écran noir / pas de caméra → dites-le moi, on recodera la caméra en natif.

---

> Rappel : cette app de test reste sur **votre** iPhone (valable 7 jours, on peut relancer).
> Ce n'est pas pour le public — c'est juste pour valider le risque sans payer.
