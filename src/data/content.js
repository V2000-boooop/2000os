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
      { id: 'morceaux', name: 'morceaux finis', kind: 'folder', children: [
          { id: 'radio_jp_garage', name: 'RADIO JAPAN GARAGE 1', kind: 'audio', src: '/media/radio_japan_garage_1.webm', srcGlove: '/media/radio_japan_garage_boite.webm', fav: true },
        ] },
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
      { id: 'game_fight', name: 'NIGHT_FIGHT.exe', kind: 'game', gameId: 'fight', glyph: '🥊', version: 'v0.1', year: '2026', desc: 'baston de nuit — 1P vs CPU ou 2 joueurs.' },
      { id: 'exe_car', name: 'CAR.exe', kind: 'exe', glyph: '🚗', version: 'v0.4', year: '2024', desc: 'conduire. écouter. rien d\'autre.', message: 'bientôt disponible.\n\nla route est en cours de construction.' },
      { id: 'exe_pong', name: 'PONG_2000.exe', kind: 'exe', glyph: '🏓', version: 'v0.9', year: '2019', desc: 'le premier. toujours pas fini.', message: 'bientôt disponible.\n\n(depuis 2019, oui.)' },
      { id: 'exe_radio', name: 'RADIO.exe', kind: 'exe', glyph: '📻', version: 'v0.2', year: '2025', desc: 'des fréquences introuvables ailleurs.', message: 'bientôt disponible.\n\nrecherche du signal…' },
      { id: 'exe_hal', name: 'HAL.exe', kind: 'exe', glyph: '👁', version: 'v1.0', year: '2023', desc: 'il répond. parfois.', message: 'HAL dort.\n\nne pas le réveiller pour rien.' },
      { id: 'exe_secret', name: '???.exe', kind: 'exe', glyph: '❓', version: '', year: '', desc: '…', message: 'pas encore.\n\nreviens plus tard. ou cherche mieux.' },
      { id: 'exe_test', name: 'TEST.exe', kind: 'exe', glyph: '🧪', version: 'v?.?', year: '2021', desc: 'ne pas ouvrir.', message: 'je t\'avais dit de ne pas ouvrir.\n\n(rien n\'a été cassé. probablement.)' },
    ],
  },
  {
    id: 'notes', name: 'Notes', kind: 'folder',
    children: [
      { id: 'note_basse', name: 'note_basse.txt', kind: 'note', meta: { date: 'hier, 02:14' }, content: 'la basse doit respirer comme le field rec du hangar.\ntester en 12/8 ?\n\nne pas nettoyer la pluie. la pluie EST le morceau.' },
      { id: 'note_ep', name: 'structure_ep.txt', kind: 'note', meta: { date: 'lundi' }, content: 'EP — 5 titres ?\n\n1. intro (field rec seul, 1 min max)\n2. le morceau du hangar\n3. ?\n4. ?\n5. outro — la même intro mais détruite\n\nchaque titre = une pièce du même lieu.' },
      { id: 'note_idees', name: 'idees_en_vrac.txt', kind: 'note', fav: true, meta: { date: 'mars 2026' }, content: 'un morceau qui commence par 30 sec de silence assumé\n\nvendre des sons au mètre ?\n\nle kick doit sonner comme un carton mouillé (cf. samples)\n\nune installation où le public mixe sans le savoir\n\nfilmer le hangar à 6h — lumière irréelle' },
      { id: 'note_oublier', name: 'a_ne_pas_oublier.txt', kind: 'note', meta: { date: 'avril 2026' }, content: 'récupérer le zoom H4 chez marc\n\nSAUVEGARDER LE DISQUE (vraiment)\n\nréécouter les minidiscs de 2019 — il y avait un truc\n\nrépondre au mail du label. pas demain. aujourd\'hui.' },
      { id: 'note_phrases', name: 'phrases.txt', kind: 'note', meta: { date: '—' }, content: '« la nuit est une salle de concert vide »\n\n« un son n\'est jamais perdu, il attend »\n\n« jouer moins fort que la pluie »' },
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

// Outil interne : UI Sound Lab (docs/exploration/soundlist_ui_v1.md).
// Pas sur le bureau — accessible via la recherche (« lab », « son »…).
byId['soundlab'] = { id: 'soundlab', name: 'UI Sound Lab', kind: 'lab' };
searchIndex.push({ id: 'soundlab', name: 'UI Sound Lab', kind: 'lab', path: 'outil interne — sons d\'interface' });
