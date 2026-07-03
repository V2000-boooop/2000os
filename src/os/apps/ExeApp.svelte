<script>
  // Le launcher — fenêtre d'un programme de la collection (dossier Jeux).
  // v1 : splash d'époque + message. Chaque .exe deviendra plus tard sa propre
  // expérience (fenêtrée ou parenthèse immersive, cf. docs/030_OS.md couche D).
  import { onMount } from 'svelte';
  import { byId } from '../../data/content.js';

  let { exeId } = $props();
  const exe = $derived(byId[exeId]);

  // Petit chargement d'époque avant d'afficher le message.
  let loading = $state(true);
  let bars = $state(0);
  const TOTAL = 14;

  onMount(() => {
    const t = setInterval(() => {
      bars += 1 + Math.floor(Math.random() * 3);
      if (bars >= TOTAL) {
        bars = TOTAL;
        clearInterval(t);
        setTimeout(() => (loading = false), 220);
      }
    }, 110);
    return () => clearInterval(t);
  });
</script>

<div class="exe">
  {#if exe}
    <div class="head">
      <span class="glyph">{exe.glyph}</span>
      <span class="id">
        <span class="name">{exe.name}</span>
        <span class="ver">{exe.version} {exe.year ? '· ' + exe.year : ''}</span>
      </span>
    </div>
    {#if loading}
      <div class="load">
        <div class="bar">
          {#each Array(TOTAL) as _, i}
            <i class:on={i < bars}></i>
          {/each}
        </div>
        <span class="lt">chargement…</span>
      </div>
    {:else}
      <pre class="msg">{exe.message}</pre>
    {/if}
  {/if}
</div>

<style>
  .exe {
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--paper);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--line);
    background: var(--panel);
  }
  .glyph { font-size: 22px; line-height: 1; }
  .id { display: flex; flex-direction: column; min-width: 0; }
  .name { font-size: 13px; font-weight: bold; letter-spacing: 0.04em; }
  .ver { font-size: 10px; color: var(--mid); }
  .load {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px;
  }
  .bar {
    display: flex;
    gap: 2px;
    padding: 3px;
    border: 1px solid var(--ink);
    background: var(--win);
  }
  .bar i {
    width: 9px;
    height: 12px;
    background: transparent;
  }
  .bar i.on { background: var(--ink); }
  .lt { font-size: 10.5px; color: var(--mid); }
  .msg {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-family: inherit;
    font-size: 12px;
    line-height: 1.7;
    color: var(--ink);
    white-space: pre-wrap;
    padding: 14px;
    animation: appear 150ms ease-out;
  }
  @keyframes appear {
    from { opacity: 0; }
    to { opacity: 1; }
  }
</style>
