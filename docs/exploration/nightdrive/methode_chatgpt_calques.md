# MÉTHODE — Scènes en calques via ChatGPT (OFF/ON + perso + objets)

> Pipeline de production des scènes Night Drive avec un générateur d'images type
> ChatGPT (GPT-Image / DALL·E). Objectif : à chaque scène, obtenir un **fond OFF**
> + un **fond ON** cohérents, puis des **perso** et **objets** en calques qui se
> posent au bon **axe / perspective / lumière**. Vincent génère → Claude monte/anime
> en local (gratuit). Résumé courant : `000_PROJECT_MEMORY.md`. Ancienne méthode
> Higgsfield : `methode_montage_scene.md` (mêmes principes de calques).

---

## 0. Le principe (rappel)

Une scène = **empilement de calques**, jamais une seule image :

```
fond OFF / fond ON   (décor + objets fixes, éclairage éteint / allumé)
  → perso            (découpés, posés sur le fond)
  → avant-plan (fg)  (objets qui passent DEVANT les perso)
  → zones            (survol / clic)
```

Chaque calque est généré **séparément** puis détouré → on peut l'animer, le déplacer,
l'éclairer indépendamment. **Claude fait tout le montage et le détourage en local,
sans crédit.** ChatGPT sert uniquement à produire les images.

## 1. Règle d'or anti-dérive (à ne jamais oublier)

