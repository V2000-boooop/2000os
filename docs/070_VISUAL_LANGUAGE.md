# 070 — VISUAL LANGUAGE (DA, palette, typo)

> Bible visuelle du projet. À relire avant toute proposition graphique.
> Écrite par Vincent (directeur créatif), validée 2026-07-04.
> Résumé courant : `000_PROJECT_MEMORY.md`. Méthode de fabrication des images :
> `exploration/nightdrive/da_cible.md`. Principes créatifs : `005_DESIGN_PRINCIPLES.md`.
>
> **⚠️ AMENDEMENT D18 (2026-07-06) — virage rendu image.** Les images de décor visent désormais un **ciné-réalisme sombre** (validé sur le vestiaire de LA RIDE), et non plus le rendu « PS2 2003 » peint. Le PS2 reste une **attitude** (contrastes forts, couleurs saturées la nuit, néons qui bavent, brouillard qui masque les limites) et un **vernis optionnel** (grain/scanlines CRT léger), plus la cible de fidélité. Détail : `090` (D18). En cas de contradiction avec le texte ci-dessous, D18 prime pour la génération d'images.

## 1. Intention générale

Vincent 2000 OS est un faux ordinateur personnel interactif, entre Windows 98/2000/XP, cybercafé, PMU basque, rave locale, site pirate de l'an 2000, jeu vidéo PS2, GTA/Need For Speed underground, nightlife et souvenirs personnels.

Le visiteur ne doit pas sentir qu'il visite un site moderne. Il doit avoir l'impression d'entrer dans un vieux bureau rempli de dossiers, de lieux, de sons, de mini-jeux, de souvenirs et de secrets.

Le bureau principal reste calme, lisible, presque banal. Le spectacle graphique arrive surtout dans les destinations : Night Drive, PMU, bar La Ride, boîte à gant, TV, platines, jeux, fenêtres cachées.

## 2. Règle absolue : ne pas régénérer toute une scène

Quand une image existe déjà et sert de référence :

- garder exactement le même cadrage ;
- garder la même taille ;
- garder la même perspective ;
- garder les éléments fixes au même endroit ;
- ne jamais déplacer la caméra ;
- ne pas changer la lumière globale sauf demande précise ;
- ne pas « réinterpréter » toute la scène ;
- ajouter, retirer ou modifier uniquement la zone demandée.

Les scènes doivent être pensées en calques.

Formats préférés :

- fond fixe : `.webp`
- objets cliquables : `.png` transparent
- boucles animées : `.webm`
- petites animations simples : CSS / canvas / sprite sheet
- interface : HTML/CSS/JS autonome

## 3. DA graphique

Style général :

- rétro 1998–2004 ;
- jeu vidéo PS2 / début 3D ;
- GTA ancien / Need For Speed underground / interface Windows 2000 ;
- image un peu compressée ;
- textures peintes mais simples ;
- détails vivants mais pas trop propres ;
- atmosphère locale, bricolée, nocturne, drôle, un peu mélancolique.

Le rendu doit être plus « jeu culte oublié » que « illustration IA premium ».

À éviter :

- rendu trop moderne ;
- 3D trop brillante ;
- illustration fantasy ;
- cyberpunk générique ;
- néons trop propres ;
- interface Apple / startup / SaaS ;
- personnages trop cartoon ;
- personnages trop réalistes ;
- photoréalisme ;
- répétitions d'objets ou de textes ;
- logos inventés qui ressemblent à des marques réelles sauf intention claire.

## 4. Couleurs

Palette de base :

- gris Windows 2000 ;
- bleu bureau PC ancien ;
- vert PMU / bar / néon fatigué ;
- rouge orangé lumière de nuit ;
- jaune lampe sodium ;
- noir bleuté nocturne ;
- violet club / rave ;
- blanc cassé papier ancien ;
- brun tabac / carton / cuir usé.

Les couleurs doivent avoir l'air un peu passées, scannées, compressées, pas trop propres.

## 5. Texture et image

Toujours intégrer un peu de matière :

- grain léger ;
- scanlines discrètes ;
- compression JPEG/WebP assumée ;
- contours un peu mous ;
- pixels pas forcément nets ;
- halos lumineux simples ;
- ombres douces ;
- petites saletés visuelles ;
- poussière, reflets, traces d'usage.

