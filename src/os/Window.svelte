<script>
  import { wm, focusWindow, closeWindow, toggleMinimize } from './wm.svelte.js';

  let { win, children } = $props();

  const isTop = $derived(
    wm.windows.length > 0 && win.z === Math.max(...wm.windows.map((w) => w.z))
  );

  function startDrag(e) {
    if (e.target.closest('button')) return;
    e.preventDefault();
    focusWindow(win.id);
    const ox = e.clientX - win.x;
    const oy = e.clientY - win.y;
    const move = (ev) => {
      win.x = Math.round(ev.clientX - ox);
      win.y = Math.max(0, Math.round(ev.clientY - oy));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
</script>

<section
  class="win"
  class:top={isTop}
  class:min={win.minimized}
  style="left:{win.x}px; top:{win.y}px; width:{win.w}px; height:{win.h}px; z-index:{win.z}"
  onpointerdown={() => focusWindow(win.id)}
>
  <header onpointerdown={startDrag}>
    <span class="title">{win.title}</span>
    <span class="ctl">
      <button title="réduire" onclick={() => toggleMinimize(win.id)}>_</button>
      <button title="fermer" onclick={() => closeWindow(win.id)}>×</button>
    </span>
  </header>
  <div class="body">
    {@render children()}
  </div>
</section>

<style>
  /* Chrome rétro Win98/2000 (bevels argent + title-bar bleue dégradée),
     réimplémenté en scopé — pas de lib globale, offline, zéro clash scènes. */
  .win {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: #c0c0c0;
    padding: 3px;
    /* biseau sortant (outset) classique 98 */
    box-shadow:
      inset -1px -1px #0a0a0a,
      inset  1px  1px #ffffff,
      inset -2px -2px #808080,
      inset  2px  2px #dfdfdf,
      2px 3px 6px rgba(0, 0, 0, 0.35);
    animation: pop 90ms ease-out;
    min-width: 220px;
  }
  .win.top { box-shadow:
      inset -1px -1px #0a0a0a,
      inset  1px  1px #ffffff,
      inset -2px -2px #808080,
      inset  2px  2px #dfdfdf,
      3px 5px 12px rgba(0, 0, 0, 0.5);
  }
  .win.min { display: none; }
  @keyframes pop {
    from { transform: scale(0.97); opacity: 0.6; }
    to { transform: scale(1); opacity: 1; }
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 2px 2px 2px 7px;
    /* title-bar INACTIVE : gris */
    background: linear-gradient(90deg, #808080, #b5b5b5);
    color: #dedede;
    cursor: grab;
    user-select: none;
    touch-action: none;
  }
  .top header {
    /* title-bar ACTIVE : dégradé bleu Win2000 */
    background: linear-gradient(90deg, #000080 0%, #1084d0 100%);
    color: #fff;
  }
  header:active { cursor: grabbing; }
  .title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
  }
  .ctl { display: flex; gap: 2px; }
  .ctl button {
    width: 18px;
    height: 16px;
    line-height: 1;
    color: #000;
    background: #c0c0c0;
    border: none;
    box-shadow:
      inset -1px -1px #0a0a0a,
      inset  1px  1px #ffffff,
      inset -2px -2px #808080,
      inset  2px  2px #dfdfdf;
    font: 700 11px sans-serif;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 2px;
  }
  .ctl button:active {
    box-shadow:
      inset  1px  1px #0a0a0a,
      inset -1px -1px #ffffff,
      inset  2px  2px #808080,
      inset -2px -2px #dfdfdf;
    padding: 1px 0 0 1px;
  }
  .body {
    flex: 1;
    overflow: auto;
    position: relative;
    background: #c0c0c0;
  }
</style>
