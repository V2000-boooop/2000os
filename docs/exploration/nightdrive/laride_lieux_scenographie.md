# LA RIDE — scénographie de TOUS les lieux (le club en profondeur)

> **Rôle :** travail du Scénographe (095, Réflexe scénographie) — poser CHAQUE lieu de LA RIDE comme un **vrai lieu en perspective** (pas une image plate), avec ses **surfaces exploitables** et un **prompt d'image prêt à coller**. Objectif : outiller la génération des décors AVANT l'image.
> **Statut :** exploration amont — Vincent tranche, puis Concepteur affine les mécaniques, puis Intégrateur/Contrôleur. **Rien n'est codé ici.**
> **Contraintes tenues :** DA 070 (« PS2 2003 », calques, image compressée, local an 2000, grain/scanlines/contours mous) · D15 (gigogne, Échap dépile) · D16 (bascule 3D « manger un objet » = dernier recours, réservée à la piste) · It32 (montage en calques : génération isolée fond neutre → `remove_background` → nettoyage composante connexe → collage) · perso = **hybrides alien peau bleu-violet translucide** (Myrtille la punkette `myrtille_idle.webp`, Stick le raver `raver.webp`). Mobile d'abord, léger.
> **Cohérence inter-lieux :** un SEUL club, une seule nuit, une seule DA. Tous les lieux partagent : carrelage/béton fatigué, néon sodium/violet, brouillard de boîte, tags aux murs, mêmes perso alien. Cadrage **3:2** partout (comme `laride_off/on`).
> **Modèle de qualité :** `toilettes_scenographie.md` (déjà fait, ne pas refaire) — même niveau de détail attendu, même méthode « surface porteuse + prompt autoportant ».
> **Date :** 2026-07-06.

---

## 0. Inventaire des lieux (source : `laride_sousscenes.md` + `scenes.js`)

| Lieu | Zone `scenes.js` | Décor à imager ? | Traité ici |
|---|---|---|---|
| **Toilettes** | `toilettes` (existe) | ✅ | **DÉJÀ FAIT** → `toilettes_scenographie.md` |
| **Vestiaire (dressing/habillage)** | `vestiaire` (existe) | ✅ décor fixe + zone perso | §1 |
| **Photobooth** | `photobooth` (existe) | ✅ cabine intérieure | §2 |
| **Backstage / loge** | 6.4 (nouvelle) | ✅ | §3 |
| **Piste / dancefloor** | 6.2 (nouvelle) | ✅ | §4 |
| **Zinc / comptoir barman** | 6.1 (nouvelle) | ✅ | §5 |
| **Fumoir / sortie** | 6.3 (nouvelle) | ✅ | §6 |
| **Cocktails / carte** | `tableau` (existe) | ❌ overlay UI | *voir §7 (pas de prompt)* |
| **DJ booth** | `djbooth` (existe) | ❌ overlay UI + objet Rive | *voir §7 (pas de prompt)* |

> **Écartés (overlay UI sans décor)** : la **carte des cocktails** (`tableau` → verre SVG animé + fiches, pas un lieu) et l'**UI du DJ booth** (`djbooth` → 2 CDJ + crossfader, plein cadre d'instrument, l'objet Rive canonique 4.1 est riggé, pas un décor peint). Mentionnés §7, aucun prompt.

Rappel moteur (070 §11) : fond fixe en paire **off/on** `.webp` dans `public/media/nightdrive/scenes/` ; objets détourés en `.png` transparent dans `.../scenes/lights/`. Ci-dessous je conseille des noms en `_on_v1.png` / `_off_v1.png` selon la convention paire du registre.

---

## 1. VESTIAIRE — la cabine d'essayage (décor du jeu d'habillage)

*Zone existante `vestiaire`. Devient le **jeu d'habillage** (`laride_vestiaire_habillage.md`) : perso alien en pied au centre, portant de vignettes autour. Le décor est FIXE ; le perso et les vignettes se posent par-dessus en calques web.*

