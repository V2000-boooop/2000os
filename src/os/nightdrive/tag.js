// LE MUR À TAGUER DES CHIOTTES — sous-scène 3.1 (validée, doc laride_sousscenes.md).
// Le geste rave/street de Jet Set Radio : on prend une bombe, on tague la cloison,
// et ça RESTE. La trace se densifie de nuit en nuit — par visiteur (localStorage),
// pas de backend (pas de mur communautaire, D10/phase 1).
//
// ⚠️ CONDITION DE VALIDATION du Contrôleur (piège n°1) : NE JAMAIS sauver un
// dataURL/PNG en localStorage (quota ~5 Mo → crash silencieux). On stocke une
// LISTE VECTORIELLE COMPACTE de traits {c:couleurIdx, s:taille, p:[x,y,x,y,…]}
// avec un PLAFOND FIFO (les vieux tags dégagent). On re-peint au chargement.
// localStorage reste minuscule.

const KEY = 'v2000_wc_tags_v1';

// Plafond FIFO : nombre max de traits gardés. Un trait ~= un geste de spray
// (pointerdown→up). Au-delà, les plus vieux sont oubliés (le mur « se lessive »
// lentement, mais ne sature jamais le quota). ~200 traits de coords entières
// restent très en-dessous de 100 Ko.
export const MAX_TRAITS = 220;

// Coordonnées stockées en entiers (0–999) sur une grille normalisée, ré-étalée
// à la taille réelle du canvas au rendu → indépendant de la résolution d'écran.
export const GRID = 1000;

// La palette bombe = 4 couleurs fluo « chiottes de club » alignées sur les teintes
// DA (violet-rave / rouge-nuit / vert-pmu / jaune-sodium). Le canvas ne lit pas les
// custom properties CSS → on stocke le hex, comme le reste de NightDrive (grattage,
// graffs). L'index (0..3) est ce qu'on persiste, pas le hex → compact.
export const PALETTE = [
  { nom: 'violet rave',  hex: '#b46cff' },
  { nom: 'rouge nuit',   hex: '#ff3a5e' },
  { nom: 'vert pmu',     hex: '#4ad0a0' },
  { nom: 'jaune sodium', hex: '#ffb24a' },
];

// Tailles de bombe proposées (rayon du jet, en px de grille GRID).
export const TAILLES = [10, 18, 30];

/** Charge la liste vectorielle des traits (ou []), robuste au JSON cassé. */
export function chargerTags() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Sauve la liste (déjà plafonnée). Silencieux si localStorage indispo/plein. */
export function sauverTags(traits) {
  try {
    localStorage.setItem(KEY, JSON.stringify(traits));
  } catch {
    // quota atteint malgré le plafond (cas extrême) : on lâche le plus vieux
    // moitié et on retente une fois, sinon tant pis (silence, pas de crash).
    try {
      localStorage.setItem(KEY, JSON.stringify(traits.slice(-Math.floor(MAX_TRAITS / 2))));
    } catch { /* on renonce sans planter */ }
  }
}

/**
 * Ajoute un trait fini à la liste et applique le plafond FIFO.
 * trait = { c: <index palette>, s: <taille px grille>, p: [x0,y0,x1,y1,…] } (coords GRID entières).
 * Renvoie la nouvelle liste (à re-sauver via sauverTags).
 */
export function ajouterTrait(traits, trait) {
  if (!trait || !trait.p || trait.p.length < 2) return traits;
  const next = [...traits, trait];
  return next.length > MAX_TRAITS ? next.slice(next.length - MAX_TRAITS) : next;
}

// ---- Tags pré-écrits de Vincent (déjà là « sous » les tags du visiteur) : ---
// des inscriptions locales / an 2000, filiation D13 (le mur EST un mur d'antenne).
// Rendus en texte (pas des traits) pour rester lisibles et légers.
export const TAGS_VINCENT = [
  { txt: 'VINCENT 2000 ÉTAIT LÀ', x: 8,  y: 14, rot: -4, size: 20, c: 1 },
  { txt: '93.00 FM',             x: 66, y: 30, rot: 3,  size: 17, c: 3 },
  { txt: 'la nuit à ceux qui écoutent', x: 10, y: 74, rot: -2, size: 13, c: 2 },
  { txt: 'demande au zinc',      x: 42, y: 46, rot: 2,  size: 12, c: 0 },
  { txt: '♡ + ✝',               x: 80, y: 22, rot: 6,  size: 22, c: 1 },
];
