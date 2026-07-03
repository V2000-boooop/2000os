// État + contrôleur du lecteur audio (app signature, docs/030_OS.md).
// Le lecteur est un singleton : une seule source sonore à la fois.
// N'importe quel lieu (dossier, recherche…) peut lancer un son via playTrack().

import { openWindow } from './wm.svelte.js';

export const player = $state({
  trackId: null,
  playing: false,
  autoplay: false,
  caption: '', // trace de session, ex. « laissé en pause hier, 02:17 »
});

// Élément <audio> réel, possédé par PlayerApp quand sa fenêtre existe.
let audioEl = null;

export function bindAudio(el) {
  audioEl = el;
}

export function unbindAudio() {
  audioEl = null;
  player.playing = false;
}

/** Ouvre (ou focus) le lecteur et joue/pause le son demandé. */
export function playTrack(item) {
  // Même piste déjà chargée → simple play/pause.
  if (player.trackId === item.id && audioEl) {
    player.caption = '';
    if (audioEl.paused) audioEl.play().catch(() => {});
    else audioEl.pause();
    openPlayerWindow();
    return;
  }
  player.trackId = item.id;
  player.caption = '';
  player.autoplay = true;
  openPlayerWindow();
}

export function openPlayerWindow(opts = {}) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  openWindow({
    appId: 'player', key: 'player', title: '♪ lecteur',
    x: opts.x ?? Math.max(340, vw - 360),
    y: opts.y ?? Math.max(200, vh - 300),
    w: 310, h: 170,
  });
}