### Découpage spatial
- **Cadrage frontal léger 3/4** (on fait FACE à la cabine, comme devant un miroir). Point de fuite bas et central, faible fuite : le décor doit rester lisible et plat, c'est un **fond de scène**, pas un couloir.
- **Plan 0 — sol** : estrade/carrelage de cabine, un tabouret bas, tapis usé. Dégagé au centre.
- **Plan 1 — mur du fond** : le **grand miroir de cabine** (cadre chromé mat, glace un peu piquée/tachée) qui occupe le centre — c'est là que « se reflète » le perso. Néon d'essayage violet au-dessus.
- **Plan 2 — mur gauche** : le **portant chromé** avec cintres fil de fer et fringues suspendues (Firebird, shell suits, bucket hats) — décoratif, le vrai portant jouable est en vignettes web.
- **Plan 3 — mur droit** : étagères à chaussures (Buffalo, Dr Martens, TN), une caisse/comptoir, étiquettes carton kraft.
- **Zone centrale VIDE réservée au perso** (règle absolue `laride_vestiaire_habillage.md` §3.1) : **aucune fringue peinte sur le perso**, aucun mannequin — le raver alien en pied s'affiche là en calques PNG.
- **Possibilités ludiques :** (a) miroir = surface de rendu du perso (le perso EST « le reflet ») ; (b) portant peint gauche = accroche visuelle vers le rail de vignettes web ; (c) néon violet off/on au survol (crossfade de la paire).

### Prompt d'image (prêt à coller)
```
Interior of a nightclub changing room / dressing booth, seen frontally (as if standing in front of the fitting mirror), slight 3/4 angle, low central vanishing point, shallow perspective so the walls stay flat and readable. PS2-era video game look (2003), like a forgotten PlayStation 2 game — simple painted textures, strong contrast, saturated night colors, slight JPEG/WebP compression, soft mushy edges. NOT modern 3D, NOT photorealistic, NOT a clean render.

Layout, clearly readable:
- CENTER BACK WALL: a large full-length fitting mirror in a matte chrome frame, the glass slightly spotted and smudged. Keep a WIDE EMPTY central floor area in front of the mirror — nothing standing there, no mannequin, no person (a character sprite will be placed there later in code).
- LEFT WALL: a chrome clothes rail crammed with second-hand rave clothes on wire hangers — tracksuit tops (Adidas-Firebird style, Kappa shell suits), a fluffy bucket hat, a mesh top. Handwritten kraft-cardboard price tags.
- RIGHT WALL: shelves of chunky shoes (Buffalo platforms, Dr Martens boots, Nike TN-style trainers), a low counter/crate, a small stool.
- CEILING: a tired purple/violet fitting-room strip light, buzzing, casting a soft rave-violet glow with a faint halo.
- FLOOR: worn tiles / a grubby rug, a bottle cap, dust.

Palette: matte chrome, tired PMU green, kraft brown, off-white, rave violet from the strip light, deep night-blue shadows. Colors slightly faded, scanned, compressed. Local, run-down, nocturnal, a little funny and melancholic.

Composition notes: keep the CENTER in front of the mirror completely clear and empty (reserved for a character). Keep the clothes rail, shoe shelves, stool, counter as distinct separable elements with clear silhouettes, no object overlapping the central empty zone. Grain, faint CRT scanlines, dust and dirt. Aspect ratio 3:2.
```

### Nom de fichier conseillé
`vestiaire_dressing_off_v1.png` + `vestiaire_dressing_on_v1.png` (off = néon violet éteint/faible, on = néon allumé, cadrage strictement identique). Drop : `public/media/nightdrive/scenes/`.

### Note technique légère
Aucune projection perspective (surface frontale). Le perso alien se pose **en calques PNG empilés** (option A du doc habillage) dans la zone centrale vide, pivot aux pieds ; le miroir peut recevoir un léger overlay « reflet » (opacité réduite) mais non requis en v1. Prévoir la zone centrale mesurée en % (comme les zones `scenes.js`) pour caler le perso.

---

## 2. PHOTOBOOTH — la cabine à rideau (vue intérieure)

