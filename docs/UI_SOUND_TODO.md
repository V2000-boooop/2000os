# UI SOUND TODO — pense-bête de production

Format : WAV mono 44.1 kHz, 16/24 bit. Déposer dans `public/media/ui/` (nom exact).
Tester : recherche → « lab » → UI Sound Lab → **↻ recharger** → bouton ▶ du son.
Détails complets : `docs/exploration/soundlist_ui_v1.md`.

| Ordre | Fichier | Durée | Intention |
|---|---|---|---|
| 1 | `tick.wav` | 10–25 ms | Le grain de base du système — quasi subliminal, c'est lui qu'on entend le plus. |
| 2 | `open.wav` | 60–120 ms | Une fenêtre s'enclenche et se déplie — mécanique positive, sans note. |
| 3 | `close.wav` | 50–100 ms | L'inverse exact d'open : même mécanique, énergie descendante, plus mat. |
| 4 | `minimize.wav` | 40–80 ms | Escamotage bref vers le bas — la fenêtre reste vivante quelque part. |
| 5 | `restore.wav` | 40–80 ms | Jumeau montant de minimize. |
| 6 | `launch.wav` | 150–300 ms | La machine s'engage — montée en régime, led qui s'allume. Sec quand même. |
| 7 | `load_tick.wav` | 5–15 ms | Métronome de patience — plus sourd que tick, doit supporter la rafale. |
| 8 | `select.wav` | 10–30 ms | Du toucher, pas de l'action — presque haptique, sous tick. |
| 9 | `deny.wav` | 80–150 ms | Refus sans punition — buzz mat, ni alarme ni cartoon. |
| 10 | `collect.wav` | 250–500 ms | Le seul son précieux — éclat bref, deux notes max, futur son de la collection. |

Tests en contexte réel (après ↻) :
- `tick` → clic sur une note dans Notes (aperçu) · `open`/`close` → ouvrir/fermer un dossier
- `minimize`/`restore` → bouton « _ » puis clic dans la barre des tâches
- `launch` + `load_tick` → double-clic sur un .exe dans Jeux
- `select`, `deny`, `collect` → pas encore câblés dans l'OS : tester au bouton du Lab, me prévenir quand les fichiers existent.

Gains : régler au slider dans le Lab, reporter les valeurs finales dans `src/data/sounds.js` (ou me les donner).
