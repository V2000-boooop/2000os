# 000 — PROJECT MEMORY

> **Document de référence courant. À relire avant chaque nouvelle tâche. Max 3 pages.**
> Détail et historique des décisions : `090_DECISION_LOG.md`.
> Dernière révision : 2026-07-09 (It41 — **le prêtre de la cathédrale est vivant** : entrée en marchant, demande, don/disparition ; à tester par Vincent)

## Protocole de session (économie de tokens — strict)

- Nouvelle conversation = Vincent écrit : « Lis docs/000_PROJECT_MEMORY.md puis : [tâche] ». Claude lit CE document, puis **uniquement** les fichiers nécessaires.
- **Le travail est découpé en 6 fils nommés** (TIERCÉ · SONS & MONDE · SCÈNES & IMAGES · TROUVAILLES & COMPTE · PASSERELLES WEB · TECHNIQUE & POIDS) : prompts d'ouverture et périmètres dans `docs/002_FILS_DE_TRAVAIL.md`. Un fil long (~10 échanges) se clôt par « compacte et clôture » puis se rouvre neuf.
- **Une conversation = une itération** (une demande → une livraison), pas un chantier entier. Vincent teste hors ligne, revient dans une conversation **neuve** avec ses retours.
- Vincent **nomme les fichiers** concernés quand il les connaît (« corrige X dans EmetteurApp.svelte »). Retours de test : **liste numérotée, une ligne par point, en un seul message** — jamais un message par correction.
- Claude : pas de préambules ni récapitulatifs ; lectures partielles et grep ciblés ; jamais de relecture d'un fichier déjà en contexte ; build vérifié en fin d'itération seulement (sortie tronquée `tail`) ; réponses courtes — décrire le geste à tester, pas re-raconter le travail ; explorations créatives livrées directement en document, discussion minimale en chat ; itérer les gros artefacts (SVG, docs) par éditions, jamais par régénération.
- **Coût conversation** : chaque message re-paye TOUT l'historique de la conversation. Donc : conversations COURTES (3-6 échanges max), une par chantier — dès qu'un sujet change (ex. du tiercé à la cathédrale), nouvelle conversation. Les retours de test groupés en UNE liste numérotée valent 10× moins cher que 10 messages.
- `000` reste ≤ 3 pages : toute livraison passée est compressée en une ligne ; le détail vit dans `090` et les docs systèmes.
- **QC anti-boucle (`015_QC_PROTOCOLE.md`) — obligatoire.** Rien n'est « OK » sans : assets **relus/validés** (un fichier corrompu = on refait), `npm run build` vert, et **test LIVE headless** (`tools/smoke_test.mjs` : les frames défilent ET se décodent, 0 erreur console). Le lanceur est **auto-frais** (tue le port 4321 + vide `.vite`) → après un changement, Vincent **relance** le lanceur, un simple refresh ne suffit pas.