*Zone existante `photobooth`. Devient la **séance photo** (`laride_sousscenes.md` §1.1) : on entre dans la cabine, rideau qui se ferme, 4 flashs, la bande sort. Le décor est l'INTÉRIEUR de la cabine.*

### Découpage spatial
- **Cadrage frontal serré** : on est ASSIS dans la cabine, face à l'objectif/écran. Boîte exiguë, 1 point de fuite quasi nul (huis clos intime).
- **Plan 0 — banquette/tabouret** : le siège bas où l'on pose (avant-plan bas, coupé par le cadre).
- **Plan 1 — mur du fond = la façade de l'appareil** : un **panneau frontal** avec l'objectif (rond noir cerclé), l'**ampoule de flash** (dôme dépoli), un petit écran cathodique de prévisualisation vert, un bouton rouge « START ». C'est la surface porteuse : le flash claque là.
- **Plan 2 — rideau rouge** : sur les côtés/en haut, le **rideau velours rouge** (`--v2000-rouge-nuit`) qui encadre et peut « se fermer » (calque animable).
- **Plan 3 — fente de tirage** : côté du panneau, la **fente** d'où sort la bande de 4 photos.
- **Possibilités ludiques :** (a) rideau = calque off/on (ouvert/fermé) ; (b) ampoule flash = surface de flash CSS blanc surexposé ×4 ; (c) fente = point d'éjection de la bande composée en canvas (les 4 clichés du perso habillé, cf. usage A du dressing) ; (d) écran vert = petit compte à rebours « 3·2·1 ».

### Prompt d'image (prêt à coller)
```
Interior of a nightclub photo booth (purikura / Print Club style), seen from inside as if sitting on the stool facing the camera panel, cramped intimate box, almost no perspective depth, frontal. PS2-era video game look (2003), forgotten PlayStation 2 game — simple painted textures, strong contrast, saturated colors, slight JPEG/WebP compression, soft edges. NOT modern 3D, NOT photorealistic.

Layout, clearly readable, frontal:
- BACK PANEL (the machine face): a black camera lens ring in the center, a frosted flash bulb dome above it, a small green CRT preview screen, a big red "START" button, a coin slot, small worn instruction stickers ("SOURIEZ", "4 POSES"). Keep these as distinct separable elements.
- A print SLOT on the side of the panel where a photo strip comes out.
- SIDES / TOP: heavy red velvet curtain framing the booth, slightly worn, folds visible — leave it as a clean separable layer (it will open/close in code).
- FOREGROUND BOTTOM: a low padded stool / bench seat, cropped by the frame.
- Lighting: dim, intimate, a warm bulb glow, deep red from the curtain, a bit of violet spill.

Palette: deep velvet red, black, frosted white bulb, sodium warm glow, night-blue shadows, a touch of rave violet. Faded, scanned, compressed, grainy. Cheap, nostalgic, a bit magical — a real club photo booth at 3am.

Composition notes: keep the camera panel flat and frontal and readable; keep the flash bulb, lens, preview screen, START button, print slot and the red curtain as DISTINCT SEPARABLE elements with clear silhouettes for later cut-out (flash flashes, curtain opens/closes, strip ejects from the slot). Grain, faint CRT scanlines. Aspect ratio 3:2.
```

### Nom de fichier conseillé
`photobooth_int_off_v1.png` (rideau ouvert, flash éteint) + `photobooth_int_on_v1.png` (rideau fermé / flash chargé), cadrage identique. Drop : `public/media/nightdrive/scenes/`. Objets détourés éventuels (rideau, ampoule) en `.../scenes/lights/`.

### Note technique légère
Pas de perspective à projeter. La **bande de 4 photos** est composée en `canvas` 2D (portrait du perso habillé + fond + date + grain) et « sort » de la fente — animation CSS de translation. Le flash = overlay blanc plein cadre en opacité pulsée ×4.

---

## 3. BACKSTAGE / LOGE — la planque privée (secret)

*Nouvelle zone (6.4). Porte « PRIVÉ » derrière le booth → la loge : setlists au mur, flight-case, dictaphone qui boucle des vocaux de Vincent (pattern `confess`). Porte de collection (040).*

