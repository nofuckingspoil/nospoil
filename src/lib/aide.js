// ============================================================
//  Contenu de la page d'aide (/aide).
//
//  Volontairement HORS du blog : le journal est une vitrine, et un prospect
//  qui hésite n'a rien à gagner à tomber sur la liste de ce qui peut mal
//  tourner. Cette page ne s'atteint qu'au moment où l'on a un problème : 
//  depuis l'écran d'erreur du participant, le tableau de bord, le mail de
//  création ou le pied de page.
//
//  Fichier PARTAGÉ avec l'app (aucun import). `AIDE` reste la version
//  française ; `aideDe(langue)` renvoie la version dans la langue voulue
//  (par défaut celle du navigateur ou de l'app, `globalThis.__ttfLangue`).
//  Les liens du corps restent sans préfixe de langue (« /guide ») : le site
//  les préfixe à l'affichage, l'app les ouvre à sa façon.
// ============================================================

const tr = (o, l) => o[l || globalThis.__ttfLangue] ?? o.fr

export const AIDE = {
  title: 'Un participant bloqué ?',
  subtitle: 'Les 9 pannes les plus fréquentes, et leur solution en une minute.',
  intro:
    "Cette page est faite pour être transférée telle quelle à quelqu'un qui coince le jour J. " +
    "Chaque titre est le symptôme tel qu'on le décrit, pas la cause technique.",
  image: '/journal/ca-ne-marche-pas-solutions.webp',
  caption: "Un participant scanne un QR code posé sur une table, en soirée",
  body: `<p>Neuf fois sur dix, un participant bloqué l’est pour une des raisons ci-dessous, et la solution prend moins d’une minute. Garde cette page sous la main le jour J : elle est faite pour être transférée telle quelle à quelqu’un qui coince.</p>

<h2>1. « La caméra ne s’ouvre pas » : page ouverte dans Instagram ou Messenger</h2>
<p>C’est de loin la panne numéro un. Quand on touche un lien depuis Instagram, Messenger, WhatsApp, TikTok ou Snapchat, la page s’ouvre dans un <strong>mini-navigateur intégré à l’application</strong>, pas dans le vrai navigateur. Ces mini-navigateurs bloquent souvent l’accès à la caméra.</p>
<p><strong>La solution :</strong> touche les trois points « … » (ou la petite flèche) en haut ou en bas de l’écran, puis <strong>« Ouvrir dans le navigateur »</strong> : Safari sur iPhone, Chrome sur Android. Tout fonctionne normalement ensuite.</p>
<p><strong>Le plus souvent, tu n’auras rien à faire.</strong> Time to Flash reconnaît ces mini-navigateurs, mais il ne renonce pas pour autant : certains autorisent très bien la caméra. Il essaie donc, et bascule tout seul sur l’appareil photo du téléphone si l’aperçu en direct ne s’ouvre pas. Le participant lit alors une phrase sous le viseur, « touche le déclencheur, l’appareil photo de ton téléphone s’ouvre », et ses photos rejoignent l’album exactement comme les autres.</p>
<p>Autrement dit, n’attends pas un message d’alerte chez tes invités : il n’y en a pas, parce qu’il n’y a rien de cassé. Une consigne apparaît seulement si la caméra a été explicitement refusée, et elle explique alors la manipulation à faire (voir le point suivant).</p>
<p><strong>La seule vraie exception, sur Android : les applis de scan de QR code.</strong> Beaucoup de participants ne scannent pas avec l’appareil photo de leur téléphone, mais avec une appli dédiée téléchargée sur le Play Store. Cette appli affiche alors la page dans sa propre fenêtre, qui n’a le droit ni d’ouvrir la caméra, ni de lancer l’appareil photo du téléphone : le déclencheur ne répond plus, sans le moindre message. Time to Flash reconnaît ce cas et propose un bouton <strong>« Ouvrir dans Chrome »</strong> (et, s’il ne suffit pas, la copie du lien à coller dans Chrome).</p>
<p><strong>La consigne à donner, en une phrase :</strong> « scanne avec l’appareil photo de ton téléphone, pas avec une appli de QR code ». L’appareil photo, lui, confie le lien au vrai navigateur, et tout fonctionne du premier coup.</p>

<h2>2. « Autorisation refusée » : la caméra a été bloquée par erreur</h2>
<p>Un « Refuser » cliqué trop vite sur la demande d’autorisation, et le navigateur s’en souvient. Il faut le lui faire oublier.</p>
<p><strong>Sur iPhone (Safari) :</strong> touche <strong>« aA »</strong> à gauche de l’adresse → <em>Réglages du site</em> → <em>Caméra</em> → <strong>Autoriser</strong>.</p>
<p><strong>Sur Android (Chrome) :</strong> touche le <strong>cadenas 🔒</strong> à gauche de l’adresse → <em>Autorisations</em> → <em>Caméra</em> → <strong>Autoriser</strong>.</p>
<p>Puis recharge la page. Si la manipulation te semble compliquée à expliquer par-dessus la musique : le bouton central ouvre l’appareil photo du téléphone, ça marche aussi.</p>

<h2>3. « Le QR code ne scanne pas »</h2>
<p>Téléphone ancien, appareil photo capricieux, lumière tamisée en fin de soirée. Plutôt que d’insister : <strong>fais scanner le code depuis un autre téléphone</strong>, puis envoie le lien obtenu à la personne par message. Le lien fonctionne exactement comme le QR code.</p>
<p>Astuce préventive : sur les cartons posés en fin de repas, la lumière baisse. Prévois-en quelques-uns près des points lumineux.</p>

<h2>4. « Mes photos ne partent pas » : le réseau de la salle</h2>
<p>Le grand classique : salle des fêtes isolée, ou deux cents personnes sur la même antenne. Ce n’est pas l’application, c’est le réseau.</p>
<p><strong>Ce qu’il faut savoir :</strong> la photo est prise immédiatement, l’envoi se fait ensuite. Si ça bloque, il suffit de rester sur la page quelques secondes, ou de réessayer un peu plus loin : près d’une fenêtre, ou dehors.</p>
<p><strong>Côté organisateur :</strong> si tu connais le lieu, donne le mot de passe du wifi en même temps que le QR code. C’est le geste qui évite le plus de frustration.</p>

<h2>5. « Je ne retrouve pas mes photos »</h2>
<p>Elles sont dans <strong>« Mon album »</strong>, la pile de vignettes en bas à gauche de l’appareil. Un appui dessus ouvre l’album, avec le compteur de clichés restants et la possibilité de supprimer un raté.</p>
<p>Rappel utile à faire passer : <strong>un participant ne voit que ses propres photos.</strong> Il ne verra celles des autres qu’à la révélation. Ce n’est pas un bug, c’est le principe.</p>

<h2>6. « J’ai perdu le lien »</h2>
<p>Il suffit de <strong>rescanner le QR code</strong> : le téléphone est reconnu, les photos déjà prises sont toujours là, et le compteur reprend où il en était.</p>
<p>Si le participant est rentré chez lui, dis-lui de chercher dans l’historique de son navigateur, ou renvoie-lui simplement le lien d’invitation.</p>

<h2>7. « Pellicule pleine »</h2>
<p>Le quota est atteint. Deux possibilités : <strong>supprimer une photo ratée</strong> depuis « Mon album » (la place se libère aussitôt) ou, si tu as activé la recharge, réclamer les clichés bonus proposés à l’écran.</p>
<p>En revanche, le total ne dépassera jamais la limite que tu as fixée. C’est voulu : c’est ce qui fait qu’on vise au lieu de mitrailler.</p>

<h2>8. « On est deux sur le même téléphone »</h2>
<p>Un cas auquel personne ne pense avant qu’il n’arrive : un couple qui n’a qu’un téléphone, ou quelqu’un qui prête le sien.</p>
<p>Time to Flash reconnaît un <strong>téléphone</strong>, pas une personne. Deux participants qui photographient depuis le même appareil <strong>partagent la même pellicule</strong> et le même compteur. Il n’y a pas de contournement : c’est ce qui permet de ne demander aucun compte ni mot de passe.</p>
<p>Si c’est gênant, l’un des deux peut ouvrir le lien dans un autre navigateur du téléphone (Chrome au lieu de Safari, par exemple) : il sera compté comme un nouveau participant.</p>

<h2>9. « J’ai tout perdu » : la navigation privée</h2>
<p>En navigation privée, le téléphone oublie tout dès que l’onglet se ferme. Le participant repart alors de zéro, avec un compteur remis à neuf, et ses photos précédentes ne lui sont plus rattachées.</p>
<p>Rassure-le : <strong>les photos déjà envoyées ne sont pas perdues</strong>, elles sont dans l’album et apparaîtront à la révélation. Seul l’accès à « Mon album » est cassé. Pour la suite, dis-lui d’ouvrir le lien en navigation normale.</p>

<h2>Et pour toi, organisateur</h2>
<h3>« L’album ne s’est pas ouvert à l’heure prévue »</h3>
<p>Si plus de participants que prévu ont scanné, la révélation attend que tu passes à la formule correspondante. Ton tableau de bord te le dit, avec le montant exact de la différence : tu ne repaies jamais ce qui l’a déjà été. Aucune photo n’est perdue entre-temps.</p>
<h3>« Je ne reçois pas les mails »</h3>
<p>Regarde dans les indésirables, et ajoute notre adresse à tes contacts. Ton tableau de bord reste accessible depuis le lien du mail de création : garde-le.</p>

<p>Un cas qui n’est pas dans cette liste ? Écris-nous à <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>, et pour tout le reste, il y a <a href="/guide">le guide de l’organisateur</a>.</p>`,
}

