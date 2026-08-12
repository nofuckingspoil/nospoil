# Le fichier d'association Apple

`public/.well-known/apple-app-site-association` dit à Apple que ce domaine et
l'application iPhone vont ensemble. Il fait deux choses :

- **applinks** : les liens `/j/`, `/g/`, `/event/`, `/connexion` et `/mes-photos`
  ouvrent l'application quand elle est installée, plutôt que Safari.
- **appclips** : quand elle ne l'est pas, le scan d'un QR code `/j/…` propose
  l'App Clip, qui s'ouvre sans installation.

Trois pièges, tous silencieux :

1. **Le fichier n'a pas d'extension.** Vercel le servirait en texte brut ;
   Apple exige `application/json`. D'où la règle `headers` de `vercel.json`.
2. **Aucune redirection n'est tolérée.** L'adresse
   `https://timetoflash.fr/.well-known/apple-app-site-association` doit répondre
   directement en 200.
3. **Le préfixe `L83FG88N3L.` est l'identifiant d'équipe Apple.** S'il change,
   ce fichier doit changer aussi, sinon plus rien ne s'ouvre.

Après toute modification, il faut redéployer, puis attendre : Apple met le
fichier en cache plusieurs heures.
