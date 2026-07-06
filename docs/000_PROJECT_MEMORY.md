# 000 — PROJECT MEMORY

> **Document de référence courant. À relire avant chaque nouvelle tâche. Max 3 pages.**
> Détail et historique des décisions : `090_DECISION_LOG.md`.
> Dernière révision : 2026-07-06 (méthode de scène universelle — collage vivant + mode 3D : `060_SCENES.md`)

## Protocole de session (économie de tokens — strict)

- Nouvelle conversation = Vincent écrit : « Lis docs/000_PROJECT_MEMORY.md puis : [tâche] ». Claude lit CE document, puis **uniquement** les fichiers nécessaires.
- **Une conversation = une itération** (une demande → une livraison), pas un chantier entier. Vincent teste hors ligne, revient dans une conversation **neuve** avec ses retours.
- Vincent **nomme les fichiers** concernés quand il les connaît (« corrige X dans EmetteurApp.svelte »). Retours de test : **liste numérotée, une ligne par point, en un seul message** — jamais un message par correction.
- Claude : pas de préambules ni récapitulatifs ; lectures partielles et grep ciblés ; jamais de relecture d'un fichier déjà en contexte ; build vérifié en fin d'itération seulement ; explorations créatives livrées directement en document, discussion minimale en chat ; itérer les gros artefacts (SVG, docs) par éditions, jamais par régénération.
- `000` reste ≤ 3 pages : toute livraison passée est compressée en une ligne ; le détail vit dans `090` et les docs systèmes.
- **QC anti-boucle (`015_QC_PROTOCOLE.md`) — obligatoire.** Rien n'est « OK » sans : assets **relus/validés** (un fichier corrompu = on refait), `npm run build` vert, et **test LIVE headless** (`tools/smoke_test.mjs` : les frames défilent ET se décodent, 0 erreur console). Le lanceur est **auto-frais** (tue le port 4321 + vide `.vite`) → après un changement, Vincent **relance** le lanceur, un simple refresh ne suffit pas.

