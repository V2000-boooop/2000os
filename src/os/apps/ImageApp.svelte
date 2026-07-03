<script>
  import { byId } from '../../data/content.js';

  let { itemId } = $props();
  const item = $derived(byId[itemId]);
</script>

<div class="viewer">
  {#if item}
    <img src={item.src} alt={item.name} draggable="false" />
    {#if item.meta?.project || item.meta?.origin}
      <div class="cap">{item.meta?.project ?? ''} {item.meta?.origin ?? ''}</div>
    {/if}
  {/if}
</div>

<style>
  .viewer {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px;
    background: #d8d7cf;
  }
  img {
    max-width: 100%;
    max-height: 300px;
    border: 1px solid var(--ink);
    background: #fff;
    user-select: none;
  }
  .cap { font-size: 10.5px; color: var(--mid); }
</style>
