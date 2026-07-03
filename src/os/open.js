// Ouvrir un item = ouvrir le bon lieu (cf. 030_OS : les applications sont des lieux).

import { openWindow } from './wm.svelte.js';
import { player } from './player.svelte.js';

export function openItem(item) {
  if (!item) return;
  switch (item.kind) {
    case 'folder':
    case 'project':
      openWindow({
        appId: 'folder',
        key: `folder:${item.id}`,
        title: `${item.name}/`,
        props: { folderId: item.id },
        w: item.kind === 'project' ? 500 : 460,
        h: item.kind === 'project' ? 400 : 340,
      });
      break;
    case 'audio':
      player.trackId = item.id;
      player.autoplay = true;
      player.caption = '';
      openWindow({ appId: 'player', key: 'player', title: '♪ lecteur', w: 330, h: 180 });
      break;
    case 'note':
      openWindow({ appId: 'note', key: `note:${item.id}`, title: item.name, props: { noteId: item.id }, w: 410, h: 270 });
      break;
    case 'image':
      openWindow({ appId: 'image', key: `img:${item.id}`, title: item.name, props: { itemId: item.id }, w: 460, h: 380 });
      break;
    case 'stub':
      openWindow({ appId: 'stub', key: `stub:${item.id}`, title: item.name, props: { message: item.message }, w: 360, h: 210 });
      break;
  }
}