### Découpage spatial
- **Cadrage 1 point de fuite léger**, vue depuis la porte (on entre dans un réduit encombré, cohérent gigogne D15).
- **Plan 0 — sol** : moquette usée / gaffer au sol, câbles, une caisse.
- **Plan 1 — mur du fond** : **mur de setlists scotchées**, flyers rave punaisés, un miroir d'artiste cerné d'ampoules (dont la moitié grillée), post-its.
- **Plan 2 — mur gauche** : un **flight-case** ouvert (mousse découpée, un micro, un casque), une penderie de scène.
- **Plan 3 — mur droit / table** : une **table de loge** avec un **dictaphone/répondeur** (la cassette qui tourne = surface porteuse du `loop()` vocaux), un cendrier plein, des canettes, un briquet.
- **Possibilités ludiques :** (a) dictaphone = clic → boucle vocale (worldsound) ; (b) mur de setlists = objets survolables (légendes griffonnées) ; (c) flight-case = cachette d'un objet-souvenir (sticker, sample) ; (d) miroir à ampoules = halo qui grésille off/on.

### Prompt d'image (prêt à coller)
```
Interior of a small cramped nightclub backstage dressing room / green room, seen from the doorway, one-point perspective, vanishing point near center. PS2-era video game look (2003), forgotten PlayStation 2 game — simple painted textures, strong contrast, saturated night colors, slight JPEG/WebP compression, soft mushy edges. NOT modern 3D, NOT photorealistic.

Layout, clearly readable in perspective:
- BACK WALL: covered in taped-up setlists, pinned rave flyers, post-its, a phone number scrawled on the wall. A vanity mirror framed by round bulbs, half of them dead. Small handwritten notes.
- LEFT WALL: an open black flight-case with cut-foam holding a microphone and headphones, a stage clothes rack.
- RIGHT SIDE / TABLE: a cluttered dressing table with an old dictaphone / answering-machine with a visible cassette, a full ashtray, beer cans, a lighter, a half-eaten sandwich.
- FLOOR: worn carpet, gaffer tape, cables, a road case.
- Lighting: warm dim bulbs from the vanity mirror, a bit of violet club light bleeding through the door behind, deep shadows.

Palette: warm bulb yellow, black flight-case, tired brown carpet, off-white paper notes, rave violet spill, night-blue shadows. Faded, scanned, compressed, grainy. Private, intimate, a little sacred and messy — the secret room of the club.

Composition notes: keep the dictaphone/cassette, the flight-case, the vanity mirror, the setlist wall as DISTINCT SEPARABLE elements with clear silhouettes for later cut-out. Text on flyers/setlists in the spirit of "RAVE EUSKADI", "BAYONNE AFTER", "V2000 TX" — never repeat the same text twice. Grain, faint CRT scanlines, dust. Aspect ratio 3:2.
```

### Nom de fichier conseillé
`backstage_off_v1.png` + `backstage_on_v1.png` (off = ampoules du miroir éteintes, on = allumées + halo). Drop : `public/media/nightdrive/scenes/`.

### Note technique légère
Rien de spécial. Dictaphone = zone cliquable → `loop()` worldsound (pattern `confess`). Nouvelle zone = nouvelle image + `{id,x,y,w,h}` + relance `build_zone_masks.py`.

---

## 4. PISTE / DANCEFLOOR — le cœur du club (foule réactive au son)

*Nouvelle zone (6.2). Plein cadre sur la piste : la foule alien qui danse au tempo du flux D13, lumières qui pulsent au son (WebAudio analyser déjà branché), stroboscope. Candidat n°1 de la bascule 3D D16 (§7 de `laride_sousscenes.md`).*

