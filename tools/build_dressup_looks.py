#!/usr/bin/env python3
# Découpe PRÉCISE des LOOKS COMPLETS via SegFormer (ATR, 18 classes) en ONNX local.
# Modèle : models/model.onnx (Xenova/segformer_b2_clothes). Classes ATR :
#  0 fond · 1 chapeau · 2 cheveux · 3 lunettes · 4 haut · 5 jupe · 6 pantalon
#  7 robe · 8 ceinture · 9 chaussure-G · 10 chaussure-D · 11 visage
#  12 jambe-G · 13 jambe-D · 14 bras-G · 15 bras-D · 16 sac · 17 écharpe
# Chaque calque suit sa vraie classe → pantalon = QUE le pantalon, chaussures
# séparées, etc. Le corps (peau) vient de la base en sous-vêtement.
import glob, re, os, numpy as np, onnxruntime as ort, cv2
from PIL import Image

ROOT  = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIR   = os.path.join(ROOT, 'public/media/nightdrive/perso/dressup')
RAW   = os.path.join(ROOT, 'archives/perso_dressup_sources/looks_raw')
MODEL = os.path.join(ROOT, 'models/model.onnx')
MEAN, STD = np.array([0.485,0.456,0.406]), np.array([0.229,0.224,0.225])
# haut inclut les BRAS (14,15) → manches complètes jusqu'aux mains (sinon l'IA
# coupe l'avant-bras en classe « bras » et tronque les manches).
CLS = {'haut': [4,7,17,14,15], 'bas': [6,5], 'pieds': [9,10], 'coiffe': [1]}
# LIGNES D'ANCRAGE (fraction hauteur) — la découpe « au ciseau » normalise les
# pièces pour que TOUTE combinaison matche : tous les pantalons finissent à la
# CHEVILLE (YA) → ils ne couvrent jamais une chaussure ; toute chaussure est sous
# YA → pantalon + chaussure se rejoignent toujours. Le haut recouvre la taille (YW).
YW, YA = 0.46, 0.88
MINAREA = 0.0006
MIN_SHOE = 0.010          # sous ce seuil la chaussure est trop cachée → exclue
MIN_HAT  = 0.004          # sous ce seuil pas de couvre-chef
MIN_PANT = 0.045          # sous ce seuil le pantalon est trop caché (look manteau) → exclu

_sess = ort.InferenceSession(MODEL, providers=['CPUExecutionProvider'])
_inp  = _sess.get_inputs()[0].name

def seg_labels(path):
    im = Image.open(path).convert('RGB').resize((512, 512))
    a = ((np.array(im)/255.0 - MEAN)/STD).transpose(2,0,1)[None].astype(np.float32)
    return _sess.run(None, {_inp: a})[0][0].argmax(0).astype(np.uint8)   # (128,128) basse déf

def keep_blobs(m, minf=MINAREA):
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros_like(m); mn = minf*m.shape[0]*m.shape[1]
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] > mn: keep[lab==i] = 255
    return keep

def fill_holes(m):
    h, w = m.shape; ff = m.copy()
    cv2.floodFill(ff, np.zeros((h+2, w+2), np.uint8), (0,0), 255)
    return cv2.bitwise_or(m, cv2.bitwise_not(ff))

def solidify_hips(m):
    """Remplit plein le HAUT du pantalon (hanches/entrejambe) → plus de trou au
    caleçon. Chaque rangée de la bande haute est remplie entre les bords du pantalon.
    Les jambes (plus bas) restent séparées."""
    H = m.shape[0]; y0, y1 = int(0.46*H), int(0.62*H)
    for y in range(y0, y1):
        xs = np.where(m[y] > 0)[0]
        if len(xs): m[y, xs.min():xs.max()+1] = 255
    return m

OUTLINE_W, OUTLINE_COL = 3, (10, 10, 12, 255)
def add_outline(img):
    """Trait noir stylisé autour du calque = objet découpé assumé (cache les bords)."""
    a = np.array(img.convert('RGBA'))
    m = (a[:,:,3] > 30).astype(np.uint8)*255
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9,9)))
    m = cv2.medianBlur(m, 7)                                     # contour lissé
    m = (m > 127).astype(np.uint8)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2*OUTLINE_W+1, 2*OUTLINE_W+1))
    ring = (cv2.dilate(m, k) > 0) & (m == 0)
    o = a.copy(); o[ring] = OUTLINE_COL
    return Image.fromarray(o, 'RGBA')

