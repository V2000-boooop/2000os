// Ouvrir un item = ouvrir le bon lieu (cf. 030_OS : les applications sont des lieux).
// ctx optionnel : { ids } liste d'images/vidéos à feuilleter, { big } visionneuse grande.

import { openWindow } from './wm.svelte.js';
import { playTrack } from './player.svelte.js';
import { play } from './sound.svelte.js';

export function openItem(item, ctx = {}) {
  if (!item) return;
  switch (item.kind) {
    case 'folder':
    case 'project':
      openWindow({
        appId: 'folder',
        key: `folder:${item.id}`,
        title: `${item.name}/`,
        props: { folderId: item.id },
        w: 460,
        h: 340,
      });
      break;
    case 'audio':
      playTrack(item);
      break;
    case 'note':
      openWindow({ appId: 'note', key: `note:${item.id}`, title: item.name, props: { noteId: item.id }, w: 410, h: 270 });
      break;
    case 'image':
    case 'video': {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      const big = ctx.big === true;
      const w = big ? Math.min(820, vw - 80) : 460;
      const h = big ? Math.min(620, vh - 90) : 380;
      openWindow({
        appId: 'viewer',
        key: `view:${item.id}`,
        title: item.name,
        props: { itemId: item.id, ids: ctx.ids ?? [] },
        w, h,
        x: big ? Math.max(20, (vw - w) / 2) : undefined,
        y: big ? Math.max(10, (vh - h) / 2 - 20) : undefined,
      });
      break;
    }
    case 'stub':
      openWindow({ appId: 'stub', key: `stub:${item.id}`, title: item.name, props: { message: item.message }, w: 360, h: 210 });
      break;
    case 'exe':
      openWindow({ appId: 'exe', key: `exe:${item.id}`, title: item.name, props: { exeId: item.id }, w: 380, h: 240 });
      break;
    case 'game': {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      const w = Math.min(720, vw - 60), h = Math.min(460, vh - 90);
      openWindow({
        appId: 'game', key: `game:${item.id}`, title: item.name,
        props: { gameId: item.gameId ?? item.id }, w, h,
        x: Math.max(20, (vw - w) / 2), y: Math.max(10, (vh - h) / 2 - 20),
      });
      break;
    }
    case 'lab':
      openWindow({ appId: 'soundlab', key: 'soundlab', title: 'UI Sound Lab', w: 560, h: 470 });
      break;
    default:
      // L'OS ne sait pas ouvrir cet item : refus doux, sans punition.
      play('deny');
  }
}