- **Démarrage — tout reconnecter (obligatoire).** Avant d'agir, lire la chaîne de contexte complète : `000_PROJECT_MEMORY.md` → `NOTES_PROCHAINE_SESSION.md` → les docs système concernés (`060_SCENES.md` pour les scènes, `050_SON.md`, etc.). On repart toujours du contexte relié, jamais à froid.
- **Fin de session — réflexe (obligatoire).** Toujours, avant de conclure : (1) **optimiser** le projet (poids des assets, `npm run build` vert, nettoyage des fichiers morts) ; (2) **compacter** (mettre à jour `000` + `NOTES_PROCHAINE_SESSION.md` — une ligne par livraison, détail dans `090`) ; (3) **pousser en ligne**.

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
- **En cours : Night Drive (D12+D14), priorité actuelle. État : scène peinte « quai » fonctionnelle (It16).** Historique détaillé M1→It16 : `090` (entrées 2026-07-03/04). Mode chantier : 1-2 éléments MAX par conversation, Vincent teste entre chaque.
  - **Méthode actée « peint + animé »** : Vincent génère les images IA (style planche `da_cible.md`), Claude monte/anime. Hack menus PS2 : paire `ville_off_v1.png`/`ville_on_v1.png` (`public/media/nightdrive/`) au cadrage identique — survol d'un lieu = crossfade 650 ms de SA zone (sprite-crop en %) + regard amorti (jamais de suivi souris) + respiration globale. Instruments vivants DANS `.pc` (positions `.iv .m-*` en % scène) : rétro (canvas ghost du vieux moteur), LCD, transport/presets rétroéclairés (presets = 6 premiers sons, file D13), horloge, contact. Anciens moteurs (pseudo-3D, habitacle CSS/chroma-key) = fallbacks si fichiers absents.
  - **Lieux v3 (`LIEUX`, NightDrive.svelte)** : cathédrale (dès la tour gauche — jamais sur le montant) · barque (2 gars) · taverne=**Sons** (écriteau seul) · LA RIDE=**Jeux** (ouvre la salle d'arcade, .exe = bornes, Échap par couches) · PMU=**dossier libre** · tour radio=**Internet**. Décor mort : HOTEL DU COMMERCE, BISTRONOME (+ écritures « arcade » éteintes par retouche PIL, archives dans `archives/nightdrive/`). **À nommer par Vincent : cathédrale, barque, contenu PMU, contenu LA RIDE au-delà des jeux.**
  - **Moteur scènes gigognes D15 livré (It18) — 5 intérieurs EN LIGNE** : registre `scenes.js` + pile + zoom-crossfade vers la porte ; les 5 paires de Vincent (taverne, laride, barque, cathedrale, pmu) déposées et validées (QC : tailles, sens off/on, alignement). Sortie dans l'image : **seuil « ▾ ressortir » en bas de chaque intérieur** (respire, s'éclaire au survol) = même geste qu'Échap. Ville peinte = image nue : pare-brise/scanlines/vignette réservés au fallback procédural. Détail : `090` (It18).
  - **Attentes** : fichier `public/media/ui/ignition.wav` (son démarrage, branché) · playlists par preset + bruits de click (façon GTA — sons/playlists Vincent) · retours de test (recalage % zones/instruments en liste numérotée) · destination de chaque objet des intérieurs (Vincent nomme, Claude mesure).
  - **PMU branché et VALIDÉ Vincent (It19)** : fenêtre=sortie · borne PMU=**phrase de comptoir** (mantras dans `comptoir.js`, Vincent édite librement) · télé=futur jeu paris sportifs · FDJ/Ricard/Sud Ouest=surbrillance+lueur (futurs : jeu à gratter, événement, page news). Schéma zone étendu : `exit: true` · détourage doux validé (masque fondu 14 %, zones élargies).
  - **LA RIDE branchée (It20)** : tableau des prix=**carte des cocktails** (vraies recettes/dosages dans `cocktails.js`, Vincent en ajoute ; verre animé robe+bulles, panneau néon rouge) · photobooth (futur dossier photos de soirée), vestiaire (future friperie, fringues cliquables), toilettes (futur lieu à sound design)=surbrillance+lueur. **Intention actée : sound design par lieu/objet (fichiers Vincent) pour faire vivre chaque scène.**
  - **DJ booth (It21, validé)** : cabine cliquable → **V2000 DJ**, deux CDJ (piste A/B) : bac à disques (sons de l'OS + exclus `djbooth.js` ← fichiers dans `public/media/djbooth/`), play/cue, pitch ±8 %, faders de voie, crossfader équal-power, plateau qui tourne. D13 : jouer rend l'antenne (instrument, jamais 2e flux). Survol des zones renforcé (brightness 1.45).
  - **Détourage au pixel (It22+fix, règle permanente)** : chaque zone affiche un **sprite PNG pré-détouré** (`scenes/lights/<scene>_<zone>.png` = crop on × masque alpha calculé sur le diff réel, recette stricte validée ; **recette douce v2** en **opt-in par scène** via `FONDU_DOUX` (cathédrale seule) : cœur détouré + halo qui ÉMANE de l'objet par flou large, seuils réglables par zone (pupitre resserré). **TRICHE assumée** (`TRICHE` dans le script, demande Vincent) : les paires IA n'étant pas alignées au pixel, les sprites de détail sont fabriqués à la main — vitraux = swap complet du verre seul (forme d'arc dessinée + retombée), confessionnal = image OFF ré-éclairée (texte + intérieur de l'entrée seulement, zéro dédoublement), bougies = clé de luminance flammes/cires + halo radial. Une scène n'entre en douce/triche qu'après validation de Vincent) — zéro masque CSS au runtime, ce que montre l'aperçu PIL est ce que rend le navigateur. Génération : `python3 tools/build_zone_masks.py` **à relancer à chaque nouvelle zone/scène**, puis `lum: L('…')` dans `scenes.js` (fallback sans sprite : crop + fondu générique). Les 20 zones actuelles sont détourées.
  - **Taverne branchée (It23)** : téléphone=**Nokia 3310** (accueil/menu/contacts `nokia.js`/Messages gag/**Snake jouable** — flèches ou touches 2-4-6-8) · VIN DU MOIS + À MANGER=**carnet d'adresses** (flow unique `adresses.js` : sections cavistes/restos/pizzerias, entrées nom/ville/note/lien ↗ — Vincent remplit).
  - **Programme acté des scènes restantes (Vincent, 2026-07-04)** — *barque* : lampe=page ciel étoilé animé + enregistrement audio (fichier Vincent) · radio=page cassettes → playlists · pizza=carnet section pizzerias. *Cathédrale* : vitrail démoniaque=univers dark psyché catholique + son dark · vitrail joyeux=même univers en angélique + son · pupitre=discours à la con (sons Vincent) · « là pour vous parler »=vocaux de Vincent en boucle · bougies=**donner une pièce à l'artiste** (pourboire).
  - **Barque branchée et validée (It24)** : lanterne=**ciel étoilé** (bitmap 384×216, scintillement, étoile filante rare, eau qui tremble ; boucle l'enregistrement `public/media/nightdrive/barque_ciel.wav|mp3` dès dépôt — antenne rendue) · boombox=**cassettes** (`cassettes.js` : 1 K7=1 playlist, pistes=ids OS ou fichiers directs ; choisir=prise d'antenne D13, bobines qui tournent) · pizza=carnet pizzerias · **la ville vue de l'eau est navigable** : cathédrale/TAVERNE/LA RIDE/PMU = portes `goto` ; **aura** (halo suivant la forme du sprite, couleur par enseigne) réservée aux 3 petites enseignes lointaines — retour Vincent 2026-07-04 : sur les grandes surfaces (cathédrale, lanterne) ça fait fake → boost léger (1.12/1.2) sans halo. Champs `boost`/`aura` dispo par zone partout.
  - **Lumières cathédrale posées (It25)** : 5 zones mesurées + sprites détourés (vitrail_dark, vitrail_ange, pupitre, confessionnal, bougies) — clic = lueur en attendant les destinations. **Contrat sonore livré : `docs/exploration/nightdrive/sons_nightdrive.md`** (le nom du fichier = le branchement ; 6 catégories : séquence d'entrée nightmode_on→ignition (Vincent a les 2), ambiances/scène, portes, univers, objets, niveaux). Vincent prépare les fichiers, Claude pose les hooks à réception.
  - **Grande passe de branchement (It26) — TOUTES les zones dormantes sont vivantes.** Dispatcher `zoneClick` étendu + 8 fichiers-données éditables (même pattern que cocktails/comptoir) + 2 moteurs (`worldsound.js`, `univers.js`). Cathédrale : 2 vitraux→**univers plein cadre** (rosace canvas vivante, dark/angélique, `univers.js`), pupitre→**sermons** (`sermons.js`), confessionnal→**vocaux en boucle**, bougies→**pourboire** (cierges à allumer, lien réel optionnel `pourboire.js`). PMU : fdj→**vrai jeu à gratter** (canvas scratch souris, `grattage.js`), tele→**paris sportifs** (écran démo, `paris.js`), ricard→**événement** (`evenement.js`), sudouest→**journal Sud Ouest** (`journal.js`). LA RIDE : photobooth→**pellicule** (`soiree.js`), vestiaire→**friperie** (`friperie.js`), toilettes→**mur graffiti** + hook son. Tour radio→**Internet** (séquence modem RTC, porteuse introuvable). **Contrat sonore activé** (`worldsound.js`) : ambiances par scène (duckées par l'antenne, D13), portes, `ressortir`, univers, sons d'objet — chaque hook tente `<nom>.wav` puis `.mp3`, silence si absent (050). Le nom du fichier = le branchement : Vincent dépose, ça vit. Escap dépile par couches. Détail : `090` (It26).
  - **Boîte à gant (It27→It28) — LIVE** : **scène gigogne** (procédé peint+animé). Clapet détouré sur l'habitacle (sprite `quai_glovebox.png` détouré du clapet éclairé de `habitacle_ganton_v1.png`, `z:5` pour passer au-dessus de la blockzone) → scintille au survol → zoom dans la scène `glovebox` (intérieur off/on de Vincent). **6 objets mesurés et scintillants** (fondu générique) ; gestes branchés : phone→nokia (3310), flyer RAVE EUSKADI→evenement ; cd→Médias, carte→destination, ticket AUTO IRATI→archive, fumeur→flamme = lueur à brancher. Reste : recaler %, détourage pixel, brancher les 4 gestes. L'overlay CSS d'It27 a été retiré. Détail : `090` (It28).
  - **Higgsfield connecté + méthode « montage en calques » (It31→33, doc dédiée : `exploration/nightdrive/methode_montage_scene.md`)** : Claude génère les images via le connecteur Higgsfield (`generate_image`, `remove_background`). Contrainte : le sandbox ne rapatrie pas les images → Vincent télécharge du widget et dépose. Règles : ne pas chaîner grok (dégrade/sépia), `nano_banana_2` en `3:2` pour l'édition cohérente, off/on dérivés d'UNE base. Une scène = calques : fond off/on (objets détourés) + perso découpés (`remove_background` + nettoyage composante connexe locale, sprites `perso/`, idle CSS + halo survol) + `foreground` (calque devant les perso, sous les zones — ex. lanterne) + zones. **Barque refaite avec ça** : fond sans perso, 11 objets, CD effacé (inpaint), lanterne avant-plan, 2 perso alien (raver + punkette) posés/animés. Identité perso : hybrides ambigus, peau bleu-violet translucide, visage ~85 % humain. À faire : poses/anim, appliquer aux autres scènes.
  - **Prochaines briques** : recalage % / retours de test It26 (liste numérotée) · dépôt des fichiers sons (le contrat est branché, il attend les wav/mp3) · vrais contenus des fichiers-données (photos soirée, fringues, articles, événement) · vie canvas par-dessus le peint. Hors scope : conduite, pluie, timeline interruptible.
- **Émetteur (D13) : en attente derrière Night Drive (D14).** v1 livrée : `EmetteurApp.svelte` (fader ATELIER⟷TOI 1 s/1,5 s, ÉJECT, ON AIR, VU réel WebAudio, indicatif provisoire **VINCENT 2000 RADIO — 93.00 FM**), moteur audio conservé (`player.svelte.js` + `eject()`). Wireframe pupitre : `docs/exploration/emetteur/proto_final_pupitre_soude.svg` ; comportement cible : `comportement_vivant.md`. Corrections v1 : liste à venir de Vincent, plus tard. Hors scope v1 : moteur génératif, événements rares, désync des aiguilles, crossfade au ✕. Questions ouvertes (indicatif définitif, voix à l'antenne, degré de direct, retour d'antenne) : à trancher en manipulant.
- En attente aussi : liste de corrections du socle (session de test bureau, jamais transmise).
- Lancement local : double-clic « Lancer Vincent 2000 OS.command » (nécessite Node.js).
