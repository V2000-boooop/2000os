# NIGHT DRIVE — Architecture de la métamorphose

> Document de réflexion (aucun développement). L'expérience majeure : l'OS se métamorphose en un clic en une nuit de conduite rétro — Miami Vice / années 90-2000 / NFS Underground, en pixel art bitmap.
> Rattachement : `040_EXPERIENCES.md` (parenthèse immersive), `030_OS.md` (couche D), `050_SON.md`.
> 2026-07-03 — v1, en discussion.

## Le concept en une phrase

Ce n'est pas un thème sombre : c'est **le mode nuit de l'atelier pris au pied de la lettre**. Le même univers a deux états — le jour on travaille au bureau, la nuit on conduit dedans. Un interrupteur discret (comme clair/sombre), et l'ordinateur devient la ville où il vit.

## Principe directeur : rien n'apparaît, tout se transforme

La règle qui distingue une métamorphose d'un fondu : **chaque élément du décor nocturne est un élément du bureau qui a trouvé sa vraie place**. Le visiteur doit pouvoir se dire « le lampadaire… c'était le dossier Notes ». Corollaire architectural : il n'existe pas deux scènes, mais **un seul ensemble d'entités avec deux états**.

### Le registre des correspondances (cœur du système)

Chaque entité du bureau déclare son **destin nocturne** dans un registre central :

| Entité bureau | Destin nocturne (proposition — à diriger par Vincent) |
|---|---|
| 📁 Sons | l'autoradio du cockpit (là où vit la musique) |
| 📁 Médias | un panneau d'affichage lumineux au bord de la route |
| 📁 Projets | les façades/enseignes de la ville — **HANGAR devient le hangar**, CARMEN une enseigne néon : les projets SONT les bâtiments |
| 📁 Jeux | une salle d'arcade entrevue |
| 📁 Notes | un lampadaire (les idées éclairent la route) |
| 🌐 Internet | l'antenne radio sur la colline, led rouge clignotante |
| ★ Favoris | des panneaux publicitaires (teasers de vraies pièces) |
| 🗑 Corbeille | une casse auto au loin |
| Fenêtre lecteur | se glisse dans l'autoradio (l'écoute en cours continue en voiture) |
| Autres fenêtres | se replient dans la boîte à gants |
| Horloge de la barre | l'horloge du tableau de bord (la même heure) |
| Recherche | le GPS (plus tard : chercher = choisir une destination) |
| Barre des tâches | le tableau de bord lui-même |

Le registre est **bidirectionnel** : la même table pilote l'aller et le retour. Retour = chorégraphie inverse, plus courte, et chaque chose reprend exactement sa place (règle 030 des parenthèses — état du bureau snapshoté avant départ, restauré après).

## La chorégraphie (aller ≈ 6–9 s, en 4 actes)

