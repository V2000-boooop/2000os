# Références & idées pour créer les scènes

> Banque d'inspirations concrètes pour la création de scènes/lieux de Vincent 2000 OS.
> Vincent y dépose des liens (Rive, web, jeux, vidéos) ; les agents `scenographe` et `concepteur-scene` la consultent avant de proposer/prompter.
> But : nourrir les scènes avec ce qui se fait de mieux (interactif, animé, ambiance), pas proposer « de tête ».

## Rive — scènes interactives / animées

- **Journey** (Rive Marketplace) — https://rive.app/marketplace/23461-43911-journey/
  *Déposé par Vincent (2026-07-06) : « c'est ce qu'il me faut parfois aussi ».*
  Type de référence : **scène Rive riche, animée et immersive** — le genre d'ambiance/interaction à viser pour certaines sous-scènes (calques vivants, transitions, profondeur). À ouvrir dans le preview/éditeur Rive (page client-rendered, pas lisible en fetch brut). Piste d'usage : une scène « voyage »/transition contemplative, ou un lieu qui respire tout seul entre deux interactions.

## Rive — architectures d'habillage / avatar (voie d'évolution)

*Modèles réutilisables pour un perso customisable. NB : ils attendent un perso **dessiné dans Rive** (vecteur/mesh), pas des PNG importés → pertinents seulement si on veut le perso **animé** (danse/réaction). Pour le workflow PNG de Vincent, le moteur calques CSS suffit ; Rive = upgrade quand le perso doit bouger.*

- **Skins Demo** (JcToon) — https://rive.app/marketplace/2753-5927-skins-demo/ — clic perso → change de skin, chaque skin = un groupe toggle. Le pattern swap.
- **Avatar Creator (tuto officiel)** — https://rive.app/use-cases/avatar-creator-tutorial — construire un customiseur complet.
- **Customizable Character w/ Joysticks** — https://rive.app/marketplace/5152-10353-customizable-character-with-joysticks/

## DA du jeu d'habillage — collage découpé « Tony Hawk » (validé Vincent, 2026-07-06)

Le changement de fringue sur le perso vise un **graphisme bien détouré, presque collage/découpage** façon menus **Tony Hawk's Pro Skater** / fanzine skate-punk cut-and-paste. Conséquences : **bords francs assumés** (le détourage net EST le style), calques posés comme des **papiers découpés** (paper-doll), petites imperfections de proportion = intentionnelles. Avantage production : les PNG de fringues n'ont **pas besoin d'être fondus au pixel** → génération plus simple (méthode It32, détour franc). S'applique au perso + aux vignettes du portant.

**Raffinement (Vincent, 2026-07-06) — contour sticker dans le prompt.** Ajouter aux prompts de fringues un **contour graphique stylisé** (keyline/outline net façon sticker découpé / menu PS2 cel-shadé) → silhouette qui claque + détourage plus facile. Pipeline validé côté code (`tools/build_dressup_layers.py`) : fond gris keyé, **découpe en bandes par slot avec fondu aux jonctions internes** (pas de rectangle dur à la taille), calques webp légers. Le contour stylisé joue sur la silhouette extérieure ; les jonctions internes restent en fondu.

## À compléter

- Rive Community & Marketplace (`rive.app/community`, `rive.app/marketplace`) — fichiers interactifs réutilisables (ex. Interactive Sasquatch, Skins Demo).
- Codrops / Tympanus, Awwwards, CodePen — effets web, perspective, parallax, WebGL.
- Jeux de réf. (par scène, notés par le concepteur) : PS2/arcade, dress-up, rythme, tag…

*(Vincent : colle ici tout lien qui t'inspire pour une scène, avec une ligne sur ce que tu aimes dedans. Les agents s'en servent.)*
