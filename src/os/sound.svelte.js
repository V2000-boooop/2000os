// Moteur sonore de l'interface (docs/050_SON.md).
// Règle : le bureau est calme, les interactions sont exubérantes — le son est
// discret, jamais envahissant, et coupable d'un clic (bouton dans la barre).
// Le navigateur n'autorise l'audio qu'après un geste : initSoundOnGesture().

import { soundMap } from '../data/sounds.js';

export const sound = $state({
  enabled: true,
  ready: false,
});

// Préférence mémorisée.
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('v2000_sound') === '0') sound.enabled = false;
  } catch {}
}

let ctx = null;
const buffers = {};

async function preload() {
  await Promise.all(
    Object.entries(soundMap).map(async ([name, def]) => {
      try {
        const res = await fetch(def.src);
        const ab = await res.arrayBuffer();
        buffers[name] = await ctx.decodeAudioData(ab);
      } catch {}
    })
  );
  sound.ready = true;
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

/** Joue un son d'interface, si activé et prêt. Silencieux sinon. */
export function play(name) {
  if (!sound.enabled || !ctx) return;
  const def = soundMap[name];
  const buf = buffers[name];
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
}
