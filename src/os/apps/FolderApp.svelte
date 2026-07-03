<script>
  // Le dossier : niveau 2. Les sons s'y écoutent directement, comme dans
  // une discothèque personnelle (itérations « Sons »).
  import { byId, resolveChildren } from '../../data/content.js';
  import { openItem } from '../open.js';
  import { player, playTrack, playQueue } from '../player.svelte.js';
  import { durations, requestDuration, fmtDuration } from '../durations.svelte.js';

  let { folderId } = $props();

  const folder = $derived(byId[folderId]);
  const items = $derived(folder ? resolveChildren(folder) : []);
  const soundItems = $derived(items.filter((it) => it.kind === 'audio'));
  const otherItems = $derived(items.filter((it) => it.kind !== 'audio'));

  $effect(() => {
    soundItems.forEach(requestDuration);
  });

  function playAll() {
    playQueue(soundItems, folder.name);
  }

  // Double-clic sur un sous-dossier : l'ouvrir — et s'il contient des sons,
  // lancer directement la lecture du premier.
  function openFolderItem(it) {
    openItem(it);
    if (it.kind === 'folder' || it.kind === 'project') {
      const sounds = resolveChildren(it).filter((k) => k.kind === 'audio');
      if (sounds.length > 0) playQueue(sounds, it.name);
    }
  }

  const glyphs = { folder: '📁', project: '📁', note: '▤', image: '▦', stub: '▣' };
</script>

<div class="folder">
  {#if items.length === 0}
    <p class="empty">(vide — pour l'instant)</p>
  {/if}

  {#if otherItems.length > 0}
    <div class="grid">
      {#each otherItems as it (it.id)}
        <button class="item" ondblclick={() => openFolderItem(it)} title="double-cliquer pour ouvrir">
          <span class="ic">{glyphs[it.kind] ?? '▪'}{#if it.fav}<span class="favb">★</span>{/if}</span>
          <span class="nm">{it.name}</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if soundItems.length > 0}
    <div class="listhead">
      <button class="playall" onclick={playAll} title="enchaîner tous les sons du dossier">
        ▶ lire le dossier
      </button>
      <span class="count">{soundItems.length} son{soundItems.length > 1 ? 's' : ''}</span>
    </div>
    <div class="list">
      {#each soundItems as it (it.id)}
        {@const isCurrent = player.trackId === it.id}
        {@const isPlaying = isCurrent && player.playing}
        <div class="row" class:current={isCurrent}>
          <button class="play" onclick={() => playTrack(it, { list: soundItems, label: folder.name })} title={isPlaying ? 'pause' : 'écouter'}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button class="name" onclick={() => isCurrent || playTrack(it, { list: soundItems, label: folder.name })}>
            {it.name}
          </button>
          {#if it.fav}<span class="fav" title="collection personnelle">★</span>{/if}
          {#if isPlaying}
            <span class="eq"><i></i><i></i><i></i></span>
          {/if}
          <span class="dur">{fmtDuration(durations[it.id])}</span>
        </div>
      {/each}
    </div>
  {/if}

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
    gap: 8px;
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
  .ic { font-size: 20px; line-height: 1; position: relative; }
  .nm { font-size: 11px; word-break: break-all; max-width: 108px; }
  .favb {
    position: absolute;
    top: -5px;
    right: -12px;
    font-size: 10px;
    color: var(--ink);
  }
  .fav {
    flex: none;
    font-size: 11px;
    color: var(--ink);
    opacity: 0.75;
    user-select: none;
  }

  /* ---- liste des sons : écoute directe ---- */
  .listhead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  .playall {
    font-size: 11px;
    padding: 3px 10px;
    border: 1px solid var(--ink);
    background: var(--win);
    transition: transform 60ms ease;
  }
  .playall:hover { background: var(--panel); }
  .playall:active { transform: translate(1px, 1px); }
  .count { font-size: 10.5px; color: var(--mid); }

  .list {
    display: flex;
    flex-direction: column;
    border-top: 1px solid var(--panel);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 4px;
    border-bottom: 1px solid var(--panel);
  }
  .row:hover { background: rgba(127, 127, 120, 0.08); }
  .row.current { background: rgba(127, 127, 120, 0.12); }
  .play {
    width: 26px;
    height: 22px;
    flex: none;
    border: 1px solid var(--ink);
    background: var(--win);
    font-size: 11px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 60ms ease;
  }
  .play:hover { background: var(--panel); }
  .play:active { transform: translate(1px, 1px); }
  .name {
    flex: 1;
    text-align: left;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 2px 0;
  }
  .dur {
    flex: none;
    font-size: 10.5px;
    color: var(--mid);
    min-width: 34px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .eq {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 12px;
    flex: none;
  }
  .eq i {
    width: 3px;
    background: var(--ink);
    animation: eq 500ms ease-in-out infinite alternate;
  }
  .eq i:nth-child(1) { height: 60%; animation-delay: -120ms; }
  .eq i:nth-child(2) { height: 100%; animation-delay: -320ms; }
  .eq i:nth-child(3) { height: 40%; animation-delay: -80ms; }
  @keyframes eq {
    from { transform: scaleY(0.4); }
    to { transform: scaleY(1); }
  }

  .questions {
    margin-top: auto;
    border-top: 1px dashed var(--line);
    padding-top: 8px;
  }
  .qh { font-size: 10.5px; letter-spacing: 0.08em; color: var(--mid); margin-bottom: 4px; }
  .q { font-size: 12px; margin: 2px 0; }
</style>
