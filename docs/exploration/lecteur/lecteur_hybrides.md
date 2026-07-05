# LECTEUR — Trois hybrides autour de « se brancher sur l'atelier »

> Document de réflexion (aucun développement). Suite de `lecteur_objet.md`.
> Direction validée par Vincent : **la Radio de l'atelier comme philosophie, la Machine V2000 comme forme, des gestes de magnétophone/MiniDisc, compatibilité autoradio (D12)**. Le rituel signature : *se brancher sur l'atelier*.
> 2026-07-03 — v1, trois architectures à départager.

## Le problème à résoudre (commun aux trois)

Une radio et un lecteur sont deux machines contraires : l'une émet sans toi, l'autre obéit. L'hybride réussi n'est pas un compromis — c'est une machine où **la précision s'exprime dans le langage de l'émission**. On ne « lance » jamais un fichier : on se cale, on insère, on capture. Les trois directions ci-dessous sont trois réponses différentes à la même question : *où habite la précision dans une machine qui émet toute seule ?*

Invariants (les quatre exigences de Vincent, traduites) :

- **Laissé ouvert** : la machine a une vie au repos et un flux qui continue sans interaction.
- **Émet toute seule** : à l'ouverture, ça joue déjà — on arrive dans une émission en cours (cohérent avec « la machine ne démarre jamais », 030).
- **Précision** : tout morceau précis reste atteignable en moins de 5 secondes (D1 non négociable), mais ce chemin rapide est *mis en scène*, jamais un simple clic de liste nu.
- **Porte vers l'univers** : parasites, fragments, jingles, archives inexpliquées vivent dans les interstices du flux.

---

## Hybride A — LA RÉGIE (deux étages : ANTENNE / BANDE)

**L'idée.** La précision habite dans **un autre étage de la machine**. Le châssis V2000 superpose deux modules : en haut le **TUNER** (le flux — cadran, molette, stations de l'atelier), en bas le **DECK** (la précision — une fente, une bande, des transports). Deux régimes d'écoute physiquement incarnés, un commutateur entre les deux.

