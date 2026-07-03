# Sound design list — Famille UI v1

> Document de production pour Vincent. Direction : **sec, tactile, rétro, pas cartoon** — entre vieux système, machine personnelle, studio, sampler, disque dur, interface de jeu et matériel audio.
> Livraison : WAV mono, 44.1 kHz, 16 ou 24 bit, dans `public/media/ui/`. Les gains finaux se règlent dans `src/data/sounds.js`.
> 2026-07-03 — v1, 10 sons.

## Règles de famille

- **Une seule matière-mère** : enregistrer/traiter toute la famille dans la même session, avec la même chaîne — c'est le « boîtier » de la machine qu'on entend, pas dix objets différents.
- **Attaque franche** (< 5 ms) partout sauf `collect`. Pas de réverb de salle : la résonance vient de l'objet, jamais de l'espace.
- **Aucune mélodie** sauf `collect` (et encore : deux notes max). Le système parle, il ne chante pas.
- Le couple `open`/`close` et le couple `minimize`/`restore` doivent être perçus comme **aller/retour de la même mécanique**.

## Les 10 sons

| # | Fichier | Événement | Durée | Intention | Matière possible | Niveau (peak / gain) | Priorité |
|---|---|---|---|---|---|---|---|
| 1 | `tick.wav` | Accusé discret : aperçu de note, re-focus d'une fenêtre déjà ouverte | 10–25 ms | Le grain de base du système — quasi subliminal. C'est le son le plus entendu : il définit la matière de tout l'OS. | Clic de relais téléphonique, touche de calculatrice amortie, contact métallique très proche micro, jack qu'on effleure | −12 dBFS / 0.10 | **P1** |
| 2 | `open.wav` | Ouverture d'une fenêtre | 60–120 ms | Quelque chose s'enclenche et se déplie — mécanique positive, sans note. | Switch de console + souffle de servo très court, tiroir de sampler qui se clipse, relais + résonance de boîtier plastique | −9 dBFS / 0.16 | **P1** |
| 3 | `close.wav` | Fermeture d'une fenêtre | 50–100 ms | L'inverse exact d'`open` : même famille, énergie descendante, plus mat. | La source d'`open` inversée ou pitchée bas, switch relâché, capot qui se referme | −9 dBFS / 0.16 | **P1** |
| 4 | `minimize.wav` | Réduction vers la barre des tâches | 40–80 ms | Escamotage — aspiration brève vers le bas ; la fenêtre reste vivante quelque part. | Glissé rapide de fader linéaire, bande qui ralentit (très court), micro-woosh granulaire | −10 dBFS / 0.14 | **P1** |
| 5 | `restore.wav` | Restauration depuis la barre | 40–80 ms | Le jumeau montant de `minimize`. (Le moteur joue aujourd'hui `minimize` pour les deux — je sépare l'événement dès que ce fichier existe.) | Même source que `minimize`, jouée à l'envers | −10 dBFS / 0.14 | **P2** |
| 6 | `launch.wav` | Lancement d'un `.exe` | 150–300 ms | La machine s'engage : montée en régime, led qui s'allume. Le plus généreux de la famille, mais toujours sec. | Disque dur qui s'active, lecteur CD qui monte en rotation, seek de disquette court, relais + nappe de 100 ms | −9 dBFS / 0.15 | **P2** |
| 7 | `load_tick.wav` | Tic de la barre de chargement (splash des `.exe`) | 5–15 ms | Métronome de patience — plus sourd que `tick`, doit supporter la rafale sans fatiguer. (Je le câble dès qu'il existe ; `tick` sert d'intérim.) | Pas de tête de lecture, compteur mécanique, touche de clavier amortie | −15 dBFS / 0.07 | **P2** |
| 8 | `select.wav` | Sélection d'une icône (clic simple sur le bureau) | 10–30 ms | Du toucher, pas de l'action — presque haptique. Encore sous `tick`. | Frottement court de plastique, contact sec sans résonance | −16 dBFS / 0.06 | **P3** — risque de fatigue, à tester, facile à retirer |
| 9 | `deny.wav` | Action impossible / erreur douce (futur : programme verrouillé, `???.exe`) | 80–150 ms | Refus sans punition — buzz mat, ni alarme ni cartoon. | Relais qui rate, buzz 50 Hz très court, ressort étouffé | −10 dBFS / 0.14 | **P3** |
| 10 | `collect.wav` | Déblocage d'une pièce / récompense de collection (040), mise en favori | 250–500 ms | Le seul son « précieux » de la famille : un éclat bref et mémorable, à la lisière du musical, tenu (deux notes max, pas de jingle). Le futur son de la collection. | Éjection de minidisc + harmonique, note de boîte à musique pitchée bas, ping de studio traité | −9 dBFS / 0.16 | **P3** — la fonctionnalité arrive avec les jeux |

## Ordre de travail conseillé

`tick` d'abord (il définit la matière), puis `open`/`close` ensemble, puis `minimize`/`restore` ensemble. `launch` + `load_tick` en deuxième session. `select`, `deny`, `collect` quand la famille est stabilisée.

## Câblage

`tick`, `open`, `close`, `minimize`, `launch` : remplacer les fichiers dans `public/media/ui/`, rien d'autre à faire.
`restore`, `load_tick`, `select`, `deny`, `collect` : déposer les fichiers et me le dire — j'ajoute l'entrée dans `sounds.js` et le point de déclenchement.