1. **La bascule** (~1 s) — clic sur l'interrupteur : la lumière du bureau change, les ombres s'allongent, le fond glisse vers la nuit. Aucun élément ne bouge encore. (Son : la ville s'approche au loin.)
2. **La migration** (~3 s) — les icônes quittent leur grille une par une (stagger), chacune vole vers sa position finale dans le décor **en se transformant en route** (icône → silhouette → sprite pixel). Les fenêtres se replient. Techniquement : animation de type FLIP — on capture la position de départ de chaque élément DOM, la position d'arrivée est dictée par la scène, la trajectoire et la mutation sont animées élément par élément. Jamais de fondu global.
3. **L'assise** (~2 s) — le tableau de bord monte depuis le bas de l'écran (la barre des tâches s'épaissit et devient le dash), le volant apparaît, le cadre se resserre : on réalise qu'on est assis dans la voiture.
4. **Le contact** (~1 s) — clé, moteur, phares : la route s'allume, la radio s'accroche à une fréquence, le mix démarre. La conduite est à nous.

## Architecture technique en trois couches

### 1. Transition : DOM chorégraphié
La métamorphose s'anime **dans le DOM** (les vrais éléments du bureau bougent — c'est ce qui rend la continuité crédible). Chaque entité porte trois représentations : `jour` (icône/fenêtre actuelle), `chrysalide` (forme intermédiaire animable), `nuit` (sprite pixel). Un orchestrateur (timeline unique, interruptible) déroule les 4 actes.

### 2. Scène : canvas pixel art basse résolution
Au moment exact où l'acte 4 s'achève, un **canvas prend le relais**, initialisé pour dessiner les sprites aux positions exactes où le DOM les a laissés (handoff invisible). Rendu : résolution interne basse (~320×180) upscalée en pixels nets — esthétique bitmap authentique ET budget de performance quasi nul. La conduite utilise la technique pseudo-3D des jeux d'arcade (route raster type OutRun/NFS 2D) : spectaculaire, rétro par nature, léger. Pas de vraie 3D — elle coûterait cher et trahirait l'époque.

### 3. Audio : trois bus WebAudio
Le son est l'âme de l'expérience — architecture dédiée, prolongement direct de 050 :

- **Bus MIX** — le mix continu de Vincent 2000 : de longs segments auto-hébergés (D7), enchaînés/mélangés par le moteur. Chaque session peut varier l'ordre → chaque conduite est une écoute différente.
- **Bus RADIO** — la fiction de la FM : parasites, scans, jingles, voix lointaines, déclenchés par événements (changement de fréquence par le visiteur, transitions du mix). Changer de station = crossfade + bruit de scan + nouveau segment.
- **Bus DIÉGÈSE** — moteur (boucle dont le pitch suit la vitesse), circulation, pluie optionnelle. Mixé sous la musique, jamais au-dessus.

L'écoute en cours au moment de la bascule est **absorbée** : le morceau du lecteur devient la première « station », puis le mix prend le relais. Au retour, le lecteur retrouve son état exact.

## Cohérence avec la philosophie

- **P0 incarné** : ce chantier provoque des mixes, des jingles, des voix, du sound design moteur, du pixel art, des enseignes — c'est la plus grosse mission créative du projet à ce jour.
- **040 au complet** : expérience + voyage esthétique + **porte de collection** — la radio peut diffuser des inédits ; entendre un morceau caché en conduisant peut le débloquer dans l'atelier (récompense-pièce). Les panneaux publicitaires peuvent teaser de vraies pièces.
- **Principe 9** : la ville est calme (nuit, néons épars), l'exubérance est dans la radio, le moteur, la pluie.
- **Règles des parenthèses** (030) : entrée choisie (l'interrupteur), sortie toujours évidente (frein à main → métamorphose inverse), retour à l'état exact.
- **Le silence (050)** : la bascule n'a pas de « son de bouton » — c'est le monde qui sonne, pas l'interface.

## Risques et compromis identifiés

1. **Le piège du fondu** : si la migration est trop rapide ou trop groupée, l'œil lit un fondu. Parade : stagger net, trajectoires individuelles, et 2–3 correspondances « lisibles » mises en avant (on doit suivre AU MOINS le lecteur → autoradio des yeux).
2. **Mobile/petits écrans** : la chorégraphie doit dégrader proprement (moins d'actes, même destination). À traiter quand la stratégie mobile sera posée.
3. **Poids audio** : un mix continu = gros fichiers. Segments streamés à la demande (R2, D10) et chargés pendant les actes 1–3 (la métamorphose est aussi un écran de chargement déguisé — personne ne le saura).
4. **Interruption** : le visiteur clique pendant la métamorphose ? La timeline doit être interruptible et réversible à tout instant (pas de tunnel).

## Phasage proposé (quand on développera)

- **M1 — La bascule** : métamorphose aller/retour complète + cockpit statique + radio qui joue le mix (pas encore de conduite). Déjà magique en soi.
- **M2 — La conduite** : route pseudo-3D, vitesse, moteur lié, décor défilant avec les bâtiments-projets.
- **M3 — Le monde** : stations multiples, pluie, récompenses de collection, GPS, easter eggs.

## Questions ouvertes pour Vincent

1. Le nom de l'interrupteur et sa forme (lune ? clé de contact ? « NUIT » ?).
2. Les correspondances du registre : la table ci-dessus est une proposition — c'est une décision de directeur créatif, chaque destin doit être signifiant.
3. Le mix : un seul long mix découpé, ou plusieurs « stations » thématiques dès M1 ?
