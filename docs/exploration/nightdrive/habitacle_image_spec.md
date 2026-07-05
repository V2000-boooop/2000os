# NIGHT DRIVE — spec de l'habitacle en image (It10, en attente de l'asset)

> Décision Vincent (2026-07-04) : pivot « peint + animé » — l'habitacle CSS est
> remplacé par une image générée dans le style de la planche DA. Vincent génère,
> Claude monte l'image et pose les instruments vivants par-dessus.

## Ce que tu génères

Reprends l'outil et le style exacts de ta planche (l'image principale, vue
conducteur). **Une seule différence : le pare-brise doit être VIDE** — un bleu
nuit uniforme très sombre, sans ville, sans voiture, sans lumières. C'est moi
qui découpe cette zone : la ville animée du moteur apparaîtra dedans.

Prompt de départ (adapte-le à ton outil, garde tes mots de la planche) :

> Vue conducteur première personne, intérieur de voiture française années
> 90/2000 la nuit, tableau de bord plastique moulé éclairé orange/ambre,
> volant à gauche, compteur rétro éclairé, autoradio au centre de la console
> avec afficheur orange éteint, rétroviseur central avec sapin désodorisant,
> montants de pare-brise sombres, rendu jeu vidéo PS2 2003, ambiance Need for
> Speed Underground / Taxi. Le pare-brise est entièrement vide : bleu nuit
> uniforme très sombre, aucun décor, aucune lumière derrière la vitre.

## Contraintes techniques (importantes)

- **Format : PNG, 1920×1080** (16:9 plein). Pas de recadrage vertical.
- **Cadrage identique à la planche** : tableau de bord sur le tiers bas,
  volant à gauche, rétroviseur en haut au centre, montants A visibles.
- Zones que je vais rendre VIVANTES par-dessus l'image — génère-les
  **sobres et lisibles** :
  - le **compteur** : cadran visible, aiguille absente ou très discrète
    (je pose l'aiguille animée par-dessus) ;
  - l'**autoradio** : façade avec boutons, mais **afficheur éteint/noir**
    (mon LCD défilant + les 6 presets cliquables se posent dessus) ;
  - le **rétroviseur** : miroir **noir/vide** (mon canvas rétro vit dedans) ;
  - une petite zone d'**horloge** sombre sur la planche de bord.
- Génère **2 ou 3 variantes**, on choisit la meilleure ensemble.

## Où la déposer

`public/media/nightdrive/habitacle_v1.png` (crée le dossier `nightdrive`
dans `public/media`), puis nouvelle conversation :
« Lis docs/000_PROJECT_MEMORY.md puis : monte l'habitacle (It10), l'image est
déposée. »

## Ce que je ferai au montage (It10)

Image plein écran, pare-brise détouré (la ville du moteur visible au travers),
instruments vivants calés sur l'image : aiguille du compteur, horloge, LCD +
presets + transport de l'autoradio (zones cliquables invisibles sur les boutons
peints), canvas du rétroviseur, ralenti caméra conservé. Le CSS actuel de
l'habitacle part en retraite — la chorégraphie d'entrée/sortie est conservée.
