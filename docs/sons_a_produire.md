# Sons à produire — Night Drive (Vincent 2000 OS)

**Export :** `public/media/nightdrive/sons/` · **Format :** .wav (ou .mp3), 44.1 kHz.
**Règle :** le nom = le branchement. Respecte-le exactement, le fichier s'active tout seul (silence si absent).
⭐ = prioritaire (fait la différence / ta patte). Le reste (foley court) je peux le synthétiser si tu préfères.

---

## 1. AMBIANCES (boucles, sans blanc, seamless) — ⭐ ta zone

| fichier | durée | intention |
|---|---|---|
| ⭐ `ambiance_pmu.wav` | 8–16 s | bar-tabac fin de nuit : hum grave, TV lointaine, murmure, dub discret |
| ⭐ `ambiance_quai.wav` | 12–16 s | dehors nuit, eau, ville au loin, vent, néons qui grésillent |
| ⭐ `ambiance_barque.wav` | 12–16 s | clapot, bois qui craque, lanterne, radio pirate très loin |
| ⭐ `ambiance_cathedrale.wav` | 12–20 s | réverb longue, souffle sacré, drone orgue grave |
| ⭐ `ambiance_taverne.wav` | 10–16 s | brouhaha chaud, verres, vieux juke en sourdine |
| ⭐ `ambiance_laride.wav` | 8–16 s | club : basse sourde derrière une porte, kick étouffé |
| `ambiance_glovebox.wav` | 8–12 s | habitacle intime, léger souffle électrique, cassette |

## 2. TRANSITIONS (entrée dans une scène) — courts

| fichier | durée | intention |
|---|---|---|
| `porte_cathedrale.wav` | 0.6–1.2 s | grande porte / souffle de réverb qui s'ouvre |
| `porte_barque.wav` | 0.5–1 s | pas sur le ponton, plouf léger |
| `porte_taverne.wav` | 0.5–1 s | porte de bar + cloche |
| `porte_laride.wav` | 0.5–1 s | porte de club, la basse jaillit une seconde |
| `porte_pmu.wav` | 0.5–1 s | porte vitrée + clochette PMU |
| `porte_glovebox.wav` | 0.4–0.8 s | clapet qui s'ouvre, petit clic |
| ⭐ `ressortir.wav` | 0.4–0.8 s | UN son générique pour tous les retours / Échap (whoosh doux) |

## 3. ONE-SHOTS objets (clic sur un objet) — courts, secs

**PMU**
| fichier | durée | intention |
|---|---|---|
| `zone_pmu_fdj.wav` | 0.4–0.8 s | ticket à gratter (froissement + pièce) |
| `zone_pmu_tele.wav` | 0.3–0.6 s | zap télé / paris sportifs |
| `zone_pmu_ricard.wav` | 0.1–0.3 s | tchin de verre / bouteille |
| `zone_pmu_terminal.wav` | 0.3–0.6 s | bip borne PMU |
| `zone_pmu_sudouest.wav` | 0.4–0.8 s | page de journal |

**Taverne**
| fichier | durée | intention |
|---|---|---|
| `zone_taverne_vins.wav` | 0.4–0.8 s | bouchon / verre de vin |
| `zone_taverne_manger.wav` | 0.4–0.8 s | couverts / assiette |
| `zone_taverne_phone.wav` | 0.3–0.6 s | touches Nokia 3310 |

**Cathédrale**
| fichier | durée | intention |
|---|---|---|
| ⭐ `zone_cathedrale_bougies.wav` | 0.5–1 s | allumette + flamme (pourboire) |
| `zone_cathedrale_pupitre.wav` | 0.4–0.8 s | micro qui s'ouvre / larsen doux |
| ⭐ `zone_cathedrale_confessionnal.wav` | **boucle 8–20 s** | tes vocaux en boucle (D13) — voix chuchotée |
| `zone_cathedrale_vitrail_dark.wav` | 0.5–1 s | verre sombre / cloche inversée |
| `zone_cathedrale_vitrail_ange.wav` | 0.5–1 s | verre lumineux / chœur bref |

**LA RIDE (club)**
| fichier | durée | intention |
|---|---|---|
| `zone_laride_tableau.wav` | 0.3–0.6 s | craie / carte cocktails |
| `zone_laride_photobooth.wav` | 0.5–1 s | flash + moteur pellicule |
| `zone_laride_vestiaire.wav` | 0.4–0.8 s | cintres / tissu |
| `zone_laride_toilettes.wav` | 0.4–0.8 s | porte de chiottes / néon |
| ⭐ `zone_laride_djbooth.wav` | 0.5–1 s | vinyle qui s'arme / CDJ cue |

**Glovebox**
| fichier | durée | intention |
|---|---|---|
| `zone_glovebox_phone.wav` | 0.3–0.6 s | Nokia (peut = taverne_phone) |
| `zone_glovebox_flyer.wav` | 0.3–0.6 s | papier glacé qui glisse |

## 4. UNIVERS (vitraux → changement de dimension) — boucles ⭐

| fichier | durée | intention |
|---|---|---|
| ⭐ `univers_dark.wav` | 12–20 s | psyché catholique sombre, drone démoniaque, cloches graves |
| ⭐ `univers_ange.wav` | 12–20 s | même univers en angélique, chœur lumineux, nappe haute |

## 5. PERSO (barque) — ⭐

| fichier | durée | intention |
|---|---|---|
| `roll_myrtille.wav` | 0.5–1.5 s | elle roule un joint (papier/briquet) |
| `roll_stick.wav` | 0.5–1.5 s | idem, variation |
| `blow.wav` | 0.6–1.2 s | souffle de fumée |

---

## Exception de chemin (⚠️ PAS dans sons/)

| fichier | emplacement exact | durée | intention |
|---|---|---|---|
| ⭐ `barque_ciel.wav` | `public/media/nightdrive/barque_ciel.wav` | boucle 12–20 s | la lanterne → ciel étoilé : nappe planante |

---

## Ordre conseillé (impact max d'abord)
1. Les 6 **ambiances** ⭐ (c'est ce qui installe le monde).
2. `ressortir.wav` + les `porte_*` (navigation qui respire).
3. `univers_dark` / `univers_ange` (effet whaou des vitraux).
4. One-shots ⭐ (djbooth, bougies, confessionnal, terminal…).
5. Le reste des one-shots (ou je les synthétise).

Tu exportes dans `sons/` avec le nom exact → dis-moi « c'est déposé », je vérifie format + branchement scène par scène.
