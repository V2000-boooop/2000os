# TOILETTES (LA RIDE) — scénographie du LIEU

> **Rôle :** travail du Scénographe (095, Réflexe scénographie) — poser les WC de LA RIDE comme un **vrai lieu en perspective**, pas un mur plat. Objectif : que le tag se pose sur **un mur des WC** et **suive la fuite/physique du lieu**, et ouvrir le max de possibilités ludiques/mobiles.
> **Statut :** exploration amont — Vincent tranche, puis Concepteur affine les mécaniques, puis Intégrateur/Contrôleur. **Rien n'est codé ici.**
> **Contraintes tenues :** DA 070 (« PS2 2003 »), D15 (gigogne, Échap dépile), D16 (bascule 3D « manger un objet » = dernier recours), It31→33 (montage en calques, méthode It32 : génération isolée → remove_background → nettoyage composante connexe → collage). Léger, mobile d'abord, réutilise l'ossature (`grattage.js`, `worldsound`, canvas 2D).
> **Existant :** zone `toilettes` de `laride` (`scenes.js`, x88.5/y29/w10.8/h36.5, `open:{type:'toilettes'}`) = aujourd'hui un mur de graffitis CSS **plat** + hook son. Options 3.1 (mur à taguer) / 3.2 (miroir secret) déjà validées QC dans `laride_sousscenes.md`. Ce doc **remplace le mur plat par un lieu en perspective**.
> **Date :** 2026-07-06.

---

## 1. Découpage spatial des WC

On plante un vrai réduit de chiottes de club, vu **depuis la porte d'entrée** (le visiteur « entre » dans les WC — cohérent gigogne D15 : clic zone `toilettes` → on plonge dans la pièce). Cadrage **1 point de fuite** (perspective centrale, façon couloir OutRun / intérieur PS2), le point de fuite légèrement à droite du centre.

### Plans, du plus lointain au plus proche (ordre de profondeur / z-index)

