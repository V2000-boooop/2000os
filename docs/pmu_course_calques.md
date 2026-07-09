# PMU — Course : architecture en calques + packs de prompts

## UNIVERS / DA (à respecter dans TOUS les prompts)
**Aviron Bayonnais** — stade de rugby de nuit (Stade Jean-Dauger, Bayonne) sous les **projecteurs**,
tribunes aux couleurs **bleu ciel & blanc**. Ambiance Sud-Ouest / Pays Basque, populaire et festive :
**PMU**, **stand merguez** qui fume (barbecue), bière, **ravers** ET **familles** dans les gradins.
Rendu **façon stage de Street Fighter II** : décor riche, détaillé, plein de vie, personnages
secondaires dans le fond, parallaxe, cartoon rétro nuit PS2, un peu compressé/scanné.

Jeu : `src/os/nightdrive/PmuCourse.svelte` (données `courses.js`). Aujourd'hui tout est dessiné en code ;
on remplace couche par couche par tes images. Dépose dans `public/media/nightdrive/pmu/course/`.
Je re-câble le composant pour lire chaque calque + ses états dès que le pack arrive.

## CONSTRUCTION — TRÈS IMPORTANT (sinon inutilisable)
Le jeu **défile horizontalement** (les coureurs avancent longtemps) → tout le décor est fait de
**BANDES PLATES, vues STRICTEMENT DE CÔTÉ / DE FACE (vue orthographique / élévation)**, façon
**calque de stage Street Fighter 2** :
- **AUCUNE perspective de fuite, AUCUN point de fuite, AUCUN sol qui s'enfonce vers l'horizon.**
- Caméra perpendiculaire au décor. Les gradins/le public sont **de FACE** (frontaux), la piste est une
  **bande horizontale plate** en bas → les coureurs passent **pile de profil** devant.
- Chaque bande est **tileable horizontalement** (bords gauche/droite raccordables, motif répétable).
- Les **éléments uniques** (stand merguez, clocher, char, etc.) sont des **sprites séparés posés une fois**
  (PAS dans une bande répétable, sinon ils se dupliquent).

## Les calques (du fond vers l'avant) + états

| # | Calque | Fichier(s) | Format | États / mouvement |
|---|---|---|---|---|
| 1 | **Fond** ciel + arènes + gradins vides | `pmu_bg.png` | **plein cadre 16:9, opaque** (pas de vert) | statique (parallaxe lente) |
| 2 | **Feux d'artifice** (sur le fond, à la victoire) | `pmu_fx_1..6.png` | **fond vert**, transparent | 6 frames animées, jouées si on GAGNE |
| 3 | **Public** (bande de spectateurs) | `pmu_crowd_idle_1..2`, `pmu_crowd_hype_1..2`, `pmu_crowd_sad_1..2` | **fond vert**, bande horizontale tileable | idle (2 fr, léger mouvement) · hype bras en l'air (2 fr, à l'arrivée) · déçu (2 fr) |
| 4 | **Piste** | `pmu_track.png` | bande horizontale **tileable**, opaque | statique (défile) |
| 5 | **Coureurs** (par animal) | `<key>_run_1..4`, `<key>_win_1`, `<key>_lose_1` | **fond vert**, profil face DROITE | course (4 fr) · gagnant (1) · perdant (1) |
| 6 | **Bêtises 1er plan** | `pmu_prop_<nom>.png` | **fond vert**, isolés, petits | fixes ; `pigeon` en 2 fr |

Règles d'or (toutes images) : **un seul élément par image** (sauf la bande public), **aucun texte**,
style DA Vincent 2000 (cartoon rétro nuit PS2, cohérent avec le fighter), vue **de côté**.
« fond vert » = **#00b140 uni** (je détoure). « plein cadre » = image complète, pas de vert.

---

