<script>
  // La visionneuse — feuilleter les images et vidéos d'un dossier,
  // comme un vieux dossier d'images retrouvé (itération « Médias »).
  import { byId } from '../../data/content.js';

  let { itemId, ids = [] } = $props();

  const list = ids.length > 0 ? ids : [itemId];
  let idx = $state(Math.max(0, list.indexOf(itemId)));

  const item = $derived(byId[list[idx]]);
  const canPrev = $derived(idx > 0);
  const canNext = $derived(idx < list.length - 1);

  function step(d) {
    idx = Math.min(Math.max(idx + d, 0), list.length - 1);
  }
</script>

<div class="viewer">
  <div class="stage">
    {#if item?.kind === 'video'}
      <!-- svelte-ignore a11y_media_has_caption -->
      <video src={item.src} controls preload="metadata"></video>
    {:else if item}
      <img src={item.src} alt={item.name} draggable="false" />
    {/if}
    {#if canPrev}
      <button class="nav prev" onclick={() => step(-1)} title="précédente">‹</button>
    {/if}
    {#if canNext}
      <button class="nav next" onclick={() => step(1)} title="suivante">›</button>
    {/if}
  </div>
  <div class="strip">
    <span class="nm">{item?.name}{#if item?.fav}<span class="fav"> ★</span>{/if}</span>
    {#if list.length > 1}
      <span class="pos">{idx + 1}/{list.length}</span>
    {/if}
  </div>
</div>

<style>
  .viewer {
    height: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
    background: #d8d7cf;
  }
  .stage {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }
  img, video {
    max-width: 100%;
    max-height: 100%;
    border: 1px solid var(--ink);
    background: #fff;
    user-select: none;
  }
  .nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 48px;
    font-size: 22px;
    line-height: 1;
    border: 1px solid var(--ink);
    background: rgba(251, 251, 248, 0.88);
    transition: transform 60ms ease;
  }
  .nav:hover { background: var(--win); }
  .nav:active { transform: translateY(-50%) scale(0.93); }
  .prev { left: 8px; }
  .next { right: 8px; }
  .strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 5px 10px;
    border-top: 1px solid var(--line);
    background: var(--panel);
  }
  .nm {
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .fav { opacity: 0.75; }
  .pos {
    flex: none;
    font-size: 10.5px;
    color: var(--mid);
    font-variant-numeric: tabular-nums;
  }
</style>
