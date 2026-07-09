# 095 — PIPELINE D'AGENTS (attaque d'une scène)

> Équipe d'agents réutilisable, à **brancher à chaque nouvelle scène** (ou sous-scène).
> Objectif : avancer en parallèle sans conflits, garder la DA et les contrats, laisser Vincent trancher/tester.
> Décision fondatrice : voir `090` (parallélisation validée 2026-07-06).

## Principe

À chaque scène on déroule la chaîne : **Concepteur → (Vincent tranche) → Intégrateur → Contrôleur → (Vincent teste)**.
Les agents démarrent à froid : on les briefe **toujours** avec les fichiers de contexte (ci-dessous), jamais « à l'aveugle ».
Le code passe en **worktree isolé** (copie git à part) pour être mergeable sans casser le tronc.

**Contexte à injecter dans chaque agent (lecture obligatoire) :**
`docs/000_PROJECT_MEMORY.md` · `docs/090_DECISION_LOG.md` (D12→D17) · `docs/060_SCENES.md` · `docs/040_EXPERIENCES.md` · `docs/070_VISUAL_LANGUAGE.md` · la skill `direction-artistique-vincent-2000` · le registre de la scène visée (`src/os/nightdrive/scenes.js` + fichiers-données liés).

### Budget tokens — règle PERMANENTE (tous les agents)

