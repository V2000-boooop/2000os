// Projection perspective d'un rectangle plat sur un quadrilatère (les 4 coins
// d'un mur qui fuit). Calcule la homographie (transform projective) et la sort
// en `matrix3d` CSS. Aucune lib 3D — ~40 lignes de maths (méthode franklinta.com).
//
// Usage : matrix3dForQuad(w, h, quad) où (w,h) = taille de la boîte de l'élément
// plat, quad = { hg, hd, bg, bd } coins-cibles en px { x, y } (haut-gauche,
// haut-droit, bas-gauche, bas-droit). À appliquer avec transform-origin: 0 0.

function adj(m) {
  return [
    m[4]*m[8]-m[5]*m[7], m[2]*m[7]-m[1]*m[8], m[1]*m[5]-m[2]*m[4],
    m[5]*m[6]-m[3]*m[8], m[0]*m[8]-m[2]*m[6], m[2]*m[3]-m[0]*m[5],
    m[3]*m[7]-m[4]*m[6], m[1]*m[6]-m[0]*m[7], m[0]*m[4]-m[1]*m[3],
  ];
}
function mul(a, b) {
  const c = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[3*i+k] * b[3*k+j];
      c[3*i+j] = s;
    }
  return c;
}
function mulv(m, v) {
  return [
    m[0]*v[0]+m[1]*v[1]+m[2]*v[2],
    m[3]*v[0]+m[4]*v[1]+m[5]*v[2],
    m[6]*v[0]+m[7]*v[1]+m[8]*v[2],
  ];
}
// base : mappe le carré unité (coins) → 4 points, via la matrice de base + poids.
function basis(x1,y1,x2,y2,x3,y3,x4,y4) {
  const m = [x1,x2,x3, y1,y2,y3, 1,1,1];
  const v = mulv(adj(m), [x4, y4, 1]);
  return mul(m, [v[0],0,0, 0,v[1],0, 0,0,v[2]]);
}
// homographie qui envoie (src quad) → (dst quad)
function projection(s, d) {
  return mul(basis(d[0],d[1],d[2],d[3],d[4],d[5],d[6],d[7]),
             adj(basis(s[0],s[1],s[2],s[3],s[4],s[5],s[6],s[7])));
}

/** matrix3d CSS qui warpe le rectangle [0..w]×[0..h] sur le quad {hg,hd,bg,bd}. */
export function matrix3dForQuad(w, h, quad) {
  const { hg, hd, bg, bd } = quad;
  // ordre src : (0,0)=hg, (w,0)=hd, (0,h)=bg, (w,h)=bd
  const t = projection(
    [0,0, w,0, 0,h, w,h],
    [hg.x,hg.y, hd.x,hd.y, bg.x,bg.y, bd.x,bd.y],
  );
  for (let i = 0; i < 9; i++) t[i] = t[i] / t[8];
  const M = [t[0],t[3],0,t[6], t[1],t[4],0,t[7], 0,0,1,0, t[2],t[5],0,t[8]];
  return `matrix3d(${M.join(',')})`;
}
