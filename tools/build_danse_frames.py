#!/usr/bin/env python3
"""
Découpe des planches DANSE de la barque (Stick + Myrtille) — fond uni → frames
webp détourées, prêtes pour les poses `leve` (se lève, une fois) et `radio`
(danse en boucle) branchées sur la boombox.

Usage :
  python3 tools/build_danse_frames.py

Entrée  : archives/danse_sources/*.png (planches fond uni sombre — HORS public/)
Sortie  : public/media/nightdrive/scenes/perso/{myrtille,stick}_{leve,radio}_N.webp
          + archives/danse_sources/_contact_sheet.png (validation visuelle, QC 015)

Règles :
- découpe par GRILLE FIXE (déclarée dans MAP — les planches n'ont pas de
  séparateurs fiables), bbox resserrée dans chaque case ;
- détourage par distance à la couleur de fond (médiane du cadre) + rejet des
  « ombres du fond » (même teinte, plus sombre) + plus grande composante
  connexe + bouchage des trous intérieurs (survêt noir sur fond noir) ;
- par perso : canvas COMMUN leve+radio, ancre pieds/centre → swaps alignés ;
- imprime les mesures utiles au calage du poseBox dans scenes.js.
"""

import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "archives/danse_sources"
OUT = ROOT / "public/media/nightdrive/scenes/perso"

# planche → grille (cols, rows) + mapping row-major → noms de sortie
# None = case ignorée (doublon d'une pose existante)
MAP = {
    "myrtilleselevetdanse": {
        "grid": (4, 2),
        "names": ["myrtille_leve_1", "myrtille_leve_2", "myrtille_leve_3", "myrtille_leve_4",
                  "myrtille_radio_1", "myrtille_radio_2", "myrtille_radio_3", "myrtille_radio_4"],
        "perso": "myrtille",
    },
    "raverseleve": {
        "grid": (3, 2),
        "names": ["stick_leve_1", "stick_leve_2", "stick_leve_3",
                  "stick_leve_4", "stick_leve_5", "stick_leve_6"],
        "perso": "stick",
    },
    "raverlevedanse": {
        "grid": (4, 2),
        "names": ["stick_radio_1", "stick_radio_2", "stick_radio_3", "stick_radio_4",
                  "stick_radio_5", "stick_radio_6", "stick_radio_7", "stick_radio_8"],
        "perso": "stick",
    },
}

T0, SOFT = 14.0, 46.0   # distance couleur → alpha (seuil dur, douceur)
WEBP_Q = 88


def key_cell(cell: np.ndarray) -> np.ndarray:
    """Cellule RGB → RGBA détourée (fond = médiane du cadre de LA cellule)."""
    a = cell.astype(np.float32)
    h, w, _ = a.shape
    ring = np.concatenate([a[2, :], a[h - 3, :], a[:, 2], a[:, w - 3]])
    bg = np.median(ring, axis=0)
    dist = np.linalg.norm(a - bg, axis=2)
    alpha = np.clip((dist - T0) / SOFT, 0.0, 1.0)
    # « ombre du fond » : même direction de couleur que le fond, juste plus sombre
    # (ombre portée au sol) → fond. On compare la teinte normalisée.
    bgn = bg / max(1.0, np.linalg.norm(bg))
    lum = a @ np.array([0.299, 0.587, 0.114])
    bglum = float(bg @ np.array([0.299, 0.587, 0.114]))
    proj = a @ bgn  # composante le long du fond
    resid = np.linalg.norm(a - proj[..., None] * bgn[None, None, :], axis=2)
    shadow = (resid < 16.0) & (lum < bglum) & (lum > bglum * 0.25)
    alpha = np.where(shadow, 0.0, alpha)
    m8 = (alpha > 0.35).astype(np.uint8) * 255
    # plus grande composante connexe = le perso (vire poussières et bouts de grille)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m8, 8)
    if n > 1:
        big = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
        keep = (lab == big).astype(np.uint8) * 255
    else:
        keep = m8
    # bouchage des trous intérieurs (survêt noir ≈ fond noir → troué sinon)
    ff = keep.copy()
    cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 255)
    filled = cv2.bitwise_or(keep, cv2.bitwise_not(ff))
    inner = (filled > 0) & (keep == 0)          # zones récupérées : opaques
    alpha = np.where(inner, 1.0, alpha)
    alpha = np.where(filled == 0, 0.0, alpha)   # hors perso : transparent net
    out = np.dstack([a, alpha * 255.0]).astype(np.uint8)
    return out


