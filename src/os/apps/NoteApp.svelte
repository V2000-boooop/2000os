<script>
  // Le bloc-notes — lire les notes de travail comme sur un vieil ordinateur.
  import { byId } from '../../data/content.js';

  let { noteId, unsaved = false } = $props();
  const note = $derived(byId[noteId]);
</script>

<div class="pad">
  <div class="menubar">
    <span>fichier</span>
    <span>édition</span>
    <span>?</span>
  </div>
  <div class="sheet">
    {#if note}
      <pre>{note.content}{#if unsaved}<span class="cursor">█</span>{/if}</pre>
    {:else}
      <pre class="missing">note introuvable</pre>
    {/if}
  </div>
  {#if note?.meta?.date || unsaved}
    <div class="status">
      <span>{unsaved ? 'modifié — non enregistré' : ''}</span>
      <span>{note?.meta?.date ?? ''}</span>
    </div>
  {/if}
</div>

<style>
  .pad {
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .menubar {
    display: flex;
    gap: 14px;
    padding: 3px 10px;
    font-size: 11px;
    color: var(--mid);
    background: var(--panel);
    border-bottom: 1px solid var(--line);
    user-select: none;
  }
  .menubar span { cursor: default; }
  .menubar span:hover { color: var(--ink); }
  .sheet {
    flex: 1;
    min-height: 0;
    overflow: auto;
    background: var(--paper);
    padding: 12px 14px;
  }
  pre {
    font-family: inherit;
    font-size: 12.5px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .missing { color: var(--mid); }
  .cursor {
    animation: blink 1.1s steps(1) infinite;
    color: var(--ink);
  }
  @keyframes blink { 50% { opacity: 0; } }
  .status {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 3px 10px;
    font-size: 10px;
    color: var(--mid);
    background: var(--panel);
    border-top: 1px solid var(--line);
  }
</style>
