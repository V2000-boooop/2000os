# Notes / Compact — reprise

## EN ATTENTE DE TEST VINCENT (It40 barque + It41 prêtre + It42c danse : rig articulé assis + CSS cut-out — build vert)
**It41 — le prêtre (détail : `090`)** : église vide → il arrive en marchant (hors-champ droit, ~23-45 s après l'entrée) → quémande en boucle, dialogue à droite → OUI = bénédiction main lumineuse + sermon joyeux, il reste · NON = gueulante + dissolution fumée violette. À vérifier en test :
1. Position/taille du prêtre (x38 y30 w20 h56 dans `scenes.js`) et point d'arrivée de la marche.
2. Sens de la marche (il vient de la droite ; si les sprites regardent dans le mauvais sens → on flip).
3. Vitesse marche (walkMs 5200 / 8 fps) et de la demande (5 fps).
4. Le dialogue ne couvre pas l'anim (`.roll-ask.coin`, décalé à droite).
→ Retours en UNE liste numérotée.
**It40 — barque** : K7 clic=play/re-clic=stop/sortie=stop · ambiance 0.65 · voix radio (on/ouvrir/mise en route/passby) · danse : déposer `myrtille_radio_1..N.webp` + `stick_radio_1..N.webp` (même bbox que idle) + nombre de frames → 1 ligne/perso dans `scenes.js`.

## CHANTIER DANSE BARQUE — CSS CUT-OUT (It42b, à tester live)
- **Approche frame-par-frame ABANDONNÉE** (Vincent : « ça clignote, mal détouré »). Enchaîner des poses repeintes = scintillement + les modèles image ne tiennent pas la cohérence. Piège.
- **Méthode retenue = collage cut-out animé par CSS** : la découpe idle (déjà propre) CLAQUE sur le rythme via transform `steps(1)` (snap tenu → saute), pivot assise. Zéro frame repeinte → zéro scintillement, bords nets, 0 asset.
- **Câblage (NightDrive.svelte + scenes.js)** : `canDance:true` sur Myrtille + Stick ; `favDance:true` sur Myrtille. `$effect` → `danceLvl[id]` = 1 (toute musique) ou 2 (K7 `PINO2000`, la préférée de Myrtille). Classes `.dance-a` (1,8 s/snap, lent) / `.dance-b` (1,1 s, vif) sur `.perso`. Ne danse que depuis le repos (états roule/fume/lévite sacrés) ; stop musique = retour idle.
- **Tempo réglable** : `animation-duration` des `.dance-a/.dance-b` + les 4 keyframes `cutout-dance`. Dire « plus lent / plus ample / plus penché ».
- **PANTIN ARTICULÉ ASSIS — FAIT (It42c)** : Vincent a fourni 4 calques fond vert (tête/buste/brasdroit/brasgauche, partis de l'idle, cadre 887×1774). `tools/build_rig_layers.py` : détoure le vert (despill + plus grande composante + érosion 1px) → `myrtille_rig_{tete,buste,brasd,brasg}.webp` + fabrique `myrtille_rig_jambes.webp` depuis l'idle (les calques ne couvrent que le haut). Sources → `archives/rig_sources/`. Data `rig[]` sur Myrtille (scenes.js, z-order + pivots %). DOM `.rig` + CSS : jambes+buste immobiles, bras+tête snappent autour de leur pivot (`steps(1)`, `--rigper` 1,8 s / 1,05 s en `.rig-fast` pour PINO2000). Affiché seulement quand elle danse ; garde : perso riggé → pas de danse « corps entier ». Vérifié en simulation (épaules/nuque attachées). Build vert.
- **RIG DEBOUT — à générer (prompts donnés)** : pour qu'elle danse DEBOUT (plus vif, ex. Niveau 2 PINO). Générer une Myrtille debout sur fond vert (bras écartés du corps → séparables), puis découper les mêmes calques (tête/buste/bras G/bras D + jambes) même fond vert même cadre → drop-in, je rigge à l'identique (`build_rig_layers.py`, adapter MAP + pivots).
- Ancien `build_danse_frames.py` + `archives/danse_sources/` gardés (approche frames abandonnée).

## RESTE À DÉPOSER (safe-absent)
- Halos/reflets cathédrale : `cathedrale_halo_joyeux|vener.webp` + reflets vitraux/murs (6 fichiers, `scenes/overlays/`).
- Sons : `pretre_demande` (il quémande), `piece`, `refus`, `univers_ange`, `ambiance_quai`.
- Nouvelles planches prêtre éventuelles → `archives/pretre_sources/` puis `python3 tools/build_pretre_frames.py` (MAP dans le script).

---

## Compact de la session 2026-07-06 (ce qui a été fait)
- **Optimisation assets** : scènes PNG→WebP, PNG perso/sources archivés hors dépôt → `public/media` 114 Mo → 17 Mo. Script `tools/optimize_assets.sh`. *(déjà en ligne)*
- **Méthode de scène universelle** posée : `060_SCENES.md` (collage vivant Arcane×GTA, calques à états, halos-calques + reflets, humeur mémorisée, porte 3D). Décision **D16** dans `000`.
- **Collage d'état générique** (`overlays[]` dans `scenes.js`) — proto cierges cathédrale (swap au clic).
- **Système d'humeur du prêtre** (cathédrale) : demande la pièce au 4e mur → OUI = sermon joyeux / NON = sermon vénère, + halos/reflets. **Safe-absent** (rien ne casse tant que les calques ne sont pas là).
- **Zoom-cadrage au survol** : léger, lent, avec délai (~380 ms) et push ~7 s ; sur l'**habitacle ET les scènes intérieures**. *(validé par Vincent)*
- **Son réactif** : `reactsound.js` (pitch/pan, crossfade, ducking) branché PMU (placeholders synthés + mapping Splice).
- **Socle 3D** : `Scene3D.svelte` + galerie `/test3d` + `tools/make_props.py` (props low-poly GLB) + `tools/scan_3d.mjs`.
- **Docs prêts** : `brief_chatgpt_calques.md` (à coller dans un Projet ChatGPT + 3 réfs), `cathedrale_prompts.md` (les 19 prompts, prêtre verrouillé), `cathedrale_calques.md`, `barque_calques.md`, `sons_a_produire.md`, `3d_assets.md`.
- Tout est poussé en ligne (commit `5644b98`, master → Vercel).

## En attente côté Vincent
- **Générer les calques cathédrale** (brief + `cathedrale_prompts.md`) : commencer par `cathedrale_base`, puis le prêtre (idle/demande/joyeux/vénère). Déposer dans `scenes/perso/` (prêtre) et `scenes/overlays/` (reste).
- **Révoquer le token GitHub** (encore actif) ; idéalement `gh auth login` une fois.

## À FAIRE demain (priorité)
### 1. La passe du joint (barque) — Myrtille → Stick
**Interaction :** quand **Myrtille fume**, cliquer sur elle et **maintenir appuyé**, puis **glisser vers Stick** (drag) → elle lui **lance le joint**, il le **récupère et le fume**.
**Anim :** Myrtille « fume » → `pointerdown` sur elle (on saisit le joint) → `pointermove` vers Stick → `pointerup` sur/près de Stick → Myrtille « lance » → joint en vol (2–3 frames) → Stick « attrape » → Stick « fume » (Myrtille arrête). Relâché ailleurs → rien.
**Calques à générer :** `myrtille_lance`, `joint_vol_1..3`, `stick_catch`, `stick_fume` (transparent, mêmes bbox que les poses existantes).
**Technique :** réutiliser l'état `smoking` + `playPose` ; ajouter un mini drag perso→perso ; **barque-only, additif**.

### 2. Brancher les calques cathédrale au fur et à mesure de leur dépôt (positions, swaps).

### 3. (si envie) Répliquer le zoom / le collage sur une autre scène (PMU, taverne, LA RIDE).

---

## MESSAGE À COLLER dans la nouvelle conversation
> Lis `docs/000_PROJECT_MEMORY.md` puis `docs/NOTES_PROCHAINE_SESSION.md`, puis : [choisis ta tâche du jour, ex. « on code la passe du joint Myrtille→Stick dans la barque » OU « je viens de déposer cathedrale_base + le prêtre, branche-les »].

- **Sons bruts de Vincent** : sur le **Bureau `~/Desktop/OS 2000/`** (ex. `RADIO JAPAN GARAGE 1.mp3/.wav/.als`). Chercher là en priorité pour les sons du jeu/OS. Convertir en `.webm` (opus 64-96k) avant de brancher.
