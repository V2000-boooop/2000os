// Scène restaurée — règle « la machine ne démarre jamais » (docs/030_OS.md).
// Le visiteur arrive en cours de session : quelqu'un travaillait ici il y a quelques instants.
// Ce fichier est LE point d'édition de la scène d'arrivée (2–3 fenêtres max, trace légère).

import { openWindow } from '../os/wm.svelte.js';
import { player } from '../os/player.svelte.js';

export function restoreSession() {
  // Le lecteur, laissé en pause sur la démo de cette nuit.
  player.trackId = 'demo3';
  player.playing = false;
  player.autoplay = false;
  player.caption = 'laissé en pause hier, 02:17';
  openWindow({
    appId: 'player', key: 'player', title: '♪ lecteur',
    x: Math.max(360, (typeof window !== 'undefined' ? window.innerWidth : 1200) - 420),
    y: 90, w: 330, h: 180,
  });

  // Une note restée ouverte, non enregistrée (curseur qui clignote).
  openWindow({
    appId: 'note', key: 'note:note_basse', title: 'note_basse.txt — non enregistrée',
    props: { noteId: 'note_basse', unsaved: true },
    x: 170, y: 200, w: 410, h: 250,
  });
}
