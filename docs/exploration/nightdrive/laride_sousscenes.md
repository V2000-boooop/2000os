# LA RIDE — sous-scènes gigognes (exploration Concepteur)

> **Rôle :** proposition créative du Concepteur (095, Rôle 1) pour donner de la **profondeur** à LA RIDE via des sous-scènes gigognes (D15). Par zone/objet → 2–3 options, une recommandée, croisant une **référence VG réelle** et le délire Vincent 2000 (rave 1998–2003, PS2 « 2003 », PMU/Pays Basque, GTA/arcade, night drive, UKG/jungle/house/electro, radio pirate).
> **Statut :** exploration — **Vincent tranche**, puis Intégrateur/Contrôleur. Rien n'est codé ici.
> **Contraintes tenues :** DA 070 (« PS2 2003 »), D13 (jouer rend l'antenne), D15 (pile gigogne, Échap dépile), D16 (collage peint + porte 3D « manger un objet »), D17 (objets Rive : découpe + inputs pensés dès l'image). Léger, maintenable, réutilise l'ossature (`scenes.js`, `.nd-room`, `worldsound`, `RiveObject` à venir).
> **Date :** 2026-07-06.

---

## 0. État de LA RIDE (ne pas réinventer)

Registre actuel `laride` (`scenes.js`) — 5 zones :

| zone | état | verdict Concepteur |
|---|---|---|
| `tableau` → cocktails | **FAIT** (It20 : 15 recettes, verre SVG animé, néon rouge) | approfondir en option (jeu de barman), pas prioritaire |
| `djbooth` → V2000 DJ | **FAIT** (It21 : 2 CDJ, pitch, crossfader, bac) | **candidat n°1 à l'approfondissement Rive (D17)** — voir §DJ |
| `photobooth` → pellicule | **superficiel** (It26 : bande vierge, `soiree.js` vide) | à transformer en **sous-scène jouable** |
| `vestiaire` → friperie | **superficiel** (It26 : portant vide, `friperie.js` vide) | à transformer en **sous-scène navigable/contenu** |
| `toilettes` → mur graffiti | **superficiel** (It26 : mur CSS + hint son) | à transformer en **sous-scène** (défouloir / secret) |

Nouvelles zones proposées (justifiées par la scène d'un club) : **le bar/zinc** (barman), **la piste** (danser), **le fumoir/sortie** (dehors), **la loge/backstage** (secret). Détaillées en §6.

Tout ce qui suit s'ouvre par le même geste : **clic zone → `goto` (sous-scène plein cadre) ou `open` (salle-panneau `.nd-room`)** ; **Échap dépile**. Fallback lueur tant que les assets manquent (règle registre).

---

## 1. PHOTOBOOTH — la cabine à rideau

*Zone existante `photobooth`. Aujourd'hui : une bande de pellicule vierge (`soiree.js`).*
Une cabine photo dans un club de l'an 2000, c'est un rituel : on s'entasse à trois, le rideau rouge, quatre flashs, la bande qui sort chaude. C'est le meilleur endroit pour un **mini-jeu à timing** ET une **archive vivante**.

### Option 1.1 — La séance photo (mini-jeu de pose + flash) ⭐ **RECOMMANDÉ**
**Pitch.** Clic → on entre dans la cabine (rideau qui se ferme). Compte à rebours « 3·2·1 » puis **4 flashs successifs** : à chaque flash on presse une touche/clic **au bon moment** pour « prendre une pose ». Un bon timing = cliché net et cadré ; raté = photo floue/coupée, gag. À la fin, la **bande de 4 se tire du côté de la cabine** (pellicule qui descend) et rejoint le mur des photos de soirée (archive persistante `soiree.js`). Les clichés sont composés en direct (portrait détouré de perso + fond du club + date + grain), donc **la pellicule vide se remplit toute seule à mesure qu'on joue** — plus besoin d'attendre les images de Vincent.
**Référence VG.** *WarioWare* / *Rhythm Tengoku* pour le micro-timing « presse-au-bon-moment », croisé avec le **Photo Mode arcade** des bornes purikura japonaises (Print Club, 1995→2000) — la vraie borne à stickers de l'époque rave.
**Type.** jeu (timing) + contenu (archive).
**Techno.** **CSS-JS pur + canvas** (composition des 4 vignettes sur un petit buffer 2D). Léger, aucune lib. Le flash = flash CSS blanc + son.
**Poids.** léger. **Effort.** M.
**Note DA.** rideau rouge `--v2000-rouge-nuit`, flash surexposé assumé, tirage sépia-compressé (grain), coin daté « BAYONNE · 03:14 ».

### Option 1.2 — Le photobooth Rive (rideau + flash riggés) (D17)
**Pitch.** Même séance, mais la cabine est un **objet Rive** vivant : rideau qui s'ouvre/ferme, ampoule de flash qui charge et claque, tabouret qui grince. On pense la découpe dès l'image (rideau ≠ paroi ≠ ampoule ≠ tabouret). Plus « objet vivant » que le CSS, mais recâblage plus lourd.
**Référence VG.** idem 1.1 côté gameplay ; côté rendu, l'esthétique **animatronique d'un stand de fête foraine PS2** (*The Simpsons Hit & Run* mini-attractions).
**Type.** objet Rive + jeu.
**Techno.** **Rive** (`RiveObject`) pour la cabine + JS pour le score.
**Découpe Rive.** pièces : `rideau_g`, `rideau_d`, `paroi`, `ampoule_flash`, `tabouret`, `fente_tirage`.
**Inputs Rive.** `Trigger enter` (rideau se ferme) · `Trigger flash` (ampoule claque, 4×) · `Number pose` (0–3, quelle pose) · `Trigger eject` (la bande sort de la fente) · `Boolean occupe`.
**Poids.** moyen (`.riv` léger, mais à produire). **Effort.** L.

### Option 1.3 — Le mur de la nuit (contenu seul, minimal)
**Pitch.** Pas de jeu : clic → **plein cadre sur le mur de polaroids punaisés** (`soiree.js`), qu'on peut survoler pour lire les légendes griffonnées. Livrable rapide en attendant mieux.
**Référence VG.** le **tableau de photos de *Life is Strange*** (mur de souvenirs consultable) en version punaise/scotch de club.
**Type.** contenu.
**Techno.** CSS-JS pur.
**Poids.** léger. **Effort.** S.

> **Reco : 1.1** — jouable en 10 s (règle 040), remplit l'archive tout seul (P0 : le site provoque de la création), zéro dépendance. 1.2 est le palier Rive plus tard.

### 🔎 QC Contrôleur — Photobooth

| Option | Jouable | Web sans usine à gaz | Poids | DA « PS2 2003 » | Pas déjà fait | Cohérent D12–D17 | **Verdict** |
|---|---|---|---|---|---|---|---|
| **1.1** Séance photo (timing + canvas) | ✅ 10 s, règle 040 | ✅ CSS-JS + `canvas` 2D, 0 lib | ✅ léger (buffer 2D) | ✅ flash surex + grain + sépia | ✅ transforme `soiree.js` vide | ✅ P0 (archive auto), gigogne | **✅ VALIDÉ** |
| **1.2** Photobooth Rive | ✅ | ⚠️ dépend de `RiveObject` (pas encore créé) | ✅ `.riv` léger | ✅ | ✅ | ✅ D17 | **⚠️ PLUS TARD** — après 4.1 (le premier `RiveObject` doit être la platine, pas la cabine) |
| **1.3** Mur de la nuit (contenu seul) | — (pas un jeu) | ✅ | ✅ | ✅ | ✅ | ✅ | **✅ OK en repli** si 1.1 glisse |

**Pièges techniques signalés :**
- **1.1 — composition canvas + persistance.** Composer 4 vignettes sur un buffer 2D = trivial. Le vrai point d'attention est la **persistance de la bande** : `soiree.js` doit stocker soit des `dataURL` (lourd en localStorage, quota ~5 Mo → **plafonner à N bandes**, FIFO), soit **régénérer** les clichés à la volée depuis une seed (léger, recommandé). Correctif : stocker `{seed, date, poses[]}` par cliché, re-render au chargement → localStorage reste minuscule.
- **1.1 — « portrait détouré de perso ».** La compo « portrait alien + fond club » suppose des sprites perso détourés **cadrés portrait**. Les sprites barque (`raver.webp`, `myrtille_idle.webp`) sont en pied → prévoir soit un crop buste, soit assumer le plan large. Non bloquant, à noter pour Vincent.
- **1.2 — ne pas doubler le chantier Rive.** OK sur le principe D17, mais **un seul `RiveObject` fondateur à la fois** : la platine (4.1) est le contrat canonique. Recâbler la cabine en Rive avant que le composant existe = usine à gaz. → planifier **après** 4.1.

### 🌐 Références en ligne — Photobooth

- **Purrybooth** (photobooth navigateur inspiré purikura, bande + stickers, tout en front) — modèle direct de la 1.1 côté « bande qui se compose en direct » : https://www.purrybooth.com/
- **Purikura Online** (effets photobooth japonais dans le navigateur, compo de strip) — preuve de faisabilité full-web de la borne à stickers : https://www.purikura.io/
- **Pattern Rive « calque cliquable utile »** (réf. fondatrice D17, pour la piste 1.2) : https://rive.app/community/files/25774-48147-interactive-sasquatich/

---

## 2. VESTIAIRE / FRIPERIE — le portant

> 🧥 **ÉTENDU (2026-07-06) :** le vestiaire devient un **jeu d'habillage type Sims** (dress-up du raver alien en calques échangeables) — spec complète et validée dans un doc dédié : **`laride_vestiaire_habillage.md`**. Les options 2.1 (portant à faire glisser) et 2.2 (cabine d'essayage) ci-dessous y sont fusionnées et poussées (2.1 survit comme geste de navigation du rail de vignettes).

