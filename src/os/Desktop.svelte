<script>
  // Le bureau — niveau 1 : extrêmement simple, un ordinateur normal.
  // Règles : « la machine ne démarre jamais », « calme visuel, exubérance interactive ».
  import { onMount } from 'svelte';
  import { wm, focusWindow, toggleMinimize } from './wm.svelte.js';
  import { registry } from './apps/registry.js';
  import { desktopItems, byId, searchIndex } from '../data/content.js';
  import { openItem } from './open.js';
  import { restoreSession } from '../data/session.js';
  import { sound, initSoundOnGesture, toggleSound } from './sound.svelte.js';
  import Window from './Window.svelte';

  let selected = $state(null);
  let query = $state('');
  let now = $state(new Date());

  const matches = $derived(
    query.trim().length >= 2
      ? searchIndex
          .filter((e) => e.name.toLowerCase().includes(query.trim().toLowerCase()))
          .slice(0, 8)
      : []
  );

  const clock = $derived(
    now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );

  onMount(() => {
    restoreSession();
    const t = setInterval(() => (now = new Date()), 20000);
    // Le son ne peut démarrer qu'après un premier geste (règle navigateur).
    window.addEventListener('pointerdown', initSoundOnGesture, { once: false });
    return () => {
      clearInterval(t);
      window.removeEventListener('pointerdown', initSoundOnGesture);
    };
  });

  function openResult(id) {
    openItem(byId[id]);
    query = '';
  }

  function taskbarClick(win) {
    if (win.minimized) {
      toggleMinimize(win.id);
    } else if (win.z === Math.max(...wm.windows.map((w) => w.z))) {
      toggleMinimize(win.id);
    } else {
      focusWindow(win.id);
    }
  }
</script>

<main class="desk" onpointerdown={() => (selected = null)}>
  <!-- icônes : catégories naturelles (niveau 1) -->
  <div class="icons">
    {#each desktopItems as it (it.id)}
      <button
        class="dicon"
        class:sel={selected === it.id}
        onpointerdown={(e) => { e.stopPropagation(); selected = it.id; }}
        ondblclick={() => openItem(byId[it.id])}
      >
        <span class="glyph">{it.glyph}</span>
        <span class="label">{it.name}</span>
      </button>
    {/each}
  </div>

  <!-- fenêtres -->
  {#each wm.windows as win (win.id)}
    {@const App = registry[win.appId].component}
    <Window {win}>
      <App {...win.props} />
    </Window>
  {/each}

  <!-- résultats de recherche -->
  {#if matches.length > 0}
    <div class="results">
      {#each matches as m (m.id)}
        <button class="res" onclick={() => openResult(m.id)}>
          <span class="rn">{m.name}</span>
          <span class="rp">{m.path}</span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- barre des tâches -->
  <footer class="taskbar">
    <span class="brand">VINCENT 2000</span>
    <div class="tabs">
      {#each wm.windows as win (win.id)}
        <button class="tab" class:dim={win.minimized} onclick={() => taskbarClick(win)}>
          {win.title}
        </button>
      {/each}
    </div>
    <input
      class="search"
      type="text"
      placeholder="⌕ rechercher dans l'atelier…"
      bind:value={query}
      spellcheck="false"
    />
    <button class="mute" onclick={toggleSound} title={sound.enabled ? 'couper le son' : 'activer le son'}>
      {sound.enabled ? '🔊' : '🔇'}
    </button>
    <span class="clock">{clock}</span>
  </footer>
</main>

<style>
  .desk {
    position: fixed;
    inset: 0;
    overflow: hidden;
    background:
      radial-gradient(circle at 62% 38%, rgba(255, 255, 253, 0.5) 0%, transparent 55%),
      var(--desk);
  }

  /* ---- icônes ---- */
  .icons {
    position: absolute;
    top: 18px;
    left: 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    z-index: 1;
  }
  .dicon {
    width: 92px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 8px 4px 6px;
    border: 1px solid transparent;
    transition: transform 70ms ease;
  }
  .dicon:hover { border-color: var(--line); }
  .dicon:active { transform: scale(0.94); }
  .dicon.sel { background: var(--sel); border-color: var(--ink); }
  .glyph { font-size: 24px; line-height: 1; }
  .label { font-size: 11px; }

  /* ---- recherche ---- */
  .results {
    position: absolute;
    right: 10px;
    bottom: 40px;
    width: 340px;
    max-width: calc(100vw - 20px);
    background: var(--win);
    border: 1.5px solid var(--ink);
    box-shadow: 4px 4px 0 rgba(35, 35, 31, 0.22);
    z-index: 99999;
  }
  .res {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    padding: 6px 10px;
    text-align: left;
    border-bottom: 1px solid var(--panel);
  }
  .res:hover { background: var(--panel); }
  .rn { font-size: 12px; }
  .rp {
    font-size: 10px;
    color: var(--mid);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ---- barre des tâches ---- */
  .taskbar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 34px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    background: var(--panel);
    border-top: 1.5px solid var(--ink);
    z-index: 99998;
  }
  .brand {
    font-size: 11px;
    letter-spacing: 0.12em;
    padding: 2px 8px;
    background: var(--ink);
    color: #fff;
    user-select: none;
  }
  .tabs {
    display: flex;
    gap: 4px;
    overflow-x: auto;
    flex: 1;
    min-width: 0;
  }
  .tab {
    font-size: 11px;
    padding: 3px 9px;
    border: 1px solid var(--line);
    background: var(--win);
    white-space: nowrap;
    transition: transform 60ms ease;
  }
  .tab:active { transform: translateY(1px); }
  .tab.dim { color: var(--mid); background: transparent; }
  .search {
    width: 220px;
    padding: 4px 8px;
    font-family: inherit;
    font-size: 11.5px;
    border: 1px solid var(--ink);
    background: var(--win);
    outline: none;
  }
  .search:focus { box-shadow: 2px 2px 0 rgba(35, 35, 31, 0.2); }
  .mute {
    flex: none;
    font-size: 13px;
    padding: 2px 4px;
    opacity: 0.8;
    transition: transform 60ms ease;
  }
  .mute:hover { opacity: 1; }
  .mute:active { transform: scale(0.9); }
  .clock {
    font-size: 11.5px;
    color: var(--mid);
    user-select: none;
  }
</style>
