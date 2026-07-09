# Draw Things — générer des vêtements sur l'alien (setup)

But : générer en local, en série, ton alien portant **UN vêtement à la fois** (même pose, fond gris), pour que je découpe/normalise/branche derrière. Gratuit, offline, sur ton Mac.

---

## 1. Installer
- **App Store → « Draw Things »** (gratuit, éditeur Liu Liu). Ou https://drawthings.ai/downloads
- Ouvre l'app. Tout tourne en local (Apple Silicon), pas d'abonnement, pas de cloud.

## 2. Télécharger les modèles (une fois)
Dans l'app : **icône Modèle (en haut) → Manage Models → Download**.
- **Modèle de base** : `SDXL Base 1.0` (bon équilibre qualité/compat). *(FLUX.1 est plus beau mais plus lent et ControlNet moins mûr — commence SDXL.)*
- **ControlNet** (menu Control → Manage) : télécharge **Depth (SDXL)** et **Canny (SDXL)** — ce sont eux qui **verrouillent la pose et le corps** de ton alien.
- **IP-Adapter** (Control → Manage) : **IP Adapter Plus (SDXL)** — garde le **look** de l'alien (peau bleue) même si le vêtement change.

## 3. La recette « ajouter un vêtement, garder l'alien »
1. **Image de base** : glisse ton `base` alien (le boxer, corps entier, fond gris) dans le canvas → mode **Image-to-Image** activé.
2. **Strength / Denoising** : **0.62** (assez pour créer le vêtement, pas trop pour garder le perso). À ajuster 0.55–0.72.
3. **ControlNet** (Control Tab) : ajoute **Depth**, image = ta base, **weight ~0.6**. → la **pose et le corps restent exacts** même si le vêtement change. (Si le corps dérive, ajoute **Canny** aussi, weight 0.4.)
4. **IP-Adapter** : image = ta base, **weight ~0.4**. → garde la peau bleue / le style.
5. **Taille** : garde le **même ratio que ta base** (portrait, genre 832×1216) pour l'alignement.
6. **Steps 30 · CFG 6–7 · Sampler DPM++ 2M Karras.**

### Prompt (un vêtement par image)
```
full body alien-hybrid raver, translucent blue-violet skin, mullet, pointed ears, standing straight facing camera, feet visible, plain flat grey background, wearing ONLY <LE VÊTEMENT>, the rest of the body bare skin and boxer, same pose, illustrated style, sharp clean edges
```
Négatif :
```
extra limbs, deformed hands, different pose, cropped, multiple people, watermark, text
```
Remplace `<LE VÊTEMENT>` par : `a red Adidas Firebird track jacket, bare legs` / `baggy camo cargo pants, bare torso` / `white Nike Air Force 1, rest of body bare` / `a black beret, rest bare` etc. (torse OU jambes OU pieds OU tête habillés, le reste nu — comme la méthode qui marche).

## 4. Générer en série
- Change juste `<LE VÊTEMENT>` à chaque génération, garde tout le reste (base + ControlNet + IP-Adapter) fixe → toutes les pièces sortent **alignées sur le même corps**.
- **Batch** : mets « Number of images » à 4 pour tester des variantes d'une pièce d'un coup.
- Export : bouton **Export → PNG** (ou glisse hors du canvas).

## 5. Tu me déposes → je fais l'après
Tu déposes les PNG dans le projet → je découpe (SegFormer), normalise, place, branche. **Un vêtement par image**, comme maintenant.

---

**Astuce démarrage** : commence par régénérer 2-3 pièces que tu connais (Firebird, un cargo, une casquette) pour caler le Strength (0.62) et les weights ControlNet. Une fois le réglage bon, tu enchaînes en série.

**Si un réglage coince** (perso qui dérive, vêtement pas net) : dis-moi ce que tu vois, je t'ajuste les valeurs (Strength / weights) — c'est du réglage, pas du hasard.
