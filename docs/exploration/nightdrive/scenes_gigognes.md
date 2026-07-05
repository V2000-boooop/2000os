# Scènes gigognes — le monde peint récursif (D15)

> **Décidé le 2026-07-04 (Vincent).** Chaque lieu qui s'illumine peut devenir une autre scène,
> à l'infini. On entre dans la taverne → des objets de l'image sont cliquables → certains
> ouvrent du contenu, d'autres mènent encore plus profond.
> Généralise le hack « off/on » du quai (It13-16) à toute profondeur.

## Principe

Le monde peint est un **arbre de scènes**. Une scène = une **paire d'images off/on au cadrage
strictement identique** + des **zones cliquables** (en % de l'image). Chaque zone fait UNE des
trois choses :

1. **`goto`** — descendre dans une scène enfant (la porte : taverne, cathédrale…).
2. **`open`** — ouvrir du contenu de l'OS (dossier, app, jeu, pièce de collection).
3. **rien** — la zone luit brièvement (pas encore branchée), comme aujourd'hui.

Le quai est la **racine** de l'arbre. L'habitacle et ses instruments vivants n'existent que
sur la racine — les scènes intérieures sont plein cadre.

## Schéma (contrat stable — D3)

Registre : `src/os/nightdrive/scenes.js`. Le composant ne connaît que ce schéma.

```js
export const SCENES = {
  quai: {                        // racine (id réservé)
    off: '/media/nightdrive/ville_off_v1.png',
    on:  '/media/nightdrive/ville_on_v1.png',
    zones: [
      { id: 'taverne', x: 62.2, y: 31.8, w: 5.2, h: 3.0, goto: 'taverne' },
      { id: 'laride',  x: 75.4, y: 19.5, w: 6.8, h: 13.2, open: { type: 'arcade' } },
      { id: 'pmu',     x: 88.2, y: 33.1, w: 3.6, h: 5 },   // sans goto/open → lueur
    ],
  },
  taverne: {
    parent: 'quai',              // remonte ici avec Échap
    off: '/media/nightdrive/scenes/taverne_off_v1.png',
    on:  '/media/nightdrive/scenes/taverne_on_v1.png',
    zones: [
      { id: 'jukebox', x: 12, y: 40, w: 10, h: 22, open: { type: 'folder', id: 'sons' } },
      { id: 'escalier', x: 80, y: 30, w: 8, h: 30, goto: 'taverne_etage' },
    ],
  },
};
```

- `open.type` : `folder` · `arcade` · `app` · `piece` (collection) — extensible.
- Convention fichiers : `public/media/nightdrive/scenes/<id>_off_v1.png` / `<id>_on_v1.png`.
- Une scène sans images publiées reste une lueur : on peut câbler l'arbre avant les images.

## Navigation : la pile

- Entrer dans une zone `goto` **empile** la scène enfant. Transition : **zoom-crossfade vers
  la zone cliquée** (façon menus PS2) puis fondu vers la scène enfant.
- **Échap dépile toujours d'un cran** (règle des couches It9) : objet ouvert → scène → scène
  parente → … → quai → bureau. La sortie est toujours évidente (030).
- La profondeur est illimitée mais chaque niveau doit se mériter sa place : une scène sans
  au moins une zone vivante n'entre pas dans l'arbre.

## Mécaniques héritées (identiques à tous les niveaux)

- Survol d'une zone = **crossfade 650 ms** de SA zone (sprite-crop en %) + respiration
  globale très basse de la version allumée.
- Jamais de suivi souris. Le regard amorti est propre à la racine (habitacle).
- L'écoute (D13) continue à travers toutes les scènes — l'antenne ne coupe jamais.

## Fabrication (méthode « peint + animé »)

- **Vincent** génère chaque paire off/on : même cadrage au pixel, style planche `da_cible.md`,
  et les objets interactifs doivent être **identifiables par leur lumière** dans la version on.
- **Claude** vérifie le sens off/on (contrôle de luminance), l'alignement (diff numérique),
  mesure les zones sur crops agrandis, câble et anime.
- Une scène par itération, Vincent teste entre chaque.

## Garde-fous

- **Règle d'or** : les scènes sont des **portes**, jamais des cachettes — tout contenu
  important reste trouvable hors nuit (recherche, dossiers). Seules les pièces de collection
  (040) peuvent être des découvertes exclusives.
- Le spectaculaire vit dans les Destinations (D14) : profondeur oui, labyrinthe non.
