<script>
  // Le bureau — niveau 1 : extrêmement simple, un ordinateur normal.
  // Règles : « la machine ne démarre jamais », « calme visuel, exubérance interactive ».
  import { onMount } from 'svelte';
  import { wm, focusWindow, toggleMinimize } from './wm.svelte.js';
  import { registry } from './apps/registry.js';
  import { desktopItems, byId, searchIndex } from '../data/content.js';
  import { openItem } from './open.js';
  import { restoreSession } from '../data/session.js';
  import { sound, play, initSoundOnGesture, toggleSound } from './sound.svelte.js';
  import Window from './Window.svelte';
  import { night, enterNight } from './nightdrive/night.svelte.js';

  // NIGHT DRIVE en différé (code-splitting) : le bureau démarre léger, le monde
  // n'est téléchargé qu'au besoin — préchargé dès que le navigateur est au repos,
  // donc invisible pour l'utilisateur. La chorégraphie D12 ne change pas.
  let NightDriveComp = $state(null);
  let ndLoading = null;
  function loadNightDrive() {
    if (!ndLoading) {
      ndLoading = import('./nightdrive/NightDrive.svelte').then((m) => {
        NightDriveComp = m.default;
      });
    }
    return ndLoading;
  }
  function startNight() {
    loadNightDrive(); // en parallèle de la chorégraphie (~6 s de marge)
    enterNight();
  }

  // Chorégraphie Night Drive : le bureau reste monté du début à la fin — il
  // s'efface et revient, mais son état (fenêtres, écoute, sélection) ne bouge pas.
  const ndAway = $derived(['migration', 'cabin', 'ignition'].includes(night.phase));
  const ndUnder = $derived(night.phase === 'drive' || night.phase === 'return-cabin');
  const ndBack = $derived(night.phase === 'return-dawn');

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
    // Préchargement de Night Drive quand le navigateur souffle (fallback 3 s).
    if ('requestIdleCallback' in window) requestIdleCallback(loadNightDrive);
    else setTimeout(loadNightDrive, 3000);
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

<main class="desk" class:away={ndAway} class:under={ndUnder} class:back={ndBack} onpointerdown={() => (selected = null)}>
  <!-- icônes : catégories naturelles (niveau 1) -->
  <div class="icons">
    {#each desktopItems as it, i (it.id)}
      <button
        class="dicon"
        style="--i:{i}"
        class:sel={selected === it.id}
        onpointerdown={(e) => {
          e.stopPropagation();
          // Du toucher, pas de l'action : select ne sonne qu'au changement de sélection.
          if (selected !== it.id) play('select');
          selected = it.id;
        }}
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

  <!-- NIGHT DRIVE — la porte vers la première Destination (D12).
       Icône d'app discrète façon écran d'accueil : elle s'allume quand la nuit est active. -->
  <button
    class="nightkey"
    class:on={night.phase !== 'off'}
    onclick={startNight}
    onpointerenter={loadNightDrive}
    disabled={night.busy || night.phase !== 'off'}
    title="night mode"
  >
    <span class="nk-icon">☾</span>
    <span class="nk-label">night mode</span>
  </button>

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

  <!-- la Destination — montée par-dessus le bureau, jamais à sa place -->
  {#if NightDriveComp}
    <NightDriveComp />
  {/if}
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

  /* ---- NIGHT DRIVE : la porte — icône d'app, discrète ---- */
  .nightkey {
    position: absolute;
    right: 20px;
    bottom: 52px;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: transparent;
    border: none;
    transition: transform 120ms ease;
  }
  .nk-icon {
    display: grid;
    place-items: center;
    width: 46px;
    height: 46px;
    font-size: 20px;
    color: #ffe8b0;
    text-shadow: 0 0 8px rgba(255, 232, 176, 0.55);
    background: linear-gradient(160deg, #162040 0%, #0c1226 55%, #070c1b 100%);
    border: 1px solid rgba(63, 227, 255, 0.32);
    border-radius: 11px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
    transition: border-color 200ms ease, box-shadow 200ms ease;
  }
  .nk-label {
    font-size: 9px;
    letter-spacing: 0.13em;
    color: var(--mid);
  }
  .nightkey:hover:not(:disabled) { transform: translateY(-2px); }
  .nightkey:hover:not(:disabled) .nk-icon {
    border-color: rgba(63, 227, 255, 0.8);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 12px rgba(63, 227, 255, 0.3);
  }
  .nightkey:active:not(:disabled) { transform: scale(0.93); }
  /* activée : l'icône reste allumée, comme une app en marche */
  .nightkey.on .nk-icon {
    border-color: rgba(63, 227, 255, 0.95);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 0 16px rgba(63, 227, 255, 0.55);
  }
  /* pendant la métamorphose elle reste visible : c'est la chorégraphie qui l'emmène */
  .nightkey:disabled { pointer-events: none; }

  /* ---- NIGHT DRIVE : chorégraphie du bureau ----
     Rien n'apparaît, tout se transforme : chaque élément part VERS la ville
     (point de fuite haut-droit) et en revient. Le bureau n'est jamais démonté. */
  .desk.away .dicon,
  .desk.away .nightkey {
    animation: nd-flyout 850ms cubic-bezier(0.5, -0.1, 0.8, 0.5) forwards;
    animation-delay: calc(var(--i, 0) * 130ms);
    pointer-events: none;
  }
  @keyframes nd-flyout {
    28% { transform: translate(7px, -5px) scale(1.05); opacity: 1; }
    100% { transform: translate(40vw, -16vh) scale(0.06) rotate(9deg); opacity: 0; }
  }
  .desk.away :global(.win) {
    animation: nd-fold 720ms cubic-bezier(0.55, 0, 0.7, 0.4) 320ms forwards;
    pointer-events: none;
  }
  /* les fenêtres se replient vers le bas : la boîte à gants est en dessous */
  @keyframes nd-fold {
    22% { transform: scale(1.02); opacity: 1; }
    100% { transform: translateY(42vh) scale(0.05); opacity: 0; }
  }
  .desk.away .taskbar {
    animation: nd-sink 620ms ease-in 1500ms forwards;
  }
  /* la barre des tâches plonge — le tableau de bord montera du même bord */
  @keyframes nd-sink { to { transform: translateY(120%); } }
  .desk.away .results { display: none; }

  /* nuit pleine : le bureau attend, invisible, intact (l'audio continue) */
  .desk.under .icons,
  .desk.under .nightkey,
  .desk.under :global(.win),
  .desk.under .taskbar,
  .desk.under .results { visibility: hidden; }

  /* le retour : chaque chose reprend exactement sa place */
  .desk.back .dicon,
  .desk.back .nightkey {
    animation: nd-flyin 780ms cubic-bezier(0.2, 0.6, 0.3, 1) backwards;
    animation-delay: calc(var(--i, 0) * 110ms);
  }
  @keyframes nd-flyin {
    from { transform: translate(40vw, -16vh) scale(0.06) rotate(9deg); opacity: 0; }
  }
  .desk.back :global(.win) {
    animation: nd-unfold 680ms cubic-bezier(0.2, 0.6, 0.3, 1) 320ms backwards;
  }
  @keyframes nd-unfold {
    from { transform: translateY(42vh) scale(0.05); opacity: 0; }
  }
  .desk.back .taskbar {
    animation: nd-rise 520ms ease-out backwards;
  }
  @keyframes nd-rise { from { transform: translateY(120%); } }
</style>