const AIDE_EN = {
  title: 'A guest is stuck?',
  subtitle: 'The 9 most common problems, and how to fix each one in a minute.',
  intro:
    'This page is designed to be forwarded as is to anyone who gets stuck on the day. ' +
    'Each heading describes the symptom the way people put it, not the technical cause.',
  image: AIDE.image,
  caption: 'A guest scanning a QR code on a table during an evening party',
  body: `<p>Nine times out of ten, a guest who is stuck is stuck for one of the reasons below, and the fix takes less than a minute. Keep this page handy on the day: it is designed to be forwarded as is to anyone who gets stuck.</p>

<h2>1. “The camera won’t open”: the page is open inside Instagram or Messenger</h2>
<p>This is by far the most common problem. When you tap a link in Instagram, Messenger, WhatsApp, TikTok or Snapchat, the page opens in a <strong>mini browser built into the app</strong>, not in the real browser. These mini browsers often block access to the camera.</p>
<p><strong>The fix:</strong> tap the three dots “…” (or the little arrow) at the top or bottom of the screen, then <strong>“Open in browser”</strong>: Safari on iPhone, Chrome on Android. Everything then works as normal.</p>
<p><strong>Most of the time, you won’t have to do anything.</strong> Time to Flash recognises these mini browsers, but it doesn’t give up on them: some of them allow the camera perfectly well. So it tries, and switches automatically to the phone’s own camera if the live preview doesn’t open. The guest then sees a line under the viewfinder, “tap the shutter button and your phone’s camera will open”, and their photos go into the album exactly like everyone else’s.</p>
<p>In other words, don’t expect your guests to see a warning: there isn’t one, because nothing is broken. Instructions only appear if the camera has been explicitly refused, and they then explain what to do (see the next point).</p>
<p><strong>The only real exception, on Android: QR code scanner apps.</strong> Many guests don’t scan with their phone’s camera but with a dedicated app downloaded from the Play Store. That app then shows the page in its own window, which is allowed neither to open the camera nor to launch the phone’s camera app: the shutter button stops responding, without any message. Time to Flash recognises this case and offers an <strong>“Open in Chrome”</strong> button (and, if that isn’t enough, a way to copy the link and paste it into Chrome).</p>
<p><strong>The instruction to give, in one sentence:</strong> “scan with your phone’s camera, not with a QR code app”. The camera hands the link over to the real browser, and everything works first time.</p>

<h2>2. “Permission denied”: the camera was blocked by mistake</h2>
<p>One “Don’t allow” tapped too quickly on the permission request, and the browser remembers it. You need to make it forget.</p>
<p><strong>On iPhone (Safari):</strong> tap <strong>“aA”</strong> to the left of the address → <em>Website Settings</em> → <em>Camera</em> → <strong>Allow</strong>.</p>
<p><strong>On Android (Chrome):</strong> tap the <strong>padlock 🔒</strong> to the left of the address → <em>Permissions</em> → <em>Camera</em> → <strong>Allow</strong>.</p>
<p>Then reload the page. If this feels too complicated to explain over the music: the central button opens the phone’s own camera, and that works too.</p>

<h2>3. “The QR code won’t scan”</h2>
<p>An old phone, a temperamental camera, dim lighting at the end of the evening. Rather than keep trying: <strong>scan the code with another phone</strong>, then send the resulting link to the person by message. The link works exactly like the QR code.</p>
<p>A tip to avoid this: on cards set out at the end of the meal, the lights go down. Place a few of them near light sources.</p>

<h2>4. “My photos won’t send”: the venue’s network</h2>
<p>The classic: an isolated venue, or two hundred people on the same mobile mast. It isn’t the app, it’s the network.</p>
<p><strong>What you need to know:</strong> the photo is taken immediately, and the upload happens afterwards. If it gets stuck, just stay on the page for a few seconds, or try again a little further away: near a window, or outside.</p>
<p><strong>For the host:</strong> if you know the venue, share the wifi password along with the QR code. It’s the one thing that saves the most frustration.</p>

<h2>5. “I can’t find my photos”</h2>
<p>They are in <strong>“My album”</strong>, the stack of thumbnails at the bottom left of the camera. Tap it to open the album, with the counter of shots left and the option to delete a dud.</p>
<p>A useful reminder to pass on: <strong>a guest only sees their own photos.</strong> They will only see everyone else’s at the reveal. It isn’t a bug, it’s the whole idea.</p>

<h2>6. “I’ve lost the link”</h2>
<p>Just <strong>scan the QR code again</strong>: the phone is recognised, the photos already taken are still there, and the counter picks up where it left off.</p>
<p>If the guest has already gone home, tell them to look in their browser history, or simply send them the invitation link again.</p>

<h2>7. “Film roll full”</h2>
<p>The quota has been reached. Two options: <strong>delete a dud photo</strong> from “My album” (the space frees up straight away) or, if you have enabled top-ups, claim the bonus shots offered on screen.</p>
<p>However, the total will never go over the limit you set. That’s deliberate: it’s what makes people aim rather than fire away.</p>

<h2>8. “Two of us are sharing one phone”</h2>
<p>A situation nobody thinks of until it happens: a couple with only one phone, or someone lending theirs.</p>
<p>Time to Flash recognises a <strong>phone</strong>, not a person. Two guests taking photos from the same device <strong>share the same film roll</strong> and the same counter. There is no workaround: it’s what makes it possible to ask for no account and no password.</p>
<p>If that’s a problem, one of them can open the link in another browser on the phone (Chrome instead of Safari, for example): they will be counted as a new guest.</p>

<h2>9. “I’ve lost everything”: private browsing</h2>
<p>In private browsing, the phone forgets everything as soon as the tab is closed. The guest then starts again from scratch, with a fresh counter, and their earlier photos are no longer linked to them.</p>
<p>Reassure them: <strong>photos already sent are not lost</strong>, they are in the album and will appear at the reveal. Only access to “My album” is broken. From now on, tell them to open the link in normal browsing.</p>

<h2>And for you, the host</h2>
<h3>“The album didn’t open at the scheduled time”</h3>
<p>If more guests than planned have scanned, the reveal waits until you switch to the matching plan. Your dashboard tells you so, with the exact amount of the difference: you never pay twice for what you have already paid. No photo is lost in the meantime.</p>
<h3>“I’m not receiving the emails”</h3>
<p>Check your spam folder, and add our address to your contacts. Your dashboard remains accessible from the link in the creation email: keep it.</p>

<p>A problem that isn’t on this list? Write to us at <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>, and for everything else, there is <a href="/guide">the host’s guide</a>.</p>`,
}

