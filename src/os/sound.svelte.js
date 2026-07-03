// Moteur sonore de l'interface (docs/050_SON.md).
// Règle : le bureau est calme, les interactions sont exubérantes — le son est
// discret, jamais envahissant, et coupable d'un clic (bouton dans la barre).
// Le navigateur n'autorise l'audio qu'après un geste : initSoundOnGesture().

import { soundMap } from '../data/sounds.js';

export const sound = $state({
  enabled: true,
  ready: false,
  loaded: {}, // name -> true si le fichier a été chargé et décodé
});

// Préférence mémorisée.
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('v2000_sound') === '0') sound.enabled = false;
  } catch {}
}

let ctx = null;
const buffers = {};

async function loadOne(name, def) {
  try {
    const res = await fetch(def.src, { cache: 'no-cache' });
    if (!res.ok) throw new Error();
    const ab = await res.arrayBuffer();
    buffers[name] = await ctx.decodeAudioData(ab);
    sound.loaded[name] = true;
  } catch {
    delete buffers[name];
    sound.loaded[name] = false;
  }
}

async function preload() {
  await Promise.all(Object.entries(soundMap).map(([n, d]) => loadOne(n, d)));
  sound.ready = true;
}

/** Recharge tous les fichiers (utile après remplacement d'un wav — UI Sound Lab). */
export async function reloadSounds() {
  if (!ctx) return;
  sound.ready = false;
  await preload();
}

/** À appeler sur le premier geste utilisateur (pointerdown global). */
export function initSoundOnGesture() {
  if (typeof window === 'undefined') return;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    preload();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
}

/** Joue un son d'interface (ou son fallback si le fichier n'existe pas encore). */
export function play(name) {
  if (!sound.enabled || !ctx) return;
  let def = soundMap[name];
  let buf = buffers[name];
  if (!buf && def?.fallback) {
    buf = buffers[def.fallback];
    def = soundMap[def.fallback];
  }
  if (!def || !buf) return;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.value = def.gain ?? 0.15;
  src.connect(gain).connect(ctx.destination);
  src.start();
}

export function toggleSound() {
  sound.enabled = !sound.enabled;
  try {
    localStorage.setItem('v2000_sound', sound.enabled ? '1' : '0');
  } catch {}
  // Réactiver donne un accusé immédiat ; couper reste silencieux, évidemment.
  if (sound.enabled) play('tick');
}
