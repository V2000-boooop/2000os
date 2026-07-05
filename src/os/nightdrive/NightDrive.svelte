<script>
  // NIGHT DRIVE — l'habitacle et la ville (M1 : cockpit statique, monde vivant).
  // Le bureau = lieu de travail, calme. Ici = lieu d'écoute, cinématographique.
  // Le monde derrière le pare-brise est un canvas basse résolution (cityscape.js) :
  // rendu bitmap assumé, scène de jeu vidéo 90/2000, ville méditerranéenne qui
  // vit sans nous. L'autoradio est le lecteur du bureau qui a trouvé sa vraie
  // place (registre) : même flux, mêmes commandes, autre peau — esprit
  // préparation audio des films Taxi.
  import { onMount } from 'svelte';
  import { cubicOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { night, exitNight } from './night.svelte.js';
  import { player, step, eject, playTrack } from '../player.svelte.js';
  import { byId, resolveChildren } from '../../data/content.js';
  import { createCity } from './cityscape.js';
  import { SCENES, ROOT } from './scenes.js';
  import { PHRASES_COMPTOIR } from './comptoir.js';
  import { COCKTAILS } from './cocktails.js';
  import { CRATE } from './djbooth.js';
  import { SECTIONS } from './adresses.js';
  import { CONTACTS } from './nokia.js';
  import { CASSETTES } from './cassettes.js';
  import { SERMONS } from './sermons.js';
  import { POURBOIRE } from './pourboire.js';
  import { TICKET, tirerTicket } from './grattage.js';
  import { JOURNAL } from './journal.js';
  import { EVENEMENT } from './evenement.js';
  import { PARIS } from './paris.js';
  import { PHOTOS } from './soiree.js';
  import { FRINGUES } from './friperie.js';
  import { createUnivers } from './univers.js';
  import { porte, ressortir, zoneSfx, setAmbiance, duckAmbiance, loop } from './worldsound.js';

  const p = $derived(night.phase);
  const worldOn = $derived(['cabin', 'ignition', 'drive', 'return-cabin'].includes(p));
  const cockpitIn = $derived(['cabin', 'ignition', 'drive'].includes(p));
  const lit = $derived(p === 'ignition' || p === 'drive'); // le contact est mis

  // ---- la ville : moteur canvas, démarré avec la scène ----
  let cvs = $state(null);
  let mcvs = $state(null);
  let city = null;

  $effect(() => {
    if (!cvs || !mcvs) return;
    const c = createCity(cvs, mcvs);
    c.start();
    city = c;
    // la Destination se démonte (phase off) : la ville s'endort avec elle
    return () => {
      c.stop();
      if (city === c) city = null;
    };
  });
  $effect(() => { city?.setLit(lit); });

  // ---- le regard : menus PS2 — la tête ne suit jamais la souris ----
  // Elle se tourne vers ce qui compte : hover d'une porte → le regard glisse
  // doucement vers elle ; on la quitte → retour amorti à la position de repos.
  // On ne contrôle pas une caméra, on met le focus sur un point de la ville.
  let lookX = $state(0);
  let lookY = $state(0);
  let hovering = $state(false);
  let lastPt = null; // dernière position curseur (coordonnées canvas)

  function focusAt(hot) {
    if (hot) {
      // la porte tire le regard vers elle, proportionnellement à son excentrage
      lookX = Math.max(-1, Math.min(1, (hot.cx - 192) / 150));
      lookY = Math.max(-1, Math.min(1, (hot.cy - 108) / 120));
      hovering = true;
    } else {
      lookX = 0;
      lookY = 0;
      hovering = false;
    }
    // le lieu regardé le sait, et répond (néon, chenillard — cityscape)
    city?.setFocus(hot ? hot.kind : null);
  }

  function canvasXY(e) {
    const r = cvs.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 384, ((e.clientY - r.top) / r.height) * 216];
  }
  function worldMove(e) {
    if (!city) return;
    lastPt = canvasXY(e);
    focusAt(city.hover(lastPt[0], lastPt[1]));
  }
  function worldLeave() {
    lastPt = null;
    focusAt(null);
  }
  // la ville avance sous un curseur immobile : on re-vérifie le focus sans
  // attendre un mouvement de souris (une porte peut arriver sous le curseur,
  // ou lui échapper)
  $effect(() => {
    if (!worldOn) return;
    const iv = setInterval(() => {
      if (city && lastPt) focusAt(city.hover(lastPt[0], lastPt[1]));
    }, 150);
    return () => clearInterval(iv);
  });
  function worldClick(e) {
    if (!city || p !== 'drive') return;
    const [x, y] = canvasXY(e);
    const kind = city.click(x, y);
    // PILOTE It9 (D12) : l'ARCADE est la première porte branchée — elle ouvre
    // le dossier Jeux, métamorphosé en salle d'arcade. Les autres portes :
    // lueur seulement, elles seront branchées une par une.
    if (kind === 'arcade') arcadeOpen = true;
  }

  // ---- LA SALLE D'ARCADE : le dossier Jeux, métamorphosé (registre D12) ----
  // Chaque .exe du bureau = une borne. Pas encore de vrais jeux : la borne
  // répond avec son message (comme le launcher du bureau, autre peau).
  let arcadeOpen = $state(false);
  let borne = $state(null); // la borne devant laquelle on s'est arrêté
  const BORNES = resolveChildren(byId['jeux']).filter((n) => n.kind === 'exe');
  function closeArcade() { borne = null; arcadeOpen = false; }
  $effect(() => {
    if (p !== 'drive') {
      closeArcade();
      // on coupe le contact depuis n'importe quelle profondeur : la prochaine
      // nuit recommence toujours au quai
      if (stack.length > 1) stack = [{ id: ROOT }];
    }
  });

  // ---- l'autoradio : même antenne que l'Émetteur, jamais un second flux ----
  const track = $derived(byId[player.trackId]);
  const engaged = $derived(!!track);
  const hasQueue = $derived(player.queue.length > 1);
  const canPrev = $derived(hasQueue && player.qIndex > 0);
  const canNext = $derived(hasQueue && player.qIndex < player.queue.length - 1);
  const lcdLine = $derived(
    track ? track.name.toUpperCase() : 'VINCENT 2000 RADIO · 93.00 FM · ICI LA NUIT'
  );

  function toggle() {
    if (track) playTrack(track); // même son à l'antenne → play/pause (moteur conservé)
  }

  // ---- les presets : 6 sons prêts à passer à l'antenne ----
  // Un autoradio, ça se manipule : chaque touche mémorise un son de Vincent.
  // Même flux que l'Émetteur (D13) — appuyer = faire passer à l'antenne,
  // la file devient les 6 presets (⏮/⏭ naviguent dedans).
  const PRESETS = Object.values(byId)
    .filter((n) => n.kind === 'audio')
    .slice(0, 6);
  function preset(i) {
    const it = PRESETS[i];
    if (!it || p !== 'drive') return;
    playTrack(it, { list: PRESETS, label: 'NIGHT DRIVE · 93.00 FM' });
  }

  // ---- l'horloge du tableau de bord = la même heure que le bureau (registre) ----
  let now = $state(new Date());
  onMount(() => {
    const t = setInterval(() => (now = new Date()), 20000);
    return () => clearInterval(t);
  });
  const clock = $derived(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));

  // ---- l'habitacle peint (pivot DA « peint + animé ») ----
  // L'image de Vincent est chargée puis détourée AU VOL : son pare-brise bleu
  // uni devient transparent (chroma-key) et la ville du moteur vit au travers.
  // Tant que l'image n'est pas déposée (public/media/nightdrive/habitacle_v1.png),
  // l'habitacle CSS d'origine reste en poste — robustesse avant tout.
  let cabURL = $state(null);
  onMount(() => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        const id = g.getImageData(0, 0, c.width, c.height);
        const d = id.data;
        // le bleu du pare-brise n'existe que dans la moitié haute de l'image
        const yMax = Math.floor(c.height * 0.56);
        for (let yy = 0; yy < yMax; yy++) {
          for (let xx = 0; xx < c.width; xx++) {
            const k = (yy * c.width + xx) * 4;
            const blue = d[k + 2] - Math.max(d[k], d[k + 1]);
            if (blue > 10) {
              const tt = Math.min(1, (blue - 10) / 24);
              d[k + 3] = Math.round(d[k + 3] * (1 - tt));
            }
          }
        }
        g.putImageData(id, 0, 0);
        cabURL = c.toDataURL('image/png');
      } catch {
        cabURL = img.src; // détourage impossible → image brute plutôt que rien
      }
    };
    img.src = '/media/nightdrive/habitacle_v1.png';
  });

  // ---- la ville peinte (It13) : deux états, veilleuse / allumée ----
  // Le hack des menus PS2 : la même image existe éteinte et allumée, le
  // survol d'un lieu fond l'une dans l'autre SUR SA ZONE (sprite-crop CSS).
  // Les lieux du décor SONT les anciens dossiers (registre D12). Sans les
  // fichiers, la ville procédurale reste en poste (fallback).
  const V_OFF = '/media/nightdrive/ville_off_v1.png';
  const V_ON = '/media/nightdrive/ville_on_v1.png';
  let paintCity = $state(false);
  onMount(() => {
    let ok = 0;
    for (const src of [V_OFF, V_ON]) {
      const im = new Image();
      im.onload = () => { if (++ok === 2) paintCity = true; };
      im.src = src;
    }
  });

  // ---- SCÈNES GIGOGNES (D15) : le monde peint est un arbre ----
  // Les zones du quai vivent dans le registre (scenes.js) ; le composant ne
  // connaît que le schéma. Zones mesurées au pixel (crops agrandis, It14-16).
  const QUAI = SCENES[ROOT].zones;
  let lieuPulse = $state(''); // lueur brève d'une zone pas encore branchée

  // les paires d'images des intérieurs : une scène sans images publiées reste
  // une lueur — l'arbre est câblé AVANT les images, la porte s'ouvre toute
  // seule dès que Vincent dépose la paire dans public/media/nightdrive/scenes/
  let sceneReady = $state({});
  onMount(() => {
    for (const [id, sc] of Object.entries(SCENES)) {
      if (id === ROOT) continue;
      let ok = 0;
      for (const src of [sc.off, sc.on]) {
        const im = new Image();
        im.onload = () => { if (++ok === 2) sceneReady[id] = true; };
        im.src = src;
      }
    }
  });

  // la pile : entrer dans une porte EMPILE la scène enfant, Échap dépile.
  // Chaque entrée mémorise (ox, oy) = le point de la porte cliquée, pour que
  // le zoom-crossfade plonge vers elle (menus PS2) et en ressorte au retour.
  let stack = $state([{ id: ROOT }]);
  const inScene = $derived(stack.length > 1); // on a quitté l'habitacle
  const sceneTop = $derived(stack[stack.length - 1].id);

  function pushScene(z) {
    const top = stack[stack.length - 1];
    top.ox = z.x + z.w / 2; // la porte devient le point de fuite du parent
    top.oy = z.y + z.h / 2;
    porte(z.goto); // le son du passage (silence si le fichier n'est pas déposé)
    stack.push({ id: z.goto });
  }
  function popScene() {
    if (stack.length > 1) {
      stack.pop();
      ressortir(); // un seul son générique pour tous les retours
    }
  }

  // l'arrivée d'une scène : fondu + très léger recul — sur le zoom du parent,
  // ça compose le zoom-crossfade ; au dépilement, l'inverse (la porte recule)
  function arrive(node) {
    return {
      duration: 950,
      easing: cubicOut,
      css: (t, u) => `opacity:${t}; transform: scale(${1 + u * 0.1});`,
    };
  }

  // le regard (racine seulement — les intérieurs sont plein cadre, sans tête)
  function lieuEnter(l) {
    // le regard se tourne vers le lieu (même doctrine qu'It7, cible en %)
    lookX = Math.max(-1, Math.min(1, (l.x + l.w / 2 - 50) / 38));
    lookY = Math.max(-1, Math.min(1, (l.y + l.h / 2 - 50) / 42));
    hovering = true;
  }
  function lieuLeave() {
    lookX = 0;
    lookY = 0;
    hovering = false;
  }
  // ---- la voix du comptoir : la borne PMU génère un mantra de zinc ----
  let mantra = $state(null);
  let mantraT = null;
  let lastPhrase = -1;
  function sayMantra() {
    let i;
    do { i = Math.floor(Math.random() * PHRASES_COMPTOIR.length); }
    while (i === lastPhrase && PHRASES_COMPTOIR.length > 1);
    lastPhrase = i;
    mantra = PHRASES_COMPTOIR[i];
    clearTimeout(mantraT);
    mantraT = setTimeout(() => (mantra = null), 7000);
  }
  $effect(() => { if (!inScene) mantra = null; }); // on sort : la voix se tait

  // ---- LA CARTE DE LA RIDE : les cocktails du bar, façon menu de jeu ----
  // Des vraies recettes (cocktails.js, Vincent en ajoute à sa guise) ; le
  // cocktail choisi brille dans son verre, sa composition posée à côté.
  let carteOpen = $state(false);
  let cocktail = $state(COCKTAILS[0]);
  // les trois verres du bar : silhouette + intérieur (le liquide y vit)
  const VERRES = {
    long:  { glass: 'M40 12 L44 158 Q60 167 76 158 L80 12', liquid: 'M43.4 40 L46.8 156 Q60 163.5 73.2 156 L76.6 40 Z' },
    court: { glass: 'M32 62 L38 148 Q60 158 82 148 L88 62', liquid: 'M35.4 78 L40.8 146 Q60 155 79.2 146 L84.6 78 Z' },
    coupe: { glass: 'M28 26 L60 92 L92 26 M60 92 L60 148 M40 152 Q60 145 80 152', liquid: 'M36 42 L60 90 L84 42 Z' },
  };
  $effect(() => { if (p !== 'drive') { carteOpen = false; djOpen = false; } });

  // ---- LE DJ BOOTH : deux CDJ, piste A / piste B (cabine de LA RIDE) ----
  // Le bac = les sons de l'OS + les exclusivités des platines (djbooth.js,
  // Vincent dépose ses fichiers). Deux lecteurs indépendants, crossfader
  // équal-power. D13 respecté : quand on joue, on rend l'antenne — les
  // platines sont un INSTRUMENT, jamais un second flux qui se bat avec elle.
  let djOpen = $state(false);
  const BAC = [
    ...Object.values(byId)
      .filter((n) => n.kind === 'audio')
      .map((n) => ({ nom: n.name.replace(/\.\w+$/, '').toUpperCase(), src: n.src })),
    ...CRATE,
  ];
  const deckA = $state({ nom: null, src: null, playing: false, vol: 0.9, rate: 1, bac: false });
  const deckB = $state({ nom: null, src: null, playing: false, vol: 0.9, rate: 1, bac: false });
  let xfade = $state(0.5);
  let elA = null;
  let elB = null;
  function deckEl(d) {
    if (d === deckA) {
      if (!elA) { elA = new Audio(); elA.onended = () => (deckA.playing = false); }
      return elA;
    }
    if (!elB) { elB = new Audio(); elB.onended = () => (deckB.playing = false); }
    return elB;
  }
  // équal-power : au centre les deux vivent, aux extrêmes un seul règne
  const gainA = () => Math.max(0, Math.min(1, deckA.vol * Math.cos((xfade * Math.PI) / 2)));
  const gainB = () => Math.max(0, Math.min(1, deckB.vol * Math.sin((xfade * Math.PI) / 2)));
  function deckLoad(d, t) {
    const el = deckEl(d);
    el.pause();
    el.src = t.src;
    d.nom = t.nom;
    d.src = t.src;
    d.playing = false;
    d.bac = false;
  }
  function deckPlay(d) {
    if (!d.src) { d.bac = true; return; } // pas de disque : le bac s'ouvre
    const el = deckEl(d);
    if (d.playing) { el.pause(); d.playing = false; return; }
    if (player.trackId) eject(); // on prend les commandes : l'antenne est rendue
    el.volume = d === deckA ? gainA() : gainB();
    el.playbackRate = d.rate;
    el.play();
    d.playing = true;
  }
  function deckCue(d) {
    if (!d.src) return;
    const el = deckEl(d);
    el.pause();
    el.currentTime = 0;
    d.playing = false;
  }
  function djStop() {
    elA?.pause();
    elB?.pause();
    deckA.playing = false;
    deckB.playing = false;
  }
  // les faders vivent en continu (voie × crossfader, pitch par platine)
  $effect(() => { const g = gainA(); if (elA) elA.volume = g; });
  $effect(() => { const g = gainB(); if (elB) elB.volume = g; });
  $effect(() => { const r = deckA.rate; if (elA) elA.playbackRate = r; });
  $effect(() => { const r = deckB.rate; if (elB) elB.playbackRate = r; });
  $effect(() => { if (!djOpen) djStop(); });
  $effect(() => () => { elA?.pause(); elB?.pause(); }); // démontage : silence

  // ---- LE CARNET D'ADRESSES : un seul flow pour toutes les bonnes adresses
  // (cavistes, tables, pizzerias… — sections dans adresses.js) ----
  let carnet = $state(null); // id de section ouverte, ou null
  const carnetSec = $derived(carnet ? SECTIONS[carnet] : null);

  // ---- LE NOKIA 3310 de la taverne : menu, contacts, Snake ----
  let phoneOpen = $state(false);
  let phoneVue = $state('accueil'); // accueil | menu | contacts | messages | snake
  let menuIdx = $state(0);
  const MENU_3310 = ['Contacts', 'Messages', 'Snake'];
  function phoneOK() {
    if (phoneVue === 'accueil') { phoneVue = 'menu'; menuIdx = 0; return; }
    if (phoneVue === 'menu') {
      const c = MENU_3310[menuIdx];
      if (c === 'Contacts') phoneVue = 'contacts';
      else if (c === 'Messages') phoneVue = 'messages';
      else { snakeStart(); phoneVue = 'snake'; }
      return;
    }
    if (phoneVue === 'snake' && snake.dead) snakeStart(); // rejouer
  }
  function phoneBack() {
    if (phoneVue === 'accueil') { phoneOpen = false; return; }
    phoneVue = phoneVue === 'snake' || phoneVue === 'contacts' || phoneVue === 'messages' ? 'menu' : 'accueil';
  }
  function phoneNav(d) {
    if (phoneVue === 'menu') menuIdx = (menuIdx + d + MENU_3310.length) % MENU_3310.length;
    if (phoneVue === 'snake') snakeDir(d > 0 ? [0, 1] : [0, -1]);
  }

  // ---- SNAKE — le vrai, sur LCD vert (grille 21×12, pixels 4×4) ----
  const GW = 21, GH = 12;
  const snake = $state({ cells: [], dir: [1, 0], next: [1, 0], food: [12, 6], score: 0, dead: false });
  let snakeCvs = $state(null);
  let snakeTimer = null;
  function snakeStart() {
    snake.cells = [[5, 6], [4, 6], [3, 6]];
    snake.dir = [1, 0];
    snake.next = [1, 0];
    snake.score = 0;
    snake.dead = false;
    snakeFood();
  }
  function snakeFood() {
    do {
      snake.food = [Math.floor(Math.random() * GW), Math.floor(Math.random() * GH)];
    } while (snake.cells.some(([x, y]) => x === snake.food[0] && y === snake.food[1]));
  }
  function snakeDir([dx, dy]) {
    if (dx === -snake.dir[0] && dy === -snake.dir[1]) return; // jamais demi-tour
    snake.next = [dx, dy];
  }
  function snakeTick() {
    if (snake.dead) return;
    snake.dir = snake.next;
    const [hx, hy] = snake.cells[0];
    // les murs sont durs, comme sur le vrai (le serpent meurt au bord)
    const nx = hx + snake.dir[0], ny = hy + snake.dir[1];
    if (nx < 0 || nx >= GW || ny < 0 || ny >= GH || snake.cells.some(([x, y]) => x === nx && y === ny)) {
      snake.dead = true;
      return;
    }
    snake.cells.unshift([nx, ny]);
    if (nx === snake.food[0] && ny === snake.food[1]) { snake.score += 8; snakeFood(); }
    else snake.cells.pop();
  }
  function snakeDraw() {
    if (!snakeCvs) return;
    const g = snakeCvs.getContext('2d');
    g.fillStyle = '#a7c274'; // le vert du LCD
    g.fillRect(0, 0, 84, 48);
    g.fillStyle = '#1c2b12'; // les pixels
    for (const [x, y] of snake.cells) g.fillRect(x * 4, y * 4, 4, 4);
    const [fx, fy] = snake.food;
    g.fillRect(fx * 4 + 1, fy * 4 + 1, 2, 2); // la mouche
  }
  $effect(() => {
    if (!(phoneOpen && phoneVue === 'snake')) return;
    snakeTimer = setInterval(() => { snakeTick(); snakeDraw(); }, 130);
    snakeDraw();
    return () => clearInterval(snakeTimer);
  });
  $effect(() => { if (p !== 'drive') { phoneOpen = false; carnet = null; } });

  // ---- LE CIEL ÉTOILÉ de la barque : la lanterne s'ouvre sur la nuit.
  // Bitmap 384×216 upscalé (DA PS2), étoiles qui scintillent, étoile filante
  // rare. L'enregistrement de Vincent (public/media/nightdrive/barque_ciel.wav
  // ou .mp3) tourne en boucle tant qu'on regarde — l'antenne est rendue (D13).
  let cielOpen = $state(false);
  let cielCvs = $state(null);
  let cielAudio = null;
  const ETOILES = Array.from({ length: 170 }, () => ({
    x: Math.random() * 384,
    y: Math.random() * 190,
    r: Math.random() < 0.85 ? 1 : 2,
    ph: Math.random() * Math.PI * 2,
    v: 0.6 + Math.random() * 1.8,
    t: Math.random(), // teinte : blanc bleuté ↔ chaud
  }));
  let filante = null; // { x, y, dx, dy, vie }
  $effect(() => {
    if (!(cielOpen && cielCvs)) return;
    // l'enregistrement de Vincent, s'il est déposé (wav puis mp3, sinon silence)
    if (player.trackId) eject();
    cielAudio = new Audio('/media/nightdrive/barque_ciel.wav');
    cielAudio.loop = true;
    cielAudio.onerror = () => {
      cielAudio = new Audio('/media/nightdrive/barque_ciel.mp3');
      cielAudio.loop = true;
      cielAudio.play().catch(() => {});
    };
    cielAudio.play().catch(() => {});
    const g = cielCvs.getContext('2d');
    let raf;
    let t0 = performance.now();
    const dessine = (now) => {
      const t = (now - t0) / 1000;
      // la nuit : un dégradé profond, un souffle de voie lactée
      const grad = g.createLinearGradient(0, 0, 0, 216);
      grad.addColorStop(0, '#020208');
      grad.addColorStop(0.75, '#050a1e');
      grad.addColorStop(1, '#0a1226');
      g.fillStyle = grad;
      g.fillRect(0, 0, 384, 216);
      g.save();
      g.globalAlpha = 0.05;
      g.fillStyle = '#8fa8e8';
      g.beginPath();
      g.ellipse(230, 80, 150, 34, -0.5, 0, Math.PI * 2);
      g.fill();
      g.restore();
      for (const e of ETOILES) {
        const a = 0.25 + 0.75 * Math.abs(Math.sin(e.ph + t * e.v));
        g.globalAlpha = a;
        g.fillStyle = e.t < 0.8 ? '#dfe8ff' : '#ffe2b0';
        g.fillRect(e.x | 0, e.y | 0, e.r, e.r);
      }
      g.globalAlpha = 1;
      // l'étoile filante : rare, brève, jamais au même endroit
      if (!filante && Math.random() < 0.003) {
        filante = { x: 40 + Math.random() * 280, y: 15 + Math.random() * 70, dx: 3 + Math.random() * 2, dy: 1 + Math.random(), vie: 22 };
      }
      if (filante) {
        g.strokeStyle = 'rgba(230,240,255,0.8)';
        g.beginPath();
        g.moveTo(filante.x, filante.y);
        g.lineTo(filante.x - filante.dx * 4, filante.y - filante.dy * 4);
        g.stroke();
        filante.x += filante.dx;
        filante.y += filante.dy;
        if (--filante.vie <= 0) filante = null;
      }
      // l'eau, tout en bas : un miroir noir qui tremble à peine
      g.fillStyle = '#04060f';
      g.fillRect(0, 196, 384, 20);
      for (let i = 0; i < 22; i++) {
        const x = (i * 17.4 + t * 6) % 384;
        g.globalAlpha = 0.12 + 0.08 * Math.sin(t * 2 + i);
        g.fillStyle = '#8fa8e8';
        g.fillRect(x | 0, 198 + ((i * 7) % 14), 6, 1);
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(dessine);
    };
    raf = requestAnimationFrame(dessine);
    return () => {
      cancelAnimationFrame(raf);
      cielAudio?.pause();
      cielAudio = null;
    };
  });

  // ---- LES CASSETTES de la boombox : une K7 = une playlist, à l'antenne ----
  let k7Open = $state(false);
  // une piste : id de l'OS, ou fichier direct { nom, src } (enregistré au vol
  // dans byId pour que l'Émetteur/autoradio sache le diffuser — même onde)
  function k7Tracks(c) {
    return c.pistes
      .map((pi, i) => {
        if (typeof pi === 'string') return byId[pi];
        const id = `k7_${c.titre}_${i}`;
        if (!byId[id]) byId[id] = { id, name: pi.nom, kind: 'audio', src: pi.src };
        return byId[id];
      })
      .filter(Boolean);
  }
  function k7Play(c) {
    const ts = k7Tracks(c);
    if (!ts.length) return;
    playTrack(ts[0], { list: ts, label: `K7 · ${c.titre}` });
  }
  const k7OnAir = $derived(player.qLabel.startsWith('K7 · ') ? player.qLabel.slice(5) : null);
  $effect(() => { if (p !== 'drive') { cielOpen = false; k7Open = false; } });

  // ============================================================
  //  LES NOUVELLES DESTINATIONS (branchées It26) — un dispatcher léger
  //  pour les « salles » de panneau ; les expériences plein cadre
  //  (univers des vitraux) ont leur propre cycle de vie plus bas.
  // ============================================================
  // `room` = la salle-panneau ouverte (une seule à la fois), ou null.
  let room = $state(null); // 'sermon'|'confess'|'pourboire'|'grattage'|'paris'|'evenement'|'journal'|'photobooth'|'friperie'|'toilettes'|'internet'
  const EVT = EVENEMENT.actuel ?? EVENEMENT.vide;
  const evtVide = !EVENEMENT.actuel;

  // -- le pupitre : un sermon tiré au hasard, jamais deux fois de suite --
  let sermon = $state(null);
  let lastSermon = -1;
  function preche() {
    let i;
    do { i = Math.floor(Math.random() * SERMONS.length); }
    while (i === lastSermon && SERMONS.length > 1);
    lastSermon = i;
    sermon = SERMONS[i];
  }

  // -- le journal : article de tête ouvert par défaut --
  let journalArt = $state(JOURNAL.articles[0] ?? null);

  // -- les bougies : allumées une à une, un mot de remerciement à chaque --
  const NB_CIERGES = 12;
  let cierges = $state(Array(NB_CIERGES).fill(false));
  let merci = $state(null);
  let lastMerci = -1;
  function allumer(i) {
    if (cierges[i]) return;
    cierges[i] = true;
    zoneSfx('cathedrale', 'bougies'); // la pièce qui tombe (silence si absent)
    let m;
    do { m = Math.floor(Math.random() * POURBOIRE.merci.length); }
    while (m === lastMerci && POURBOIRE.merci.length > 1);
    lastMerci = m;
    merci = POURBOIRE.merci[m];
  }

  // -- le jeu à gratter : un vrai ticket, gratté à la souris --
  let gratResult = $state(null);
  let gratRevealed = $state(false);
  let gratCvs = $state(null);
  let gratting = false;
  function gratNeuf() {
    gratResult = tirerTicket();
    gratRevealed = false; // la couche argentée est (re)posée par l'effet ci-dessous
  }
  function gratCouche() {
    if (!gratCvs) return;
    const g = gratCvs.getContext('2d');
    const w = gratCvs.width, h = gratCvs.height;
    g.globalCompositeOperation = 'source-over';
    // l'argenté brossé du ticket
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#b9b9c0');
    grad.addColorStop(0.5, '#8f8f98');
    grad.addColorStop(1, '#a9a9b2');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.14)';
    for (let i = 0; i < 260; i++) {
      g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
    }
    g.fillStyle = '#5a5a63';
    g.font = 'bold 11px monospace';
    g.textAlign = 'center';
    g.fillText('· · · GRATTE ICI · · ·', w / 2, h / 2 + 4);
    g.globalCompositeOperation = 'destination-out';
  }
  function gratAt(e) {
    if (!gratCvs || gratRevealed) return;
    const g = gratCvs.getContext('2d');
    const r = gratCvs.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * gratCvs.width;
    const y = ((e.clientY - r.top) / r.height) * gratCvs.height;
    g.beginPath();
    g.arc(x, y, 13, 0, Math.PI * 2);
    g.fill();
    gratCheck();
  }
  function gratCheck() {
    if (!gratCvs) return;
    const g = gratCvs.getContext('2d');
    const w = gratCvs.width, h = gratCvs.height;
    const d = g.getImageData(0, 0, w, h).data;
    let clear = 0;
    for (let i = 3; i < d.length; i += 4 * 16) if (d[i] === 0) clear++; // échantillonnage
    if (clear / (d.length / (4 * 16)) > 0.55) {
      gratRevealed = true;
      zoneSfx('pmu', 'fdj');
    }
  }

  // -- la tour radio → Internet : la séquence modem (porteuse introuvable) --
  const NET_SEQ = [
    'V2000 NET · connexion RTC',
    'composition du numéro : 3615 NUIT',
    'négociation de la porteuse…',
    '·· CRRRR ·· PSHHHT ·· BEEP ··',
    'aucune tonalité.',
    'PORTEUSE INTROUVABLE.',
    'la nuit n\'a pas le haut débit. réessaie plus tard.',
  ];
  let netLines = $state([]);
  let netTimers = [];
  function netStart() {
    netLines = [];
    netTimers.forEach(clearTimeout);
    netTimers = [];
    NET_SEQ.forEach((l, i) => {
      netTimers.push(setTimeout(() => { netLines = [...netLines, l]; }, 550 * (i + 1)));
    });
  }
  function netStop() {
    netTimers.forEach(clearTimeout);
    netTimers = [];
  }

  // -- l'univers d'un vitrail : parenthèse dans la parenthèse, plein cadre --
  let univers = $state(null); // 'dark' | 'ange' | null
  let uCvs = $state(null);
  $effect(() => {
    if (!univers || !uCvs) return;
    if (player.trackId) eject(); // on change de dimension : l'antenne est rendue (D13)
    const u = createUnivers(uCvs, univers);
    u.start();
    return () => u.stop();
  });

  // ouvrir une salle-panneau (avec son d'objet générique)
  function openRoom(type, z) {
    if (type === 'sermon') preche();
    if (type === 'grattage') gratNeuf();
    if (type === 'internet') netStart();
    if (type === 'pourboire') merci = null;
    room = type;
    if (z) zoneSfx(sceneTop, z.id);
  }
  function closeRoom() {
    if (room === 'internet') netStop();
    room = null;
  }
  function closeUnivers() { univers = null; }

  // le canvas du grattage vient de (re)paraître, pas encore révélé → couche fraîche
  $effect(() => {
    if (room === 'grattage' && gratCvs && !gratRevealed) gratCouche();
  });

  // le confessionnal : tes vocaux tournent en boucle tant qu'on écoute (D13 :
  // on prend l'antenne). Silence total si le fichier n'est pas déposé (050).
  $effect(() => {
    if (room !== 'confess') return;
    if (player.trackId) eject();
    const v = loop('zone_cathedrale_confessionnal', 0.85);
    return () => v.stop();
  });

  // tout se referme quand on coupe le contact (comme les autres salles)
  $effect(() => { if (p !== 'drive') { room = null; univers = null; netStop(); } });

  // ---- LE LIT D'AMBIANCE : la boucle de la scène courante, duckée par
  //      l'antenne ou par une expérience plein cadre (D13) ----
  $effect(() => { setAmbiance(worldOn ? sceneTop : null); });
  $effect(() => {
    const fullscreen = !!univers || cielOpen || room === 'confess';
    duckAmbiance(player.playing || fullscreen);
  });
  $effect(() => () => setAmbiance(null)); // démontage de la Destination : silence

  // ---- PERSO VIVANTS : jeux de poses + réactions contextuelles --------------
  // chaque perso peut porter `poses: { idle, radio, roll, … }`. personaPose[id]
  // = la pose active (undefined = idle). Fallback : si une pose manque → idle.
  let personaPose = $state({});
  let personaFrame = $state({}); // index de frame pour les poses en SÉQUENCE (flipbook)
  let rollAsk = $state(false);   // le mini-prompt « rouler un joint ? Myrtille / Stick »
  const poseTimers = {};
  const seqTimers = {};
  // RÉACTIVITÉ GARANTIE : on RÉASSIGNE l'objet à chaque changement (muter une prop imbriquée
  // depuis un setInterval ne déclenche pas toujours le re-render → les frames « sautaient »).
  const setPose = (id, v) => { personaPose = { ...personaPose, [id]: v }; };
  const setFrame = (id, v) => { personaFrame = { ...personaFrame, [id]: v }; };
  function clearPose(id) { if (poseTimers[id]) clearTimeout(poseTimers[id]); if (seqTimers[id]) clearInterval(seqTimers[id]); }
  // une pose = un sprite unique OU un tableau de frames (séquence)
  function resolvePose(perso) {
    const P = perso.poses; if (!P) return perso.src;
    const k = personaPose[perso.id];
    const pose = (k && P[k]) || P.idle || perso.src;
    if (Array.isArray(pose)) { const i = personaFrame[perso.id] ?? 0; return pose[Math.min(i, pose.length - 1)]; }
    return pose;
  }
  // opts : { fps } séquence · { ms } pose figée temporisée · { hold } garde la dernière frame · { then } enchaîne
  function playPose(id, key, opts = {}) {
    clearPose(id);
    setPose(id, key); setFrame(id, 0);
    const per = (SCENES[sceneTop]?.personnages ?? []).find((p) => p.id === id);
    const pose = per?.poses?.[key];
    if (Array.isArray(pose) && pose.length > 1) {
      const fps = opts.fps ?? 6;
      let i = 0;
      seqTimers[id] = setInterval(() => {
        i++;
        if (i >= pose.length) {
          clearInterval(seqTimers[id]);
          setFrame(id, pose.length - 1); // reste sur la dernière frame
          if (opts.then) { setPose(id, opts.then); setFrame(id, 0); }
          else if (!opts.hold) poseTimers[id] = setTimeout(() => { setPose(id, undefined); setFrame(id, 0); }, opts.endHold ?? 1400);
        } else setFrame(id, i);
      }, 1000 / fps);
    } else if (opts.ms) {
      poseTimers[id] = setTimeout(() => { setPose(id, undefined); }, opts.ms);
    }
  }
  function playSfx(url) { try { const a = new Audio(url); a.volume = 0.9; a.play().catch(() => {}); } catch (e) {} }
  // rouler → elle joue la séquence puis reste à FUMER ~20 s (frame finale tenue).
  // pendant ce temps, cliquer sur elle → elle souffle un ROND (monte + sort par le haut).
  let smoking = $state({});   // id -> true tant qu'elle fume
  let rings = $state([]);     // ronds de fumée actifs
  let ringSeq = 0;
  const setSmoking = (id, v) => { smoking = { ...smoking, [id]: v }; };
  function keepSmoking(id) {
    clearTimeout(poseTimers[id + '_smoke']);
    poseTimers[id + '_smoke'] = setTimeout(() => { setSmoking(id, false); setPose(id, undefined); setFrame(id, 0); }, 20000);
  }
  function rollJoint(id) {
    rollAsk = false;
    playSfx(`/media/nightdrive/sons/roll_${id}.wav`);
    playPose(id, 'roll', { fps: 3, then: 'smoke' }); // ~330 ms/frame → bien visible
    setSmoking(id, true);
    keepSmoking(id);
  }
  // clic sur un perso : si elle fume → elle souffle un rond
  function personaClick(perso) {
    if (p !== 'drive') return;
    if (smoking[perso.id]) blowRing(perso);
  }
  // UN SEUL rond qui MONTE de sa bouche jusqu'en haut en SE TRANSFORMANT à travers ses 6
  // frames (naissance → dissipation), avec un FONDU entre chaque image (pas de coupe sèche,
  // jamais deux frames superposées). Il sort quand elle crache (~1,1 s).
  function blowRing(perso) {
    playSfx('/media/nightdrive/sons/blow.wav');
    // TOUTE l'anim de fumée (elle crache → le rond monte au coin → se dissipe) est PEINTE
    // dans la séquence blow (8 frames). On joue juste la séquence, aucun rond codé.
    playPose(perso.id, 'blow', { fps: 3, then: 'smoke' });
    keepSmoking(perso.id);
  }
  // la radio joue → les perso qui ont une pose 'radio' s'y mettent (sauf s'ils roulent)
  $effect(() => {
    const playing = player.playing;
    for (const per of (SCENES[sceneTop]?.personnages ?? [])) {
      if (!per.poses?.radio) continue;
      if (playing && personaPose[per.id] !== 'roll') setPose(per.id, 'radio');
      else if (!playing && personaPose[per.id] === 'radio') setPose(per.id, undefined);
    }
  });
  // idle ALÉATOIRE : si un perso a plusieurs poses idle (`idlePoses`), il en change
  // tout seul de temps en temps (rien tant qu'il n'y a qu'une pose idle).
  $effect(() => {
    const iv = setInterval(() => {
      if (p !== 'drive') return;
      for (const per of (SCENES[sceneTop]?.personnages ?? [])) {
        const pool = per.idlePoses;
        if (!pool || pool.length < 2) continue;
        const cur = personaPose[per.id] ?? 'idle';
        if (cur !== 'idle' && !pool.includes(cur)) continue; // occupé (radio/roll)
        const next = pool[Math.floor(Math.random() * pool.length)];
        setPose(per.id, next === 'idle' ? undefined : next);
      }
    }, 8000);
    return () => clearInterval(iv);
  });
  // PRÉCHARGE des frames du perso (poses + ronds) dès qu'on entre dans une scène : sinon
  // elles se chargent à la volée au 1er clic et l'anim « saute » / paraît instantanée.
  $effect(() => {
    for (const per of (SCENES[sceneTop]?.personnages ?? [])) {
      const urls = [];
      if (per.poses) for (const v of Object.values(per.poses)) Array.isArray(v) ? urls.push(...v) : urls.push(v);
      if (per.smokeRing) urls.push(...per.smokeRing);
      if (per.src) urls.push(per.src);
      for (const u of urls) { const im = new Image(); im.src = u; }
    }
  });

  // une zone, ses destins : sortie → goto (si les images sont là) → open → lueur
  function zoneClick(z) {
    if (p !== 'drive') return;
    if (z.exit) { popScene(); return; }
    if (z.goto && sceneReady[z.goto]) { pushScene(z); return; }
    if (z.open?.type === 'arcade') { arcadeOpen = true; return; }
    if (z.open?.type === 'mantra') { sayMantra(); zoneSfx('pmu', 'terminal'); return; }
    if (z.open?.type === 'cocktails') { cocktail = COCKTAILS[0]; carteOpen = true; return; }
    if (z.open?.type === 'dj') { djOpen = true; return; }
    if (z.open?.type === 'carnet') { carnet = z.open.id; return; }
    if (z.open?.type === 'nokia') { phoneVue = 'accueil'; phoneOpen = true; zoneSfx('taverne', 'phone'); return; }
    if (z.open?.type === 'ciel') { cielOpen = true; return; }
    if (z.open?.type === 'k7') { k7Open = true; return; }
    if (z.open?.type === 'roll') { rollAsk = true; return; } // le sachet → « rouler un joint ? »
    // ---- les destinations branchées It26 ----
    if (z.open?.type === 'univers') { univers = z.open.id; zoneSfx(sceneTop, z.id); return; }
    if (z.open) { openRoom(z.open.type, z); return; } // sermon, confess, pourboire, grattage, paris, evenement, journal, photobooth, friperie, toilettes, internet
    // zone sans destin (décor pur) : une lueur brève
    lieuPulse = z.id;
    setTimeout(() => (lieuPulse = ''), 900);
  }

  // le transform de la racine : au repos le regard (translate), une scène
  // au-dessus = plongée dans la porte (scale, origine = la porte cliquée)
  const pcStyle = $derived(
    inScene
      ? `transform-origin:${stack[0].ox ?? 50}% ${stack[0].oy ?? 50}%; transform: scale(2.3);`
      : `transform: translate(${(-lookX * 9).toFixed(1)}px, ${(-lookY * 4).toFixed(1)}px);`
  );

  function onKey(e) {
    // le Nokia capte les flèches quand Snake tourne (et on ne scrolle pas la page)
    if (phoneOpen && phoneVue === 'snake' && !snake.dead) {
      const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
      if (d) { e.preventDefault(); snakeDir(d); return; }
    }
    if (phoneOpen && phoneVue === 'menu' && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      phoneNav(e.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (phoneOpen && e.key === 'Enter') { phoneOK(); return; }
    if (e.key !== 'Escape') return;
    // la sortie est toujours évidente (030) — et toujours par couches : le
    // téléphone → le bac → les platines → la borne → la salle → la carte →
    // le carnet → la scène → … → le bureau
    if (rollAsk) rollAsk = false;
    else if (phoneOpen) phoneBack();
    else if (univers) closeUnivers();
    else if (room) closeRoom();
    else if (cielOpen) cielOpen = false;
    else if (k7Open) k7Open = false;
    else if (djOpen && (deckA.bac || deckB.bac)) { deckA.bac = false; deckB.bac = false; }
    else if (djOpen) djOpen = false;
    else if (borne) borne = null;
    else if (arcadeOpen) arcadeOpen = false;
    else if (carteOpen) carteOpen = false;
    else if (carnet) carnet = null;
    else if (inScene) popScene();
    else exitNight();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if p !== 'off'}
  <div class="nd p-{p}" class:lit class:won={worldOn} class:cin={cockpitIn} class:inscene={inScene}>
    <!-- crépuscule : la lumière du bureau change avant que rien ne bouge -->
    <div class="tint"></div>

    <!-- ============ LE MONDE (à travers le pare-brise) ============ -->
    <div class="world">
      {#if paintCity}
        <!-- LA VILLE PEINTE : veilleuse en fond, chaque lieu s'embrase au
             survol (crop de la version allumée), le regard pivote vers lui -->
        <div class="pc" style={pcStyle}>
          <img class="pc-off" src={V_OFF} alt="" draggable="false" />
          <!-- la respiration : toute la lumière de la ville bat, très bas -->
          <img class="pc-breath" src={V_ON} alt="" draggable="false" />
          {#each QUAI as l (l.id)}
            <button
              class="lieu"
              class:fondu={!l.lum}
              class:halo={!!l.aura}
              class:pulse={lieuPulse === l.id}
              style="left:{l.x}%; top:{l.y}%; width:{l.w}%; height:{l.h}%;
                     {l.z ? `z-index:${l.z};` : ''}
                     {l.boost ? `--boost:${l.boost};` : ''}
                     {l.aura ? `--aura-a:${l.aura}cc; --aura-b:${l.aura}59;` : ''}
                     {l.lum
                       ? `background-image:url(${l.lum}); background-size:100% 100%;`
                       : `background-image:url(${V_ON});
                          background-size:${(10000 / l.w).toFixed(2)}% ${(10000 / l.h).toFixed(2)}%;
                          background-position:${((l.x / (100 - l.w)) * 100).toFixed(2)}% ${((l.y / (100 - l.h)) * 100).toFixed(2)}%;`}"
              onpointerenter={() => lieuEnter(l)}
              onpointerleave={lieuLeave}
              onclick={() => zoneClick(l)}
              aria-label={l.id}
            ></button>
          {/each}

          <!-- les instruments vivants, calés sur l'habitacle PEINT DANS la
               scène (images v2 : habitacle + ville d'un seul tenant) — ils
               vivent dans .pc pour suivre le regard et rester alignés -->
          <div class="iv">
          <span class="blockzone"></span>
          <span class="m-glass"><canvas class="mpx" bind:this={mcvs}></canvas></span>
          <div class="m-lcd"><div class="scroll"><span>{lcdLine}</span><span>{lcdLine}</span></div></div>
          <span class="m-transport">
            <button disabled={!canPrev} onclick={() => step(-1)} title="son précédent">⏮</button>
            <button disabled={!engaged} onclick={toggle} title={player.playing ? 'pause' : 'lecture'}>{player.playing ? '⏸' : '▶'}</button>
            <button disabled={!canNext} onclick={() => step(1)} title="son suivant">⏭</button>
            <button disabled={!engaged} onclick={eject} title="rendre l'antenne">⏏</button>
          </span>
          <span class="m-presets">
            {#each Array(6) as _, i}
              {@const it = PRESETS[i]}
              <button
                class:onair={it && player.trackId === it.id}
                disabled={!it || p !== 'drive'}
                onclick={() => preset(i)}
                title={it ? it.name : 'vide'}
              >{i + 1}</button>
            {/each}
          </span>
          <span class="m-clock">{clock}</span>
          <button class="m-contact" onclick={exitNight} disabled={p !== 'drive'} title="retour au bureau (Échap)">
            COUPER LE CONTACT
          </button>
          </div>
        </div>

        <!-- ============ LES SCÈNES GIGOGNES (D15) ============
             chaque niveau de la pile au-dessus du quai = un intérieur plein
             cadre, posé sur son parent qui plonge derrière lui (zoom-crossfade
             vers la porte cliquée). Échap dépile — la porte recule. -->
        {#each stack.slice(1) as s, i (i + '·' + s.id)}
          {@const sc = SCENES[s.id]}
          {@const below = i < stack.length - 2}
          <div
            class="sc"
            style="transform-origin:{s.ox ?? 50}% {s.oy ?? 50}%; transform: scale({below ? 2.3 : 1});"
            transition:arrive
          >
            <img class="pc-off" src={sc.off} alt="" draggable="false" />
            <img class="pc-breath" src={sc.on} alt="" draggable="false" />
            <!-- CALQUE EAU : shimmer animé clipé sur la bande d'eau (au-dessus du
                 fond, sous les perso). Fait « trembler » les reflets peints. -->
            {#if sc.water}
              <div class="water" style="left:{sc.water.x}%; top:{sc.water.y}%; width:{sc.water.w}%; height:{sc.water.h}%;"></div>
            {/if}
            <!-- LUMIÈRES VIVANTES : halos qui vacillent EN CONTINU, rendus SOUS les perso
                 (ils n'en bavent pas dessus) et au-dessus du fond (ils touchent la scène). -->
            {#if sc.lights}
              {#each sc.lights as lt (lt.id)}
                <div class="light" style="left:{lt.x}%; top:{lt.y}%; width:{lt.w}%; height:{lt.h}%; --glow:{lt.color};"></div>
              {/each}
            {/if}
            <!-- COLLAGE ANIMÉ (It32) : les perso découpés, posés sur le fond,
                 idle animé (respiration/balancement) ; survol → version « on ».
                 Rendus avant les zones : les objets gardent la priorité au clic. -->
            {#if sc.personnages}
              {#each sc.personnages as perso (perso.id)}
                {#if perso.shadow}
                  <!-- ombre-plancher (sous le perso) : réagit à la lévitation -->
                  <div class="perso-shadow" class:sh-levit={perso.anim === 'levit'} style="left:{perso.shadow.x}%; top:{perso.shadow.y}%; width:{perso.shadow.w}%; height:{perso.shadow.h}%;"></div>
                {/if}
                <div class="perso perso-{perso.anim}" class:solo={!!(perso.src || perso.poses)} class:smokeable={smoking[perso.id]} role="button" tabindex="-1" onclick={() => personaClick(perso)} style="left:{perso.x}%; top:{perso.y}%; width:{perso.w}%; height:{perso.h}%;">
                  {#if perso.poses}
                    <!-- les FRAMES d'une séquence restent crisp (src qui change) ; le CHANGEMENT
                         DE POSE fait un fondu → la fumée de la dernière frame se DISSIPE en
                         douceur au retour à « fume ». -->
                    {#key personaPose[perso.id] ?? 'idle'}
                      <img class="perso-src" src={resolvePose(perso)} alt="" draggable="false" transition:fade={{ duration: 550 }} />
                    {/key}
                  {:else if perso.src}
                    <img class="perso-src" src={perso.src} alt="" draggable="false" />
                  {:else}
                    <img class="perso-off" src={perso.off} alt="" draggable="false" />
                    <img class="perso-on" src={perso.on} alt="" draggable="false" />
                  {/if}
                </div>
              {/each}
            {/if}
            <!-- RONDS DE FUMÉE : montent et sortent par le haut (placeholder CSS,
                 remplacé par les frames noir de Vincent en 'screen' à réception). -->
            {#each rings as r (r.id)}
              <div class="ring-wrap" style="left:{r.x}%; --y0:{r.y}%;">
                {#key r.fi}
                  <img class="smoke-ring" src={r.frames[r.fi]} alt="" draggable="false" transition:fade={{ duration: 420 }} />
                {/key}
              </div>
            {/each}
            <!-- CALQUE AVANT-PLAN (It33) : devant les perso, mais SOUS les zones
                 (la lueur de survol de la zone passe par-dessus → l'objet s'allume) -->
            {#if sc.foreground}
              {#each sc.foreground as fg (fg.id)}
                <img class="fg-layer" src={fg.src} alt="" draggable="false" style="left:{fg.x}%; top:{fg.y}%; width:{fg.w}%; height:{fg.h}%;" />
              {/each}
            {/if}
            <!-- LE SEUIL d'abord dans le DOM : les zones passent au-dessus -->
            <button class="exit" onclick={popScene} title="ressortir (Échap)">
              <span class="exit-lab">▾ ressortir</span>
            </button>
            {#each sc.zones as z (z.id)}
              <button
                class="lieu"
                class:fondu={!z.lum && !z.light}
                class:zlight={z.light}
                class:halo={!!z.aura}
                class:pulse={lieuPulse === z.id}
                style="left:{z.x}%; top:{z.y}%; width:{z.w}%; height:{z.h}%;
                       {z.boost ? `--boost:${z.boost};` : ''}
                       {z.aura ? `--aura-a:${z.aura}cc; --aura-b:${z.aura}59;` : ''}
                       {z.light
                         ? ''
                         : z.lum
                         ? `background-image:url(${z.lum}); background-size:100% 100%;`
                         : `background-image:url(${sc.on});
                            background-size:${(10000 / z.w).toFixed(2)}% ${(10000 / z.h).toFixed(2)}%;
                            background-position:${((z.x / (100 - z.w)) * 100).toFixed(2)}% ${((z.y / (100 - z.h)) * 100).toFixed(2)}%;`}"
                onclick={() => zoneClick(z)}
                aria-label={z.id}
              ></button>
            {/each}
          </div>
        {/each}

        <!-- ============ LE CARNET D'ADRESSES (un flow, toutes les maisons) ============ -->
        {#if carnetSec}
          <div class="ard-room" role="dialog" aria-label={carnetSec.titre}>
            <div class="ard-panel">
              <div class="ard-head">
                <span class="ard-title">{carnetSec.titre}</span>
                <span class="ard-sub">— {carnetSec.sous} —</span>
                <button class="ard-close" onclick={() => (carnet = null)} title="reposer l'ardoise (Échap)">✕</button>
              </div>
              <ul class="ard-list">
                {#each carnetSec.entrees as a (a.nom)}
                  <li>
                    {#if a.lien}
                      <a class="ard-item" href={a.lien} target="_blank" rel="noopener noreferrer">
                        <b>{a.nom}</b>
                        {#if a.ville}<i class="ard-ville">{a.ville}</i>{/if}
                        {#if a.note}<span class="ard-note">{a.note}</span>{/if}
                        <span class="ard-go">↗</span>
                      </a>
                    {:else}
                      <span class="ard-item">
                        <b>{a.nom}</b>
                        {#if a.ville}<i class="ard-ville">{a.ville}</i>{/if}
                        {#if a.note}<span class="ard-note">{a.note}</span>{/if}
                      </span>
                    {/if}
                  </li>
                {/each}
              </ul>
              <div class="ard-foot">LA MAISON RECOMMANDE · Échap pour reposer l'ardoise</div>
            </div>
          </div>
        {/if}

        <!-- ============ LE CIEL ÉTOILÉ (la lanterne de la barque) ============ -->
        {#if cielOpen}
          <div class="ciel-room" role="dialog" aria-label="le ciel étoilé">
            <canvas class="ciel-px" width="384" height="216" bind:this={cielCvs}></canvas>
            <span class="ciel-hint">Échap pour redescendre</span>
          </div>
        {/if}

        <!-- ============ ROULER UN JOINT ? (le sachet de la barque) ============ -->
        {#if rollAsk}
          <div class="roll-ask" role="dialog" aria-label="rouler un joint">
            <div class="roll-card">
              <span class="roll-q">Rouler un joint ?</span>
              <span class="roll-sub">qui s'y colle&nbsp;?</span>
              <div class="roll-choices">
                <button onclick={() => rollJoint('myrtille')}>Myrtille</button>
                <button onclick={() => rollJoint('stick')}>Stick</button>
              </div>
              <button class="roll-no" onclick={() => (rollAsk = false)}>laisser le sachet</button>
            </div>
          </div>
        {/if}

        <!-- ============ LES CASSETTES (la boombox de la barque) ============ -->
        {#if k7Open}
          <div class="k7-room" role="dialog" aria-label="les cassettes">
            <div class="k7-panel">
              <div class="k7-head">
                <span class="k7-title">X-BASS</span>
                <span class="k7-sub">— la boîte à cassettes —</span>
                <button class="k7-close" onclick={() => (k7Open = false)} title="refermer la boîte (Échap)">✕</button>
              </div>
              <div class="k7-grid">
                {#each CASSETTES as c (c.titre)}
                  {@const onair = k7OnAir === c.titre}
                  <button class="k7" class:onair onclick={() => k7Play(c)} title={onair ? "à l'antenne" : "passer à l'antenne"}>
                    <span class="k7-coque">
                      <span class="k7-label" style="background:{c.couleur}">{c.titre}</span>
                      <span class="k7-fen">
                        <i class="k7-reel" class:spin={onair && player.playing}></i>
                        <i class="k7-reel r2" class:spin={onair && player.playing}></i>
                      </span>
                    </span>
                    {#if c.note}<em class="k7-note">{c.note}</em>{/if}
                  </button>
                {/each}
              </div>
              <div class="k7-foot">UNE CASSETTE = UNE PRISE D'ANTENNE · Échap pour refermer</div>
            </div>
          </div>
        {/if}

        <!-- ============ L'UNIVERS D'UN VITRAIL (cathédrale) ============
             une parenthèse dans la parenthèse : on ne change pas d'image, on
             change de dimension. Rosace vivante, plein cadre (univers.js). -->
        {#if univers}
          <div class="uni-room" class:ange={univers === 'ange'} role="dialog" aria-label="l'univers du vitrail">
            <canvas class="uni-px" width="384" height="216" bind:this={uCvs}></canvas>
            <span class="uni-hint">{univers === 'ange' ? 'la lumière te garde · Échap pour redescendre' : 'reste un peu · Échap pour redescendre'}</span>
          </div>
        {/if}

        <!-- ============ LE PRÊCHE (pupitre de la cathédrale) ============ -->
        {#if room === 'sermon'}
          <div class="nd-room" style="--ac:#e8c06a; --acglow:rgba(232,192,106,0.3)">
            <div class="nd-panel">
              <div class="nd-head">
                <span class="nd-title">LE PRÊCHE</span>
                <span class="nd-sub">— du haut du pupitre —</span>
                <button class="nd-close" onclick={closeRoom} title="redescendre (Échap)">✕</button>
              </div>
              {#key sermon}
                <blockquote class="sermon">
                  {#each (sermon ?? '').split('\n') as l}<span>{l || ' '}</span>{/each}
                </blockquote>
              {/key}
              <div class="sermon-act"><button class="preche-btn" onclick={preche}>✝ prêcher encore</button></div>
              <div class="nd-foot">AMEN · Échap pour redescendre</div>
            </div>
          </div>
        {/if}

        <!-- ============ LE CONFESSIONNAL (vocaux en boucle) ============ -->
        {#if room === 'confess'}
          <div class="confess-room" role="dialog" aria-label="le confessionnal">
            <div class="confess-grille"></div>
            <p class="confess-txt">Là pour vous parler.</p>
            <span class="confess-hint">approche l'oreille · (tes vocaux tournent si le fichier est déposé) · Échap</span>
          </div>
        {/if}

        <!-- ============ LE TRONC / LES BOUGIES (pourboire à l'artiste) ============ -->
        {#if room === 'pourboire'}
          <div class="nd-room" style="--ac:var(--v2000-jaune-sodium); --acglow:rgba(255,178,74,0.3)">
            <div class="nd-panel">
              <div class="nd-head">
                <span class="nd-title">LE TRONC</span>
                <span class="nd-sub">— une pièce pour l'artiste —</span>
                <button class="nd-close" onclick={closeRoom} title="s'éloigner (Échap)">✕</button>
              </div>
              <div class="cierges">
                {#each cierges as on, i (i)}
                  <button class="cierge" class:on onclick={() => allumer(i)} aria-label="allumer un cierge">
                    <span class="flamme"></span><span class="corps"></span>
                  </button>
                {/each}
              </div>
              {#if merci}{#key merci}<p class="merci">{merci}</p>{/key}{/if}
              {#if POURBOIRE.lien}
                <div class="vraie-piece">
                  <a href={POURBOIRE.lien} target="_blank" rel="noopener noreferrer">{POURBOIRE.titre} ↗</a>
                </div>
              {/if}
              <div class="nd-foot">ALLUME UN CIERGE · le geste suffit · Échap</div>
            </div>
          </div>
        {/if}

        <!-- ============ LE JEU À GRATTER (présentoir FDJ du PMU) ============ -->
        {#if room === 'grattage'}
          <div class="nd-room" style="--ac:#e0b84a; --acglow:rgba(224,184,74,0.32)">
            <div class="nd-panel">
              <div class="nd-head">
                <span class="nd-title">{TICKET.nom}</span>
                <span class="nd-sub">— {TICKET.prix} —</span>
                <button class="nd-close" onclick={closeRoom} title="reposer le ticket (Échap)">✕</button>
              </div>
              <div class="grat-zone">
                <div class="grat-fond" class:win={gratRevealed && /[!]/.test(gratResult?.gain ?? '')}>
                  <b class="grat-gain">{gratResult?.gain}</b>
                  <em class="grat-mot">{gratResult?.mot}</em>
                </div>
                {#if !gratRevealed}
                  <canvas
                    class="grat-cvs" width="300" height="150" bind:this={gratCvs}
                    onpointerdown={(e) => { gratting = true; gratAt(e); }}
                    onpointermove={(e) => { if (gratting) gratAt(e); }}
                    onpointerup={() => (gratting = false)}
                    onpointerleave={() => (gratting = false)}
                  ></canvas>
                {/if}
              </div>
              <div class="grat-act">
                <button class="grat-neuf" onclick={gratNeuf}>↻ nouveau ticket</button>
              </div>
              <div class="nd-foot">{TICKET.consigne.toUpperCase()} · Échap pour reposer</div>
            </div>
          </div>
        {/if}

        <!-- ============ LES PARIS SPORTIFS (la télé du PMU) ============ -->
        {#if room === 'paris'}
          <div class="nd-room" style="--ac:var(--v2000-vert-pmu); --acglow:rgba(74,208,160,0.3)">
            <div class="nd-panel">
              <div class="nd-head">
                <span class="nd-title">{PARIS.chaine}</span>
                <span class="nd-sub">— en direct du comptoir —</span>
                <button class="nd-close" onclick={closeRoom} title="éteindre (Échap)">✕</button>
              </div>
              <div class="paris-tv">
                <ul class="paris-list">
                  {#each PARIS.matchs as m (m.a + m.b)}
                    <li>
                      <span class="ph">{m.h}</span>
                      <span class="pteam">{m.a} <b>{m.coteA}</b></span>
                      <span class="pvs">vs</span>
                      <span class="pteam">{m.b} <b>{m.coteB}</b></span>
                    </li>
                  {/each}
                </ul>
                <div class="paris-band"><span>{PARIS.bandeau}{PARIS.bandeau}</span></div>
              </div>
              <div class="nd-foot">ÉCRAN DE DÉMO · le vrai jeu viendra · Échap</div>
            </div>
          </div>
        {/if}

        <!-- ============ L'ÉVÉNEMENT (bouteille de Ricard du PMU) ============ -->
        {#if room === 'evenement'}
          <div class="nd-room" style="--ac:#ff7a3a; --acglow:rgba(255,122,58,0.3)">
            <div class="nd-panel">
              <div class="nd-head">
                <span class="nd-title">L'AFFICHE</span>
                <span class="nd-sub">— punaisée derrière le zinc —</span>
                <button class="nd-close" onclick={closeRoom} title="reposer (Échap)">✕</button>
              </div>
              <div class="evt" class:vide={evtVide}>
                <b class="evt-titre">{EVT.titre}</b>
                {#if EVT.quand}<span class="evt-quand">{EVT.quand}</span>{/if}
                {#if EVT.ou}<span class="evt-ou">{EVT.ou}</span>{/if}
                {#if EVT.ligne}<p class="evt-ligne">{EVT.ligne}</p>{/if}
                {#if EVT.lien}<a class="evt-cta" href={EVT.lien} target="_blank" rel="noopener noreferrer">{EVT.cta ?? 'en savoir plus'} ↗</a>{/if}
              </div>
              <div class="nd-foot">Échap pour reposer</div>
            </div>
          </div>
        {/if}

        <!-- ============ LE JOURNAL (Sud Ouest, sur le comptoir du PMU) ============ -->
        {#if room === 'journal'}
          <div class="nd-room" style="--ac:#d8cdb8; --acglow:rgba(216,205,184,0.25)">
            <div class="nd-panel jour-panel">
              <div class="jour-tete">
                <span class="jour-nom">{JOURNAL.nom}</span>
                <span class="jour-ed">{JOURNAL.edition}</span>
                <button class="nd-close" onclick={closeRoom} title="reposer le canard (Échap)">✕</button>
              </div>
              <div class="jour-body">
                <ul class="jour-som">
                  {#each JOURNAL.articles as a (a.titre)}
                    <li><button class:sel={journalArt === a} onclick={() => (journalArt = a)}>{a.titre}</button></li>
                  {/each}
                </ul>
                <article class="jour-art">
                  {#key journalArt?.titre}
                    <h3>{journalArt?.titre}</h3>
                    {#if journalArt?.date}<span class="jour-date">{journalArt.date}</span>{/if}
                    {#if journalArt?.chapo}<p class="jour-chapo">{journalArt.chapo}</p>{/if}
                    {#if journalArt?.corps}{#each journalArt.corps.split('\n\n') as par (par)}<p>{par}</p>{/each}{/if}
                  {/key}
                </article>
              </div>
              <div class="nd-foot">Échap pour reposer le canard</div>
            </div>
          </div>
        {/if}

        <!-- ============ LE PHOTOBOOTH (cabine de LA RIDE) ============ -->
        {#if room === 'photobooth'}
          <div class="nd-room" style="--ac:#ff4fd8; --acglow:rgba(255,79,216,0.3)">
            <div class="nd-panel">
              <div class="nd-head">
                <span class="nd-title">PHOTOBOOTH</span>
                <span class="nd-sub">— souvenirs de la piste —</span>
                <button class="nd-close" onclick={closeRoom} title="ranger la bande (Échap)">✕</button>
              </div>
              {#if PHOTOS.length}
                <div class="pb-strip">
                  {#each PHOTOS as ph (ph.src)}
                    <figure class="pb-shot">
                      <img src={ph.src} alt={ph.legende ?? ''} draggable="false" />
                      {#if ph.legende}<figcaption>{ph.legende}</figcaption>{/if}
                    </figure>
                  {/each}
                </div>
              {:else}
                <p class="pb-vide">la pellicule est vierge.<br />le club vient d'ouvrir — reviens après la fête.</p>
              {/if}
              <div class="nd-foot">Échap pour ranger la bande</div>
            </div>
          </div>
        {/if}

        <!-- ============ LA FRIPERIE (le vestiaire de LA RIDE) ============ -->
        {#if room === 'friperie'}
          <div class="nd-room" style="--ac:#c88ad0; --acglow:rgba(200,138,208,0.28)">
            <div class="nd-panel">
              <div class="nd-head">
                <span class="nd-title">LA FRIPE</span>
                <span class="nd-sub">— le vestiaire —</span>
                <button class="nd-close" onclick={closeRoom} title="raccrocher (Échap)">✕</button>
              </div>
              {#if FRINGUES.length}
                <div class="frip-rack">
                  {#each FRINGUES as f (f.nom)}
                    <svelte:element
                      this={f.lien ? 'a' : 'span'}
                      class="fringue"
                      style="--fc:{f.couleur ?? '#8a7ad0'}"
                      href={f.lien || undefined}
                      target={f.lien ? '_blank' : undefined}
                      rel={f.lien ? 'noopener noreferrer' : undefined}
                    >
                      <span class="fr-piece">
                        {#if f.src}<img src={f.src} alt={f.nom} draggable="false" />{:else}<span class="fr-cintre"></span>{/if}
                      </span>
                      <b class="fr-nom">{f.nom}</b>
                      {#if f.prix}<span class="fr-prix">{f.prix}</span>{/if}
                      {#if f.note}<em class="fr-note">{f.note}</em>{/if}
                      {#if f.lien}<span class="fr-go">↗</span>{/if}
                    </svelte:element>
                  {/each}
                </div>
              {:else}
                <p class="frip-vide">les portants sont vides.<br />la friperie arrive — bientôt des pièces à décrocher.</p>
              {/if}
              <div class="nd-foot">Échap pour raccrocher</div>
            </div>
          </div>
        {/if}

        <!-- ============ LES TOILETTES (le lieu à sound design de LA RIDE) ============ -->
        {#if room === 'toilettes'}
          <div class="wc-room" role="dialog" aria-label="les toilettes">
            <div class="wc-wall">
              <p class="wc-graff g1">VINCENT 2000 ÉTAIT LÀ</p>
              <p class="wc-graff g2">pour un bon son, demande au zinc</p>
              <p class="wc-graff g3">♡ + ✝</p>
              <p class="wc-graff g4">la nuit appartient à ceux qui écoutent</p>
              <p class="wc-graff g5">93.00 FM</p>
            </div>
            <span class="wc-hint">un lieu à sound design — le son viendra · Échap</span>
          </div>
        {/if}

        <!-- ============ INTERNET (la tour radio du quai) ============ -->
        {#if room === 'internet'}
          <div class="nd-room" style="--ac:#3fe3ff; --acglow:rgba(63,227,255,0.28)">
            <div class="nd-panel">
              <div class="nd-head">
                <span class="nd-title">V2000 NET</span>
                <span class="nd-sub">— la tour hertzienne —</span>
                <button class="nd-close" onclick={closeRoom} title="raccrocher (Échap)">✕</button>
              </div>
              <pre class="net-screen">{#each netLines as l, i (i)}<span class="net-line">{l}</span>
{/each}<span class="net-cur">_</span></pre>
              <div class="nd-foot">RTC 56k · Échap pour raccrocher</div>
            </div>
          </div>
        {/if}

        <!-- ============ LE NOKIA 3310 (le téléphone de la taverne) ============ -->
        {#if phoneOpen}
          <div class="tel-room" role="dialog" aria-label="le téléphone">
            <div class="tel-body">
              <div class="tel-ecran">
                <div class="lcdv">
                  {#if phoneVue === 'accueil'}
                    <div class="lcd-bar"><span class="lcd-sig">▮▮▮▮</span><span class="lcd-bat">▮▮▮</span></div>
                    <div class="lcd-mid">
                      <span class="lcd-op">V2000</span>
                      <span class="lcd-heure">{clock}</span>
                    </div>
                    <div class="lcd-soft">Menu</div>
                  {:else if phoneVue === 'menu'}
                    <div class="lcd-titre">Menu</div>
                    <ul class="lcd-menu">
                      {#each MENU_3310 as m, i (m)}
                        <li class:sel={i === menuIdx}>{m}</li>
                      {/each}
                    </ul>
                    <div class="lcd-soft">Choisir</div>
                  {:else if phoneVue === 'contacts'}
                    <div class="lcd-titre">Contacts</div>
                    <ul class="lcd-contacts">
                      {#each CONTACTS as c (c.nom)}
                        <li><b>{c.nom}</b><span>{c.num}</span></li>
                      {/each}
                    </ul>
                    <div class="lcd-soft">Retour</div>
                  {:else if phoneVue === 'messages'}
                    <div class="lcd-titre">Messages</div>
                    <div class="lcd-vide">Aucun message.<br />(personne n'a ton 06)</div>
                    <div class="lcd-soft">Retour</div>
                  {:else if phoneVue === 'snake'}
                    <canvas class="lcd-snake" width="84" height="48" bind:this={snakeCvs}></canvas>
                    <div class="lcd-score">
                      {#if snake.dead}GAME OVER · {snake.score} — OK pour rejouer{:else}{snake.score}{/if}
                    </div>
                  {/if}
                </div>
              </div>
              <div class="tel-nav">
                <button class="tn-c" onclick={phoneBack} title="C — retour">C</button>
                <div class="tn-mid">
                  <button class="tn-up" onclick={() => phoneNav(-1)} title="haut">▲</button>
                  <button class="tn-ok" onclick={phoneOK} title="OK">●</button>
                  <button class="tn-dn" onclick={() => phoneNav(1)} title="bas">▼</button>
                </div>
                <button class="tn-x" onclick={() => (phoneOpen = false)} title="raccrocher">✕</button>
              </div>
              <div class="tel-pad">
                {#each ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'] as k (k)}
                  <button
                    class="touche"
                    onclick={() => {
                      if (phoneVue === 'snake') {
                        if (k === '2') snakeDir([0, -1]);
                        else if (k === '8') snakeDir([0, 1]);
                        else if (k === '4') snakeDir([-1, 0]);
                        else if (k === '6') snakeDir([1, 0]);
                      }
                    }}
                  >{k}</button>
                {/each}
              </div>
              <span class="tel-marque">NOKIA</span>
            </div>
          </div>
        {/if}

        <!-- la voix du comptoir : le mantra flotte au-dessus du seuil -->
        {#if mantra}
          {#key mantra}
            <p class="mantra"><span>« {mantra} »</span></p>
          {/key}
        {/if}

        <!-- ============ LA CARTE DE LA RIDE (les cocktails du bar) ============ -->
        {#if carteOpen}
          <div class="bar-room" role="dialog" aria-label="la carte des cocktails">
            <div class="bar-panel">
              <div class="bar-head">
                <span class="bar-title">LA CARTE</span>
                <span class="bar-sub">— LA RIDE —</span>
                <button class="bar-close" onclick={() => (carteOpen = false)} title="reposer la carte (Échap)">✕</button>
              </div>
              <div class="bar-body">
                <ul class="bar-list">
                  {#each COCKTAILS as c (c.nom)}
                    <li>
                      <button class:sel={cocktail === c} onclick={() => (cocktail = c)}>{c.nom}</button>
                    </li>
                  {/each}
                </ul>
                <div class="bar-fiche">
                  {#key cocktail.nom}
                    <div class="verre-zone">
                      <svg class="verre" viewBox="0 0 120 180">
                        <defs>
                          <linearGradient id="robe" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stop-color={cocktail.robe[0]} />
                            <stop offset="1" stop-color={cocktail.robe[1]} />
                          </linearGradient>
                          <clipPath id="dedans"><path d={VERRES[cocktail.verre].liquid} /></clipPath>
                        </defs>
                        <!-- le liquide, sa robe, ses bulles -->
                        <path class="liquide" d={VERRES[cocktail.verre].liquid} fill="url(#robe)" />
                        <g clip-path="url(#dedans)">
                          <circle class="bulle b1" cx="54" cy="150" r="2" />
                          <circle class="bulle b2" cx="63" cy="150" r="1.4" />
                          <circle class="bulle b3" cx="59" cy="150" r="1.1" />
                        </g>
                        <!-- le verre -->
                        <path class="cristal" d={VERRES[cocktail.verre].glass} fill="none" />
                      </svg>
                    </div>
                    <div class="fiche">
                      <b class="fnom">{cocktail.nom}</b>
                      <ul class="compo">
                        {#each cocktail.compo as [ing, dose] (ing)}
                          <li><span class="ing">{ing}</span><span class="pts"></span><span class="dose">{dose}</span></li>
                        {/each}
                      </ul>
                      {#if cocktail.note}<em class="fnote">{cocktail.note}</em>{/if}
                    </div>
                  {/key}
                </div>
              </div>
              <div class="bar-foot">SANTÉ · Échap pour reposer la carte</div>
            </div>
          </div>
        {/if}

        <!-- ============ LE DJ BOOTH : deux CDJ, piste A / piste B ============ -->
        {#snippet cdj(d, lettre)}
          <div class="deck">
            <span class="deck-tag">PISTE {lettre}</span>
            <button class="deck-screen" class:vide={!d.nom} onclick={() => (d.bac = !d.bac)} title="choisir un disque">
              {d.nom ?? '· CHARGER UN DISQUE ·'}
            </button>
            <div class="jog" class:spin={d.playing}><i></i></div>
            <div class="deck-btns">
              <button class="cue" onclick={() => deckCue(d)} title="retour au départ">CUE</button>
              <button class="go" class:on={d.playing} onclick={() => deckPlay(d)} title={d.playing ? 'pause' : 'lecture'}>
                {d.playing ? '⏸' : '⏵'}
              </button>
            </div>
            <label class="pitch">
              <span>PITCH {d.rate === 1 ? '±0' : ((d.rate - 1) * 100).toFixed(0) > 0 ? '+' + ((d.rate - 1) * 100).toFixed(0) : ((d.rate - 1) * 100).toFixed(0)}%</span>
              <input type="range" min="-8" max="8" step="1" value={(d.rate - 1) * 100}
                oninput={(e) => (d.rate = 1 + e.currentTarget.valueAsNumber / 100)} />
            </label>
            {#if d.bac}
              <div class="bac" role="listbox" aria-label="le bac à disques">
                {#each BAC as t (t.src)}
                  <button onclick={() => deckLoad(d, t)}>{t.nom}</button>
                {/each}
                {#if !BAC.length}<span class="bac-vide">le bac est vide — dépose des sons (djbooth.js)</span>{/if}
              </div>
            {/if}
          </div>
        {/snippet}
        {#if djOpen}
          <div class="dj-room" role="dialog" aria-label="les platines">
            <div class="dj-panel">
              <div class="dj-head">
                <span class="dj-title">V2000 DJ</span>
                <span class="dj-sub">— la cabine de LA RIDE —</span>
                <button class="dj-close" onclick={() => (djOpen = false)} title="quitter la cabine (Échap)">✕</button>
              </div>
              <div class="dj-body">
                {@render cdj(deckA, 'A')}
                <div class="mixer">
                  <label class="voie">
                    <span>A</span>
                    <input class="vert" type="range" min="0" max="1" step="0.01" value={deckA.vol}
                      oninput={(e) => (deckA.vol = e.currentTarget.valueAsNumber)} />
                  </label>
                  <label class="voie">
                    <span>B</span>
                    <input class="vert" type="range" min="0" max="1" step="0.01" value={deckB.vol}
                      oninput={(e) => (deckB.vol = e.currentTarget.valueAsNumber)} />
                  </label>
                  <label class="xf">
                    <input type="range" min="0" max="1" step="0.01" value={xfade}
                      oninput={(e) => (xfade = e.currentTarget.valueAsNumber)} />
                    <span class="xf-lab"><b>A</b><em>crossfader</em><b>B</b></span>
                  </label>
                </div>
                {@render cdj(deckB, 'B')}
              </div>
              <div class="dj-foot">DEUX PISTES, UN SEUL MONDE · Échap pour redescendre</div>
            </div>
          </div>
        {/if}
        <!-- le moteur procédural continue en coulisse : il anime le rétroviseur -->
        <canvas class="px ghost" bind:this={cvs}></canvas>
      {:else}
        <!-- sur-cadrage + glissement : le regard se pose sur les portes, pas sur la souris -->
        <canvas
          class="px"
          class:door={hovering}
          bind:this={cvs}
          style="transform: translate({(-lookX * 9).toFixed(1)}px, {(-lookY * 4).toFixed(1)}px)"
          onpointermove={worldMove}
          onpointerleave={worldLeave}
          onclick={worldClick}
        ></canvas>
      {/if}
      {#if !paintCity}<div class="scan"></div>{/if}
    </div>

    <!-- le pare-brise CSS (poussière, rayures, reflets) : réservé au monde
         procédural — l'image peinte de Vincent se suffit, AUCUNE couche
         d'effet par-dessus -->
    {#if !paintCity}
      <div class="shield">
        <span class="arc"></span>
        <span class="arc a2"></span>
        <span class="glow"></span>
      </div>
    {/if}

    <!-- ============ L'HABITACLE ============
         (images ville v2 : l'habitacle est peint DANS la scène — les couches
         ci-dessous ne servent que de fallback tant que la ville peinte manque) -->
    {#if paintCity}
      <!-- rien : tout vit dans .pc -->
    {:else if cabURL}
      <!-- l'habitacle peint : l'image de Vincent, pare-brise détouré, avec
           les instruments vivants calés dessus (l'image est étirée en
           100 %/100 % : les positions en % restent alignées partout) -->
      <div class="cab" class:on={cockpitIn}>
        <img class="cabimg" src={cabURL} alt="" draggable="false" />
        <!-- la planche de bord avale les clics (la ville reste cliquable
             uniquement à travers le pare-brise) -->
        <span class="blockzone"></span>
        <!-- le rétro vivant, dans le miroir peint -->
        <span class="m-glass"><canvas class="mpx" bind:this={mcvs}></canvas></span>
        <!-- l'autoradio : afficheur + commandes posés sur la façade peinte -->
        <div class="m-lcd"><div class="scroll"><span>{lcdLine}</span><span>{lcdLine}</span></div></div>
        <span class="m-transport">
          <button disabled={!canPrev} onclick={() => step(-1)} title="son précédent">⏮</button>
          <button disabled={!engaged} onclick={toggle} title={player.playing ? 'pause' : 'lecture'}>{player.playing ? '⏸' : '▶'}</button>
          <button disabled={!canNext} onclick={() => step(1)} title="son suivant">⏭</button>
          <button disabled={!engaged} onclick={eject} title="rendre l'antenne">⏏</button>
        </span>
        <span class="m-presets">
          {#each Array(6) as _, i}
            {@const it = PRESETS[i]}
            <button
              class:onair={it && player.trackId === it.id}
              disabled={!it || p !== 'drive'}
              onclick={() => preset(i)}
              title={it ? it.name : 'vide'}
            >{i + 1}</button>
          {/each}
        </span>
        <!-- l'horloge du bureau, continuée sur la planche -->
        <span class="m-clock">{clock}</span>
        <!-- la sortie, toujours évidente -->
        <button class="m-contact" onclick={exitNight} disabled={p !== 'drive'} title="retour au bureau (Échap)">
          COUPER LE CONTACT
        </button>
      </div>
    {:else}
    <div class="roof"></div>
    <div class="pillar pl"></div>
    <div class="pillar pr"></div>

    <div class="mirror">
      <span class="glass"><canvas class="mpx" bind:this={mcvs}></canvas></span>
      <span class="pine">🌲</span>
    </div>

    <div class="cockpit">
      <div class="dash">
        <!-- combiné : compteur au repos + l'heure du bureau, continuée -->
        <div class="cluster">
          <svg class="speedo" viewBox="0 0 120 70">
            <path d="M 14 62 A 50 50 0 0 1 106 62" fill="none" stroke="currentColor" stroke-width="2"/>
            <g class="ticks">
              <line x1="18" y1="58" x2="24" y2="53"/><line x1="30" y1="40" x2="36" y2="37"/>
              <line x1="50" y1="26" x2="53" y2="32"/><line x1="70" y1="26" x2="67" y2="32"/>
              <line x1="90" y1="40" x2="84" y2="37"/><line x1="102" y1="58" x2="96" y2="53"/>
            </g>
            <line class="needle" x1="60" y1="62" x2="22" y2="56"/>
            <circle cx="60" cy="62" r="3.5" fill="currentColor"/>
            <text x="60" y="50" text-anchor="middle" font-size="8">km/h</text>
          </svg>
          <span class="dclock">{clock}</span>
        </div>

        <span class="vent" aria-hidden="true"></span>

        <!-- L'AUTORADIO — façade custom, boutons physiques, afficheur vivant -->
        <div class="radio">
          <div class="face-top">
            <div class="lcd">
              <div class="scroll"><span>{lcdLine}</span><span>{lcdLine}</span></div>
            </div>
            <div class="freqbox">
              <span class="fq">93.00<em>FM</em></span>
              <span class="eq" class:run={player.playing}><i></i><i></i><i></i><i></i><i></i></span>
            </div>
          </div>
          <div class="face-bot">
            <span class="knob" title="volume"><i></i></span>
            <span class="presets">
              {#each Array(6) as _, i}
                {@const it = PRESETS[i]}
                <button
                  class="pre"
                  class:on={it && player.trackId === it.id}
                  disabled={!it || p !== 'drive'}
                  onclick={() => preset(i)}
                  title={it ? it.name : 'vide'}
                >{i + 1}</button>
              {/each}
            </span>
            <span class="transport">
              <button disabled={!canPrev} onclick={() => step(-1)} title="son précédent">⏮</button>
              <button class="play" disabled={!engaged} onclick={toggle} title={player.playing ? 'pause' : 'lecture'}>
                {player.playing ? '⏸' : '▶'}
              </button>
              <button disabled={!canNext} onclick={() => step(1)} title="son suivant">⏭</button>
              <button class="ej" disabled={!engaged} onclick={eject} title="rendre l'antenne">⏏</button>
            </span>
            <span class="brandtx">V2000<em>TX</em></span>
          </div>
          <span class="screw tl"></span><span class="screw tr"></span>
          <span class="screw bl"></span><span class="screw br"></span>
        </div>

        <span class="vent v2" aria-hidden="true"></span>

        <!-- le contact : la sortie, toujours évidente -->
        <div class="keyzone">
          <button class="contact" onclick={exitNight} disabled={p !== 'drive'} title="retour au bureau (Échap)">
            <span class="keyring"><span class="key"></span></span>
            <span class="klab">COUPER LE CONTACT</span>
            <em>retour au bureau</em>
          </button>
        </div>
      </div>

      <div class="wheel"></div>
    </div>
    {/if}

    <!-- ============ LA SALLE D'ARCADE (dossier Jeux, métamorphosé) ============ -->
    {#if arcadeOpen}
      <div class="arc-room" role="dialog" aria-label="salle d'arcade">
        <div class="arc-panel">
          <div class="arc-head">
            <span class="arc-title">★ ARCADE ★</span>
            <span class="arc-sub">— la salle des jeux —</span>
            <button class="arc-close" onclick={closeArcade} title="ressortir (Échap)">✕</button>
          </div>
          {#if borne}
            <!-- devant une borne : elle répond avec son écran -->
            <div class="arc-screen">
              <span class="arc-glyph">{borne.glyph}</span>
              <b>{borne.name}</b>
              <pre>{borne.message}</pre>
              <button class="arc-back" onclick={() => (borne = null)}>↩ autres bornes</button>
            </div>
          {:else}
            <div class="arc-grid">
              {#each BORNES as b (b.id)}
                <button class="borne" onclick={() => (borne = b)} title={b.desc}>
                  <span class="bscreen"><span class="bglyph">{b.glyph}</span></span>
                  <span class="bname">{b.name}</span>
                  <span class="bmeta">{b.version} {b.year}</span>
                </button>
              {/each}
            </div>
            <div class="arc-foot">INSERT COIN · une borne = un jeu du bureau · Échap pour ressortir</div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- vignette pare-brise (monde procédural seulement) -->
    {#if !paintCity}<div class="vignette"></div>{/if}
  </div>
{/if}

<style>
  /* palette de la nuit — locale à la Destination, le bureau n'en hérite jamais */
  .nd {
    --cyan: #3fe3ff;
    --pink: #ff4fd8;
    --amber: var(--v2000-jaune-sodium);
    --lcd: #ffa53a;
    --dashk: #16161c;
    position: fixed;
    inset: 0;
    z-index: 100000;
    overflow: hidden;
    font-family: inherit;
    background: transparent;
  }

  /* ---- acte 1 : le crépuscule ---- */
  .tint {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, #060a1c 0%, #0d1430 60%, #1a1030 100%);
    opacity: 0;
    transition: opacity 950ms ease;
  }
  /* le ralenti : la caméra est posée DANS une voiture dont le moteur tourne.
     Sub-pixel, deux périodes superposées, jamais un « shake » — le cerveau le
     sent plus qu'il ne le voit (l'habitacle ET la ville bougent ensemble :
     c'est la caméra qui vit, pas un élément). */
  .nd.lit { animation: ralenti-cam 1.35s linear infinite; }
  @keyframes ralenti-cam {
    0%, 100% { transform: translate(0, 0); }
    24% { transform: translate(0.15px, 0.5px); }
    47% { transform: translate(-0.1px, 0.15px); }
    72% { transform: translate(0.1px, 0.6px); }
  }

  .p-dusk .tint { opacity: 0.55; }
  .p-migration .tint { opacity: 0.85; }
  .won .tint { opacity: 1; }
  .p-return-dawn .tint { opacity: 0; transition: opacity 1400ms ease; }
  .tint { pointer-events: none; }

  /* ---- le monde : bitmap plein cadre ---- */
  .world {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1300ms ease;
    background: #04041a;
  }
  .won .world { opacity: 1; }
  .p-return-cabin .world { opacity: 0.4; transition: opacity 1300ms ease; }
  .p-return-dawn .world { opacity: 0; }

  .px {
    display: block;
    position: absolute;
    /* sur-cadrage : la marge que le regard peut consommer sans montrer les bords */
    width: 106%;
    height: 106%;
    left: -3%;
    top: -3%;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    /* le poids de la tête qui tourne : lent, amorti, jamais nerveux (menus PS2) */
    transition: transform 1150ms cubic-bezier(0.32, 0.04, 0.14, 1);
  }
  .px.door { cursor: pointer; }
  .px.ghost { display: none; } /* il ne dessine plus l'écran, seulement le rétro */

  /* ---- la ville peinte : mêmes sur-cadrage et poids de tête que le canvas.
     Remontée de 16 % : l'image de Vincent contient son propre bas de caisse,
     et ses commerces vivent dans sa moitié basse — on les place dans le
     pare-brise, au-dessus de la planche de bord peinte. ---- */
  .pc {
    position: absolute;
    /* sur-cadrage minimal : juste de quoi couvrir le mouvement du regard (~9px),
       plus les bords ne sont quasi plus rognés (avant : 106 % → 3 % coupés) */
    width: 102%;
    height: 102%;
    left: -1%;
    top: -1%;
    transition: transform 1150ms cubic-bezier(0.32, 0.04, 0.14, 1);
  }
  .pc-off, .pc-breath {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    user-select: none;
  }
  /* les instruments vivants en mode peint : positions en % de la scène v2
     (quai) — mêmes classes m-*, seules les coordonnées changent */
  .iv { position: absolute; inset: 0; pointer-events: none; }
  .iv .m-glass { left: 42%; top: 6.3%; width: 19.8%; height: 9.4%; }
  .iv .m-lcd { left: 46.2%; top: 59.6%; width: 10.2%; height: 4%; }
  .iv .m-transport { left: 45.8%; top: 66.5%; width: 11%; height: 4.5%; }
  .iv .m-presets { left: 45.8%; top: 71.5%; width: 11%; height: 4%; }
  .iv .m-clock { left: 83%; top: 50%; width: 6.6%; height: 4.6%; }
  .iv .blockzone { top: 46%; }

  /* ---- les scènes gigognes (D15) : un intérieur = une couche plein cadre,
     mêmes sur-cadrage et images que le quai. Le parent plonge derrière elle
     (scale vers la porte, transition ci-dessous) pendant qu'elle arrive. ---- */
  .sc {
    position: absolute;
    inset: 0; /* intérieurs : PAS de sur-cadrage — l'image entière est visible, jamais coupée */
    background: #04041a;
    transition: transform 1050ms cubic-bezier(0.32, 0.04, 0.14, 1);
  }
  /* dans un intérieur : plus de moteur au ralenti ni de pare-brise (rayures,
     reflets, arcs d'essuie-glace) — on est descendu de la voiture.
     Spécificité renforcée : ces règles doivent battre .nd.lit et .won .shield */
  .nd.inscene.lit { animation: none; }
  .nd.inscene .shield { opacity: 0; }

  /* le seuil : la bande basse de l'image ramène à la scène précédente.
     Au repos, un murmure (le libellé respire à peine) ; le survol assombrit
     doucement le bas — on sent qu'on recule vers la porte */
  .exit {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 12%;
    padding: 0 0 1.2%;
    border: none;
    outline: none; /* même règle que .lieu : pas d'anneau de focus dans le monde peint */
    background: linear-gradient(0deg, rgba(2, 2, 14, 0), transparent);
    cursor: pointer;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    transition: background 500ms ease;
  }
  .exit:hover { background: linear-gradient(0deg, rgba(2, 2, 14, 0.55), transparent); }
  .exit-lab {
    font-size: 10.5px;
    letter-spacing: 0.3em;
    color: rgba(226, 232, 255, 0.42);
    text-shadow: 0 0 8px rgba(120, 150, 255, 0.25);
    animation: exit-breath 3.4s ease-in-out infinite alternate;
    transition: color 350ms ease, text-shadow 350ms ease;
  }
  .exit:hover .exit-lab {
    color: #eef2ff;
    text-shadow: 0 0 12px rgba(140, 170, 255, 0.75);
  }
  @keyframes exit-breath {
    from { opacity: 0.55; }
    to { opacity: 1; }
  }

  /* la voix du comptoir : une phrase qui monte du zinc, reste, s'efface.
     Pas une bulle d'UI — un sous-titre chaud, comme une voix off */
  .mantra {
    position: absolute;
    left: 10%;
    right: 10%;
    bottom: 16%;
    margin: 0;
    text-align: center;
    pointer-events: none;
    animation: mantra-vie 7s ease forwards;
  }
  .mantra span {
    display: inline-block;
    padding: 10px 18px;
    font-size: clamp(13px, 1.4vw, 19px);
    font-style: italic;
    letter-spacing: 0.06em;
    line-height: 1.6;
    color: #ffe9c9;
    text-shadow: 0 0 14px rgba(255, 178, 74, 0.55), 0 2px 6px rgba(0, 0, 0, 0.9);
    background: rgba(6, 4, 2, 0.42);
    border-radius: 6px;
  }
  @keyframes mantra-vie {
    0% { opacity: 0; transform: translateY(10px); }
    6% { opacity: 1; transform: translateY(0); }
    88% { opacity: 1; }
    100% { opacity: 0; }
  }

  /* ---- LA CARTE DE LA RIDE : le tableau du bar, ouvert comme un menu de
     jeu — néon rouge, bois brûlé, le cocktail vit dans son verre ---- */
  .bar-room {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 2, 4, 0.6);
    animation: arc-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .bar-panel {
    width: min(620px, 90vw);
    background: linear-gradient(180deg, #1d0a0a 0%, #120506 100%);
    border: 2px solid var(--v2000-rouge-nuit);
    border-radius: 6px;
    box-shadow:
      0 0 22px rgba(255, 49, 64, 0.35),
      0 0 60px rgba(255, 49, 64, 0.12),
      inset 0 0 40px rgba(0, 0, 0, 0.6);
    padding: 14px 16px 12px;
    position: relative;
    overflow: hidden;
  }
  .bar-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0 1px, transparent 1px 3px);
  }
  .bar-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .bar-title {
    color: var(--v2000-rouge-nuit);
    font-size: 15px;
    letter-spacing: 0.3em;
    text-shadow: 0 0 8px rgba(255, 49, 64, 0.9), 0 0 22px rgba(255, 49, 64, 0.45);
    animation: arc-buzz 3.7s steps(2) infinite;
  }
  .bar-sub { color: #8a5252; font-size: 9px; letter-spacing: 0.18em; }
  .bar-close {
    margin-left: auto;
    color: #ffb1b8;
    font-size: 12px;
    width: 24px; height: 20px;
    border: 1px solid #6e2430;
    border-radius: 3px;
    background: #2a0d12;
  }
  .bar-close:hover { color: #fff; border-color: var(--v2000-rouge-nuit); }
  .bar-body {
    position: relative;
    display: grid;
    grid-template-columns: 42% 1fr;
    gap: 12px;
    min-height: 240px;
  }
  .bar-list {
    margin: 0;
    padding: 0 4px 0 0;
    list-style: none;
    max-height: 280px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #6e2430 transparent;
  }
  .bar-list button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 6px 9px;
    color: #d9a8a8;
    font-size: 11px;
    letter-spacing: 0.12em;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    transition: color 150ms ease, border-color 150ms ease;
  }
  .bar-list button:hover { color: #ffe4e6; }
  .bar-list button.sel {
    color: #ff8f98;
    border-color: #6e2430;
    background: #220a0e;
    text-shadow: 0 0 7px rgba(255, 49, 64, 0.6);
  }
  .bar-fiche {
    position: relative;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 6px 2px;
    animation: fiche-in 400ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  @keyframes fiche-in {
    from { opacity: 0; transform: translateX(8px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .verre-zone { flex: none; width: 118px; }
  .verre { width: 100%; display: block; }
  /* le cocktail est LA lumière de la fiche : sa robe irradie et respire */
  .liquide {
    filter: drop-shadow(0 0 9px rgba(255, 210, 160, 0.55));
    animation: robe-vie 3.2s ease-in-out infinite alternate;
  }
  @keyframes robe-vie {
    from { filter: drop-shadow(0 0 6px rgba(255, 210, 160, 0.4)); opacity: 0.94; }
    to { filter: drop-shadow(0 0 14px rgba(255, 210, 160, 0.8)); opacity: 1; }
  }
  .cristal {
    stroke: #d9c9c9;
    stroke-width: 2.4;
    stroke-linecap: round;
    opacity: 0.65;
  }
  .bulle {
    fill: rgba(255, 255, 255, 0.75);
    animation: bulle-monte 2.8s linear infinite;
  }
  .bulle.b2 { animation-duration: 3.6s; animation-delay: 900ms; }
  .bulle.b3 { animation-duration: 2.2s; animation-delay: 1600ms; }
  @keyframes bulle-monte {
    0% { transform: translateY(0); opacity: 0; }
    12% { opacity: 0.8; }
    92% { opacity: 0.5; }
    100% { transform: translateY(-118px); opacity: 0; }
  }
  .fiche { display: flex; flex-direction: column; gap: 8px; min-width: 0; flex: 1; }
  .fnom {
    color: #ffe4e6;
    font-size: 14px;
    letter-spacing: 0.16em;
    text-shadow: 0 0 10px rgba(255, 49, 64, 0.5);
  }
  .compo { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 5px; }
  .compo li { display: flex; align-items: baseline; gap: 6px; font-size: 10.5px; }
  .compo .ing { color: #d9b8b8; letter-spacing: 0.08em; white-space: nowrap; }
  .compo .pts { flex: 1; border-bottom: 1px dotted #6e3a42; transform: translateY(-2px); }
  .compo .dose { color: #ffb27e; letter-spacing: 0.08em; white-space: nowrap; }
  .fnote { color: #8a5f5f; font-size: 9px; letter-spacing: 0.1em; font-style: italic; }
  .bar-foot {
    margin-top: 12px;
    color: #8a5252;
    font-size: 8px;
    letter-spacing: 0.16em;
    text-align: center;
    animation: arc-buzz 2.9s steps(2) infinite reverse;
  }

  /* ---- LE DJ BOOTH : la cabine — matériel de club, nuit rouge et cyan ---- */
  .dj-room {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(6, 2, 8, 0.62);
    animation: arc-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .dj-panel {
    width: min(760px, 94vw);
    background: linear-gradient(180deg, #141018 0%, #0a070d 100%);
    border: 2px solid var(--cyan);
    border-radius: 6px;
    box-shadow:
      0 0 22px rgba(63, 227, 255, 0.3),
      0 0 60px rgba(63, 227, 255, 0.1),
      inset 0 0 40px rgba(0, 0, 0, 0.65);
    padding: 14px 16px 12px;
    position: relative;
    overflow: hidden;
  }
  .dj-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0 1px, transparent 1px 3px);
  }
  .dj-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .dj-title {
    color: var(--cyan);
    font-size: 15px;
    letter-spacing: 0.3em;
    text-shadow: 0 0 8px rgba(63, 227, 255, 0.9), 0 0 22px rgba(63, 227, 255, 0.45);
    animation: arc-buzz 4.1s steps(2) infinite;
  }
  .dj-sub { color: #5f7182; font-size: 9px; letter-spacing: 0.18em; }
  .dj-close {
    margin-left: auto;
    color: #a9e4f2;
    font-size: 12px;
    width: 24px; height: 20px;
    border: 1px solid var(--v2000-bleu-bureau);
    border-radius: 3px;
    background: #0d1e2a;
  }
  .dj-close:hover { color: #fff; border-color: var(--cyan); }
  .dj-body {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 14px;
    align-items: start;
  }
  .deck {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 9px;
    padding: 10px 8px 12px;
    background: linear-gradient(180deg, #1a1522 0%, #100b16 100%);
    border: 1px solid #33254a;
    border-radius: 5px;
  }
  .deck-tag { color: #6a5a8a; font-size: 8px; letter-spacing: 0.22em; }
  .deck-screen {
    width: 100%;
    padding: 7px 8px;
    background: #04141a;
    border: 1px solid #123240;
    border-radius: 3px;
    color: var(--cyan);
    font-size: 9.5px;
    letter-spacing: 0.14em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-shadow: 0 0 6px rgba(63, 227, 255, 0.6);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
  }
  .deck-screen.vide { color: #3d6572; text-shadow: none; }
  .deck-screen:hover { border-color: var(--cyan); }
  /* le plateau : il tourne quand la piste vit */
  .jog {
    width: 86px; height: 86px;
    border-radius: 50%;
    background:
      radial-gradient(circle at 50% 50%, #0a0a10 0 26%, #1e1a28 27% 62%, #2c2438 63% 66%, #14101c 67% 100%);
    border: 2px solid #3a2c52;
    box-shadow: 0 0 0 3px #0c0912, inset 0 2px 8px rgba(0, 0, 0, 0.8);
    position: relative;
  }
  .jog i {
    position: absolute;
    left: 50%; top: 7%;
    width: 2.5px; height: 22%;
    background: var(--pink);
    border-radius: 2px;
    transform-origin: 50% 196%;
    box-shadow: 0 0 6px rgba(255, 79, 216, 0.7);
  }
  .jog.spin i { animation: jog-rot 1.9s linear infinite; }
  @keyframes jog-rot { to { transform: rotate(360deg); } }
  .deck-btns { display: flex; gap: 8px; }
  .deck-btns button {
    padding: 5px 12px;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: #cfd4e2;
    background: linear-gradient(180deg, #2c2c36, #1a1a21);
    border: 1px solid #3a3a46;
    border-radius: 3px;
    box-shadow: 0 2px 0 #0c0c10;
  }
  .deck-btns button:active { transform: translateY(2px); box-shadow: 0 0 0 #0c0c10; }
  .deck-btns .cue { color: var(--amber); }
  .deck-btns .go { color: var(--cyan); min-width: 44px; }
  .deck-btns .go.on {
    color: #baf3ff;
    border-color: var(--cyan);
    box-shadow: 0 2px 0 #0c0c10, inset 0 0 8px rgba(63, 227, 255, 0.3);
    text-shadow: 0 0 8px rgba(63, 227, 255, 0.9);
  }
  .pitch {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    color: #6a5a8a;
    font-size: 7.5px;
    letter-spacing: 0.18em;
  }
  .pitch input { width: 90%; accent-color: var(--pink); }
  /* le bac à disques : il recouvre la platine le temps de choisir */
  .bac {
    position: absolute;
    inset: 4px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 6px;
    background: rgba(6, 4, 10, 0.96);
    border: 1px solid var(--cyan);
    border-radius: 4px;
    scrollbar-width: thin;
    scrollbar-color: var(--v2000-bleu-bureau) transparent;
    animation: arc-in 200ms ease;
  }
  .bac button {
    text-align: left;
    padding: 5px 8px;
    font-size: 9px;
    letter-spacing: 0.1em;
    color: #a9e4f2;
    border: 1px solid transparent;
    border-radius: 3px;
    background: transparent;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .bac button:hover { color: #fff; border-color: var(--v2000-bleu-bureau); background: #0d1e2a; }
  .bac-vide { color: #3d6572; font-size: 8.5px; letter-spacing: 0.1em; padding: 6px; }
  .mixer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 14px 10px 10px;
    background: linear-gradient(180deg, #17131e 0%, #0d0a12 100%);
    border: 1px solid #33254a;
    border-radius: 5px;
    align-self: stretch;
    justify-content: center;
  }
  .mixer { flex-direction: row; flex-wrap: wrap; max-width: 150px; }
  .voie {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    color: #6a5a8a;
    font-size: 9px;
    letter-spacing: 0.15em;
  }
  .voie .vert {
    writing-mode: vertical-lr;
    direction: rtl;
    height: 92px;
    width: 22px;
    accent-color: var(--cyan);
  }
  .xf { width: 100%; display: flex; flex-direction: column; gap: 3px; margin-top: 4px; }
  .xf input { width: 100%; accent-color: var(--pink); }
  .xf-lab {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    color: #6a5a8a;
    font-size: 8px;
    letter-spacing: 0.12em;
  }
  .xf-lab b { color: #9a86c2; }
  .xf-lab em { font-style: normal; font-size: 7px; }
  .dj-foot {
    margin-top: 12px;
    color: #5f7182;
    font-size: 8px;
    letter-spacing: 0.16em;
    text-align: center;
    animation: arc-buzz 3.3s steps(2) infinite reverse;
  }

  /* ---- LE CARNET D'ADRESSES : une ardoise de bistrot, craie chaude ---- */
  .ard-room {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(8, 5, 2, 0.6);
    animation: arc-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .ard-panel {
    width: min(520px, 88vw);
    background: linear-gradient(180deg, #17130c 0%, #0e0b06 100%);
    border: 2px solid #b98a3a;
    border-radius: 6px;
    box-shadow:
      0 0 22px rgba(255, 178, 74, 0.28),
      0 0 60px rgba(255, 178, 74, 0.1),
      inset 0 0 40px rgba(0, 0, 0, 0.65);
    padding: 14px 16px 12px;
    position: relative;
    overflow: hidden;
  }
  .ard-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0 1px, transparent 1px 3px);
  }
  .ard-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .ard-title {
    color: var(--amber);
    font-size: 15px;
    letter-spacing: 0.3em;
    text-shadow: 0 0 8px rgba(255, 178, 74, 0.9), 0 0 22px rgba(255, 178, 74, 0.4);
    animation: arc-buzz 4.3s steps(2) infinite;
  }
  .ard-sub { color: #8a744f; font-size: 9px; letter-spacing: 0.14em; }
  .ard-close {
    margin-left: auto;
    color: #ffd9a0;
    font-size: 12px;
    width: 24px; height: 20px;
    border: 1px solid #6e5124;
    border-radius: 3px;
    background: var(--v2000-brun-tabac);
  }
  .ard-close:hover { color: #fff; border-color: var(--amber); }
  .ard-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #6e5124 transparent;
  }
  .ard-item {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas: 'nom ville go' 'note note go';
    align-items: baseline;
    column-gap: 10px;
    padding: 8px 10px;
    border: 1px solid #3a2c14;
    border-radius: 4px;
    background: #171106;
    text-decoration: none;
    transition: border-color 180ms ease, box-shadow 180ms ease;
  }
  a.ard-item:hover {
    border-color: var(--amber);
    box-shadow: 0 0 12px rgba(255, 178, 74, 0.25);
  }
  .ard-item b {
    grid-area: nom;
    color: #ffe9c9;
    font-size: 11px;
    letter-spacing: 0.12em;
  }
  .ard-ville { grid-area: ville; color: #8a744f; font-size: 9px; font-style: normal; letter-spacing: 0.1em; }
  .ard-note { grid-area: note; color: #b9945f; font-size: 9.5px; font-style: italic; margin-top: 3px; }
  .ard-go { grid-area: go; color: var(--amber); font-size: 13px; align-self: center; }
  .ard-foot {
    margin-top: 12px;
    color: #8a744f;
    font-size: 8px;
    letter-spacing: 0.16em;
    text-align: center;
    animation: arc-buzz 3.6s steps(2) infinite reverse;
  }

  /* ---- LE CIEL ÉTOILÉ : plein cadre, bitmap assumé, rien d'autre ---- */
  .ciel-room {
    position: absolute;
    inset: 0;
    background: #020208;
    animation: ciel-in 1400ms ease;
  }
  @keyframes ciel-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .ciel-px {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
  .ciel-hint {
    position: absolute;
    left: 50%;
    bottom: 3.5%;
    transform: translateX(-50%);
    color: rgba(180, 195, 235, 0.32);
    font-size: 9px;
    letter-spacing: 0.3em;
    animation: exit-breath 4.2s ease-in-out infinite alternate;
  }

  /* ---- LES CASSETTES : la boîte à K7, plastique et étiquettes ---- */
  .k7-room {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(6, 4, 2, 0.62);
    animation: arc-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .k7-panel {
    width: min(560px, 90vw);
    background: linear-gradient(180deg, #171208 0%, #0e0a05 100%);
    border: 2px solid #e8a13a;
    border-radius: 6px;
    box-shadow:
      0 0 22px rgba(232, 161, 58, 0.3),
      0 0 60px rgba(232, 161, 58, 0.1),
      inset 0 0 40px rgba(0, 0, 0, 0.65);
    padding: 14px 16px 12px;
    position: relative;
    overflow: hidden;
  }
  .k7-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0 1px, transparent 1px 3px);
  }
  .k7-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .k7-title {
    color: #e8a13a;
    font-size: 15px;
    letter-spacing: 0.3em;
    text-shadow: 0 0 8px rgba(232, 161, 58, 0.9), 0 0 22px rgba(232, 161, 58, 0.4);
    animation: arc-buzz 3.9s steps(2) infinite;
  }
  .k7-sub { color: #8a7550; font-size: 9px; letter-spacing: 0.16em; }
  .k7-close {
    margin-left: auto;
    color: #ffd9a0;
    font-size: 12px;
    width: 24px; height: 20px;
    border: 1px solid #6e5124;
    border-radius: 3px;
    background: var(--v2000-brun-tabac);
  }
  .k7-close:hover { color: #fff; border-color: #e8a13a; }
  .k7-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }
  .k7 {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 8px 6px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 5px;
    transition: border-color 180ms ease, box-shadow 180ms ease, transform 120ms ease;
  }
  .k7:hover { border-color: #6e5124; transform: translateY(-2px); }
  .k7.onair { border-color: #e8a13a; box-shadow: 0 0 14px rgba(232, 161, 58, 0.3); }
  .k7-coque {
    width: 132px;
    padding: 7px 8px 9px;
    background: linear-gradient(180deg, #2a2a30 0%, #1a1a1f 100%);
    border: 1px solid #3c3c44;
    border-radius: 5px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 3px 6px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .k7-label {
    color: #14100a;
    font-size: 7.5px;
    font-weight: bold;
    letter-spacing: 0.1em;
    padding: 3px 5px;
    border-radius: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }
  .k7-fen {
    display: flex;
    justify-content: center;
    gap: 26px;
    padding: 4px 0;
    background: #0c0c10;
    border-radius: 3px;
  }
  .k7-reel {
    width: 18px; height: 18px;
    border-radius: 50%;
    border: 2px dashed #8a8a96;
    background: #1c1c22;
  }
  .k7-reel.spin { animation: jog-rot 2.6s linear infinite; }
  .k7-reel.r2.spin { animation-duration: 2.1s; }
  .k7-note { color: #8a7550; font-size: 8.5px; font-style: italic; letter-spacing: 0.06em; }
  .k7-foot {
    margin-top: 12px;
    color: #8a7550;
    font-size: 8px;
    letter-spacing: 0.16em;
    text-align: center;
    animation: arc-buzz 3.1s steps(2) infinite reverse;
  }

  /* ---- LE NOKIA 3310 : la coque bleu nuit, l'écran vert, le clavier ---- */
  .tel-room {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(4, 3, 8, 0.66);
    animation: arc-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .tel-body {
    position: relative;
    width: 240px;
    padding: 26px 20px 22px;
    background:
      radial-gradient(120% 90% at 50% 0%, #2c3a5e 0%, #1c2740 55%, #121a2e 100%);
    border: 2px solid #0c1220;
    border-radius: 42px 42px 54px 54px / 34px 34px 70px 70px;
    box-shadow:
      0 18px 50px rgba(0, 0, 0, 0.8),
      inset 0 2px 0 rgba(255, 255, 255, 0.09),
      inset 0 -8px 18px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .tel-ecran {
    width: 178px;
    padding: 9px;
    background: #0a0f1c;
    border-radius: 10px;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.9);
  }
  .lcdv {
    position: relative;
    width: 160px;
    height: 116px;
    margin: 0 auto;
    background: #a7c274; /* le vert 3310 */
    border-radius: 3px;
    box-shadow: inset 0 0 14px rgba(28, 43, 18, 0.35);
    color: #1c2b12;
    font-family: monospace;
    font-size: 11px;
    line-height: 1.35;
    display: flex;
    flex-direction: column;
    padding: 6px 7px;
    overflow: hidden;
    /* la trame LCD */
    background-image: repeating-linear-gradient(0deg, rgba(28, 43, 18, 0.06) 0 1px, transparent 1px 3px);
    background-color: #a7c274;
  }
  .lcd-bar { display: flex; justify-content: space-between; font-size: 8px; letter-spacing: 1px; }
  .lcd-mid { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
  .lcd-op { font-weight: bold; letter-spacing: 2px; }
  .lcd-heure { font-size: 10px; }
  .lcd-soft { text-align: center; font-weight: bold; font-size: 10px; }
  .lcd-titre { text-align: center; font-weight: bold; border-bottom: 1px solid #1c2b12; padding-bottom: 2px; margin-bottom: 3px; }
  .lcd-menu { margin: 0; padding: 0; list-style: none; flex: 1; }
  .lcd-menu li { padding: 1px 4px; }
  .lcd-menu li.sel { background: #1c2b12; color: #a7c274; }
  .lcd-contacts { margin: 0; padding: 0; list-style: none; flex: 1; overflow-y: auto; font-size: 9.5px; }
  .lcd-contacts li { display: flex; flex-direction: column; padding: 2px 2px 3px; }
  .lcd-contacts b { font-weight: bold; }
  .lcd-contacts span { font-size: 8.5px; opacity: 0.8; }
  .lcd-vide { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 9.5px; }
  .lcd-snake {
    display: block;
    width: 160px;
    height: 91px;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    margin: -6px -7px 0;
  }
  .lcd-score { text-align: center; font-size: 9px; font-weight: bold; padding-top: 3px; }
  .tel-nav { display: flex; align-items: center; gap: 10px; }
  .tel-nav button {
    color: #c9d4ea;
    background: linear-gradient(180deg, #35446b, #1d2740);
    border: 1px solid #0c1220;
    box-shadow: 0 2px 0 var(--v2000-noir-nuit), inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transition: transform 60ms ease, box-shadow 60ms ease;
  }
  .tel-nav button:active { transform: translateY(2px); box-shadow: 0 0 0 var(--v2000-noir-nuit); }
  .tn-c, .tn-x { width: 34px; height: 26px; border-radius: 8px 14px 14px 8px / 50%; font-size: 11px; }
  .tn-x { border-radius: 14px 8px 8px 14px / 50%; color: #e8a0a0; }
  .tn-mid { display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .tn-up, .tn-dn { width: 54px; height: 16px; border-radius: 8px; font-size: 8px; }
  .tn-ok { width: 44px; height: 22px; border-radius: 50%; font-size: 10px; color: #ffe9c9; }
  .tel-pad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px 10px;
    width: 100%;
  }
  .touche {
    height: 24px;
    color: #dbe4f5;
    font-size: 10px;
    background: linear-gradient(180deg, #3a4a72 0%, #202c48 100%);
    border: 1px solid #0c1220;
    border-radius: 10px 10px 12px 12px / 60% 60% 40% 40%;
    box-shadow: 0 2px 0 var(--v2000-noir-nuit), inset 0 1px 0 rgba(255, 255, 255, 0.14);
    transition: transform 50ms ease, box-shadow 50ms ease;
  }
  .touche:active { transform: translateY(2px); box-shadow: 0 0 0 var(--v2000-noir-nuit); }
  .tel-marque {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    color: #7286ad;
    font-size: 8px;
    letter-spacing: 0.34em;
  }

  /* l'alternateur, version peinte : toute la lumière respire, à peine */
  .pc-breath { opacity: 0; }
  .lit .pc-breath { animation: city-breath 4.6s ease-in-out infinite alternate; }
  @keyframes city-breath {
    from { opacity: 0.04; }
    to { opacity: 0.11; }
  }
  /* un lieu : invisible au repos — le survol révèle sa version allumée
     (crop aligné au pixel : le crossfade est le lieu qui s'éveille) */
  .lieu {
    position: absolute;
    padding: 0;
    border: none;
    outline: none; /* jamais d'anneau de focus navigateur sur le monde peint (rectangle bleu après clic + Échap) */
    background-repeat: no-repeat;
    opacity: 0;
    cursor: pointer;
    transition: opacity 650ms cubic-bezier(0.3, 0.05, 0.2, 1);
    background-repeat: no-repeat;
  }
  /* zones SANS sprite détouré (lum) : fondu générique sur les bords de la
     boîte — le fallback, jamais l'état final. Les zones détourées affichent
     leur PNG transparent tel quel : le détourage est déjà DANS le fichier. */
  .lieu.fondu {
    -webkit-mask-image:
      linear-gradient(90deg, transparent 0, #000 14%, #000 86%, transparent 100%),
      linear-gradient(180deg, transparent 0, #000 14%, #000 86%, transparent 100%);
    -webkit-mask-composite: source-in;
    mask-image:
      linear-gradient(90deg, transparent 0, #000 14%, #000 86%, transparent 100%),
      linear-gradient(180deg, transparent 0, #000 14%, #000 86%, transparent 100%);
    mask-composite: intersect;
  }
  /* le survol embrase : version on à fond + poussée de lumière (--boost) */
  .lieu:hover {
    opacity: 1;
    filter: brightness(var(--boost, 1.45)) saturate(1.12);
  }
  /* l'AURA (zones avec `aura:` au registre — la barque seulement pour
     l'instant) : un halo qui suit la FORME du sprite, coloré par l'enseigne */
  .lieu.halo:hover {
    filter: brightness(var(--boost, 1.45)) saturate(1.15)
      drop-shadow(0 0 7px var(--aura-a))
      drop-shadow(0 0 22px var(--aura-b));
  }
  .lieu { transition: opacity 650ms cubic-bezier(0.3, 0.05, 0.2, 1), filter 650ms ease; }
  /* clic sur un lieu pas encore branché : il répond d'une lueur, sa porte viendra */
  .lieu.pulse { animation: lieu-pulse 900ms ease; }
  @keyframes lieu-pulse {
    0% { opacity: 0; }
    30% { opacity: 1; }
    100% { opacity: 0; }
  }
  /* balayage CRT discret : on regarde un écran d'époque, pas une vitre parfaite */
  .scan {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.16) 0 1px, transparent 1px 3px);
    mix-blend-mode: multiply;
  }

  /* ---- le pare-brise : la vitre existe, donc on est dedans ---- */
  .shield {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 1300ms ease;
  }
  .won .shield { opacity: 1; }
  .p-return-dawn .shield { opacity: 0; }
  /* poussière et crasse : plus dense aux bords, là où l'essuie-glace ne va pas */
  .shield::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(45% 32% at 0% 0%, rgba(70, 80, 100, 0.11), transparent 65%),
      radial-gradient(45% 32% at 100% 0%, rgba(70, 80, 100, 0.10), transparent 65%),
      radial-gradient(60% 20% at 50% 0%, rgba(60, 70, 90, 0.08), transparent 70%),
      radial-gradient(1px 1px at 12% 24%, rgba(210, 220, 240, 0.11), transparent 100%),
      radial-gradient(1px 1px at 27% 61%, rgba(210, 220, 240, 0.08), transparent 100%),
      radial-gradient(1px 1px at 38% 18%, rgba(210, 220, 240, 0.10), transparent 100%),
      radial-gradient(2px 2px at 51% 44%, rgba(210, 220, 240, 0.06), transparent 100%),
      radial-gradient(1px 1px at 63% 27%, rgba(210, 220, 240, 0.10), transparent 100%),
      radial-gradient(1px 1px at 71% 55%, rgba(210, 220, 240, 0.07), transparent 100%),
      radial-gradient(1px 1px at 84% 21%, rgba(210, 220, 240, 0.10), transparent 100%),
      radial-gradient(1px 1px at 92% 47%, rgba(210, 220, 240, 0.08), transparent 100%),
      radial-gradient(1px 1px at 45% 8%, rgba(210, 220, 240, 0.09), transparent 100%),
      radial-gradient(1px 1px at 19% 42%, rgba(210, 220, 240, 0.07), transparent 100%);
  }
  /* reflet oblique + deux micro-rayures qui n'accrochent l'œil qu'en cherchant */
  .shield::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(115deg,
        transparent 40%, rgba(150, 180, 225, 0.030) 46%,
        rgba(150, 180, 225, 0.055) 50%, rgba(150, 180, 225, 0.025) 54%, transparent 61%),
      linear-gradient(115deg, transparent 68%, rgba(150, 180, 225, 0.028) 72%, transparent 77%),
      linear-gradient(64deg, transparent 49.8%, rgba(220, 230, 255, 0.05) 50%, transparent 50.2%),
      linear-gradient(-71deg, transparent 49.85%, rgba(220, 230, 255, 0.04) 50%, transparent 50.15%);
  }
  /* traces d'essuie-glace : deux arcs fantômes en bas de vitre */
  .arc {
    position: absolute;
    bottom: -46vw;
    left: 6vw;
    width: 62vw;
    height: 62vw;
    border-radius: 50%;
    border: 2px solid rgba(180, 195, 225, 0.045);
    transform: rotate(9deg);
  }
  .arc.a2 {
    left: auto;
    right: 2vw;
    width: 48vw;
    height: 48vw;
    bottom: -37vw;
    border-color: rgba(180, 195, 225, 0.035);
    transform: rotate(-6deg);
  }
  /* la planche de bord se reflète faiblement dans le bas de la vitre, contact mis */
  .shield .glow {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 16vh;
    background: linear-gradient(0deg, rgba(255, 165, 58, 0.055), transparent);
    opacity: 0;
    transition: opacity 900ms ease;
  }
  .lit .shield .glow { opacity: 1; }

  /* ---- l'habitacle ---- */
  .roof {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 9vh;
    background: linear-gradient(180deg, #0a0a0e 60%, transparent);
    transform: translateY(-110%);
    transition: transform 1200ms cubic-bezier(0.25, 0.8, 0.3, 1) 150ms;
  }
  .pillar {
    position: absolute;
    top: 0; bottom: 24vh;
    width: 11vw;
    background: linear-gradient(90deg, #0b0b10, #101018);
    transition: transform 1300ms cubic-bezier(0.25, 0.8, 0.3, 1) 100ms;
  }
  .pl { left: 0; transform: translateX(-110%); clip-path: polygon(0 0, 100% 0, 30% 100%, 0 100%); }
  .pr { right: 0; transform: translateX(110%); clip-path: polygon(0 0, 100% 0, 100% 100%, 70% 100%); }
  .cin .roof { transform: translateY(0); }
  .cin .pl { transform: translateX(0); }
  .cin .pr { transform: translateX(0); }
  .p-return-cabin .roof { transform: translateY(-110%); transition-duration: 1000ms; }
  .p-return-cabin .pl { transform: translateX(-110%); transition-duration: 1000ms; }
  .p-return-cabin .pr { transform: translateX(110%); transition-duration: 1000ms; }

  .mirror {
    position: absolute;
    top: 4.5vh; left: 50%;
    transform: translateX(-50%) translateY(-190%);
    transition: transform 1200ms cubic-bezier(0.25, 0.8, 0.3, 1) 400ms;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .cin .mirror { transform: translateX(-50%) translateY(0); }
  .p-return-cabin .mirror { transform: translateX(-50%) translateY(-190%); transition-duration: 900ms; }
  .glass {
    width: 132px; height: 38px;
    border-radius: 5px;
    background: #090b14;
    border: 3px solid #0c0c11;
    overflow: hidden;
    display: block;
  }
  .mpx {
    display: block;
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
  }
  .pine {
    font-size: 15px;
    margin-top: 14px;
    position: relative;
    animation: swing 3.6s ease-in-out infinite alternate;
    transform-origin: 50% -16px;
    filter: saturate(0.8) brightness(0.9);
  }
  .pine::before {
    content: '';
    position: absolute;
    left: 50%; top: -15px;
    width: 1px; height: 15px;
    background: #3c3c46;
  }
  @keyframes swing { from { transform: rotate(-7deg); } to { transform: rotate(7deg); } }

  .cockpit {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 30vh;
    transform: translateY(103%);
    transition: transform 1500ms cubic-bezier(0.22, 0.9, 0.3, 1);
  }
  .cin .cockpit { transform: translateY(0); }
  .p-return-cabin .cockpit { transform: translateY(103%); transition: transform 1100ms cubic-bezier(0.6, 0, 0.7, 0.4); }

  .dash {
    position: absolute;
    inset: 0;
    /* dégradé en BANDES dures : le plastique moulé d'un jeu PS2, pas un satin */
    background: linear-gradient(180deg,
      #22222b 0%, #22222b 12%,
      #1b1b22 12%, #1b1b22 34%,
      var(--dashk) 34%, var(--dashk) 62%,
      #111116 62%, #111116 84%,
      #0d0d11 84%, #0d0d11 100%);
    box-shadow: 0 -16px 44px rgba(0, 0, 0, 0.78);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3vw;
    padding: 0 3vw;
  }
  /* matière : grain vinyle + gorge de jonction horizontale */
  .dash::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(180deg,
        transparent calc(34% - 1px), rgba(0, 0, 0, 0.5) calc(34% - 1px), rgba(0, 0, 0, 0.5) 34%,
        rgba(255, 255, 255, 0.035) 34%, rgba(255, 255, 255, 0.035) calc(34% + 1px), transparent calc(34% + 1px)),
      repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.014) 0 1px, transparent 1px 3px),
      repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.05) 0 2px, transparent 2px 5px);
  }
  /* arête haute : le bord du tableau accroche la lumière de la ville */
  .dash::after {
    content: '';
    position: absolute;
    left: 0; right: 0; top: 0;
    height: 6px;
    pointer-events: none;
    background: linear-gradient(180deg, #4a4c5a 0%, #2a2b33 35%, rgba(0, 0, 0, 0.6) 100%);
  }

  /* aérateurs : lamelles horizontales, plastique creusé */
  .vent {
    flex: none;
    width: 52px;
    height: 20px;
    border-radius: 3px;
    border: 1px solid #2a2b33;
    background:
      repeating-linear-gradient(0deg, #191a21 0 2px, #07070b 2px 5px);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255, 255, 255, 0.04);
    transform: skewX(-4deg);
  }
  .vent.v2 { transform: skewX(4deg); }

  /* combiné */
  .cluster {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding-top: 8px;
    color: #3a3f52;
    transition: color 700ms ease;
  }
  /* la casquette du compteur : une visière moulée au-dessus des cadrans */
  .cluster::before {
    content: '';
    position: absolute;
    left: -14px; right: -14px; top: -10px;
    height: 26px;
    border-radius: 50% 50% 6px 6px / 100% 100% 6px 6px;
    background: linear-gradient(180deg, #26262f 0%, #17171d 45%, #0b0b0f 100%);
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.05),
      0 10px 14px -6px rgba(0, 0, 0, 0.85);
    pointer-events: none;
  }
  .lit .cluster { color: var(--amber); }
  .speedo { width: 120px; height: 70px; }
  .ticks line { stroke: currentColor; stroke-width: 1.5; }
  .speedo text { fill: currentColor; }
  .needle {
    stroke: #c8451f;
    stroke-width: 2.5;
    /* à l'arrêt : l'aiguille dort — elle a juste un souffle, la machine est vivante */
    animation: idle 2.8s ease-in-out infinite alternate;
    transform-origin: 60px 62px;
  }
  @keyframes idle { from { transform: rotate(0deg); } to { transform: rotate(1.6deg); } }
  /* contact mis : on roule — l'aiguille monte en croisière puis flotte */
  .lit .needle {
    animation:
      sweep 2.8s cubic-bezier(0.3, 0.1, 0.25, 1) forwards,
      cruise 1.7s ease-in-out 2.8s infinite alternate;
  }
  @keyframes sweep { from { transform: rotate(0deg); } to { transform: rotate(54deg); } }
  @keyframes cruise { from { transform: rotate(53.2deg); } to { transform: rotate(55.6deg); } }
  .dclock {
    font-size: 13px;
    letter-spacing: 0.14em;
    font-variant-numeric: tabular-nums;
    color: inherit;
    text-shadow: 0 0 8px rgba(255, 178, 74, 0);
    transition: text-shadow 700ms ease;
  }
  .lit .dclock { text-shadow: 0 0 8px rgba(255, 178, 74, 0.45); }

  /* ---- L'AUTORADIO V2000 TX ---- */
  .radio {
    position: relative;
    width: min(400px, 42vw);
    background: linear-gradient(180deg, #23232b, #17171d);
    border: 2px solid #2e2e38;
    border-radius: 6px;
    box-shadow: 0 0 0 4px #101014, 0 6px 22px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06);
    padding: 10px 12px 9px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .face-top { display: flex; gap: 8px; align-items: stretch; }
  .lcd {
    flex: 1;
    min-width: 0;
    background: #140b02;
    border: 1px solid #000;
    border-radius: 3px;
    overflow: hidden;
    display: flex;
    align-items: center;
    box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.9);
  }
  .scroll {
    display: flex;
    white-space: nowrap;
    animation: marquee 11s linear infinite;
    color: #4a2c0a;
    font-size: 13px;
    letter-spacing: 0.22em;
    transition: color 500ms ease;
  }
  .lit .scroll {
    color: var(--lcd);
    text-shadow: 0 0 6px rgba(255, 165, 58, 0.75);
  }
  .p-ignition .lcd { animation: boot 800ms steps(2) 1; }
  @keyframes boot { 0% { filter: brightness(3); } 50% { filter: brightness(0.3); } 100% { filter: brightness(1); } }
  .scroll span { padding: 4px 3em 4px 0; }
  @keyframes marquee { to { transform: translateX(-50%); } }
  .freqbox {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    background: #140b02;
    border: 1px solid #000;
    border-radius: 3px;
    padding: 3px 9px;
  }
  .fq {
    color: #4a2c0a;
    font-size: 14px;
    letter-spacing: 0.1em;
    font-variant-numeric: tabular-nums;
    transition: color 500ms ease;
  }
  .fq em { font-style: normal; font-size: 8px; margin-left: 3px; }
  .lit .fq { color: var(--lcd); text-shadow: 0 0 6px rgba(255, 165, 58, 0.75); }
  .eq { display: flex; align-items: flex-end; gap: 2px; height: 10px; }
  .eq i {
    width: 3px;
    height: 100%;
    background: #3a2408;
    transform: scaleY(0.15);
    transform-origin: bottom;
    transition: background 500ms ease;
  }
  .lit .eq i { background: var(--lcd); box-shadow: 0 0 4px rgba(255, 165, 58, 0.6); }
  .eq i { animation: eqb 640ms ease-in-out infinite alternate paused; }
  .eq.run i { animation-play-state: running; }
  .eq i:nth-child(1) { animation-duration: 520ms; }
  .eq i:nth-child(2) { animation-duration: 700ms; animation-delay: 90ms; }
  .eq i:nth-child(3) { animation-duration: 460ms; animation-delay: 40ms; }
  .eq i:nth-child(4) { animation-duration: 620ms; animation-delay: 140ms; }
  .eq i:nth-child(5) { animation-duration: 540ms; animation-delay: 200ms; }
  @keyframes eqb { from { transform: scaleY(0.12); } to { transform: scaleY(1); } }

  .face-bot { display: flex; align-items: center; gap: 10px; }
  .knob {
    flex: none;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #3a3a46, #17171d 70%);
    border: 1.5px solid #35353f;
    box-shadow: 0 0 0 2px rgba(63, 227, 255, 0), 0 2px 4px rgba(0, 0, 0, 0.6);
    position: relative;
    transition: box-shadow 700ms ease;
  }
  .lit .knob { box-shadow: 0 0 0 2px rgba(63, 227, 255, 0.35), 0 2px 4px rgba(0, 0, 0, 0.6); }
  .knob i {
    position: absolute;
    left: 50%; top: 3px;
    width: 2px; height: 7px;
    transform: translateX(-50%);
    background: #cfd2dc;
  }
  .presets { display: flex; gap: 3px; }
  /* touches physiques : elles s'enfoncent, et celle à l'antenne reste allumée */
  .pre {
    width: 16px; height: 15px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    color: #6a6a78;
    background: linear-gradient(180deg, #1a1a21, #101015);
    border: 1px solid #2c2c36;
    border-radius: 2px;
    box-shadow: 0 1px 0 #0c0c10;
    transition: transform 60ms ease, box-shadow 60ms ease, color 300ms ease;
  }
  .pre:hover:not(:disabled) { color: #c8cad4; }
  .pre:active:not(:disabled) { transform: translateY(1px); box-shadow: 0 0 0 #0c0c10; }
  .pre:disabled { opacity: 0.4; cursor: default; }
  .lit .pre.on {
    color: var(--lcd);
    border-color: #4a3a18;
    background: linear-gradient(180deg, var(--v2000-brun-tabac), #170f05);
    text-shadow: 0 0 5px rgba(255, 165, 58, 0.8);
    box-shadow: 0 1px 0 #0c0c10, inset 0 0 5px rgba(255, 165, 58, 0.25);
  }
  .transport { display: flex; gap: 4px; margin-left: auto; }
  .transport button {
    width: 30px; height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #d8dae2;
    background: linear-gradient(180deg, #2c2c36, #1a1a21);
    border: 1px solid #3a3a46;
    border-radius: 3px;
    box-shadow: 0 2px 0 #0c0c10;
    transition: transform 60ms ease, box-shadow 60ms ease;
  }
  .transport button:active:not(:disabled) { transform: translateY(2px); box-shadow: 0 0 0 #0c0c10; }
  .transport button:disabled { opacity: 0.35; cursor: default; }
  .transport .play { width: 36px; color: var(--cyan); }
  .transport .ej { color: #ff9f8a; }
  .brandtx {
    flex: none;
    font-size: 9px;
    letter-spacing: 0.18em;
    color: var(--cyan);
    opacity: 0.35;
    transition: opacity 700ms ease;
  }
  .brandtx em { font-style: normal; color: var(--pink); }
  .lit .brandtx { opacity: 1; text-shadow: 0 0 6px rgba(63, 227, 255, 0.5); }
  .screw {
    position: absolute;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #6a6a78, #23232b);
  }
  .screw.tl { top: 4px; left: 4px; } .screw.tr { top: 4px; right: 4px; }
  .screw.bl { bottom: 4px; left: 4px; } .screw.br { bottom: 4px; right: 4px; }

  /* le contact */
  .keyzone { display: flex; align-items: center; }
  .contact {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #8b8d9c;
    transition: color 300ms ease;
  }
  .contact:hover:not(:disabled) { color: #e6e8f2; }
  .contact:disabled { cursor: default; opacity: 0.5; }
  .keyring {
    width: 34px; height: 34px;
    border-radius: 50%;
    border: 2px solid #3c3c48;
    background: radial-gradient(circle at 40% 35%, #26262e, #121216);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 3px #0e0e12;
    transition: border-color 600ms ease, box-shadow 600ms ease;
  }
  .lit .keyring { border-color: #6a6d80; box-shadow: 0 0 0 3px #0e0e12, 0 0 12px rgba(255, 178, 74, 0.18); }
  .key {
    width: 4px; height: 16px;
    background: #b9bcc9;
    border-radius: 2px;
    transform: rotate(38deg);
    transition: transform 500ms ease;
  }
  .p-return-cabin .key { transform: rotate(0deg); }
  .klab { font-size: 8.5px; letter-spacing: 0.14em; }
  .contact em { font-style: normal; font-size: 8px; color: #5c5e6c; }

  .wheel {
    position: absolute;
    left: 16vw; bottom: -34vh;
    width: 44vh; height: 44vh;
    border-radius: 50%;
    border: 3.2vh solid #101014;
    /* le haut de la jante accroche la lumière de la ville, le reste dort */
    box-shadow:
      inset 0 0 0 4px #1e1e26,
      inset 0 5px 8px -3px rgba(130, 145, 180, 0.18),
      0 0 30px rgba(0, 0, 0, 0.6);
  }
  .wheel::after {
    content: '';
    position: absolute;
    left: 50%; top: 50%;
    width: 30%; height: 12%;
    transform: translate(-50%, -50%);
    background: #14141a;
    border-radius: 6px;
  }

  .vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    box-shadow: inset 0 0 18vh rgba(0, 0, 0, 0.62);
    opacity: 0;
    transition: opacity 1200ms ease;
  }
  .cin .vignette { opacity: 1; }

  /* ---- L'HABITACLE PEINT (pivot DA) : l'image respire, les instruments
     vivent dessus. Étirée 100 %/100 % : les % restent calés sur l'image. ---- */
  .cab {
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    transform: scale(1.045);
    transition: opacity 1300ms ease, transform 1500ms cubic-bezier(0.22, 0.9, 0.3, 1);
  }
  .cab.on { opacity: 1; transform: scale(1); }
  .p-return-cabin .cab { opacity: 0; transition-duration: 1000ms; }
  .cabimg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    user-select: none;
    /* contact coupé : la planche dort — le contact la réveille */
    filter: brightness(0.72);
    transition: filter 900ms ease;
  }
  .lit .cabimg { filter: brightness(1); }
  .blockzone {
    position: absolute;
    left: 0; right: 0;
    top: 48%; bottom: 0;
    pointer-events: auto;
  }
  .m-glass {
    position: absolute;
    left: 40.4%; top: 7.9%;
    width: 19.2%; height: 8%;
    border-radius: 10px / 50%;
    overflow: hidden;
    background: #05060c;
  }
  .m-glass .mpx { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
  .m-lcd {
    position: absolute;
    left: 44%; top: 61.6%;
    width: 12.6%; height: 4.4%;
    overflow: hidden;
    display: flex;
    align-items: center;
    color: #3a2408;
    font-size: clamp(9px, 1.1vw, 15px);
    letter-spacing: 0.2em;
    transition: color 500ms ease;
  }
  .lit .m-lcd { color: var(--lcd); text-shadow: 0 0 7px rgba(255, 165, 58, 0.75); }
  .p-ignition .m-lcd { animation: boot 800ms steps(2) 1; }
  /* commandes : invisibles au repos — les boutons PEINTS restent la matière,
     la souris révèle une lueur (jamais une UI par-dessus la photo) */
  .m-transport {
    position: absolute;
    left: 43.9%; top: 73.4%;
    width: 14.2%; height: 4.8%;
    display: flex;
    gap: 5%;
    pointer-events: auto;
  }
  .m-transport button {
    flex: 1;
    border-radius: 50%;
    background: transparent;
    color: transparent;
    font-size: clamp(9px, 0.95vw, 14px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 200ms ease, color 400ms ease, text-shadow 400ms ease;
  }
  /* contact mis : les symboles se rétroéclairent, comme une vraie façade la
     nuit — et ils respirent (le même souffle que la ville) */
  .lit .m-transport button:not(:disabled) {
    color: rgba(255, 178, 74, 0.5);
    text-shadow: 0 0 6px rgba(255, 178, 74, 0.3);
    animation: backlight 2.7s ease-in-out infinite alternate;
  }
  .lit .m-transport button:disabled { color: rgba(255, 178, 74, 0.14); }
  .m-transport button:hover:not(:disabled) {
    color: #ffe9c9;
    text-shadow: 0 0 10px rgba(255, 178, 74, 0.8);
    box-shadow: 0 0 0 2px rgba(255, 178, 74, 0.5), 0 0 12px rgba(255, 178, 74, 0.35);
  }
  .m-transport button:active:not(:disabled) { transform: translateY(1px); }
  .m-transport button:disabled { cursor: default; }
  .m-transport button:nth-child(2) { animation-delay: 400ms; }
  .m-transport button:nth-child(3) { animation-delay: 900ms; }
  .m-transport button:nth-child(4) { animation-delay: 1400ms; }
  @keyframes backlight {
    from { filter: brightness(0.82); }
    to { filter: brightness(1.18); }
  }
  .m-presets {
    position: absolute;
    left: 43.9%; top: 78.4%;
    width: 14.2%; height: 3.8%;
    display: flex;
    gap: 3%;
    pointer-events: auto;
  }
  .m-presets button {
    flex: 1;
    border-radius: 4px;
    background: transparent;
    color: transparent;
    font-size: clamp(8px, 0.85vw, 13px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 200ms ease, color 400ms ease, text-shadow 400ms ease;
  }
  /* les chiffres 1–6, rétroéclairés dès le contact : on sait où on appuie */
  .lit .m-presets button:not(:disabled) {
    color: rgba(255, 178, 74, 0.5);
    text-shadow: 0 0 5px rgba(255, 178, 74, 0.3);
    animation: backlight 2.7s ease-in-out infinite alternate;
  }
  .lit .m-presets button:disabled { color: rgba(255, 178, 74, 0.14); }
  .m-presets button:nth-child(2) { animation-delay: 300ms; }
  .m-presets button:nth-child(3) { animation-delay: 700ms; }
  .m-presets button:nth-child(4) { animation-delay: 1100ms; }
  .m-presets button:nth-child(5) { animation-delay: 1600ms; }
  .m-presets button:nth-child(6) { animation-delay: 2000ms; }
  .m-presets button:hover:not(:disabled) {
    color: #ffe9c9;
    text-shadow: 0 0 9px rgba(255, 178, 74, 0.8);
    box-shadow: 0 0 0 2px rgba(255, 178, 74, 0.5), 0 0 12px rgba(255, 178, 74, 0.35);
  }
  .m-presets button:active:not(:disabled) { transform: translateY(1px); }
  .m-presets button:disabled { cursor: default; }
  /* le preset à l'antenne : braise permanente, chiffre plein feu */
  .lit .m-presets button.onair {
    color: #ffd98f;
    text-shadow: 0 0 10px rgba(255, 165, 58, 0.95);
    box-shadow: inset 0 0 8px rgba(255, 165, 58, 0.55), 0 0 10px rgba(255, 165, 58, 0.3);
  }
  .m-clock {
    position: absolute;
    left: 80.8%; top: 50.1%;
    width: 8.4%; height: 6%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0d0b0a;
    border-radius: 6px;
    color: #3a2f22;
    font-size: clamp(10px, 1.05vw, 15px);
    letter-spacing: 0.14em;
    font-variant-numeric: tabular-nums;
    transition: color 700ms ease, text-shadow 700ms ease;
  }
  .lit .m-clock { color: var(--amber); text-shadow: 0 0 8px rgba(255, 178, 74, 0.45); }
  .m-contact {
    position: absolute;
    right: 1.6%; bottom: 3.5%;
    pointer-events: auto;
    padding: 7px 12px;
    font-size: 8.5px;
    letter-spacing: 0.14em;
    color: #8b8d9c;
    background: rgba(10, 10, 14, 0.55);
    border: 1px solid #3c3c48;
    border-radius: 4px;
    transition: color 300ms ease, border-color 300ms ease;
  }
  .m-contact:hover:not(:disabled) { color: #e6e8f2; border-color: #6a6d80; }
  .m-contact:disabled { opacity: 0.4; cursor: default; }

  /* ---- LA SALLE D'ARCADE : une fenêtre du bureau, métamorphosée (D12).
     Pas une UI système : du néon violet, du CRT, du forain. ---- */
  .arc-room {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(4, 2, 12, 0.55);
    animation: arc-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  @keyframes arc-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .arc-panel {
    width: min(560px, 86vw);
    background: linear-gradient(180deg, #14081f 0%, #0c0514 100%);
    border: 2px solid var(--v2000-violet-rave);
    border-radius: 6px;
    box-shadow:
      0 0 22px rgba(176, 107, 255, 0.35),
      0 0 60px rgba(176, 107, 255, 0.12),
      inset 0 0 40px rgba(0, 0, 0, 0.6);
    padding: 14px 16px 12px;
    position: relative;
    overflow: hidden;
  }
  /* le CRT de la salle : mêmes scanlines que la ville */
  .arc-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0 1px, transparent 1px 3px);
  }
  .arc-head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 12px;
  }
  .arc-title {
    color: var(--v2000-violet-rave);
    font-size: 15px;
    letter-spacing: 0.3em;
    text-shadow: 0 0 8px rgba(176, 107, 255, 0.9), 0 0 22px rgba(176, 107, 255, 0.45);
    animation: arc-buzz 3.1s steps(2) infinite;
  }
  @keyframes arc-buzz {
    0%, 92%, 100% { opacity: 1; }
    94%, 96% { opacity: 0.55; }
  }
  .arc-sub { color: #6a5686; font-size: 9px; letter-spacing: 0.18em; }
  .arc-close {
    margin-left: auto;
    color: #cfa9ff;
    font-size: 12px;
    width: 24px; height: 20px;
    border: 1px solid #4a2f6e;
    border-radius: 3px;
    background: #1a0d2a;
  }
  .arc-close:hover { color: #fff; border-color: var(--v2000-violet-rave); }
  .arc-grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .borne {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 10px 6px 8px;
    background: linear-gradient(180deg, #1c1030 0%, #120a1e 100%);
    border: 1px solid #3a2458;
    border-radius: 4px;
    transition: border-color 200ms ease, box-shadow 200ms ease, transform 120ms ease;
  }
  .borne:hover {
    border-color: var(--v2000-violet-rave);
    box-shadow: 0 0 14px rgba(176, 107, 255, 0.35);
    transform: translateY(-2px);
  }
  .borne:active { transform: translateY(0); }
  .bscreen {
    width: 54px; height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #05030c;
    border: 2px solid #241536;
    border-radius: 3px;
    box-shadow: inset 0 0 10px rgba(176, 107, 255, 0.25);
  }
  .bglyph { font-size: 20px; filter: drop-shadow(0 0 6px rgba(176, 107, 255, 0.8)); }
  .bname { color: #e4d6ff; font-size: 10px; letter-spacing: 0.06em; }
  .bmeta { color: #5c4a78; font-size: 8px; letter-spacing: 0.1em; }
  .arc-foot {
    margin-top: 12px;
    color: #5c4a78;
    font-size: 8px;
    letter-spacing: 0.16em;
    text-align: center;
    animation: arc-buzz 2.3s steps(2) infinite reverse;
  }
  /* devant une borne : son écran occupe la salle */
  .arc-screen {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 8px 4px;
    text-align: center;
  }
  .arc-glyph { font-size: 34px; filter: drop-shadow(0 0 10px rgba(176, 107, 255, 0.9)); }
  .arc-screen b { color: #e4d6ff; font-size: 12px; letter-spacing: 0.12em; }
  .arc-screen pre {
    margin: 4px 0 6px;
    color: var(--v2000-violet-rave);
    font-family: inherit;
    font-size: 10px;
    line-height: 1.7;
    letter-spacing: 0.08em;
    white-space: pre-wrap;
    text-shadow: 0 0 6px rgba(176, 107, 255, 0.5);
  }
  .arc-back {
    color: #cfa9ff;
    font-size: 9px;
    letter-spacing: 0.14em;
    padding: 5px 12px;
    border: 1px solid #4a2f6e;
    border-radius: 3px;
    background: #1a0d2a;
  }
  .arc-back:hover { color: #fff; border-color: var(--v2000-violet-rave); }

  /* ============================================================
     LES DESTINATIONS BRANCHÉES It26
     ============================================================ */

  /* ---- scaffold partagé : une « salle-panneau » (accent = --ac / --acglow) ---- */
  .nd-room {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(4, 3, 6, 0.62);
    animation: arc-in 420ms cubic-bezier(0.2, 0.7, 0.3, 1);
    z-index: 5;
  }
  .nd-panel {
    width: min(560px, 90vw);
    background: linear-gradient(180deg, #141018 0%, #0a0810 100%);
    border: 2px solid var(--ac);
    border-radius: 6px;
    box-shadow: 0 0 22px var(--acglow), 0 0 60px var(--acglow), inset 0 0 40px rgba(0, 0, 0, 0.62);
    padding: 14px 16px 12px;
    position: relative;
    overflow: hidden;
  }
  .nd-panel::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.14) 0 1px, transparent 1px 3px);
  }
  .nd-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .nd-title {
    color: var(--ac);
    font-size: 15px;
    letter-spacing: 0.26em;
    text-shadow: 0 0 8px var(--acglow), 0 0 22px var(--acglow);
  }
  .nd-sub { color: #8a8296; font-size: 9px; letter-spacing: 0.16em; }
  .nd-close {
    margin-left: auto;
    color: #e8e0ff;
    font-size: 12px;
    width: 24px; height: 20px;
    border: 1px solid var(--ac);
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.05);
  }
  .nd-close:hover { color: #fff; box-shadow: 0 0 10px var(--acglow); }
  .nd-foot {
    margin-top: 12px;
    color: #8a8296;
    font-size: 8px;
    letter-spacing: 0.16em;
    text-align: center;
  }

  /* ---- L'UNIVERS D'UN VITRAIL : plein cadre, bitmap assumé ---- */
  .uni-room { position: absolute; inset: 0; background: #05020a; animation: ciel-in 1200ms ease; z-index: 6; }
  .uni-px { position: absolute; inset: 0; width: 100%; height: 100%; image-rendering: pixelated; image-rendering: crisp-edges; }
  .uni-hint {
    position: absolute; left: 50%; bottom: 3.5%; transform: translateX(-50%);
    color: rgba(255, 90, 120, 0.4); font-size: 9px; letter-spacing: 0.3em;
    animation: exit-breath 4.2s ease-in-out infinite alternate;
  }
  .uni-room.ange .uni-hint { color: rgba(255, 244, 200, 0.5); }

  /* ---- LE PRÊCHE ---- */
  .sermon {
    margin: 4px 2px 0;
    padding: 10px 14px;
    border-left: 3px solid var(--ac);
    display: flex; flex-direction: column; gap: 3px;
    min-height: 120px;
    animation: fiche-in 400ms cubic-bezier(0.2, 0.7, 0.3, 1);
  }
  .sermon span { color: #ffe9c0; font-size: 13px; line-height: 1.55; letter-spacing: 0.04em; }
  .sermon span:first-child { color: #fff3d8; font-size: 14px; }
  .sermon-act { margin-top: 12px; text-align: center; }
  .preche-btn {
    color: var(--ac); font-size: 10px; letter-spacing: 0.18em;
    padding: 6px 16px; border: 1px solid var(--ac); border-radius: 3px;
    background: rgba(232, 192, 106, 0.08);
  }
  .preche-btn:hover { color: #fff; box-shadow: 0 0 12px var(--acglow); }

  /* ---- LE CONFESSIONNAL ---- */
  .confess-room {
    position: absolute; inset: 0; z-index: 6;
    background: radial-gradient(120% 90% at 50% 40%, #1a1410 0%, #0a0805 70%, #030201 100%);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    animation: ciel-in 1400ms ease;
  }
  .confess-grille {
    width: 168px; height: 168px;
    background:
      repeating-linear-gradient(45deg, rgba(0,0,0,0.85) 0 3px, transparent 3px 15px),
      repeating-linear-gradient(-45deg, rgba(0,0,0,0.85) 0 3px, transparent 3px 15px),
      radial-gradient(circle, #3a2a1a 0%, #120c06 100%);
    border: 6px solid #150e07;
    box-shadow: inset 0 0 30px #000, 0 0 40px rgba(0,0,0,0.7);
  }
  .confess-txt {
    margin-top: 22px; color: #c9a86a; font-size: 13px; letter-spacing: 0.22em;
    text-shadow: 0 0 10px rgba(201, 168, 106, 0.4);
    animation: exit-breath 5s ease-in-out infinite alternate;
  }
  .confess-hint {
    position: absolute; bottom: 4%; color: rgba(201, 168, 106, 0.34);
    font-size: 9px; letter-spacing: 0.24em;
  }

  /* ---- LE TRONC / LES BOUGIES ---- */
  .cierges {
    display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px 6px;
    padding: 8px 4px; justify-items: center;
  }
  .cierge {
    position: relative; width: 26px; height: 62px;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
    background: none; border: none; cursor: pointer;
  }
  .cierge .corps {
    width: 12px; height: 40px; border-radius: 3px 3px 1px 1px;
    background: linear-gradient(180deg, #efe6d0 0%, #cbb990 100%);
    box-shadow: inset -2px 0 3px rgba(0,0,0,0.25);
  }
  .cierge .flamme {
    width: 7px; height: 12px; margin-bottom: 1px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
    background: radial-gradient(circle at 50% 65%, #fff3b0 0%, #ffb43a 55%, #ff6a1a 100%);
    opacity: 0; transform: scale(0.4); transform-origin: bottom center;
    transition: opacity 240ms ease;
  }
  .cierge.on .flamme { opacity: 1; animation: flamme-vac 0.9s ease-in-out infinite alternate; box-shadow: 0 0 12px rgba(255, 150, 40, 0.8); }
  .cierge.on .corps { box-shadow: inset -2px 0 3px rgba(0,0,0,0.25), 0 -6px 14px rgba(255, 160, 50, 0.35); }
  .cierge:not(.on):hover .flamme { opacity: 0.4; transform: scale(0.7); }
  @keyframes flamme-vac {
    0% { transform: scale(0.9) translateX(-0.4px) rotate(-2deg); }
    100% { transform: scale(1.06) translateX(0.4px) rotate(2deg); }
  }
  .merci {
    text-align: center; margin: 8px 0 2px; color: #ffd9a0; font-size: 11px;
    font-style: italic; letter-spacing: 0.06em; animation: fiche-in 380ms ease;
  }
  .vraie-piece { text-align: center; margin-top: 6px; }
  .vraie-piece a {
    color: var(--v2000-jaune-sodium); font-size: 10px; letter-spacing: 0.14em; text-decoration: none;
    border-bottom: 1px dotted var(--v2000-jaune-sodium); padding-bottom: 1px;
  }
  .vraie-piece a:hover { color: #fff; }

  /* ---- LE JEU À GRATTER ---- */
  .grat-zone {
    position: relative; width: 300px; height: 150px; margin: 0 auto;
    border-radius: 5px; overflow: hidden; box-shadow: inset 0 0 0 2px rgba(224,184,74,0.5);
  }
  .grat-fond {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
    background: repeating-linear-gradient(45deg, #201808 0 8px, #2a2010 8px 16px);
    text-align: center; padding: 10px;
  }
  .grat-gain { color: #ffd24a; font-size: 26px; letter-spacing: 0.1em; text-shadow: 0 0 12px rgba(255,210,74,0.6); }
  .grat-fond.win .grat-gain { animation: win-flash 0.5s steps(2) infinite; }
  .grat-mot { color: #cbb98a; font-size: 10px; font-style: italic; letter-spacing: 0.04em; max-width: 240px; line-height: 1.4; }
  .grat-cvs { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; touch-action: none; }
  .grat-act { text-align: center; margin-top: 12px; }
  .grat-neuf {
    color: #e0b84a; font-size: 10px; letter-spacing: 0.14em; padding: 6px 14px;
    border: 1px solid #6e5a24; border-radius: 3px; background: #1a1408;
  }
  .grat-neuf:hover { color: #fff; border-color: #e0b84a; }
  @keyframes win-flash { 0% { opacity: 1; } 100% { opacity: 0.5; } }

  /* ---- LES PARIS SPORTIFS ---- */
  .paris-tv {
    background: #04120c; border: 1px solid #123a2c; border-radius: 4px; overflow: hidden;
    box-shadow: inset 0 0 24px rgba(0,0,0,0.6);
  }
  .paris-list { list-style: none; margin: 0; padding: 6px 8px; display: flex; flex-direction: column; gap: 4px; }
  .paris-list li {
    display: grid; grid-template-columns: 52px 1fr auto 1fr; align-items: center; gap: 8px;
    padding: 6px 8px; border-bottom: 1px solid rgba(74,208,160,0.12); font-size: 11px;
  }
  .paris-list .ph { color: #ff5a5a; font-size: 8px; letter-spacing: 0.1em; }
  .paris-list .pteam { color: #cdeee2; letter-spacing: 0.06em; }
  .paris-list .pteam b { color: var(--v2000-vert-pmu); margin-left: 6px; }
  .paris-list .pvs { color: #5a7a70; font-size: 9px; font-style: italic; }
  .paris-band { overflow: hidden; white-space: nowrap; background: #02150e; border-top: 1px solid #123a2c; padding: 4px 0; }
  .paris-band span { display: inline-block; color: #7ce0bf; font-size: 9px; letter-spacing: 0.1em; animation: band-scroll 30s linear infinite; }
  @keyframes band-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* ---- L'ÉVÉNEMENT ---- */
  .evt {
    display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center;
    padding: 16px 12px; border: 1px dashed #6e3a24; border-radius: 4px;
    background: repeating-linear-gradient(135deg, rgba(255,122,58,0.04) 0 10px, transparent 10px 20px);
  }
  .evt-titre { color: #ff9a5a; font-size: 17px; letter-spacing: 0.1em; text-shadow: 0 0 12px rgba(255,122,58,0.5); line-height: 1.25; }
  .evt.vide .evt-titre { color: #a86a4a; font-size: 15px; }
  .evt-quand { color: #ffd0a0; font-size: 12px; letter-spacing: 0.08em; }
  .evt-ou { color: #c99070; font-size: 10px; letter-spacing: 0.1em; }
  .evt-ligne { color: #d9b499; font-size: 11px; font-style: italic; line-height: 1.5; max-width: 380px; margin: 4px 0 0; }
  .evt-cta {
    margin-top: 6px; color: #ff7a3a; font-size: 11px; letter-spacing: 0.14em; text-decoration: none;
    border: 1px solid #ff7a3a; border-radius: 3px; padding: 6px 16px;
  }
  .evt-cta:hover { color: #fff; box-shadow: 0 0 12px rgba(255,122,58,0.4); }

  /* ---- LE JOURNAL ---- */
  .jour-panel { width: min(600px, 92vw); background: linear-gradient(180deg, #e9e3d2 0%, #ddd6c2 100%); }
  .jour-panel::after { background: repeating-linear-gradient(0deg, rgba(120,110,90,0.06) 0 1px, transparent 1px 3px); }
  .jour-tete {
    display: flex; align-items: baseline; gap: 10px; padding-bottom: 8px; margin-bottom: 10px;
    border-bottom: 3px double #2a2418;
  }
  .jour-nom { font-family: Georgia, 'Times New Roman', serif; color: #1a160e; font-size: 22px; letter-spacing: 0.04em; font-weight: 700; }
  .jour-ed { color: #6a6250; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; }
  .jour-panel .nd-close { color: #2a2418; border-color: #6a6250; background: rgba(0,0,0,0.05); margin-left: auto; }
  .jour-panel .nd-close:hover { color: #000; box-shadow: none; background: rgba(0,0,0,0.12); }
  .jour-body { display: grid; grid-template-columns: 38% 1fr; gap: 14px; min-height: 220px; }
  .jour-som { list-style: none; margin: 0; padding: 0 8px 0 0; border-right: 1px solid #b8b09a; display: flex; flex-direction: column; gap: 8px; }
  .jour-som button {
    display: block; width: 100%; text-align: left; background: none; border: none; cursor: pointer;
    font-family: Georgia, serif; color: #33301f; font-size: 11px; line-height: 1.35; padding: 2px 0;
    border-bottom: 1px solid transparent;
  }
  .jour-som button:hover { color: #000; }
  .jour-som button.sel { color: #000; font-weight: 700; border-bottom-color: #2a2418; }
  .jour-art { font-family: Georgia, serif; color: #201c12; max-height: 300px; overflow-y: auto; padding-right: 4px; }
  .jour-art h3 { margin: 0 0 4px; font-size: 16px; line-height: 1.25; color: #100d06; }
  .jour-date { color: #6a6250; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; }
  .jour-chapo { font-weight: 700; font-size: 12px; line-height: 1.45; margin: 8px 0; }
  .jour-art p { font-size: 11.5px; line-height: 1.6; margin: 0 0 8px; text-align: justify; }
  .jour-panel .nd-foot { color: #6a6250; }

  /* ---- LE PHOTOBOOTH ---- */
  .pb-strip {
    display: flex; gap: 12px; overflow-x: auto; padding: 6px 2px 10px;
    scrollbar-width: thin; scrollbar-color: #6e2e5e transparent;
  }
  .pb-shot {
    flex: none; width: 150px; margin: 0; background: #0e0810; padding: 8px 8px 4px;
    border: 1px solid #6e2e5e; box-shadow: 0 4px 14px rgba(0,0,0,0.5); transform: rotate(-1.2deg);
  }
  .pb-shot:nth-child(even) { transform: rotate(1.4deg); }
  .pb-shot img { width: 100%; display: block; border: 1px solid #2a1626; }
  .pb-shot figcaption { color: #e0a8d0; font-size: 9px; font-style: italic; margin-top: 4px; text-align: center; letter-spacing: 0.04em; }
  .pb-vide { text-align: center; color: #b078a0; font-size: 12px; line-height: 1.7; padding: 26px 10px; font-style: italic; }

  /* ---- LA FRIPERIE ---- */
  .frip-rack { display: flex; gap: 12px; overflow-x: auto; padding: 6px 2px 10px; scrollbar-width: thin; scrollbar-color: #6e4a70 transparent; }
  .fringue {
    flex: none; width: 116px; display: flex; flex-direction: column; align-items: center; gap: 5px;
    padding: 10px 8px; border: 1px solid #3a2a3e; border-radius: 4px; background: #140f18;
    text-decoration: none; position: relative; transition: border-color 160ms ease, box-shadow 160ms ease;
  }
  a.fringue:hover { border-color: var(--fc); box-shadow: 0 0 14px color-mix(in srgb, var(--fc) 40%, transparent); }
  .fr-piece { width: 72px; height: 84px; display: flex; align-items: flex-end; justify-content: center; }
  .fr-piece img { max-width: 100%; max-height: 100%; }
  .fr-cintre {
    width: 60px; height: 66px; align-self: center;
    background: linear-gradient(160deg, var(--fc) 0%, #0a0810 130%);
    clip-path: polygon(50% 0, 58% 6%, 92% 62%, 100% 100%, 0 100%, 8% 62%, 42% 6%);
    box-shadow: inset 0 6px 10px rgba(255,255,255,0.12);
  }
  .fr-nom { color: #f0e2f4; font-size: 10px; letter-spacing: 0.08em; text-align: center; }
  .fr-prix { color: var(--fc); font-size: 10px; letter-spacing: 0.06em; }
  .fr-note { color: #9a7a9e; font-size: 8.5px; font-style: italic; text-align: center; line-height: 1.3; }
  .fr-go { position: absolute; top: 6px; right: 8px; color: var(--fc); font-size: 12px; }
  .frip-vide { text-align: center; color: #a888ac; font-size: 12px; line-height: 1.7; padding: 26px 10px; font-style: italic; }

  /* ---- LES TOILETTES ---- */
  .wc-room {
    position: absolute; inset: 0; z-index: 6;
    background:
      repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 38px, transparent 38px 40px),
      repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0 38px, transparent 38px 40px),
      linear-gradient(180deg, #17252a 0%, #0c1518 100%);
    display: flex; align-items: center; justify-content: center;
    animation: arc-in 420ms ease;
  }
  .wc-wall { position: relative; width: min(520px, 84vw); height: 300px; }
  .wc-graff { position: absolute; margin: 0; font-style: italic; text-shadow: 0 0 4px rgba(0,0,0,0.6); }
  .wc-graff.g1 { top: 12%; left: 8%; color: #ff5aa0; font-size: 18px; transform: rotate(-4deg); letter-spacing: 0.05em; }
  .wc-graff.g2 { top: 40%; left: 40%; color: #6ae0c0; font-size: 12px; transform: rotate(2deg); }
  .wc-graff.g3 { top: 26%; right: 12%; color: #ffd24a; font-size: 22px; transform: rotate(6deg); }
  .wc-graff.g4 { bottom: 22%; left: 12%; color: #b0a0ff; font-size: 13px; transform: rotate(-2deg); }
  .wc-graff.g5 { bottom: 34%; right: 16%; color: #ff8a3a; font-size: 15px; transform: rotate(3deg); letter-spacing: 0.1em; }
  .wc-hint { position: absolute; bottom: 4%; left: 50%; transform: translateX(-50%); color: rgba(180,210,205,0.4); font-size: 9px; letter-spacing: 0.22em; }

  /* ---- INTERNET (modem RTC) ---- */
  .net-screen {
    margin: 0; padding: 12px 14px; min-height: 150px;
    background: #020608; border: 1px solid #123a44; border-radius: 4px;
    font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.7;
    color: #6ee0ff; text-shadow: 0 0 6px rgba(63,227,255,0.5);
    white-space: pre-wrap; word-break: break-word;
  }
  .net-line { animation: fiche-in 200ms ease; }
  .net-cur { display: inline-block; animation: cur-blink 1s steps(1) infinite; }
  @keyframes cur-blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }

  /* ============ COLLAGE ANIMÉ — les perso découpés (It32) ============
     posés sur le fond vide, idle subtil (respiration/balancement), survol = « on ». */
  .perso {
    position: absolute;
    pointer-events: auto;
    transform-origin: 50% 100%; /* pivot aux pieds : le balancement part du bas */
    will-change: transform;
  }
  .perso img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
  }
  /* off = base froide toujours visible ; on = éclairage lanterne qui PULSE en
     sync avec la respiration de la scène (.lit), plein feu au survol */
  .perso .perso-on { opacity: 0; transition: opacity 420ms ease; }
  .lit .perso .perso-on { animation: perso-glow 4.6s ease-in-out infinite alternate; }
  .perso:hover .perso-on { animation: none; opacity: 1; } /* survol : plein feu */
  @keyframes perso-glow { from { opacity: 0.12; } to { opacity: 0.5; } }
  /* sprite unique (détourage propre) : survol → il s'illumine par effet lumière */
  .perso-src { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; user-select: none; -webkit-user-drag: none; transition: filter 420ms ease; }
  .perso.solo:hover .perso-src { filter: brightness(1.1) saturate(1.05) drop-shadow(0 0 8px rgba(180, 140, 255, 0.3)); }
  /* calque avant-plan (It33) : posé DEVANT les perso, ne bloque pas le clic */
  .fg-layer { position: absolute; object-fit: contain; pointer-events: none; user-select: none; -webkit-user-drag: none; }
  /* idle : deux tempos différents pour casser la symétrie */
  .perso-lean { animation: perso-breathe 5.2s ease-in-out infinite; }
  .perso-gaze { animation: perso-sway 6.6s ease-in-out infinite; }
  @keyframes perso-breathe {
    0%, 100% { transform: translateY(0) scale(1); }
    50% { transform: translateY(-0.5%) scale(1.008); }
  }
  @keyframes perso-sway {
    0%, 100% { transform: rotate(-0.7deg); }
    50% { transform: rotate(0.7deg); }
  }
  /* LÉVITATION (v9) : le perso monte (haut = position de base) puis redescend toucher
     le plancher ; son ombre au sol réagit (marquée en haut, ramassée au contact). */
  .perso-levit { animation: perso-levit 4.4s ease-in-out infinite; }
  @keyframes perso-levit {
    0%, 100% { transform: translateY(4.5%); }  /* contact plancher (plus bas) */
    50%      { transform: translateY(0); }      /* lévite (position de base) */
  }
  .perso-shadow {
    position: absolute; pointer-events: none; border-radius: 50%;
    background: radial-gradient(ellipse at 50% 50%,
      rgba(4,3,1,0.6) 0%, rgba(4,3,1,0.32) 45%, transparent 72%);
    filter: blur(3px);
  }
  .sh-levit { animation: sh-levit 4.4s ease-in-out infinite; }
  @keyframes sh-levit {
    0%, 100% { opacity: 0.72; transform: scale(0.85); }  /* point BAS (contact) : ombre MAX, nette */
    50%      { opacity: 0.04; transform: scale(1.32); }   /* point HAUT : quasi disparue, étalée */
  }
  @media (prefers-reduced-motion: reduce) {
    .perso-levit, .sh-levit { animation: none; }
  }
  .perso:hover { animation-play-state: paused; } /* au survol on fige l'idle, l'allumage prend le relais */

  /* ============ MINI-PROMPT « rouler un joint ? » (skin rétro) ============ */
  .roll-ask {
    position: absolute; inset: 0; z-index: 40;
    display: grid; place-items: center;
    background: radial-gradient(ellipse at center, transparent 30%, rgba(4,6,12,0.5) 100%);
    animation: roll-in 220ms ease;
  }
  @keyframes roll-in { from { opacity: 0; } to { opacity: 1; } }
  .roll-card {
    display: flex; flex-direction: column; align-items: center; gap: 8px;
    padding: 18px 26px;
    background: linear-gradient(180deg, #2a2013, #171009);
    border: 1px solid color-mix(in srgb, var(--v2000-jaune-sodium) 40%, #000);
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,210,140,0.06);
    color: var(--v2000-blanc-papier);
    font-family: inherit;
  }
  .roll-q { font-size: 17px; letter-spacing: .02em; color: var(--v2000-jaune-sodium); }
  .roll-sub { font-size: 12px; opacity: .7; margin-top: -4px; }
  .roll-choices { display: flex; gap: 10px; margin-top: 6px; }
  .roll-choices button {
    padding: 8px 16px; cursor: pointer;
    background: linear-gradient(180deg, #3a2c17, #241a0c);
    border: 1px solid color-mix(in srgb, var(--v2000-jaune-sodium) 55%, #000);
    border-radius: 7px; color: var(--v2000-blanc-papier);
    font: inherit; font-size: 14px;
    transition: filter 120ms ease, transform 80ms ease;
  }
  .roll-choices button:hover { filter: brightness(1.35); }
  .roll-choices button:active { transform: translateY(1px); }
  .roll-no {
    margin-top: 4px; padding: 3px 8px; cursor: pointer;
    background: none; border: none; color: rgba(244,243,236,0.45);
    font: inherit; font-size: 11px; text-decoration: underline;
  }
  .roll-no:hover { color: rgba(244,243,236,0.8); }

  /* ============ CALQUE EAU (v2) : shimmer léger sur les reflets peints ============
     bandes lumineuses horizontales qui tremblent verticalement + scintillement,
     fondu 'screen' pour ne rehausser que les zones claires (reflets). */
  .water {
    position: absolute;
    pointer-events: none;
    mix-blend-mode: screen;
    background-image:
      repeating-linear-gradient(0deg, transparent 0 5px, rgba(255, 210, 150, 0.05) 5px 6px),
      repeating-linear-gradient(0deg, transparent 0 9px, rgba(120, 175, 255, 0.04) 9px 10px);
    animation: water-shimmer 6s ease-in-out infinite;
    will-change: transform, opacity;
  }
  @keyframes water-shimmer {
    0%, 100% { transform: translateY(0); opacity: 0.35; }
    50%      { transform: translateY(1.2px); opacity: 0.6; }
  }
  @media (prefers-reduced-motion: reduce) { .water { animation: none; } }

  /* ============ LUMIÈRES VIVANTES (v9) : halo continu qui vacille ============
     source lumineuse projetée (lanterne, néon) — vit tout le temps, sous les perso,
     fondu 'screen' (ne fait que rehausser la lumière du fond). Rien à voir avec le
     highlight de survol, qui reste pour la sélection. */
  .light {
    position: absolute;
    pointer-events: none;
    mix-blend-mode: screen;
    border-radius: 50%;
    background: radial-gradient(ellipse at 50% 46%,
      color-mix(in srgb, var(--glow) 85%, #fff) 0%,
      var(--glow) 20%,
      color-mix(in srgb, var(--glow) 55%, transparent) 42%,
      transparent 70%);
    animation: light-flicker 3.4s ease-in-out infinite;
    will-change: opacity, transform;
  }
  @keyframes light-flicker {
    0%, 100% { opacity: 0.55; transform: scale(1); }
    38%      { opacity: 0.74; transform: scale(1.035); }
    52%      { opacity: 0.48; transform: scale(0.99); }
    68%      { opacity: 0.66; transform: scale(1.02); }
    84%      { opacity: 0.52; transform: scale(1); }
  }
  @media (prefers-reduced-motion: reduce) { .light { animation: none; } }
  /* zone d'une SOURCE lumineuse : cliquable, mais pas de crop de survol (sa vie = le halo).
     Un léger anneau de sélection au survol, sans baver sur les perso. */
  .lieu.zlight { background: none !important; }
  .lieu.zlight:hover {
    box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--v2000-jaune-sodium) 60%, transparent);
    border-radius: 12px;
  }

  /* ============ RONDS DE FUMÉE (placeholder CSS, remplacé par les frames noir en 'screen') ============ */
  .smokeable { cursor: pointer; }
  /* le rond : un conteneur qui GRIMPE de sa bouche (var --y0) jusqu'en haut (3%), et à
     l'intérieur l'image se transforme en FONDU (crossfade) à chaque frame → un seul rond
     qui évolue en montant, jamais deux frames empilées. */
  .ring-wrap {
    position: absolute; width: 13%;
    transform: translate(-50%, -50%);  /* top = CENTRE du rond → placement exact sur le rond de l'image */
    top: var(--y0);
    pointer-events: none;
    animation: ring-climb 3s ease-out forwards;
    will-change: top, opacity;
  }
  @keyframes ring-climb {
    0%   { top: var(--y0); opacity: 0; }
    12%  { opacity: 1; }        /* net, au départ (sur le rond de l'image) */
    45%  { opacity: 0.7; }      /* s'estompe progressivement en montant */
    75%  { opacity: 0.35; }
    100% { top: -8%; opacity: 0.12; } /* le dernier déborde/est coupé par le bord haut */
  }
  .smoke-ring {
    position: absolute; left: 0; top: 0; width: 100%; height: auto;
    mix-blend-mode: screen;  /* le fond noir disparaît, la fumée garde sa transparence */
    pointer-events: none; user-select: none; -webkit-user-drag: none;
  }
  @media (prefers-reduced-motion: reduce) { .ring-wrap { animation: none; } }
  @media (prefers-reduced-motion: reduce) { .smoke-ring { display: none; } }
</style>
