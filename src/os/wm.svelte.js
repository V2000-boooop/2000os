// Window manager — cœur de la couche A (châssis), cf. docs/030_OS.md.
// État global réactif (Svelte 5 runes). Une fenêtre = { id, appId, title, key,
// x, y, w, h, z, minimized, props }.

import { play } from './sound.svelte.js';

let nextId = 1;

export const wm = $state({
  windows: [],
  topZ: 10,
});

export function openWindow(def) {
  // key = identité logique : rouvrir la même chose focus la fenêtre existante.
  if (def.key) {
    const existing = wm.windows.find((w) => w.key === def.key);
    if (existing) {
      existing.minimized = false;
      focusWindow(existing.id);
      play('tick');
      return existing.id;
    }
  }
  play(def.appId === 'exe' ? 'launch' : 'open');
  const id = nextId++;
  const n = wm.windows.length;
  wm.windows.push({
    id,
    appId: def.appId,
    title: def.title ?? def.appId,
    key: def.key ?? null,
    x: def.x ?? 140 + (n % 6) * 34,
    y: def.y ?? 70 + (n % 6) * 30,
    w: def.w ?? 440,
    h: def.h ?? 330,
    z: ++wm.topZ,
    minimized: false,
    props: def.props ?? {},
  });
  return id;
}

export function closeWindow(id) {
  const i = wm.windows.findIndex((w) => w.id === id);
  if (i >= 0) {
    wm.windows.splice(i, 1);
    play('close');
  }
}

export function focusWindow(id) {
  const w = wm.windows.find((w) => w.id === id);
  if (w) w.z = ++wm.topZ;
}

export function toggleMinimize(id) {
  const w = wm.windows.find((w) => w.id === id);
  if (!w) return;
  if (w.minimized) {
    w.minimized = false;
    w.z = ++wm.topZ;
    play('restore'); // fallback automatique sur 'minimize' tant que restore.wav n'existe pas
  } else {
    w.minimized = true;
    play('minimize');
  }
}
