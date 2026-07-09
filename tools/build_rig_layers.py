#!/usr/bin/env python3
"""
Détoure des CALQUES fond vert (pantin articulé) → webp transparents alignés.

Les calques d'un perso partagent le MÊME canvas (ex. tête/buste/bras posés à leur
place sur fond vert) → après détourage, ils s'EMPILENT tels quels (inset:0) et
chaque pièce s'anime autour de son pivot (épaule, nuque).

Usage : python3 tools/build_rig_layers.py
Entrée : public/media/nightdrive/scenes/perso/{buste,tete,brasdroit,brasgauche}.png
Sortie : …/perso/myrtille_rig_{buste,tete,brasd,brasg}.webp (canvas conservé)
         + imprime bbox opaque + pivot suggéré (en % du canvas) pour le CSS.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
import cv2

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "archives/rig_sources"                       # PNG fond vert (hors public)
P = ROOT / "public/media/nightdrive/scenes/perso"          # sortie webp
# jambes : découpées de l'idle (les calques ne couvrent que le haut du corps)
IDLE = P / "myrtille_idle.webp"
CANVAS = (887, 1774)                                        # cadre commun des calques
LEG_Y0, LEG_Y1 = 1330, 1420                                # fondu de l'ourlet → bas

# source png (fond vert) -> nom de sortie ; 'pivot' = où est l'articulation
# ('shoulder' = haut+bord intérieur du bras ; 'neck' = bas de la tête)
MAP = [
    ("buste.png",      "myrtille_rig_buste", None),
    ("tete.png",       "myrtille_rig_tete",  "neck"),
    ("brasdroit.png",  "myrtille_rig_brasd", "shoulder"),
    ("brasgauche.png", "myrtille_rig_brasg", "shoulder"),
]
T0, SOFT, Q = 40.0, 45.0, 90


def key_green(im):
    a = np.asarray(im.convert("RGB")).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    greenness = g - np.maximum(r, b)
    alpha = 1.0 - np.clip((greenness - T0) / SOFT, 0.0, 1.0)  # vert → 0
    # despill : sur les bords, on écrête le vert résiduel (halo)
    spill = (greenness > 0) & (alpha > 0)
    g2 = np.where(spill, np.minimum(g, np.maximum(r, b)), g)
    rgb = np.dstack([r, g2, b])
    # nettoyage : plus grande composante + érosion 1px (mange le liseré vert)
    m = (alpha > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 1:
        big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        m = (lab == big).astype(np.uint8)
    m = cv2.erode(m, np.ones((3, 3), np.uint8), iterations=1)
    alpha = alpha * m
    out = np.dstack([rgb, alpha * 255.0]).clip(0, 255).astype(np.uint8)
    return Image.fromarray(out)


def build_legs():
    """jambes = idle (redim. au cadre commun) sous l'ourlet du sweat, fondu doux."""
    if not IDLE.exists():
        print(f"idle absent ({IDLE}) → pas de calque jambes"); return
    im = Image.open(IDLE).convert("RGBA").resize(CANVAS, Image.LANCZOS)
    a = np.asarray(im).astype(np.float32).copy()
    ramp = np.clip((np.arange(CANVAS[1]) - LEG_Y0) / (LEG_Y1 - LEG_Y0), 0, 1)
    a[..., 3] *= ramp[:, None]
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(P / "myrtille_rig_jambes.webp", quality=Q, method=6)
    print("myrtille_rig_jambes   (depuis l'idle, sous l'ourlet)")


def main():
    miss = [s for s, _, _ in MAP if not (SRC / s).exists()]
    if miss:
        print(f"Calques absents de {SRC} : {miss}", file=sys.stderr); return 1
    build_legs()
    for src, out, pivot in MAP:
        im = key_green(Image.open(SRC / src))
        W, H = im.size
        a = np.asarray(im)[..., 3]
        ys, xs = np.nonzero(a > 40)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        im.save(P / f"{out}.webp", quality=Q, method=6)
        # pivot suggéré en % du canvas
        if pivot == "neck":
            px, py = (x0 + x1) / 2 / W, y1 / H          # bas de la tête (nuque)
        elif pivot == "shoulder":
            # épaule = haut du bras, bord vers le centre du canvas
            inner = x1 if (x0 + x1) / 2 < W / 2 else x0
            px, py = inner / W, y0 / H
        else:
            px, py = 0.5, 1.0
        print(f"{out:22s} bbox x[{x0}-{x1}] y[{y0}-{y1}]  pivot ≈ {px*100:.1f}% {py*100:.1f}%")
    print(f"\ncanvas {W}×{H} (ratio {W/H:.3f}) — tous les calques partagent ce cadre.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
