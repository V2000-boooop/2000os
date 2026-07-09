# LA RIDE — VESTIAIRE : le jeu d'habillage (dress-up type Sims du raver alien)

> **Rôle :** spec créative du Concepteur (095, Rôle 1) pour le **jeu d'habillage du vestiaire de LA RIDE**, validé dans son principe par Vincent : un **dress-up type Sims / Style Savvy** où l'on habille un **raver / une raveuse alien** en **calques échangeables** (chaque fringue = un calque qu'on pose depuis un portant de vignettes cliquables).
> **Statut :** exploration — Vincent tranche, puis Intégrateur/Contrôleur. Rien n'est codé ici. Vincent prépare l'image du dressing de son côté.
> **Ce doc REMPLACE/ÉTEND** la zone vestiaire proposée dans `laride_sousscenes.md` : l'option 2.1 (portant à faire glisser, contenu-friperie) et l'option 2.2 (cabine d'essayage esquissée) sont **fusionnées et poussées** ici en un vrai jeu d'habillage. 2.1 (le drag de portant) peut survivre comme **geste de navigation dans le rail de vignettes** ; 2.2 devient CE doc en version aboutie.
> **Contraintes tenues :** DA 070 (« PS2 2003 », calques, image compressée, local an 2000) · pattern **calque vivant cliquable utile** (D17, réf. Interactive Sasquatch) · D13 (l'antenne rendue) · D15 (gigogne, Échap dépile) · **méthode perso It32** (génération isolée fond neutre → `remove_background` → nettoyage composante connexe → collage ; perso = hybrides alien peau bleu-violet, raver survêt Firebird/Dr Martens + punkette). Léger, maintenable, réutilise l'ossature (`.nd-room`, `worldsound`, localStorage, sprites perso existants).
> **Date :** 2026-07-06.

---

## 0. Le pitch en une phrase

Clic sur le **vestiaire** → on entre dans une **cabine d'essayage** : au centre, **notre raver alien en pied** (perso en calques) ; autour, un **portant de vignettes** (bucket hats, survêts Firebird, Buffalo, Dr Martens, gants résille…). Clic sur une vignette = la fringue **se pose sur le perso** (swap du calque du slot). On compose une tenue, on la **valide** — et cette tenue **devient notre avatar** pour le reste de la nuit (photobooth, piste, antenne).

C'est le pattern **calque vivant cliquable utile** appliqué à un perso : chaque clic change un calque et sert la scène.

---

## 1. Mécaniques de jeu

### 1.1 Le geste central — clic vignette → swap de slot
Le perso est rendu comme une **pile de calques alignés** (voir §2). Chaque vignette du portant porte une métadonnée `{ slot, variant }`. Clic sur la vignette :
1. remplace le calque du **slot** correspondant par la **variante** choisie (ex. `haut = firebird_rouge`) ;
2. joue un micro-feedback (le perso a un petit sursaut d'idle, un « poc » de cintre, halo bref) ;
3. met à jour l'état de tenue en mémoire (`outfit` : un objet slot→variant).

Un 2e clic sur la vignette déjà active **retire** la pièce (repasse le slot à sa valeur de base / « rien »), pour les slots optionnels (coiffe, lunettes, accessoire).

**Référence VG.** *The Sims 4 — Create-a-Sim* (CAS) : catégories d'habillage, chaque item mixé/matché librement, transitions douces entre slots. *Style Savvy / Style Boutique* (Nintendo) : dress-up pur « mix & match » d'une garde-robe, 12 000 pièces mixables — le modèle exact du « je pioche une pièce, elle s'enfile ».

### 1.2 Navigation entre catégories
Le portant est organisé par **onglets de slot** (Tête · Haut · Bas · Pieds · Accessoires…). On clique un onglet → le rail affiche les vignettes de CE slot. Le rail lui-même se **fait glisser** (drag/molette, inertie) — c'est là qu'on **réutilise le geste 2.1** de `laride_sousscenes.md` (GSAP `Draggable` déjà installé), mais au service du choix de fringue, pas d'une page produit.

### 1.3 « Surprends-moi » (aléatoire)
Un bouton **dé / « SURPRENDS-MOI »** tire une variante au hasard par slot (respecte les slots verrouillés, voir plus bas) → une tenue complète instantanée. Bon pour la découverte, très « poupée flash de l'an 2000 » (on spamme le bouton). Option : **verrou par slot** (cadenas) pour figer une pièce qu'on aime et ne re-randomiser que le reste (repris de CAS / des randomizers de Picrew).

### 1.4 Remise à zéro
Bouton **« à poil / reset »** : repose tous les slots sur la **tenue de base** (le perso nu-ish canon : survêt de base, pieds nus ou Dr Martens de base). Confirmation légère (un clic, pas de modale lourde).

### 1.5 À quoi ça SERT (le point non-gratuit) — 3 usages, 1 recommandé

> Règle d'or 000 : rien de gratuit. La tenue doit **suivre** le joueur et **provoquer** de la matière (P0).

**Usage A ⭐ RECOMMANDÉ — « Ta tenue te suit » (l'avatar de la nuit).**
La tenue validée **devient le perso alien qu'on croise partout dans LA RIDE et Night Drive** : sur la **piste** (6.2, la foule / ton double qui danse), dans le **photobooth** (1.1 : tes 4 clichés te montrent DANS ta tenue), et comme **vignette d'antenne** quand tu émets (D13 : « ce soir, aux platines, toi en survêt Firebird »). C'est le meilleur usage : il **relie** les sous-scènes entre elles (le vestiaire devient le hub d'identité de la nuit), coûte peu (on stocke juste les indices de slots, §5), et sert P0 (le photobooth se remplit de TOI habillé). Cohérent It32 : les perso alien existants deviennent **paramétrables** au lieu d'être figés.

**Usage B — Débloquer / collectionner des pièces (porte de collection, 040).**
Certaines pièces rares (le survêt one-of-one de Vincent, un bob « RAVE EUSKADI », des Buffalo signature) se **débloquent** en jouant ailleurs (finir une bande photo, allumer les 12 cierges, gratter un FDJ gagnant…). Le vestiaire devient une **vitrine de récompenses** — jamais un péage (bonus only, garde-fou 040). Bon complément de A, pas un remplaçant.

**Usage C — Pur bac à sable esthétique (voyage esthétique, 040).**
On habille pour le plaisir, on prend une « photo de tenue » (screenshot compo → va au mur du photobooth). Pas de conséquence. Le plus léger, le moins « utile » — à garder comme **socle minimal** (v1) sur lequel A vient se greffer.

> **Reco : A** (avatar de la nuit) **comme cap**, avec **C comme v1 minimale** (habiller + sauver la tenue) et **B en couche de récompense** ajoutée quand les autres jeux existent. A ne demande, techniquement, que de **lire l'`outfit` sauvé** depuis les autres scènes et rendre le perso avec — donc on peut livrer C d'abord et brancher A incrémentalement.

---

## 2. Structure du perso en calques — LE CONTRAT DE DÉCOUPE

Le perso est une **pile de PNG transparents** empilés dans un **même cadre** (canevas identique) avec un **pivot commun aux pieds** (comme les sprites barque It32 : « pivot aux pieds », idle `perso-breathe`/`perso-sway`). Ordre de calques du fond vers l'avant (z croissant). Chaque slot a une valeur de base + un éventail de variantes rave 1998–2003 crédibles. On prévoit **raver (homme) ET raveuse (femme)** — deux jeux de base, mais **le même contrat de slots** (une fringue unisexe se pose sur les deux si dessinée pour).

### 2.1 Le cadre commun (règle absolue)
- **Canevas identique** pour TOUS les calques (ex. 600×1200 px, perso ~900 px de haut comme les sprites It32 « resize 900px »).
- **Pivot** = milieu-bas (les pieds), pour l'idle et le calage.
- **Même pose** pour toutes les variantes d'un slot (une pose « debout face, léger tailleur/hanche » canon — comme la punkette « sourire au ciel » / raver « en tailleur »). **UNE pose = un contrat.** Changer de pose = refaire tout le jeu → **on fige une seule pose en v1** (voir §7).
- Corps = **hybrides alien** : peau **bleu-violet translucide**, visage ~85 % humain traits allongés (identité It32, D). Les fringues laissent voir la peau bleue aux bras/jambes découverts.

### 2.2 Tableau des slots

| # (z) | Slot | Rôle | Base | Variantes rave 1998–2003 (éventail crédible) | Oblig.? |
|---|---|---|---|---|---|
| 0 | **`base`** (corps + pose) | le perso nu-ish, peau alien bleu-violet, pose figée | corps raver / corps raveuse | (2 corps : H / F ; teinte de peau réglable en bonus) | ✅ toujours |
| 1 | **`bas`** | jambes | jogging de base | survêt **Firebird** (bandes), **Kappa** popper à pressions, cargo camo, jean baggy UKG, mini-jupe + collants résille (F), short cycliste fluo | ✅ |
| 2 | **`pieds`** | chaussures | pieds nus / socquettes | **Dr Martens** montantes, **Buffalo** plateformes, Air Max TN, Reebok Classic, baskets fluo, bottes hi-vis free-party | ✅ |
| 3 | **`haut`** | torse/bras | débardeur de base | veste survêt **Firebird** zippée, **Kappa** shell suit, hoodie jungle, crop-top mesh (F), t-shirt « 2000 IS LOVE », brassière + résille, gilet hi-vis | ✅ |
| 4 | **`mains`** | accessoire mains | rien | **gants résille**, gants sans doigts, bracelets kandi fluo, montre plastique | ⬜ |
| 5 | **`taille`** | ceinture/sac | rien | **banane** en travers, sac à dos mini, chaîne portefeuille, ceinture cloutée | ⬜ |
| 6 | **`tete_cheveux`** | crâne + coupe | crâne alien + coupe de base | **mullet** (raver H), **dread-mohawk** (punkette F, existant It32), rasé + rat-tail, couettes fluo, cheveux gel spikes, chignon crayon | ✅ (fait partie de la tête) |
| 7 | **`coiffe`** | couvre-chef | rien | **bucket hat** (uni / fourrure / camo), casquette rétro, bandana, cagoule légère, headband fluo, capuche (bomber) | ⬜ |
| 8 | **`yeux`** | lunettes/regard | yeux alien nus | lunettes **blade** wrap-around, aviateurs teintées, masque de ski miroir, lentilles blanches (gag alien), yeux fermés « transe » | ⬜ |
| 9 | **`visage`** | déco visage | rien | boucle d'oreille (existant It32), piercing septum, paillettes/gemmes fluo, sifflet/tototte rave, cache-poussière autour du cou | ⬜ |
| 10 | **`accessoire_main`** | objet tenu | rien | **glowstick / bâton lumineux**, bouteille d'eau, éventail, klaxon corne de brume, walkie « V2000 TX » (clin D13) | ⬜ |

**Notes de contrat :**
- Slots **obligatoires** (`base`, `bas`, `pieds`, `haut`, `tete_cheveux`) : ont toujours une valeur → le perso n'est jamais « troué ».
- Slots **optionnels** (`mains`, `taille`, `coiffe`, `yeux`, `visage`, `accessoire_main`) : peuvent être « rien » (calque vide) → toggle on/off.
- **Compatibilité H/F :** beaucoup de pièces sont **unisexes** (bucket hat, Dr Martens, banane, gants résille, glowstick) → dessinées une fois, posées sur les deux bases si le calage est bon. Les pièces genrées (crop-top mesh, mini-jupe) restent affectées à une base. → un flag `bases: ['H','F']` ou `['F']` par variante.
- **Cohérence anti-clip :** le `haut` doit couvrir la jonction du `bas` ; la `coiffe` passe **au-dessus** de `tete_cheveux` mais peut **masquer** la coupe (un bucket bas mange le mullet) → prévoir, pour certaines coiffes, une variante « cheveux écrasés » **ou** accepter le petit clip PS2 (assumé DA « contours mous, pas trop propre »).

### 2.3 Éventail « façon » (pour guider Vincent sur le ton)
- **Firebird / Kappa / shell suit** = la colonne vertébrale (jungle/hardcore : « tracksuits, Nike, sportswear »).
- **UKG** = plus sapé : jean propre, hoodie, trainers everyday, casquette (garage « more fashion-conscious »).
- **Free party** = pratique/hiver : hi-vis, capuche, bottes, cache-poussière (« protection from the elements, cold night air of the British countryside »).
- **Signature Buffalo + bucket fourrure** = les pièces « iconiques » à mettre en avant (« faux fur bucket hat… most recognizable »).

---

## 3. Ce que Vincent doit livrer (spec de prépa image)

### 3.1 Le décor fixe
- **`vestiaire_dressing.png|webp`** — le décor de cabine/dressing **fixe** (miroir, portant, néon d'essayage violet, carrelage, tabouret). Vincent le prépare de son côté (déjà annoncé). C'est le **fond** ; le perso et les vignettes se posent **par-dessus** en calques web. Zone centrale **vide** réservée au perso (aucune fringue peinte dessus). Format DA : compressé, grain, néon fatigué (070).
- Optionnel : **`vestiaire_dressing_on.png`** (variante allumée) si on veut le crossfade off/on du néon d'essayage au survol (cohérent moteur scènes), **non obligatoire**.

### 3.2 Le perso et chaque variante — méthode It32 stricte
Chaque **variante de chaque slot** = **un PNG transparent isolé**, produit par la **méthode perso validée It32** :
1. **génération isolée sur fond neutre** de la pièce **portée par le corps canon dans la pose canon** (le plus sûr : générer le perso complet avec CETTE pièce, pas la pièce à plat — le calage est garanti) ;
2. **`remove_background`** (Higgsfield) ;
3. **nettoyage composante connexe locale** (garder la plus grosse composante de l'alpha, retirer les îlots — comme les « 121 îlots retirés » de la punkette) ;
4. **trim + resize** au canevas commun (ex. 900 px), **même cadre / même pivot** que les autres calques.

> **Astuce de production (réduit drastiquement le coût) :** au lieu d'exporter chaque slot séparément (risque de désalignement), générer le perso **habillé de la variante** sur fond neutre, détourer, puis **découper localement** juste la zone du slot (crop rectangulaire fixe par slot : ex. `pieds` = bande basse, `coiffe` = bande haute). Comme les crops sont **aux mêmes coordonnées** pour toutes les variantes d'un slot, l'alignement est automatique. C'est exactement la logique « crop de `barque_on` + masque » d'It33.

### 3.3 Nommage recommandé
```
public/media/nightdrive/scenes/vestiaire_dressing.webp          (décor fixe)
public/media/nightdrive/perso/dressup/
  base_h.png  base_f.png
  bas_firebird.png  bas_kappa.png  bas_cargo.png  ...
  pieds_drmartens.png  pieds_buffalo.png  pieds_tn.png  ...
  haut_firebird.png  haut_shell.png  haut_2000islove.png  ...
  coiffe_bucket_fourrure.png  coiffe_bucket_camo.png  ...
  yeux_blade.png  mains_resille.png  taille_banane.png  ...
```
Une **vignette** de portant peut être un simple **crop réduit du même PNG** (pas d'asset séparé à produire → 0 coût vignette).

---

## 4. Techno — calques PNG empilés (v1) vs Rive (évolution)

### 4.1 Option A ⭐ RECOMMANDÉE au départ — calques PNG empilés (CSS ou Pixi)
- **Rendu :** N `<img>`/`<div>` absolus superposés (un par slot) dans un conteneur au ratio du perso, OU un **canvas 2D** qui `drawImage` les calques dans l'ordre (le pattern **William Malone** : parts en PNG transparents, `drawImage` couche par couche, `breathe`/`blink` en idle — exactement notre besoin). Swap = changer le `src`/`background-image` du calque du slot. **0 dépendance** en CSS ; **Pixi** (déjà installé) seulement si on veut beaucoup de perso à l'écran (piste) ou des filtres.
- **Idle vivant :** réutiliser `perso-breathe` / `perso-sway` (It32), pivot aux pieds, + halo doux au survol des vignettes. Le calque `yeux` peut cligner (blink CSS/JS).
- **Pourquoi c'est le bon départ :** le perso ici est **surtout statique + idle** (on le regarde, on change ses fringues) — pas besoin de la machine à états d'un vrai perso animé. Léger, débogable, aucun `.riv` à produire, et **ça marche avec exactement les assets It32** (PNG transparents détourés). C'est le socle de tous les dress-up web (William Malone ; hazieon/dressupgame en vanilla JS/CSS).
- **Poids :** léger (N PNG, mais 1 seul perso affiché). **Effort :** M.

### 4.2 Option B — Rive (perso animé/réactif, D17) — la voie d'évolution
Quand on voudra que le perso **danse, réagisse, marche** (piste, avatar vivant), Rive devient le bon outil : c'est **littéralement l'exemple canonique de Rive**, le **Skins Demo** — *« a walking character that changes outfits with every click »*, plusieurs **layers de State Machine** jouées simultanément.

**Découpe Rive (artboard `raver`) :** un groupe par slot, mêmes noms que §2 (`base`, `bas`, `pieds`, `haut`, `coiffe`, `tete_cheveux`, `yeux`, `mains`, `taille`, `visage`, `accessoire_main`), chaque groupe contenant les variantes en calques **on/off (visibilité)**.

**Layers de State Machine (le pattern Skins Demo) :**
- Layer **`idle`** : cycle de respiration / balancement en boucle (comme le walk-cycle du démo).
- Layer **`bounce`** : petit rebond joué à chaque changement de fringue (feedback).
- Un layer **par slot habillable** (`skin_haut`, `skin_bas`, `skin_pieds`, `skin_coiffe`…) : chacun est une **séquence d'états à 1 frame** qui allume/éteint la visibilité de la bonne variante (exactement le « skin layer : sequence of states, timelines are one frame, turning on/off visibility » du démo).

**Inputs (contrat code, D3/D17) :**
- `Number haut` (0..n = variante du slot haut) · `Number bas` · `Number pieds` · `Number coiffe` · `Number yeux` · `Number tete` (idem par slot habillable).
- `Trigger changed` (déclenche le `bounce` de feedback).
- `Boolean dancing` (bascule idle → danse, pour l'usage « avatar sur la piste »).
- `Boolean feminine` (ou 2 artboards `raver_h` / `raver_f`).

**Prérequis / garde-fou :** Rive suppose le composant **`RiveObject`** (pas encore créé — la **platine 4.1** doit rester le premier `RiveObject` fondateur, cf. `laride_sousscenes.md`). Donc **on ne fait PAS le vestiaire en Rive avant que `RiveObject` existe.** Le vestiaire en Rive est un **palier 2**, après la platine, quand on voudra le perso qui danse.
- **Poids :** moyen (un `.riv` à produire). **Effort :** L.

> **Reco techno : partir en A (calques PNG CSS/canvas)** — livrable avec les assets It32, 0 nouveau plumbing. **Évoluer vers B (Rive Skins Demo)** quand (1) `RiveObject` existe (post-platine) et (2) on veut le perso vivant sur la piste. Le **contrat de slots §2 est identique** dans les deux → migrer A→B ne jette aucun travail d'asset.

---

## 5. Sauvegarde de la tenue (légère, plafonnée)

- **On ne sauve JAMAIS d'image.** On sauve uniquement les **indices de slots** : un petit objet
  `outfit = { base:'f', haut:'firebird', bas:'kappa', pieds:'buffalo', coiffe:'bucket_fourrure', yeux:null, mains:'resille', taille:'banane', ... }`.
- **Stockage :** une seule clé localStorage, ex. `v2000.laride.outfit` (+ éventuellement `v2000.laride.wardrobe_unlocked` = liste des pièces débloquées pour l'usage B). Quelques dizaines d'octets. **Aucun quota à craindre** (contraste avec le piège dataURL du mur à taguer / photobooth).
- **Plafond :** un seul `outfit` courant (le « look de la nuit »). Si on veut garder plusieurs looks : **presets plafonnés** (ex. 3 slots de garde-robe max, FIFO) — mais **hors v1**.
- **Lecture cross-scène (usage A) :** photobooth, piste, antenne lisent `v2000.laride.outfit` et **re-rendent** le perso depuis les indices (mêmes PNG). Léger, pas de duplication d'asset.
- **Validation d'existence :** au chargement, ignorer un indice de slot dont le PNG n'existe plus (fallback base) → robuste aux évolutions de garde-robe.

---

## 6. Références en ligne (vérifiées par fetch)

| # | Réf | Prouve quoi | Lien |
|---|---|---|---|
| ⭐ | **Rive — Skins Demo** (blog « animation mixing » + fichier community) | LE pattern cible : perso qui **change d'outfit à chaque clic** via layers de State Machine (idle + bounce + skin-swap 1 frame on/off). Base de l'option Rive §4.2. | https://rive.app/blog/create-rich-interactions-with-animation-mixing · https://rive.app/community/2753-5927-skins-demo/ |
| ⭐ | **William Malone — Create a Game Character (HTML5 canvas)** | Perso **en 6 PNG transparents empilés** (`drawImage` couche par couche) + **breathe/blink** en idle. Le socle exact de l'option A (calques + idle vivant), code réutilisable, licence CC BY-SA. | https://www.williammalone.com/articles/create-html5-canvas-javascript-game-character/1/ |
| ⭐ | **hazieon/dressupgame** (vanilla JS/CSS, démo en ligne) | Dress-up **calques échangeables** 100 % web sans framework (HTML/CSS/JS), démo jouable → preuve de faisabilité légère de la v1. | https://github.com/hazieon/dressupgame · https://moongirl-dressup.netlify.app/ |
| | **The Sims 4 — Create-a-Sim (CAS)** | Modèle de **catégories + mix & match** libre, transitions douces entre slots (mécanique §1). | https://www.ea.com/games/the-sims/the-sims-4/new-player-hub/create-a-sim |
| | **Style Savvy / Style Boutique (Nintendo)** | Le **dress-up mix & match** d'une garde-robe (Wardrobe), 12 000 pièces mixables — modèle du portant de vignettes. | https://nintendo.fandom.com/wiki/Style_Savvy |
| | **Jet Set Radio (graffiti editor / presets)** | Customisation **presets + éditeur** à la DA street 2000 (ton/ambiance du vestiaire, filiation tag de LA RIDE). | https://en.wikipedia.org/wiki/Jet_Set_Radio |
| | **Rive — Skins Demo doc « animation mixing »** (concept layers) | Détail technique des **layers qui se mixent** (skin layer = états 1 frame) → découpe/inputs §4.2. | https://rive.app/blog/create-rich-interactions-with-animation-mixing |
| | **Dazed — « super sharp style of 90s garage and jungle raves »** | Sourcing mode : garage sapé vs jungle sportswear, pièces d'époque (§2.3). | https://www.dazeddigital.com/fashion/article/38864/1/the-super-sharp-style-of-90s-garage-and-jungle-raves |
| | **Red Bull Music Academy — « The Story of UK Garage Fashion »** | Sourcing mode UKG (tracksuits, jeans, hoodies, trainers) — crédibilité des variantes (§2). | https://daily.redbullmusicacademy.com/2019/02/uk-garage-fashion/ |

*(Toutes les URL ci-dessus ont été ouvertes/vérifiées. La réf. fondatrice « calque vivant cliquable utile » du projet — Interactive Sasquatch — reste valable ; le Skins Demo en est la déclinaison « perso habillable ».)*

---

## 7. Poids, effort, et short-list v1

### 7.1 Poids / effort par brique

| Brique | Poids | Effort | Note |
|---|---|---|---|
| Décor dressing fixe (Vincent) | léger (1 webp) | — | Vincent le prépare |
| Perso base H + F (2 PNG) | léger | S (Claude monte) / — (Vincent génère) | méthode It32 |
| Garde-robe **v1 minimale** (~3 variantes × slots oblig.) | léger (12–18 PNG) | M | le poste **assets** est le vrai coût, pas le code |
| Moteur habillage CSS/canvas (option A) | léger | **M** | swap slot + rail + reset + surprends-moi |
| Sauvegarde outfit (localStorage) | négligeable | S | indices de slots, 1 clé |
| Usage A (avatar cross-scène) | léger | S→M | lire l'outfit + re-render dans photobooth/piste (incrémental) |
| Passage Rive (option B, plus tard) | moyen (.riv) | **L** | après `RiveObject` (platine) |
| Garde-robe **complète** (tous slots + H/F + rares) | moyen (50–100 PNG) | **L** | étalé, débloquable (usage B) |

**Le piège n'est pas le code, c'est le nombre d'assets** (comme signalé en 2.2 de `laride_sousscenes.md` : « chaque pièce détourée × chaque zone × cohérence de calage »). D'où la v1 volontairement resserrée ci-dessous, et l'astuce §3.2 (crops fixes par slot pour garantir le calage à moindre effort).

### 7.2 Short-list « v1 minimale jouable » (le strict nécessaire pour un premier proto)

**But de la v1 : habiller le perso et voir la tenue changer, en douceur, avec ce qu'on a déjà (assets It32).**

1. **1 perso, 1 pose figée, 1 genre** pour commencer (le **raver** existant It32, ou la punkette — un seul). Pas de bascule H/F en v1.
2. **4 slots seulement**, tous obligatoires : **`haut` · `bas` · `pieds` · `coiffe`** — les 4 qui changent le plus la silhouette.
3. **3 variantes par slot** (≈ **12 PNG** à produire, méthode It32 + crop fixe §3.2) :
   - haut : Firebird zippé · shell suit Kappa · t-shirt « 2000 IS LOVE »
   - bas : survêt Firebird · jean baggy · cargo camo
   - pieds : Dr Martens · Buffalo · TN
   - coiffe : rien · bucket hat fourrure · casquette
4. **Rendu option A** (calques CSS/canvas empilés, idle breathe réutilisé It32). **0 Rive, 0 nouvelle lib.**
5. **UI mini :** onglets des 4 slots + rail de vignettes (crops des PNG) + bouton **« SURPRENDS-MOI »** + bouton **reset**. Échap dépile (D15).
6. **Sauvegarde :** l'`outfit` (4 indices) en **1 clé localStorage**. Au rechargement, le perso revient habillé.
7. **Utilité v1 (amorce de l'usage A, minimale) :** au « valider », la tenue est **mémorisée** ; **1er branchement concret** = le **photobooth** compose ses clichés avec CE perso habillé (relie deux sous-scènes, sert P0). Le reste de l'usage A (piste, antenne) vient après.

> **Ce qui n'est PAS dans la v1** (pour tenir le budget) : le 2e genre, les slots optionnels (gants/lunettes/banane/accessoire), la garde-robe complète, le déblocage (usage B), et **Rive** (option B). Tout ça se greffe **sans jeter** la v1 (contrat de slots §2 stable).

---

## 8. Renvoi

Ce jeu **remplace/étend** la section « 2. VESTIAIRE / FRIPERIE » de `laride_sousscenes.md`. Une ligne de renvoi y est ajoutée. Vincent tranche (v1 minimale ? garde-robe visée ? usage A/B/C ?), puis Intégrateur (option A d'abord), puis Contrôleur (build + smoke + DA + garde-fou assets/localStorage).
