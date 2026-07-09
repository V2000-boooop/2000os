# NIGHT FIGHT — doc de reprise (fighting game du dossier Jeux)

Jeu de combat 2D arcade, **100% code, offline**, DA Vincent 2000 (nuit néon). Tout tient dans **un seul fichier** :
`src/os/apps/GameApp.svelte`. Ouvert depuis le bureau : dossier **Jeux → NIGHT_FIGHT.exe**.

## Où c'est branché (ne pas régénérer)
- Composant jeu : `src/os/apps/GameApp.svelte` (tout : moteur + rendu + UI, ~360 lignes denses).
- Type d'app `game` : `src/os/apps/registry.js`, `src/os/open.js` (case 'game'), `src/data/content.js` (entrée `game_fight` dans le dossier Jeux), `src/os/apps/FolderApp.svelte` (les `game` listés avec les `.exe`).
- Assets : `public/media/games/fight/fighter_<perso>_<action>_<n>.webp`.
- Sources PNG (fond vert) archivées : `archives/fight_sources/`.
- Vérif : compile Svelte (PAS de build) —
  `node --input-type=module -e "import{readFileSync}from'fs';import{compile}from'svelte/compiler';compile(readFileSync('src/os/apps/GameApp.svelte','utf8'),{generate:'client'})"`

## Roster (clé → nom affiché)  — dans `ROSTER` + `SPRITE_SETS`
belge=LE BELGE · cantona=CANTONA · element=RUBY RHOD · bride=KIDDO · voisin=JOSÉ BOVÉ · jesus=JÉSUS · alien=ALIEN · **boss=LE PATRON** (slot, sprites à venir → rig code en attendant).

## Poses par perso (11 images) — `SPRITE_SETS[key].frames`
`idle`(1) · `walk`(3, cycle) · `crouch`(1) · `jump`(1) · `straight`(1, poing) · `roundhouse`(1, pied) · `hit`(1) · `special`(1) · `ko`(1, **couché, image horizontale**).
- Mapping actions (`actKey`) : tous les poings → `straight` ; tous les pieds → `roundhouse` ; `walkb` → `walk` **joué à l'envers** ; `special` → `roundhouse` si pas de sprite special.
- **Fait** : les 6 principaux ont TOUT. **Manque** : `alien` (idle seul), `boss` (rien encore).

## Pipeline sprites (côté Claude, à réappliquer pour tout nouveau perso/pose)
Vincent génère sur **fond vert #00b140** dans ChatGPT (profil 3/4 face droite, plein pied, même perso/échelle). Claude traite en Python (PIL+numpy) :
1. **Chroma-key vert** : bg si `min(G-R,G-B)` dominant ; despill `G=min(G,max(R,B))` ; feather (GaussianBlur ~0.8).
2. **Ancrage pieds-centrés** : bbox alpha, centre horizontal = moyenne des pixels des 6% du bas (les pieds).
3. **Échelle par perso** : `k = 620 / hauteur_bbox_de_l_idle`, appliqué à TOUTES les poses du perso → hauteurs relatives justes (accroupi plus petit, etc.). Dessin en jeu : `s = min(set.h,BH*0.62)/620`.
4. **KO** = cas à part : trim bbox + resize **largeur 720**, dessiné **allongé** (bottom au sol, pas d'ancrage debout).
5. Sortie **webp q84**. Nommage `fighter_<key>_<action>_<n>.webp`.
Ordres de tri des lots ChatGPT : index 1..6 = cantona, element, bride, voisin, jesus, belge (walk = 3 frames/perso sur 2 lots de 9).
Outil de vérif : `@napi-rs/canvas` (npm) pour rendre une planche-contact hors-écran et l'inspecter.

## Contrôles (lecture par POSITION physique `e.code`, AZERTY-safe, remappables → localStorage `nf_binds`)
Défaut P1 = WASD(phys = ZQSD) + **J/K/L** (poing/pied/spécial). P2 = flèches + **, . /**.
Moves = **direction + bouton** : neutre/avant/bas/en l'air × poing/pied → jab/direct/uppercut/aérien, pied bas/retourné/balayette/aérien.
**Spéciale** = combo **poing-poing-pied-pied** (ou touche spécial) → finisher + flash plein écran. **Prise** = poing+pied au corps-à-corps.

## Systèmes en place
Frame data (startup/active/recovery via `MOVES[].hit`/`dur`), hitstun/blockstun, **hitstop**, **pushbox** `SEP=44` (portées des coups > SEP pour connecter), **compteur de combo + dégâts dégressifs**, **barre de super**, **rounds best-of-3** (pips), garde (tenir arrière), **marche liée à la distance parcourue** (anti-patinage, SF-like ; se fige au contact ; arrière = cycle inversé), VFX de frappe (`drawStrike`), flash spéciale (`superFx`), SFX **WebAudio** (pas de fichier), **décors** `STAGES[]` (6 : Rave Euskadi, PMU, Port, Cathédrale, Club, Duel) via `buildBG(stageIdx)`.

## EN COURS / À FAIRE
- **Mode ARCADE** (demandé) : échelle d'adversaires vs CPU, **décor qui change à chaque combat**, **boss final** (perso par défaut). → `STAGES` + slot `boss` déjà ajoutés ; **le flow n'est PAS encore câblé** (newRound/endRound sont encore best-of-3 vs `sel2`). À finir : liste d'adversaires + `stageIdx` par combat + victoire/game over + boss.
- Poses de l'**Alien** ; sprites du **boss**.
- Options « plus technique » au choix : dash/back-dash (double-tap), marche 6 frames, mixups haut/bas (garde debout vs accroupie), inputs QCF, projectiles, EX-moves, parry, mode entraînement.
- Le boss n'a **aucune invulnérabilité** (il prendra des dégâts normalement une fois câblé).

## Prompt ChatGPT — pack de 10 poses (joindre l'idle du perso en référence, ne PAS régénérer l'idle)
> À partir du personnage de l'image de référence, génère 10 images du MÊME personnage (même visage/tenue/couleurs/proportions/échelle), une pose par image : 1) marche pas 1 (jambe gauche avant, va vers la droite) 2) marche pas 2 (transition) 3) marche pas 3 (jambe droite avant) 4) accroupi (bien bas) 5) saut (genoux repliés en l'air) 6) coup de poing (bras avant tendu à droite) 7) coup de pied (jambe lancée à droite) 8) encaisse (buste+tête en arrière) 9) spéciale (pose signature + traînée d'effet vers la droite) 10) K.O. (allongé au sol, CADRAGE HORIZONTAL). Règles : fond vert uni #00b140, un seul perso, aucun texte, aucune ombre, profil 3/4 tourné à DROITE, plein pied pieds en bas SAUF le 10 (allongé), même style/échelle que la référence.
