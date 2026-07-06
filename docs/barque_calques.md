# Barque (Night Drive) — plan de calques & animation

Objectif : faire de la barque la scène **template**. Tu génères les calques dans ChatGPT selon cette liste, je composite + anime + branche le son.

---

## A. Règles de génération (VALABLE POUR TOUS LES CALQUES)

- **Même cadrage, même résolution** pour tous les calques (ils s'empilent au pixel). Réf : le cadrage de `barque_base` actuel.
- **Résolution cible : 1920×1080** (16:9), export **PNG transparent** (je convertis en webp après).
- Objets/persos isolés : **fond transparent, pas d'ombre portée peinte** (l'ombre, je la fais en CSS).
- Même **direction de lumière** partout (lanterne = source chaude au centre) sinon les calques jurent.
- Style : ta DA (cartoon fin années 30 / nuit rétro, grain léger).

---

## B. Les calques (dans l'ordre d'empilement, du fond vers l'avant)

| # | fichier | contenu | transparent ? | animation | comment c'est branché |
|---|---|---|---|---|---|
| 1 | `scenes/barque_base.webp` | barque + eau + **fond nuit** (cathédrale, néon LA RIDE, PMU, taverne) — **SANS les 2 persos, SANS la flamme de lanterne** | non (plein cadre) | parallax léger au regard | déjà : `barque.off/on` |
| 2 | `scenes/lights/barque_*.png` | halos par objet (lampe, radio, weed, pizza, taverne, laride, pmu…) | oui (halo seul) | glow au survol + flicker néon | déjà en place |
| 3 | `scenes/perso/raver.webp` (Stick) | le raver isolé | oui | lévite (idle CSS) | déjà : `personnages[stick]` |
| 4 | `scenes/perso/myrtille_idle.webp` + poses | Myrtille isolée (idle) + séquences `roll_1..7`, `blow_1..8` | oui | flipbook (roule/souffle) | déjà : `personnages[myrtille].poses` |
| 5 | `scenes/perso/barque_flamme_1..4.webp` *(NOUVEAU)* | la **flamme de lanterne** seule, 3–4 frames | oui | flicker (boucle 4 frames) | à brancher (calque animé) |
| 6 | `scenes/perso/smoke_ring_1..6.webp` | ronds de fumée | oui | monte + dissipe | déjà |

> Tout le reste (reflets d'eau qui shimmerent, néon LA RIDE qui pulse, halo de lanterne qui respire) = **CSS/JS par-dessus la base**, aucun asset à générer.

---

## C. Recettes de prompt ChatGPT (copier-coller)

**Base (le décor sans persos ni flamme) :**
> « Scène de barque de nuit, style cartoon fin années 30, vue fixe. Barque en bois vide sur l'eau, quai au fond avec cathédrale, enseigne néon rouge "LA RIDE", PMU, taverne. Ambiance nuit chaude. **Aucun personnage. Lanterne présente mais éteinte (sans flamme).** Cadrage large 16:9, 1920×1080. »

**Un perso isolé (ex. Myrtille) :**
> « [Myrtille, punk] en pied, style identique, **fond transparent, isolé, sans ombre portée**, même échelle et même angle que dans la barque. PNG transparent 1920×1080, personnage centré à sa position dans la barque. »

**La flamme (4 frames) :**
> « Petite flamme de lanterne, style cartoon, **fond transparent, sans halo**, 4 variations légères pour une boucle (flicker). Même position/échelle que la lanterne de la barque. »

Règle : génère la base **d'abord**, puis pose les persos/flamme « dans le même cadre » en référence.

---

## D. Ce que tu me donnes en PREMIER (priorité)

1. `barque_base` (décor sans persos/flamme) — **le plus important**.
2. Myrtille idle + Stick idle (transparents).
3. (plus tard) frames roll/blow/flamme.

## E. Ce que je fais à réception

- Compositing propre (calage, z-order, conversion webp).
- Animations in-engine : **shimmer d'eau, halo lanterne qui respire, néon LA RIDE flicker, parallax, lévitation Stick, idle Myrtille, fumée**.
- Son branché comme le PMU (boombox→k7, sachet→roll, pizza, lanterne→ciel) via `reactsound`.
- Résultat = barque vivante → on en fait le modèle pour cathédrale / taverne / LA RIDE.

---

**Note :** `barque_base.webp` existe déjà (basse déf). Si tu veux, je peux **commencer l'animation sur l'existant tout de suite** (eau + halo + néon), et tu remplaceras par tes calques HD après — le code ne bouge pas.
