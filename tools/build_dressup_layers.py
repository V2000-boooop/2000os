#!/usr/bin/env python3
# Construit les calques du jeu d'habillage (vestiaire LA RIDE) depuis les images
# brutes de Vincent : le PERSO ENTIER avec UNE pièce changée, fond gris uni.
#
# Méthode DÉTOURAGE PAR DIFFÉRENCE (v2) : chaque variante ne change qu'une pièce
# vs la base → on isole la pièce là où l'image DIFFÈRE de la base. On garde la
# VRAIE forme du vêtement (taille réelle du pantalon, silhouette réelle), pas une
# bande rectangulaire. Une région-prior par slot vire juste le bruit hors zone.
# -> côté génération, Vincent n'a plus qu'à faire le perso entier, rien à isoler.
import os, numpy as np
from PIL import Image, ImageFilter

ROOT   = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SCENES = os.path.join(ROOT, 'public/media/nightdrive/scenes')
ARCH   = os.path.join(ROOT, 'archives/perso_dressup_sources')
OUT    = os.path.join(ROOT, 'public/media/nightdrive/perso/dressup')
RAW_DIRS = [SCENES, ARCH]
os.makedirs(OUT, exist_ok=True)

# Région-prior large par slot (fraction de hauteur) — juste pour retirer le bruit
# de diff hors de la zone du vêtement, PAS pour couper la forme.
REG = {'coiffe': (0.00, 0.24), 'haut': (0.10, 0.62), 'bas': (0.40, 0.91), 'pieds': (0.84, 1.00)}
DIFF_T = 55   # seuil de différence couleur vs base

def key_grey_arr(im):
    a = np.array(im.convert('RGBA')); c = a[5,5,:3].astype(int)
    d = np.abs(a[:,:,:3].astype(int) - c).sum(2)
    a[:,:,3] = np.where(d > 40, 255, 0).astype(np.uint8)
    return a

def isolate(base_a, var_path, slot):
    v = key_grey_arr(Image.open(var_path))
    H, W = v.shape[:2]
    diff = np.abs(base_a[:,:,:3].astype(int) - v[:,:,:3].astype(int)).sum(2)
    m = ((diff > DIFF_T) & (v[:,:,3] > 20)).astype(np.uint8) * 255
    y0, y1 = int(REG[slot][0]*H), int(REG[slot][1]*H)
    reg = np.zeros((H, W), np.uint8); reg[y0:y1] = 1; m = m * reg
    # ferme les trous (Max puis Min), adoucit le bord
    mi = Image.fromarray(m).filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(2))
    out = v.copy(); out[:,:,3] = np.minimum(out[:,:,3], np.array(mi))
    return Image.fromarray(out, 'RGBA')

def find_raw():
    found = {}
    for d in reversed(RAW_DIRS):
        if not os.path.isdir(d): continue
        for f in os.listdir(d):
            if f.startswith('raw_') and f.endswith('.png'):
                found[f[4:-4]] = os.path.join(d, f)
    return found

def main():
    base_src = next((p for p in [os.path.join(SCENES,'perso/base_h.png'),
                                 os.path.join(ARCH,'base_h_source.png')] if os.path.exists(p)), None)
    if not base_src:
        print('!! base source introuvable'); return
    base_a = key_grey_arr(Image.open(base_src))
    # BASE = tête + mains seulement (le reste est fourni par les fringues → zéro
    # transparence du corps derrière un vêtement ouvert/résille). Demande Vincent.
    Hb = base_a.shape[0]; keep = np.zeros(base_a.shape[:2], bool)
    keep[0:int(0.22*Hb)] = True            # tête + nuque
    keep[int(0.44*Hb):int(0.60*Hb)] = True # avant-bras + mains
    base_a[~keep, 3] = 0
    Image.fromarray(base_a,'RGBA').save(os.path.join(OUT,'base_h.webp'),'WEBP',quality=85,method=6)
    print('OK base_h.webp  (base:', os.path.relpath(base_src, ROOT), ')')
    for stem, path in sorted(find_raw().items()):
        slot = stem.split('_',1)[0]
        if slot not in REG: print('  ! slot inconnu:', stem); continue
        isolate(base_a, path, slot).save(os.path.join(OUT, f'{stem}.webp'),'WEBP',quality=85,method=6)
        print('OK', f'{stem}.webp')

if __name__ == '__main__':
    main()