1. **Une seule image de base par scène.** Le ON est un **relight du OFF** (ou l'inverse) —
   on ne redessine pas, on rallume. Même cadrage, mêmes objets, mêmes positions.
2. **Ne pas enchaîner 10 retouches sur ChatGPT.** Chaque re-génération dérive
   (style, couleurs, objets qui bougent). Si une image est presque bonne : on la garde
   et Claude corrige en local (recadrage, grade, effacement d'un objet, texte).
3. **Le style est verrouillé par un bloc fixe** (§3) collé à CHAQUE prompt.
4. **Perso et objets : fond neutre, plein cadre**, jamais dans la scène (sinon impossible
   à détourer proprement).

---

## 2. La FICHE PHYSIQUE de scène ⭐ (le cœur du système)

Avant de générer une scène, on remplit **une fois** sa fiche physique. C'est elle qui
garantit que les perso/objets se posent au bon axe. Tu la gardes, tu la re-colles à
chaque calque de cette scène.

```
FICHE PHYSIQUE — SCÈNE : <nom>
- Format : 3:2 (paysage). OFF et ON exactement même cadrage/taille.
- Caméra : hauteur de l'œil = <assis / debout / plongée>. Ligne d'horizon à <Y>% de haut.
- Point de fuite : <centre / gauche / droite>, à environ (<x>%, <y>%).
- Sol / plan d'appui : <ex. pont en bois qui monte vers le bas de l'image ; les perso
  sont ASSIS dessus, pieds vers le bas du cadre>.
- Lumière principale (ON) : source à (<x>%, <y>%), couleur <chaude/orangée>, force <forte>.
  → les ombres partent de CE point vers l'extérieur.
- Lumière d'ambiance (OFF) : <froide bleutée, faible, quelques lueurs lointaines>.
- Échelle d'un personnage assis : occupe de Y=<haut>% à Y=<bas>% ; largeur ~<w>%.
- Emplacements perso/objets (où ils posent, à quelle profondeur) :
  · <perso A> : bord <gauche/droit>, assis, tourné vers <sens>.
  · <perso B> : ...
- Palette : tokens --v2000-* (voir 070_VISUAL_LANGUAGE.md).
```

> **Pourquoi ça marche :** en donnant à ChatGPT la ligne d'horizon, le point de fuite,
> la hauteur d'œil et la direction de lumière, il rend le perso vu du **même angle** et
> **éclairé du même côté** que la scène → il s'intègre au lieu de flotter.

---

## 3. BLOC STYLE (à coller à CHAQUE prompt, sans le changer)

```
STYLE (ne pas dévier) : illustration peinte stylisée, look « écran de chargement GTA /
Arcane », contours encrés nets, cel-shading peint, PAS photoréaliste, PAS 3D lisse.
Rétro 1998–2004, PS2 / GTA ancien, nuit basque (Bayonne), néons fatigués, lumière
sodium, image un peu compressée/scannée. Ambiance « jeu culte oublié », jamais
« illustration IA premium ». Couleurs passées, chaudes la nuit (jamais sépia).
```

---

## 4. Les 5 prompts prêts à coller

À chaque fois : **BLOC STYLE (§3) + FICHE PHYSIQUE (§2) + le bloc ci-dessous.**

### 4.1 — FOND OFF (à générer en premier)
```
Génère le DÉCOR de la scène <nom>, version OFF (au repos, la nuit).
Cadrage et perspective = ceux de la fiche physique. AUCUN personnage.
Tout est éteint / faible : <lister les objets fixes et leur état éteint>.
Nuit sombre mais le premier plan reste lisible (légère lumière d'ambiance).
Objets bien séparés les uns des autres (pour le détourage). Format 3:2.
```

### 4.2 — FOND ON (relight du OFF)
> Sur ChatGPT : joins l'image OFF validée et écris « garde exactement cette image,
> même cadrage et mêmes objets, rallume tout ». Ne régénère pas de zéro.
```
Reprends CETTE image (le OFF), ne redessine rien, ne déplace rien.
Version ON : rallume toutes les sources — <lanterne/néons/enseignes/LEDs> —,
clair-obscur marqué, halo chaud là où est la lumière principale, ombres qui
partent de la source. Mêmes objets aux mêmes places. Format 3:2.
```

### 4.3 — PERSONNAGE (un par image, fond neutre)
```
Un seul personnage EN PIED, sur fond neutre uni (gris moyen ou vert franc), silhouette
nette facile à détourer, AUCUN décor. <description identité : traits, tenue, pose>.
Vu à hauteur d'œil selon la fiche (ligne d'horizon <Y>%), tourné vers <sens>.
Éclairage = celui de la scène : lumière <chaude> venant de <côté, x%>, ombre <froide>
de l'autre côté. Même style peint (§3). Cadrage portrait 2:3.
```
> Génère la version **ON** (éclairée). La version **OFF** (froide/sombre) : **Claude la
> fait en local** par color-grading du ON — inutile de la générer.

### 4.4 — OBJET cliquable (un par image, fond neutre)
```
Un seul objet : <nom>, sur fond neutre uni, détouré facile, aucun décor.
Vu sous le même angle que la scène (fiche physique). Deux états si utile : éteint / allumé.
Même style peint (§3). Cadrage serré sur l'objet.
```

### 4.5 — AVANT-PLAN (objet qui passe devant les perso)
```
Un seul objet : <nom>, sur fond neutre, détouré facile. Vu du même angle que la scène.
C'est un élément de PREMIER PLAN (ex. lanterne, rambarde) : lumière et échelle du
tout premier plan. Même style peint (§3).
```

---

## 4bis. VARIANTE ⭐ « perso posé DANS la scène » (perspective + ombre parfaites)

Au lieu de générer le perso sur fond neutre (§4.3), on le fait générer **directement
dans la scène** : on joint le fond `<nom>_on.png` et on demande d'AJOUTER le perso à sa
place. ChatGPT lui donne alors la **vraie perspective, la lumière exacte de la source et
une ombre portée cohérente**. C'est le meilleur rendu.

**Deux règles pour que ce soit exploitable en calque :**
1. **1 perso par image**, et exiger « garde l'image identique, n'ajoute que le personnage ».
   ChatGPT redessine souvent tout le décor → on ne garde PAS son décor, seulement le perso.
2. **Le perso doit être DÉTOURABLE** : Claude le découpe en local. Or un perso **sombre
   adossé à une surface de même ton** (ex. la coque en bois) **fusionne avec le fond et ne
   se découpe pas proprement**. Donc dans le prompt : placer le perso **dans l'ouvert**
   (pas collé à un mur/coque sombre) OU demander un **léger liseré de lumière (rim light)
   qui le sépare du fond derrière lui**. Perso clair sur fond sombre (ou l'inverse) = coupe
   nette.

**Bonus placement gratuit :** comme le perso est généré aux bonnes coordonnées dans une
image 3:2, sa **boîte englobante en %** = directement sa position dans `scenes.js`. Claude
la lit au détourage, aucun recalage à faire.

Prompt type (joindre `<nom>_on.png`) :
```
Garde CETTE image exactement identique — même cadrage, mêmes objets, même lumière, ne
redessine rien. AJOUTE UNIQUEMENT <personnage> assis à <endroit précis>, tourné vers
<sens>. Il est ÉCLAIRÉ PAR <la source> : lumière chaude sur son côté <X>, ombre froide de
l'autre, et une OMBRE PORTÉE douce qui tombe vers <opposé de la source> sur le sol.
IMPORTANT : garde un léger liseré de lumière qui sépare sa silhouette du fond derrière lui
(pour le détourage), et ne le colle pas contre une surface sombre. Style peint GTA/Arcane,
contours encrés, PAS photoréaliste. Ne change AUCUN autre élément.
```

> Retour d'expérience barque : la **punkette** posée dans l'ouvert s'est détourée nickel ;
> le **raver adossé à la coque** était incuttable (dos fondu dans le bois) → on a gardé sa
> version fond-neutre relightée. D'où la règle « dans l'ouvert / rim light ».

---

## 4ter. RÈGLE ⭐ « paquet autonome » (contexte pour ChatGPT ET pour Vincent)

Un ChatGPT vierge n'a **ni image de référence ni idée de la physique** de la scène quand on
colle un prompt. Donc **chaque génération se donne comme un PAQUET complet**, jamais un prompt
seul :

```
PAQUET = 1) CE QU'ON ATTACHE   (l'image de réf : le fond, ou rien si fond vert)
       + 2) LA PHYSIQUE         (le bloc §2 de la scène, recopié)
       + 3) LE PROMPT           (STYLE §3 + la demande)
```

- **Méthode « dans la scène » (§4bis)** : on ATTACHE `<nom>_on.png` + on colle la physique + le
  prompt. Sans l'attache, ChatGPT invente le décor → inutilisable.
- **Méthode « fond vert » (cuttable, §4quater)** : pas d'attache (le perso est isolé), mais le
  prompt DOIT décrire la lumière (de quel côté vient la lanterne) et le style, sinon l'éclairage
  ne collera pas à la scène une fois posé.

Si Claude a des crédits Higgsfield, il peut générer lui-même (il a déjà le contexte) ; sinon il
fournit le paquet complet à coller dans ChatGPT.

## 4quater. FOND VERT ⭐ (la voie fiable pour des calques mobiles nets)

Les perso « dans la scène » sont **sombres sur bois sombre** → indétourables proprement.
Pour des **calques mobiles nets**, on génère chaque perso sur **fond vert uni** (chroma key
`#00b140`) : Claude les détoure au pixel, sans bavure, et les pose/déplace librement.

Le prompt fond vert (autonome) : `personnage en pied, FOND VERT UNI #00b140, aucun décor,
silhouette nette` + `identité` + `pose + sens du regard` + `lumière chaude venant du côté <où
est la lanterne dans la scène>, ombre froide de l'autre, léger liseré de contour` + STYLE §3.
→ dépose en `perso/<nom>_green.png`, Claude fait le reste.

---

## 4quinquies. PERSO VIVANTS ⭐ (jeux de poses + réactions)

Un perso n'est pas un sprite figé : c'est un **jeu de poses** (plusieurs calques fond
vert du MÊME personnage, même lumière, geste différent) que le moteur échange —
au hasard (idle) ou sur événement.

**Modèle (`scenes.js`)** — un perso porte `poses` + éventuellement `idlePoses` :
```js
{ id:'myrtille', name:'Myrtille', x,y,w,h, anim:'lean',
  poses: {
    idle:  '…/perso/punk.png',            // pose par défaut
    radio: '…/perso/myrtille_radio.png',  // quand la boombox joue
    roll:  '…/perso/myrtille_roll.png',   // roule un joint
  },
  idlePoses: ['idle','idle2'] }           // (option) alternance idle aléatoire
```
Fallback garanti : si une pose n'existe pas encore → le moteur reste sur `idle`, rien ne casse.

**Réactions déjà branchées (moteur `NightDrive.svelte`)** :
- **Radio** : `player.playing` → les perso qui ont une pose `radio` s'y mettent (retour idle à l'arrêt).
- **Idle aléatoire** : si `idlePoses.length ≥ 2`, le perso change de pose tout seul (~8 s).
- **Rouler un joint** : une zone avec `open:{type:'roll'}` (ex. le sachet de weed) ouvre un
  mini-prompt « Rouler un joint ? **Myrtille** / **Stick** » → le choisi passe en pose `roll`
  ~6,5 s puis revient. Crossfade doux (`transition:fade`) entre chaque pose.

Ajouter une réaction = 1) générer le sprite de pose (fond vert), 2) l'ajouter dans `poses`,
3) (si nouvel événement) un hook dans le moteur qui fait `personaPose[id] = 'maCle'`.

