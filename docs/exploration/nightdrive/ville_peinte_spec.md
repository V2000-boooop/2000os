# NIGHT DRIVE — la ville peinte derrière la vitre (spec It13, en attente d'assets)

> Décision Vincent (2026-07-04) : la ville derrière le pare-brise devient une
> scène peinte dans le style de la planche. Les lieux du décor SONT les menus
> (registre D12) : survoler un lieu l'illumine et tire le regard vers lui,
> cliquer l'ouvre. Le hack : **deux images identiques, éteinte / allumée,
> crossfade au survol** — la technique des menus PS2.

## Le principe

La voiture est arrêtée en haut de la corniche, moteur au ralenti. Devant :
un panorama de Marseille la nuit où chaque lieu du registre est visible et
**en veilleuse**. Le curseur passe sur l'arcade → elle s'embrase (fondu vers
la version allumée), le regard pivote doucement vers elle (déjà codé, It7).
On clique → le lieu s'ouvre (la salle d'arcade existe déjà, It9).

## Ce que tu génères : DEUX images, pas plus

### Image A — `ville_off_v1.png` (la ville en veilleuse)
- **1920×1080**, style exact de ta planche (PS2 max, Marseille by night).
- **Vue à travers le pare-brise UNIQUEMENT — AUCUN habitacle** (pas de volant,
  pas de tableau de bord, pas de rétro : l'habitacle est déjà une couche
  séparée qui se posera par-dessus).
- La composition contient, **répartis dans toute l'image** (gauche/droite,
  près/loin — le regard doit voyager) :
  - le **GARAGE** (rideau entrouvert, lumière faible) → deviendra Sons
  - la salle d'**ARCADE** (enseigne presque éteinte) → Jeux
  - l'**HÔTEL** (néon en veilleuse) → Notes
  - le **PMU-TABAC** (vitrine sombre, TV en veille) → Médias
  - une **CABINE TÉLÉPHONIQUE** (lampe faible) → Recherche
  - la **TOUR RADIO** au loin sur la colline (point rouge) → Internet
  - la **Bonne Mère** dorée + le Vieux-Port + la baie (décor, pas cliquable)
- Tout est **éteint ou en veilleuse** : la ville dort, elle attend le curseur.

### Image B — `ville_on_v1.png` (la même, tout allumé)
- **LA MÊME IMAGE AU PIXEL PRÈS** — même cadrage, mêmes bâtiments, même ciel —
  avec UNE seule différence : **tous les néons, enseignes, vitrines et
  fenêtres des lieux sont allumés à fond** (halos, bave de néon, reflets).
- Méthode outil : repars de l'image A en img2img/inpainting en ne retouchant
  QUE les lumières (même seed si possible). **Si le cadrage bouge entre A et
  B, le hack casse** — c'est la seule contrainte vitale de cette spec.
- Je découpe moi-même chaque zone dans B : tu n'as pas de détourage à faire.

## Où déposer

`public/media/nightdrive/ville_off_v1.png` et `ville_on_v1.png`, puis
nouvelle conversation : « Lis docs/000_PROJECT_MEMORY.md puis : monte la
ville peinte (It13), les deux images sont déposées. »

## Ce que je ferai au montage

- Image A plein cadre derrière le pare-brise (la ville procédurale part en
  retraite, gardée en fallback tant que les fichiers manquent — comme
  l'habitacle CSS).
- Zones cliquables posées sur chaque lieu (je les cale à l'œil, tu recadres
  par retours numérotés : « arcade plus à droite », etc.).
- Survol d'un lieu : **crossfade veilleuse → allumé** sur sa zone (~600 ms,
  amorti), le regard pivote vers lui (It7), halo procédural qui respire
  par-dessus (alternateur It4).
- Vie permanente que j'ajoute en couche canvas : étoiles qui scintillent,
  avion qui traverse, fenêtres lointaines qui s'allument/s'éteignent,
  gyrophares qui passent dans une rue, la respiration lente de toute la
  lumière — la ville ne sera jamais figée, même sans curseur.
- Clic : l'ARCADE ouvre la salle existante ; les autres lieux répondent d'une
  lueur en attendant leur branchement (une porte par itération, comme validé).

## Plus tard (pas maintenant)

Personnages en veilleuse/allumés (le pompiste, le veilleur), variantes météo,
la version qui roule (le panorama comme destination d'arrivée après une
séquence de conduite), sons par lieu au survol.
