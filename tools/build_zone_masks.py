# DÉTOURAGE AU PIXEL — génère un masque alpha par zone cliquable.
#
# Pour chaque zone du registre (src/os/nightdrive/scenes.js), on découpe le
# diff off/on RÉEL de la paire d'images : le masque est blanc là où la
# lumière change vraiment, noir ailleurs. La surbrillance épouse la forme
# exacte de l'objet — plus jamais un rectangle.
#
# Usage :  python3 tools/build_zone_masks.py        (depuis la racine du dépôt)
# Sortie :  public/media/nightdrive/scenes/lights/<scene>_<zone>.png
#           = SPRITE RGBA : le crop de la version on, alpha = le masque.
#           Le navigateur affiche ce PNG tel quel (aucun mask CSS, aucun
#           risque de rendu carré) — ce que montre l'aperçu est ce qui rend.
# Après génération : ajouter/laisser  lum: L('scene_zone')  dans scenes.js
# (le moteur retombe sur le crop + fondu générique si une zone n'a pas de sprite).
#
# À relancer à chaque nouvelle scène ou zone (ou nouvelle version d'images).

import json
import os
import subprocess
import sys

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

# OpenCV (optionnel) : matte par silhouette (mode CONTOUR). Sans lui, ces zones
# retombent sur la recette stricte — l'outil tourne quand même.
try:
    import cv2
    _HAS_CV2 = True
except Exception:
    _HAS_CV2 = False

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(RACINE, 'public')
OUT = os.path.join(PUB, 'media', 'nightdrive', 'scenes', 'lights')

# le registre est la seule vérité : on le lit via node (contrat D3)
scenes = json.loads(
    subprocess.check_output(
        ['node', '--input-type=module', '-e',
         "import(process.argv[1]).then(m => console.log(JSON.stringify(m.SCENES)))",
         os.path.join(RACINE, 'src', 'os', 'nightdrive', 'scenes.js')],
        text=True,
    )
)

os.makedirs(OUT, exist_ok=True)
faits, sans_paire = [], []

# scènes en recette douce (halo d'ambiance conservé) — opt-in, une scène
# n'y entre qu'après validation de Vincent. Par zone : (lo, hi) du cœur.
# · défaut '*' (0.30, 0.62) : cœur large — l'objet on RECOUVRE sa version off
#   (les paires IA ne sont pas alignées au pixel : un cœur trop fin laisse
#   transparaître le off → dédoublement) ;
# · resserré là où une nappe de lumière déborde de l'objet (pupitre).
FONDU_DOUX = {
    'cathedrale': {'*': (0.30, 0.62), 'pupitre': (0.55, 0.82)},
}

# ---- TRICHE ASSUMÉE (demande Vincent 2026-07-04) ---------------------------
# Les paires off/on IA ne sont pas alignées au pixel : pour les objets où le
# détail compte (texte, verre, flammes), la lumière est fabriquée À LA MAIN —
# formes dessinées en coordonnées relatives à la zone, vérifiées sur crops.

def _arche(cw, ch, x0, x1, ya, ye, yb, feather):
    """Masque d'arc gothique plein (pointe en haut), bords fondus."""
    xc, hw = (x0 + x1) / 2, (x1 - x0) / 2
    L, R = [], []
    for i in range(25):
        t = i / 24
        y = ya + (ye - ya) * t
        w = hw * (t ** 0.55)
        L.append(((xc - w) * cw, y * ch))
        R.append(((xc + w) * cw, y * ch))
    m = Image.new('L', (cw, ch), 0)
    ImageDraw.Draw(m).polygon(L + [(x0 * cw, yb * ch), (x1 * cw, yb * ch)] + R[::-1], fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(feather)), float) / 255.0


def _rect(cw, ch, x0, y0, x1, y1, feather):
    m = Image.new('L', (cw, ch), 0)
    ImageDraw.Draw(m).rectangle([x0 * cw, y0 * ch, x1 * cw, y1 * ch], fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(feather)), float) / 255.0


def _blur_a(a, r):
    return np.asarray(Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'), 'L')
                      .filter(ImageFilter.GaussianBlur(r)), float) / 255.0


