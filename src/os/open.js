// Ouvrir un item = ouvrir le bon lieu (cf. 030_OS : les applications sont des lieux).
// ctx optionnel : { ids } liste d'images/vidéos à feuilleter, { big } visionneuse grande.

import { openWindow } from './wm.svelte.js';
import { playTrack } from './player.svelte.js';

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
  }
}
