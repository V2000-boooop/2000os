<script>
  import { byId } from '../../data/content.js';

  let { noteId, unsaved = false } = $props();
  const note = $derived(byId[noteId]);
</script>

<div class="note">
  {#if note}
    <pre>{note.content}{#if unsaved}<span class="cursor">█</span>{/if}</pre>
  {:else}
    <pre class="missing">note introuvable</pre>
  {/if}
</div>

<style>
  .note {
    min-height: 100%;
    background: var(--paper);
    padding: 12px 14px;
  }
  pre {
    font-family: inherit;
    font-size: 12.5px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .missing { color: var(--mid); }
  .cursor {
    animation: blink 1.1s steps(1) infinite;
    color: var(--ink);
  }
  @keyframes blink { 50% { opacity: 0; } }
</style>
