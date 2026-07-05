# ÉMETTEUR — Le comportement vivant (spécification, aucun code)

> Ce que fait la machine quand on ne fait rien. Complément du wireframe final (`proto_final_pupitre_soude.svg`).
> Rattachement : D13, `050_SON.md` (l'écoute est sacrée), principe 9 (calme visuel, exubérance interactive).
> 2026-07-03 — v1, à valider avant le premier prototype interactif.

## La règle qui écarte tous les gadgets

**Chaque mouvement est une mesure ou une conséquence physique. Jamais une animation.**

La machine n'a que deux sources d'énergie comportementale, plus une troisième discrète :

1. **Le signal** — ce qui passe réellement dans ses fils (l'émission, ton morceau). Les aiguilles le mesurent, le ruban l'affiche, le quartz le porte.
2. **L'alimentation** — elle est branchée : respiration de l'ampoule, pulse du quartz, tremblement mécanique résiduel.
3. **L'usure** — la tôle, la chaleur, le temps : les événements rares.

Corollaires absolus :

- **La machine ne te regarde pas.** Elle ne réagit jamais à la souris, au survol, à la présence, à l'inactivité. Elle ne fait pas le beau. C'est précisément ce qui la rend crédible : elle vivrait exactement pareil dans un onglet ouvert à côté.
- **Le hasard n'existe pas** — tout ce qui semble aléatoire a une cause (un fragment qui passe, la tôle qui chauffe, le secteur). Le générateur de comportement pourra être pseudo-aléatoire, mais chaque tirage correspond à une cause nommée.
- **Aucun accident pendant un morceau** (050 : l'écoute est sacrée). Les imperfections vivent dans les interstices de l'émission, jamais par-dessus une pièce.
- **L'immobilité est un comportement.** Une machine où tout frémit est un gadget. La liste de ce qui ne bouge jamais est aussi importante que le reste.

---

## 1. Le continu (visible dès la première seconde)

| Élément | Comportement | Rythme |
|---|---|---|
| **Galvanomètre LIGNE ATELIER** | Suit l'amplitude de la ligne de l'atelier. Balistique lourde : retard ~300 ms, léger dépassement, retombée lente. Ne descend jamais à zéro — plancher avec micro-frémissement (le bruit de fond de la ligne). | continu |
| **VU ANTENNE** | Suit ce qui est émis vers toi. Balistique **plus nerveuse** que le galvo — deux appareils dépareillés ont deux personnalités de mouvement. | continu |
| **Ampoule ON AIR** | Respiration lente en luminosité, amplitude faible. Période **irrégulière** : 3,5–4,5 s — une alimentation qui charge, pas un métronome. | ~4 s |
| **Quartz (lucarne)** | Pulse rapide, à la limite du perceptible — la porteuse. Absolument régulier : c'est un quartz, c'est sa fierté. | ~1 s |
| **Ruban titre** | Défilement lent, constant. Fragments : `???`. Entre deux diffusions : l'indicatif de la station. | continu |
| **Fréquence 92.00** | Stable. Micro-scintillement d'un segment de temps en temps (contact fatigué), jamais de dérive : le quartz tient. | continu |
| **Antenne télescopique** | Oscillation quasi imperceptible (< 1°, période ~7 s) — l'inertie du fouet. | ~7 s |

**Son au repos** : rien, ou presque — l'émission EST le son. La machine elle-même ne s'entend que par ses vrais actes mécaniques (courses du fader, relais, tôle), toujours sous la musique, jamais par-dessus.

## 2. Ce qui ne bouge JAMAIS

Le châssis, les vis (y compris la manquante), les étiquettes, le domino et les fils (sauf §4), le levier ÉCOUTE (sauf main humaine), le bouton ÉJECT, la sérigraphie, la cale en bois. La moitié de la machine est morte — c'est ce qui rend l'autre moitié vivante.

## 3. L'événementiel (lié à l'émission, plusieurs fois par minute)

- **Changement de segment dans l'émission** (un morceau finit, un field recording commence…) : le ruban change, le galvo marque le coup (une retombée + une reprise), et le **fader se recale de 1–2 mm** — la seule trace visible que quelqu'un, derrière, tient l'antenne. C'est le micro-mouvement le plus important de la machine : une commande qui bouge sans main = quelqu'un d'autre est aux manettes.
- **Un fragment `???` passe** : le galvo s'affole une seconde (tape haut, retombe), le ruban affiche `???`. Rien d'autre ne le commente.
- **Silence dans l'émission** (l'atelier réfléchit) : les aiguilles retombent au plancher et frémissent. ON AIR respire toujours. Le silence n'est pas une panne — la machine le montre en restant parfaitement calme.
- **Passage à forte énergie** (basses) : vibration infime du châssis — le pied calé fait son travail. Seulement pendant l'émission forte, jamais en dehors.

## 4. Les événements rares (la récompense de contemplation)

Espacés, jamais deux fois de suite, **jamais pendant un morceau** — ils vivent dans les interstices :

| Après ~ | Événement | Cause fictionnelle |
|---|---|---|
| 2–3 min | **Le vacillement** — ON AIR flicke une fois (< 100 ms). | le secteur |
| 3–5 min | **L'accroc du ruban** — le défilement hésite un cran, repart. | le moteur du ruban fatigue |
| 4–6 min | **Le claquement thermique** — un tic sourd de tôle, l'antenne oscille un peu plus fort quelques secondes. | le métal chauffe |
| 5–8 min | **Le recalage** — le fader fait un aller-retour de ~5 mm, moteur audible très bas. | auto-calibration |
| rare (1×/visite) | **La perte d'accroche** — 300 ms de souffle, la fréquence affiche `--.--`, re-lock immédiat. Uniquement entre deux diffusions. | l'onde |
| très rare (longues visites) | **Le coup de ligne** — les DEUX aiguilles tombent à zéro une seconde, puis remontent. Quelqu'un, à l'atelier, a débranché puis rebranché quelque chose. | la présence humaine (principe 5) |

Chaque événement a un plafond de fréquence strict. Un accident qui se répète devient un tic, et un tic est un gadget.

## 5. Réactions aux événements de l'OS

- **Ouvrir/fermer/déplacer des fenêtres ailleurs, chercher, fouiller les dossiers** : **rien.** La machine est branchée sur l'atelier, pas sur toi.
- **Réduire l'Émetteur** : rien ne s'arrête — c'est une radio. Le son continue, la machine vit hors champ.
- **Levier ÉCOUTE sur OFF** : le son se coupe (ka-chik), et c'est tout. Aiguilles, ruban, fader, ON AIR : inchangés. Regarder la machine émettre en silence est une expérience en soi — c'est la preuve visuelle de D13.

### Un morceau démarre (prise d'antenne)

Séquence, ~2 s au total :

1. **T+0** — clic de relais (sous la musique en cours).
2. **T+0 → T+1 s** — le fader **glisse vers TOI**, moteur audible très bas. Le ruban bascule sur ton titre.
3. **Au passage du ✕** — crossfade audio réel : pendant une seconde, l'émission s'entend sous ton morceau. C'est LE moment signature — jamais un cut sec.
4. **T+2 s** — le VU ANTENNE ne suit plus que ton morceau ; le galvo LIGNE ATELIER, lui, **continue de suivre l'émission** qui se poursuit derrière. Les deux aiguilles se désynchronisent : le message est visible sans un mot.

**Enchaîner un autre morceau pendant TOI** : le fader reste à TOI — juste un micro recul-avance (re-cue) et le crossfade. Pas de retour à ATELIER entre deux choix (pas de ping-pong).

### Un morceau se termine

1. Fin naturelle de la pièce — une respiration (~1 s de souffle très léger, l'antenne « vide »).
2. Le fader **revient vers ATELIER, plus lentement qu'à l'aller** (~1,5 s) : on rend l'antenne, on ne la lâche pas.
3. Au ✕, l'émission remonte sous la fin du souffle — et **elle est ailleurs que là où on l'avait laissée** : elle a continué sans nous. Le galvo et le VU se resynchronisent.
4. Le ruban reprend le titre de l'émission. Rien ne fanfaronne : l'atelier reprend, c'est tout.

**ÉJECT** : même chorégraphie sans la respiration — course de retour plus franche (~1 s), clic de relais immédiat.

## 6. Cinq minutes sans rien toucher (scénario témoin)

**0:00** — Tu ouvres l'Émetteur : une démo est déjà en cours (on arrive toujours au milieu). Les deux aiguilles dansent presque ensemble, ON AIR respire, le ruban défile.
**0:40** — La démo se termine. Deux secondes de quasi-silence : aiguilles au plancher, frémissement. Le fader se recale de 1 mm. Un field recording commence, le galvo repart.
**1:30** — `???` : dix-huit secondes d'un fragment jamais expliqué. Le galvo s'affole une seconde au début, puis suit.
**2:10** — Une transition, puis un morceau terminé. Rien d'autre à signaler : la machine travaille.
**2:50** — ON AIR vacille une fois. Tu n'es pas sûr de l'avoir vu.
**4:15** — Tic sourd — la tôle. L'antenne oscille un peu plus pendant quelques secondes.
**4:50** — Entre deux segments : 300 ms de souffle, `--.--`, re-lock sur 92.00. L'émission continue comme si de rien n'était.
**5:00** — Il ne s'est « rien passé ». Et pourtant tu es resté.

C'est le test d'acceptation du comportement : **cinq minutes sans interaction doivent suffire à croire que quelque chose tourne derrière** — sans qu'aucun élément n'ait jamais cherché ton regard.

## Questions ouvertes pour Vincent

1. Les **plafonds de rareté** (colonne « après ~ ») te vont-ils, ou veux-tu la machine encore plus sobre ?
2. Le **coup de ligne** (les deux aiguilles à zéro — quelqu'un est à l'atelier) : tu le veux, ou c'est déjà trop raconté ?
3. La **vibration de basses du châssis** : à garder (subtile) ou à supprimer (pureté calme visuel) ?
4. L'indicatif affiché entre deux diffusions par le ruban — c'est le moment de nommer la station (l'image dit « VINCENT 2000 RADIO », le cadran dit 92.00 FM : on verrouille ?).
