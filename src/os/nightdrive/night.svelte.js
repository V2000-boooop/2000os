// NIGHT DRIVE — la première Destination (D12 : l'OS se métamorphose, jamais un « mode »).
// Ce module possède l'état de la métamorphose et sa chorégraphie temporelle.
// Le bureau reste MONTÉ pendant toute la nuit (caché, jamais détruit) :
// c'est ce qui garantit le retour à l'état exact — fenêtres, écoute, tout.
//
// Phases aller  : off → dusk → migration → cabin → ignition → drive
// Phases retour : drive → return-cabin → return-dawn → off
//
// v1 : la timeline n'est pas interruptible en cours de route (garde `busy`) —
// l'interruption réversible à tout instant est notée hors scope (cf. doc archi).

import { play } from '../sound.svelte.js';

export const night = $state({
  phase: 'off',
  busy: false, // métamorphose en cours : aucune autre bascule acceptée
});

let timers = [];

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

/** Déroule des étapes [phase, délai depuis l'étape précédente], puis libère. */
function schedule(steps) {
  let t = 0;
  for (const [phase, after] of steps) {
    t += after;
    timers.push(setTimeout(() => (night.phase = phase), t));
  }
  timers.push(setTimeout(() => (night.busy = false), t));
}

/** Prendre la route (~6,4 s, 4 actes). */
export function enterNight() {
  if (night.phase !== 'off' || night.busy) return;
  clearTimers();
  night.busy = true;
  play('ignition');               // le démarrage — son de Vincent, silence si absent (050)
  night.phase = 'dusk';           // acte 1 — la lumière change, rien ne bouge
  schedule([
    ['migration', 1000],          // acte 2 — les icônes migrent, les fenêtres se replient
    ['cabin', 2400],              // acte 3 — le tableau de bord monte : on est assis
    ['ignition', 2000],           // acte 4 — contact : la ville s'allume, la radio vit
    ['drive', 1000],              // état stable : la nuit est à nous
  ]);
}

/** Couper le contact (~3,1 s) — chorégraphie inverse, plus courte (règle du registre). */
export function exitNight() {
  if (night.phase !== 'drive' || night.busy) return;
  clearTimers();
  night.busy = true;
  night.phase = 'return-cabin';   // l'habitacle s'efface, la ville s'éteint
  schedule([
    ['return-dawn', 1400],        // la nuit se lève, chaque chose reprend sa place
    ['off', 1700],
  ]);
}
