# Exploration 030 — Trois concepts d'OS

> Document de travail (pas un document système). Sert à choisir l'architecture d'expérience de l'OS avant d'écrire `030_OS.md`.
> 2026-07-03 — concepts A/B/C proposés par Claude, en discussion.

Les trois concepts partagent les acquis : bureau multi-fenêtres (D5), apps = vues sur les dimensions de la matière (020), recherche rapide toujours accessible (principe 2), modes immersifs traités dans 040.

---

## Concept A — « Le bureau habité »

**Philosophie :** un desktop classique réinterprété. La singularité ne vient pas de la structure (familière, immédiatement utilisable) mais de ce qui l'habite : les projets sont des dossiers vivants, le désordre est signifiant, chaque icône a une raison d'être.

```
┌──────────────────────────────────────────────────────────────┐
│ VINCENT 2000 OS                                        23:41 │
│                                                              │
│  ▓▓▓        ▓▓▓        ▓▓▓         ▓▓▓                       │
│ HAL2000    CARMEN     DJ SETS    RECHERCHES                  │
│  (3?)                                                        │
│                            ┌────────────────────────┐        │
│  ▓▓▓        ▓▓▓           │ ♫ LECTEUR       _ □ ×  │        │
│ ARCHIVE   versement_      │ ▶ demo_grain_v3.wav    │        │
│           juin2026/       │ ▁▂▄▆█▆▄▂▁▂▄▆█▆▄▂▁      │        │
│                            │ HAL2000 · nocturne     │        │
│   ~ dernière activité :   └────────────────────────┘        │
│     hier, 02:17 — 4 pièces ajoutées                          │
├──────────────────────────────────────────────────────────────┤
│ [☰] [explorateur] [carnet] [lecteur]           [⌕ recherche] │
└──────────────────────────────────────────────────────────────┘
```

Un dossier-projet ouvert :

```
┌── HAL2000 ──────────────────────────────── _ □ × ┐
│ sons(12)  images(8)  notes(5)  refs(4)  exports(2)│
│                                                   │
│  ♫ demo_grain_v3     ▓ moodboard_nuit             │
│  ♫ basse_test_01     ▤ note: structure EP         │
│                                                   │
│ ? QUESTIONS OUVERTES (3)                          │
│   · quel grain pour la basse ?                    │
│   · identité visuelle — piste peintre_X ?         │
│ ~ fil d'activité : demo_v3 ← field_rec_juin       │
└───────────────────────────────────────────────────┘
```

**Forces :** zéro friction d'apprentissage · extensible à l'infini (une app = une fenêtre) · le mobile reste envisageable.
**Risque principal :** frôle l'interdit n°1 (« portfolio déguisé en Windows 98 ») si le contenu des fenêtres n'est pas radicalement singulier.

---

## Concept B — « La constellation »

**Philosophie :** le bureau EST le cerveau. Le fond d'écran n'est pas une image : c'est la carte vivante des pièces et de leurs liens. On navigue le sensible et le relationnel nativement ; les fenêtres s'ouvrent par-dessus.

```
┌──────────────────────────────────────────────────────────────┐
│         · sample_303٭          ● HAL2000                     │
│   field_rec_juin ·──────·─────╱  ╲                           │
│                          ╲   ╱    · peintre_X                │
│     ● CARMEN ────·────── demo_v3 ┈┈┈ ? « quel grain ? »      │
│        ╲                   │                                 │
│         · photo_nuit       · basse_test_01                   │
│                                                              │
│   (zoom/dérive à la molette — cliquer un nœud = fenêtre)     │
├──────────────────────────────────────────────────────────────┤
│ [filtres: son·image·émotion·époque·énergie]  [⌕ recherche]   │
└──────────────────────────────────────────────────────────────┘
```

**Forces :** incarne littéralement « chaque découverte en entraîne une autre » · impossible à confondre avec quoi que ce soit d'existant · les dimensions sensibles (couleur, énergie) deviennent l'espace lui-même.
**Risques :** trouvabilité fragile pour le visiteur pressé (viole potentiellement le principe 2 s'il est le seul mode) · performance et mobile difficiles · demande beaucoup de matière liée pour être beau.

---

## Concept C — « L'établi »

**Philosophie :** le bureau montre l'état du travail *aujourd'hui*. Pas une grille d'icônes : un plan de travail où traînent les pièces en cours, les questions punaisées, le dernier versement pas encore trié. Le visiteur surprend un atelier en activité (010 : vivant, habité).

```
┌──────────────────────────────────────────────────────────────┐
│ SUR L'ÉTABLI                        ╔═ punaisé ═══════════╗  │
│ ┌─────────────┐ ┌──────────┐        ║ ? grain basse HAL   ║  │
│ │♫ demo_v3    │ │▓ moodboard│       ║ ? visuel Carmen     ║  │
│ │ (hier 02:17)│ │  nuit     │       ╚═════════════════════╝  │
│ └─────────────┘ └──────────┘                                 │
│                                                              │
│ À TRIER : versement_juin2026 (14 pièces) ▓▓▓░░░              │
│                                                              │
│ LES PROJETS →  [HAL2000] [CARMEN] [DJ SETS] [ARCHIVE]        │
├──────────────────────────────────────────────────────────────┤
│ [☰] [explorateur] [carnet] [lecteur]           [⌕ recherche] │
└──────────────────────────────────────────────────────────────┘
```

**Forces :** la présence humaine est immédiate — on entre dans un lieu de travail réel, pas dans une interface · synergie maximale avec 060_VIE (le bureau change chaque semaine sans effort éditorial).
**Risques :** illisible pour un premier visiteur si l'établi est trop chargé · demande que l'atelier soit réellement actif pour ne pas sonner faux.

---

## Parcours de référence (à tester sur chaque concept)

1. **Le pressé** — un label cherche un morceau précis. Doit y arriver en < 30 s : recherche globale accessible en permanence, quel que soit le concept.
2. **Le curieux** — arrive sans but. Doit être happé en < 1 min par quelque chose de vivant (une pièce récente, une question ouverte, un son).
3. **Le fidèle** — revient pour la 10e fois. Doit voir immédiatement ce qui a changé depuis sa dernière visite.

## Décision (2026-07-03) : hybride à quatre couches A×C×B×D

Validé par Vincent, avec ajout d'une quatrième couche :

- **A = le châssis** (navigation fiable)
- **C = le bureau vivant** (l'atelier en activité)
- **B = la constellation** (application de recherche créative)
- **D = les parenthèses immersives** — des expériences qui font complètement oublier l'OS pendant quelques minutes (conduire une voiture en écoutant un morceau, un Winamp vivant, discuter avec HAL, un mini-jeu, une installation interactive), puis ramènent naturellement au bureau. Ce ne sont pas des fenêtres.

→ Formalisé dans `030_OS.md`.

## Recommandation initiale de Claude : l'hybride A×C×B

Ces concepts ne s'excluent pas — ils peuvent être trois étages du même OS :

- **Châssis = A.** Fenêtres, barre des tâches, dossiers-projets : la structure familière qui garantit la trouvabilité et l'extensibilité.
- **Contenu du bureau = C.** Le bureau n'est pas une grille d'icônes figée : c'est l'établi, le reflet de l'activité réelle. C'est lui qui tue l'interdit « portfolio déguisé en Win98 ».
- **La constellation = B devient une app.** La carte du cerveau est l'une des apps majeures (plein écran possible), pas le seul mode de navigation. Le curieux s'y perd avec plaisir ; le pressé ne la croise jamais.

Chaque concept est ainsi placé là où ses forces jouent et où ses risques sont neutralisés.