def main() -> int:
    planches = {p.stem.lower(): p for p in SRC.glob("*.png") if not p.name.startswith("_")}
    missing = [k for k in MAP if k not in planches]
    if missing:
        print(f"Planches absentes de {SRC} : {missing}", file=sys.stderr)
        return 1
    OUT.mkdir(parents=True, exist_ok=True)

    # Idle de référence par perso : les frames de danse sont posées sur le MÊME
    # canvas (mêmes W×H) que l'idle → object-fit:contain les cale à l'identique,
    # la box de scenes.js marche sans changement, zéro déformation (contrat projet).
    IDLE = {"myrtille": OUT / "myrtille_idle.webp", "stick": OUT / "raver_roll_1.webp"}
    # ancre verticale du centre de masse dans le canvas (0=haut, 1=bas).
    # radio (danse) = un peu au-dessus du centre : la tête a de l'air, le corps groove.
    ANCHOR = {"radio": 0.46, "leve": 0.52}
    FILL = 0.95  # la frame la plus grande d'un groupe remplit ~95 % du canvas

    # (perso, pose) -> list[(name, rgba tight)]
    groups = {}
    for key, cfg in MAP.items():
        im = np.asarray(Image.open(planches[key]).convert("RGB"))
        H, W, _ = im.shape
        cols, rows = cfg["grid"]
        idx = 0
        for r in range(rows):
            for c in range(cols):
                name = cfg["names"][idx]; idx += 1
                if name is None:
                    continue
                y0, y1 = round(r * H / rows), round((r + 1) * H / rows)
                x0, x1 = round(c * W / cols), round((c + 1) * W / cols)
                rgba = key_cell(im[y0 + 3:y1 - 3, x0 + 3:x1 - 3])
                ys, xs = np.nonzero(rgba[..., 3] > 16)
                if not len(ys):
                    print(f"! {name} : case vide ?!")
                    continue
                tight = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
                pose = name.split("_")[1]
                groups.setdefault((cfg["perso"], pose), []).append((name, tight))
        print(f"{planches[key].name} : {idx} cases lues")

    thumbs = []
    for (perso, pose), frames in groups.items():
        idle_p = IDLE.get(perso)
        if idle_p and idle_p.exists():
            CW, CH = Image.open(idle_p).size            # canvas = celui de l'idle
        else:
            CW = max(f.shape[1] for _, f in frames)
            CH = max(f.shape[0] for _, f in frames)
            print(f"  (idle {perso} absent → canvas ad-hoc {CW}×{CH})")
        # échelle UNIFORME du groupe : préserve la variation naturelle des frames
        # (le « papier collé qui bouge ») ; la plus grande remplit FILL du canvas.
        hmax = max(f.shape[0] for _, f in frames)
        wmax = max(f.shape[1] for _, f in frames)
        s = min(FILL * CH / hmax, FILL * CW / wmax)
        ay = ANCHOR.get(pose, 0.5)
        print(f"\n[{perso}/{pose}] canvas {CW}×{CH} · échelle groupe ×{s:.3f} · ancre y={ay}")
        for name, fr in frames:
            h, w = fr.shape[:2]
            nw, nh = max(1, round(w * s)), max(1, round(h * s))
            sc = cv2.resize(fr, (nw, nh), interpolation=cv2.INTER_AREA)
            a = sc[..., 3].astype(float)
            ys, xs = np.nonzero(a > 40)
            cx, cy = (xs.mean(), ys.mean()) if len(xs) else (nw / 2, nh / 2)
            ox = int(round(CW * 0.5 - cx))
            oy = int(round(CH * ay - cy))
            ox = max(min(ox, CW - nw), 0) if nw <= CW else (CW - nw) // 2
            oy = max(min(oy, CH - nh), 0) if nh <= CH else (CH - nh) // 2
            canvas = np.zeros((CH, CW, 4), dtype=np.uint8)
            canvas[oy:oy + nh, ox:ox + nw] = sc
            im = Image.fromarray(canvas)
            im.save(OUT / f"{name}.webp", quality=WEBP_Q, method=4)
            thumbs.append((name, im))
            print(f"  {name}: {nw}×{nh} @ ({ox},{oy})")

    # contact sheet de validation (fond damier pour juger l'alpha)
    th = 200
    cols = 6
    rows_n = -(-len(thumbs) // cols)
    tws = [max(1, int(im.width * th / im.height)) for _, im in thumbs]
    tw = max(tws)
    sheet = Image.new("RGB", (cols * tw, rows_n * (th + 18)), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    for i, (name, im) in enumerate(thumbs):
        sm = im.resize((max(1, int(im.width * th / im.height)), th), Image.LANCZOS)
        x, y = (i % cols) * tw, (i // cols) * (th + 18)
        for cy in range(0, th, 20):  # damier local
            for cx in range(0, sm.width, 20):
                if (cx // 20 + cy // 20) % 2:
                    d.rectangle([x + cx, y + cy, x + cx + 19, y + cy + 19], fill=(38, 38, 44))
        sheet.paste(sm, (x, y), sm)
        d.text((x + 4, y + th + 2), name, fill=(230, 230, 230))
    sheet.save(SRC / "_contact_sheet.png")
    print(f"\n→ contact sheet : {(SRC / '_contact_sheet.png').relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
