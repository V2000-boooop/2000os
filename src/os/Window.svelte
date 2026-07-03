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
  .win {
    position: absolute;
    display: flex;
    flex-direction: column;
    background: var(--win);
    border: 1.5px solid var(--ink);
    box-shadow: 3px 3px 0 rgba(35, 35, 31, 0.18);
    animation: pop 90ms ease-out;
    min-width: 220px;
  }
  .win.top {
    box-shadow: 5px 5px 0 rgba(35, 35, 31, 0.28);
  }
  .win.min {
    display: none;
  }
  @keyframes pop {
    from { transform: scale(0.97); opacity: 0.6; }
    to { transform: scale(1); opacity: 1; }
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 3px 6px 3px 9px;
    background: var(--panel);
    border-bottom: 1.5px solid var(--ink);
    cursor: grab;
    user-select: none;
    touch-action: none;
  }
  .top header {
    background: var(--ink);
    color: #fff;
  }
  header:active { cursor: grabbing; }
  .title {
    font-size: 12px;
    letter-spacing: 0.03em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ctl { display: flex; gap: 2px; }
  .ctl button {
    width: 22px;
    height: 18px;
    line-height: 1;
    border: 1px solid currentColor;
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 60ms ease;
  }
  .ctl button:hover { background: rgba(127, 127, 120, 0.25); }
  .ctl button:active { transform: translate(1px, 1px); }
  .body {
    flex: 1;
    overflow: auto;
    position: relative;
  }
</style>
