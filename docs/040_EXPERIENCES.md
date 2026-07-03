# 040 — EXPÉRIENCES (Le système Expériences)

> **Rôle :** définit les jeux et expériences interactives — les programmes du dossier Jeux et les parenthèses immersives (couche D de 030_OS).
> **Dépendances :** `005_DESIGN_PRINCIPLES.md`, `020_RESEARCH_ENGINE.md`, `030_OS.md`.
> **Révision :** 2026-07-03 — v0.1, règle fondatrice posée. S'enrichira jeu par jeu.

## Règle d'architecture : les destinations (jamais des « modes »)

Une parenthèse immersive n'est **jamais une expérience indépendante** : c'est **l'OS qui se métamorphose**. On ne quitte jamais Vincent 2000 OS — le même ordinateur devient autre chose, puis redevient lui-même. La voiture (Night Drive) n'est que la **première destination** ; suivront possiblement Miami Vice, ville sous la pluie, HAL2000, train de nuit, bord de mer…

**Le contrat des entités permanentes.** Le bureau possède des entités permanentes (dossiers, lecteur, barre des tâches, horloge, recherche, favoris, Internet, Corbeille…). Chaque destination définit simplement **l'équivalent de chaque entité** dans son monde — c'est le registre de correspondances (cf. `exploration/nightdrive_architecture.md`). Exemple Night Drive : lecteur → autoradio · barre des tâches → tableau de bord · recherche → GPS · horloge → horloge du dash · dossiers → bâtiments/enseignes · favoris → panneaux publicitaires · Internet → antenne radio au loin · Corbeille → casse automobile.

**Le visiteur doit comprendre que rien n'a disparu : tout s'est transformé.** Vocabulaire imposé : on dit « destination » ou « parenthèse immersive », jamais « mode ». C'est cette règle qui fera de Vincent 2000 OS un univers cohérent plutôt qu'une collection de mini-jeux.

## Règle fondatrice : chaque jeu est triple

Un jeu de Vincent 2000 OS n'est jamais qu'un jeu. Il est **à la fois** :

1. **Une expérience** — simple, rétro, efficace, jouable rapidement. Pas de grands jeux complexes : de petites machines qu'on comprend en dix secondes.
2. **Un voyage esthétique** — chaque jeu fait voyager dans les références de Vincent (vieux PC, culture rave, interfaces oubliées). C'est un lieu (030), avec son ambiance et son identité sonore propres.
3. **Une porte vers la collection** — certains jeux **débloquent de la matière personnelle** : sons, images, notes, extraits, recherches, morceaux cachés. Jouer peut récompenser.

## Les récompenses de collection

- Une récompense est une **pièce** (020) avec une dimension « cachée » : elle existe dans le système mais ne se révèle que par le jeu.
- Garde-fou (principe 2 vs principe 10) : le contenu débloqué est une **couche bonus**, jamais le seul accès à un contenu important. Ce qui se mérite est un supplément d'intimité, pas un péage.
- Une pièce débloquée rejoint naturellement le reste : elle peut être écoutée, vue, retrouvée par la recherche du visiteur qui l'a méritée.

## Lien avec P0

Chaque jeu est une mission créative complète : son concept, son esthétique, sa musique, ses bruitages, ses récompenses. Développer CAR.exe, c'est aussi composer ce qu'on écoute en conduisant.

## État des programmes (launcher v1 livré)

CAR.exe · PONG_2000.exe · RADIO.exe · HAL.exe · ???.exe · TEST.exe — splash + message pour l'instant. Chaque jeu sera développé indépendamment, remplaçant son splash sans toucher au launcher.
