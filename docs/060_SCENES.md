# 060 — SCÈNES (Le système Collage vivant + Mode 3D)

> **Rôle :** définit comment toute scène du monde (Night Drive et au-delà) est construite, animée et rendue vivante — par **collage de calques peints**, jamais par lumière synthétique. Définit aussi la **bascule 3D** (manger un objet → se balader dans la scène). C'est la méthode unique du projet.
> **Dépendances :** `005_DESIGN_PRINCIPLES.md`, `010_IDENTITE.md`, `030_OS.md`, `050_SON.md`, `070_VISUAL_LANGUAGE.md`.
> **Révision :** 2026-07-06 — v1, posée avec Vincent (méthode barque validée, prêtre vivant, bascule 3D).

---

## 0. La règle d'or

**Tout est collage.** Chaque scène = un décor peint + des calques peints détourés qui se remplacent, s'empilent, s'animent. **Aucune lueur CSS, aucun halo synthétique** : c'est toujours *l'image* qui porte la lumière, l'état et l'émotion. Style de référence : **Arcane × GTA** (peinture riche, détourage net, irrévérence nocturne). Cette méthode est la **même pour toute scène du projet**.

Corollaire technique : le CSS/JS ne fait que **placer, échanger, boucler et faire respirer** des calques. Il ne *dessine* jamais de lumière.

---

## 1. Anatomie d'une scène (taxonomie des calques)

Toute scène se décompose en 5 familles de calques :

**a) Le FOND (`<scene>_base`).** Le décor « mort » : m-urs, sol, architecture, objets non vivants. **Sans** les éléments à états, **sans** flammes/vitraux allumés, **sans** perso. C'est le socle immobile (parallaxe légère au regard autorisée).

**b) Les OBJETS-CALQUES.** Chaque objet interactif est un calque détouré, **placé en % (x,y,w,h)** sur le fond. Il porte un ou plusieurs **états** (`off/on`, `fermé/ouvert`, `vide/plein`, ou un cycle à N états). L'état par défaut `off` = aucun calque (le fond suffit). Clic/survol → swap de calque (fondu court).

**c) Les PERSO (silhouettes vivantes).** Détourés, posés sur le fond, avec **idle** (respiration/balancement) + **poses** (séquences de frames) + **réactions** au clic. Peuvent **rompre le 4e mur** (venir vers l'écran). Méthode déjà en place : Myrtille / Stick sur la barque.

**d) Les HALOS PEINTS.** La lumière d'ambiance est un **calque peint**, pas un dégradé CSS. Un halo a des **humeurs** (ex. `dark`, `joyeux`, `véner`) = plusieurs calques. Un halo peut projeter un **reflet peint** ailleurs : sur les **vitraux**, sur les **murs**. Donc un même état d'humeur = un petit *jeu* de calques (halo principal + reflets).

**e) Les ACCENTS VIVANTS.** Boucles de frames peintes : fumée/encens qui monte, flamme qui vacille, rosace qui tourne lentement, néon qui pulse (peint, pas CSS). 3–5 frames suffisent.

---

## 2. Le système d'états & d'humeur — cas d'école : LE PRÊTRE

Le prêtre de la cathédrale est le **modèle de référence** du perso vivant à humeur. Il condense tout le système :

**Cycle de vie :**
1. **Idle** — il est là, dans la nef, il respire (calque idle + micro-anim).
2. **Il rompt le 4e mur** — de temps en temps il **vient vers l'écran** demander *une pièce* (pose « demande » + bulle/voix). C'est un vrai moment de jeu.
3. **La réponse du joueur mémorise son humeur :**
   - **OUI (on donne)** → humeur **joyeuse**.
   - **NON (on refuse)** → humeur **vénère**.
4. **Le sermon** rejoue plus tard **selon l'humeur mémorisée** :
   - **Joyeux** → prêtre souriant (calques/anim doux), **halo doré**, **reflets chauds** sur vitraux + murs, son bienveillant.
   - **Vénère** → prêtre dur (calques/anim tendus), **halo rouge/dark**, **reflets durs**, son menaçant.

