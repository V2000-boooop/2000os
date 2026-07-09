#!/usr/bin/env python3
"""
Découpe des planches du PRÊTRE (cathédrale) — fond vert → frames webp détourées.

Usage :
  python3 tools/build_pretre_frames.py

Entrée  : archives/pretre_sources/*.png  (planches fond vert — HORS public/,
          les sources ne partent jamais en ligne)
Sortie  : public/media/nightdrive/scenes/perso/pretre_*.webp
          + sources/pretre/_contact_sheet.png (validation visuelle, QC 015)

Règles :
- chroma key sur la couleur des coins (vert), avec despill des bords ;
- frames découpées par projection (lignes/colonnes 100 % vertes = séparateurs) ;
- ordre row-major (rangée du haut G→D, puis rangée du bas) ;
- TOUTES les frames sont posées sur un CANVAS COMMUN (max l×h), ancrées
  pieds/centre → les swaps de pose restent alignés dans la scène ;
- mapping des noms dans MAP ci-dessous (idle = refus rangée 1 frame 1, acté).
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "archives/pretre_sources"
OUT = ROOT / "public/media/nightdrive/scenes/perso"

# nom de planche (sans extension, insensible à la casse) → préfixe de sortie
# + affectations spéciales {(row, col): nom_final}
MAP = {
    "planche_marche_a":    {"prefix": "pretre_marche_a"},
    "planche_marche_b":    {"prefix": "pretre_marche_b"},
    "planche_refus":       {"prefix": "pretre_refus",
                            "special": {(0, 0): "pretre_idle"},
                            "rows": {1: "pretre_disparition"}},
    "planche_disparition": {"prefix": "pretre_refus",   # alias si nommée ainsi
                            "special": {(0, 0): "pretre_idle"},
                            "rows": {1: "pretre_disparition"}},
    "planche_poses":       {"prefix": "pretre_pose", "dilate": 3},  # planche dense
    "demandepretre":       {"prefix": "pretre_demande"},  # anim quand il quémande la pièce
}

ALPHA_SOFT = 60.0   # distance couleur → alpha (douceur du détourage)
MIN_FRAME = 40      # px : ignorer les régions plus petites (poussière)
WEBP_Q = 88


def chroma_key(im: Image.Image) -> np.ndarray:
    """RGBA float array, fond vert → alpha 0, avec despill."""
    a = np.asarray(im.convert("RGB"), dtype=np.float32)
    h, w, _ = a.shape
    corners = np.stack([a[2, 2], a[2, w - 3], a[h - 3, 2], a[h - 3, w - 3]])
    bg = np.median(corners, axis=0)
    dist = np.linalg.norm(a - bg, axis=2)
    alpha = np.clip((dist - 18.0) / ALPHA_SOFT, 0.0, 1.0) * 255.0
    # teinte : tout pixel à VERT dominant est du fond (pâtés/lueurs verts inclus)
    green_dom = (a[..., 1] > a[..., 0] * 1.18) & (a[..., 1] > a[..., 2] * 1.18)
    alpha = np.where(green_dom, 0.0, alpha)
    # despill : sur les pixels semi-transparents, brider le vert
    edge = (alpha > 0) & (alpha < 255)
    g_cap = np.maximum(a[..., 0], a[..., 2])
    a[..., 1] = np.where(edge, np.minimum(a[..., 1], g_cap), a[..., 1])
    return np.dstack([a, alpha]).astype(np.uint8)


def slice_planche(rgba: np.ndarray, dilate: int = 12) -> list[list[np.ndarray]]:
    """→ [rangée][frame] (tight bbox), ordre row-major.
    Composantes connexes après dilatation (raccorde la fumée d'une même frame)."""
    mask = rgba[..., 3] > 16
    fat = ndimage.binary_dilation(mask, structure=np.ones((3, 3)), iterations=dilate)
    labels, n = ndimage.label(fat)
    boxes = []
    for sl in ndimage.find_objects(labels):
        r0, r1, c0, c1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        sm = mask[r0:r1, c0:c1]
        if sm.sum() < MIN_FRAME * MIN_FRAME:
            continue  # poussière
        ys, xs = np.nonzero(sm)
        boxes.append((r0 + ys.min(), r0 + ys.max() + 1,
                      c0 + xs.min(), c0 + xs.max() + 1))
    # regrouper en rangées par recouvrement vertical (ordre lecture)
    boxes.sort(key=lambda b: b[0])
    rows, current = [], []
    for b in boxes:
        if current and b[0] >= np.median([(x[0] + x[1]) / 2 for x in current]):
            rows.append(sorted(current, key=lambda x: x[2]))
            current = []
        current.append(b)
    if current:
        rows.append(sorted(current, key=lambda x: x[2]))
    return [[rgba[r0:r1, c0:c1] for r0, r1, c0, c1 in row] for row in rows]


def main() -> int:
    planches = sorted(p for p in SRC.glob("*.png") if not p.name.startswith("_"))
    if not planches:
        print(f"Aucune planche dans {SRC}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)

    named = []  # (nom_final, frame_rgba)
    for p in planches:
        cfg = MAP.get(p.stem.lower())
        if cfg is None:
            print(f"! {p.name} : pas dans MAP, préfixe générique")
            cfg = {"prefix": f"pretre_{p.stem.lower()}"}
        grid = slice_planche(chroma_key(Image.open(p)), cfg.get("dilate", 12))
        n = 0
        counters = {}
        for ri, row in enumerate(grid):
            for ci, fr in enumerate(row):
                name = cfg.get("special", {}).get((ri, ci))
                if name is None:
                    base = cfg.get("rows", {}).get(ri, cfg["prefix"])
                    counters[base] = counters.get(base, 0) + 1
                    name = f"{base}_{counters[base]}"
                named.append((name, fr))
                n += 1
        print(f"{p.name}: {n} frames ({[len(r) for r in grid]})")

    # canvas commun ancré pieds/centre — staging local puis copie (mount lent)
    import shutil, tempfile, time
    stage = Path(tempfile.mkdtemp(prefix="pretre_"))
    W = max(f.shape[1] for _, f in named)
    H = max(f.shape[0] for _, f in named)
    t = time.time()
    thumbs = []
    for name, fr in named:
        canvas = np.zeros((H, W, 4), dtype=np.uint8)
        h, w = fr.shape[:2]
        x = (W - w) // 2
        canvas[H - h:H, x:x + w] = fr
        im = Image.fromarray(canvas)
        im.save(stage / f"{name}.webp", quality=WEBP_Q, method=4)
        thumbs.append((name, im))
    print(f"encodage : {time.time() - t:.1f}s (canvas {W}×{H}, ancre pieds)")

    # contact sheet de validation
    th = 220
    tw = max(1, int(W * th / H))
    cols = 6
    rows_n = -(-len(thumbs) // cols)
    sheet = Image.new("RGB", (cols * tw, rows_n * (th + 18)), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    for i, (name, im) in enumerate(thumbs):
        sm = im.resize((tw, th), Image.LANCZOS)
        x, y = (i % cols) * tw, (i // cols) * (th + 18)
        sheet.paste(sm, (x, y), sm)
        d.text((x + 4, y + th + 2), name, fill=(230, 230, 230))
    sheet.save(stage / "_contact_sheet.png")

    t = time.time()
    for f in stage.glob("*.webp"):
        shutil.copy2(f, OUT / f.name)
    shutil.copy2(stage / "_contact_sheet.png", SRC / "_contact_sheet.png")
    print(f"copie mount : {time.time() - t:.1f}s → {len(named)} webp dans {OUT.relative_to(ROOT)}")
    print(f"→ contact sheet : {SRC.relative_to(ROOT)}/_contact_sheet.png")
    return 0


if __name__ == "__main__":
    sys.exit(main())