### Découpage spatial
- **Cadrage 1 point de fuite frontal**, vue depuis le bord de la piste vers le fond (le DJ booth au loin, en haut). Profondeur assumée mais **fond mangé par le brouillard** (DA « faible distance de rendu »).
- **Plan 0 — sol de piste** : dalles réfléchissantes / damier lumineux, reflets des spots, dégagé (où « danse » la foule).
- **Plan 1 — la foule** : silhouettes de perso alien de dos/profil, **billboards** (sprites toujours face caméra) — décor peint pour le fond, sprites animés web par-dessus (plafonner ~10-20).
- **Plan 2 — mur du fond / scène** : podium du DJ au loin, colonnes de son (line-array), un **mur de LED** ou un backdrop tendu, fumée volumétrique fausse.
- **Plan 3 — plafond** : **boule à facettes** (mirror ball), rampe de spots/lyres, stroboscope. Surfaces porteuses des halos additifs pulsés au son.
- **Avant-plan** : une tête de danseur floue coupée par le cadre, un verre levé (`pointer-events:none`, profondeur).
- **Possibilités ludiques :** (a) spots/mirror ball = halos additifs pilotés par l'analyser WebAudio (pulsent au beat) ; (b) stroboscope = flash plein cadre synchronisé ; (c) foule = billboards animés en boucle ; (d) option jeu de rythme DDR calé BPM (chantier L séparé) ; (e) une **olive/cacahuète du bar comestible** ici = porte D16 vers la version 2.5D navigable.

### Prompt d'image (prêt à coller)
```
Interior of a packed nightclub dancefloor at peak time, seen from the edge of the floor looking toward the DJ stage at the back, one-point perspective, the far background lost in smoke/fog. PS2-era video game look (2003), forgotten PlayStation 2 game — simple painted textures, strong contrast, deeply saturated rave colors, slight JPEG/WebP compression, soft mushy edges, low render distance assumed (fog eats the back). NOT modern 3D, NOT photorealistic.

Layout, clearly readable:
- FLOOR: a reflective illuminated dancefloor (light-up tiles / checker), wet reflections of the spotlights, mostly clear.
- CROWD: silhouettes of dancing people seen from behind/side, kept as a painted mass toward the mid-ground (animated sprite dancers will be added over this in code — keep the crowd fairly low and simple so sprites sit on top).
- BACK: a raised DJ stage far away with speaker stacks (line-array), a small LED/backdrop wall, columns of light. The very back dissolves into violet fog.
- CEILING: a mirror ball, a truss of moving-head spotlights and lasers, a strobe. Spotlight beams cutting through the haze as soft additive glows.
- Volumetric fake smoke/fog filling the lower back of the floor, violet and blue.

Palette: rave violet, electric blue, hot magenta and green laser accents, deep night-black, sodium spill. Colors saturated but faded/compressed, scanned. Loud, hot, euphoric, a little blurry — a real sweaty club at 3am, PS2-game version.

Composition notes: keep the spotlight halos, mirror ball, strobe and speaker stacks as DISTINCT SEPARABLE glowing elements (their light will pulse to sound in code). Keep the floor and the crowd mass simple so animated dancer sprites can be layered on top. Grain, faint CRT scanlines, heavy haze. Aspect ratio 3:2.
```

### Nom de fichier conseillé
`piste_off_v1.png` (spots éteints / faibles, lumières calmes) + `piste_on_v1.png` (plein feux, mirror ball + spots allumés). Drop : `public/media/nightdrive/scenes/`. Danseurs billboards détourés (méthode It32, dérivés des perso alien) → `.../scenes/lights/` ou `.../perso/`.

### Note technique légère
Halos des spots/mirror ball/strobe = calques additifs (`mix-blend-mode: screen`) dont l'opacité est pilotée par l'**analyser WebAudio** (déjà branché sur le VU Émetteur). Danseurs = billboards sprites (plafond ~10-20, sinon rame mobile). **Point d'entrée 3D unique** de LA RIDE (D16) : la même image sert de fond au hub 2.5D billboards plus tard — à traiter en dernier, après l'ossature 2D.

---

## 5. ZINC / COMPTOIR — le barman alien

*Nouvelle zone (6.1). Face au zinc : le barman (perso alien) lâche une phrase de comptoir (réutilise `comptoir.js` du PMU), sert un verre, propose le cocktail du soir. Passerelle vers la carte (`tableau`). Meilleur ROI des nouvelles zones (effort S).*

