# Cathédrale intérieur — calques & états (méthode 060_SCENES)

Collage vivant, style Arcane × GTA. **Aucune lumière CSS** : le halo, les reflets, la lumière = des **calques peints**. On liste tout à l'avance pour des calques nickel détourables.

## Règles (rappel 060 §3)
- **Même cadrage + même résolution** que ton image cathédrale (cible 1920×1080).
- **Fond transparent, objet isolé, PAS d'ombre portée, PAS de halo peint autour** (le halo est un calque à part).
- Même direction de lumière, même style. Marge autour de l'objet, bords nets.
- États d'un même objet = mêmes contours (calage parfait).
- Dépose dans `public/media/nightdrive/scenes/overlays/` (perso dans `scenes/perso/`). PNG transparent → je convertis en webp.

---

## 1. LE FOND — `cathedrale_base`
La nef éclairée sobre, **SANS** flammes de cierges, **SANS** vitraux allumés, **SANS** prêtre, **SANS** halo. Vitraux éteints (verre terne), corps de bougies présents mais éteints.
> « Intérieur de cathédrale la nuit, style cartoon rétro Arcane/GTA, psyché catholique. Nef en enfilade : deux grands vitraux gothiques à gauche **éteints (verre terne)**, un pupitre/autel au centre, un confessionnal en bois à droite, un présentoir de cierges **éteints** en bas à droite, rosace au plafond. Ambiance sombre, solennelle, grain film. **Aucune flamme, aucun vitrail allumé, aucun personnage, aucun halo.** Cadrage large 16:9, 1920×1080. »

---

## 2. LE PRÊTRE — perso vivant à humeur (le modèle, 060 §2)
Silhouette détourée, **même échelle/angle** que sa place dans la nef. 4 calques (poses/humeurs), tous **mêmes contours** :

**a) `pretre_idle`** — debout dans la nef, il respire.
> « Prêtre rétro (soutane, style Arcane/GTA), en pied, **immobile en prière**, expression neutre, même échelle/angle que dans la nef. **Fond transparent, isolé, sans ombre portée, sans halo.** PNG transparent. »

**b) `pretre_demande`** — il s'avance **vers l'écran** (4e mur), main tendue, il quémande une pièce.
> « Le même prêtre, **plus proche / face caméra**, main tendue vers le spectateur comme s'il demandait une pièce, regard direct, léger sourire de circonstance. **Fond transparent, isolé, sans ombre, sans halo.** PNG transparent. »

**c) `pretre_sermon_joyeux`** — bras ouverts, bienveillant.
> « Le même prêtre en plein **sermon joyeux**, bras ouverts, visage lumineux et bienveillant, bouche ouverte (parle). Même échelle/angle. **Fond transparent, isolé, sans ombre, sans halo.** PNG transparent. »

**d) `pretre_sermon_vener`** — menaçant, doigt accusateur.
> « Le même prêtre en **sermon vénère**, visage dur et courroucé, doigt pointé/accusateur, posture menaçante, bouche criant. Même échelle/angle. **Fond transparent, isolé, sans ombre, sans halo.** PNG transparent. »

*(Option : 2 frames par sermon pour une boucle bouche/bras.)*

---

## 3. LES HALOS PEINTS + REFLETS (l'humeur baigne la nef)
La lumière d'ambiance = calque peint plein cadre semi-transparent, + ses reflets sur vitraux et murs. Deux humeurs :

**Joyeux :**
- `cathedrale_halo_joyeux` — voile doré chaud sur toute la nef.
  > « Nappe de lumière **dorée chaude** qui baigne une nef, plein cadre, semi-transparente, douce, sans objet — juste l'ambiance lumineuse joyeuse. Bords fondus. **Fond transparent** (PNG), pensée pour se poser en surimpression sur une scène. »
- `cathedrale_reflet_vitraux_joyeux` — taches de lumière chaude **sur les vitraux** uniquement.
  > « Reflets de lumière **dorée** posés uniquement sur deux grands vitraux gothiques (mêmes formes/positions que la cathédrale), le reste transparent. **Fond transparent**, sans ombre. PNG. »
- `cathedrale_reflet_murs_joyeux` — halos chauds **sur les murs/piliers**.
  > « Taches de lumière **dorée** sur les murs et piliers d'une nef (positions cohérentes), reste transparent. **Fond transparent**, PNG. »