def triche_vitrail(x0, x1, ya, ye, yb):
    """Seul le VERRE s'allume (swap complet : les dessins off/on diffèrent),
    plus une retombée de lumière discrète qui émane de la forme du verre."""
    def f(off_c, on_c):
        cw, ch = on_c.size
        verre = _arche(cw, ch, x0, x1, ya, ye, yb, feather=max(3, cw // 60))
        halo = _blur_a(verre, max(6, cw // 7)) * 0.35
        return np.asarray(on_c, float), np.maximum(verre, halo)
    return f


def triche_confessionnal(off_c, on_c):
    """Construit depuis l'image OFF ré-éclairée (le panneau et la porte ne
    sont pas au même endroit dans la version on → zéro dédoublement) :
    seuls le TEXTE « Là pour vous parler » et l'INTÉRIEUR de l'entrée
    s'illuminent, plus une lueur qui déborde à peine du panneau."""
    cw, ch = off_c.size
    o = np.asarray(off_c, float)
    panneau = _rect(cw, ch, 0.09, 0.225, 0.52, 0.365, feather=3)
    entree = _arche(cw, ch, 0.13, 0.50, 0.40, 0.60, 1.0, feather=4)
    lueur = _blur_a(panneau, max(6, cw // 8))
    # ré-éclairage chaud : le panneau s'embrase, l'intérieur s'éveille à peine
    warm = np.array([1.0, 0.88, 0.70])
    k = 1.7 * panneau + 0.3 * entree + 0.35 * lueur
    rgb = o * (1.0 + k[..., None] * warm[None, None, :])
    # la bougie au fond de l'entrée jette sa lumière — concentrée, pas un voile
    yy, xx = np.mgrid[0:ch, 0:cw]
    g = np.exp(-(((xx / cw - 0.44) * cw) ** 2 + ((yy / ch - 0.85) * ch) ** 2)
               / (2 * (0.13 * ch) ** 2))
    rgb += np.array([255, 180, 95])[None, None, :] * (g * entree * 0.5)[..., None]
    a = np.maximum.reduce([panneau, entree * 0.8, lueur * 0.45])
    return rgb, a


def triche_bougies(off_c, on_c):
    """Flammes et cires seulement (clé de luminance sur la version on),
    plus la lueur qu'elles jettent autour d'elles."""
    o = np.asarray(on_c, float)
    lum = (0.299 * o[..., 0] + 0.587 * o[..., 1] + 0.114 * o[..., 2]) / 255.0
    p = max(0.2, float(np.percentile(lum, 99)))
    # clé resserrée : flammes et cires seulement — le mur éclairé derrière
    # retombe dans le halo radial (sinon : pan lumineux coupé au bord de boîte)
    core = np.clip((lum / p - 0.50) / 0.30, 0.0, 1.0)
    core = _blur_a(core, 2)
    halo = _blur_a(core, max(6, on_c.width // 8)) * 0.45
    return o, np.maximum(core, halo)


def triche_pizza(off_c, on_c):
    """La pizza est RONDE (demande Vincent) : masque elliptique épousant le
    disque, jamais la boîte carrée — même quand toute la boîte s'éclaire."""
    o = np.asarray(on_c, float)
    cw, ch = on_c.size
    cx, cy, rx, ry = 0.50, 0.47, 0.45, 0.47  # ellipse (perspective de la boîte)
    yy, xx = np.mgrid[0:ch, 0:cw]
    dist = ((xx / cw - cx) / rx) ** 2 + ((yy / ch - cy) / ry) ** 2
    core = np.clip((1.0 - dist) / 0.30, 0.0, 1.0)
    core = _blur_a(core, max(2, cw // 36))
    return o, core


TRICHE = {
    ('cathedrale', 'vitrail_dark'): triche_vitrail(0.30, 0.97, 0.085, 0.32, 1.0),
    ('cathedrale', 'vitrail_ange'): triche_vitrail(0.12, 0.91, 0.075, 0.30, 0.985),
    ('cathedrale', 'confessionnal'): triche_confessionnal,
    ('cathedrale', 'bougies'): triche_bougies,
}

# ---- MODE CONTOUR (OpenCV) : matte par SILHOUETTE — colle au vrai contour de
# l'objet (bien mieux que le seuil sur le diff). Otsu sur (diff + luminance +
# saturation) → plus grande composante connexe → nettoyage morphologique.
# Opt-in par zone ; la valeur = force du halo de lumière autour de l'objet
# (0 = contour net ; >0 = l'objet rayonne un peu, ex. la lanterne).
# Pour les objets posés/distincts. PAS pour les enseignes/vitraux (le diff
# épouse déjà la lumière) ni la pizza (masque circulaire dédié, triche_pizza).
# Mode CONTOUR (GrabCut) dispo pour opt-in futur, mais PAR DÉFAUT VIDE : la
# recette stricte par diff (comme toutes les autres scènes) donne le dosage le
# plus cohérent. Ne réactiver un objet en contour qu'après validation visuelle.
CONTOUR = {}


def _grabcut_alpha(crop, rect):
    """Segmentation GrabCut : l'objet dans son rectangle vs le fond. Bien plus
    robuste que le seuil pour un objet posé (ne flood pas sur une source lumineuse)."""
    img = np.asarray(crop)[:, :, ::-1].copy()  # RGB → BGR pour cv2
    hh, ww = img.shape[:2]
    mask = np.zeros((hh, ww), np.uint8)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, rect, bgd, fgd, 6, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, k, iterations=2)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 1:  # on garde la plus grande composante (l'objet)
        best = 1 + int(np.argmax([st[i, cv2.CC_STAT_AREA] for i in range(1, n)]))
        m = np.where(lab == best, 255, 0).astype(np.uint8)
    return cv2.GaussianBlur(m, (0, 0), 1.2).astype(np.float32) / 255.0


def contour_sprite(off, on, z, W, H, halo):
    """Sprite RGBA taillé à la silhouette (GrabCut), à la taille exacte de la zone.
    On segmente sur un crop marginé (contexte pour le fond) puis on recadre pile
    sur la boîte (alignement 1:1 avec le registre)."""
    m = 0.25  # marge de contexte autour de la zone
    bx0 = int(max(0, z['x'] - z['w'] * m) / 100 * W); by0 = int(max(0, z['y'] - z['h'] * m) / 100 * H)
    bx1 = int(min(100, z['x'] + z['w'] * (1 + m)) / 100 * W)
    by1 = int(min(100, z['y'] + z['h'] * (1 + m)) / 100 * H)
    onc = on.crop((bx0, by0, bx1, by1))
    rx0 = int(z['x'] / 100 * W) - bx0
    ry0 = int(z['y'] / 100 * H) - by0
    rect = (max(1, rx0), max(1, ry0), max(2, int(z['w'] / 100 * W)), max(2, int(z['h'] / 100 * H)))
    a = _grabcut_alpha(onc, rect)
    if halo > 0:  # la lumière que l'objet jette autour de lui (lanterne)
        hh = np.asarray(Image.fromarray((a * 255).astype('uint8'), 'L')
                        .filter(ImageFilter.GaussianBlur(max(6, onc.width // 7))), float) / 255.0
        a = np.maximum(a, hh * halo)
    zx0 = int(z['x'] / 100 * W); zy0 = int(z['y'] / 100 * H)
    zx1 = int((z['x'] + z['w']) / 100 * W); zy1 = int((z['y'] + z['h']) / 100 * H)
    ox, oy = zx0 - bx0, zy0 - by0
    ab = a[oy:oy + (zy1 - zy0), ox:ox + (zx1 - zx0)]
    onb = np.asarray(onc)[oy:oy + (zy1 - zy0), ox:ox + (zx1 - zx0)]
    out = Image.fromarray(onb, 'RGB').convert('RGBA')
    out.putalpha(Image.fromarray(np.clip(ab * 255, 0, 255).astype('uint8'), 'L'))
    return out

for sid, sc in scenes.items():
    off_p = os.path.join(PUB, sc['off'].lstrip('/'))
    on_p = os.path.join(PUB, sc['on'].lstrip('/'))
    if not (os.path.exists(off_p) and os.path.exists(on_p)):
        sans_paire.append(sid)
        continue
    off = Image.open(off_p).convert('RGB')
    on = Image.open(on_p).convert('RGB')
    W, H = off.size
    # le diff, à peine adouci : la matière première du détourage
    diff = ImageChops.difference(off, on).convert('L').filter(
        ImageFilter.GaussianBlur(max(1, W // 600))
    )
    for z in sc.get('zones', []):
        # MODE CONTOUR (silhouette OpenCV) : prioritaire, contour serré
        if _HAS_CV2 and (sid, z['id']) in CONTOUR:
            sp = contour_sprite(off, on, z, W, H, CONTOUR[(sid, z['id'])])
            sp.save(os.path.join(OUT, f"{sid}_{z['id']}.png"))
            faits.append(f"{sid}_{z['id']}.png")
            continue
        bx, by = int(z['x'] / 100 * W), int(z['y'] / 100 * H)
        bw, bh = max(1, int(z['w'] / 100 * W)), max(1, int(z['h'] / 100 * H))
        box = (bx, by, min(bx + bw, W), min(by + bh, H))
        crop = diff.crop(box)
        cw, ch = crop.size
        d = np.asarray(crop, dtype=float)
        # normalisation par le presque-max de la zone (robuste aux étincelles)
        p99 = max(1.0, float(np.percentile(d, 99)))
        v = d / p99
        src = None  # source RGB du sprite (défaut : crop de la version on)
        if (sid, z['id']) in TRICHE:
            rgb, ma = TRICHE[(sid, z['id'])](off.crop(box), on.crop(box))
            src = Image.fromarray(np.clip(rgb, 0, 255).astype('uint8'), 'RGB')
            # bords de boîte : même mort douce que la recette douce
            fx, fy = max(3, int(cw * 0.10)), max(3, int(ch * 0.10))
            gy = np.minimum.reduce([np.ones(ch), np.arange(ch) / fy, (ch - 1 - np.arange(ch)) / fy])
            gx = np.minimum.reduce([np.ones(cw), np.arange(cw) / fx, (cw - 1 - np.arange(cw)) / fx])
            ma = ma * (np.clip(np.minimum(gy[:, None], gx[None, :]), 0.0, 1.0) ** 1.5)
            ma[ma < 0.02] = 0.0
            m = Image.fromarray((ma * 255).astype('uint8'), 'L')
        elif sid in FONDU_DOUX:
            # RECETTE DOUCE v2 (2026-07-04, cathédrale seule) : le halo ÉMANE
            # de l'objet — cœur strict, puis ce cœur rayonne par flou large.
            # (La v1 prenait le halo dans le diff brut : quand toute la boîte
            # s'éclaircit — lumière globale de la cathédrale — le halo
            # remplissait la boîte et on voyait le rectangle.)
            lo, hi = FONDU_DOUX[sid].get(z['id'], FONDU_DOUX[sid]['*'])
            core = np.clip((v - lo) / (hi - lo), 0.0, 1.0)
            core[d < 12] = 0.0  # plancher : le voile global off→on ne compte pas
            mc = Image.fromarray((core * 255).astype('uint8'), 'L')
            mc = mc.filter(ImageFilter.MaxFilter(3)).filter(
                ImageFilter.GaussianBlur(max(1, cw // 140))
            )
            # la lumière que l'objet jette autour de LUI (jamais de la boîte)
            halo = mc.filter(ImageFilter.GaussianBlur(max(6, cw // 10)))
            ma = np.maximum(
                np.asarray(mc, dtype=float) / 255.0,
                (np.asarray(halo, dtype=float) / 255.0) * 0.55,
            )
            # bords de boîte : mort sur 10 %, rampe adoucie
            fx, fy = max(3, int(cw * 0.10)), max(3, int(ch * 0.10))
            gy = np.minimum.reduce([np.ones(ch), np.arange(ch) / fy, (ch - 1 - np.arange(ch)) / fy])
            gx = np.minimum.reduce([np.ones(cw), np.arange(cw) / fx, (cw - 1 - np.arange(cw)) / fx])
            r = np.clip(np.minimum(gy[:, None], gx[None, :]), 0.0, 1.0) ** 1.5
            ma = ma * r
            ma[ma < 0.02] = 0.0
            m = Image.fromarray((ma * 255).astype('uint8'), 'L')
        else:
            # RECETTE STRICTE d'origine (It22, VALIDÉE sur pmu/taverne/laride/
            # barque/quai — ne pas changer sans validation de Vincent) :
            # l'objet, pas son halo d'ambiance.
            a = np.clip((v - 0.32) / (0.62 - 0.32), 0.0, 1.0)
            a[d < 12] = 0.0  # plancher absolu
            m = Image.fromarray((a * 255).astype('uint8'), 'L')
            # micro-dilatation + adoucissement léger : contour organique, pas sec
            m = m.filter(ImageFilter.MaxFilter(3)).filter(
                ImageFilter.GaussianBlur(max(1, cw // 140))
            )
            # bords de boîte à zéro sur 5 %, brume résiduelle coupée net
            fx, fy = max(2, int(cw * 0.05)), max(2, int(ch * 0.05))
            ma = np.asarray(m, dtype=float) / 255.0
            gy = np.minimum.reduce([np.ones(ch), np.arange(ch) / fy, (ch - 1 - np.arange(ch)) / fy])
            gx = np.minimum.reduce([np.ones(cw), np.arange(cw) / fx, (cw - 1 - np.arange(cw)) / fx])
            r = np.clip(np.minimum(gy[:, None], gx[None, :]), 0.0, 1.0)
            ma = ma * r
            ma[ma < 18 / 255] = 0.0
            m = Image.fromarray((ma * 255).astype('uint8'), 'L')
        # LE SPRITE : la lumière déjà détourée — source RGB + alpha = masque
        lum = (src if src is not None else on.crop(box)).convert('RGBA')
        lum.putalpha(m)
        nom = f"{sid}_{z['id']}.png"
        lum.save(os.path.join(OUT, nom))
        faits.append(nom)

print(f"{len(faits)} sprites → public/media/nightdrive/scenes/lights/")
for n in faits:
    print('  ·', n)
if sans_paire:
    print("sans paire d'images (ignorés) :", ', '.join(sans_paire))