Chaque agent applique l'économie de tokens du protocole `000` **en continu**, par design :
- **Lectures ciblées** (grep, `offset/limit`) — jamais avaler un gros fichier en entier pour une info précise ; jamais relire un fichier déjà en contexte.
- **Éditer, pas régénérer** — modifs chirurgicales ; on ne réécrit jamais un artefact (doc, SVG, code) entier quand une édition suffit.
- **Ne pas lancer un agent quand une action directe suffit** — un spawn = démarrage à froid coûteux ; réservé aux tâches réellement parallélisables ou spécialisées.
- **Briefs courts**, contexte injecté par chemins de fichiers (l'agent lit), pas par copier-coller.
- **Compacter** en fin de travail (`000` ≤ 3 pages, une ligne par livraison, détail dans `090`).

Audit à la demande : agent `gardien-tokens` (voir Roster).

### Réflexe outils — règle PERMANENTE (demande Vincent, 2026-07-06)

Quand on **galère sur un problème technique** (segmentation, conversion, format…), avant de bricoler longtemps : **chercher vite** dans la doc dispo et sur GitHub/PyPI un **outil ou modèle téléchargeable** qui le fait mieux. Si ça existe, **envoyer le lien à Vincent** (il télécharge, dépose dans le projet — ex. `models/`) et on avance avec. Le sandbox n'autorise que PyPI au download : les gros modèles (GitHub/HuggingFace) sont **téléchargés par Vincent** puis chargés en local (onnxruntime est dispo). Exemple fait : `models/u2net_cloth_seg.onnx` (segmentation vêtements).

### Réflexe scénographie — règle PERMANENTE (toute scène)

Une scène est un **LIEU, pas une image plate**. Avant de produire quoi que ce soit, on pense :
- **Perspective & surfaces** : identifier les plans (murs, sol, plafond, objets) et leur fuite. Les interactions se posent sur les **vraies surfaces** (un tag suit la perspective du mur, un objet est saisissable là où il est dans l'espace) — jamais flottantes sur une image aplatie.
- **Ludique & physique** : viser le **maximum de possibilités** — objets manipulables, physique (chute, rebond, glisse), surfaces jouables, cachés.
- **Mobile d'abord** : tactile, perf, portrait/paysage, cibles de clic généreuses.
- **Le prompt d'image est un livrable amont** : fournir un prompt (ChatGPT / outil image) qui **bake la perspective + des objets séparables + des surfaces exploitables**, pour que l'intégration de jeux/objets marche ensuite.
- **Faisabilité 3D, la plus légère qui rend l'effet** : calques 2.5D → **canvas projeté en perspective (CSS 3D transform / warp)** sur une surface → `three.js` nav en dernier recours. Toujours le plus léger qui donne la sensation de lieu.

Porté par l'agent `scenographe` (voir Roster), en amont de chaque scène — avant même l'image.

---

## Rôle 0 — L'ARCHITECTE (méta-agent : crée les agents)  → *« monte l'équipe qu'il faut »*

**Mission.** Regarder le projet et la tâche à venir, puis **décider quels agents spécialistes sont nécessaires** (au-delà du trio de base) et **écrire leurs fiches** — dans `.claude/agents/<nom>.md` (format sous-agent natif : frontmatter `name`/`description`/`tools` + brief) et les enregistrer dans le **Roster** ci-dessous. Il ne code pas et ne conçoit pas de scène : il **outille** l'équipe.

**Quand le brancher.** Nouvelle nature de travail (ex. beaucoup de son → besoin d'un Sound Designer ; une vraie scène 3D navigable → besoin d'un agent Three.js ; perf qui dérape → agent Perf/Poids). L'Architecte propose la fiche, Vincent valide, la fiche devient réutilisable.

**Contraintes.** Chaque agent créé doit : avoir un périmètre net (une spécialité), lister son contexte de lecture obligatoire (comme ici), respecter les contrats (D3, D13, D15, D17) et la DA (070). Pas de doublon avec un agent existant. Fiche courte et actionnable.

**Livrable.** Le(s) fichier(s) `.claude/agents/*.md` + une ligne dans le Roster (nom → spécialité → quand l'utiliser).

---

## Roster (agents disponibles)

| Agent | Spécialité | Quand |
|-------|-----------|-------|
| `architecte-agents` | Méta : crée/ajuste les agents | Nouvelle nature de travail |
| `scenographe` | Pense la scène comme un LIEU : perspective/surfaces, physique, ludique, mobile, max de possibilités + écrit les prompts d'image (perspective, objets séparables, surfaces) + juge la faisabilité 3D | **Tout début d'une scène, avant l'image** |
| `concepteur-scene` | Créa / game design (propose sous-scènes) | Début de chaque scène |
| `integrateur` | Dev Astro/Svelte/Rive/Three | Après validation d'un concept |
| `controleur` | QC (faisabilité, poids, DA, build, refs en ligne) | Avant et après le code |
| `pipeline-image` | Assets visuels : montage en calques Higgsfield (off/on, détourage, perso, foreground) | Une scène a besoin d'images / d'un objet ou perso détouré |
| `sound-designer` | Son du monde : specs par lieu/objet (contrat `sons_nightdrive.md`), prompts Suno, production AbletonMCP | Une scène a besoin d'ambiance / de sons d'objet / d'un morceau |
| `rive-rigger` | Objets animés Rive (D17) : découpe en pièces, State Machine + inputs, export `.riv`, branchement `RiveObject` | Un objet/perso doit s'animer en continu |
| `nav-3d` | 3D navigable Three.js « PS2 2003 » + porte « manger un objet → 3D » (D16) | Vraie 3D navigable ou bascule 3D |
| `lore-copy-fr` | Plume FR du monde : mantras, sermons, cocktails, écrans (remplit les fichiers-données) | Une scène a besoin de texte crédible et local |
| `gardien-tokens` | Audit **à la demande** de l'économie de tokens/contexte du projet (docs qui gonflent, relectures inutiles, sur-spawn d'agents, régénérations) + correctifs | Sensation de conso élevée · avant/après un gros chantier · révision périodique |

> **Volontairement écarté — Perf/Poids en agent dédié.** Le budget de poids et le `npm run build` vert sont déjà couverts par le `controleur` (QC : poids raisonnable, build, smoke) et l'`integrateur` (poids optimisé webp/webm). À ce stade (mono-destination), un agent perf permanent ferait doublon. À reconsidérer si la perf dérape vraiment (plusieurs destinations 3D lourdes en parallèle) → il deviendrait alors une extension du `controleur`.

---

## Rôle 1 — LE CONCEPTEUR (créatif / game design)  → *« pense et propose »*

**Mission.** Pour une scène donnée, proposer les **sous-scènes** et leurs mécaniques : jeux, environnements 3D navigables, mini-expériences, contenus. Croise une **veille jeu vidéo réelle** (genres, titres, mécaniques précises) avec le **délire Vincent 2000** (rave 1998–2003, PS2, PMU basque, GTA/arcade, night drive, UKG/jungle/house/electro).

**Contraintes.** Reste dans la DA (070 + skill, « PS2 2003 ») · respecte D13 (antenne), D15 (gigogne), D17 (objets Rive : découpe + boutons pensés dès l'image) · privilégie léger/maintenable · ne réinvente pas ce qui existe déjà dans le registre.

**Recherche en ligne OBLIGATOIRE (demande Vincent, 2026-07-06).** Le Concepteur ne propose pas « de tête » : il **mine les meilleures ressources en ligne** liées à ce site et cite ses sources. **Consulte aussi la banque d'inspirations de Vincent : `docs/exploration/references_scenes.md`** (liens qu'il dépose, ex. Rive « Journey »). Bibliothèque de référence (WebSearch / WebFetch) : **Rive Community & Marketplace** (`rive.app/community`, `rive.app/marketplace` — fichiers interactifs réutilisables, ex. le « Interactive Sasquatch » : image en calques vivante, on clique un calque → il fait quelque chose d'utile à la scène), **Codrops / Tympanus**, **Awwwards**, **CodePen**, docs **GSAP / Three.js / Pixi / Rive**, articles game-feel (« juice », Vlambeer), démos WebGL/shaders. Chaque option porte **1–3 liens concrets** (référence Rive/web réelle) en plus de la référence jeu vidéo.

**Pattern validé (Vincent) — le calque vivant cliquable utile.** L'idéal recherché : une image montée en **calques animés** (idle qui respire) où **cliquer un calque déclenche une action UTILE à la scène** (pas décoratif) — navigation, mini-jeu, contenu, son, changement d'état. Réf. fondatrice : `https://rive.app/community/files/25774-48147-interactive-sasquatich/`. C'est le cœur de D17 : viser ça partout où c'est pertinent.

**Livrable** (doc dans `docs/exploration/<scene>/…`) : par zone/objet → **2–3 options** (une recommandée), chaque option avec : pitch court · **référence VG réelle** · type (jeu / 3D / contenu) · techno web conseillée (CSS-JS / Pixi / **Three.js** pour la 3D / **Rive** pour les objets riggés) · **découpe en pièces + inputs Rive** si animé · poids estimé · niveau d'effort (S/M/L).

## Rôle 2 — L'INTÉGRATEUR (appliqué / dev)

**Mission.** Implémenter la proposition **validée par Vincent** dans Astro/Svelte.

**Contraintes.** Respect des contrats : registre `scenes.js`, pile gigogne (Échap dépile), D13 (jouer rend l'antenne), D17 (composant `RiveObject` réutilisable, `.riv` dans `public/media/`). Modifs **ciblées**, jamais de régénération complète. Worktree isolé, `npm run build` vert.

**Livrable.** Code mergeable + liste des fichiers touchés + ce qui reste en stub / attend un asset de Vincent.

## Rôle 3 — LE CONTRÔLEUR (QC / check)  → *« check tout ça »*

**Mission.** Vérifier — sur une **proposition** comme sur du **code**.

**Sur une proposition créative :** est-ce jouable ? faisable en web sans usine à gaz ? poids raisonnable ? dans la DA ? pas déjà fait ? cohérent D12–D17 ?
**Sur du code :** `npm run build` vert · test live headless (`tools/smoke_test.mjs`) · contrats respectés · assets relus (015_QC) · aucune régression.

**Livrable.** Verdict **✅ / ⚠️ / ❌ par point**, avec correctifs concrets. Le Contrôleur a le droit de recaler le Concepteur (trop lourd, hors DA, injouable).

---

## Comment on branche (mémo)

1. Nouvelle scène → **Concepteur** lit le contexte + produit le doc de propositions.
2. **Vincent tranche** (garde/coupe/mélange les options).
3. **Intégrateur** code le choix en worktree isolé.
4. **Contrôleur** valide (build + smoke + DA + contrats).
5. **Vincent teste** en local, revient avec une liste numérotée.

Première application : **LA RIDE** (`docs/exploration/nightdrive/laride_sousscenes.md`).
