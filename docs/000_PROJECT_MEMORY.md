# 000 — PROJECT MEMORY

> **Document de référence courant. À relire avant chaque nouvelle tâche. Max 3 pages.**
> Détail et historique des décisions : `090_DECISION_LOG.md`.
> Dernière révision : 2026-07-03

## Protocole de session (économie de contexte)

- Nouvelle conversation = Vincent écrit : « Lis docs/000_PROJECT_MEMORY.md puis : [tâche] ». Claude lit CE document, puis uniquement les fichiers nécessaires à la tâche.
- Un chantier = une conversation. Ne pas prolonger indéfiniment une même conversation.
- Claude ne relit jamais toute la bible ; chaque doc système est autonome.
- Réponses courtes, pas de récapitulatifs de ce qui est déjà écrit ici.

## Le projet en trois phrases

Vincent 2000 OS est l'**atelier numérique vivant** de Vincent 2000, identité artistique réelle d'un DJ, compositeur et sound designer. Il rend accessible sa matière créative (musiques, recherches sonores et visuelles, notes, archives, projets, jeux) à travers une interface immersive inspirée d'un ordinateur personnel 1998–2003 — **interprétation personnelle**, pas reconstitution. La frontière réel/mise en scène est volontairement floue.

## Règle d'or

Chaque interaction doit **faciliter la découverte du travail** ou **enrichir l'univers de Vincent 2000**. Sinon, elle n'a pas sa place. Le contenu important n'est jamais caché ; trouver une musique, une recherche ou un projet doit être rapide.

**Principe fondateur (P0) :** le site ne fait pas qu'archiver le travail, il le **provoque**. Chaque évolution du projet est une mission créative (identité sonore d'une fenêtre, morceau né d'une expérience, EP d'un mini-jeu…). À valeur égale, prioriser l'évolution qui déclenche le plus de création. Détail : `005_DESIGN_PRINCIPLES.md`.

## Rôles

- **Vincent** : directeur créatif (non-développeur ; veut comprendre les décisions à impact, avec options et compromis).
- **Claude** : directeur technique et développeur principal.

## Décisions validées (résumé)

| # | Décision |
|---|----------|
| D1 | Atelier numérique vivant ; trouvabilité du contenu = exigence de premier ordre. |
| D2 | Deux couches : chaque contenu = ressource indépendante avec sa propre URL (SEO, mobile, partage) ; l'OS = expérience principale de découverte. Deep-linking bidirectionnel. |
| D3 | Pipeline évolutif : phase 1 = fichiers dans le dépôt ; phase 2 = admin sur mesure. Le **schéma de contenu est le contrat stable**, jamais refondu. |
| D4 | Vincent 2000 = identité réelle, pas de personnage fictif. Mise en scène **optionnelle par contenu**. |
| D5 | Bureau multi-fenêtres complet (hub central) + **modes immersifs plein écran** (jeux, installations) avec retour au bureau. |
| D6 | Une langue au lancement (FR), schéma et URLs multilingues dès le départ. |
| D7 | Médias hybrides : sorties officielles via plateformes quand pertinent ; recherches, démos, archives, exclusivités **auto-hébergées**. |
| D8 | Rôles : Vincent créa / Claude tech (voir ci-dessus). |
| D9 | Aucun existant ; budget accepté ~10–50 €/mois. |
| D10 | Stack : **Astro** (couche contenu) + **Svelte** (OS) ; Cloudflare Pages + R2 (médias, zéro frais de sortie). |
| D11 | Documentation = **bible de systèmes indépendants** (voir structure ci-dessous). `000` = seule vérité courante ; historique dans `090`. |

## Contraintes permanentes

- Projet conçu pour évoluer plusieurs années : robustesse, modularité, extensibilité avant tout.
- Expérience utilisateur avant facilité d'implémentation. Dépendances minimales. Composants réutilisables.
- Ne jamais réécrire une partie fonctionnelle sans raison. Documentation maintenue en parallèle.
- Le format des données est le contrat ; les outils autour peuvent changer.
- Limiter la consommation de contexte : chaque document système est autonome et lisible seul.