**Vénère :** mêmes 3 calques en `_vener`, teinte **rouge sang / pourpre**, plus dures.
> (reprends les 3 prompts ci-dessus en remplaçant « dorée chaude/douce » par « **rouge sang, dure, inquiétante** ».)
> Fichiers : `cathedrale_halo_vener`, `cathedrale_reflet_vitraux_vener`, `cathedrale_reflet_murs_vener`.

---

## 4. OBJETS À ÉTATS (swap au clic)

**Cierges — `cathedrale_cierges_on` (+ vacillement `_1.._3`)**
> « Présentoir de cierges d'église **allumés**, flammes chaudes, coulures de cire, même style/échelle/angle. **Fond transparent, isolé, sans ombre, sans halo.** PNG transparent. » (sors **3 variantes** de flammes → boucle de vacillement.)

**Vitrail sombre — `cathedrale_vitrail_dark_on`**
> « Grand vitrail gothique **démoniaque allumé**, verre illuminé de rouges/pourpres, motifs psyché catholiques. Même forme/position/échelle que le vitrail gauche. **Fond transparent, isolé, sans ombre.** PNG. »

**Vitrail angélique — `cathedrale_vitrail_ange_on`**
> « Grand vitrail **angélique allumé**, or et bleus clairs, figure céleste douce. Même forme/position/échelle. **Fond transparent, isolé, sans ombre.** PNG. »

**Pupitre — `cathedrale_pupitre_on`**
> « Pupitre/autel **mis en lumière** (micro ou bougie qui s'allume), lumière propre sur l'objet seulement, même position/échelle. **Fond transparent, isolé, sans ombre.** PNG. »

**Confessionnal — 2 présences : `confess_cure` / `confess_dj`**
> « Confessionnal en bois, **rideau éclairé de l'intérieur**, une silhouette derrière la grille : version **curé** (dignes) / version **DJ de radio pirate** (casque, clin d'œil nightlife). Même position/échelle. **Fond transparent, isolé, sans ombre.** 2 PNG. »

---

## 5. ACCENTS VIVANTS (boucles)

**Encens — `cathedrale_encens_1..5`** (volute qui monte, se dissipe)
> « Volute de fumée d'encens qui monte, style peint, **5 images** (naissance → montée → dissipation) d'une même volute. **Fond transparent, sans halo.** PNG transparents. »

**Rosace — `cathedrale_rosace`** (tourne très lentement, idle)
> « Rosace gothique détourée (mêmes motifs/position que la rosace du fond), pensée pour **tourner lentement** en boucle. **Fond transparent, isolé, sans ombre.** PNG. »

---

## 6. L'HOSTIE 3D — la porte cachée (060 §4)
L'objet comestible de la cathédrale. On la mange → **bascule 3D** (three.js).
- `cathedrale_hostie` (calque objet, sur l'autel, cliquable) :
  > « Hostie/calice sur l'autel, petit objet cliquable détouré, même position/échelle. **Fond transparent, isolé, sans ombre.** PNG. »
- (option anim d'ingestion : 2–3 frames de l'hostie qui disparaît.)
Recréation 3D : **piste 2.5D** — je réutilise `cathedrale_base` + les calques comme plans étagés pour se balader dans la nef. (Décision proto.)

---

## Nommage (récap)
`scenes/cathedrale_base.webp` · `scenes/overlays/cathedrale_<objet>_<etat>.webp` · `scenes/overlays/cathedrale_halo_<humeur>.webp` · `scenes/overlays/cathedrale_reflet_<cible>_<humeur>.webp` · `scenes/perso/pretre_<pose>.webp` · `scenes/overlays/cathedrale_encens_<n>.webp` · `public/media/3d/cathedrale_*.glb`

## Ordre conseillé
1. `cathedrale_base`.
2. Le **prêtre** (idle → demande → joyeux → vénère) + `halo_joyeux/vener` + reflets — le cœur vivant.
3. Cierges `on` + `_1.._3`.
4. Vitraux `dark_on` / `ange_on`.
5. Encens, rosace, confessionnal, hostie-3D.

Dépose un calque, dis-moi son nom → je le branche (sur `localhost:4321`).