| # | Plan | Rôle spatial | Perspective | Interaction |
|---|------|-------------|-------------|-------------|
| 0 | **Sol carrelé** | plancher, base de la profondeur | carreaux qui fuient vers le point de fuite (lignes convergentes) | dégagé : objets qui tombent/roulent (mégot, capsule, pièce) |
| 1 | **Mur du fond** | fond de cadre, frontal | quasi **de face** (peu de fuite) | secondaire : néon, bouche d'aération, petit tag |
| 2 | **Mur GAUCHE = LE MUR PORTEUR DU TAG** ⭐ | grande surface latérale | **fuit vers le point de fuite** (trapèze : haut qui descend vers le fond, bas qui monte) | **surface de graff principale** (§2) |
| 3 | **Mur DROIT** | surface latérale opposée | fuit symétriquement | lavabo + **miroir** (secret 3.2), sèche-mains, petit distributeur (gachapon 3.3) |
| 4 | **Porte de cabine** (mur gauche, vers l'avant) | volume proche | face inclinée dans la fuite du mur gauche | entrouverte : cuvette entrevue, cachette d'un objet |
| 5 | **Urinoir** (mur droit ou fond) | volume bas proche | posé au sol, dans la fuite | gag son (chasse), cible |
| 6 | **Plafond + néon** | fermeture haute | fuit en trapèze inverse | néon qui grésille (halo qui respire, DA §8) |
| 7 | **Avant-plan** (bord de porte d'entrée, tuyau, poubelle) | cadre proche, `foreground` (It33) | très large, coupé par le cadre | `pointer-events:none`, donne la profondeur ; le clic traverse |

### Le mur porteur du tag (le point dur)

- **Choix : le MUR GAUCHE.** C'est la plus grande surface latérale, la mieux orientée pour lire un graff en biais (le tag « part vers le fond »), et c'est le geste rave signature (Jet Set Radio : on tag un mur **en perspective**, jamais de face).
- **Surface exploitable = un quadrilatère** (les 4 coins du pan de mur, entre plinthe et bandeau du haut, entre l'avant du cadre et le point de fuite). C'est CE quad que le canvas de spray doit épouser (voir §2). Il faut donc que **l'image bake un mur gauche bien lisible, à plat dans sa perspective** (carrelage régulier, pas d'objet qui le mange), pour qu'on puisse mesurer ses 4 coins en % une fois pour toutes.
- Sous le tag du joueur : les **tags pré-écrits de Vincent** (locaux, an 2000) sont déjà peints DANS l'image du mur (RAVE EUSKADI, BAYONNE AFTER, un cœur « 2000 IS LOVE », un numéro au marqueur) → le joueur ajoute par-dessus, la couche vit.

---

## 2. Le tag en perspective — plan technique LÉGER

**Principe : on NE peint PAS en perspective. On peint à plat, on projette le rendu.**
Le canvas 2D de spray reste un rectangle « à plat » (le même moteur que 3.1 : pixel buffer + spray brush + drips). On le **projette sur le quad du mur gauche** avec **une seule `transform: matrix3d(...)` CSS**. Aucun moteur 3D, aucun three.js.

### 2.1 La chaîne (4 étapes)

1. **Canvas de peinture plat** — un `<canvas>` off-screen de taille fixe (ex. 1024×512, ratio du pan de mur « déplié »). Tout le spray, les coulures, le localStorage travaillent dans **cet espace plat, non déformé** (simple, fidèle, le drip tombe droit).
2. **Mesurer les 4 coins du mur** — une fois, en % sur l'image des WC (comme on mesure déjà les zones dans `scenes.js`) : `HG, HD, BD, BG` du pan gauche. Ce sont les 4 coins-cibles du quad en perspective.
3. **Résoudre la matrice** — depuis (rectangle plat du canvas) → (quad des 4 coins), on calcule **la `matrix3d` qui warpe l'un dans l'autre** (transformation projective / DLT — direct linear transform). C'est ~30 lignes de maths, ou une micro-lib (`perspective-transform`, MIT, ~2 Ko) qui sort directement la homographie ; `franklinta.com` donne le calcul exact pour la sortie `matrix3d` CSS. On applique `transform: matrix3d(...)` + `transform-origin: 0 0` sur le conteneur du canvas.
4. **Afficher** — le canvas plat, déformé par la matrice, **remplit pile le pan de mur** et suit sa fuite. `image-rendering: pixelated` (DA PS2). Le mur peint (image de fond) reste dessous ; le canvas de tag est un calque transparent projeté par-dessus.

> Résultat : Vincent peint un tag « droit » avec la souris/le doigt, il apparaît **couché dans la perspective du mur**, coulures comprises. Zéro lib 3D, ~1 `<canvas>` + 1 transform CSS + (option) 1 micro-lib de 2 Ko.

### 2.2 Mapper pointeur → surface du mur (le geste doit rester naturel)

Le doigt touche l'écran **sur le mur déformé** ; il faut convertir ce point vers **l'espace plat du canvas** pour peindre au bon endroit. Deux voies, de la plus simple à la plus exacte :

- **(a) Recommandé — l'inverse de la matrice.** On garde la homographie **inverse** (écran → canvas plat) calculée en même temps que la directe. À chaque `pointermove`, on prend `(clientX, clientY)` relatifs au conteneur, on applique l'inverse → `(u,v)` dans le canvas plat → on spray là. Le geste tombe pile là où le doigt est, même en biais. La lib `perspective-transform` donne `srcPts→dstPts` **et** l'inverse gratis. C'est la vraie bonne méthode et elle reste légère.
- **(b) Repli paresseux (si on veut zéro maths).** On laisse le navigateur faire : le canvas plat est un vrai élément DOM transformé, donc **les `pointer` events arrivent déjà en coordonnées locales du canvas non déformé** (le compositing CSS inverse la transform pour le hit-testing). En pratique `event.offsetX/offsetY` sur le canvas projeté peuvent suffire — à tester ; si le hit-testing 3D est imprécis sur mobile, basculer en (a).

**Mobile :** tactile natif (`pointerdown/move/up`), cibles généreuses (tout le mur est peignable), pression = densité du spray via `event.pressure` si dispo (sinon vitesse du geste, comme le chapitre « Paint Program » d'Eloquent JS). `touch-action: none` sur le canvas pour ne pas scroller en peignant. Poids : négligeable (1 canvas + 1 matrice), tient sur un téléphone modeste.

### 2.3 Verdict three.js (D16) — NON pour le tag

Le tag sur un mur **ne justifie PAS three.js**. Un plan unique + une matrice projective CSS rend exactement l'effet « graff couché dans la perspective », pour ~2 Ko contre le bundle three complet + boucle de rendu permanente. **three.js reste réservé à la bascule D16** (« manger un objet → dancefloor 2.5D navigable », cf. §7 de `laride_sousscenes.md`) — pas ici. Un seul cas ferait pencher vers three.js : si Vincent veut **se déplacer dans les WC** (tourner la tête du mur gauche vers le mur droit, marcher vers la cabine). Ce n'est pas demandé ; si un jour oui, ce serait la **même piste 2.5D billboards** que la piste, pas un tag en 3D.

---

## 3. Autres possibilités ludiques / physiques / mobiles (ne pas concevoir en tunnel)

Liste courte de leviers que le lieu en perspective débloque (à trancher par Vincent / détailler par le Concepteur) :

1. **Le miroir du mur droit (secret 3.2, déjà validé).** Buée à essuyer (scratch-reveal, réutilise `grattage.js`) → un reflet alien une frame, un numéro au rouge à lèvres, un son caché. Quasi-gratuit, se pose sur le lavabo du mur droit.
2. **Objets qui tombent / roulent au sol (physique légère).** Une capsule/pièce/mégot lâchée du distributeur ou de la poche : chute + rebond + roulis vers le point de fuite (petite physique CSS/JS, pas de moteur). Cohérent DA (game-feel « juice »).
3. **Le distributeur mural (gachapon 3.3).** Sur le mur droit : une pièce → une capsule tombe → objet-souvenir aléatoire (sticker, sample, mantra). Bonus, jamais péage (garde-fou 040).
4. **La porte de cabine entrouverte = cachette.** Cliquer la porte → elle s'ouvre (transform dans la fuite du mur), un objet planqué derrière (flyer, un mot, une clé de la loge/backstage 6.4). Micro-secret.
5. **L'urinoir / la chasse = gag sonore.** Cible cliquable → chasse d'eau (son `worldsound`), la sous-basse du club qui traverse la porte (hook `zone_laride_toilettes`). Ambiance cracra assumée.
6. **Néon qui grésille + interrupteur (variante off/on du lieu).** Un interrupteur près de la porte → bascule éteint/allumé de toute la pièce (voir prompt off/on) : dans le noir, seuls les tags fluo ressortent (blacklight rave). Fort game-feel, réutilise le pattern paire off/on du projet.
7. **Trace persistante du mur (P0).** Ce qu'on tag reste (localStorage) — **condition de validation déjà actée** : stocker les **traits vectoriels** `[{x,y,couleur,taille}]` (dans l'espace plat) et re-peindre au chargement, PAS de dataURL brut (quota localStorage). Mur **par visiteur**, pas communautaire (pas de backend, D10 phase 1).

---

## 4. PROMPT(S) D'IMAGE prêts à coller (ChatGPT / outil de Vincent)

Deux images à générer : **la pièce** (fond, en perspective) et — même prompt, variante lumière — la version **allumée/éteinte**. Méthode It32 : viser des surfaces propres et des objets séparables pour détourage ultérieur. Cadrage **3:2** (comme les autres scènes de LA RIDE, `laride_off/on`), ratio à forcer dans l'outil (`3:2`, sinon défaut 3:4).

> Note transposabilité : rédigé pour ChatGPT/DALL·E mais **directement transposable à l'outil de Vincent** (Higgsfield / Nano Banana 2, aspect `3:2` forcé). Si passe par Higgsfield : générer une seule base, puis dériver le OFF/ON en **relight** (peu de passes, rester près de la ref — leçon It32 « chaîner dégrade »).

### 4.1 — PROMPT PRINCIPAL (version ALLUMÉE / "on")

```
Interior of a grimy nightclub toilet room, seen from the entrance doorway, one-point perspective, vanishing point slightly right of center. PS2-era video game look (2003), like Need for Speed Underground / Midnight Club / a forgotten PlayStation 2 game — simple painted textures, strong contrast, saturated night colors, slight JPEG compression, soft mushy edges, NOT modern 3D, NOT photorealistic.

Layout, clearly readable in perspective:
- LEFT WALL: a large, flat, unobstructed tiled wall receding toward the vanishing point — this is the main graffiti wall. Dirty pale-green and off-white square tiles, grout dark with grime. A few faded hand-painted graffiti tags already on it (small, not covering the wall): "RAVE EUSKADI", "BAYONNE AFTER", a heart "2000 IS LOVE", a phone number scrawled in marker. Leave most of the wall empty and legible.
- RIGHT WALL: a sink with a rectangular mirror above it (mirror slightly foggy), a wall-mounted condom/gum vending machine, a grubby hand dryer.
- BACK WALL: frontal, a flickering fluorescent tube, an air vent, one small tag.
- FLOOR: dirty ceramic tiles receding to the vanishing point, wet reflections, a cigarette butt, a bottle cap. Floor kept mostly clear.
- A toilet-stall door on the left, slightly ajar. A urinal near the back-right.
- CEILING: low, buzzing neon light casting a sodium/greenish glow, halo bleeding.

Palette: tired PMU green, off-white, sodium yellow light, deep night blue shadows, a bit of rave violet from a strip light. Colors slightly faded, scanned, compressed. Local, run-down, nocturnal, a little funny and melancholic — a real club bathroom at 3am, not a clean render.

Composition notes: keep the left wall as a clean flat readable plane (for adding graffiti later), keep objects (sink, mirror, vending machine, stall door, urinal, trash) as distinct separable elements with clear silhouettes on their own areas, no object overlapping the left graffiti wall. Grain, faint CRT scanlines, dust and dirt. Aspect ratio 3:2.
```

### 4.2 — VARIANTE ÉTEINTE ("off")

Même prompt, remplacer le bloc lumière/palette par :

```
Version LIGHTS OFF: the same room, exact same framing, same camera, same objects in the same positions — only the light changes. The fluorescent tube is dead/dark, the room lit only by a weak spill of violet/blue club light seeping under the stall door and from the doorway. Surfaces dim, deep blue-black shadows, the fluo graffiti tags on the left wall glow faintly (blacklight feel). Everything else identical. Aspect ratio 3:2.
```

> Cette paire off/on alimente : (a) le lieu allumé/éteint (levier §3.6), (b) le préchargement paire off/on standard du moteur, (c) l'interrupteur. **Exigence It32 :** cadrage/caméra/objets STRICTEMENT identiques entre off et on (seule la lumière change), sinon la superposition casse. Le mur gauche doit rester **le même plan lisible** dans les deux.

### 4.3 — (option) objets séparés à générer isolément (méthode It32)

Si Vincent veut des objets manipulables détourés proprement (distributeur, capsule, mégot), les générer **séparément sur fond neutre** → `remove_background` → nettoyage composante connexe locale → collage `foreground`/`lum`. Prompt type : `"a single [object], PS2 2003 game asset, painted texture, neutral flat grey background, centered, no shadow on floor, 3:2"`.

---

## 5. Références en ligne vérifiées (fetch / recherche)

**Projeter un canvas/rectangle sur un quad en perspective (le cœur du tag §2) :**
- **Computing CSS matrix3d transforms — Francklin Ta** : le calcul exact pour warper un élément (donc notre canvas) sur 4 coins arbitraires et sortir la `matrix3d` CSS (DLT). La ref n°1 pour §2.3. https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
- **`jlouthan/perspective-transform` (JS, MIT, ~2 Ko)** : micro-lib qui prend `srcPts → dstPts` et donne la homographie **et son inverse** (pour le mapping pointeur→mur §2.2a). https://github.com/jlouthan/perspective-transform
- **MDN — `matrix3d()`** : la fonction CSS (4×4, column-major) qu'on applique au conteneur du canvas. https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/matrix3d

**Scènes/pièces en perspective CSS 3D (le lieu §1) :**
- **Codrops — 3D Image Gallery Room** : une pièce à 4 murs et coins en pur CSS 3D transforms — modèle de « lieu » plutôt qu'image plate. https://tympanus.net/codrops/2013/01/15/3d-image-gallery-room/
- **David DeSandro — Intro to CSS 3D transforms (Perspective)** : les bases `perspective`/`transform-origin`, indispensable pour poser un plan de mur qui fuit. https://3dtransforms.desandro.com/perspective

**Spray canvas + coulures + parallax profondeur (game-feel §2 / §3) :**
- **Eloquent JavaScript — « A Paint Program »** : spray canvas, densité de points selon la vitesse du pointeur (base légère du pinceau). https://eloquentjavascript.net/2nd_edition/19_paint.html
- **`Narigo/dripping-spray`** : bombe canvas + coulures qui restent — le game-feel tag Jet Set Radio. https://github.com/Narigo/dripping-spray
- **Creative Bloq — mouse-controlled parallax background** : calques à profondeurs différentes suivant le pointeur (pour donner de la profondeur aux plans des WC sans 3D). https://www.creativebloq.com/how-to/create-a-mouse-controlled-parallax-background-effect

**Miroir secret (3.2, quasi-gratuit) :**
- **CodePen — Scratch Reveal `<canvas>` (Dudley Storey)** : `globalCompositeOperation = destination-out`, exactement le moteur `grattage.js` réutilisé pour essuyer la buée. https://codepen.io/dudleystorey/pen/yJQxLX

---

## 6. Récap pour Vincent

| Point | Reco |
|---|---|
| **Le lieu** | réduit de WC vu de la porte, 1 point de fuite ; mur gauche = surface de tag, mur droit = lavabo/miroir, fond frontal, sol dégagé, cabine + urinoir |
| **Le tag en perspective** | canvas plat → `matrix3d` sur les 4 coins du mur gauche ; pointeur mappé par homographie inverse. **~2 Ko, pas de three.js.** |
| **Persistance** | traits vectoriels en localStorage (pas de dataURL), mur par visiteur |
| **Bonus lieu** | miroir secret (3.2), objets qui tombent, gachapon, cabine-cachette, gag urinoir, interrupteur off/on (blacklight) |
| **Images** | paire off/on 3:2, mur gauche lisible et vide, objets séparables (prompts §4) |
| **3D (D16)** | non pour le tag ; réservé à la piste 2.5D |
