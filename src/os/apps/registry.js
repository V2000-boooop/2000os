// Registre des applications — chaque app est un lieu (docs/030_OS.md).
// Ajouter une app = l'importer ici et lui donner un id.

import FolderApp from './FolderApp.svelte';
import NoteApp from './NoteApp.svelte';
import PlayerApp from './PlayerApp.svelte';
import ViewerApp from './ViewerApp.svelte';
import StubApp from './StubApp.svelte';
import ExeApp from './ExeApp.svelte';

export const registry = {
  folder: { component: FolderApp },
  note: { component: NoteApp },
  player: { component: PlayerApp },
  viewer: { component: ViewerApp },
  stub: { component: StubApp },
  exe: { component: ExeApp },
};
