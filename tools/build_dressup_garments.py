#!/usr/bin/env python3
# NOUVELLE APPROCHE (propre) : chaque vêtement est généré SEUL sur la base alien
# (un vêtement par image). Donc zéro occlusion → SegFormer classe et découpe
# chaque pièce nettement. Auto-classification : la classe-vêtement dominante de
# l'image donne la catégorie (haut/bas/chaussures/coiffe).
# Entrée  : perso/dressup/ChatGPT Image*.png  (triés par date)
# Sortie  : perso/dressup/{haut,bas,pieds,coiffe}_<i>.webp  (i = index de l'image)
import glob, os, re, numpy as np, onnxruntime as ort, cv2
from PIL import Image

ROOT  = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIR   = os.path.join(ROOT, 'public/media/nightdrive/perso/dressup')
SRC   = os.path.join(ROOT, 'archives/perso_dressup_sources/garments_src')   # sources stables 1.png..N.png
MODEL = os.path.join(ROOT, 'models/model.onnx')
MEAN, STD = np.array([0.485,0.456,0.406]), np.array([0.229,0.224,0.225])
YW, YA = 0.46, 0.88
MINAREA = 0.0006
# classes ATR
UP, UP_EXT, PA, SH, HA = [4,7,17], [4,7,17,14,15], [5,6,12,13], [9,10], [1]  # bas inclut les jambes (12,13) → shorts avec leurs jambes
_sess = ort.InferenceSession(MODEL, providers=['CPUExecutionProvider'])
_inp  = _sess.get_inputs()[0].name

def seg(path):
    im = Image.open(path).convert('RGB').resize((512,512))
    a = ((np.array(im)/255.0 - MEAN)/STD).transpose(2,0,1)[None].astype(np.float32)
    return _sess.run(None, {_inp: a})[0][0].argmax(0).astype(np.uint8)          # 128x128

# ---- NORMALISATION : recale chaque source (échelle+position) sur une référence
# commune (épaules + pieds + centre) pour que TOUS les calques matchent. ----
_BW, _BH = Image.open(os.path.join(DIR, 'base_h.webp')).size
def _keymask(pil):
    a = np.array(pil.convert('RGB').resize((_BW, _BH))).astype(int); c = a[5,5]
    m = (np.abs(a-c).sum(2) > 55).astype(np.uint8)*255
    return cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5,5)))
def _measure(m):
    ys, xs = np.where(m > 0); feet = int(ys.max())
    w = (m > 0).sum(1); mw = int(w.max())
    sh = int(next((y for y in range(len(w)) if w[y] > 0.5*mw), int(ys.min())))   # ligne d'épaules (ignore la tête/chapeau)
    return sh, feet, int((xs.min()+xs.max())//2)
_REF_SH, _REF_FT, _REF_CX = _measure(_keymask(
    Image.open(os.path.join(ROOT, 'archives/perso_dressup_sources/base_underwear_source.png'))))
def normalize(pil):
    src = np.array(pil.convert('RGB').resize((_BW, _BH)))
    sh, ft, cx = _measure(_keymask(pil))
    s = (_REF_FT - _REF_SH) / max(1, (ft - sh)); s = min(max(s, 0.85), 1.18)     # échelle bornée
    M = np.float32([[s, 0, _REF_CX - cx*s], [0, s, _REF_SH - sh*s]])
    grey = tuple(int(v) for v in src[5,5])
    return Image.fromarray(cv2.warpAffine(src, M, (_BW, _BH), borderValue=grey))

def keep_blobs(m):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros_like(m); mn = MINAREA*m.shape[0]*m.shape[1]
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > mn: keep[lab==i] = 255
    return keep

def fill_holes(m):
    h, w = m.shape; ff = m.copy()
    cv2.floodFill(ff, np.zeros((h+2, w+2), np.uint8), (0,0), 255)
    return cv2.bitwise_or(m, cv2.bitwise_not(ff))

def solidify_hips(m):
    H = m.shape[0]; y0, y1 = int(0.46*H), int(0.62*H)
    for y in range(y0, y1):
        xs = np.where(m[y] > 0)[0]
        if len(xs): m[y, xs.min():xs.max()+1] = 255
    return m

def clean_layer(path, lab, classes, W, H, clip=None, solid=False):
    b  = (np.isin(lab, classes).astype(np.uint8))*255
    up = cv2.resize(b, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    up = cv2.GaussianBlur(up, (0, 0), 9)                                     # contour lisse → NET
    m  = (up > 127).astype(np.uint8)*255
    m  = fill_holes(keep_blobs(m))
    kb = int(0.012*W) | 1
    m  = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kb, kb)))
    m  = fill_holes(m)
    m  = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))  # ronge le halo
    m  = keep_blobs(m)
    if solid: m = solidify_hips(m)
    if clip is not None:
        y0, y1 = clip
        if y0 > 0: m[:y0] = 0
        if y1 < H: m[y1:] = 0
    rgba = np.array(Image.open(path).resize((W, H)).convert('RGBA'))
    rgba[:,:,3] = np.minimum(rgba[:,:,3], m)
    corner = rgba[5, 5, :3].astype(int)                                     # couleur du fond gris
    dbg = np.abs(rgba[:,:,:3].astype(int) - corner).sum(2)
    rgba[dbg < 42, 3] = 0                                                   # TUE le gris résiduel (halo, entre les mains, buste)
    return Image.fromarray(rgba, 'RGBA')

