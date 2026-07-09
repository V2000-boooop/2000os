# 005 — DESIGN PRINCIPLES

> **Rôle :** manifeste créatif. ADN de toute décision future, quelle que soit sa taille.
> **Dépendances :** aucune. Tous les autres documents dépendent de celui-ci.
> **Révision :** 2026-07-03 — v1 **validée**.

## Préambule

Vincent 2000 OS n'est pas un portfolio déguisé en Windows 98. C'est l'invention des souvenirs d'un ordinateur qui aurait réellement vécu entre 1998 et 2003 — l'ordinateur d'une vraie personne, avec ses recherches, ses obsessions, ses erreurs, ses essais et ses influences. Si l'on retire complètement l'esthétique rétro, le projet doit rester intéressant : sa valeur repose sur son idée, jamais sur son apparence.

## Le principe fondateur

**0. Le site provoque la création.**
Vincent 2000 OS n'est pas seulement le lieu où le travail se montre : c'est un outil qui le fait naître. Chaque évolution du projet est une mission créative — une nouvelle fenêtre appelle son identité sonore, une expérience immersive peut donner naissance à un morceau complet, un dossier peut avoir sa propre ambiance, un mini-jeu peut devenir l'occasion d'un EP, une interaction peut exiger d'enregistrer de nouveaux bruitages. Le site n'archive pas le travail : il le provoque. C'est la raison d'exister du projet, et le critère ultime de ses priorités : à valeur égale, on choisit toujours l'évolution qui déclenche le plus de création.

## Les dix principes

**1. Tout a une raison d'exister.**
Chaque interaction, chaque détail, chaque son sert l'un de deux buts : faciliter la découverte du travail, ou enrichir l'univers de Vincent 2000. Ce qui ne fait ni l'un ni l'autre est supprimé, même si c'est joli, drôle ou techniquement impressionnant.

**1-bis. L'interaction vivante escalade et laisse une trace (pattern cœur, demande Vincent 2026-07-07).**
Une action répétée sur un élément ne rejoue pas bêtement la même chose : elle **escalade par paliers**. Au bout de N répétitions, une courte animation se déclenche et **se fige en un nouvel état persistant** que l'objet/le perso **garde dans la scène** (il ne revient pas à l'état initial). Ex. fondateur : faire fumer le raver sur la barque — 2 taffes → un état planant tenu, 4 taffes → un état plus défoncé tenu, chacun modifiant aussi son état global (ivresse/défonce, indicateur à l'écran). C'est le genre de vie qu'on vise **partout** : des états qui s'accumulent et restent, pas des gadgets qui se réinitialisent. (Implémenté : compteur `stickPuffs` + `STICK_STATES` + pose tenue `stickHeld` dans NightDrive ; il ne manque que les frames des paliers.)

**2. Le contenu prime sur l'effet.**
Le site reste un véritable outil : retrouver une musique, une recherche, une note ou un projet doit toujours être rapide. L'expérience enrichit l'accès au contenu ; elle ne s'interpose jamais devant lui.

**3. Le rétro est une inspiration, pas un costume.**
On ne copie pas les années 2000, on n'imite pas Windows. On invente les souvenirs d'une machine qui aurait vécu cette époque. Un détail justifié uniquement par « c'était comme ça à l'époque » n'est pas justifié.

**4. La valeur survit à l'esthétique.**
Toute fonctionnalité doit rester intéressante une fois déshabillée de son apparence rétro. Si l'idée ne tient pas nue, l'habillage ne la sauvera pas.

**5. Une vraie personne derrière l'écran.**
Le visiteur doit sentir une présence humaine authentique — pas une mise en scène de la créativité. Le site ne crie jamais « regardez comme je suis créatif » : la créativité est une conséquence naturelle de chaque détail, pas un message.

**6. La profondeur récompense le retour.**
Un visiteur doit pouvoir revenir dix fois et découvrir encore quelque chose. On privilégie la densité et les couches de lecture au spectacle immédiat. L'effet « c'est marrant » qui s'épuise en deux minutes est un échec.

**7. Chaque interaction laisse une trace.**
Même une interaction de quelques secondes doit marquer la mémoire. Une interaction originale mais qui fait perdre du temps est une mauvaise interaction.

**8. Utilité et poésie en équilibre.**
Ni pur outil, ni pure œuvre. Chaque système du projet doit pouvoir répondre aux deux questions : « à quoi il sert ? » et « qu'est-ce qu'il fait ressentir ? »

**9. Calme visuel, exubérance interactive.**
La composition est minimale ; l'expérience ne l'est jamais. Le caractère vient du feedback de chaque interaction (son, micro-animation, matière, surprise), pas de la densité de l'écran. Chaque clic procure une petite satisfaction. Formule canonique : *le bureau est calme, les interactions sont exubérantes.*

**10. Le visiteur est un explorateur, jamais un consommateur.**
Le visiteur ne parcourt pas une liste de projets : il explore un lieu réel et construit progressivement sa propre compréhension de l'univers. Le site ne raconte pas tout immédiatement — il récompense la curiosité et laisse volontairement une place à l'interprétation. Le visiteur repart avec l'impression d'avoir découvert quelque chose de personnel, pas d'avoir consulté une vitrine. Ce principe ne contredit jamais le principe 2 : ce qui se mérite est une couche supplémentaire, jamais le seul chemin vers le contenu.

> Révision 2026-07-03 : ajout du principe 9 (calme visuel, exubérance interactive), né de la conception du bureau. L'ancien principe 9 devient le 10.

## Les interdits

Ce que Vincent 2000 OS ne sera jamais : un portfolio déguisé en Windows 98 · un gimmick rétro · une démonstration technique JavaScript · un musée figé · une collection d'easter eggs sans intérêt · de la nostalgie facile · une blague qui dure trop longtemps.

## Le test des trois questions

Avant d'ajouter quoi que ce soit (fonctionnalité, app, interaction, contenu, son, détail visuel) :

1. **Est-ce que ça facilite la découverte du travail ou enrichit l'univers ?** (Principe 1)
2. **Est-ce que ça resterait intéressant sans l'habillage rétro ?** (Principe 4)
3. **Est-ce que quelqu'un d'autre aurait pu le créer ?** Si oui, ce n'est pas encore assez Vincent 2000. (Principe 5)

Deux « non » aux questions 1–2, ou un « oui » à la question 3 : on retravaille ou on abandonne.

Et une question bonus qui départage les priorités : **quelle création ce chantier va-t-il provoquer ?** (Principe 0 — un chantier qui déclenche un morceau, un son ou une recherche passe devant les autres.)
