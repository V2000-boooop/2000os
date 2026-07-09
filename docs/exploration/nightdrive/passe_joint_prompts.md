# Passe du joint (barque) — Myrtille → Stick · prompts ChatGPT

> Objectif : générer la série de frames pour l'anim « Myrtille lance le joint, Stick l'attrape et fume ».
> Pipeline : générer sur **fond vert plat** (chroma) → détourer (remove.bg ou Claude) → `.webp` transparent → dépôt dans `scenes/perso/`.
> Claude branche ensuite le drag Myrtille→Stick + les poses (aucune régénération de scène).

## Règle de calage (CRITIQUE — sinon ça saute)
Chaque frame d'un perso doit garder **exactement** le même cadrage, la même échelle et la même position dans l'image que sa **référence** :
- Myrtille = bbox `x35 y20 w16 h44` — toutes ses poses partagent cette bbox.
- Stick = bbox `x62 y27 w22 h44`.
Donc dans chaque prompt : **seuls les bras / la tête / le regard changent**. Le corps, le cadrage, le zoom, le bas du corps ne bougent pas. On génère **une frame par image**, avec la **référence attachée à chaque fois**.

## Références à attacher (obligatoire pour la cohérence perso)
- Frames **Myrtille** → attacher `public/media/nightdrive/scenes/perso/myrtille_roll_7.webp` (pose « fume », joint en main = point de départ).
- Frames **Stick** → attacher `public/media/nightdrive/scenes/perso/raver.webp` (idle lévitation).
- Frames **joint en vol** → aucune ref, sprite isolé.

## Bloc STYLE à coller à la FIN de chaque prompt perso
```
Same character, same outfit, same colors, same body scale, same camera distance and crop as the attached reference — only the arms, hands and head change. Full body, identical framing. Flat solid chroma-green background (#00b140), even lighting, hard clean silhouette edges for cutout. Retro 1998–2004 PS2/GTA low-poly game render, night sodium/neon tint, slightly compressed and painted, "forgotten cult video game" look — NOT premium AI illustration. Character: ambiguous human/alien hybrid, translucent blue-violet skin, ~85% human face.
```

---

## A. MYRTILLE — lancer (4 frames) · `myrtille_lance_1..4`
*(réf : `myrtille_roll_7.webp` à chaque frame)*

**`myrtille_lance_1`** — l'armé
```
Same seated punk character as reference. She takes the lit joint out of her mouth with her right hand and starts pulling her arm back, torso rotating slightly back to her left, eyes locking to the right (toward someone off-frame). Small confident grin. Lit joint clearly held between her fingers, tiny ember + thin smoke.
```
**`myrtille_lance_2`** — armé complet
```
Same character. Right arm fully cocked back near her shoulder, weight shifted back, wrist loaded, still gripping the lit joint, eyes aiming to the right, grin. Lower body unchanged on the bench.
```
**`myrtille_lance_3`** — le lâcher
```
Same character. Right arm swinging forward and to the right, hand opening, the lit joint just leaving her fingertips (mid-release), body following through. Ember and a short smoke streak behind the joint.
```
**`myrtille_lance_4`** — l'accompagnement (pose tenue « elle regarde »)
```
Same character. Right arm extended forward-right, hand now empty and open, watching after the throw, relaxed satisfied look. No joint in hand.
```

## B. LE JOINT EN VOL (3 frames) · `joint_vol_1..3`
*(sprite isolé, petit carré transparent, pas de perso)*
```
A single lit hand-rolled joint, glowing orange ember tip, a short thin wisp of smoke trailing, PS2-era low-poly painted game render, on a flat solid chroma-green background (#00b140), centered, small, clean edges for cutout. Frame 1: joint nearly horizontal, ember leading.
```
- **`joint_vol_2`** : même prompt, remplacer la dernière phrase par `Frame 2: joint tilted about 35 degrees, ember bright, a tiny spark, smoke wisp curling.`
- **`joint_vol_3`** : `Frame 3: joint tumbling at about 70 degrees, ember glowing, smoke wisp longer.`

## C. STICK — attrape (2 frames) · `stick_catch_1..2`
*(réf : `raver.webp` à chaque frame)*

**`stick_catch_1`** — il tend le bras
```
Same levitating cross-legged raver character as reference. He snaps his head to his left and reaches his left arm out to the left, hand open, ready to catch something incoming. Still floating cross-legged, same pose otherwise.
```
**`stick_catch_2`** — il referme sur le joint
```
Same character. His left hand closes around the lit joint (ember + tiny smoke visible between his fingers), bringing it in toward his chest, pleased look. Still cross-legged, floating.
```

## D. STICK — fume (1 pose tenue) · `stick_smoke`
```
Same levitating cross-legged raver character as reference. He holds the lit joint to his lips, relaxed, eyes drifting back up to the sky, a soft trail of smoke. This is a held resting pose.
```

## E. STICK — souffle (4 frames, le payoff) · `stick_blow_1..4`
*(réf : `raver.webp` — même logique que la séquence `blow` de Myrtille : toute la fumée est PEINTE dans les frames, aucun rond codé)*
```
Same levitating cross-legged raver character as reference, lit joint in hand. He exhales upward. Paint the full smoke in the frames.
Frame 1: cheeks full, joint lowered from lips, mouth beginning to open, no smoke yet.
```
- **`stick_blow_2`** : `Frame 2: he blows, a small smoke ring is born at his mouth.`
- **`stick_blow_3`** : `Frame 3: the smoke ring has risen and grown above his head, thinning.`
- **`stick_blow_4`** : `Frame 4: the ring dissipates into a faint wisp near the top of the frame, he looks satisfied.`

---

## Récap frames à déposer (dans `public/media/nightdrive/scenes/perso/`)
| Groupe | Fichiers | fps prévu |
|---|---|---|
| Myrtille lance | `myrtille_lance_1..4.webp` | ~5 |
| Joint en vol | `joint_vol_1..3.webp` | boucle en vol (CSS gère l'arc) |
| Stick attrape | `stick_catch_1..2.webp` | ~6 |
| Stick fume | `stick_smoke.webp` (pose tenue) | — |
| Stick souffle | `stick_blow_1..4.webp` | ~3 |

## Ce que Claude branchera après dépôt (barque-only, additif)
- Drag `pointerdown` sur Myrtille (si `smoking`) → `pointermove` → `pointerup` sur/près de Stick.
- Enchaînement : `myrtille.lance` (fps 5) → spawn `joint_vol` animé sur un arc CSS Myrtille→Stick → `stick.catch` (then `smoke`) → Myrtille repasse en `idle`, Stick devient `smoking` (clic sur Stick → `stick.blow`, comme Myrtille).
- Relâché ailleurs = rien (annulation propre).
- Ajout des poses dans `scenes.js` sur `stick` (`catch`, `smoke`, `blow`) + `myrtille` (`lance`). Fallback : sprites absents → rien ne casse.
