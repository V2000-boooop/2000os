// LE MONDE SONORE DE NIGHT DRIVE — le contrat de sons_nightdrive.md, activé.
//
// Règle 050 : le nom du fichier EST le branchement. Pas de fichier = SILENCE,
// jamais de fallback. Chaque son tente <name>.wav puis <name>.mp3 (les deux
// acceptés partout) ; si aucun n'existe, rien ne se passe — le silence fait
// partie de l'identité. Vincent dépose ses fichiers dans public/media/nightdrive/sons/
// et ils prennent vie tout seuls, aux hooks déjà posés ici.
//
//   ambiance_<scene>.mp3   boucle basse d'une scène (quai, cathedrale, barque…)
//   porte_<scene>.wav      passage en entrant dans une scène
//   ressortir.wav          un seul son générique pour tous les « ▾ ressortir »/Échap
//   univers_dark|ange.mp3  boucle d'un changement de dimension (vitraux)
//   zone_<scene>_<zone>.wav son franc d'un objet cliqué

const BASE = '/media/nightdrive/sons';

// Volume de repos des ambiances : très bas (D13 — elles ne rivalisent jamais
// avec l'antenne). Ducké quasi à zéro quand un son de l'OS passe.
const AMB_VOL = 0.32;

// Un one-shot déjà constaté absent n'est plus re-tenté (évite de spammer des
// 404 à chaque clic). Les boucles ne sont pas cachées (changements rares).
const missingOneShot = new Set();

function canAudio() {
  return typeof Audio !== 'undefined';
}

/** Son ponctuel d'objet/passage : tente .wav puis .mp3, silence si aucun. */
export function sfx(name, vol = 0.9) {
  if (!canAudio() || missingOneShot.has(name)) return;
  const a = new Audio(`${BASE}/${name}.wav`);
  a.volume = vol;
  a.onerror = () => {
    const b = new Audio(`${BASE}/${name}.mp3`);
    b.volume = vol;
    b.onerror = () => missingOneShot.add(name); // ni wav ni mp3 : on abandonne
    b.play().catch(() => {});
  };
  a.play().catch(() => {});
}

/** Boucle contrôlable (ambiance, univers). Renvoie { setVol, stop }. */
export function loop(name, vol = AMB_VOL) {
  if (!canAudio()) return { setVol() {}, stop() {} };
  let cur = new Audio(`${BASE}/${name}.wav`);
  cur.loop = true;
  cur.volume = vol;
  cur.onerror = () => {
    const b = new Audio(`${BASE}/${name}.mp3`);
    b.loop = true;
    b.volume = vol;
    b.onerror = () => {}; // aucun fichier : la boucle reste muette, sans erreur
    cur = b;
    b.play().catch(() => {});
  };
  cur.play().catch(() => {});
  return {
    setVol(v) { try { cur.volume = v; } catch {} },
    stop() { try { cur.pause(); } catch {} },
  };
}

// ---- passages nommés (sucre au-dessus de sfx) ----
export const porte = (scene) => sfx(`porte_${scene}`);
export const ressortir = () => sfx('ressortir');
export const zoneSfx = (scene, zone) => sfx(`zone_${scene}_${zone}`);

// ---- le lit d'ambiance : UNE seule boucle active, celle de la scène courante,
// duckée quand l'antenne parle (D13 : si un son de l'OS joue, le monde se fait petit).
let amb = null;
let ambScene = null;
let ambDuck = false;

export function setAmbiance(scene) {
  if (scene === ambScene) return;
  amb?.stop();
  amb = null;
  ambScene = scene;
  if (scene) amb = loop(`ambiance_${scene}`, ambDuck ? 0 : AMB_VOL);
}

/** L'antenne prend la parole → l'ambiance s'efface (et revient quand elle se tait). */
export function duckAmbiance(on) {
  if (on === ambDuck) return;
  ambDuck = on;
  amb?.setVol(on ? 0 : AMB_VOL);
}
