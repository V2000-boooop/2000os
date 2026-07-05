// Scène restaurée — règle « la machine ne démarre jamais » (docs/030_OS.md).
// Version v1 volontairement discrète : l'Émetteur en veille côté ATELIER et une
// note ouverte, posés en périphérie. Le bureau reste immédiatement lisible.

import { openWindow } from '../os/wm.svelte.js';

export function restoreSession() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  // L'Émetteur, ouvert, au repos côté ATELIER (D13 : il était là avant nous).
  openWindow({
    appId: 'emetteur', key: 'emetteur', title: '⌁ émetteur',
    x: Math.max(340, vw - 460), y: Math.max(160, vh - 420), w: 408, h: 296,
  });

  // Une note restée ouverte, en retrait.
  openWindow({
    appId: 'note', key: 'note:note_basse', title: 'note_basse.txt — non enregistrée',
    props: { noteId: 'note_basse', unsaved: true },
    x: Math.max(150, vw - 720), y: Math.max(60, vh - 340), w: 360, h: 190,
  });
}
