# Barque — Myrtille : paliers d'états animés (récap de reprise)

Scène `barque` (Astro + Svelte 5). Perso NPC **Myrtille** : elle roule/fume et MONTE en paliers
d'états spéciaux qu'elle GARDE (pattern 005 §1-bis). Moteur dans `src/os/nightdrive/NightDrive.svelte`,
données dans `src/os/nightdrive/scenes.js` (perso `myrtille.poses`).

## Les paliers (compteur `puffs`, seuils dans `PERSO_STATES.myrtille`)
- **5 taffes → `state2`** : maxi taffe → lotus qui LÉVITE (9 frames, dernière tenue). floatState 2.
- **10 taffes → `state4`** : Shiva 6 bras (yeux lumineux, halo). Event : `charge4` (aura) → **flash plein écran** → transfo. floatState 4.
- **15 taffes → `state6`** : la Shiva se dissout → boule d'énergie (10 frames). Event **renforcé** (flash blanc + double onde). Puis elle S'INSTALLE dans sa **vraie forme finale** `final6` (être d'énergie) en **idle ping-pong**. floatState 6.

## Anims "fume dans l'état" (repart et revient sur la pose tenue)
- `blow2` (6 fr) = fume en lotus. `blow4` (10 fr) = grâce Shiva, joué LENTEMENT (fps 2).
- `state6` n'a pas de blow : refumer garde l'idle `final6` + remplit la jauge.

## Jauge de maintien + redescente
- Dès qu'elle lévite, jauge (`gauge[id]`) se vide en ~10 s (`GAUGE_MS`). Chaque taffe la remplit (`armGauge`).
- Jauge vide → `demoteState` : 6→4 (puffs=10), 4→2 (puffs=5), 2→sol.

## Lévitation (CSS, origine BAS `50% 100%`, PAS d'agrandissement entre paliers)
- `.perso-float2` (lotus) · `.perso-float4` (Shiva) · `.perso-float6` (énergie, pulse lumière).
- Gate `floatOn()` : les 2 PREMIÈRES frames d'une entrée gardent la taille du palier précédent, puis lévitation.

## HUD portraits (haut-gauche)
- Stick = l'`etat-hud` existant (ivresse). Myrtille = portrait 58×66 juste à côté, **change selon l'état**
  (`myrtille_face_{0|2|4|6}.webp`) + label sobre/défoncée/déesse/énergie + jauge dessous + halo (violet/or/blanc) quand active.

## Event plein écran
- `ascension` + `ascLevel` (4 ou 6). Overlay `.ascension` (flash + onde radiale), `.lvl6` = plus violent.

## Pipeline frames (rappel)
- Vincent génère sur fond vert (ChatGPT). Claude : chroma-key vert + keep-largest-blob + despill + feather,
  recale sur la base lotus (réf `myrtille_state2_9` / `state4_10`), canvas **683×1382** (assise/lotus) ou **940×1382** (Shiva/énergie, bras larges). Sortie webp q88 → `perso/`. Sources archivées dans `archives/perso_dressup_sources/`.
- Vérif compil (PAS de build) : `node --input-type=module -e "import{compile}from'svelte/compiler';..."`.

## Idle ping-pong (réutilisable) — `startPingpong(id, key, ms)`
- Joue l'ordre b→a→b→c→b… (index `[1,0,1,2]`) lentement. frames `[a,b,c]`. 1 frame → statique.

## À FAIRE (prochaine conv)
- **Forme finale niveau 3 animée "South Park"** : `final6` n'a que B (a/c = pulsations de lumière dérivées).
  → fournir de VRAIES frames distinctes (l'être d'énergie qui bouge par sauts, style cut-out South Park) →
  les déposer en `myrtille_final_a/b/c.webp` (ou plus), le ping-pong les joue direct. L'animer comme le niveau 4 (boucle vivante), pas juste une pulsation.
- Son `ascension.wav` / `ascension6.wav` (silence en attendant).
- États `state2/4` de **Stick** (frames à faire) s'il doit léviter aussi.
