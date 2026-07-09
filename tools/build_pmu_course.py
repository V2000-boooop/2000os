#!/usr/bin/env python3
# TIERCÉ PMU — normalisation des calques (It36).
# Problème réglé : les 4 états de tribune et les frames des coureurs ont des
# canvas de tailles différentes → sauts/tremblements à l'écran.
# Recette :
#   - tribune (pmu_stage_*) : crop au contenu, canvas commun, ancrage BAS-centre
#     (la base = panneaux pub, stable) → le swap d'état ne bouge plus.
#   - coureurs (<key>_{run,win,lose}_*) : crop au contenu, canvas commun PAR
#     PERSO, ancrage CENTRE-centre (le corps reste stable, les jambes animent).
# Les originaux sont copiés dans archives/pmu_course_sources/normalises_avant/
# avant toute réécriture. Relancer après chaque dépôt de nouvelles frames.
import os, shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public/media/nightdrive/pmu/course')
BAK = os.path.join(ROOT, 'archives/pmu_course_sources/normalises_avant')
os.makedirs(BAK, exist_ok=True)

def load(name):
    p = os.path.join(SRC, name)
    return Image.open(p).convert('RGBA') if os.path.exists(p) else None

def backup(name):
    d = os.path.join(BAK, name)
    if not os.path.exists(d):
        shutil.copy2(os.path.join(SRC, name), d)

def save(name, im):
    im.save(os.path.join(SRC, name), 'WEBP', quality=95, method=4)

def normalize(names, anchor):
    """Crop chaque image à son contenu, colle sur un canvas commun (max w×h)."""
    imgs = {}
    for n in names:
        im = load(n)
        if im is None: continue
        bbox = im.getbbox()
        imgs[n] = im.crop(bbox) if bbox else im
    if not imgs: return
    W = max(im.width for im in imgs.values())
    H = max(im.height for im in imgs.values())
    for n, im in imgs.items():
        cv = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        x = (W - im.width) // 2
        y = (H - im.height) if anchor == 'bottom' else (H - im.height) // 2
        cv.paste(im, (x, y))
        backup(n); save(n, cv)
        print(f'  {n}: -> {W}x{H} ({anchor})')

print('tribune (états) :')
normalize([f'pmu_stage_{s}.webp' for s in ('idle_1', 'idle_2', 'hype_1', 'sad_1')], 'bottom')

RUNNERS = ['zidane', 'rose', 'jockey', 'chirac', 'jeanne']
for k in RUNNERS:
    print(f'{k} :')
    normalize([f'{k}_run_{n}.webp' for n in (1, 2, 3, 4)] + [f'{k}_win_1.webp', f'{k}_lose_1.webp'], 'center')

print('OK — relancer ce script après tout nouveau dépôt de frames.')
