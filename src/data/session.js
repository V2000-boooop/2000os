// Scène restaurée — règle « la machine ne démarre jamais » (docs/030_OS.md).
// Version v1 volontairement discrète : le lecteur en pause et une note ouverte,
// posés en périphérie. Le bureau reste immédiatement lisible.

import { openWindow } from '../os/wm.svelte.js';
import { player } from '../os/player.svelte.js';

export function restoreSession() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Le lecteur, en pause, discret en bas à droite.
  player.trackId = 'demo3';
  player.queue = ['demo3'];
  player.qIndex = 0;
  player.playing = false;
  player.autoplay = false;
  player.caption = 'laissé en pause hier, 02:17';
  openWindow({
    appId: 'player', key: 'player', title: '♪ lecteur',
    x: Math.max(340, vw - 360), y: Math.max(200, vh - 300), w: 310, h: 170,
  });

  // Une note restée ouverte, en retrait.
  openWindow({
    appId: 'note', key: 'note:note_basse', title: 'note_basse.txt — non enregistrée',
    props: { noteId: 'note_basse', unsaved: true },
    x: Math.max(150, vw - 720), y: Math.max(60, vh - 340), w: 360, h: 190,
  });
}