*Zone existante `vestiaire`. Aujourd'hui : portant vide (`friperie.js`).*
Le vestiaire d'un club transformé en friperie : des fringues suspendues, une caisse, des cintres qui cliquettent. C'est le lieu naturel du **merch / one-of-one** de Vincent et le prétexte à une petite mécanique tactile.

### Option 2.1 — Le portant qu'on fait défiler (contenu tactile) ⭐ **RECOMMANDÉ**
**Pitch.** Clic → **plein cadre sur le portant** : une rangée de fringues sur cintres qu'on **fait glisser à la souris/molette** (drag horizontal, inertie). Chaque pièce décrochée se retourne (recto/verso, étiquette manuscrite : nom, taille, prix ou « pas à vendre », histoire). Lien optionnel vers la boutique/contact (déjà prévu dans `friperie.js`). L'inertie + le cliquetis des cintres donnent la sensation physique.
**Référence VG.** le **système d'inventaire tournant / boutique de *Resident Evil 4*** (objets qu'on fait pivoter et inspecter) croisé avec le **rack de fringues drag de *Jet Set Radio*** (streetwear, fond graffiti).
**Type.** contenu (tactile).
**Techno.** **CSS-JS pur** (drag + `scroll-snap` ou transform + inertie JS légère). Pixi seulement si Vincent veut des dizaines de pièces (pas le cas au départ).
**Poids.** léger. **Effort.** M.
**Note DA.** portant chromé mat, cintres fil de fer, étiquettes carton kraft `--v2000-brun-tabac`, néon d'essayage `--v2000-violet-rave`.

### Option 2.2 — La cabine d'essayage (habillage du perso alien)
**Pitch.** On décroche une pièce → elle **s'enfile sur un perso alien** (les hybrides bleu-violet de la barque) présenté en pied dans le miroir de la cabine. On compose une tenue (haut/bas/veste/accessoire), miroir façon vieux jeu d'habillage. Récompense possible : une tenue « canon » débloque un sticker/son.
**Référence VG.** les **dressing-rooms de *Tokyo Xtreme Racer* / *Jet Set Radio Future*** (customisation de perso), esprit **poupée à habiller flash de l'an 2000** (dressup dolls des sites persos).
**Type.** jeu léger + contenu.
**Techno.** CSS-JS (calques de fringues détourées sur sprite perso) ou **Rive** si on veut le perso qui bouge en enfilant.
**Poids.** moyen. **Effort.** L.

### Option 2.3 — Le vestiaire minimal (grille de pièces)
**Pitch.** Une simple **grille de vignettes** cliquables (comme la friperie actuelle mais remplie), chaque clic ouvre la fiche. Zéro mécanique, livrable immédiat.
**Référence VG.** l'écran boutique **statique de *GTA Vice City*** (Rafael's, Suburban) — liste de fringues cliquables.
**Type.** contenu.
**Techno.** CSS-JS pur (déjà à 90 % dans le code existant).
**Poids.** léger. **Effort.** S.

> **Reco : 2.1** — la sensation de faire glisser le portant est ce qui rend la friperie *vivante* et pas une page produit. 2.2 est un bel objectif « habillage » si Vincent veut pousser l'usage des perso alien.

### 🔎 QC Contrôleur — Vestiaire/friperie

| Option | Jouable | Web sans usine à gaz | Poids | DA « PS2 2003 » | Pas déjà fait | Cohérent D12–D17 | **Verdict** |
|---|---|---|---|---|---|---|---|
| **2.1** Portant à faire glisser | ✅ (tactile) | ✅ CSS-JS ; GSAP `Draggable` (déjà installé) idéal pour l'inertie | ✅ léger | ✅ | ✅ (`friperie.js` vide) | ✅ D15 | **✅ VALIDÉ** |
| **2.2** Cabine d'essayage (habillage) | ✅ jeu léger | ⚠️ calques fringues détourés OU Rive | ⚠️ moyen (assets ×N pièces) | ✅ | ✅ | ✅ | **⚠️ OBJECTIF** — bel usage des perso alien mais **coût assets** ; après 2.1 |
| **2.3** Grille de vignettes | — | ✅ (90 % déjà là) | ✅ | ✅ | ⚠️ ≈ friperie actuelle | ✅ | **✅ repli immédiat** |