**Comment ça émet.** Le tuner porte quelques stations éditorialisées : les recherches, les démos, les mixes, les archives. Entre elles : statique, fragments, bribes de voix. L'antenne tourne en continu — quand on revient de la bande, l'émission a avancé sans nous (l'atelier vit, 010).

**Comment on est précis.** On **insère une bande**. Chercher un morceau (recherche, dossier Sons, lien profond) = la machine *charge une cassette* de ce morceau ou de ce dossier : clunk, la trappe se ferme, le commutateur bascule sur BANDE, lecture. Face B = démos et versions alternatives (geste magnéto conservé intégralement). Éjecter = l'antenne reprend là où elle en est.

**Gestes.** Tourner la molette · insérer/éjecter · retourner la cassette · basculer ANTENNE/BANDE.
**Vie au repos.** L'aiguille du cadran, les bobines qui tournent à l'étage bande, VU-mètre commun.
**Night Drive.** Littérale : les autoradios K7 avaient exactement cette double nature (radio + lecteur cassette). La Régie *est* un autoradio de salon — la métamorphose D12 est presque un simple changement de châssis.

**Forces.** La plus lisible des trois : chaque régime d'écoute a son étage, personne n'est jamais perdu. Les gestes magnéto vivent au premier plan. Progressive : M1 peut livrer le deck seul, l'antenne ensuite.
**Faiblesses.** C'est l'hybride le plus « somme de ses parties » : une radio posée sur un magnéto reste deux objets collés si le design du châssis ne les fond pas. Le flux et la précision cohabitent mais ne se parlent pas.
**Risque principal.** Perdre l'unité iconique — la silhouette doit être dessinée comme UNE machine, pas un empilement.
**P0.** Habillage d'antenne + sons mécaniques du deck + design du châssis double.

---

## Hybride B — LE SPECTRE (tout a une fréquence)

**L'idée.** La précision habite **dans le cadran lui-même**. Une seule métaphore unifie tout : **chaque pièce de l'atelier possède une fréquence, fixe, pour toujours** — comme un numéro de catalogue. Le cadran de la V2000 n'est pas une bande FM décorative : c'est **la carte sonore complète de l'atelier**. 88.0–92.0 les recherches, 92–96 les démos, 96–100 les morceaux, 100–104 les mixes, 104–108 les archives… et entre les fréquences attribuées : le no-man's-land — parasites, fragments, choses pas totalement expliquées, émissions fantômes.

**Comment ça émet.** À l'ouverture, la machine est calée quelque part et ça joue. Un mode SCAN dérive lentement de fréquence en fréquence : l'atelier s'écoute comme on traverse une ville la nuit.

**Comment on est précis.** Se caler. Chercher « CARMEN demo 3 » = la machine affiche `94.7` et l'aiguille **glisse jusqu'à la fréquence** (une seconde de statique, l'accrochage, le morceau). Le dossier Sons devient un *plan de fréquences* : cliquer un titre = se caler dessus. Des **presets mémorisables** (geste autoradio/MiniDisc : maintenir un bouton pour graver) gardent tes fréquences à toi. Et — cadeau architectural — **la fréquence est une adresse** : l'URL de partage d'un morceau peut être sa fréquence (D2, deep-linking : `…/94.7`).

**Gestes.** Tourner la molette · maintenir un preset pour le graver · le SCAN qu'on lance d'une pichenette.
**Vie au repos.** L'aiguille respire autour de la fréquence, le cadran rétroéclairé, l'affichage des segments.
**Night Drive.** La plus belle continuité conceptuelle : l'autoradio du dash affiche **les mêmes fréquences** — l'univers garde ses adresses la nuit. Tes presets du jour sont tes presets de conduite.

**Forces.** La plus conceptuellement pure : flux et précision sont **le même geste** (se caler), il n'y a pas deux modes. Le catalogue entier devient un espace explorable — scanner le cadran, c'est fouiller l'atelier à l'oreille (principes 6 et 10). Les fréquences cachées entre les pièces officielles sont un terrain de collection infini (`collect`).
**Faiblesses.** L'abstraction : il faut que le visiteur comprenne en dix secondes que le cadran EST la bibliothèque, sinon il croit à un habillage. Peu de gestes magnéto (pas de bande, pas de face B — sauf à ajouter une « double fréquence » par pièce, à creuser). Le mapping doit être conçu tôt et ne plus bouger (une fréquence réattribuée = une adresse brisée).
**Risque principal.** Le gimmick — si les fréquences ne sont qu'un skin de liste, tout s'effondre. Elles doivent être *vraies* : stables, partageables, habitées entre elles.
**P0.** Le plan de fréquences comme œuvre en soi + le sound design des interstices (statique, fantômes) + accrochages.

---

## Hybride C — LA BANDE TÉMOIN (l'émetteur + la capture)

**L'idée.** La précision habite **dans ce que le visiteur enregistre**. La V2000 est un **émetteur** : une ou deux fréquences riches, habillées, qui diffusent l'atelier en continu — on ne choisit pas ce qui passe. Mais la machine porte un deck et un gros bouton **● REC** : ce qui passe peut être **capturé sur ta bande**. Chaque visiteur repart avec la cassette de sa visite — les morceaux qu'il a saisis au vol, dans l'ordre où il les a vécus.

**Comment ça émet.** Pleinement : programme, jingles, transitions, voix, fragments — la fiction radiophonique la plus assumée des trois. L'atelier a une antenne, elle ne s'arrête jamais.

**Comment on est précis.** Deux chemins. (1) **Ta bande** : tout ce que tu as capturé se réécoute exactement, avec les transports du deck — la précision est une récompense de l'écoute. (2) **La demande** : chercher un morceau = *le demander à l'antenne* (la culture radio l'a toujours permis) — jingle bref « à la demande », le morceau passe maintenant. La précision existe pour tous, mais elle est mise en scène comme un geste d'auditeur, jamais comme un clic de fichier.

**Gestes.** ● REC au vol (LE geste signature — saisir la musique comme on attrape un souvenir) · rembobiner sa bande · éjecter/garder.
**Vie au repos.** L'émission continue, le compteur de bande, la LED REC prête.
**Night Drive.** Émouvante : **ta bande témoin joue dans l'autoradio** — tu conduis sur la bande-son de ta propre visite.

**Forces.** Le game design le plus fort : la capture transforme l'écoute passive en attention active (on écoute *mieux* quand on peut saisir), chaque visite fabrique un objet personnel (principe 10 — le visiteur repart avec quelque chose *à lui*), et `collect` a enfin son événement central. La fiction d'émission est totale, jamais diluée.
**Faiblesses.** La précision « à la demande » reste un déguisement — les puristes de la trouvabilité (D1) voudront vérifier que la demande est aussi rapide qu'un clic (elle doit l'être : jingle ≤ 1 s, interruptible). Exigence de contenu d'antenne maximale : c'est la direction la plus chère en production continue.
**Risque principal.** La promesse d'une radio vivante se juge sur la durée — si l'antenne se répète au bout de trois visites, la magie meurt (principe 6 inversé).
**P0.** Le plus gros des trois : une vraie grille d'antenne (jingles, voix, habillages, fragments) + le sound design de la capture + le concept « bande témoin » qui peut devenir un objet réel (des cassettes physiques de visites ?).

---

## Lecture comparée

| | Où vit la précision | Geste signature | Fiction d'émission | Gestes magnéto | Night Drive | Risque |
|---|---|---|---|---|---|---|
| A. La Régie | un étage dédié (deck) | insérer / retourner | moyenne (interrompue par la bande) | **maximaux** | littérale (radio-K7) | objet-somme, pas objet-un |
| B. Le Spectre | dans le cadran (fréquence = adresse) | se caler / graver un preset | forte (tout est onde) | faibles | **les mêmes adresses la nuit** | gimmick si fréquences pas vraies |
| C. La Bande témoin | dans ce qu'on capture | **● REC au vol** | **totale** | forts (ta bande) | ta visite en bande-son | coût d'antenne permanent |

Note de directeur technique : les trois partagent le même socle invisible (un moteur de flux + un index précis + le registre D12) — le choix n'engage donc pas l'architecture logicielle, il engage **l'identité**. Et B et C ne sont pas incompatibles : un Spectre où l'on peut capturer (REC sur n'importe quelle fréquence) est une synthèse possible — mais je recommande de choisir UN centre de gravité d'abord, quitte à greffer le reste plus tard (la Machine V2000 est modulaire par nature).

## Questions pour Vincent

1. **Le centre de gravité** : l'alternance (A), l'adresse (B) ou la capture (C) — lequel de ces trois gestes est « le geste Vincent 2000 » ?
2. Si B : acceptes-tu que **chaque pièce reçoive une fréquence fixe à vie** (c'est un engagement de catalogue, comme des numéros d'opus) ?
3. Si C : es-tu prêt à produire de l'antenne **en continu** (c'est P0 au carré, mais c'est un abonnement créatif, pas un chantier fini) ?
4. La face B (versions alternatives, démos liées à une pièce) : indispensable dès la v1 du lecteur, ou couche ultérieure ?
