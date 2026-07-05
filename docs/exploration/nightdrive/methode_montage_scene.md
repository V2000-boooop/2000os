# MÉTHODE — Montage d'une scène (Higgsfield + calques)

> Le pipeline validé (nuit du 2026-07-04→05) pour construire une scène Night Drive
> vivante à partir de Higgsfield. Reproductible scène par scène. À relire avant
> de monter une nouvelle scène. Résumé courant : `000_PROJECT_MEMORY.md`.

## Principe

Une scène = **empilement de calques**, pas une seule image :
`fond (décor + objets)` → `perso découpés (animés)` → `avant-plan (objets qui passent devant)` → `zones interactives (survol)`.
Chaque calque est généré/détouré séparément → on peut animer, déplacer, éclairer indépendamment.

## 0. Higgsfield est connecté (MCP)

Claude pilote la génération : `generate_image`, `remove_background`, `job_display`, `models_explore`.
**Contrainte réseau** : le sandbox Claude ne peut **ni uploader ni télécharger** sur les serveurs Higgsfield.
Donc :
- **Référence d'entrée** : `media_upload_widget` (Vincent choisit le fichier, son navigateur l'upload) OU le `job_id` d'une génération précédente (chaînage direct, pas de re-upload).
- **Résultat** : il s'affiche dans le **widget** → **Vincent le télécharge et le dépose** dans `public/media/nightdrive/scenes/`. Claude ne rapatrie jamais l'image lui-même.
- Coût : ~1,5 crédit/image (grok), preflight avec `get_cost:true`. 2k dispo sur nano_banana.

## 1. Générer les images (règles anti-dérive)

- **NE PAS chaîner les générations grok** → ça dégrade (sépia, détails qui sautent : cordes qui apparaissent/disparaissent). Toujours **repartir de la ref de base**, le **moins de passes possible**.
- **Modèles** :
  - `grok_image`, `aspect_ratio:"auto"` → garde le **3:2** de la référence. Bon pour relight/variation.
  - `nano_banana_2` (Google) → **édition cohérente** (ne redessine pas, garde l'image). **Forcer `aspect_ratio:"3:2"`** (sinon défaut 3:4 = portrait qui recadre). Idéal pour dériver le OFF depuis le ON, ou éditer un détail sans tout casser.
- **Décor + objets** : générer le **fond SANS perso**, puis :
  - `OFF` (au repos, sombre) et `ON` (tout allumé) **dérivés d'UNE seule base** (`ON = relight du OFF`, chaîné par job_id) → cohérence garantie, objets bien séparés = détourage propre.
- **Perso** : générer **chacun SÉPARÉMENT, sur fond neutre**, pose isolée pleine hauteur (« clean silhouette, plain dark background, easy to cut out »). Puis `remove_background` → PNG transparent.
- **Injecter la DA** dans chaque prompt (070) : rétro 1998–2004, PS2/GTA, nuit sodium/néon fatigué, Bayonne/Pays Basque, usé/compressé, « jeu culte oublié pas illustration IA ».

## 2. Nettoyage local (cv2 / PIL, dans le sandbox)

- **Perso** : `remove_background` laisse des îlots → garder **la plus grosse composante connexe** de l'alpha (`cv2.connectedComponentsWithStats`), puis `getbbox()` + trim + resize (~900 px de haut). Fichiers dans `scenes/perso/`.
- **Objets** : `python3 tools/build_zone_masks.py` (recette stricte diff OFF/ON) → sprites `scenes/lights/<scene>_<zone>.png`.
- **Retouches fond** : effacer un objet gênant = `cv2.inpaint(TELEA)` sur OFF **et** ON, même région.
- **Écriture mount** : le dossier connecté autorise **create/cp** mais **pas unlink/overwrite direct**. Donc : générer dans `/tmp`, puis `shutil.copy`/`cp` par-dessus le fichier existant (le cp tronque, ça passe). PIL `.save()` direct sur un fichier existant échoue.
- **Avant-plan** : découper l'objet (ex. lanterne) depuis le OFF avec un **masque SERRÉ sur sa silhouette** (bord quasi net, blur ≤1,5) → `scenes/fg/<obj>_front.png`. Un masque trop large/flou bave sur les perso derrière.

## 3. Montage (registre + moteur)

Dans `src/os/nightdrive/scenes.js`, la scène porte :
- `off`/`on` : le fond (paire cohérente).
- `zones: [...]` : objets détourés (survol OFF→ON via `lum`), portes (`goto`), gestes (`open`), lueur sinon. `z:` si posé sur la planche (au-dessus de la blockzone).
- `personnages: [...]` : `{id, x, y, w, h, src, anim}` — sprite transparent unique + **halo au survol** (`.perso.solo:hover`), idle CSS (`anim:'lean'`=respiration / `'gaze'`=balancement, pivot aux pieds). (Variante off/on possible.)
- `foreground: [...]` : `{id, src, x, y, w, h}` — calques rendus **DEVANT les perso** mais **SOUS les zones** (`pointer-events:none`, le clic traverse). Ordre DOM dans `.sc` : images → perso → **foreground** → zones. Ex. la lanterne passe devant le perso assis derrière ; la lueur de survol (zone) repasse par-dessus.

## 4. QC + build

- **Composite PIL** de contrôle : fond + perso + avant-plan. **Respecter `object-fit:contain`** (garder l'aspect du sprite, centré dans sa boîte) — sinon l'aperçu ment sur l'overlap réel.
- `npm run build` en fin d'itération (copie sandbox `/tmp/v2000` : rsync + `npm install` si le sandbox s'est recyclé, sinon build direct ; le mount bloque `.vite`).

## Format

- Scènes : **3:2** (1536×1024 ou 1248×832). OFF et ON **même taille**. Perso : portrait 2:3, fond neutre.
- Arbo : `public/media/nightdrive/scenes/` (+ `perso/`, `fg/`, `lights/`).

## Identité des perso (barque — à réutiliser)

Hybrides extraterrestres **ambigus** (« humain ou alien ? ») : **peau bleu-violet translucide**, **visage ~85 % humain** aux traits légèrement allongés (jamais créature). Rendu 3D « jeu culte » (PS2/GTA), nuit chaude (pas sépia).
- **Le raver** (droite, en tailleur, regard ciel) : mullet, boucle d'oreille, bob, survêt Firebird 3 bandes + accents néon, colliers de perles, Dr Martens.
- **La punkette** (gauche, sur le banc du fond, sourire au ciel) : typée Afrique, crête de dreads sous capuche à moitié mise, piercings/boucles/balafre, bomber sur sweat, jean slim, Dr Martens, monochrome, **aucun signe/texte**.

## État barque (fin de session)

Fond OFF/ON sans perso + 11 zones objets détourées · CD effacé (inpaint) · lanterne en avant-plan éteinte (s'allume au survol) · 2 perso alien découpés, posés, idle + survol. Build vert.
**Ouvert** : vérifier au hard-refresh que le pied de la punkette passe bien derrière la lanterne (cache navigateur suspecté) ; poses/frames pour vraie anim ; appliquer la méthode aux autres scènes (cathédrale, taverne, PMU…).