def layer(path, lab, classes, W, H, clip=None, solid=False):
    # masque basse-déf → upscale LISSÉ + seuil → TRAIT NET (pas de grain de bloc)
    b  = (np.isin(lab, classes).astype(np.uint8))*255                       # 128x128
    up = cv2.resize(b, (W, H), interpolation=cv2.INTER_CUBIC).astype(np.float32)
    up = cv2.GaussianBlur(up, (0, 0), 9)                                    # LISSE le contour → cols/bords NETS
    m  = (up > 127).astype(np.uint8)*255
    m  = fill_holes(keep_blobs(m))                                         # ferme les trous internes
    kb = int(0.012*W) | 1                                                  # comble les petits manques (doux)
    m  = cv2.morphologyEx(m, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kb, kb)))
    m  = fill_holes(m)                                                     # (garde les vraies concavités : entrejambe, bras)
    m  = cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))  # RONGE le liseré clair du fond (halo)
    m  = keep_blobs(m)
    if solid:
        m = solidify_hips(m)
    if clip is not None:                                                    # ciseau : lignes d'ancrage nettes
        y0, y1 = clip
        if y0 > 0: m[:y0] = 0
        if y1 < H: m[y1:] = 0
    rgba = np.array(Image.open(path).resize((W, H)).convert('RGBA'))
    rgba[:,:,3] = np.minimum(rgba[:,:,3], m)
    return Image.fromarray(rgba, 'RGBA'), (m>0).sum()/(W*H), m     # contour propre, SANS trait noir

def main():
    W, H = Image.open(os.path.join(DIR, 'base_h.webp')).size
    files = {int(re.search(r'\((\d+)\)', f).group(1)): f
             for f in glob.glob(os.path.join(RAW, 'ChatGPT Image*.png'))}
    shoes, hats, coats = [], [], []
    START = int(os.environ.get('START', 1)); END = int(os.environ.get('END', 9999))
    for n in sorted(files):
        if not (START <= n <= END):                               # traitement par plage (écrase sur place)
            continue
        p = files[n]; lab = seg_labels(p)
        ya = int(YA*H)
        img, _, mh = layer(p, lab, CLS['haut'], W, H)                              # haut : naturel
        img.save(os.path.join(DIR, f'haut_look{n}.webp'), 'WEBP', quality=85, method=4)
        # MANTEAU LONG ? le haut couvre le centre des jambes → pantalon occulté, on l'exclut
        legs = mh[int(0.64*H):int(0.82*H), int(0.36*W):int(0.64*W)]
        is_coat = (legs > 0).mean() > 0.40
        img, frac, _ = layer(p, lab, CLS['bas'], W, H, clip=(int(YW*H), ya), solid=True)  # pantalon : ciseau + hanches pleines
        if frac >= MIN_PANT and not is_coat:
            img.save(os.path.join(DIR, f'bas_look{n}.webp'), 'WEBP', quality=85, method=4)
        else:
            coats.append(n); print(f'  pantalon {n} exclu ({"manteau" if is_coat else f"{frac*100:.1f}%"})')
        img, frac, _ = layer(p, lab, CLS['pieds'], W, H, clip=(ya - int(0.03*H), H))  # chaussure : sous la cheville
        if frac >= MIN_SHOE:
            img.save(os.path.join(DIR, f'pieds_look{n}.webp'), 'WEBP', quality=85, method=4); shoes.append(n)
        img, frac, _ = layer(p, lab, CLS['coiffe'], W, H)
        if frac >= MIN_HAT:
            img.save(os.path.join(DIR, f'coiffe_look{n}.webp'), 'WEBP', quality=85, method=4); hats.append(n)
        print('look', n, 'OK')
    print('CHAUSSURES (cette passe):', shoes)
    print('COIFFES (cette passe):', hats)
    allsh = sorted(int(re.search(r'(\d+)', f).group(1)) for f in os.listdir(DIR) if f.startswith('pieds_look'))
    allht = sorted(int(re.search(r'(\d+)', f).group(1)) for f in os.listdir(DIR) if f.startswith('coiffe_look'))
    allpt = sorted(int(re.search(r'(\d+)', f).group(1)) for f in os.listdir(DIR) if f.startswith('bas_look'))
    print('PANTALONS EXCLUS (cette passe):', coats)
    print('TOUS PANTALONS:', allpt)
    print('TOUTES CHAUSSURES:', allsh)
    print('TOUTES COIFFES:', allht)

if __name__ == '__main__':
    main()
