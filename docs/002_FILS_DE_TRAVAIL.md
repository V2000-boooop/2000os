# 002 — FILS DE TRAVAIL (conversations nommées)

> Un fil = un chantier. On n'y parle QUE de ça. Si un sujet d'un autre fil surgit → on le note et on va dans le bon fil.
> **Règle vitale** : un fil qui s'allonge coûte de plus en plus cher (chaque message repaye tout l'historique).
> Quand un fil dépasse ~8-10 échanges : demander « compacte et clôture » → Claude met à jour `000`/`090`,
> et on rouvre un fil neuf avec le même nom + numéro (ex. « V2000 · TIERCÉ 2 »).

## Les 6 fils

### 1. V2000 · TIERCÉ
Le jeu de course du PMU : réglages, retours de test, nouveaux contenus (partants, sons, écrans).
Fichiers : `PmuCourse.svelte`, `courses.js`, `public/media/nightdrive/pmu/`, `tools/build_pmu_course.py`.
**Prompt d'ouverture :**
```
Lis docs/000_PROJECT_MEMORY.md puis : fil TIERCÉ (PmuCourse.svelte + courses.js).
Retours / demande :
1. …
```

### 2. V2000 · SONS & MONDE
Tout l'audio du monde : dépôts de sons (`~/Desktop/OS 2000/`), cathédrale/prêtre, ambiances, hooks worldsound.
Fichiers : `worldsound.js`, `NightDrive.svelte` (prêtre, ambiances), `public/media/nightdrive/sons/`.
**Prompt d'ouverture :**
```
Lis docs/000_PROJECT_MEMORY.md puis : fil SONS & MONDE.
J'ai déposé dans ~/Desktop/OS 2000/ : [noms de fichiers].
À brancher : [où / quel geste déclenche quoi].
```

### 3. V2000 · SCÈNES & IMAGES
Le visuel : nouvelles scènes, objets cliquables, persos, calques, détourage, animations d'image. (La skill DA se charge du reste.)
Fichiers : `scenes.js`, `public/media/nightdrive/scenes/`, `tools/build_zone_masks.py`.
**Prompt d'ouverture :**
```
Lis docs/000_PROJECT_MEMORY.md puis : fil SCÈNES & IMAGES — scène [nom].
J'ai déposé : [fichiers]. Demande : [quoi, où, quel comportement].
```

### 4. V2000 · TROUVAILLES & COMPTE
La progression du visiteur : choses à trouver, pièces, récompenses, avatar, puis compte Google (Supabase). Roadmap `001` §5 et étapes 3+7.
Fichiers : `src/state/save.svelte.js` (à créer), plus tard Supabase.
**Prompt d'ouverture :**
```
Lis docs/000_PROJECT_MEMORY.md + docs/001_LIGNE_DIRECTRICE.md puis : fil TROUVAILLES & COMPTE.
Étape du jour : [ex. créer save.svelte.js — trouvailles + pièces].
```

### 5. V2000 · PASSERELLES WEB
Les ponts vers le web réel : PC SoundCloud dans une scène, cinéma (films), flux radio. Roadmap `001` §6 et étape 4.
Règle : une passerelle = un écran habillé DANS le monde, jamais une page brute ; fallback silencieux.
**Prompt d'ouverture :**
```
Lis docs/000_PROJECT_MEMORY.md + docs/001_LIGNE_DIRECTRICE.md puis : fil PASSERELLES WEB.
Passerelle du jour : [ex. l'ordinateur de la taverne ouvre mes playlists SoundCloud : liens…].
```

### 6. V2000 · TECHNIQUE & POIDS
La mécanique : découpage de NightDrive.svelte par scènes (roadmap étape 5), URLs profondes (étape 6), poids des assets, bugs transverses, déploiement.
**Prompt d'ouverture :**
```
Lis docs/000_PROJECT_MEMORY.md puis : fil TECHNIQUE & POIDS.
Chantier du jour : [ex. extraire la cathédrale de NightDrive.svelte] / Bug : [symptôme + où].
```

## Rappels qui font gagner gros
- Retours de test : **une liste numérotée, un seul message**.
- Nommer les fichiers/lieux quand tu les connais.
- Les sons bruts vont dans `~/Desktop/OS 2000/`, les images de scène dans le projet — dis juste le nom du fichier déposé.
- En fin de fil : « compacte et clôture » (mise à jour `000`/`090` + push), puis fil neuf.
