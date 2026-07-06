# Notes / Compact — reprise

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
