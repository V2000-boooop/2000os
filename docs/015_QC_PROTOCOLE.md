# 015 — PROTOCOLE QC (anti-boucle)

> Règles pour ne PLUS tourner en rond (serveur périmé, fichier corrompu, « c'est bon »
> non vérifié). Claude suit ce protocole à CHAQUE itération avant de dire que ça marche.
> À relire au démarrage d'une session avec `000_PROJECT_MEMORY.md`.

## Règle mère

**Rien n'est « OK » tant que ce n'est pas VÉRIFIÉ objectivement.** « Ça devrait marcher »
est interdit. Une feature n'est annoncée faite que si : assets valides + build vert +
**testée en vrai** (headless) + 0 erreur console.

## 1. Assets — valider l'intégrité APRÈS tout traitement

Toute image/webp/son généré ou converti est **relu et vérifié** avant d'être utilisé
(un timeout de conversion peut laisser un fichier à moitié écrit → corrompu, ex. vécu :
`myrtille_roll_5.webp`).

```python
from PIL import Image
im = Image.open(f); im.load()   # lève une erreur si corrompu → on refait
```
- Conversion par lot : vérifier CHAQUE fichier après écriture. Un seul KO = on reconvertit.
- Écrire d'abord dans `/tmp`, vérifier, PUIS `cp` en place (le mount tronque à la copie).

## 2. Serveur frais — sinon on voit l'ancien code

Le piège n°1 : Vite/le navigateur sert l'**ancien bundle** → on croit que le correctif ne
marche pas. Réglé à la source : le lanceur **`Lancer Vincent 2000 OS.command`** est
auto-frais → à chaque double-clic il **tue le serveur du port 4321**, **vide `node_modules/.vite`**
et lance `npm run dev -- --force`.

- Consigne à Vincent après un changement de code : **fermer la fenêtre noire, re-double-cliquer**
  le lanceur (pas juste rafraîchir). Attendre ~10 s.
- Un simple Cmd+Shift+R ne suffit pas si le serveur n'a pas recompilé.

## 3. Test LIVE avant de dire « c'est bon » (harnais headless)

Pour toute feature interactive/animée, Claude **pilote le vrai site** en headless et
**vérifie objectivement** (pas juste l'attribut `src` : aussi que l'image **se décode**,
`naturalWidth > 0`, et **0 erreur console**). Script réutilisable : `tools/smoke_test.mjs`.

**Monter le harnais dans le sandbox** (à refaire chaque session, ~1 min) :
```bash
cd /tmp && npm i playwright-core
npx --yes playwright install chromium          # télécharge le binaire (ok même si "host requirements" échoue)
# 1 seule lib manque (libXdamage.so.1) → stub :
mkdir -p /tmp/libs && printf 'int XDamageQueryExtension(void*a,void*b,void*c){return 0;}\nunsigned long XDamageCreate(void*a,unsigned long b,int c){return 0;}\nvoid XDamageDestroy(void*a,unsigned long b){}\nvoid XDamageSubtract(void*a,unsigned long b,unsigned long c,unsigned long d){}\n' > /tmp/xd.c
gcc -shared -fPIC -o /tmp/libs/libXdamage.so.1 /tmp/xd.c
# build + serveur statique + test :
cd /tmp/v2000 && npm run build && (cd dist && python3 -m http.server 8099 &) 
LD_LIBRARY_PATH=/tmp/libs node /path/to/tools/smoke_test.mjs
```
Le test entre en Night Drive (~7,5 s pour l'état `drive`), va à la barque, déclenche
roule/souffle, et imprime les séquences d'images + décodage + erreurs. Vert = on livre.

## 4. Nommage & dépôts (Higgsfield / ChatGPT → dossier)

- Les dépôts arrivent parfois avec un **nom encodé** (`perso:xxx.png`, ou `... .png` avec
  espaces) : Claude les **renomme proprement** à réception (`cp "perso:xxx.png" xxx.png`).
- **Garder les sources** (fond vert, PNG d'origine) tant que la scène n'est pas bouclée —
  ne pas supprimer trop vite (on en a eu besoin après coup).
- La synchro de Vincent peut **effacer** les fichiers dérivés de Claude dans `perso/` quand
  il redépose → si un asset disparaît à l'écran, Claude re-détoure depuis les sources vertes.

## 5. Checklist de fin d'itération (obligatoire)

1. assets touchés → **relus/validés** (intègres, bonne taille) ;
2. `npm run build` **vert** ;
3. feature interactive → **testée headless** (séquences + décodage + console) ;
4. si nouveaux fichiers → **noms propres**, sources gardées ;
5. je dis « c'est bon » **seulement** après 1→4, et je rappelle à Vincent de **relancer** le
   lanceur (auto-frais) pour voir la dernière version.