## Structure de la documentation

```
000_PROJECT_MEMORY.md      Mémoire courante (ce document)
005_DESIGN_PRINCIPLES.md   Manifeste créatif — ADN de toute décision
010_IDENTITE.md            Le Noyau — Vincent 2000, ton, règles du monde
020_RESEARCH_ENGINE.md     Moteur de recherche créative — la matière et sa vie
030_OS.md                  Système Navigation — bureau, fenêtres, apps
040_EXPERIENCES.md         Système Expériences — objets immersifs plein écran
050_SON.md                 Système Sonore — transversal, signature du projet
060_VIE.md                 Système Vivant — évolution, traces, mémoire
070_VISUAL_LANGUAGE.md     (réservé) Langage visuel — DA, palette, typo, textures
090_DECISION_LOG.md        Journal détaillé des décisions
```

Convention : en-tête standard sur chaque document système (rôle, dépendances, date de révision). Toute décision changée = mise à jour de `000` + entrée dans `090`.

## État actuel

- **Phase : Creative Direction.** Le développement ne commence que lorsque la bible est solide.
- Fait : architecture validée (D1–D10), structure documentaire (D11), **005_DESIGN_PRINCIPLES validé**, **010_IDENTITE validé** (« La voix » volontairement en construction), **020_RESEARCH_ENGINE validé** (pièce/projet/dimensions/questions créatives ; terme « pièce » provisoire), **030_OS validé** (4 couches A×C×B×D : châssis / bureau-établi / constellation / parenthèses immersives ; règle « les applications sont des lieux »).
- Méthode actuelle : **prototype vivant** (fonctionnalité → UX rapide → dev → test → amélioration ; la doc suit le développement). La bible restante (040/050/060/070) s'écrira en suivant le projet.
- **Bureau v1 livré** (2026-07-03) : moteur de fenêtres, bureau catégories naturelles, scène restaurée (`src/data/session.js`), recherche v0, matière fictive (`src/data/content.js`). Puis v1 des dossiers : **Sons** (écoute directe, file, durées, « lire le dossier »), **Médias** (vignettes + visionneuse feuilletable), **Notes** (aperçu clic / bloc-notes double-clic), **Jeux** (launcher 6 .exe). **Favoris** : dimension `fav` (★) + dossier virtuel toutes matières.
- **Règle des jeux (040)** : chaque jeu = expérience simple et rétro + voyage esthétique + porte de déblocage de matière personnelle (récompenses = pièces cachées, toujours couche bonus, jamais péage).
- **Son (050)** : philosophie « le silence fait partie de l'identité » (retirer plutôt qu'ajouter ; l'écoute musicale est sacrée). **Famille UI v1 verrouillée** avec les vrais sons de Vincent (tick/open/close/minimize/launch). Restent à produire : restore, load_tick, select, deny, collect (`docs/UI_SOUND_TODO.md`). Outil : UI Sound Lab (recherche → « lab »).
- **Règle des destinations (040)** : une parenthèse n'est jamais une expérience indépendante — c'est l'OS qui se métamorphose. Entités permanentes du bureau → équivalents définis par chaque destination (registre de correspondances). Dire « destination », jamais « mode ». Night Drive = première destination (architecture : `docs/exploration/nightdrive_architecture.md`, 3 questions ouvertes). Aucun code encore.
- Lancement local : double-clic « Lancer Vincent 2000 OS.command » (nécessite Node.js).
- Bureau : **scène ouverte sur bureau très simple**. Règles OS : « la machine ne démarre jamais » (arrivée en cours de session, scène = activité réelle) ; « **trois niveaux de profondeur** » (1 : bureau = ordinateur normal avec **catégories naturelles** — Sons, Médias, Projets, Jeux, Notes, Internet, Corbeille — jamais les projets directement ; 2 : les dossiers révèlent l'univers ; 3 : liens/constellation presque infinis) ; « **le bureau est calme, les interactions sont exubérantes** » (minimalisme de composition, richesse dans le feedback : sons, micro-animations, matière — principe 9 du manifeste). Jamais de tableau de bord.
- **En cours : conception/développement du bureau v1.**