# Catégories FIXES par plage d'index (classées à l'œil sur la planche-contact).
RANGES = [('haut', 1, 10), ('bas', 11, 19), ('pieds', 20, 28), ('coiffe', 29, 36)]
def cat_of(i):
    for name, a, b in RANGES:
        if a <= i <= b: return name
    return None

def place_hat(img, cxref=None, bottom_frac=0.075):
    """Force chaque coiffe à une position standard sur la tête (centrée, bord bas
    au front) — le placement varie trop d'une génération à l'autre."""
    W, H = img.size; cxref = cxref if cxref is not None else W//2
    a = np.array(img)[:,:,3]; ys, xs = np.where(a > 20)
    if len(xs) == 0: return img
    cx = (int(xs.min())+int(xs.max()))//2; bottom = int(ys.max()); top = int(ys.min())
    dy = int(bottom_frac*H) - bottom
    if top + dy < 0: dy = -top                 # ne JAMAIS couper le haut du chapeau
    c = Image.new('RGBA', (W, H), (0,0,0,0))
    c.paste(img, (cxref-cx, dy), img)
    return c

def main():
    W, H = Image.open(os.path.join(DIR, 'base_h.webp')).size
    files = {int(os.path.splitext(os.path.basename(f))[0]): f for f in glob.glob(os.path.join(SRC, '*.png'))}
    START = int(os.environ.get('START', 1)); END = int(os.environ.get('END', 9999))
    cats = {'haut': [], 'bas': [], 'pieds': [], 'coiffe': []}
    ya = int(YA*H)
    for i in sorted(files):
        f = files[i]
        cat = cat_of(i)
        if cat is None: continue
        cats[cat].append(i)
        if not (START <= i <= END): continue
        nf = normalize(Image.open(f)); tmp = os.path.join(DIR, '_tmpnorm.png'); nf.save(tmp)  # recale sur la référence
        lab = seg(tmp)
        if cat == 'haut':   img = clean_layer(tmp, lab, UP_EXT, W, H)
        elif cat == 'bas':  img = clean_layer(tmp, lab, PA, W, H, clip=(int(YW*H), ya), solid=True)
        elif cat == 'pieds':img = clean_layer(tmp, lab, SH, W, H, clip=(ya-int(0.03*H), H))
        else:               img = place_hat(clean_layer(tmp, lab, HA, W, H))    # coiffe : placement standard sur la tête
        img.save(os.path.join(DIR, f'{cat}_{i}.webp'), 'WEBP', quality=85, method=4)
        print(f'#{i} -> {cat}')
    for c, lst in cats.items(): print(c.upper(), sorted(lst))

if __name__ == '__main__':
    main()
