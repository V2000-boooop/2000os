# GAME FEEL — recette réutilisable (jeux Vincent 2000)

Réf. de référence pour que **chaque nouveau jeu parte déjà avec une jouabilité exceptionnelle**.
Extrait et éprouvé sur **NIGHT FIGHT** (`src/os/apps/GameApp.svelte`). Copier-coller les briques, ajuster les valeurs.

> Règle d'or : **réactivité + feedback + indulgence**. Un jeu qui « répond bien » = l'input sort toujours, chaque coup se voit/s'entend, et le joueur est pardonné de 2-3 frames d'erreur.

---

## 0. Boucle & base
- `requestAnimationFrame`, `dt` **clampé** : `dt=Math.min(.05,(now-last)/1000)` (évite les sauts physiques si l'onglet lague).
- Buffer interne pixelisé + `image-rendering:pixelated` (DA PS2). Rendu monde→écran via une caméra (cf. §6).
- État par entité créé dans un `mk()` unique (tous les champs initialisés → pas de `undefined` au 1er draw).

---

## 1. Déplacement au sol
- **Marche rapide** (sinon sensation de lenteur, surtout en vue dézoomée) : viser une **traversée d'écran en ~3 s**. Réf NIGHT FIGHT : `SPEEDF≈250`, `SPEEDB≈185` px/s (arrière < avant).
- **Vitesse par perso** = flavor de roster : multiplicateur `WSPD[key]` (agile 1.2 / lourd 0.9).
- **Dash / back-dash** (le geste qui rend vivant) : double-tap ← ou → détecté par timestamp (`nowT - f.tapX < 0.24`). Burst court (`dashT=0.20`, `dashV=±DASH`, DASH≈460), **annulable en saut ou en attaque**. Inclinaison visuelle du corps pendant le dash.

```js
for(const side of ['left','right']) if(K(map[side])&&!prevCodes.has(map[side])){
  if(grounded && f['tap'+side]!=null && nowT-f['tap'+side]<0.24 && !f.atk && (f.dashT||0)<=0){
    const dir=side==='right'?1:-1; f.dashT=0.20; f.dashV=dir*DASH*(dir===f.face?1:0.82); sfx('whoosh');
  }
  f['tap'+side]=nowT;
}
```

---

## 2. Saut (le cœur du feel)
Physique : apex `= JUMP²/(2·|GRAV|)`, temps de vol `= 2·JUMP/|GRAV|`. Réf : `JUMP≈800`, `GRAV≈-1780` → apex ~180 px, ~0,9 s.
- **Trajectoire engagée** (type SF) : la vitesse horizontale `jvx` est figée au décollage selon la direction tenue (neutre/avant/arrière), **non modifiable en l'air**. Permet les cross-up.
- **Saut bufferisé** : l'appui Haut est mémorisé `jbuf=0.12` s → le saut sort même si pressé une frame trop tôt.
- **Coyote time** : `coyote=0.09` s de grâce après avoir quitté un bord → saut encore possible.
- **Fast-fall** : Bas en l'air pendant la descente = gravité renforcée (×2,2). Contrôle vertical, essentiel sur plateformes.

```js
// dans control()
if((f.coyote||0)>0) f.coyote-=dt;
if(K(map.up)&&!prevCodes.has(map.up)) f.jbuf=0.12;
if((f.jbuf||0)>0) f.jbuf-=dt;
if((f.jbuf||0)>0 && !f.atk && (grounded || (f.coyote||0)>0)){
  f.vy=JUMP; f.jvx = dashing? f.dashV*0.75 : (d.fwd?f.face*JVXF:(d.back?-f.face*JVXB:0));
  f.jbuf=0; f.coyote=0; f.dashT=0; f.grounded=false; sfx('jump');
}
f._ff = (!grounded && d.down && f.vy<0); // fast-fall (utilisé dans step)

// dans step() : gravité + coyote au décrochage
const pg=f.grounded, prevY=f.y;
f.vy += GRAV*dt*(f._ff && f.vy<0 ? 2.2 : 1);
f.y  += f.vy*dt;
// ...collision sol/plateforme... puis :
if(!f.grounded && pg && f.vy<=0 && (f.dropT||0)<=0) f.coyote=0.09;
```

---

## 3. Plateformes one-way (soft platform, façon Melee)
- On **atterrit dessus par au-dessus** (en descente), on **traverse par en dessous**, on **redescend en tapant Bas** (verrou `dropT` pour ne pas ré-atterrir aussitôt).
- « Au sol » = **au-dessus du support** (sol OU plateforme) : partout tester `f.y > (f.support||0)+0.5`, **jamais `f.y>0`** (sinon le perso reste bloqué en pose de saut debout sur une plateforme, et les coups sol deviennent aériens).

```js
function groundLevel(f,prevY){ let g=0; if((f.dropT||0)>0) return 0;
  for(const p of (STAGE.plats||[])) if(Math.abs(f.x-p.x)<=p.w+8 && f.vy<=0 && prevY>=p.y-1 && p.y>g) g=p.y;
  return g; }
// drop-through : if(grounded && support>0 && Bas pressé){ f.dropT=0.22; f.y-=3; f.support=0; }
```

---

## 4. Feedback de frappe (« ça claque »)
- **Hitstop** : fige les 2 entités quelques frames à l'impact (`0.04` léger → `0.14` super). LE truc qui donne du poids.
- **Hitstun / blockstun** : la victime est stun un court instant (permet les combos), garde = stun plus court + chip damage.
- **Flash d'impact** : la victime clignote **blanc** ~0,1 s. IMPORTANT : teinter **seulement le sprite** via un canvas hors-écran (`source-atop` sur le buffer), pas sur le canvas principal (sinon on teinte un rectangle du décor).
- **Screen shake** proportionnel aux dégâts + **particules** d'étincelles à l'impact.
- **Dégâts dégressifs en combo** (`scale = max(0.45, 1-(combo-1)*0.11)`) : anti-boucle infinie.

```js
// flash correct (silhouette blanche du sprite uniquement)
if((f.flash||0)>0){ fxc.width=img.width; fxc.height=img.height;
  fxx.clearRect(0,0,img.width,img.height); fxx.globalCompositeOperation='source-over'; fxx.drawImage(img,0,0);
  fxx.globalCompositeOperation='source-atop'; fxx.fillStyle='#fff'; fxx.fillRect(0,0,img.width,img.height);
  fxx.globalCompositeOperation='source-over';
  ctx.globalAlpha=Math.min(0.9,f.flash*8); ctx.drawImage(fxc,-w/2,-dh,w,dh); ctx.globalAlpha=1; }
```

---

## 5. Input & indulgence (leniency)
- **Buffer d'attaque** ~0,16 s : les inputs pressés pendant la recovery ne sont pas perdus, ils sortent dès que possible.
- **Lecture par position physique** `e.code` (AZERTY-safe) + touches **remappables** sauvegardées (`localStorage`).
- Combos de commande par timestamp (ex. P-P-K-K → spéciale).
- Petit **landing recovery** (~0,07 s) : on ne peut pas agir instantanément à l'atterrissage (lisibilité, anti-spam).

---

## 6. Caméra dynamique (Smash-like)
- Rendu **monde→écran** : `screen = (world - cam.c)·cam.z + viewport/2`. Le monde (arène) est **plus grand que le canvas** (marges + ciel), la caméra dézoome/recentre pour **garder les 2 combattants + les plateformes** à l'écran.
- Zoom = `min(BW/besoinLargeur, BH/besoinHauteur)`, **clampé** (ex. 0.44–1.24). Centre = milieu des combattants (biais vers le sol). **Lissage** : `cam.z += (cible-cam.z)*min(1,dt*7)` (idem cx, cy).
- HUD dessiné **hors** transform (espace écran). Fond/plateformes/persos/particules **dans** la transform.
- Découpler **largeur d'arène (monde)** de **largeur canvas (pixels)** : sinon doubler le ring casse tous les clamps.

---

## 7. Animation & lisibilité
- **Frames de marche liées à la DISTANCE parcourue**, pas au temps : `frame = 1 + floor(walkDist/15) % n`. Zéro patinage, la cadence suit la vitesse automatiquement.
- **Rebond/report de poids synchronisés sur la distance** aussi → le cycle paraît lisse même avec peu de frames. (Le vrai plus : générer 5-6 frames de marche au lieu de 3.)
- **Regard visuel ≠ regard combat** : le corps suit le **sens du déplacement** (`vface`), les **coups/portées** visent l'adversaire (`face`). Beaucoup plus vivant qu'un moonwalk.
- Fallback propre : sprite manquant → pose `idle` / rig code, **jamais d'erreur** (règle DA).

---

## 8. Son
- **SFX 100 % WebAudio** (oscillateurs, pas de fichier) : `whoosh`/`hit`/`heavy`/`block`/`jump`/`ko`/`super`. Le nom = le branchement, silence si absent.

---

## 9. Valeurs de référence (NIGHT FIGHT, point de départ)
| Réglage | Valeur |
|---|---|
| Marche avant / arrière | 250 / 185 px/s (× WSPD perso) |
| Dash (vitesse / durée) | 460 px/s / 0,20 s |
| Saut JUMP / GRAV | 800 / −1780 (apex ~180, ~0,9 s) |
| Saut horizontal avant/arrière | 235 / 200 |
| Buffer saut / coyote | 0,12 / 0,09 s |
| Fast-fall (× gravité) | 2,2 |
| Buffer attaque | 0,16 s |
| Landing recovery | 0,07 s |
| Hitstop léger / lourd / super | 0,04 / 0,07 / 0,14 s |
| Flash d'impact | 0,10 s |
| Drop-through (verrou) | 0,22 s |
| Caméra zoom min/max, lissage | 0,44 / 1,24, dt·7 |
| Cadence anim marche | 1 frame / 15 px |

---

## 10. Checklist « avant de livrer un jeu »
- [ ] Traversée d'écran en ~3 s, dash présent et annulable.
- [ ] Saut bufferisé + coyote + fast-fall.
- [ ] « Au sol » testé via support, pas via `y>0`.
- [ ] Hitstop + flash d'impact (silhouette hors-écran) + shake + particules.
- [ ] Buffer d'attaque, touches remappables (localStorage), lecture `e.code`.
- [ ] Caméra dynamique clampée + lissée, HUD hors transform, monde ≠ canvas.
- [ ] Anim liée à la distance, regard visuel vs combat.
- [ ] Fallback silencieux partout (asset manquant = 0 erreur).
- [ ] Vérif : compile Svelte (PAS de build) avant de livrer.
