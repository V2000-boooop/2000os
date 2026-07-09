<script>
  // L'ÉMETTEUR — V2000 TX (D13 : le lecteur est un émetteur).
  // v1 : fader ATELIER ⟷ TOI, ÉJECT, ON AIR, VU réel, transports.
  // Pas encore de moteur d'émission génératif : au repos la machine veille
  // côté ATELIER (indicatif affiché). Comportement cible :
  // docs/exploration/emetteur/comportement_vivant.md.
  import { onMount } from 'svelte';
  import { player, bindAudio, unbindAudio, step, trackEnded, eject } from '../player.svelte.js';
  import { byId } from '../../data/content.js';
  import { durations, fmtDuration } from '../durations.svelte.js';

  const STATION = 'VINCENT 2000 RADIO';
  const FREQ = '93.00';

  let audio = $state(null);
  let progress = $state(0);
  let current = $state(0);
  let vu = $state(0); // 0..1 — niveau réel mesuré sur l'antenne

  const track = $derived(byId[player.trackId]);
  const engaged = $derived(!!track); // antenne prise → fader côté TOI
  const hasQueue = $derived(player.queue.length > 1);
  const canPrev = $derived(hasQueue && player.qIndex > 0);
  const canNext = $derived(hasQueue && player.qIndex < player.queue.length - 1);
  const vuDeg = $derived(-44 + vu * 82); // course de l'aiguille ANTENNE

  // ---- VU réel : un analyseur branché sur l'élément <audio> ----
  let mCtx = null;
  let analyser = null;
  let mData = null;
  let raf = 0;

  function ensureMeter() {
    if (mCtx || !audio || typeof window === 'undefined') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      mCtx = new AC();
      const src = mCtx.createMediaElementSource(audio);
      analyser = mCtx.createAnalyser();
      analyser.fftSize = 512;
      mData = new Uint8Array(analyser.fftSize);
      src.connect(analyser);
      analyser.connect(mCtx.destination);
    } catch {
      mCtx = null;
      analyser = null;
    }
  }

  function meterLoop() {
    let target = 0;
    if (analyser && player.playing) {
      analyser.getByteTimeDomainData(mData);
      let sum = 0;
      for (let i = 0; i < mData.length; i++) {
        const v = (mData[i] - 128) / 128;
        sum += v * v;
      }
      target = Math.min(1, Math.sqrt(sum / mData.length) * 2.8);
    }
    // Balistique : montée nerveuse, retombée plus lente (c'est un VU, pas un nombre).
    vu += (target - vu) * (target > vu ? 0.28 : 0.08);
    if (vu < 0.004) vu = 0;
    raf = requestAnimationFrame(meterLoop);
  }

  onMount(() => {
    raf = requestAnimationFrame(meterLoop);
    return () => {
      cancelAnimationFrame(raf);
      if (volFade) clearInterval(volFade);
      if (audio) audio.pause();
      if (mCtx) mCtx.close().catch(() => {});
      unbindAudio();
    };
  });

  $effect(() => {
    if (!audio) return;
    bindAudio(audio);
    if (!track) return;
    // texture « boîte à gant » : même enregistrement remixé → on swappe la source EN GARDANT le même instant
    const want = (player.glovebox && track.srcGlove) ? track.srcGlove : track.src;
    if (!audio.src.endsWith(want)) {
      const isTextureSwap = track.srcGlove && (audio.src.endsWith(track.src) || audio.src.endsWith(track.srcGlove));
      if (isTextureSwap) {
        const pos = audio.currentTime || 0;
        const wasPlaying = !audio.paused && !audio.ended;
        audio.src = want;
        const restore = () => { try { audio.currentTime = pos; } catch (e) {} };
        if (audio.readyState >= 1) restore(); else audio.addEventListener('loadedmetadata', restore, { once: true });
        if (wasPlaying) audio.play().catch(() => {});
      } else {
        audio.src = want;
        progress = 0;
        current = 0;
      }
    }
    if (player.autoplay) {
      player.autoplay = false;
      if (player.randomStart) {
        player.randomStart = false;
        const seekRand = () => { const d = audio.duration; if (d && isFinite(d)) { try { audio.currentTime = Math.random() * d * 0.9; } catch (e) {} } };
        audio.volume = 0;
        audio.play().then(() => { seekRand(); fadeVol(1, 1000); }).catch(() => {});
        if (audio.readyState < 1) audio.addEventListener('loadedmetadata', seekRand, { once: true });
      } else if (player.fadeIn) {
        player.fadeIn = false;
        audio.volume = 0;
        audio.play().then(() => fadeVol(1, 1000)).catch(() => {}); // fondu d'entrée d'1 s
      } else {
        audio.volume = 1;
        audio.play().catch(() => {});
      }
    }
  });

  // fondu de volume sur l'élément audio
  let volFade = null;
  function fadeVol(target, ms) {
    if (!audio) return;
    if (volFade) clearInterval(volFade);
    const start = audio.volume, t0 = performance.now();
    volFade = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * k));
      if (k >= 1) { clearInterval(volFade); volFade = null; }
    }, 40);
  }

  function onPlay() {
    ensureMeter();
    if (mCtx?.state === 'suspended') mCtx.resume().catch(() => {});
    player.playing = true;
  }

  function toggle() {
    if (!audio || !track) return;
    player.caption = '';
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function onTime() {
    if (audio?.duration) {
      progress = audio.currentTime / audio.duration;
      current = audio.currentTime;
    }
  }

  function seek(e) {
    if (!audio?.duration || !track) return;
    const r = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
  }
</script>

<div class="tx">
  <!-- bandeau : galvo ATELIER · VU ANTENNE · ON AIR -->
  <div class="bridge">
    <div class="meter galvo" title="ligne atelier">
      <svg viewBox="0 0 84 58">
        <circle cx="42" cy="30" r="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
        <path d="M 24 38 A 25 25 0 0 1 60 38" fill="none" stroke="currentColor" stroke-width="1"/>
        <line x1="27" y1="34" x2="31" y2="31" stroke="currentColor" stroke-width="1"/>
        <line x1="42" y1="22" x2="42" y2="26" stroke="currentColor" stroke-width="1"/>
        <line x1="57" y1="34" x2="53" y2="31" stroke="currentColor" stroke-width="1"/>
        <g class="trem">
          <line x1="42" y1="40" x2="30" y2="24" stroke="currentColor" stroke-width="1.8"/>
        </g>
        <circle cx="42" cy="40" r="2.4" fill="currentColor"/>
      </svg>
      <span class="mlab">LIGNE ATELIER · mA</span>
    </div>
    <div class="meter vum" title="niveau antenne">
      <svg viewBox="0 0 120 58">
        <rect x="2" y="2" width="116" height="54" fill="none" stroke="currentColor" stroke-width="1.4"/>
        <path d="M 24 46 A 48 48 0 0 1 96 46" fill="none" stroke="currentColor" stroke-width="1"/>
        <path d="M 84 32 A 48 48 0 0 1 96 46" fill="none" stroke="currentColor" stroke-width="3" opacity="0.55"/>
        <line x1="60" y1="50" x2="60" y2="14" stroke="currentColor" stroke-width="1.8"
          style="transform: rotate({vuDeg}deg); transform-origin: 60px 50px;"/>
        <circle cx="60" cy="50" r="2.6" fill="currentColor"/>
        <text x="60" y="12" text-anchor="middle" font-size="8" fill="currentColor">VU</text>
      </svg>
      <span class="mlab">ANTENNE</span>
    </div>
    <div class="onair">
      <span class="lamp" class:hot={player.playing}></span>
      <span class="olab">ON AIR</span>
    </div>
  </div>

  <!-- ruban : ce qui passe + fréquence -->
  <div class="ruban">
    <div class="what">
      {#if track}
        <span class="tname">{track.name}</span>
      {:else}
        <span class="station">{STATION}</span>
      {/if}
    </div>
    <div class="freq">{FREQ}<em>FM</em></div>
  </div>

  <!-- fader ATELIER ⟷ TOI -->
  <div class="fader">
    <span class="flab" class:on={!engaged}>ATELIER</span>
    <div class="rail">
      <span class="x">✕</span>
      <span class="cap" class:toi={engaged}></span>
    </div>
    <span class="flab" class:on={engaged}>TOI</span>
  </div>

  <!-- navigation dans le son -->
  <button class="seek" onclick={seek} disabled={!engaged} title={engaged ? 'naviguer dans le son' : ''}>
    <span class="prog" style="width:{progress * 100}%"></span>
  </button>

  <!-- transports · temps · ÉJECT -->
  <div class="row">
    <span class="controls">
      <button class="sk" disabled={!canPrev} onclick={() => step(-1)} title="son précédent">⏮</button>
      <button class="pp" disabled={!engaged} onclick={toggle} title={player.playing ? 'pause' : 'lecture'}>
        {player.playing ? '⏸' : '▶'}
      </button>
      <button class="sk" disabled={!canNext} onclick={() => step(1)} title="son suivant">⏭</button>
    </span>
    <span class="time">
      {#if engaged}{fmtDuration(current)}<em>/{fmtDuration(durations[track.id] ?? audio?.duration)}</em>{/if}
    </span>
    <span class="meta">
      {#if player.caption}{player.caption}
      {:else if hasQueue}{player.qLabel ? player.qLabel + ' · ' : ''}{player.qIndex + 1}/{player.queue.length}
      {/if}
    </span>
    <button class="eject" disabled={!engaged} onclick={eject} title="rendre l'antenne">⏏ ÉJECT</button>
  </div>

  <audio
    bind:this={audio}
    onplay={onPlay}
    onpause={() => (player.playing = false)}
    onended={trackEnded}
    ontimeupdate={onTime}
  ></audio>
</div>

<style>
  .tx {
    padding: 10px 12px 11px;
    display: flex;
    flex-direction: column;
    gap: 9px;
    min-height: 100%;
    color: var(--ink);
  }

  /* ---- bandeau ---- */
  .bridge {
    display: flex;
    align-items: stretch;
    gap: 10px;
  }
  .meter {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: 5px 6px 3px;
    border: 1px solid var(--line);
    background: var(--paper);
  }
  .galvo svg { width: 84px; height: 58px; }
  .vum { flex: 1; }
  .vum svg { width: 100%; height: 58px; max-width: 150px; }
  .mlab { font-size: 8px; letter-spacing: 0.09em; color: var(--mid); }

  /* l'aiguille ATELIER frémit en continu : la machine est alimentée */
  .trem {
    animation: trem 1.3s ease-in-out infinite alternate;
    transform-origin: 42px 40px;
  }
  @keyframes trem {
    from { transform: rotate(-1.4deg); }
    to { transform: rotate(1.6deg); }
  }

  .onair {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 0 6px;
  }
  .lamp {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1.5px solid var(--ink);
    background: #a23327;
    animation: breathe 4.1s ease-in-out infinite;
  }
  .lamp.hot { animation-duration: 3.4s; }
  @keyframes breathe {
    0%, 100% { opacity: 0.55; box-shadow: 0 0 2px rgba(162, 51, 39, 0.3); }
    50% { opacity: 1; box-shadow: 0 0 7px rgba(162, 51, 39, 0.75); }
  }
  .olab { font-size: 8px; letter-spacing: 0.12em; color: var(--mid); }

  /* ---- ruban ---- */
  .ruban {
    display: flex;
    align-items: stretch;
    gap: 8px;
  }
  .what {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    padding: 5px 10px;
    background: #1c1c1c;
    overflow: hidden;
  }
  .tname, .station {
    color: #e8e8e4;
    font-size: 12.5px;
    letter-spacing: 0.14em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .station { color: #b9b9b2; }
  .freq {
    flex: none;
    display: flex;
    align-items: baseline;
    gap: 4px;
    padding: 5px 10px;
    background: #1c1c1c;
    color: #e8e8e4;
    font-size: 14px;
    letter-spacing: 0.12em;
    font-variant-numeric: tabular-nums;
  }
  .freq em { font-style: normal; font-size: 9px; color: #b9b9b2; }

  /* ---- fader ---- */
  .fader {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 2px 0;
  }
  .flab {
    flex: none;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--mid);
    transition: color 400ms ease;
  }
  .flab.on { color: var(--ink); font-weight: bold; }
  .rail {
    position: relative;
    flex: 1;
    height: 22px;
    border: 1px solid var(--line);
    background: var(--paper);
  }
  .rail::before {
    content: '';
    position: absolute;
    left: 6px;
    right: 6px;
    top: 50%;
    height: 3px;
    transform: translateY(-50%);
    background: var(--ink);
  }
  .x {
    position: absolute;
    left: 50%;
    top: -3px;
    transform: translateX(-50%);
    font-size: 8px;
    color: var(--mid);
    background: var(--win);
    padding: 0 3px;
    line-height: 1;
  }
  .cap {
    position: absolute;
    top: 1px;
    bottom: 1px;
    left: 3px;
    width: 30px;
    border: 1.5px solid var(--ink);
    background: var(--panel);
    box-shadow: 1px 1px 0 rgba(35, 35, 31, 0.25);
    /* retour vers ATELIER : plus lent qu'à l'aller (on rend l'antenne, on ne la lâche pas) */
    transition: left 1.5s cubic-bezier(0.3, 0, 0.25, 1);
  }
  .cap::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 2px;
    bottom: 2px;
    width: 1.5px;
    transform: translateX(-50%);
    background: var(--ink);
  }
  .cap.toi {
    left: calc(100% - 33px);
    /* prise d'antenne : ~1 s, moteur franc */
    transition: left 1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ---- navigation ---- */
  .seek {
    position: relative;
    height: 8px;
    border: 1px solid var(--line);
    background: var(--paper);
    padding: 0;
    cursor: pointer;
    overflow: hidden;
  }
  .seek:disabled { cursor: default; opacity: 0.5; }
  .prog {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--mid);
    pointer-events: none;
  }

  /* ---- transports ---- */
  .row {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .controls { display: inline-flex; gap: 3px; flex: none; }
  .pp, .sk {
    height: 26px;
    border: 1.5px solid var(--ink);
    background: var(--win);
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 60ms ease;
  }
  .pp { width: 36px; font-size: 13px; }
  .sk { width: 28px; }
  .pp:hover:not(:disabled), .sk:hover:not(:disabled) { background: var(--panel); }
  .pp:active:not(:disabled), .sk:active:not(:disabled) { transform: translate(1px, 1px); }
  .pp:disabled, .sk:disabled { opacity: 0.35; cursor: default; border-color: var(--line); }
  .time {
    flex: none;
    font-size: 10.5px;
    font-variant-numeric: tabular-nums;
    min-width: 66px;
  }
  .time em { font-style: normal; color: var(--mid); }
  .meta {
    flex: 1;
    font-size: 10.5px;
    color: var(--mid);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .eject {
    flex: none;
    height: 26px;
    padding: 0 9px;
    border: 1.5px solid var(--ink);
    background: var(--win);
    font-size: 10px;
    letter-spacing: 0.08em;
    transition: transform 60ms ease;
  }
  .eject:hover:not(:disabled) { background: var(--panel); }
  .eject:active:not(:disabled) { transform: translate(1px, 1px); }
  .eject:disabled { opacity: 0.35; cursor: default; border-color: var(--line); }
</style>
