// Cache réactif des durées audio (chargées via les métadonnées, sans télécharger tout le fichier).

export const durations = $state({});

const pending = new Set();

export function requestDuration(item) {
  if (typeof window === 'undefined') return;
  if (durations[item.id] != null || pending.has(item.id)) return;
  pending.add(item.id);
  const a = new Audio();
  a.preload = 'metadata';
  a.onloadedmetadata = () => {
    durations[item.id] = a.duration;
    pending.delete(item.id);
  };
  a.onerror = () => pending.delete(item.id);
  a.src = item.src;
}

export function fmtDuration(s) {
  if (s == null || !isFinite(s)) return '';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}