### Découpage spatial
- **Cadrage frontal léger 3/4** : on est un client accoudé, face au comptoir. Le zinc barre le cadre en avant-plan bas.
- **Plan 0 — le zinc** : comptoir en zinc/inox rayé, en avant-plan, où l'on pose les coudes (avec un cendrier, un dessous de verre, une soucoupe de cacahuètes/olives — la **cacahuète comestible** porte D16).
- **Plan 1 — le barman alien** : DERRIÈRE le zinc, torse visible, peau bleu-violet translucide (cohérent perso It32), qui essuie un verre. Zone centrale — surface porteuse des phrases (bulle) et de l'animation.
- **Plan 2 — l'arrière-bar** : **étagère à bouteilles** rétro-éclairée (néon), miroir de bar piqué, la caisse enregistreuse, une TV cathodique muette, l'ardoise « COCKTAIL DU SOIR ».
- **Plan 3 — accroches** : tireuse à bière, verres suspendus, guirlande, sticker « LA RIDE ».
- **Possibilités ludiques :** (a) barman = clic → phrase (`comptoir.js`) + « il sert un verre » ; (b) ardoise = passerelle vers la carte cocktails ; (c) soucoupe de cacahuètes = objet comestible (porte D16) ; (d) étagère à bouteilles = néon off/on ; (e) sound design verres/glaçons/brouhaha.

### Prompt d'image (prêt à coller)
```
Interior of a nightclub bar counter, seen frontally from a customer's point of view leaning at the bar, slight 3/4 angle, the zinc counter running across the lower foreground. PS2-era video game look (2003), forgotten PlayStation 2 game — simple painted textures, strong contrast, saturated night colors, slight JPEG/WebP compression, soft mushy edges. NOT modern 3D, NOT photorealistic.

Layout, clearly readable:
- FOREGROUND: a scratched zinc/steel bar counter running across the bottom of the frame, with a full ashtray, a beer mat, and a small dish of peanuts/olives on it (keep the dish as a separable little element).
- CENTER, BEHIND THE COUNTER: leave the central area behind the bar OPEN for a bartender (a character sprite will be placed there in code) — do not paint a person, keep it clear, just the back of the counter and a bar towel.
- BACK BAR: a retro backlit shelf of liquor bottles glowing with neon, a spotted bar mirror, an old cash register, a silent CRT TV, a chalkboard reading "COCKTAIL DU SOIR". A beer tap, hanging glasses, a bit of tinsel, a small "LA RIDE" sticker.
- Lighting: warm bottle-shelf neon, a green tired bar light, violet spill from the club behind, deep shadows.

Palette: scratched steel/zinc, warm amber bottles, tired PMU green, rave violet, off-white, night-blue shadows. Faded, scanned, compressed, grainy. Local, lived-in, nocturnal, a little funny — a real basque club bar at 3am.

Composition notes: keep the central area behind the counter clear (reserved for a bartender sprite). Keep the bottle shelf, cash register, CRT TV, chalkboard, beer tap and the peanut dish as DISTINCT SEPARABLE elements with clear silhouettes for later cut-out. Text on chalkboard/stickers in the spirit of the local an-2000 rave world, never repeated. Grain, faint CRT scanlines, dust. Aspect ratio 3:2.
```