- **Démarrage — lecture MINIMALE.** Lire `000` seulement. `NOTES_PROCHAINE_SESSION.md` et les docs système (`060`, `050`, `070`…) UNIQUEMENT si la tâche les concerne directement — jamais par réflexe. La skill DA contient déjà l'essentiel de `070` : ne relire `070` que pour un chantier visuel de fond. Le code se lit par grep ciblé, jamais en entier.
- **Fin de session — réflexe (obligatoire).** Toujours, avant de conclure : (1) **optimiser** le projet (poids des assets, `npm run build` vert, nettoyage des fichiers morts) ; (2) **compacter** (mettre à jour `000` + `NOTES_PROCHAINE_SESSION.md` — une ligne par livraison, détail dans `090`) ; (3) **pousser en ligne**.
- **Jeux — standard obligatoire.** Tout nouveau jeu (ou refonte de gameplay) part de `docs/GAME_FEEL.md` : recette réutilisable de jouabilité exceptionnelle (saut bufferisé + coyote + fast-fall, dash, plateformes one-way, hitstop + flash d'impact, caméra dynamique, anim liée à la distance). Lire ce doc avant de coder un jeu.

## Le projet en trois phrases

Vincent 2000 OS est l'**atelier numérique vivant** de Vincent 2000, identité artistique réelle d'un DJ, compositeur et sound designer. Il rend accessible sa matière créative (musiques, recherches sonores et visuelles, notes, archives, projets, jeux) à travers une interface immersive inspirée d'un ordinateur personnel 1998–2003 — **interprétation personnelle**, pas reconstitution. La frontière réel/mise en scène est volontairement floue.

## Règle d'or

Chaque interaction doit **faciliter la découverte du travail** ou **enrichir l'univers de Vincent 2000**. Sinon, elle n'a pas sa place. Le contenu important n'est jamais caché.

**Principe fondateur (P0) :** le site ne fait pas qu'archiver le travail, il le **provoque**. À valeur égale, prioriser l'évolution qui déclenche le plus de création. Détail : `005_DESIGN_PRINCIPLES.md`.

## Rôles

- **Vincent** : directeur créatif (non-développeur ; veut comprendre les décisions à impact, avec options et compromis).
- **Claude** : directeur technique et développeur principal.

## Décisions validées (résumé)

| # | Décision |
|---|----------|
| D1 | Atelier numérique vivant ; trouvabilité du contenu = exigence de premier ordre. |
| D2 | Deux couches : chaque contenu = ressource indépendante avec sa propre URL ; l'OS = expérience principale de découverte. Deep-linking bidirectionnel. |
| D3 | Pipeline évolutif : phase 1 = fichiers dans le dépôt ; phase 2 = admin sur mesure. Le **schéma de contenu est le contrat stable**. |
| D4 | Vincent 2000 = identité réelle. Mise en scène **optionnelle par contenu**. |
| D5 | Bureau multi-fenêtres (hub central) + **parenthèses immersives plein écran** avec retour au bureau. |
| D6 | FR au lancement, schéma et URLs multilingues dès le départ. |
| D7 | Médias hybrides : sorties officielles via plateformes ; recherches/démos/archives/exclusivités **auto-hébergées**. |
| D8 | Rôles : Vincent créa / Claude tech. |
| D9 | Aucun existant ; budget ~10–50 €/mois. |
| D10 | Stack : **Astro** (contenu) + **Svelte** (OS) ; Cloudflare Pages + R2. |
| D11 | Documentation = **bible de systèmes indépendants**. `000` = seule vérité courante ; historique dans `090`. |
| D12 | **Règle des destinations** : une parenthèse n'est jamais indépendante — c'est **l'OS qui se métamorphose**. Entités permanentes → équivalents par destination (registre). Dire « destination », jamais « mode ». |
| D13 | **Le lecteur est un émetteur** (`V2000 TX`, filiation radio pirate). Un seul flux, deux états : **émission** (vie continue) / **prise d'antenne** (retour naturel au flux à la fin). Vocabulaire : émettre/capter/prendre l'antenne/éjecter, jamais play/playlist. Émission générative, jamais une boucle. |
| D15 | **Scènes gigognes** : le monde peint est un arbre récursif (paire off/on + zones % ; zone = `goto` scène enfant, `open` contenu, ou lueur). Pile de navigation, Échap dépile. Spec : `exploration/nightdrive/scenes_gigognes.md`. |
| D14 | **Le spectaculaire vit dans les Destinations, pas au bureau.** Le bureau reste calme/banal, le player un compagnon discret ; le changement de dimension arrive en quittant le bureau. Seul objet désirable du bureau : la porte vers la Destination. |
| D16 | **Méthode de scène universelle (`060_SCENES.md`)** : tout est **collage peint** (Arcane×GTA), zéro lumière CSS. Calques détourés à états, **halos-calques + reflets** (vitraux/murs), accents en boucle, **humeur mémorisée** (prêtre : demande la pièce au 4e mur → sermon joyeux/vénère). Porte cachée : **manger un objet → bascule 3D** (three.js, piste 2.5D billboards). S'applique à toute scène. |
| D19 | **État perso persistant inter-scènes** : chaque perso a un état (sobre/défoncé/bourré) mémorisé (localStorage, par perso nommé) qui change son apparence PARTOUT. Fumer→défoncé, alcool→bourré, manger/eau→sobre. Couche transverse à côté de l'outfit (D17). Reco dress-up : garder la pose, varier la **tête à états** (calque) pour que les fringues restent alignées ; pose entière libre pour les persos non-habillables. Détail : `090` (D19). |
| D18 | **Virage DA image : ciné-réalisme sombre** (validé sur le vestiaire). Les images de décor visent un réalisme cinématographique nocturne, plus le « PS2 2003 » peint. Acquis gardés : surfaces exploitables, objets séparables (It32), paire off/on cadrage identique, 3:2. PS2 = attitude + vernis optionnel (grain/CRT). Pas de refonte des scènes déjà peintes. Détail : `090` (D18). |
| D17 | **Objets animés Rive** : Rive validé (`@rive-app/canvas` installé, export `.riv`). Tout objet à animer se **conçoit en amont** : pièces mobiles séparées au design (disque platine ≠ corps), nombre de boutons arrêté tôt, **State Machine + inputs nommés = contrat code** (D3). Pattern (prolonge D15) : clic objet dans la scène → **vue dédiée gigogne** avec tous les contrôles (ex. platine vue du dessus, plateau qui tourne, play/cue/pitch pilotés par les inputs Rive). Composant `RiveObject` Svelte à créer. Libs d'appui installées : pixi.js, gsap, tone, tsParticles (+ three). Détail : `090` (D17). |

## Contraintes permanentes

- Robustesse, modularité, extensibilité ; UX avant facilité d'implémentation ; dépendances minimales.
- Ne jamais réécrire une partie fonctionnelle sans raison. Doc maintenue en parallèle.
- Le format des données est le contrat. Chaque doc système autonome et lisible seul.

## Structure de la documentation

```
000_PROJECT_MEMORY.md      Mémoire courante (ce document)
005_DESIGN_PRINCIPLES.md   Manifeste créatif
015_QC_PROTOCOLE.md        Protocole anti-boucle (assets validés · serveur frais · test live headless)
010_IDENTITE.md            Le Noyau — Vincent 2000, règles du monde
020_RESEARCH_ENGINE.md     La matière et sa vie
030_OS.md                  Bureau, fenêtres, apps
040_EXPERIENCES.md         Jeux et parenthèses immersives
050_SON.md                 Système sonore
060_VIE.md                 Évolution, traces, mémoire
070_VISUAL_LANGUAGE.md     Bible visuelle (DA, palette, typo) — validée
090_DECISION_LOG.md        Journal détaillé des décisions
```

Toute décision changée = mise à jour de `000` + entrée dans `090`.

## État actuel

- **Phase : prototype vivant** (fonctionnalité → UX → dev → test → itération ; la doc suit). Bible validée : 005, 010, 020, 030, **070 (bible visuelle — DA/palette/typo, écrite par Vincent, à relire avant toute proposition graphique)** ; 040/050/060 s'écrivent en suivant le projet.
- **Bureau v1 livré** : fenêtres, catégories naturelles, scène restaurée, recherche v0, dossiers Sons/Médias/Notes/Jeux, Favoris ★. Règles clés : « la machine ne démarre jamais » · trois niveaux de profondeur · « le bureau est calme, les interactions sont exubérantes ». Jamais de tableau de bord.
- **Son (050)** : le silence fait partie de l'identité ; l'écoute est sacrée. **Famille UI v1 complète** (10 sons de Vincent, zéro fallback ; `collect` attend le système de collection). Lab : recherche → « lab ». Gains : Vincent les ajustera (ne pas toucher).
- **Jeux (040)** : expérience simple + voyage esthétique + porte de collection (bonus, jamais péage).
- **En cours : Night Drive (D12+D14), priorité actuelle — le monde est branché et EN LIGNE (It16→It34).** Historique verbatim et détails : `090`. Mode chantier : 1-2 éléments MAX par conversation, Vincent teste entre chaque.
  - **Méthode « peint + animé » (règle)** : Vincent génère les images (IA, `da_cible.md`), Claude monte/anime. Paire off/on au cadrage identique + zones % (`scenes.js`, D15 gigogne), crossfade 650 ms, instruments vivants dans `.pc`, fallbacks procéduraux si fichiers absents.
  - **Règle permanente — détourage au pixel** : sprites `scenes/lights/<scene>_<zone>.png` via `python3 tools/build_zone_masks.py` (à relancer à chaque nouvelle zone/scène) ; recettes `FONDU_DOUX`/`TRICHE` en opt-in par scène après validation Vincent. 20 zones détourées.
  - **Méthode « montage en calques » + Higgsfield (It31-33)** : `exploration/nightdrive/methode_montage_scene.md`. Génération via connecteur (`nano_banana_2` en 3:2, jamais chaîner grok), Vincent télécharge et dépose. Scène = fond off/on + persos détourés (`scenes/perso/`, idle CSS) + `foreground` + zones. Identité persos : hybrides ambigus, peau bleu-violet translucide.
  - **Contrat sonore actif** (`worldsound.js` + `sons_nightdrive.md`) : **le nom du fichier = le branchement** (ambiances, portes, objets, univers), silence si absent. Vincent dépose, ça vit.
  - **Carte du monde (tout est cliquable et branché)** :
    - ville : cathédrale · barque · taverne=Sons · LA RIDE=Jeux (arcade, .exe=bornes) · PMU · tour radio=Internet (modem RTC). Décor mort : HOTEL DU COMMERCE, BISTRONOME.
    - habitacle : autoradio V2000 TX (presets = 6 sons, clic `ui/clic_autoradio.webm`) · **boîte à gant** = scène gigogne, 6 objets (restent : gestes cd/carte/ticket/fumeur + recalage % + détourage).
    - PMU : borne=`comptoir.js` · fdj=jeu à gratter (`grattage.js`) · tele=paris démo (`paris.js`) · ricard=`evenement.js` · sudouest=`journal.js` · fenêtre=sortie.
    - LA RIDE : prix=cocktails (`cocktails.js`) · photobooth=`soiree.js` · vestiaire=friperie (`friperie.js`) · toilettes=graffiti · **DJ booth = V2000 DJ** (2 CDJ, `djbooth.js` ← `public/media/djbooth/`).
    - taverne : téléphone=**Nokia 3310** (Snake jouable, `nokia.js`) · vin/manger=carnet d'adresses (`adresses.js`).
    - barque : lanterne=ciel étoilé (+`barque_ciel.wav|mp3`) · boombox=**K7 locales** (`cassettes.js` : clic=lecture, re-clic=stop, sortie barque=stop ; fichiers `public/media/k7/` ; PAS l'antenne — It40) · pizza=carnet · ville navigable depuis l'eau (portes goto) · 2 persos alien (Stick + Myrtille).
    - cathédrale : vitraux=univers dark/angélique (`univers.js`) · pupitre=sermons (`sermons.js`) · confessionnal=vocaux en boucle · bougies=pourboire (`pourboire.js`).
  - **Attentes Vincent** : sons du contrat (wav/mp3) · playlists par preset · vrais contenus des fichiers-données (photos soirée, fringues, articles, événement) · retours de test en liste numérotée.
  - **Prochaines briques** : gestes restants de la boîte à gant · vie canvas par-dessus le peint · poses/anim persos + appliquer le montage en calques aux autres scènes. Hors scope : conduite, pluie, timeline interruptible.
- **Émetteur (D13) : en attente derrière Night Drive (D14).** v1 livrée : `EmetteurApp.svelte` (fader ATELIER⟷TOI 1 s/1,5 s, ÉJECT, ON AIR, VU réel WebAudio, indicatif provisoire **VINCENT 2000 RADIO — 93.00 FM**), moteur audio conservé (`player.svelte.js` + `eject()`). Wireframe pupitre : `docs/exploration/emetteur/proto_final_pupitre_soude.svg` ; comportement cible : `comportement_vivant.md`. Corrections v1 : liste à venir de Vincent, plus tard. Hors scope v1 : moteur génératif, événements rares, désync des aiguilles, crossfade au ✕. Questions ouvertes (indicatif définitif, voix à l'antenne, degré de direct, retour d'antenne) : à trancher en manipulant.
- En attente aussi : liste de corrections du socle (session de test bureau, jamais transmise).
- **2026-07-09 (It34→38, détail verbatim : `090`)** : D20 vision+archi (`001_LIGNE_DIRECTRICE.md`) · code-splitting NightDrive (bureau 209→80 Ko) · ménage (mp3 50 Mo archivé, site 116→79 Mo ; sources Bureau `~/Desktop/OS 2000/`) · 000 compacté ·  **TIERCÉ refondu** : assets normalisés (`tools/build_pmu_course.py`, à relancer à chaque dépôt), 4 partants (Zidane 98 Prime/Britney64/Ricardo667/CHIRAC, champ `taille`), tribune parallaxe, départ 3-2-1, photo-finish (ralenti+flash+gel), podium, confettis, public vivant (hype 280 ms/sad 700 ms + rebond 1 px), character select (aucun choisi à l'ouverture, star centrée qui piaffe + ombre portée), signalétique chip minimale, jingles victoire/défaite, rendu HD SS=2 · **CATHÉDRALE sonore** : ambiance_cathedrale (boucle hall) · pièce OUI→sermon_joyeux / NON→pique pretre_vener UNE fois sur le moment (jamais à l'entrée) + humeur mémorisée → pupitre = sermon selon humeur (one-shot) · univers_dark câblé en boucle spatiale · **règles actées** : « son spatial cinéma » (un son appartient à son espace ; duck murmure 0.08 ; antenne D13 globale) · duck ambiances 0→0.08 · anti-boucle-orpheline dans `worldsound.loop` · fix `.pc` isolation:isolate (plus de lueurs au-dessus des scènes) · bougies : breath OFF cathédrale (paire non alignée) + lueur rebâtie depuis l'OFF. Attendus Vincent : `pretre_demande`, `piece`, `refus`, `univers_ange`.
- **2026-07-09 (It40, fil SONS & MONDE — détail : `090`)** : **boombox barque = lecteur LOCAL** (règle son spatial ; l'ancien câblage antenne était mort — eject à l'entrée en scène). 4 K7 réelles : LUJON · INNER WAVE · SCH DNB · PINO2000 (`public/media/k7/`, réencodées V2 ~10,1 Mo). Fin de bande = stop seul ; ambiance duckée pendant la lecture. Ambiance barque montée (`AMB_VOL_SCENE` par scène dans `worldsound.js`, barque 0.65). **Danse branchée** : pose `radio` = boucle continue (140 ms, depuis le repos seulement, jamais pendant roll/fume/lévite, stop net via `k7Stop`). Attendu Vincent : frames `myrtille_radio_1..N.webp` + `stick_radio_1..N.webp` (même bbox que idle) + nombre de frames → 1 ligne/perso dans `scenes.js`. **Pas encore testé live ni poussé.**
- **2026-07-09 (It41, fil SCÈNES & IMAGES — détail : `090`)** : **PRÊTRE animé** (5 planches fond vert de Vincent → 45 frames webp via `tools/build_pretre_frames.py`, sources dans `archives/pretre_sources/`, relancer le script à chaque nouvelle planche). Église vide → il ENTRE en marchant du hors-champ droit (16 frames, 2 planches = 2 foulées) → quémande (anim boucle, dialogue décalé à droite pour ne pas le couvrir) ; OUI = bénédiction main lumineuse + sermon joyeux, il reste ; NON = gueulante + **dissolution fumée violette** (une demande par visite). Idle = haut-gauche planche refus (acté). Smoke test : 404 des sons attendus absents désormais tolérés (contrat safe-absent). Build vert + smoke vert ; **test live Vincent à faire (It40 barque + It41 prêtre), poussé en ligne**.
- **2026-07-09 (It42b, fil SCÈNES & IMAGES)** : **DANSE barque = collage cut-out CSS** (boombox K7). Frame-par-frame abandonné (Vincent : « ça clignote, mal détouré » — enchaîner des poses repeintes scintille, modèles image pas cohérents). Retenu : la découpe idle propre **claque sur le rythme** via transform `steps(1)` (snap lent, pivot assise) → zéro scintillement, bords nets, 0 asset. `canDance`/`favDance` (scenes.js) + `$effect danceLvl` (NightDrive) : Niveau 1 = toute musique (`.dance-a`, lent) ; Niveau 2 = `PINO2000` (préférée de Myrtille, `.dance-b`, vif) → **pantin articulé** (calques bras/tête, prompt ChatGPT donné) quand Vincent dépose les calques. Tempo réglable (`animation-duration` + keyframes `cutout-dance`). Build vert ; test live à faire.
- **2026-07-09 (It42c, fil SCÈNES & IMAGES)** : **PANTIN ARTICULÉ de Myrtille (assise)**. Vincent fournit des calques fond vert (tête/buste/bras, partis de l'idle) → `tools/build_rig_layers.py` détoure le vert + fabrique un calque `jambes` depuis l'idle + imprime les pivots. `rig[]` sur Myrtille (scenes.js) empilé en calques (`.rig-part`, cadre commun 887×1774) : corps immobile, **bras + tête snappent** autour de leur pivot (épaule/nuque) en `steps(1)`, tempo `--rigper` (PINO2000 = `.rig-fast`). Méthode retenue pour tout perso animé riche : **découper une fois en calques fond vert, rigger en CSS** (zéro frame, zéro scintillement). Sources dans `archives/rig_sources/`. Reste : **version DEBOUT** (prompts donnés) pour danse plus vive. Build vert ; test live à faire.
- Lancement local : double-clic « Lancer Vincent 2000 OS.command » (nécessite Node.js).
- **Site en ligne : https://2000os.vercel.app** (Vercel, déploiement auto à chaque `git push originn`). Dépôt : github.com/V2000-boooop/2000os.
