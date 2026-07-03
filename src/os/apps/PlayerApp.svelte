<script>
  // Le lecteur — app signature (030_OS). Version fenêtrée v1 ;
  // le mode « Winamp vivant » (parenthèse) viendra plus tard.
  import { onMount } from 'svelte';
  import { player, bindAudio, unbindAudio } from '../player.svelte.js';
  import { byId } from '../../data/content.js';

  let audio = $state(null);
  let progress = $state(0);

  const track = $derived(byId[player.trackId]);

  onMount(() => {
    return () => unbindAudio();
  });

  $effect(() => {
    if (!audio) return;
    bindAudio(audio);
    if (!track) return;
    if (!audio.src.endsWith(track.src)) {
      audio.src = track.src;
      progress = 0;
    }
    if (player.autoplay) {
      player.autoplay = false;
      audio.play().catch(() => {});
    }
  });

  function toggle() {
    if (!audio || !track) return;
    player.caption = '';
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function onTime() {
    if (audio?.duration) progress = audio.currentTime / audio.duration;
  }

  function seek(e) {
    if (!audio?.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  }
</script>

<div class="player">
  {#if track}
    <div class="tt">{track.name}</div>
    <button class="wave" class:on={player.playing} onclick={seek} title="naviguer dans le morceau">
      {#each Array(28) as _, i}
        <i style="--i:{i}; --h:{18 + ((i * 37) % 62)}%"></i>
      {/each}
      <span class="prog" style="width:{progress * 100}%"></span>
    </button>
    <div class="row">
      <button class="pp" onclick={toggle}>{player.playing ? '⏸' : '▶'}</button>
      <span class="meta">{player.caption}</span>
    </div>
  {:else}
    <div class="tt idle">— aucun son chargé —</div>
  {/if}
  <audio
    bind:this={audio}
    onplay={() => (player.playing = true)}
    onpause={() => (player.playing = false)}
    onended={() => (player.playing = false)}
    ontimeupdate={onTime}
  ></audio>
</div>

<style>
  .player {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 100%;
  }
  .tt {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tt.idle { color: var(--mid); }
  .wave {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 44px;
    padding: 4px;
    border: 1px solid var(--line);
    background: var(--paper);
    overflow: hidden;
    cursor: pointer;
  }
  .wave i {
    flex: 1;
    background: var(--mid);
    height: var(--h);
    transition: height 120ms ease;
  }
  .wave.on i {
    animation: dance 700ms ease-in-out infinite alternate;
    animation-delay: calc(var(--i) * -53ms);
  }
  @keyframes dance {
    from { height: calc(var(--h) * 0.55); }
    to { height: calc(var(--h) * 1.25); }
  }
  .prog {
    position: absolute;
    inset: 0 auto 0 0;
    background: rgba(35, 35, 31, 0.14);
    pointer-events: none;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pp {
    width: 34px;
    height: 26px;
    border: 1.5px solid var(--ink);
    background: var(--win);
    font-size: 13px;
    transition: transform 60ms ease;
  }
  .pp:hover { background: var(--panel); }
  .pp:active { transform: translate(1px, 1px); }
  .meta {
    font-size: 10.5px;
    color: var(--mid);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
