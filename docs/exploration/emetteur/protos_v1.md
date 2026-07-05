# ÉMETTEUR — Prototypes v1 (design d'objet, aucun code)

> Trois machines très différentes, même identité D13 (émission / prise d'antenne). Wireframes : `proto_A_rack.svg`, `proto_B_boite.svg`, `proto_C_pupitre.svg`.
> La vraie différence entre les trois n'est pas la silhouette : c'est **qui tient le geste de la prise d'antenne**.
> 2026-07-03 — v1, à départager en manipulant.

## A — LE RACK (la machine décide)

Unité de diffusion 2U, sobre, professionnelle. La prise d'antenne n'a **pas de commande** : quand tu ouvres un morceau, un **volet mécanique** bascule tout seul de ATELIER à TOI, avec un claquement. Tu ne pilotes pas la machine, elle **te signale** qu'elle t'a donné l'antenne. Une seule vraie commande : la molette « L'ONDE » (dériver dans l'émission ; presser = revenir au direct).

- **Sensation** : on est *reçu* par la machine. Distance respectueuse, très radio.
- **Force** : la plus calme (principe 9), la plus crédible en objet pro. Format 2U ≈ 1-DIN : la façade glisse telle quelle dans le dash.
- **Faiblesse** : peu de gestes — le visiteur touche peu, donc s'attache par l'œil et l'oreille seulement.

## B — LA BOÎTE SOUDÉE (le geste binaire)

L'émetteur pirate littéral : tôle pliée, galvanomètre rond récupéré, lucarne sur le quartz, étiquette gaufrée de travers, fils vers un domino, antenne télescopique qui oscille. Le geste signature : **un levier** ATELIER/TOI — l'abaisser = prendre l'antenne (ka-chunk), le relever = la rendre. Ouvrir un morceau abaisse le levier *sous tes yeux*.

- **Sensation** : on manipule une machine bricolée par quelqu'un. La plus « vraie personne derrière l'écran » (principe 5).
- **Force** : le levier est le geste le plus mémorisable des trois ; l'objet raconte la filiation pirate sans un mot. Night Drive : **la façade se détache et se clipse dans le dash** — le geste culte des autoradios, inversé.
- **Faiblesse** : la plus chargée visuellement — à surveiller face au « calme visuel » ; risque pastiche si le bricolage devient décor (principe 3).

## C — LE PUPITRE (le geste continu)

Mini console de diffusion inclinée, deux VU (ATELIER / ANTENNE), haut-parleur témoin. Le geste signature : **un crossfader ATELIER ⟷ TOI** — l'héritage DJ de Vincent. Au repos il vit côté ATELIER avec des micro-ajustements ; ouvrir un morceau le fait **glisser tout seul** (fader motorisé, moteur audible). On peut aussi le pousser à la main — et à mi-course on entend réellement les deux mondes se croiser.

- **Sensation** : on partage les manettes avec l'atelier. La prise d'antenne n'est plus binaire : c'est un *mélange*.
- **Force** : le fader motorisé qui bouge sans main humaine est le signe de vie le plus puissant des trois ; le mi-course (émission audible sous ton morceau) est une idée sonore unique. Deux VU qui se désynchronisent = l'atelier continue derrière toi, rendu visible.
- **Faiblesse** : la plus complexe à lire en dix secondes ; le crossfader évoque l'outil DJ (risque : « c'est une table de mixage ? »). Night Drive : le pupitre s'aplatit, le fader devient curseur de fréquence — la métamorphose la moins littérale.

## Invariants (présents dans les trois, non négociables)

L'aiguille qui danse même son coupé · ON AIR jamais éteinte, qui respire · l'affichage de ce qui passe avec `???` pour les fragments · la fréquence/indicatif affichés (les mêmes en Night Drive) · ÉJECT (rendre l'antenne) · ÉCOUTE (couper le son ≠ couper l'émission) · on arrive toujours au milieu de quelque chose.

## Ce qu'on teste en manipulant (prochaine itération)

1. **Le regard** : lequel donne envie d'être regardé après 10 minutes sans interaction ?
2. **Le geste** : signalé (A), binaire (B) ou continu (C) — lequel a envie d'être refait ?
3. **La lecture** : un visiteur qui ne sait rien comprend-il en 10 s que ça émet et que rien n'est en pause ?
4. **La compacité** : l'objet vit-il aussi bien en petit (posé au coin du bureau) qu'en fenêtre ouverte ?

Les protos sont combinables : le châssis de A, le levier de B, les deux VU de C ne s'excluent pas — mais on choisit d'abord un centre de gravité gestuel.

---

## DÉCISION (2026-07-03) — Le Pupitre soudé (C + B)

Vincent choisit **C comme centre de gravité** (crossfader ATELIER ⟷ TOI = geste culte, héritage DJ) **+ la matière de B** (machine soudée à la main, objet récupéré, pas produit design). Wireframe final : `proto_final_pupitre_soude.svg`.

Synthèse retenue :

- **Le crossfader motorisé** est LE geste : glisse seul à la prise d'antenne, revient seul au retour, cède sous la main (moteur débrayé). Repère ✕ à mi-course — l'endroit où les deux mondes s'entendent.
- **Matière B partout** : galvanomètre rond récupéré (ATELIER) + VU rectangulaire dépareillé (ANTENNE) — rien n'est assorti, tout fonctionne ; lucarne sur le quartz ; étiquette gaufrée de travers ; ampoule ON AIR sous cage ; fils vers un domino ; vis manquante ; pied calé au bois ; antenne télescopique qui oscille.
- **Levier repris de B en geste secondaire** : petit levier bakélite ÉCOUTE (couper le son, qui ne coupe rien d'autre).
- **Quatre états du fader** : émission (défaut, micro-ajustements) → prise d'antenne (glisse vers TOI, ~1 s, moteur audible) → mi-course (les deux mondes se croisent) → retour (fin ou ÉJECT — l'émission a continué sans nous, on la retrouve plus loin).
- **Night Drive** : le pupitre s'aplatit en façade 1-DIN, le crossfader devient le curseur de fréquence du dash.

Prochaine itération : prototype interactif v1 de cet objet (première fois qu'on code l'Émetteur).