### Nom de fichier conseillé
`zinc_off_v1.png` (étagère bouteilles éteinte) + `zinc_on_v1.png` (néon d'étagère allumé + halo). Drop : `public/media/nightdrive/scenes/`. Barman alien détouré (It32, dérivé perso) → `.../perso/` ou `.../scenes/lights/`.

### Note technique légère
Zone centrale derrière le zinc mesurée en % pour caler le sprite barman (calque PNG, idle qui essuie un verre, option Rive plus tard). Phrases = `comptoir.js` réutilisé. Cacahuète = objet comestible (D16).

---

## 6. FUMOIR / SORTIE — dehors, la nuit (ambiance + passe-joint)

*Nouvelle zone (6.3). Le coin fumeur / la porte de sortie : le videur, un cendrier sur pied, l'enseigne rouge vue d'en bas, le taxi qui attend. Peut porter le passe-joint (mécanique perso alien de la barque). **Piège D12** : rester ENFANT de `laride` (sous-scène intérieure/annexe, pile gigogne, Échap dépile) — surtout PAS « quitter la boîte ».*

### Découpage spatial
- **Cadrage contre-plongée légère** depuis le trottoir, l'**enseigne rouge « LA RIDE »** vue d'en bas au-dessus de la porte (identité du lieu maintenue → on ne quitte pas la destination, on est SUR son seuil).
- **Plan 0 — trottoir** : bitume mouillé qui reflète le rouge de l'enseigne, mégots, une flaque, le caniveau.
- **Plan 1 — le coin fumeur** : un **cendrier sur pied**, deux perso alien qui fument (billboards, dont le passe-joint), un muret/barrière, une affiche déchirée sur le mur.
- **Plan 2 — la façade** : porte de boîte (capitonnée, hublot), le **videur** (silhouette massive, billboard), le cordon rouge, l'enseigne rouge néon en contre-plongée.
- **Plan 3 — le fond de rue** : un **taxi** qui attend phares allumés, la ville lointaine floue/brumeuse, un lampadaire sodium.
- **Possibilités ludiques :** (a) passe-joint = geste social (mécanique perso alien barque, `passe_joint_prompts.md`) ; (b) enseigne rouge = halo néon qui respire off/on ; (c) taxi = phares/clignotant animé ; (d) sound design nuit (ville lointaine, basse étouffée derrière la porte, briquet).

### Prompt d'image (prêt à coller)
```
Exterior of a nightclub entrance at night, seen from the sidewalk in slight low-angle, the red neon sign "LA RIDE" glowing above the door. A smoking corner just outside the door. PS2-era video game look (2003), like a GTA-era cutscene in front of a club — simple painted textures, strong contrast, saturated night colors, slight JPEG/WebP compression, soft mushy edges, low render distance (the street dissolves into night haze). NOT modern 3D, NOT photorealistic.

Layout, clearly readable:
- ABOVE THE DOOR: a red neon "LA RIDE" sign, seen from below, glowing, halo bleeding into the humid air.
- THE DOOR: a padded club door with a porthole window, a red velvet rope, a beefy bouncer standing beside it (keep him as a separable silhouette element), a torn poster on the wall next to it.
- SMOKING CORNER (foreground left): a standing ashtray, a low barrier/wall, cigarette butts. Leave a bit of open space where smoker characters will be added in code — do not overcrowd.
- SIDEWALK: wet asphalt reflecting the red neon, a puddle, a gutter, litter.
- BACKGROUND: a taxi waiting with its headlights on, a sodium streetlamp, the distant town blurred into blue night fog.

Palette: red neon, sodium yellow streetlight, wet-asphalt reflections, deep night-blue and black, a touch of rave violet from the door. Faded, scanned, compressed, grainy. Nocturnal, calm, a little lonely and funny — the in-between moment outside a club at 3am.

Composition notes: this is still PART of the club (its threshold), not a way out of the world — keep the red LA RIDE sign dominant so the place stays identified. Keep the bouncer, the standing ashtray, the taxi, the neon sign as DISTINCT SEPARABLE elements with clear silhouettes for later cut-out. Leave room for smoker sprites at the smoking corner. Grain, faint CRT scanlines, wet reflections. Aspect ratio 3:2.
```

### Nom de fichier conseillé
`fumoir_off_v1.png` (enseigne éteinte / faible) + `fumoir_on_v1.png` (néon rouge allumé + halo, phares taxi). Drop : `public/media/nightdrive/scenes/`. Videur + fumeurs billboards (It32) → `.../perso/`.

### Note technique légère
Rester **enfant de `laride`** (même pile gigogne, Échap dépile) — traiter en sous-scène annexe, jamais comme un retour au quai (garde-fou D12). Passe-joint = billboards perso animés (réutilise le pattern barque). Halo enseigne = calque additif en boucle 2-5 s.

---

## 7. Lieux écartés (overlay UI, pas de décor peint → pas de prompt)

- **Cocktails / carte (`tableau`)** — FAIT It20 : plein cadre = **fiche + verre SVG animé + néon rouge**, c'est une UI de carte, pas un lieu à traverser. Pas de décor à générer. *(Un décor « face à la carte au mur » serait redondant avec le zinc §5 qui sert déjà de passerelle.)*
- **DJ booth (`djbooth`)** — FAIT It21, poussé en **objet Rive** (platine vue du dessus, 4.1). Plein cadre = **instrument** (2 CDJ, crossfader, bac) riggé en Rive, pas un décor peint. Pas de prompt de scène. *(Si un jour Vincent veut un décor « fond de booth » derrière la platine, ce serait un simple backdrop — à demander explicitement.)*

---

## 8. Tableau récap

| # | Lieu | Fichier(s) conseillé(s) | off/on ? | Priorité de génération |
|---|---|---|---|---|
| — | Toilettes | `toilettes_*_v1` (voir doc dédié) | oui | **FAIT** (déjà spec) |
| 1 | **Vestiaire (dressing)** | `vestiaire_dressing_off_v1.png` / `_on_v1.png` | oui (néon violet) | **P1** — zone existe, jeu d'habillage validé, décor = prérequis |
| 2 | **Photobooth** | `photobooth_int_off_v1.png` / `_on_v1.png` | oui (rideau/flash) | **P1** — zone existe, séance photo validée |
| 5 | **Zinc / barman** | `zinc_off_v1.png` / `_on_v1.png` | oui (étagère) | **P2** — nouvelle zone, meilleur ROI (effort S, `comptoir.js`) |
| 3 | **Backstage / loge** | `backstage_off_v1.png` / `_on_v1.png` | oui (ampoules) | **P2** — nouvelle zone, pattern `confess` |
| 4 | **Piste / dancefloor** | `piste_off_v1.png` / `_on_v1.png` | oui (spots) | **P3** — nouvelle zone, foule réactive ; base du hub 3D (dernier) |
| 6 | **Fumoir / sortie** | `fumoir_off_v1.png` / `_on_v1.png` | oui (enseigne) | **P3** — nouvelle zone, à cadrer (garde-fou D12) |
| — | Cocktails (`tableau`) | — (overlay UI) | — | écarté (pas de décor) |
| — | DJ booth (`djbooth`) | — (objet Rive) | — | écarté (pas de décor) |

> **Cohérence :** tous en 3:2, off/on strictement même cadrage (seule la lumière change → superposition propre, exigence It32). Perso alien bleu-violet partout. Objets « DISTINCT SEPARABLE » à chaque prompt pour le détourage It32.

---

## 9. Ordre conseillé de génération

**Vague 1 — les zones qui existent déjà dans le registre (décor = prérequis direct d'un jeu validé) :**
1. **Vestiaire** (`vestiaire_dressing_*`) — le jeu d'habillage est spécifié et validé ; il lui manque juste le décor fixe. Impact immédiat.
2. **Photobooth** (`photobooth_int_*`) — la séance photo est validée ; le décor intérieur débloque le jeu + l'archive auto.

**Vague 2 — les nouvelles zones à bas coût (après feu vert de Vincent sur l'extension d'image LA RIDE) :**
3. **Zinc / barman** (`zinc_*`) — meilleur ROI (réutilise `comptoir.js`, effort S).
4. **Backstage / loge** (`backstage_*`) — pattern `confess`, porte de collection.

**Vague 3 — le gros morceau / le pilote 3D :**
5. **Piste** (`piste_*`) — foule réactive au son, puis base du hub 2.5D D16 (dernier de la file).
6. **Fumoir / sortie** (`fumoir_*`) — à cadrer avec le garde-fou D12 (rester enfant de `laride`).

> **Reco d'attaque immédiate : vestiaire + photobooth** (vague 1). Les deux zones existent déjà dans `scenes.js`, leurs jeux sont spécifiés et validés QC — il ne leur manque QUE l'image de décor. Générer ces deux paires débloque directement du jouable. Les 4 nouvelles zones supposent une extension du registre LA RIDE (nouvelle image + `{id,x,y,w,h}` + `build_zone_masks.py`) → à trancher par Vincent avant génération.