**Générer une pose** : reprendre le prompt fond vert (§4quater) du perso — MÊME identité,
MÊME sens de lumière — et ne changer que **la ligne du geste** (« il roule un joint entre
ses doigts », « elle danse assise au rythme »…). Nommer `perso/<nom>_<pose>.png`.

**Lévitation (Stick)** : `anim:'levit'` + `shadow:{x,y,w,h}` → le perso monte/descend en
boucle ; l'ombre-plancher est un calque séparé, **max au contact (point bas), effacée au
sommet** (physique juste). Réutilisable pour tout perso « qui flotte ».

### Événement « fumer / souffler un rond » (barque — modèle réutilisable)

Chaîne complète, câblée sur Myrtille :
1. clic sur le sachet (`open:{type:'roll'}`) → mini-prompt « Myrtille / Stick » ;
2. le choisi joue `poses.roll` (séquence) puis **tient `poses.smoke`** (frame « fume ») ~20 s
   (`smoking[id]=true`) ; son `sons/roll_<id>.wav` ;
3. **cliquer le perso pendant qu'il fume** (`onclick` → `personaClick`) → il joue `poses.blow`
   (séquence) puis revient à `smoke` ; son `sons/blow.wav` ;
4. ~500 ms après, un **rond de fumée** (calque `smokeRing`) émane à droite de sa bouche,
   **monte et sort par le haut** (CSS `ring-rise`), en `mix-blend-mode:screen`.