## PACK A — Décor de base (3 BANDES plates tileables, PLEIN CADRE, PAS de vert)
Vue STRICTEMENT de face/côté (élévation), AUCUNE perspective de fuite, tileable horizontalement.
> 3 images séparées, style calque de STAGE STREET FIGHTER 2 (vue de face plate, sans point de fuite), cartoon rétro nuit PS2 un peu compressé/scanné. Palette Aviron Bayonnais **bleu ciel & blanc** + jaune sodium + bleu nuit. Format bande large horizontale, bords gauche/droite raccordables (tileable). Aucun texte lisible.
> 1) CIEL : bande de **ciel nocturne** étoilé, lune, au loin la silhouette plate de Bayonne (clocher de la cathédrale, toits) et quelques **projecteurs de stade** allumés — vue de face, plate, tileable, sans sol.
> 2) GRADINS : **tribunes VIDES de l'Aviron Bayonnais vues DE FACE** (frontales, plates, façon mur de fond), couleurs bleu ciel & blanc, drapeaux AB, panneaux **PMU**, barrière publicitaire en bas — bande tileable, AUCUN spectateur (le public est un calque séparé), pas de perspective.
> 3) PISTE : **bande de sol plate vue de côté** (terre/pelouse de piste de nuit), lignes de couloir blanches horizontales, quelques marqueurs — tileable, plate, sans perspective, aucun personnage.

## PACK A-bis — Éléments uniques du décor (fond vert, posés une seule fois)
> Éléments **isolés fond vert #00b140**, vue de face/côté plate, style raccord : 1) **stand à merguez/barbecue qui fume** (buvette basque) · 2) grand **mât de projecteurs** de stade allumé · 3) **banderole Aviron Bayonnais** (bleu ciel/blanc) · 4) **char/tracteur PMU** ou remorque déco. (posés ponctuellement sur la piste/les bords, ne se répètent pas).

## PACK B — Public (fond vert, 6 images) — bande de spectateurs tileable
> 6 images d'une **bande horizontale de spectateurs** (têtes + bustes serrés, foule variée, style cartoon rétro), **fond vert uni #00b140**, bord gauche/droite raccordables (tileable), aucun texte.
> 1) idle A (assis, léger mouvement) · 2) idle B (variation, respiration) · 3) hype A (bras en l'air, acclament) · 4) hype B (variation bras/sauts) · 5) déçus A (têtes basses, bras ballants) · 6) déçus B (variation).

## PACK C — Feux d'artifice (fond vert, 6 images)
> 6 frames d'une **explosion de feu d'artifice** au-dessus d'un stade, style cartoon rétro, couleurs vives (or, rose, cyan, vert), **fond vert uni #00b140**, transparent autour, aucune ligne d'horizon, aucun texte. Séquence : 1) départ/traînée qui monte · 2) début d'explosion · 3) explosion pleine · 4) retombée en gerbes · 5) étincelles qui tombent · 6) dissipation.

## PACK D — Bêtises 1er plan (fond vert, 8 images, isolées, petites)
> 8 objets/petits éléments **isolés**, style cartoon rétro, **fond vert uni #00b140**, aucun texte :
> 1) bouteille de vin/Ricard vide couchée · 2) béret basque tombé au sol · 3) pigeon posé (pose A) · 4) même pigeon (pose B, il picore) · 5) plot de chantier orange · 6) ticket PMU froissé · 7) mégot/paquet de clopes · 8) petit chien (chihuahua) qui regarde.

## PACK E (et suivants) — Un pack PAR ANIMAL coureur (fond vert, 6 images)
Refais ce pack pour chaque partant (éclair, txakoli, gazelle, mulet, sanglier… ou tes animaux).
Si tu as déjà un « idle » de l'animal, joins-le en référence.
> 6 images du MÊME animal coureur (même bête, mêmes couleurs/proportions), **profil vu de côté tourné vers la DROITE**, style cartoon rétro, **fond vert uni #00b140**, aucun texte :
> 1) course frame 1 (galop, jambes tendues) · 2) course frame 2 (regroupé) · 3) course frame 3 (poussée) · 4) course frame 4 (extension opposée) · 5) **VAINQUEUR** (cabré/joyeux, tête haute) · 6) **PERDANT** (essoufflé, tête basse).

---

## Ordre conseillé
A (décor) → B (public) → C (feux) → D (bêtises) → E×N (animaux).
À chaque pack déposé, je détoure (vert), je découpe/tileable si besoin, et je re-câble le calque + ses états dans `PmuCourse.svelte` (le code garde des placeholders tant qu'un calque manque).
