#!/usr/bin/env python3
"""
Détoure des CALQUES fond vert (pantin articulé) et les RECALE sur l'idle.

Les calques (tête/buste/bras) sont dessinés dans leur propre cadre (fond vert),
souvent à une autre échelle/position que l'idle. Ce script :
  1) détoure le vert (despill + plus grande composante + érosion anti-liseré) ;
  2) RECALE automatiquement sur l'idle (template matching du visage) → échelle f
     + décalage (bx,by) tels que idle = calque*f + b ;
  3) réécrit chaque calque DANS LE CADRE DE L'IDLE (mêmes W×H) → ils se superposent
     au pixel à l'idle et entre eux (object-fit:contain, même boîte scenes.js) ;
  4) fabrique le calque `jambes` manquant depuis l'idle (sous l'ourlet du sweat) ;
  5) imprime les pivots (épaule/nuque) en % du cadre idle, pour le CSS du rig.

Usage : python3 tools/build_rig_layers.py
Entrée : archives/rig_sources/{buste,tete,brasdroit,brasgauche}.png (fond vert)
         + public/…/perso/myrtille_idle.webp (référence de cadre + jambes)
Sortie : public/…/perso/myrtille_rig_{jambes,buste,brasd,brasg,tete}.webp
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image
import cv2

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "archives/rig_sources"
P = ROOT / "public/media/nightdrive/scenes/perso"
IDLE = P / "myrtille_idle.webp"

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
    alpha = 1.0 - np.clip((greenness - T0) / SOFT, 0.0, 1.0)
    spill = (greenness > 0) & (alpha > 0)
    g2 = np.where(spill, np.minimum(g, np.maximum(r, b)), g)
    rgb = np.dstack([r, g2, b])
    m = (alpha > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    if n > 1:
        big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        m = (lab == big).astype(np.uint8)
    m = cv2.erode(m, np.ones((3, 3), np.uint8), iterations=1)
    alpha = alpha * m
    return Image.fromarray(np.dstack([rgb, alpha * 255.0]).clip(0, 255).astype(np.uint8))


def register(idle_rgb, tete_rgba):
    """idle = calque*f + (bx,by), trouvé en matchant un patch plein du visage."""
    IH, IW = idle_rgb.shape[:2]
    a = np.asarray(tete_rgba)
    ys, xs = np.nonzero(a[..., 3] > 150)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    hw, hh = x1 - x0, y1 - y0
    px0, px1 = x0 + int(hw * 0.32), x0 + int(hw * 0.72)   # coeur du visage (opaque)
    py0, py1 = y0 + int(hh * 0.28), y0 + int(hh * 0.62)
    patch = a[py0:py1, px0:px1, :3]
    best = None
    for f in np.linspace(0.30, 0.65, 36):
        tw, th = int(patch.shape[1] * f), int(patch.shape[0] * f)
        if tw < 24 or th < 24 or tw >= IW or th >= IH:
            continue
        r = cv2.matchTemplate(idle_rgb, cv2.resize(patch, (tw, th)), cv2.TM_CCOEFF_NORMED)
        _, mx, _, ml = cv2.minMaxLoc(r)
        if best is None or mx > best[0]:
            best = (mx, f, ml)
    score, f, loc = best
    bx, by = loc[0] - px0 * f, loc[1] - py0 * f
    print(f"recalage sur l'idle : score {score:.3f} · échelle {f:.3f} · offset ({bx:.0f},{by:.0f})")
    return f, bx, by


def bake(layer, f, bx, by, size):
    """calque natif → recalé dans le cadre de l'idle (size)."""
    W, H = layer.size
    sc = layer.resize((max(1, round(W * f)), max(1, round(H * f))), Image.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.paste(sc, (round(bx), round(by)), sc)
    return canvas


def main():
    miss = [s for s, _, _ in MAP if not (SRC / s).exists()]
    if miss:
        print(f"Calques absents de {SRC} : {miss}", file=sys.stderr); return 1
    if not IDLE.exists():
        print(f"idle absent : {IDLE}", file=sys.stderr); return 1
    idle_im = Image.open(IDLE).convert("RGBA")
    IW, IH = idle_im.size
    idle_rgb = np.asarray(idle_im.convert("RGB"))

    keyed = {out: (key_green(Image.open(SRC / src)), pivot) for src, out, pivot in MAP}
    f, bx, by = register(idle_rgb, keyed["myrtille_rig_tete"][0])

    # hem = bas du buste recalé → où raccorder les jambes
    ba = np.asarray(keyed["myrtille_rig_buste"][0])[..., 3]
    buste_y1 = np.nonzero(ba > 40)[0].max()
    hem = buste_y1 * f + by
    ramp = np.clip((np.arange(IH) - (hem - 30)) / 90.0, 0, 1)
    ja = np.asarray(idle_im).astype(np.float32).copy()
    ja[..., 3] *= ramp[:, None]
    Image.fromarray(ja.clip(0, 255).astype(np.uint8)).save(P / "myrtille_rig_jambes.webp", quality=Q, method=6)
    print(f"myrtille_rig_jambes   (idle sous l'ourlet, hem≈{hem:.0f})")

    for out, (im, pivot) in keyed.items():
        W, H = im.size
        na = np.asarray(im)[..., 3]
        ys, xs = np.nonzero(na > 40)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        baked = bake(im, f, bx, by, (IW, IH))
        baked.save(P / f"{out}.webp", quality=Q, method=6)
        # pivot natif → cadre idle → %
        if pivot == "neck":
            pxn, pyn = (x0 + x1) / 2, y1
        elif pivot == "shoulder":
            pxn, pyn = (x1 if (x0 + x1) / 2 < W / 2 else x0), y0
        else:
            pxn = pyn = None
        if pxn is not None:
            px = (pxn * f + bx) / IW * 100
            py = (pyn * f + by) / IH * 100
            print(f"{out:22s} pivot ≈ {px:.1f}% {py:.1f}%")
        else:
            print(f"{out:22s} (statique)")
    print(f"\ncadre = idle {IW}×{IH} — tous les calques recalés dedans, superposables au pixel.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