const AIDE_DE = {
  title: 'Ein Gast kommt nicht weiter?',
  subtitle: 'Die 9 häufigsten Probleme und ihre Lösung in einer Minute.',
  intro:
    'Diese Seite ist dafür gedacht, unverändert an jemanden weitergeleitet zu werden, der am großen Tag nicht weiterkommt. ' +
    'Jede Überschrift beschreibt das Symptom so, wie man es erzählt, nicht die technische Ursache.',
  image: AIDE.image,
  caption: 'Ein Gast scannt auf einer Feier einen QR-Code, der auf einem Tisch steht',
  body: `<p>In neun von zehn Fällen kommt ein Gast aus einem der folgenden Gründe nicht weiter, und die Lösung dauert weniger als eine Minute. Halten Sie diese Seite am großen Tag bereit: Sie ist dafür gedacht, unverändert an jemanden weitergeleitet zu werden, der nicht weiterkommt.</p>

<h2>1. „Die Kamera öffnet sich nicht“: Die Seite ist in Instagram oder Messenger geöffnet</h2>
<p>Das ist mit Abstand das häufigste Problem. Wenn man in Instagram, Messenger, WhatsApp, TikTok oder Snapchat auf einen Link tippt, öffnet sich die Seite in einem <strong>in die App eingebauten Mini-Browser</strong>, nicht im richtigen Browser. Diese Mini-Browser blockieren oft den Zugriff auf die Kamera.</p>
<p><strong>Die Lösung:</strong> Tippen Sie auf die drei Punkte „…“ (oder den kleinen Pfeil) oben oder unten auf dem Bildschirm und dann auf <strong>„Im Browser öffnen“</strong>: Safari auf dem iPhone, Chrome auf Android. Danach funktioniert alles ganz normal.</p>
<p><strong>Meistens müssen Sie gar nichts tun.</strong> Time to Flash erkennt diese Mini-Browser, gibt aber trotzdem nicht auf: Manche erlauben die Kamera problemlos. Es versucht es also und wechselt von selbst zur Kamera-App des Handys, wenn sich die Live-Vorschau nicht öffnet. Der Gast liest dann unter dem Sucher den Satz „Tippen Sie auf den Auslöser, die Kamera Ihres Handys öffnet sich“, und seine Fotos landen genauso im Album wie alle anderen.</p>
<p>Rechnen Sie also nicht mit einer Warnmeldung bei Ihren Gästen: Es gibt keine, weil nichts kaputt ist. Ein Hinweis erscheint nur, wenn die Kamera ausdrücklich abgelehnt wurde, und er erklärt dann, was zu tun ist (siehe nächster Punkt).</p>
<p><strong>Die einzige echte Ausnahme, auf Android: QR-Code-Scanner-Apps.</strong> Viele Gäste scannen nicht mit der Kamera ihres Handys, sondern mit einer eigenen App aus dem Play Store. Diese App zeigt die Seite dann in ihrem eigenen Fenster an, das weder die Kamera öffnen noch die Kamera-App des Handys starten darf: Der Auslöser reagiert nicht mehr, ohne jede Meldung. Time to Flash erkennt diesen Fall und bietet eine Schaltfläche <strong>„In Chrome öffnen“</strong> an (und, falls das nicht reicht, den Link zum Kopieren und Einfügen in Chrome).</p>
<p><strong>Der Hinweis in einem Satz:</strong> „Scannen Sie mit der Kamera Ihres Handys, nicht mit einer QR-Code-App.“ Die Kamera übergibt den Link an den richtigen Browser, und alles funktioniert auf Anhieb.</p>

<h2>2. „Zugriff verweigert“: Die Kamera wurde versehentlich blockiert</h2>
<p>Einmal zu schnell auf „Nicht erlauben“ getippt, und der Browser merkt sich das. Man muss es ihn wieder vergessen lassen.</p>
<p><strong>Auf dem iPhone (Safari):</strong> Tippen Sie links neben der Adresse auf <strong>„aA“</strong> → <em>Website-Einstellungen</em> → <em>Kamera</em> → <strong>Erlauben</strong>.</p>
<p><strong>Auf Android (Chrome):</strong> Tippen Sie links neben der Adresse auf das <strong>Schloss 🔒</strong> → <em>Berechtigungen</em> → <em>Kamera</em> → <strong>Zulassen</strong>.</p>
<p>Laden Sie dann die Seite neu. Wenn Ihnen das zu kompliziert ist, um es bei lauter Musik zu erklären: Die mittlere Schaltfläche öffnet die Kamera-App des Handys, das funktioniert auch.</p>

<h2>3. „Der QR-Code lässt sich nicht scannen“</h2>
<p>Ein altes Handy, eine launische Kamera, gedämpftes Licht zu später Stunde. Statt es weiter zu versuchen: <strong>Lassen Sie den Code mit einem anderen Handy scannen</strong> und schicken Sie der Person den Link per Nachricht. Der Link funktioniert genauso wie der QR-Code.</p>
<p>Tipp zur Vorbeugung: Bei Kärtchen, die nach dem Essen auf den Tischen liegen, wird das Licht gedimmt. Legen Sie ein paar davon in die Nähe von Lichtquellen.</p>

<h2>4. „Meine Fotos werden nicht gesendet“: das Netz im Saal</h2>
<p>Der Klassiker: ein abgelegener Festsaal oder zweihundert Menschen an derselben Mobilfunkantenne. Es liegt nicht an der App, sondern am Netz.</p>
<p><strong>Gut zu wissen:</strong> Das Foto wird sofort aufgenommen, das Hochladen erfolgt danach. Wenn es hängt, bleiben Sie einfach ein paar Sekunden auf der Seite oder versuchen Sie es etwas weiter entfernt erneut: in der Nähe eines Fensters oder draußen.</p>
<p><strong>Für den Gastgeber:</strong> Wenn Sie den Ort kennen, geben Sie das WLAN-Passwort zusammen mit dem QR-Code weiter. Das erspart den meisten Frust.</p>

<h2>5. „Ich finde meine Fotos nicht“</h2>
<p>Sie sind unter <strong>„Mein Album“</strong>, dem Stapel kleiner Vorschaubilder unten links in der Kamera. Ein Tippen darauf öffnet das Album, mit dem Zähler der verbleibenden Aufnahmen und der Möglichkeit, ein misslungenes Foto zu löschen.</p>
<p>Ein nützlicher Hinweis zum Weitergeben: <strong>Ein Gast sieht nur seine eigenen Fotos.</strong> Die der anderen sieht er erst bei der Enthüllung. Das ist kein Fehler, das ist das Prinzip.</p>

<h2>6. „Ich habe den Link verloren“</h2>
<p>Einfach <strong>den QR-Code noch einmal scannen</strong>: Das Handy wird erkannt, die bereits aufgenommenen Fotos sind noch da, und der Zähler macht dort weiter, wo er stehen geblieben ist.</p>
<p>Ist der Gast schon zu Hause, soll er im Verlauf seines Browsers nachsehen, oder Sie schicken ihm einfach den Einladungslink noch einmal.</p>

<h2>7. „Film voll“</h2>
<p>Das Kontingent ist erreicht. Zwei Möglichkeiten: <strong>ein misslungenes Foto löschen</strong> unter „Mein Album“ (der Platz wird sofort frei) oder, wenn Sie das Nachladen aktiviert haben, die auf dem Bildschirm angebotenen Bonusaufnahmen anfordern.</p>
<p>Die Gesamtzahl überschreitet jedoch nie das von Ihnen festgelegte Limit. Das ist gewollt: Genau deshalb wird gezielt fotografiert statt drauflos geknipst.</p>

<h2>8. „Wir sind zu zweit an einem Handy“</h2>
<p>Ein Fall, an den niemand denkt, bis er eintritt: ein Paar mit nur einem Handy oder jemand, der seines verleiht.</p>
<p>Time to Flash erkennt ein <strong>Handy</strong>, keine Person. Zwei Gäste, die mit demselben Gerät fotografieren, <strong>teilen sich denselben Film</strong> und denselben Zähler. Es gibt keinen Umweg: Nur so kommt die App ganz ohne Konto und Passwort aus.</p>
<p>Wenn das stört, kann einer der beiden den Link in einem anderen Browser auf dem Handy öffnen (zum Beispiel Chrome statt Safari): Er wird dann als neuer Gast gezählt.</p>

<h2>9. „Alles ist weg“: das private Surfen</h2>
<p>Im privaten Modus vergisst das Handy alles, sobald der Tab geschlossen wird. Der Gast fängt dann bei null an, mit einem zurückgesetzten Zähler, und seine bisherigen Fotos sind ihm nicht mehr zugeordnet.</p>
<p>Beruhigen Sie ihn: <strong>Bereits gesendete Fotos sind nicht verloren</strong>, sie sind im Album und erscheinen bei der Enthüllung. Nur der Zugang zu „Mein Album“ ist weg. Für den Rest des Abends sollte er den Link im normalen Modus öffnen.</p>

<h2>Und für Sie als Gastgeber</h2>
<h3>„Das Album hat sich nicht zur geplanten Zeit geöffnet“</h3>
<p>Wenn mehr Gäste als vorgesehen gescannt haben, wartet die Enthüllung, bis Sie auf das passende Paket wechseln. Ihr Dashboard zeigt Ihnen das an, mit dem genauen Differenzbetrag: Sie zahlen nie zweimal für das, was schon bezahlt ist. In der Zwischenzeit geht kein Foto verloren.</p>
<h3>„Ich bekomme die E-Mails nicht“</h3>
<p>Sehen Sie im Spam-Ordner nach und fügen Sie unsere Adresse zu Ihren Kontakten hinzu. Ihr Dashboard bleibt über den Link in der Bestätigungs-E-Mail erreichbar: Bewahren Sie ihn gut auf.</p>

<p>Ihr Problem steht nicht auf dieser Liste? Schreiben Sie uns an <a href="mailto:support@timetoflash.fr">support@timetoflash.fr</a>, und für alles andere gibt es <a href="/guide">den Leitfaden für Gastgeber</a>.</p>`,
}

const VERSIONS = { fr: AIDE, en: AIDE_EN, de: AIDE_DE }

// La page d'aide dans la langue voulue (mêmes champs que `AIDE`).
// Sans argument : la langue du navigateur ou de l'app.
export function aideDe(langue) {
  return tr(VERSIONS, langue)
}
