<script>
  // UI Sound Lab — outil interne de sound design (docs/exploration/soundlist_ui_v1.md).
  // Déclencher chaque son, voir fichier + gain, ajuster le gain à la volée.
  // Les gains ajustés ici ne sont PAS sauvegardés : reporter les valeurs dans src/data/sounds.js.
  import { soundMap } from '../../data/sounds.js';
  import { sound, play, reloadSounds, initSoundOnGesture } from '../sound.svelte.js';

  const names = Object.keys(soundMap);

  // Copie réactive des gains (l'ajustement écrit directement dans soundMap).
  let gains = $state(Object.fromEntries(names.map((n) => [n, soundMap[n].gain])));

  function setGain(name, value) {
    gains[name] = value;
    soundMap[name].gain = value;
  }

  function trigger(name) {
    initSoundOnGesture();
    play(name);
  }
</script>

<div class="lab">
  <div class="head">
    <span class="note">outil interne — les gains ajustés ici sont à reporter dans <code>src/data/sounds.js</code></span>
    <button class="reload" onclick={() => reloadSounds()} title="recharger les fichiers après remplacement">↻ recharger</button>
  </div>

  <div class="rows">
    {#each names as name (name)}
      {@const def = soundMap[name]}
      {@const ok = sound.loaded[name] === true}
      <div class="row" class:missing={!ok}>
        <button class="fire" onclick={() => trigger(name)} title="jouer">▶</button>
        <div class="info">
          <div class="l1">
            <span class="name">{name}</span>
            <span class="status">{ok ? '' : 'absent'}</span>
          </div>
          <div class="l2">
            <span class="evt">{def.label}</span>
            <span class="file">{def.src}</span>
          </div>
        </div>
        <div class="gain">
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.01"
            value={gains[name]}
            oninput={(e) => setGain(name, Number(e.currentTarget.value))}
          />
          <span class="gv">{gains[name].toFixed(2)}</span>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .lab {
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--paper);
  }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 7px 10px;
    border-bottom: 1px solid var(--line);
    background: var(--panel);
  }
  .note { font-size: 10px; color: var(--mid); }
  .note code { font-family: inherit; color: var(--ink); }
  .reload {
    flex: none;
    font-size: 11px;
    padding: 3px 9px;
    border: 1px solid var(--ink);
    background: var(--win);
    transition: transform 60ms ease;
  }
  .reload:hover { background: var(--panel); }
  .reload:active { transform: translate(1px, 1px); }
  .rows {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-bottom: 1px solid var(--panel);
  }
  .row.missing { opacity: 0.75; }
  .fire {
    flex: none;
    width: 30px;
    height: 26px;
    border: 1.5px solid var(--ink);
    background: var(--win);
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 60ms ease;
  }
  .fire:hover { background: var(--panel); }
  .fire:active { transform: translate(1px, 1px); }
  .info { flex: 1; min-width: 0; }
  .l1 { display: flex; align-items: baseline; gap: 8px; }
  .name { font-size: 12.5px; font-weight: bold; letter-spacing: 0.03em; }
  .status { font-size: 9.5px; color: var(--mid); }
  .l2 {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 10px;
    color: var(--mid);
    white-space: nowrap;
    overflow: hidden;
  }
  .evt { overflow: hidden; text-overflow: ellipsis; }
  .file { flex: none; }
  .gain {
    flex: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .gain input { width: 90px; accent-color: var(--ink); }
  .gv {
    font-size: 10.5px;
    font-variant-numeric: tabular-nums;
    min-width: 30px;
    text-align: right;
  }
</style>
