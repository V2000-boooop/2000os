// Moteur audio de l'Émetteur (D13 — le lecteur est un émetteur).
// Singleton : une seule onde. N'importe quel lieu peut faire passer un son
// à l'antenne (playTrack), un dossier entier (playQueue), ou piloter la file (step).

import { openWindow } from './wm.svelte.js';

export const player = $state({
  trackId: null,
  playing: false,
  autoplay: false,
  caption: '',   // trace de session, ex. « laissé en pause hier, 02:17 »
  queue: [],     // ids des sons enchaînés (ex. contenu d'un dossier)
  qIndex: -1,
  qLabel: '',    // nom du dossier en cours d'écoute
});

// Élément <audio> réel, possédé par EmetteurApp quand sa fenêtre existe.
let audioEl = null;

export function bindAudio(el) { audioEl = el; }
export function unbindAudio() { audioEl = null; player.playing = false; }

/** Fait passer un son à l'antenne (ou play/pause). ctx optionnel : { list, label }. */
export function playTrack(item, ctx = null) {
  if (ctx) {
    player.queue = ctx.list.map((i) => i.id);
    player.qIndex = player.queue.indexOf(item.id);
    player.qLabel = ctx.label ?? '';
  } else if (player.queue.includes(item.id)) {
    player.qIndex = player.queue.indexOf(item.id);
  } else {
    player.queue = [item.id];
    player.qIndex = 0;
    player.qLabel = '';
  }

  // Même son déjà à l'antenne → simple play/pause.
  if (player.trackId === item.id && audioEl) {
    player.caption = '';
    if (audioEl.paused) audioEl.play().catch(() => {});
    else audioEl.pause();
    openEmetteurWindow();
    return;
  }
  player.trackId = item.id;
  player.caption = '';
  player.autoplay = true;
  openEmetteurWindow();
}

/** ÉJECT — rendre l'antenne : tout s'arrête, le fader retourne côté ATELIER. */
export function eject() {
  if (audioEl) {
    audioEl.pause();
    try { audioEl.currentTime = 0; } catch {}
  }
  player.trackId = null;
  player.playing = false;
  player.autoplay = false;
  player.caption = '';
  player.queue = [];
  player.qIndex = -1;
  player.qLabel = '';
}

/** Enchaîne tous les sons d'une liste (ex. « lire le dossier »). */
export function playQueue(list, label = '') {
  if (!list?.length) return;
  playTrack(list[0], { list, label });
}

/** Piste suivante (+1) / précédente (−1) dans la file. */
export function step(dir) {
  if (player.queue.length < 2) return;
  const i = Math.min(Math.max(player.qIndex + dir, 0), player.queue.length - 1);
  if (i === player.qIndex) return;
  player.qIndex = i;
  player.trackId = player.queue[i];
  player.caption = '';
  player.autoplay = true;
}

/** Fin de piste : enchaîne, ou s'arrête en fin de file (fin de la face). */
export function trackEnded() {
  if (player.qIndex >= 0 && player.qIndex < player.queue.length - 1) {
    player.qIndex += 1;
    player.trackId = player.queue[player.qIndex];
    player.autoplay = true;
  } else {
    player.playing = false;
  }
}

export function openEmetteurWindow(opts = {}) {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  openWindow({
    appId: 'emetteur', key: 'emetteur', title: '⌁ émetteur',
    x: opts.x ?? Math.max(340, vw - 460),
    y: opts.y ?? Math.max(160, vh - 420),
    w: 408, h: 296,
    // L'Émetteur s'ouvre et se focus en silence : aucun son d'UI ne doit
    // jamais salir le début d'une écoute (docs/050_SON.md).
    silent: true,
  });
}