Data (`scenes.js`) : le perso porte `poses:{ idle, roll:[…], blow:[…], smoke }` +
`smokeRing:[frame1…frameN]`. Fenêtre « fume » relancée à chaque taffe.

**Les frames du rond — fond NOIR, screen** (la fumée translucide NE se met JAMAIS sur vert,
le vert transparaît ; sur noir + `screen` le noir disparaît, la fumée garde sa transparence).
Évolution recommandée (≥5-6 frames, style Arcane, gris-blanc + liseré froid, centré) :
naissance (anneau serré + courte queue) → décollage → rotation (ovale, bords qui s'effilochent)
→ expansion (ondule, translucide) → déformation (boucle tordue, filaments) → dissipation
(volutes fantômes). Claude gère la **montée/sortie** en anim ; ChatGPT ne dessine que la
**forme qui évolue**, centrée. Nommer `perso/smoke_ring_1…N.png`.

**Détourage des séquences** : toutes les frames d'un perso (idle + roll + blow) sont
découpées avec la **MÊME bbox commune** (union des alphas) → calage parfait, zéro saut. Les
ronds (noir) sont recadrés sur leur contenu et composités en `screen`.

---

## 5. OÙ et QUAND coller quoi — le déroulé

| Étape | Sur ChatGPT tu colles… | Tu obtiens | Tu déposes dans… |
|---|---|---|---|
| 1 | **STYLE + FICHE PHYSIQUE + prompt FOND OFF** | fond OFF | `scenes/<nom>_off_v1.png` |
| 2 | image OFF + **prompt FOND ON** (relight) | fond ON | `scenes/<nom>_on_v1.png` |
| 3 | **STYLE + FICHE + prompt PERSONNAGE** (× chaque perso) | perso ON | `scenes/perso/<perso>_on.png` |
| 4 | **STYLE + FICHE + prompt OBJET** (× objets à part) | objet | `scenes/objects/<obj>.png` |
| 5 | **STYLE + FICHE + prompt AVANT-PLAN** | fg | `scenes/fg/<obj>_front.png` |

Puis : tu dis à Claude « scène <nom> prête ». **Claude fait le reste en local, gratuit** :
détourage propre, version OFF des perso (grade froid du ON), montage dans `scenes.js`
(positions %, axes, avant-plan, zones), eau animée, build.

> **Règle de dépôt** : télécharge l'image ChatGPT et **dépose le fichier dans le dossier**
> (le copier-coller dans le chat ne le met pas dans le projet). Nomme-le comme la colonne
> de droite.

---

## 6. Nommage & dossiers (contrat stable)

```
public/media/nightdrive/scenes/
  <nom>_off_v1.png / <nom>_on_v1.png     ← fonds (paire, même taille)
  perso/<perso>_on.png                    ← perso détouré (OFF fait en local)
  objects/<obj>.png                       ← objets cliquables détourés
  fg/<obj>_front.png                      ← avant-plan (devant les perso)
  lights/<scene>_<zone>.png               ← sprites de survol (générés par Claude)
```

## 7. Ce que Claude fait en local (0 crédit)

- **Détourage** des perso/objets (grabCut sur fond neutre → PNG transparent).
- **Version OFF des perso** : grade froid + assombri du sprite ON.
- **Flip / recadrage / effacement** d'un objet, **retouche texte** légère.
- **Montage** : `scenes.js` (off/on, `personnages`, `foreground`, `zones` en %).
- **Eau animée** : calque canvas (shimmer/reflets) clipé sur la bande d'eau.
- **QC composite** + `npm run build`.

## 8. Exemple rempli — LA BARQUE (référence)

```
FICHE PHYSIQUE — SCÈNE : barque
- Format : 3:2 (1248×832 / 1536×1024).
- Caméra : assis dans la barque, vue par-dessus la proue. Horizon à ~30% de haut
  (la ville de l'autre côté de l'eau).
- Point de fuite : centre, ~ (50%, 30%).
- Sol : pont en bois qui s'ouvre vers le bas du cadre ; les perso sont ASSIS dessus,
  pieds vers le bas.
- Lumière principale (ON) : lanterne au centre ~ (48%, 55%), chaude orangée, forte
  → ombres rayonnant vers l'extérieur.
- Ambiance (OFF) : bleu nuit froid, faible ; enseignes lointaines à peine allumées.
- Échelle perso assis : Y ~26%→77%, largeur ~17%.
- Emplacements :
  · punkette : bord gauche, assise, tournée/regard vers la lanterne (droite).
  · raver : bord droit, assis en tailleur, tourné vers la lanterne (gauche).
- Objets fixes : boombox (gauche), lanterne (centre, avant-plan), pizza (centre-bas),
  sachet weed. Enseignes fond : LA TAVERNE, LA RIDE, PMU + cathédrale (gauche).
- Palette : --v2000-* (jaune sodium, rouge nuit, violet rave, noir nuit, brun tabac…).
```

**État barque (aujourd'hui) :** fonds OFF/ON v2 refaits et validés (style GTA/Arcane,
LA TAVERNE ajoutée, reflets d'eau corrigés). Raver ON détouré + flippé (`raver_on_v2.png`).
Reste : punkette détourée + montage + eau. Tout le reste = local, 0 crédit.