Ne jamais faire une image trop lisse.

## 6. Typographie et textes intégrés

Textes courts, crédibles, pas décoratifs au hasard.

Sources d'univers :

- Pays Basque ;
- Bayonne ;
- PMU ;
- garage ;
- rave ;
- after ;
- voiture années 2000 ;
- radio pirate ;
- CDs gravés ;
- papiers froissés ;
- tickets ;
- flyers ;
- autocollants ;
- vieux logiciels ;
- noms de lieux inventés mais crédibles.

Les textes doivent sentir le local, le vécu et l'an 2000.

Exemples de textes possibles :

- 2000 IS LOVE
- RAVE EUSKADI
- GARAGE LARRUN
- AUTO IRATI
- RADIO CÔTE 2000
- ANGLET NIGHT SERVICE
- PMU DES ARÈNES
- BAYONNE AFTER CLUB
- DONOSTIA FREQUENCY
- BIDART SOUND SYSTEM
- LA RIDE
- VIEUX BOUCHERIE MIXTAPE

Règle : jamais de répétition visible du même texte dans une même image.

## 7. Objets récurrents

Objets cohérents avec l'univers :

- CD gravé ;
- pochette plastique ;
- briquet ;
- paquet de clopes ;
- ticket PMU ;
- vieux papier de garage ;
- carte routière ;
- flyer rave ;
- mini-disc ;
- clé USB ancienne ;
- câble jack ;
- autocollants ;
- facture froissée ;
- carte de fidélité bar/garage ;
- chewing-gum ;
- pièce de monnaie ;
- petite enceinte ;
- télécommande ;
- CDJ ;
- platines ;
- vieux téléphone ;
- cendrier ;
- pizza froide ;
- boisson ;
- paquet de filtres ;
- jeu à gratter ;
- VHS ;
- TV cathodique.

## 8. Animation

Animation discrète, courte, bouclable.

Types d'animations :

- halo qui respire ;
- néon qui clignote ;
- scanline qui passe ;
- fumée lente ;
- curseur qui tremble ;
- voyant qui pulse ;
- reflet qui bouge ;
- bouton qui s'enfonce ;
- fenêtre qui apparaît façon Windows ;
- léger bruit vidéo ;
- sprite 2D simple ;
- crossfade entre 2 états.

Timings :

- hover : 120–250 ms ;
- ouverture fenêtre : 200–500 ms ;
- lumière/halo : boucle 2–5 s ;
- fumée : boucle 4–8 s ;
- animation surprise : 1–3 s ;
- transition destination : 600–1200 ms.

À éviter :

- grosses animations modernes ;
- caméra qui zoome partout ;
- parallaxe excessive ;
- 3D web trop propre ;
- transitions type template premium.

## 9. Règles pour les lieux

### Bureau principal

Le bureau est calme et lisible. Objectif : donner envie de cliquer.

Il doit contenir : icônes ; fenêtres ; dossiers ; sons système ; lecteur type Winamp ; faux fichiers personnels ; liens cachés ; zones secrètes.

Il ne doit pas être trop spectaculaire. Le spectaculaire est dans les dossiers/destinations.

### Night Drive

Vue habitacle / voiture.

Règles : caméra fixe ; ambiance conduite nocturne ; lumière sodium / néons / tableau de bord ; DA GTA / Need For Speed ancien ; sensation de route, radio, cigarette, musique, solitude drôle.

### PMU

Lieu populaire, drôle, local, vivant.

Objets possibles : TV cathodique ; jeu à gratter ; comptoir ; tickets ; néons ; verres ; affiches ; sons de foule ; mini-jeux cachés.

### La Ride

Bar / club / platines.

Ambiance : DJ booth ; CDJ ; vieux écran ; player interactif ; pistes A/B ; boutons larges ; interface audio rétro ; pas de logo GTA visible ; pas de branding inutile.

### Boîte à gant

Doit être un calque ouvert dans une image habitacle existante.

Contenu possible : CD gravé « 2000 IS LOVE » ; flyer rave basque ; papier de garage local ; briquet ; ticket ; carte routière ; facture ; vieux papier plié ; filtre ; mini objet secret.

