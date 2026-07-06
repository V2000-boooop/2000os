#!/usr/bin/env python3
# make_props.py — props low-poly GLB raccord DA Vincent 2000 OS (sans Blender).
# Sortie GLB : public/media/3d/  +  apercus PNG : outputs (pour juger vite).
# Rejouer : python3 tools/make_props.py
import numpy as np, trimesh, os
from trimesh.transformations import rotation_matrix as rot
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, '..', 'public', 'media', '3d')
PREV = os.environ.get('PREVIEW_DIR', os.path.join(HERE, '..', '..', '..', 'outputs'))
os.makedirs(OUT, exist_ok=True); os.makedirs(PREV, exist_ok=True)
YUP = rot(-np.pi/2, [1, 0, 0])

# palette DA (RGB)
C = dict(glass=(206,214,205), ryellow=(236,206,42), rred=(202,55,45), amber=(206,150,60),
         pastis=(216,150,55), wood=(92,56,30), dark=(20,22,30), steel=(62,66,80),
         green=(70,224,90), lred=(255,49,64), cyan=(42,222,210), white=(232,232,226),
         chrome=(150,155,168), black=(14,15,20))

def col(m, name, a=255):
    r,g,b = C[name]; m.visual = trimesh.visual.ColorVisuals(m, face_colors=[r,g,b,a]); return m
def cyl(r,h,z=0,sec=16,name='steel'):
    m=trimesh.creation.cylinder(radius=r,height=h,sections=sec); m.apply_translation([0,0,z]); return col(m,name)
def box(ext,t=(0,0,0),name='steel'):
    m=trimesh.creation.box(extents=ext); m.apply_translation(t); return col(m,name)
def sph(r,t=(0,0,0),name='steel',sub=1):
    m=trimesh.creation.icosphere(subdivisions=sub,radius=r); m.apply_translation(t); return col(m,name)

# ---------- props ----------
def bouteille_ricard():
    body=cyl(0.34,1.0,0.0,20,'glass'); shoulder=cyl(0.30,0.18,0.55,20,'glass')
    neck=cyl(0.10,0.42,0.78,14,'glass'); cap=cyl(0.12,0.13,1.03,14,'ryellow')
    label=cyl(0.352,0.42,-0.05,20,'rred'); labtop=cyl(0.353,0.06,0.17,20,'white')
    return trimesh.Scene([body,shoulder,neck,cap,label,labtop])

def verre_pastis():
    glass=cyl(0.22,0.5,0.0,20,'glass'); liquid=cyl(0.205,0.34,-0.06,20,'pastis')
    ice=box([0.12,0.12,0.12],(0.05,0.03,0.12),'glass'); base=cyl(0.2,0.04,-0.25,20,'glass')
    return trimesh.Scene([glass,liquid,ice,base])

def tv_pmu():
    caisson=box([1.0,0.8,0.78],(0,0,0.4),'wood'); face=box([0.92,0.06,0.7],(0,-0.42,0.42),'black')
    ecran=box([0.72,0.05,0.54],(0,-0.44,0.44),'dark'); glow=box([0.66,0.04,0.48],(0,-0.45,0.44),'green')
    k1=cyl(0.05,0.06,0.15,12,'chrome'); k1.apply_translation([0.4,-0.45,0]);
    k2=cyl(0.05,0.06,0.15,12,'chrome'); k2.apply_translation([0.4,-0.45,-0.18])
    ant=cyl(0.015,0.5,0.95,8,'chrome'); ant.apply_translation([0.15,0,0])
    return trimesh.Scene([caisson,face,ecran,glow,k1,k2,ant])