**Pièges techniques signalés :**
- **2.1 — ne PAS réinventer l'inertie à la main.** GSAP + InertiaPlugin sont **déjà installés** (D17). Le drag horizontal + momentum + snap se fait proprement avec `Draggable` (type `"x"`, `inertia:true`) plutôt qu'une boucle JS maison → moins de bugs de vélocité/rebond. Correctif : câbler sur GSAP `Draggable`, pas de moteur d'inertie custom.
- **2.1 — recto/verso.** Le « flip » d'une pièce décrochée = `transform: rotateY` CSS (même vocabulaire tactile que le flip de disque en 4.3 → cohérence). OK, léger.
- **2.2 — piège assets.** Un vrai jeu d'habillage = chaque pièce détourée × chaque zone du corps × cohérence de calage sur le sprite alien. C'est le poste **assets** qui explose, pas le code. Tant que Vincent n'a pas les pièces détourées, rester en 2.1. Si Rive : le perso devient un `RiveObject` (encore le plumbing 4.1 en prérequis).

### 🌐 Références en ligne — Vestiaire/friperie

- **GSAP `Draggable` (doc officielle)** — drag/spin/toss + flick-scroll avec inertie, exactement le geste du portant (lib déjà dans le projet) : https://gsap.com/docs/v3/Plugins/Draggable/
- **Codrops — « Building a Scrollable and Draggable Timeline with GSAP »** (Draggable + inertie horizontale, tutoriel complet) : https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/
- **Codrops — « Mastering Carousels with GSAP »** (carrousel drag + Inertia, snap sur item) : https://tympanus.net/codrops/2025/04/21/mastering-carousels-with-gsap-from-basics-to-advanced-animation/

---

## 3. TOILETTES — le mur des chiottes

*Zone existante `toilettes`. Aujourd'hui : mur de graffitis CSS statique + hint son.*
Les chiottes d'un club, c'est le mur d'expression sauvage, le lieu du secret, le sound design cracra (chasse d'eau, basse qui traverse la porte). Trois directions très distinctes.

### Option 3.1 — Le mur qu'on tag (jeu d'expression + trace persistante) ⭐ **RECOMMANDÉ**
**Pitch.** Clic → **plein cadre sur la cloison** couverte de graffitis. On prend **une bombe / un marqueur** et on **tag soi-même** (dessin libre à la souris, quelques couleurs fluo, trait qui coule). Ce qu'on tague **reste** (stocké localStorage → le mur se souvient de nos passages, se densifie nuit après nuit). Des tags pré-écrits de Vincent (locaux, an 2000) sont déjà là dessous. Filiation directe D13/radio pirate : le mur EST un mur d'antenne.
**Référence VG.** le **tag à la bombe de *Jet Set Radio*** (le geste de spray, la coulure) — la référence exacte, ici en 2D mur fixe façon *Marc Ecko's Getting Up*.
**Type.** jeu (expression) + contenu (trace).
**Techno.** **canvas 2D** (pixel buffer + spray brush + drips), localStorage. Léger, aucune lib externe.
**Poids.** léger. **Effort.** M.
**Note DA.** carrelage pisseux `--v2000-vert-pmu` fatigué, néon qui grésille, marqueurs `--v2000-violet-rave`/`--v2000-rouge-nuit`, sous-basse qui passe la porte (hook son `zone_laride_toilettes`).

### Option 3.2 — Le miroir (secret / 4e mur)
**Pitch.** Clic → **face au miroir des lavabos**, embué. On **essuie la buée** à la souris (comme un scratchcard) et selon ce qu'on découvre : un message, un reflet qui n'est pas le nôtre (perso alien qui apparaît une frame), un numéro griffonné au rouge à lèvres → un secret (son caché, prise d'antenne d'un morceau planqué). Moment d'inquiétude nocturne assumé.
**Référence VG.** le **miroir embué de *Silent Hill*** (on écrit dessus, le reflet ment) — en version club, dédramatisée et drôle.
**Type.** jeu (révélation) + porte de collection.
**Techno.** canvas 2D (destination-out, comme le grattage PMU déjà en place → **réutilise `grattage.js`/le moteur scratch existant**).
**Poids.** léger. **Effort.** S–M.

### Option 3.3 — Le distributeur mural (gachapon de secrets)
**Pitch.** Le vieux distributeur de capotes/chewing-gums au mur : une pièce → une **capsule** tombe, contenant un objet-souvenir aléatoire (sticker, sample, mantra, flyer). Micro-collection sans péage (bonus, jamais accès unique — garde-fou 040).
**Référence VG.** les **machines à capsules / gachapon** (*Animal Crossing*, *Yakuza*) — la loterie physique.
**Type.** jeu (loterie) + collection.
**Techno.** CSS-JS pur + un peu de physique de chute (ou Rive pour la capsule qui tombe).
**Poids.** léger. **Effort.** M.

> **Reco : 3.1** — le tag est *le* geste rave/street, il crée de la trace (le mur vit entre les visites), et il est cohérent au pixel avec la DA. 3.2 est un excellent **secret** à glisser en plus (réutilise le moteur de grattage → quasi gratuit).

### 🔎 QC Contrôleur — Toilettes