**Ce que ça implique en calques (à prévoir dès la génération) :**
- Perso : `pretre_idle`, `pretre_demande`, `pretre_sermon_joyeux`, `pretre_sermon_vener` (chacun 1 pose ou une petite séquence).
- Halos : `halo_joyeux`, `halo_vener` (calque d'ambiance) + leurs **reflets** `reflet_vitraux_joyeux/vener`, `reflet_murs_joyeux/vener`.
- Son (cf. 050) : `sermon_joyeux`, `sermon_vener`, + le hook « demande de pièce ».

**Règle de conception généralisable :** un perso à humeur = *(jeu de poses) × (jeu de halos + reflets) × (variantes de son)*, pilotés par un **état mémorisé**. On réutilise ce patron pour tout personnage du projet.

---

## 3. Penser les calques À L'AVANCE (cahier des charges des prompts)

On **imagine et liste les calques avant de générer**, scène par scène, pour qu'ils sortent **nickel et détourables**. Chaque prompt de calque doit imposer :

- **Fond transparent, objet/perso isolé, AUCUNE ombre portée, AUCUN halo peint autour** (le halo est un calque séparé).
- **Même cadrage + même résolution que le fond de la scène** (cible 1920×1080) → empilement au pixel.
- **Même direction de lumière et même style** (Arcane/GTA, DA du projet).
- **Marge de sécurité** autour de l'objet (pas collé au bord), bords nets (pour le détourage).
- Pour un objet à états : générer **tous les états d'un coup**, mêmes contours (calage parfait).
- Nom de fichier = le branchement (voir §5).

Livrable type par scène = **une liste nommée** : le fond + chaque objet-calque (avec ses états) + chaque perso (avec ses poses/humeurs) + halos + reflets + accents. (Ex. fait : `barque_calques.md`, `cathedrale_calques.md`.)

---

## 4. LE MODE 3D — « manger un truc » → se balader

**Mécanique transversale, une par scène.** Dans chaque scène il y a **un objet comestible** (hostie à la cathédrale, pizza/olive/cachou à la barque, cacahuète au PMU…). **On le mange → bascule en 3D** : la scène se recrée « d'une certaine manière » en **three.js** et on peut **s'y balader**.

**Deux pistes de recréation 3D (à trancher au proto) :**
- **2.5D / billboards étagés** — on réutilise **les mêmes calques peints** comme plans disposés en profondeur (fond, objets, perso), caméra qui bouge → parallaxe volumétrique. *Avantage : zéro nouvel asset, la DA peinte est conservée.* **Piste privilégiée.**
- **Low-poly natif** — props modélisés (déjà : `tools/make_props.py`, moteur `Scene3D.svelte`). *Avantage : vraie 3D navigable ; coût : refaire les assets en volume.*

**Règles :** entrée par l'objet comestible (petit rituel/anim d'ingestion), sortie propre (retour au collage 2D à l'endroit quitté), cohérence DA (même palette, grain), légèreté (webp/GLB compressés, cf. `3d_assets.md`). Le socle three.js existe (`src/os/three/`), la galerie de test `/test3d`.

**À noter :** le mode 3D n'est pas un gadget — c'est la **récompense** cachée de chaque scène (esprit arcade/GTA : un secret comestible qui change la dimension).

---

## 5. Convention de nommage & fichiers

- Fond : `public/media/nightdrive/scenes/<scene>_base.webp` (ou paire `off/on` héritée).
- Objets à états : `public/media/nightdrive/scenes/overlays/<scene>_<objet>_<etat>.webp`.
- Perso/poses : `public/media/nightdrive/scenes/perso/<nom>_<pose>.webp`.
- Halos/reflets : `.../overlays/<scene>_halo_<humeur>.webp`, `.../overlays/<scene>_reflet_<cible>_<humeur>.webp`.
- 3D : `public/media/3d/<objet>.glb`.
- Sons : cf. `050_SON.md` + `sons_a_produire.md`.
- Le registre des scènes (positions, états, branchements) vit dans `src/os/nightdrive/scenes.js` (**données**, pas de code par scène).

**PNG transparent en entrée, je convertis en webp.** Poids : cf. optimisation assets (114 Mo → 17 Mo, méthode `tools/optimize_assets.sh`).

---

## 6. Déjà câblé (base technique en place)

- **Collage d'état générique** : `overlays[]` dans `scenes.js` → swap au clic (proto : cierges cathédrale).
- **Perso vivants** : idle + poses + séquences (barque).
- **Accents** : fumée (frames), eau (shimmer peint).
- **Son réactif** : `reactsound.js` (pitch/pan vivants, crossfade, ducking) — proto PMU.
- **3D** : `Scene3D.svelte` (+ Draco, orbite), galerie `/test3d`, `tools/make_props.py`, `tools/scan_3d.mjs`.
- **Prompts par scène** : `barque_calques.md`, `cathedrale_calques.md`.

## 7. Prochaines briques (base solide → construction)
1. Étendre le collage d'état au **halo peint + reflets** (vitraux/murs) et à l'**humeur mémorisée** (prêtre).
2. Généraliser le **4e mur** (perso qui vient à l'écran, demande, mémorise).
3. Poser la **bascule 3D** sur une scène pilote (piste 2.5D billboards).
4. Pré-écrire les **listes de calques** de chaque scène restante (taverne, LA RIDE, PMU, glovebox).

> Cette méthode est **non négociable et universelle** : collage peint, états, halos-calques, accents en boucle, et la porte 3D cachée. Toute nouvelle scène suit ce document.
