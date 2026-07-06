# Banque 3D — Vincent 2000 OS

Pipeline pour ajouter de la 3D low-poly rétro (PS2/N64) dans l'OS, sans abo, sans Higgsfield, sans Unreal.

## Workflow (10 s par modèle)

1. Télécharge un `.glb` (CC0 de préférence) depuis une source ci-dessous.
2. Glisse-le dans `public/media/3d/`.
3. `node tools/scan_3d.mjs` → recharge **http://localhost:4321/test3d** pour l'inspecter (souris = tourner/zoomer).
4. Pour l'utiliser dans une scène : `<Scene3D client:visible src="/media/3d/mon_asset.glb" controls />`

Astuce poids : garde des GLB **low-poly** et privilégie ceux **< 1–2 Mo**. Pour les gros, Draco est déjà géré par le loader.

## Sources CC0 (libre, usage commercial, sans login pour la plupart)

- **Poly Pizza** — https://poly.pizza · milliers de low-poly, GLB direct, moteur de recherche
- **Quaternius** — https://quaternius.com · 1400+ modèles CC0, souvent riggés/animés (packs entiers)
- **Kenney** — https://kenney.nl/assets?q=3d · 40k+ assets CC0 (packs thématiques)
- **Licences** : CC0 = aucune contrainte. Poly Pizza indique la licence par modèle (certains CC-BY = créditer l'auteur).

Sites avec IA image→3D (free tier, si tu veux partir de TES images) :
- **Meshy** https://www.meshy.ai/features/image-to-3d (100 crédits/mois, export GLB)
- **Tripo** https://www.tripo3d.ai (rapide, export GLB)
- **Luma Genie** (formes organiques)

## Liste d'achats ciblée par destination

Cherche ces termes sur Poly Pizza / Quaternius, prends la version qui colle le mieux à la DA.

### Quai / Night Drive (racine)
- voiture rétro / berline 90s (`old car`, `sedan`, `low poly car`)
- lampadaire, borne, panneau de rue (`street lamp`, `road sign`)
- barque / bateau (`boat`, `rowboat`), vagues stylisées

### PMU basque (bar-tabac)
- comptoir de bar, tabouret (`bar stool`, `counter`)
- bouteilles, verre (`bottle`, `wine glass`), machine à café
- TV cathodique (`crt tv`, `old television`), présentoir journaux

### Cathédrale
- cierge / bougie (`candle`), pupitre (`lectern`), banc (`church pew`)
- vitrail (plan/quad texturé), croix

### LA RIDE (cyber-club)
- platines CDJ / mixette (`dj`, `turntable`, `mixer`)
- enceintes (`speaker`), boule à facettes (`disco ball`), néon
- borne d'arcade (`arcade machine`, `arcade cabinet`)

### Taverne
- table, chaises, jukebox (`jukebox`), Nokia / vieux téléphone (`old phone`)

### Rave Euskadi / objets
- sono empilée (`sound system`, `speaker stack`), flightcase
- flyers, briquet, OCB (petits props)

## Note technique

- Le composant `Scene3D` recadre la caméra automatiquement quelle que soit la taille du modèle.
- Rendu volontairement "chunky" (pixelRatio 1 + flat shading) pour rester dans l'esprit rétro.
- Draco : décodeur chargé depuis le CDN gstatic (aucune install). Si tu veux du 100 % offline, on copiera les décodeurs dans `public/`.
