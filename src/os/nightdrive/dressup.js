// LE JEU D'HABILLAGE DU VESTIAIRE (laride_vestiaire_habillage.md, v1 minimale §7.2).
//
// Dress-up type Sims du raver alien : une pile de calques PNG empilés dans la
// persoZone (option A §4.1, CSS), pivot aux pieds, idle doux (comme les perso
// barque It32). On compose une tenue, elle se sauve légère (indices de slots,
// 1 clé localStorage §5).
//
// v1 STRICTE (§7.2) : 1 base (raver H, pose figée), 4 slots (haut·bas·pieds·
// coiffe), 3 variantes chacun + valeur de base. coiffe optionnelle ('rien').
// 0 Rive, 0 nouvelle lib. Migration A→B (Rive) ne jette aucun asset (contrat
// de slots §2 stable).
//
// PLACEHOLDERS : les vrais PNG n'existent pas encore. Chaque pièce porte le nom
// de fichier EXACT du §3.3. Tant que le fichier est absent, un placeholder
// (aplat coloré étiqueté) tient la place au même emplacement de calque. Déposer
// le PNG le remplace SANS changer une ligne de code (même logique 050).

// Dossier de drop (§3.3). base + variantes = un PNG transparent par pièce,
// même cadre / même pivot pieds (canevas 600×1200, perso ~900px, §2.1).
export const DRESSUP_DIR = '/media/nightdrive/perso/dressup';
const DU_VER = 2;                                          // bump pour forcer le refresh du cache navigateur
const F = (n) => `${DRESSUP_DIR}/${n}.webp?v=${DU_VER}`;

// LA BASE : le raver H, une pose figée (§7.2.1). Toujours rendu (calque z=0).
export const BASE = { key: 'base_h', label: 'Raver', src: F('base_h'), color: '#6b4fa0' };

// LES 4 SLOTS (§7.2.2), dans l'ordre de calque z croissant (fond → avant).
// Chaque slot : ses variantes (clé courte = ce qui se sauve, + nom de fichier
// EXACT §3.3 + couleur/étiquette de placeholder). `base` = valeur par défaut du
// slot (indice de départ). optional=true → une variante 'rien' (calque vide).
// GARDE-ROBE : chaque vêtement généré SEUL sur la base (build_dressup_garments.py),
// découpé net par catégorie, zéro occlusion. Fichiers <cat>_<i>.webp (i = index
// de l'image source). On ajoute une pièce = un fichier + son index dans la liste.
const mkG = (slot, ns) => ns.map((n) => ({ key: `${slot}${n}`, label: `${slot} ${n}`, file: `${slot}_${n}`, color: '#5a5a66' }));
const HAUT_N   = [1, 2, 3, 5, 6, 7, 8, 9, 10];                 // 4 = hoodie gris mal coupé retiré
const BAS_N    = [11, 12, 13, 14, 15, 16, 17, 19];             // 18 = short retiré
const PIEDS_N  = [20, 21, 22, 23, 24, 25, 26, 27, 28];
const COIFFE_N = [29, 31, 34, 35, 36];                        // 30 (casquette basse), 32,33 retirés

export const SLOTS = [
  { key: 'bas',    label: 'Bas',    z: 2, base: 'bas11',   optional: false, variants: mkG('bas', BAS_N) },
  { key: 'pieds',  label: 'Pieds',  z: 1, base: 'pieds20', optional: false, variants: mkG('pieds', PIEDS_N) },
  { key: 'haut',   label: 'Haut',   z: 3, base: 'haut1',   optional: false, variants: mkG('haut', HAUT_N) },
  { key: 'coiffe', label: 'Coiffe', z: 7, base: null,      optional: true,  variants: mkG('coiffe', COIFFE_N) },
];

export const slotByKey = Object.fromEntries(SLOTS.map((s) => [s.key, s]));

/** URL du PNG d'une variante (pour le calque ET la vignette-crop). */
export function variantSrc(slotKey, variantKey) {
  if (!variantKey) return null; // 'rien'
  const v = slotByKey[slotKey]?.variants.find((x) => x.key === variantKey);
  return v ? F(v.file) : null;
}
export function variantOf(slotKey, variantKey) {
  return slotByKey[slotKey]?.variants.find((x) => x.key === variantKey) ?? null;
}

// LISTE EXACTE des PNG attendus (base + toutes les variantes) — pour préchargement
// et pour le message de drop. Déposer ces fichiers = le jeu s'allume tout seul.
export const EXPECTED_FILES = [
  BASE.src,
  ...SLOTS.flatMap((s) => s.variants.map((v) => F(v.file))),
];

// ---- SAUVEGARDE LÉGÈRE (§5) : 1 clé localStorage, indices de slots seulement,
// JAMAIS d'image. Quelques dizaines d'octets. ----
const KEY = 'v2000.laride.outfit';

/** La tenue de base (par défaut) : chaque slot sur sa valeur `base`. */
export function defaultOutfit() {
  const o = {};
  for (const s of SLOTS) o[s.key] = s.base; // null pour coiffe (rien)
  return o;
}

/** Charge l'outfit sauvé ; ignore les clés inconnues (robuste, §5). */
export function loadOutfit() {
  const o = defaultOutfit();
  try {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(KEY);
    if (!raw) return o;
    const saved = JSON.parse(raw);
    for (const s of SLOTS) {
      const v = saved[s.key];
      if (v === null) { if (s.optional) o[s.key] = null; continue; } // 'rien' explicite
      if (v && s.variants.some((x) => x.key === v)) o[s.key] = v;    // indice valide
    }
  } catch {}
  return o;
}

/** Sauve l'outfit courant (indices de slots). Silencieux si localStorage absent. */
export function saveOutfit(outfit) {
  try {
    const clean = {};
    for (const s of SLOTS) clean[s.key] = outfit[s.key] ?? null;
    localStorage.setItem(KEY, JSON.stringify(clean));
  } catch {}
}

/** SURPRENDS-MOI (§1.3) : une variante au hasard par slot (coiffe peut tomber sur 'rien'). */
export function randomOutfit() {
  const o = {};
  for (const s of SLOTS) {
    const pool = s.optional ? [null, ...s.variants.map((v) => v.key)] : s.variants.map((v) => v.key);
    o[s.key] = pool[Math.floor(Math.random() * pool.length)];
  }
  return o;
}
