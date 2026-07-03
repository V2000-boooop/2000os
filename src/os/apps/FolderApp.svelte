<script>
  // Le dossier : niveau 2 — c'est ici que l'univers se déplie (030_OS).
  import { byId, resolveChildren } from '../../data/content.js';
  import { openItem } from '../open.js';

  let { folderId } = $props();

  const folder = $derived(byId[folderId]);
  const items = $derived(folder ? resolveChildren(folder) : []);

  const glyphs = { folder: '📁', project: '📁', audio: '♪', note: '▤', image: '▦', stub: '▣' };
</script>

<div class="folder">
  {#if items.length === 0}
    <p class="empty">(vide — pour l'instant)</p>
  {/if}
  <div class="grid">
    {#each items as it (it.id)}
      <button class="item" ondblclick={() => openItem(it)} title="double-cliquer pour ouvrir">
        <span class="ic">{glyphs[it.kind] ?? '▪'}</span>
        <span class="nm">{it.name}</span>
        {#if it.meta?.state}<span class="st">{it.meta.state}</span>{/if}
      </button>
    {/each}
  </div>

  {#if folder?.questions?.length}
    <div class="questions">
      <div class="qh">? questions ouvertes</div>
      {#each folder.questions as q}
        <div class="q">· {q}</div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .folder {
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 100%;
  }
  .empty { color: var(--mid); font-size: 12px; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
    gap: 6px;
  }
  .item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 4px 8px;
    border: 1px solid transparent;
    text-align: center;
    transition: transform 70ms ease;
  }
  .item:hover { border-color: var(--line); background: rgba(127, 127, 120, 0.08); }
  .item:active { transform: scale(0.95); }
  .ic { font-size: 20px; line-height: 1; }
  .nm {
    font-size: 11px;
    word-break: break-all;
    max-width: 108px;
  }
  .st {
    font-size: 9.5px;
    color: var(--mid);
    border: 1px solid var(--line);
    padding: 0 4px;
  }
  .questions {
    margin-top: auto;
    border-top: 1px dashed var(--line);
    padding-top: 8px;
  }
  .qh {
    font-size: 10.5px;
    letter-spacing: 0.08em;
    color: var(--mid);
    margin-bottom: 4px;
  }
  .q { font-size: 12px; margin: 2px 0; }
</style>