Tout doit être crédible, non répétitif, et dans la même perspective que l'image originale.

## 10. Méthode de proposition

Pour toute nouvelle demande graphique, répondre dans cet ordre :

1. Identifier ce qui doit rester fixe.
2. Identifier la zone modifiable.
3. Proposer 2 ou 3 pistes concrètes.
4. Si image ou UI : produire une maquette réelle quand possible, pas seulement une description.
5. Penser en calques exportables.
6. Donner les noms de fichiers recommandés.
7. Ne jamais réécrire tout le système si une petite modification suffit.

## 11. Nommage des assets

Structure recommandée :

```
assets/
  img/
    backgrounds/
    layers/
    objects/
    ui/
  anim/
    loops/
    sprites/
  audio/
    sfx/
    music/
  data/
    content.json
```

Nommage :

- `nightdrive_bg.webp`
- `nightdrive_glovebox_closed.png`
- `nightdrive_glovebox_open.png`
- `nightdrive_smoke_loop.webm`
- `pmu_tv_idle.webm`
- `pmu_scratchcard.png`
- `laride_cdj_player.webp`
- `ui_window_skin.css`

## 12. Do & Don't

DO :

- garder la cohérence ;
- travailler petit morceau par petit morceau ;
- faire local ;
- faire vivant ;
- faire drôle ;
- faire usé ;
- penser en calques ;
- garder les formats web ;
- proposer des objets précis ;
- respecter les images de référence.

DON'T :

- tout régénérer ;
- changer le cadrage ;
- ajouter des détails IA incohérents ;
- faire du cyberpunk générique ;
- faire trop propre ;
- faire trop moderne ;
- surcharger le bureau principal ;
- oublier Bayonne / Pays Basque / années 2000 ;
- répéter les mêmes mots partout ;
- inventer une interface qui ne ressemble plus au projet.

---

## Passerelle d'implémentation (maintenue par Claude — état du code au 2026-07-04)

La bible ci-dessus est la cible. Voici comment elle se pose sur le dépôt **tel qu'il est aujourd'hui**, pour éviter toute contradiction avec le code réel :

- **Arborescence** : le projet sert ses médias depuis `public/media/…` (Astro), pas `assets/…`. Correspondance : `assets/img/backgrounds` → `public/media/nightdrive/scenes/<scene>_off|on_v1.png` (paires off/on) ; `assets/img/objects` → `public/media/nightdrive/scenes/lights/<scene>_<zone>.png` (sprites détourés) ; `assets/audio/sfx` → `public/media/nightdrive/sons/` (contrat `sons_nightdrive.md`) ; `assets/data/content.json` → `src/data/content.js` + fichiers-données par lieu (`cocktails.js`, `sermons.js`, etc.). Le passage à `.webp`/`.webm` est un objectif : les paires actuelles sont en `.png`, migrables sans changer le contrat (le registre `scenes.js` pointe des chemins).
- **Calques** : déjà en place — chaque scène = fond (paire off/on) + zones sprites PNG transparents détourés au pixel (`tools/build_zone_masks.py`). La « règle absolue » du §2 est déjà la doctrine du moteur (on n'ajoute que des zones, on ne régénère pas la scène).
- **Timings (§8)** : le code respecte déjà la fourchette — hover/crossfade de zone ~650 ms, transition de destination (zoom-crossfade) 950 ms (∈ 600–1200), halos/respirations en boucle 2–5 s. Les nouvelles animations doivent rester dans ces bornes.
- **Grain / scanlines / vignette (§5)** : rendus en CSS **uniquement sur le fallback procédural** ; sur les images peintes de Vincent, aucune couche par-dessus (l'image porte déjà sa matière). Si la DA veut du grain sur le peint, ce sera une décision explicite (entrée `090`).
- **Palette (§4)** : à traduire en variables CSS partagées (`--gris-w2000`, `--bleu-bureau`, `--vert-pmu`, `--sodium`, `--rouge-nuit`, `--violet-rave`, `--papier`, `--tabac`). Chantier proposé : centraliser ces tokens pour que chaque destination y puise au lieu de redéclarer ses couleurs. (Pas encore fait — à valider.)
