// Matière fictive plausible, volontairement minimale — remplacée progressivement
// par le vrai contenu. Schéma léger « pièces » (docs/020_RESEARCH_ENGINE.md) :
// - { ref: 'id' } permet la multi-appartenance
// - meta = dimensions optionnelles
// - fav: true = pièce de la collection personnelle de Vincent (★).
//   Le dossier virtuel « Favoris » est construit automatiquement à partir de ces
//   marqueurs et mélange naturellement sons, images, notes… (toutes matières).
// La profondeur viendra dossier par dossier.

export const tree = [
  {
    id: 'sons', name: 'Sons', kind: 'folder',
    children: [
      {
        id: 'samples', name: 'samples', kind: 'folder',
        children: [
          { id: 'kick1', name: 'kick_carton.wav', kind: 'audio', src: '/media/kick_carton.wav', fav: true },
        ],
      },
      {
        id: 'field', name: 'field recordings', kind: 'folder',
        children: [
          { id: 'fr_hangar', name: 'hangar_pluie.wav', kind: 'audio', src: '/media/hangar_pluie.wav', fav: true },
          { id: 'fr_quai', name: 'quai_nuit_02.wav', kind: 'audio', src: '/media/quai_nuit_02.wav' },
        ],
      },
      {
        id: 'demos', name: 'démos', kind: 'folder',
        children: [
          { id: 'demo3', name: 'demo_hangar_v3.wav', kind: 'audio', src: '/media/demo_hangar_v3.wav' },
          { id: 'basse1', name: 'basse_test_01.wav', kind: 'audio', src: '/media/basse_test_01.wav' },
        ],
      },
      { id: 'morceaux', name: 'morceaux finis', kind: 'folder', children: [] },
    ],
  },
  {
    id: 'medias', name: 'Médias', kind: 'folder',
    children: [
      {
        id: 'photos', name: 'photos', kind: 'folder',
        children: [
          { id: 'img_hangar', name: 'hangar_exterieur', kind: 'image', src: '/media/hangar_exterieur.svg' },
          { id: 'img_beton', name: 'beton_hangar', kind: 'image', src: '/media/texture_beton.svg' },
        ],
      },
      {
        id: 'videos', name: 'vidéos', kind: 'folder',
        children: [
          { id: 'vid_test', name: 'test_visuel_01.mp4', kind: 'video', src: '/media/test_visuel_01.mp4' },
        ],
      },
      {
        id: 'visuels', name: 'créations visuelles', kind: 'folder',
        children: [
          { id: 'img_affiche', name: 'affiche_nuit2000_v2', kind: 'image', src: '/media/affiche_rave.svg', fav: true },
          { id: 'img_tracker', name: 'souvenir_tracker', kind: 'image', src: '/media/interface_tracker.svg' },
        ],
      },
      {
        id: 'moodboards', name: 'moodboards', kind: 'folder',
        children: [
          { id: 'img_mood', name: 'moodboard_nuit', kind: 'image', src: '/media/moodboard_nuit.svg', fav: true },
        ],
      },
    ],
  },
  {
    id: 'projets', name: 'Projets', kind: 'folder',
    children: [
      { id: 'p_hangar', name: 'HANGAR', kind: 'folder', children: [{ ref: 'demo3' }, { ref: 'note_basse' }] },
      { id: 'p_carmen', name: 'CARMEN', kind: 'folder', children: [{ ref: 'img_mood' }] },
      { id: 'p_djsets', name: 'DJ SETS', kind: 'folder', children: [] },
    ],
  },
  {
    id: 'jeux', name: 'Jeux', kind: 'folder',
    children: [
      { id: 'pong', name: 'PONG_2000.exe', kind: 'stub', message: 'bientôt.' },
    ],
  },
  {
    id: 'notes', name: 'Notes', kind: 'folder',
    children: [
      { id: 'note_basse', name: 'note_basse.txt', kind: 'note', content: 'la basse doit respirer comme le field rec du hangar.\ntester en 12/8 ?' },
      { id: 'note_ep', name: 'structure_ep.txt', kind: 'note', content: 'EP — 5 titres ?\n1. intro (field rec seul)\n2. ...' },
    ],
  },
  { id: 'internet', name: 'Internet', kind: 'stub', message: 'composition du numéro…\n\nporteuse introuvable.\nréessayer plus tard.' },
  {
    id: 'corbeille', name: 'Corbeille', kind: 'folder',
    children: [
      { id: 'trash_logo', name: 'logo_final_v8_VRAIMENT_final.png', kind: 'image', src: '/media/vieux_logo.svg' },
    ],
  },
];

// ---- index & résolution ----

export const byId = {};

/** Ids des pièces de la collection personnelle (★), dans l'ordre de l'arbre. */
export const favoriteIds = [];

function indexNode(node) {
  if (node.id) byId[node.id] = node;
  if (node.fav) favoriteIds.push(node.id);
  (node.children ?? []).forEach((c) => { if (!c.ref) indexNode(c); });
}
tree.forEach(indexNode);

// Dossier virtuel « Favoris » : agrège toutes les pièces marquées fav,
// toutes matières confondues. Pas encore sur le bureau — accessible via la
// recherche, en attendant sa place définitive.
byId['favoris'] = {
  id: 'favoris',
  name: 'Favoris',
  kind: 'folder',
  virtual: true,
  children: favoriteIds.map((id) => ({ ref: id })),
};

/** Résout les enfants d'un dossier (refs → items réels, multi-appartenance). */
export function resolveChildren(folder) {
  return (folder.children ?? []).map((c) => (c.ref ? byId[c.ref] : c)).filter(Boolean);
}

// ---- icônes du bureau (niveau 1 : catégories naturelles, cf. 030_OS) ----

export const desktopItems = tree.map((n) => ({
  id: n.id,
  name: n.name,
  kind: n.kind,
  glyph: n.id === 'internet' ? '🌐' : n.id === 'corbeille' ? '🗑' : '📁',
}));

// ---- index de recherche (principe 2 : tout retrouver, vite) ----

export const searchIndex = [];
function walk(node, path) {
  if (node.id && node.id !== 'root') {
    searchIndex.push({ id: node.id, name: node.name, kind: node.kind, path });
  }
  (node.children ?? []).forEach((c) => {
    if (!c.ref) walk(c, path ? `${path} / ${node.name}` : node.name);
  });
}
tree.forEach((n) => walk(n, ''));
searchIndex.push({ id: 'favoris', name: 'Favoris ★', kind: 'folder', path: 'collection personnelle' });