def borne_arcade():
    base=box([0.96,0.76,0.14],(0,0,0.07),'lred'); body=box([0.9,0.7,1.7],(0,0,0.9),'lred')
    bezel=box([0.76,0.05,0.6],(0,-0.34,1.2),'dark'); ecran=box([0.68,0.04,0.52],(0,-0.35,1.2),'cyan')
    panel=box([0.82,0.36,0.09],(0,-0.28,0.66),'black')
    b1=sph(0.05,(-0.2,-0.3,0.7),'ryellow'); b2=sph(0.05,(-0.05,-0.3,0.7),'green'); b3=sph(0.05,(0.1,-0.3,0.7),'cyan')
    stick=cyl(0.02,0.16,0.75,8,'chrome'); stick.apply_translation([0.28,-0.3,0]); ball=sph(0.045,(0.28,-0.3,0.85),'rred')
    marquee=box([0.88,0.07,0.22],(0,-0.33,1.62),'cyan')
    return trimesh.Scene([base,body,marquee,bezel,ecran,panel,b1,b2,b3,stick,ball])

def neon_laride():
    back=box([1.5,0.08,0.7],(0,0.05,0),'black')
    top=box([1.4,0.1,0.09],(0,-0.02,0.28),'lred'); bot=box([1.4,0.1,0.09],(0,-0.02,-0.28),'lred')
    left=box([0.09,0.1,0.56],(-0.66,-0.02,0),'lred'); right=box([0.09,0.1,0.56],(0.66,-0.02,0),'lred')
    bar=box([1.1,0.11,0.07],(0,-0.03,0.02),'cyan')
    dot=sph(0.06,(-0.5,-0.05,-0.02),'green')
    return trimesh.Scene([back,top,bot,left,right,bar,dot])

PROPS = {
    'bouteille_ricard': bouteille_ricard, 'verre_pastis': verre_pastis,
    'tv_pmu': tv_pmu, 'borne_arcade': borne_arcade, 'neon_laride': neon_laride,
}

# ---------- apercu matplotlib (lambert flat, fond nuit) ----------
def preview(scene, name):
    L = np.array([0.4,-0.75,0.6]); L = L/np.linalg.norm(L)
    fig = plt.figure(figsize=(3.2,3.2), dpi=110); ax = fig.add_subplot(111, projection='3d')
    fig.patch.set_facecolor('#0b0e1a'); ax.set_facecolor('#0b0e1a')
    allv=[]
    Rz=np.array([[np.cos(np.pi),-np.sin(np.pi),0],[np.sin(np.pi),np.cos(np.pi),0],[0,0,1]])  # face avant (-Y) vers la cam
    for g in scene.geometry.values():
        v=g.vertices@Rz.T; f=g.faces; fc=g.visual.face_colors[:,:3]/255.0
        tris=v[f]; allv.append(v)
        n=np.cross(tris[:,1]-tris[:,0], tris[:,2]-tris[:,0])
        nl=np.linalg.norm(n,axis=1,keepdims=True); nl[nl==0]=1; n=n/nl
        sh=0.35+0.65*np.clip(n@L,0,1)
        cols=np.clip(fc*sh[:,None],0,1)
        pc=Poly3DCollection(tris, facecolors=cols, edgecolors=(0,0,0,0.25), linewidths=0.3)
        ax.add_collection3d(pc)
    allv=np.vstack(allv); c=allv.mean(0); r=np.ptp(allv,0).max()/2*1.15
    ax.set_xlim(c[0]-r,c[0]+r); ax.set_ylim(c[1]-r,c[1]+r); ax.set_zlim(c[2]-r,c[2]+r)
    ax.set_box_aspect((1,1,1)); ax.view_init(elev=18, azim=-58); ax.axis('off')
    p=os.path.join(PREV, f'prop_{name}.png'); plt.savefig(p, facecolor=fig.get_facecolor(), bbox_inches='tight', pad_inches=0.1); plt.close(fig)
    return p

for name, fn in PROPS.items():
    scene = fn()
    preview(scene, name)
    scene.apply_transform(YUP)
    path = os.path.join(OUT, name+'.glb'); scene.export(path)
    print('OK', name+'.glb', f'{os.path.getsize(path)//1024} Ko')
print('--- GLB dans', os.path.normpath(OUT))