| Option | Jouable | Web sans usine à gaz | Poids | DA « PS2 2003 » | Pas déjà fait | Cohérent D12–D17 | **Verdict** |
|---|---|---|---|---|---|---|---|
| **3.1** Mur à taguer (canvas + localStorage) | ✅ expression | ✅ `canvas` 2D, 0 lib | ⚠️ léger *si persistance maîtrisée* | ✅ carrelage PMU + néon | ✅ (mur CSS statique aujourd'hui) | ✅ P0/trace, filiation D13 | **✅ VALIDÉ** (voir garde-fou poids) |
| **3.2** Miroir embué (scratch-reveal) | ✅ révélation | ✅ **réutilise `grattage.js`** (moteur scratch déjà codé) | ✅ léger | ✅ | ✅ | ✅ porte de collection | **✅ VALIDÉ en bonus quasi-gratuit** |
| **3.3** Distributeur gachapon | ✅ loterie | ✅ CSS-JS (+ Rive option) | ✅ léger | ✅ | ✅ | ✅ bonus, jamais péage (040) | **✅ OK plus tard** |

**Pièges techniques signalés :**
- **3.1 — LE piège = le poids de la persistance.** Sauver le mur en `dataURL` PNG à chaque tag = **plusieurs Mo dans localStorage** (quota ~5 Mo, saturé en quelques nuits → crash silencieux). Correctifs concrets, au choix : (a) stocker les **traits vectoriels** (`[{x,y,couleur,taille}]`) et re-peindre au chargement — léger et fidèle ; (b) sauver un PNG **downscalé + compressé** (canvas basse-déf, `toDataURL('image/webp',0.5)`) avec **plafond de traits** (FIFO : les vieux tags s'effacent). Sans ce garde-fou, la « trace persistante » devient une bombe mémoire. → **condition de validation.**
- **3.1 — pas de backend.** « le mur se souvient de nos passages » = **par visiteur** (localStorage), pas partagé entre visiteurs (pas de serveur, D10/phase 1). Bien le formuler à Vincent pour éviter le malentendu « mur communautaire ».
- **3.2 — quasi gratuit confirmé.** `grattage.js` fait déjà `destination-out` au pointeur (It26, jeu FDJ). Le miroir = même moteur, texture « buée » au lieu de « ticket ». Bon ROI.

### 🌐 Références en ligne — Toilettes

- **`dripping-spray`** (module JS canvas : bombe + **coulures** qui restent après le spray) — le game-feel exact du tag Jet Set Radio : https://github.com/Narigo/dripping-spray
- **Eloquent JavaScript — chapitre « A Paint Program »** (spray canvas : densité de points selon la vitesse de la souris, base solide et légère) : https://eloquentjavascript.net/2nd_edition/19_paint.html
- **CodePen — « Scratch Reveal with `<canvas>` » (Dudley Storey)** (`globalCompositeOperation = destination-out`, le moteur exact du miroir embué 3.2 = celui de `grattage.js`) : https://codepen.io/dudleystorey/pen/yJQxLX

---

## 4. DJ BOOTH — approfondissement (déjà FAIT, on pousse en Rive) (D17)

*Zone `djbooth` = V2000 DJ, déjà livré It21 (2 CDJ CSS, pitch, crossfader, bac).* **On ne refait pas** — on propose de le faire **vivre en Rive** (c'est l'exemple canonique de D17) et/ou d'y ajouter du geste.

### Option 4.1 — La platine Rive vue du dessus (le contrat D17) ⭐ **RECOMMANDÉ**
**Pitch.** Remplacer les plateaux CSS par une **vraie platine Rive vue du dessus** : le vinyle/CD tourne pour de vrai, le bras vibre, le pitch fait riper la vitesse visuellement, le **jog répond au drag** (scratch : on attrape le disque, le son suit — `playbackRate` piloté par la vélocité du drag). C'est exactement le pattern de référence cité en D17. Premier vrai objet `RiveObject` du projet → il valide le plumbing pour tout le reste.
**Référence VG.** ***DJ Hero* / *Beatmania IIDX*** (le plateau/turntable jouable, le scratch au geste) — mécanique CDJ arcade exacte.
**Type.** objet Rive + instrument (D13 : jouer rend l'antenne, déjà respecté).
**Techno.** **Rive** (plateau riggé) + le moteur audio 2-decks **déjà en place** (on ne recâble que le visuel + le scratch).
**Découpe Rive.** par deck : `plateau` (disque qui tourne), `label_centre`, `bras`, `curseur_pitch`, `led_cue`, `led_play`, `corps`.
**Inputs Rive.** `Boolean playing` (fait tourner le plateau) · `Number rpm` (vitesse = f(pitch)) · `Number scrub` (position du drag pour le scratch) · `Trigger cue` · `Trigger nudge` · `Boolean loaded`.
**Poids.** moyen (2 `.riv` ou 1 réutilisé × 2). **Effort.** M–L.

### Option 4.2 — Le sampler / pads (MPC de poche)
**Pitch.** À côté des platines, une **grille de 8–16 pads** déclenchant des one-shots de Vincent (stabs UKG, sirènes jungle, coups de klaxon, voix rave « oi ! »). On tape un pattern par-dessus le mix. Instrument pur, dans l'esprit atelier.
**Référence VG.** ***Bust A Groove* / *PaRappa*** côté rythme, mais surtout **l'Akai MPC / le mode step des jeux type *Fluidity*** — la grille de pads.
**Type.** instrument (jeu léger).
**Techno.** **Tone.js** (déjà installé) pour le séquenceur + one-shots ; UI CSS. D13 : les pads restent un instrument par-dessus l'antenne rendue.
**Poids.** léger–moyen. **Effort.** M.

### Option 4.3 — Le bac à disques fouillable (contenu + geste)
**Pitch.** Approfondir le **bac** : au lieu d'une liste, une **caisse de vinyles/CD qu'on feuillette** (flip d'un disque à l'autre, pochettes détourées, on lit le dos). Charge le disque sur la platine par drag. Plus « fouiller dans les bacs » que « choisir dans un menu ».
**Référence VG.** le **crate-digging de *Fluidity*/*Vib-Ribbon*** côté DA, et le **flip d'inventaire de *RE4*** côté geste (déjà cité en 2.1 — cohérence de vocabulaire tactile dans toute LA RIDE).
**Type.** contenu + geste.
**Techno.** CSS-JS (flip 3D transform) ou Pixi si beaucoup de pochettes.
**Poids.** léger. **Effort.** M.

> **Reco : 4.1** — c'est **l'objet Rive canonique de D17**, il débloque le composant `RiveObject` pour tout le projet, et le moteur audio existe déjà. 4.2 (pads Tone.js) est le meilleur ajout « instrument » ensuite.

### 🔎 QC Contrôleur — DJ booth

| Option | Jouable | Web sans usine à gaz | Poids | DA « PS2 2003 » | Pas déjà fait | Cohérent D12–D17 | **Verdict** |
|---|---|---|---|---|---|---|---|
| **4.1** Platine Rive vue du dessus + scratch | ✅ instrument | ⚠️ crée le composant `RiveObject` (fondateur, à faire) | ✅ moyen (`.riv`) | ✅ CDJ arcade | ✅ (plateaux CSS aujourd'hui) | ✅ **contrat canonique D17**, D13 (jouer rend l'antenne) | **✅ VALIDÉ — objet Rive fondateur** |
| **4.2** Sampler/pads (Tone.js) | ✅ instrument | ✅ **Tone.js déjà installé** | ✅ léger-moyen | ✅ | ✅ | ✅ D13 (instrument, pas 2e flux) | **✅ VALIDÉ — meilleur ajout après 4.1** |
| **4.3** Bac à disques fouillable | — geste/contenu | ✅ CSS flip 3D | ✅ léger | ✅ | ⚠️ un bac liste existe déjà (It21) | ✅ | **⚠️ approfondissement** — bien mais moins prioritaire |

**Pièges techniques signalés :**
- **4.1 — le scratch audio est déjà prouvé, mais attention au moteur audio.** Le moteur It21 utilise des **éléments `<Audio>`** (playbackRate simple). Le vrai scratch bidirectionnel (attraper le disque, lâcher, jouer **à l'envers**) nécessite la **Web Audio API** (`AudioBufferSourceNode` + buffer inversé), pas `<audio>` : `HTMLAudioElement.playbackRate` **n'accepte pas les valeurs négatives**. Correctif : pour le scratch, migrer le/les deck(s) vers un `AudioBufferSourceNode` piloté par la vélocité du drag (le CodePen ci-dessous fait exactement ça). C'est **le vrai coût** de 4.1, plus que le rig Rive. → à cadrer avant de promettre le scratch arrière.
- **4.1 — synchro Rive ↔ audio.** Le `Number rpm` / `Number scrub` de la State Machine doit être **piloté par la position audio réelle**, sinon le disque et le son désynchronisent visuellement. Boucle `requestAnimationFrame` unique qui met à jour l'input Rive depuis l'horloge audio. Standard, mais à ne pas oublier.
- **4.2 — Tone.js + D13.** Bien vérifier que les pads passent par le **même contexte audio** et respectent « jouer rend l'antenne » (éjecter l'émetteur au 1er pad, comme les platines It21). Sinon 2e flux concurrent = viole D13.

### 🌐 Références en ligne — DJ booth

- **CodePen — « Realtime scratching DJ turntable » (pimskie)** ⭐ **la référence n°1 du projet pour 4.1** : scratch **temps réel** via Web Audio API, `playbackRate` piloté par la **vélocité du drag**, **buffer inversé** pour le scratch arrière — pas un « scratch.mp3 ». Code lisible, ré-utilisable tel quel pour le moteur audio : https://codepen.io/pimskie/pen/bGjMdxV
- **Wheels of Steel** (prototype DJ navigateur : disque + bras + pitch draggables, cue/scratch au pointeur) — modèle d'UX platine complète : https://wheelsofsteel.net/
- **Pattern Rive « calque cliquable utile »** (réf. fondatrice D17 — la platine EST l'application canonique de ce pattern : clic booth → vue platine, chaque contrôle = un input State Machine) : https://rive.app/community/files/25774-48147-interactive-sasquatich/
- **CodePen — « Step Sequencer Tone.js » (jend-codes)** (grille de pads, `Tone.Player` sur one-shots kick/snare/hihat… → modèle direct de 4.2) : https://codepen.io/jend-codes/pen/eYZgeNL

---

## 5. TABLEAU / COCKTAILS — approfondissement (déjà FAIT, optionnel)

*Zone `tableau` = la carte, déjà livrée It20.* **On ne refait pas la carte.** Une seule option d'approfondissement, basse priorité.

### Option 5.1 — Le shaker (mini-jeu de barman) — *optionnel, plus tard*
**Pitch.** Depuis la fiche d'un cocktail, un bouton « le préparer » → **mini-jeu de service** : verser chaque ingrédient au bon niveau (jauge à relâcher au bon dosage), piler la menthe (mash), shaker (agiter la souris), verser. Un service réussi remplit le verre SVG existant proprement ; raté = ça déborde, gag. Réutilise le verre animé déjà codé.
**Référence VG.** ***VA-11 HALL-A* (Valhalla)** — le bartender action game culte, dosage d'ingrédients exact — croisé avec le **timing de *Cooking Mama***.
**Type.** jeu (dosage).
**Techno.** CSS-JS + le verre SVG existant.
**Poids.** léger. **Effort.** M.

> **Reco :** garder en réserve. La carte remplit déjà son rôle ; ce jeu est un bonus « quand tout le reste est fait ».

### 🔎 QC Contrôleur — Cocktails

| Option | Jouable | Web sans usine à gaz | Poids | DA | Pas déjà fait | Cohérent | **Verdict** |
|---|---|---|---|---|---|---|---|
| **5.1** Shaker barman | ✅ dosage | ✅ CSS-JS + **verre SVG existant** | ✅ léger | ✅ | ✅ (carte seule aujourd'hui) | ✅ | **✅ OK mais RÉSERVE** — d'accord avec le Concepteur : la carte fait déjà le job, bonus tardif |

**Piège :** aucun bloquant. Le seul risque est le **scope creep** (VA-11 HALL-A a des dizaines d'ingrédients) → limiter à 3-4 gestes (verser/piler/shaker/servir) sinon ça devient un jeu à part entière hors budget. Réutilise bien le verre SVG It20.

### 🌐 Références en ligne — Cocktails
- **CodePen — « Realtime scratching turntable »** partage le même principe « geste continu → paramètre audio/visuel » que le shaker (agiter → remplissage) — même famille de game-feel : https://codepen.io/pimskie/pen/bGjMdxV
- *(Réserve : pas de veille approfondie mobilisée — option volontairement dé-priorisée. À rechercher au moment de la faire.)*

---

## 6. NOUVELLES ZONES (justifiées par la scène d'un club)

Un club a plus que 5 recoins. Ces zones ne existent pas encore dans `laride` mais la scène les justifie — **à ajouter au registre si Vincent valide** (nouveaux `{ id, x, y, w, h, ... }` + sprite détouré).

### 6.1 — LE ZINC / LE BAR (le barman) ⭐ zone à ajouter, fort potentiel
**Pitch.** Le comptoir avec son barman (perso alien). Clic → face au zinc : le barman lâche **une phrase de comptoir** (réutilise **`comptoir.js`** déjà écrit pour le PMU — même moteur de mantras, ton club), sert un verre, et propose « le cocktail du soir ». Passerelle naturelle vers la carte (5.1) et le sound design d'ambiance (verres, glaçons, brouhaha).
**Référence VG.** le **bar de *Shenmue* / le comptoir de *Yakuza*** (PNJ de bar qui balance des répliques), esprit *VA-11 HALL-A*.
**Type.** contenu (perso vivant) + passerelle.
**Techno.** CSS-JS + `comptoir.js` réutilisé ; **Rive** si on veut le barman qui essuie un verre (découpe : `bras`, `verre`, `torse`, `tete` ; inputs `Trigger sert`, `Boolean parle`).
**Poids.** léger. **Effort.** S (version phrase) / M (version Rive).

### 6.2 — LA PISTE (danser / la foule)
**Pitch.** Le cœur du club : la piste, la foule de perso alien qui danse au tempo du flux D13. Clic → **plein cadre sur la piste**, lumières qui pulsent AU son de l'antenne (analyse WebAudio déjà utilisée pour le VU de l'Émetteur), stroboscope, silhouettes qui bougent. Optionnel : un **jeu de danse** (flèches façon DDR calées sur le BPM d'un morceau de Vincent).
**Référence VG.** ***Dance Dance Revolution* / *Bust A Groove*** (le jeu de rythme à flèches) ; la foule = **crowd de *Rez* / *Space Channel 5*** (silhouettes réactives au son).
**Type.** contenu réactif (+ jeu de rythme optionnel).
**Techno.** **canvas 2D** + **WebAudio analyser** (déjà branché sur le flux). Tone.js si jeu de rythme précis.
**Poids.** léger–moyen. **Effort.** M (foule réactive) / L (jeu de rythme).
**Note DA.** billboards de danseurs (sprites), stroboscope assumé, brouillard/fumée qui mange le fond du dancefloor (cohérent §7 3D).

### 6.3 — LE FUMOIR / LA SORTIE (dehors, la nuit)
**Pitch.** La porte de sortie / le coin fumeur sur le trottoir. Clic → on **ressort devant LA RIDE** (le videur, un cendrier sur pied, l'enseigne rouge vue d'en bas, le taxi qui attend). Lieu calme entre deux, sound design nuit (ville lointaine, basse étouffée derrière la porte). Peut contenir **le passe-joint** (mécanique perso alien déjà amorcée sur la barque, cf. `passe_joint_prompts.md`).
**Référence VG.** les **transitions extérieures de *Shenmue* la nuit**, esprit **cutscene GTA devant un club**.
**Type.** contenu (ambiance) + geste social (passe-joint).
**Techno.** collage peint off/on (`goto` classique) + CSS.
**Poids.** léger. **Effort.** M.

### 6.4 — LE BACKSTAGE / LA LOGE (secret)
**Pitch.** Une porte « PRIVÉ » derrière le booth. Clic → la loge : setlists scotchées au mur, flight-case, un dictaphone qui **boucle des vocaux de Vincent** (réutilise le pattern `confess` de la cathédrale), des exclus. C'est **la porte de collection** de LA RIDE (040) : matière personnelle qui se mérite.
**Référence VG.** les **backstage secrets de *The Warriors* (Rockstar)** / les planques déblocables de GTA.
**Type.** contenu + collection.
**Techno.** collage peint + `loop()` (worldsound, déjà là).
**Poids.** léger. **Effort.** M.

### 🔎 QC Contrôleur — Nouvelles zones

> ⚠️ **Rappel contrat (D12/D3) :** ces 4 zones **n'existent pas dans le registre** `laride`. Chacune = nouvelle image (sprite détouré dans la paire `laride_off/on`) + `{id,x,y,w,h}` + relance `build_zone_masks.py`. **Elles supposent une régénération/extension de l'image LA RIDE par Vincent** — ce n'est pas « gratuit ». À trancher par Vincent AVANT dev.

| Zone | Jouable/utile | Web sans usine à gaz | Poids | DA | Pas déjà fait | Cohérent | **Verdict** |
|---|---|---|---|---|---|---|---|
| **6.1** Zinc/bar (barman, phrases) | ✅ perso vivant | ✅ **réutilise `comptoir.js`** (moteur mantras It19) | ✅ léger | ✅ | ✅ | ✅ | **✅ VALIDÉ — meilleur rapport effort (S)** ; version Rive plus tard |
| **6.2** Piste (foule réactive au son) | ✅ réactif | ✅ `canvas` + **WebAudio analyser déjà branché** (VU Émetteur) | ⚠️ léger-moyen | ✅ (stroboscope, billboards) | ✅ | ✅ D13 (réagit au flux) | **✅ VALIDÉ** — la version foule ; le jeu de rythme (DDR) = option L séparée |
| **6.3** Fumoir/sortie (dehors) | ⚠️ ambiance | ✅ collage peint `goto` | ✅ léger | ✅ | ✅ | ⚠️ **piège D12** (voir ci-dessous) | **⚠️ À CADRER** |
| **6.4** Backstage/loge (vocaux) | ✅ collection | ✅ **réutilise pattern `confess`** cathédrale | ✅ léger | ✅ | ✅ | ✅ porte de collection (040) | **✅ VALIDÉ** |

**Pièges techniques signalés :**
- **6.3 — piège D12 (« on ne quitte jamais l'OS/la destination »).** « ressortir devant LA RIDE, le trottoir, le taxi » risque de ressembler à **quitter la boîte** alors que LA RIDE est une scène gigogne DANS Night Drive. Rester **enfant de `laride`** (une salle-panneau de plus, pas un retour au quai) et éviter toute confusion avec « couper le contact ». Correctif : traiter le fumoir comme une **sous-scène intérieure** (même pile, Échap dépile), pas comme une sortie de destination.
- **6.2 — coût réactif.** L'analyser WebAudio existe (VU Émetteur). Le poste à surveiller = **nombre de billboards animés** (sprites danseurs) : plafonner (~10-20) et privilégier des sprites simples, sinon le canvas rame sur machine modeste. Le jeu de rythme DDR calé BPM = **chantier séparé (L)**, ne pas l'embarquer dans la v1 « foule ».
- **6.1 / 6.4 — ✅ réemploi propre.** `comptoir.js` et le pattern `confess` (loop worldsound) sont déjà là → effort réel S/M. Bon ROI, aucun piège.

### 🌐 Références en ligne — Nouvelles zones

- **6.2 Piste — Web Audio Studio** (playground WebAudio, chaque AudioParam devient un contrôle live : modèle pour brancher l'analyser sur les pulsations lumineuses) : https://webaudio.studio/
- **6.2 Piste (jeu de rythme option) — CodePen « Step Sequencer Tone.js »** (grille cadencée au BPM, base d'un DDR calé sur un morceau) : https://codepen.io/jend-codes/pen/eYZgeNL
- **6.1/6.4 Perso vivant — pattern Rive « calque cliquable utile »** (barman/loge en objet animé : idle qui respire, clic = action utile) : https://rive.app/community/files/25774-48147-interactive-sasquatich/

---

## 7. Objets 3D / navigables — où la 3D a du sens dans LA RIDE

D16 pose la **porte 3D cachée** : *manger un objet → bascule en three.js navigable*, piste privilégiée **2.5D billboards** (réutiliser les calques peints comme plans étagés, caméra qui bouge, brouillard). three.js est déjà installé (`src/os/three/Scene3D.svelte`, galerie `/test3d`).

**Où la 3D est justifiée dans LA RIDE :**

- **La piste (6.2) = le meilleur candidat 3D du club.** On mange **une olive / une cacahuète du bar** → bascule : on **se déplace sur le dancefloor en 2.5D**, danseurs = billboards (sprites toujours face caméra), colonnes de son, fumée volumétrique fausse (plans de brouillard), la boule à facettes au plafond. On marche vers le booth, vers le bar, vers les chiottes → chaque approche peut **ré-entrer dans la sous-scène 2D correspondante** (la 3D devient le hub de navigation interne de LA RIDE). C'est le meilleur usage : un club **se traverse**.
- **Rester « PS2 2003 » (règles DA + D16) :**
  - **Billboards/sprites** pour tout ce qui vit (danseurs, barman, videur) — jamais de perso 3D modélisé.
  - **Faible distance de rendu assumée** : le fond du club se perd dans le **brouillard** (plans semi-transparents `--v2000-noir-nuit` + fumée `--v2000-violet-rave`), ce qui masque les limites du monde ET colle à l'ambiance boîte enfumée.
  - **Textures peintes plaquées** (les mêmes webp que le collage 2D), pas de PBR brillant. `image-rendering: pixelated`, buffer interne bas upscalé.
  - **Caméra jamais libre** : déplacement contraint (avancer/tourner façon *OutRun*/couloir), pas de vol libre — cohérent « caméra fixe/discrète » de la DA.
  - **Lumières = sprites additifs** (halos de spots, stroboscope) plutôt que vrais lights coûteux.
- **Entrée/sortie propres (D16) :** on entre par l'objet comestible (petit rituel d'ingestion), on ressort au même endroit en 2D. La 3D est **la récompense cachée**, pas le mode par défaut.
- **Techno.** **three.js** (socle existant) + billboards (PlaneGeometry face caméra) + brouillard `THREE.Fog`. **Poids** moyen (réutilise les webp existants → peu d'assets neufs). **Effort** L (c'est le gros morceau, à faire en pilote une fois les 2D posées).

> **Verdict 3D :** un seul point d'entrée 3D pour LA RIDE = **la piste**, en 2.5D billboards, servant de hub interne. À traiter **après** les sous-scènes 2D (photobooth/tag/friperie/DJ Rive), comme scène pilote de la bascule 3D D16.

### 🔎 QC Contrôleur — 3D (piste 2.5D)

**Verdict : ✅ sur le CADRAGE, ⚠️ sur le TIMING — le gros morceau, à faire en dernier.**
- ✅ **DA tenue** : le Concepteur a bien blindé la DA « PS2 2003 » (billboards jamais 3D modélisée, brouillard `THREE.Fog` qui masque les limites, textures peintes plaquées `image-rendering:pixelated`, caméra contrainte, lumières = sprites additifs). C'est **exactement** la directive DA permanente (« est-ce que ça tournerait sur une PS2 2003 ? »). Rien à recaler côté langage visuel.
- ✅ **Socle existant** : `three.js` installé, `Scene3D.svelte` + `/test3d` déjà là (D16). Réutilise les webp du collage → peu d'assets neufs.
- ⚠️ **Piège 1 — poids réel.** three.js + billboards + brouillard reste le **plus lourd** du lot (bundle three, boucle de rendu permanente). À **isoler derrière la porte comestible** (D16 : on entre par l'ingestion, mode caché) pour ne jamais l'imposer par défaut → tenu par le Concepteur, bon.
- ⚠️ **Piège 2 — dépendance.** La piste 3D suppose **6.2 (foule 2D) faite d'abord** (mêmes sprites danseurs) ET l'ossature 2D de LA RIDE posée (elle sert de hub qui **ré-entre** dans les sous-scènes 2D). → **dernier de la file**, scène pilote de D16, jamais avant les 2D.
- ⚠️ **Piège 3 — perf mobile.** Prévoir un **fallback** (si WebGL absent/faible : rester en 2D). Cohérent D10 (mobile assuré par ailleurs).

### 🌐 Références en ligne — 3D (piste 2.5D)
- **Three.js — `Fog` (doc officielle)** (brouillard qui mange le fond = pilier DA « faible distance de rendu assumée ») : https://threejs.org/docs/#api/en/scenes/Fog
- **Three.js — `Sprite` / billboards (doc officielle)** (plans toujours face caméra : danseurs, barman, videur, sans perso 3D) : https://threejs.org/docs/#api/en/objects/Sprite

---

## 8. Tableau récap

| Zone | Reco | Type | Techno | Poids | Effort |
|---|---|---|---|---|---|
| Photobooth | **1.1** Séance photo (timing + archive auto) | jeu + contenu | CSS-JS + canvas | léger | **M** |
| Vestiaire/friperie | **2.1** Portant à faire glisser | contenu tactile | CSS-JS | léger | **M** |
| Toilettes | **3.1** Mur à taguer (+ 3.2 miroir secret) | jeu + trace | canvas 2D + localStorage | léger | **M** |
| DJ booth (approf.) | **4.1** Platine Rive vue du dessus (D17) | objet Rive + instrument | Rive + audio existant | moyen | **M–L** |
| Cocktails (approf.) | 5.1 Shaker barman *(réserve)* | jeu dosage | CSS-JS + SVG existant | léger | M |
| **+ Zinc/bar** *(nouvelle)* | **6.1** Le barman (phrases) | contenu perso | CSS-JS + `comptoir.js` | léger | **S** |
| **+ Piste** *(nouvelle)* | **6.2** Foule réactive au son | contenu réactif | canvas + WebAudio | léger-moyen | M |
| **+ Fumoir/sortie** *(nouvelle)* | 6.3 Dehors + passe-joint | contenu ambiance | collage peint | léger | M |
| **+ Backstage** *(nouvelle)* | 6.4 Loge secrète (vocaux) | contenu + collection | collage + `loop()` | léger | M |
| **Piste en 3D** | §7 2.5D billboards (hub interne) | 3D navigable | three.js (socle existant) | moyen | **L** |

---

## 9. Short-list « par quoi commencer » (3 sous-scènes, fort impact / effort raisonnable)

1. **Le mur à taguer des toilettes (3.1).** — *Impact max, effort M, zéro dépendance.* Le geste rave/street le plus signature (Jet Set Radio), il crée de la **trace persistante** (le mur vit entre les visites, P0), transforme la zone la plus creuse en la plus mémorable. Bonus quasi-gratuit : glisser le **miroir-secret (3.2)** qui réutilise le moteur de grattage PMU déjà codé.

2. **La séance photo du photobooth (1.1).** — *Impact fort, effort M, se remplit tout seul.* Résout le problème « pellicule vide » sans attendre les images de Vincent (les clichés se composent en jeu), donne un mini-jeu de timing immédiat (règle 040 : jouable en 10 s), et nourrit l'archive de soirée. CSS-JS + canvas, aucune lib.

3. **La platine Rive vue du dessus (4.1, D17).** — *Impact fondateur, effort M–L.* C'est **l'objet Rive canonique de D17** : le livrer débloque le composant `RiveObject` réutilisable pour tout le projet (platines, perso, enseignes), sur un moteur audio **déjà en place** — on ne recâble que le visuel + le scratch. Le meilleur retour sur investissement structurel.

> Ordre conseillé : **3.1 (+3.2) → 1.1 → 4.1**. Les trois sont légers, cohérents DA, réutilisent l'ossature existante, et couvrent les trois natures du projet (expression/trace · jeu+archive · instrument Rive). Les nouvelles zones (zinc, piste, backstage) et la bascule 3D viennent ensuite, une fois ces trois validées par Vincent.

---

## 🧭 VERDICT GLOBAL DU CONTRÔLEUR + ORDRE DE DÉMARRAGE RECOMMANDÉ

*(QC Rôle 3, 095 — 2026-07-06. Proposition solide, ancrée dans l'existant, DA « PS2 2003 » tenue partout, contrats D12–D17 respectés. Recherche en ligne : références réelles et vérifiées par fetch trouvées pour chaque option retenue. 2 conditions de validation et 2 pièges de cadrage à retenir avant dev.)*

### Tableau de synthèse des verdicts

| # | Sous-scène | Verdict | Condition / réserve |
|---|---|---|---|
| **3.1** | Mur à taguer (toilettes) | ✅ | **CONDITION : garde-fou persistance** (traits vectoriels OU PNG downscalé+FIFO, jamais dataURL brut → sinon quota localStorage explosé). Bien dire « mur par visiteur », pas communautaire (pas de backend). |
| **3.2** | Miroir embué (secret) | ✅ | Quasi-gratuit — réutilise `grattage.js`. À glisser avec 3.1. |
| **1.1** | Séance photo (photobooth) | ✅ | Stocker `{seed,date,poses}` et re-render (pas de dataURL en masse). Prévoir crop buste des sprites perso. |
| **4.1** | Platine Rive vue du dessus | ✅ | **Le scratch arrière impose la Web Audio API** (`AudioBufferSourceNode` + buffer inversé), pas `<audio>` (playbackRate négatif interdit). C'est le vrai coût, pas le rig Rive. Objet `RiveObject` fondateur. |
| **4.2** | Sampler/pads (Tone.js) | ✅ | Après 4.1. Passer par le même contexte audio + éjecter l'antenne (D13). |
| **6.1** | Zinc/bar (barman phrases) | ✅ | Meilleur ROI des nouvelles zones (réutilise `comptoir.js`, effort S). **Suppose une extension de l'image LA RIDE.** |
| **6.4** | Backstage/loge (vocaux) | ✅ | Réutilise pattern `confess`. Idem : nouvelle zone = nouvelle image. |
| **6.2** | Piste (foule réactive) | ✅ | Plafonner les billboards (~10-20). Jeu de rythme DDR = chantier L séparé, pas dans la v1. |
| **2.1** | Portant à faire glisser | ✅ | Câbler sur **GSAP `Draggable` + Inertia** (déjà installés), pas de moteur d'inertie maison. |
| **1.3 / 2.3 / 3.3** | Replis / gachapon | ✅ | OK en repli rapide ou bonus tardif. |
| **5.1** | Shaker barman | ✅ *réserve* | D'accord avec le Concepteur : la carte fait déjà le job. Limiter le scope (3-4 gestes). Bonus tardif. |
| **1.2** | Photobooth Rive | ⚠️ **plus tard** | Ne pas créer un 2e `RiveObject` avant que 4.1 ait posé le composant. |
| **2.2** | Cabine d'essayage | ⚠️ **objet** | Le coût est côté **assets** (pièces détourées × zones corps), pas code. Après 2.1. |
| **6.3** | Fumoir/sortie | ⚠️ **à cadrer** | **Piège D12** : « ressortir sur le trottoir » ne doit PAS ressembler à quitter la destination. Le garder **enfant de `laride`** (pile gigogne, Échap dépile). |
| **§7** | Piste en 3D (2.5D) | ✅ cadrage / ⚠️ timing | DA parfaitement tenue. **Dernier de la file** : dépend de 6.2 + ossature 2D. Fallback WebGL. Scène pilote D16. |

**Aucun ❌.** Aucune idée injouable, hors DA, ou usine à gaz. Le Concepteur a systématiquement privilégié le réemploi de l'ossature (`grattage.js`, `comptoir.js`, verre SVG, moteur audio It21, analyser WebAudio, pattern `confess`) — c'est exactement la contrainte « léger/maintenable » du Rôle 1.

### Deux points durs à ne pas oublier (les seules vraies conditions)
1. **Persistance = piège n°1** (3.1 surtout, 1.1 aussi). localStorage a un quota ; sauver des images brutes le sature. → vectoriel/seed/FIFO. **Condition de validation, pas une option.**
2. **Scratch = Web Audio, pas `<audio>`** (4.1). Le scratch arrière (buffer inversé) est le vrai coût de la platine Rive. Le CodePen pimskie donne le moteur clé en main.

### Ordre de démarrage recommandé (je confirme et j'affine celui du Concepteur)

**Vague 1 — impact max, zéro dépendance, réutilise l'existant :**
1. **3.1 mur à taguer (+ 3.2 miroir secret)** — transforme la zone la plus creuse en la plus mémorable, crée de la trace (P0), 3.2 quasi-gratuit via `grattage.js`. *Condition : garde-fou persistance.*
2. **1.1 séance photo** — résout la pellicule vide sans attendre les images de Vincent, jouable en 10 s (040). *Condition : re-render par seed.*

**Vague 2 — l'objet Rive fondateur (débloque tout le reste) :**
3. **4.1 platine Rive** — crée le composant `RiveObject` réutilisable (platines/perso/enseignes), moteur audio déjà là. *Prérequis technique : migrer le deck vers Web Audio pour le scratch.* → puis **4.2 pads Tone.js** enchaîne naturellement.

**Vague 3 — les nouvelles zones à bas coût (après feu vert de Vincent sur l'extension d'image) :**
4. **6.1 zinc/barman** (effort S, `comptoir.js`) puis **6.4 backstage** (pattern `confess`), puis **2.1 portant** (GSAP Draggable).

**Vague 4 — le gros morceau, en pilote :**
5. **6.2 foule réactive** → puis **§7 piste 2.5D** (three.js), scène pilote de la bascule 3D D16, fallback 2D.

> **Reco d'attaque immédiate : 3.1 (+3.2).** Léger, zéro lib, zéro dépendance, réutilise `grattage.js`, impact maximal sur la zone la plus faible. Vincent tranche, puis Intégrateur en worktree isolé (build vert + smoke), puis re-QC code.

---

## 📚 Récapitulatif des références en ligne (toutes vérifiées par fetch)

| Zone | Lien | Prouve quoi |
|---|---|---|
| **4.1 DJ** ⭐ | https://codepen.io/pimskie/pen/bGjMdxV | Scratch temps réel Web Audio, playbackRate = vélocité du drag, buffer inversé — moteur réutilisable |
| **4.1 DJ** | https://wheelsofsteel.net/ | UX platine navigateur complète (disque/bras/pitch draggables) |
| **D17 partout** ⭐ | https://rive.app/community/files/25774-48147-interactive-sasquatich/ | Réf. fondatrice « calque vivant cliquable utile » (fichier réel, CC BY, jan 2026) |
| **2.1 friperie** | https://gsap.com/docs/v3/Plugins/Draggable/ | Drag/toss/inertie (lib déjà installée) |
| **2.1 friperie** | https://tympanus.net/codrops/2022/01/03/building-a-scrollable-and-draggable-timeline-with-gsap/ | Draggable + inertie horizontale, tuto complet |
| **3.1 tag** | https://github.com/Narigo/dripping-spray | Bombe canvas + coulures (game-feel Jet Set Radio) |
| **3.2 miroir** | https://codepen.io/dudleystorey/pen/yJQxLX | `destination-out` scratch-reveal (= moteur `grattage.js`) |
| **1.1 photobooth** | https://www.purrybooth.com/ · https://www.purikura.io/ | Photobooth/strip 100 % navigateur |
| **4.2 pads** | https://codepen.io/jend-codes/pen/eYZgeNL | Grille de pads Tone.js sur one-shots |
| **§7 3D** | https://threejs.org/docs/#api/en/scenes/Fog · https://threejs.org/docs/#api/en/objects/Sprite | Brouillard + billboards (piliers DA « PS2 2003 ») |
