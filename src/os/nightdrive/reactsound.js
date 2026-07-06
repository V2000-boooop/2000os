// COUCHE SON RÉACTIVE (optionnelle) — complète worldsound.js sans le remplacer.
// worldsound.js reste la base (silence si absent, filename = branchement).
// Ici : ce que le <audio> HTML ne sait pas faire, via Web Audio API —
//   - variation pitch/gain/pan sur les one-shots (clics répétés = vivants)
//   - crossfade réel entre deux ambiances
//   - ducking en rampe douce (lowpass + gain) quand l'antenne parle
// MÊME CONTRAT : pas de fichier .wav/.mp3 -> silence, aucune erreur.
//
// Wiring (dans NightDrive.svelte, en plus/à la place des hooks existants) :
//   import { hit, bed, duck } from './reactsound.js';
//   hit('zone_pmu_ricard', { pitch: 0.6, pan: 0.3 });  // clic objet, vivant
//   bed('ambiance_barque');                             // ambiance crossfadée
//   duck(true);  // antenne parle -> le monde se fait petit ; duck(false) -> revient

const BASE = '/media/nightdrive/sons';
const AMB_VOL = 0.32;

let ctx = null;
let master = null;
const buffers = new Map();     // name -> AudioBuffer | null (null = confirmé absent)
const pending = new Map();     // name -> Promise

function ac() {
  if (ctx) return ctx;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  // déverrouillage iOS/Chrome au premier geste
  const unlock = () => { ctx.resume?.(); window.removeEventListener('pointerdown', unlock); };
  window.addEventListener('pointerdown', unlock, { once: true });
  return ctx;
}

// charge <name>.wav puis <name>.mp3 ; met null en cache si aucun (silence).
async function load(name) {
  if (buffers.has(name)) return buffers.get(name);
  if (pending.has(name)) return pending.get(name);
  const c = ac();
  if (!c) return null;
  const p = (async () => {
    for (const ext of ['wav', 'mp3']) {
      try {
        const res = await fetch(`${BASE}/${name}.${ext}`);
        if (!res.ok) continue;
        const buf = await c.decodeAudioData(await res.arrayBuffer());
        buffers.set(name, buf);
        return buf;
      } catch { /* essaie l'ext suivante */ }
    }
    buffers.set(name, null); // ni wav ni mp3 : silence définitif
    return null;
  })();
  pending.set(name, p);
  const r = await p;
  pending.delete(name);
  return r;
}

/** One-shot vivant : pitch/gain/pan (pitch en demi-tons, ±alea par défaut). */
export async function hit(name, opts = {}) {
  const c = ac();
  if (!c) return;
  const buf = await load(name);
  if (!buf) return; // silence
  const { gain = 0.9, pan = 0, pitch } = opts;
  const semis = pitch != null ? pitch : (Math.random() * 1.6 - 0.8); // léger alea
  const src = c.createBufferSource();
  src.buffer = buf;
  src.playbackRate.value = Math.pow(2, semis / 12);
  const g = c.createGain(); g.gain.value = gain;
  const pn = c.createStereoPanner ? c.createStereoPanner() : null;
  if (pn) { pn.pan.value = Math.max(-1, Math.min(1, pan)); src.connect(g).connect(pn).connect(master); }
  else src.connect(g).connect(master);
  src.start();
}

// ---- lit d'ambiance crossfadé + ducking en rampe ----
let bedNode = null;   // { src, gain, filter, name }
let bedName = null;
let ducked = false;

/** Ambiance de scène : crossfade doux avec la précédente. Silence si absente. */
export async function bed(name, vol = AMB_VOL) {
  if (name === bedName) return;
  const c = ac();
  if (!c) return;
  bedName = name;
  const buf = name ? await load(name) : null;
  if (bedName !== name) return; // une autre ambiance a été demandée entre-temps
  const old = bedNode;
  if (old) rampStop(old, 0.6);
  if (!buf) { bedNode = null; return; } // silence
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
  const filter = c.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = ducked ? 500 : 20000;
  const gain = c.createGain(); gain.gain.value = 0;
  src.connect(filter).connect(gain).connect(master);
  src.start();
  gain.gain.linearRampToValueAtTime(ducked ? 0 : vol, c.currentTime + 0.6);
  bedNode = { src, gain, filter, name, vol };
}

function rampStop(node, t) {
  try {
    const now = ac().currentTime;
    node.gain.gain.cancelScheduledValues(now);
    node.gain.gain.linearRampToValueAtTime(0, now + t);
    node.src.stop(now + t + 0.05);
  } catch {}
}

/** L'antenne parle -> lowpass + gain baissés en douceur ; false -> retour. */
export function duck(on) {
  if (on === ducked) return;
  ducked = on;
  const n = bedNode; if (!n) return;
  const now = ac().currentTime;
  n.gain.gain.linearRampToValueAtTime(on ? 0 : n.vol, now + 0.4);
  n.filter.frequency.linearRampToValueAtTime(on ? 500 : 20000, now + 0.4);
}

/** Volume général (0..1). */
export function setMaster(v) { if (master) master.gain.value = Math.max(0, Math.min(1, v)); }
