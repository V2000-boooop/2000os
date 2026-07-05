# SONS DE NIGHT DRIVE — ce que Vincent prépare, ce que Claude branche

> Contrat de nommage : **le nom du fichier EST le branchement.** Tu déposes un
> fichier au bon nom → Claude (ou le moteur, une fois les hooks posés) le fait
> vivre. Pas de fichier = silence, jamais de fallback (règle 050 : le silence
> fait partie de l'identité).
> Formats : `.wav` ou `.mp3` (les deux acceptés partout ; boucles longues →
> plutôt mp3). Dossier des sons du monde : `public/media/nightdrive/sons/`.

## 1 · La séquence d'entrée (bureau → Night Drive)

L'ordre est acté : **nightmode on → démarrage voiture → la ville existe.**

| Ordre | Fichier | État |
|---|---|---|
| 1 | `public/media/ui/nightmode_on.wav` — le bruit UI de bascule | **Vincent l'a** → à déposer sous ce nom |
| 2 | `public/media/ui/ignition.wav` — le démarrage, enchaîne juste après | **Vincent l'a** → déjà branché, à déposer |
| 3 | l'ambiance du quai prend le relais (cat. 2) | à préparer |

## 2 · Ambiances de lieu (une boucle par scène)

Le lit sonore d'une scène : discret, jamais de mélodie, ça doit pouvoir tourner
dix minutes sans qu'on y pense. **Boucle sans couture** (début/fin raccord),
30 s – 2 min.

| Fichier | Le lieu, l'intention |
|---|---|
| `sons/ambiance_quai.mp3` | la ville depuis la voiture : moteur au ralenti ? vent, ville lointaine |
| `sons/ambiance_barque.mp3` | l'eau qui clapote, rames, loin du quai |
| `sons/ambiance_taverne.mp3` | rumeur de bar, verres, chaleur |
| `sons/ambiance_laride.mp3` | club au repos : basses étouffées, néon qui grésille |
| `sons/ambiance_pmu.mp3` | comptoir : télé en sourdine, machine à café |
| `sons/ambiance_cathedrale.mp3` | réverbération immense, presque rien |

## 3 · Passages (d'une image à l'autre)

Le son du seuil, joué pendant le zoom-crossfade (~650 ms). Courts : 0,5 – 2 s.

| Fichier | Moment |
|---|---|
| `sons/porte_taverne.wav` | entrer à la taverne |
| `sons/porte_laride.wav` | entrer à LA RIDE |
| `sons/porte_pmu.wav` | entrer au PMU |
| `sons/porte_cathedrale.wav` | entrer dans la cathédrale (porte lourde, écho) |
| `sons/porte_barque.wav` | monter dans la barque |
| `sons/ressortir.wav` | **un seul son générique** pour tous les « ▾ ressortir » / Échap |

## 4 · Changements d'univers (les parenthèses dans la parenthèse)

Quand on ne change pas seulement d'image mais de dimension. Chacun = un son
d'entrée (ou une boucle si l'univers vit dans la durée).

| Fichier | Univers |
|---|---|
| `sons/univers_dark.mp3` | vitrail démoniaque → dark psyché catholique (boucle) |
| `sons/univers_ange.mp3` | vitrail joyeux → le même univers, angélique (boucle) |
| `public/media/nightdrive/barque_ciel.wav|mp3` | le ciel étoilé (déjà branché, boucle, attend ton fichier) |

## 5 · Objets et interactions (clic sur une zone)

Un son par objet quand il a quelque chose à dire. Courts, francs.
Nommage : `sons/zone_<scene>_<zone>.wav` — les ids exacts sont dans
`src/os/nightdrive/scenes.js`. Ceux qui comptent d'abord :

| Fichier | L'objet |
|---|---|
| `sons/zone_cathedrale_pupitre.wav` | le discours à la con (peut être long) |
| `sons/zone_cathedrale_confessionnal.wav` | tes vocaux en boucle (« Là pour vous parler ») |
| `sons/zone_cathedrale_bougies.wav` | la pièce qui tombe (pourboire) |
| `sons/zone_pmu_terminal.wav` | la phrase de comptoir (ticket qui s'imprime ?) |
| `sons/zone_taverne_phone.wav` | le Nokia (sonnerie/bip) |
| `sons/zone_laride_toilettes.wav` | le lieu à sound design promis |
| … | tout autre objet : même schéma de nom, il sera branché |

## 6 · Déjà en attente ailleurs (rappel, rien de nouveau)

- Playlists par preset + bruits de click façon GTA (transport de la voiture).
- Cassettes de la boombox : 1 K7 = 1 playlist (`cassettes.js`).
- Exclus DJ booth : fichiers dans `public/media/djbooth/`.

## Règles de niveau (pour que tout coexiste)

- Ambiances (cat. 2 et boucles cat. 4) : **basses**, elles ne rivalisent jamais
  avec l'antenne (D13 : l'écoute est sacrée — si un son de l'OS joue, l'univers
  se fait petit).
- Passages/objets (cat. 3 et 5) : francs mais courts.
- Vincent règle ses niveaux dans les fichiers ; Claude ne compresse ni ne
  normalise rien (même règle que la famille UI).

## Ordre de préparation conseillé

1. Séquence d'entrée (tu as déjà les deux fichiers → dépose-les).
2. `ressortir.wav` + 2-3 portes (taverne, cathédrale).
3. Ambiance quai puis cathédrale (les deux plus fortes en identité).
4. Univers dark/ange + objets cathédrale (pour finir le lieu d'un coup).
