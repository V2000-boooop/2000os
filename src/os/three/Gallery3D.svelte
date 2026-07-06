<script>
  // Galerie 3D : liste tous les .glb déclarés dans /media/3d/manifest.json
  // et en affiche un aperçu interactif. Régénère le manifest avec :
  //   node tools/scan_3d.mjs
  import { onMount } from 'svelte';
  import Scene3D from './Scene3D.svelte';

  let items = $state([]);
  let state = $state('load'); // load | ok | empty | error

  onMount(async () => {
    try {
      const r = await fetch('/media/3d/manifest.json', { cache: 'no-store' });
      if (!r.ok) throw new Error('manifest absent');
      const data = await r.json();
      items = Array.isArray(data) ? data : (data.models ?? []);
      state = items.length ? 'ok' : 'empty';
    } catch (e) {
      state = 'error';
    }
  });
</script>

{#if state === 'load'}
  <p class="g-msg">lecture du manifest…</p>
{:else if state === 'empty' || state === 'error'}
  <p class="g-msg">
    Aucun modèle. Dépose des <code>.glb</code> dans <code>public/media/3d/</code>
    puis lance <code>node tools/scan_3d.mjs</code>.
  </p>
{:else}
  <div class="grid">
    {#each items as m}
      <div class="cell">
        <Scene3D client:visible src={'/media/3d/' + m.file} height={260} controls label={m.name || m.file} />
      </div>
    {/each}
  </div>
{/if}

<style>
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
  .cell { background: #070912; border: 1px solid #1c2136; }
  .g-msg { font: 13px monospace; color: #8fa0ff; }
  .g-msg code { color: #cbd2ff; }
</style>
