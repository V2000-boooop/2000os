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
  import PmuCourse from './PmuCourse.svelte';
  import { PHOTOS } from './soiree.js';
  import { FRINGUES } from './friperie.js';
  import { SLOTS as DU_SLOTS, BASE as DU_BASE, EXPECTED_FILES as DU_FILES, variantSrc, variantOf, loadOutfit, saveOutfit, randomOutfit, defaultOutfit } from './dressup.js';
  import { PALETTE as WC_PALETTE, TAILLES as WC_TAILLES, GRID as WC_GRID, chargerTags, sauverTags, ajouterTrait } from './tag.js';
  import { matrix3dForQuad } from './warp.js';
  import { etat, boire, fumer } from './etat.svelte.js';
  import { createUnivers } from './univers.js';
  import { porte, ressortir, zoneSfx, setAmbiance, duckAmbiance, loop } from './worldsound.js';
  // [DEMO PMU reactsound] couche Web Audio optionnelle, branchée UNIQUEMENT sur le PMU
  // (clics vivants + crossfade ambiance + ducking). Retirer ce bloc + les 5 hooks
  // marqués [DEMO PMU reactsound] pour revenir à l'état d'avant. worldsound.js intact.
  import { hit as rsHit, bed as rsBed, duck as rsDuck } from './reactsound.js';
  const rsPan = (z) => Math.max(-1, Math.min(1, ((((z?.x ?? 50) + (z?.w ?? 0) / 2) / 100) * 2 - 1))) * 0.7;

  const p = $derived(night.phase);
  const worldOn = $derived(['cabin', 'ignition', 'drive', 'return-cabin'].includes(p));
  const cockpitIn = $derived(['cabin', 'ignition', 'drive'].includes(p));
  const lit = $derived(p === 'ignition' || p === 'drive'); // le contact est mis

  // ---- la ville : moteur canvas, démarré avec la scène ----
  let cvs = $state(null);
  let mcvs = $state(null);
  let city = null;

  $effect(() => {
    if (!cvs) return;
    const c = createCity(cvs, null); // rétroviseur NON animé (retiré — n'avait pas de sens)
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
  let hoverOx = $state(50); // centre % du lieu survolé = origine du zoom-cadrage
  let hoverOy = $state(50);
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

  // clic mécanique de l'autoradio : joué EN PREMIER sur CHAQUE bouton ; puis le son arrive en fondu (1 s, géré par l'Émetteur)
  // préchargé dès le montage (et plus au premier clic) : le clac part sans latence
  let clicEl = null;
  try { clicEl = new Audio('/media/ui/clic_autoradio.webm'); clicEl.preload = 'auto'; } catch (e) {}
  function arClic() { try { if (!clicEl) return; const c = clicEl.cloneNode(); c.volume = 0.55; c.play().catch(() => {}); } catch (e) {} }
  function arStep(dir) { arClic(); setTimeout(() => { player.fadeIn = true; step(dir); }, 480); } // le son démarre APRÈS le clic, en fondu 1 s
  function arEject() { arClic(); eject(); }
  function toggle() {
    arClic();
    if (track) playTrack(track); // pilote la piste à l'antenne ; le son de base (physique) ne se met jamais en pause
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
    arClic();
    // le son démarre APRÈS le clic, avec un fondu d'1 s (touche 6 = seek aléatoire + fondu)
    setTimeout(() => { player.fadeIn = i !== 5; playTrack(it, { list: PRESETS, label: 'NIGHT DRIVE · 93.00 FM', random: i === 5 }); }, 480);
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
    img.src = '/media/nightdrive/habitacle_v1.webp';
  });

  // ---- la ville peinte (It13) : deux états, veilleuse / allumée ----
  // Le hack des menus PS2 : la même image existe éteinte et allumée, le
  // survol d'un lieu fond l'une dans l'autre SUR SA ZONE (sprite-crop CSS).
  // Les lieux du décor SONT les anciens dossiers (registre D12). Sans les
  // fichiers, la ville procédurale reste en poste (fallback).
  const V_OFF = '/media/nightdrive/ville_off_v1.webp';
  const V_ON = '/media/nightdrive/ville_on_v1.webp';
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
  const inGlove = $derived(stack.some((s) => s.id === 'glovebox')); // la boîte à gant : physiquement TOUJOURS dans la voiture

  // ---- SON DE BASE de l'habitacle (ambiance intérieur cuir) : démarre dès qu'on entre dans l'habitacle (d'où qu'on vienne),
  // se coupe si on quitte le lieu, si on entre dans une destination (boîte à gant, etc.) ou si l'autoradio/Émetteur diffuse ----
  let carRadio = null, carOn = false, carFade = null;
  const CAR_VOL = 0.8;
  function carFadeTo(target, ms) {
    if (carFade) clearInterval(carFade);
    const a = carRadio, start = a.volume, t0 = performance.now();
    carFade = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = Math.max(0, Math.min(1, start + (target - start) * k));
      if (k >= 1) { clearInterval(carFade); carFade = null; if (target === 0) a.pause(); }
    }, 40);
  }
  function updateCarRadio() {
    if (typeof Audio === 'undefined') return;
    if (!carRadio) { carRadio = new Audio('/media/nightdrive/son_habitacle.webm'); carRadio.loop = true; carRadio.volume = 0; }
    const on = p === 'drive' && (!inScene || inGlove) && !player.playing; // la boîte à gant reste dans la voiture → l'ambiance continue
    if (on && !carOn) {                 // ALLUMAGE : on arrive n'importe où dans l'enregistrement + fondu
      carOn = true;
      const seekRand = () => { const d = carRadio.duration; if (d && isFinite(d)) { try { carRadio.currentTime = Math.random() * d * 0.9; } catch (e) {} } };
      carRadio.volume = 0;
      carRadio.play().then(() => { seekRand(); carFadeTo(CAR_VOL, 900); }).catch(() => {});
      if (carRadio.readyState < 1) carRadio.addEventListener('loadedmetadata', seekRand, { once: true });
    } else if (!on && carOn) {          // EXTINCTION : fondu de sortie puis pause
      carOn = false; carFadeTo(0, 500);
    }
  }
  $effect(() => { p; inScene; player.playing; updateCarRadio(); });
  // Physique : l'autoradio est DANS la voiture → quitter l'habitacle coupe la radio... SAUF la boîte à gant (on reste dans la voiture).
  $effect(() => { if (p === 'drive' && inScene && !inGlove && player.playing) eject(); });
  // Face à la boîte à gant : le son (radio ou ambiance) passe à sa texture « boîte à gant », au même instant.
  $effect(() => { player.glovebox = inGlove && p === 'drive'; });
  onMount(() => {
    const kick = () => updateCarRadio();          // relance après un geste (politique autoplay navigateur)
    window.addEventListener('pointerdown', kick);
    return () => { window.removeEventListener('pointerdown', kick); if (carFade) clearInterval(carFade); if (carRadio) carRadio.pause(); };
  });
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

  // l'arrivée d'une scène : simple fondu (pas de zoom — le zoom-cadrage est réservé à l'habitacle)
  function arrive(node) {
    return {
      duration: 420,
      easing: cubicOut,
      css: (t) => `opacity:${t};`,
    };
  }

  // le regard (racine seulement — les intérieurs sont plein cadre, sans tête)
  function lieuEnter(l) {
    // le regard se tourne vers le lieu (même doctrine qu'It7, cible en %)
    lookX = Math.max(-1, Math.min(1, (l.x + l.w / 2 - 50) / 38));
    lookY = Math.max(-1, Math.min(1, (l.y + l.h / 2 - 50) / 42));
    hoverOx = l.x + l.w / 2; // le zoom se cadre sur le centre du lieu
    hoverOy = l.y + l.h / 2;
    hovering = true;
  }
  function lieuLeave() {
    lookX = 0;
    lookY = 0;
    hovering = false;
  }
  // zoom-cadrage à L'INTÉRIEUR des scènes (même sensation que l'habitacle) : ne
  // s'applique qu'à la scène du dessus, jamais aux scènes en plongée.
  let zHovering = $state(false), zHoverOx = $state(50), zHoverOy = $state(50);
  function zoomEnter(z) { zHoverOx = z.x + z.w / 2; zHoverOy = z.y + z.h / 2; zHovering = true; }
  function zoomLeave() { zHovering = false; }
  $effect(() => { sceneTop; zHovering = false; }); // changer de scène relâche le zoom
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

  // ---- LES CASSETTES de la boombox : le son joue ICI, dans la barque ----
  // (règle « son spatial cinéma », pas l'antenne : clic = lecture, re-clic = stop,
  //  sortir de la barque = stop ; à la fin de la bande, la K7 s'arrête seule)
  let k7Open = $state(false);
  let k7Cur = $state(null); // titre de la cassette en lecture, ou null
  let k7Audio = null;
  // -- les sons de la radio elle-même (fichiers Vincent, public/media/k7/) --
  let k7AB = 0;         // alternance des sons d'ouverture : radio_on / radio_ouvrir / radio_on…
  let k7OpenSnd = null; // le son d'ouverture en cours (coupé si K7 lancée ou radio refermée)
  let k7Bed = null;     // radio_mise_en_route : l'attente avant le choix (une fois, jamais relancé)
  let k7LastPass = 0;
  function k7Ui(name, vol = 0.9) {
    if (typeof Audio === 'undefined') return null;
    const a = new Audio(`/media/k7/${name}.mp3`);
    a.volume = vol;
    a.onerror = () => {}; // fichier absent : silence (050)
    a.play().catch(() => {});
    return a;
  }
  function k7Passby() { // survol radio/cassettes (throttle anti-mitraille)
    const t = performance.now();
    if (t - k7LastPass < 140) return;
    k7LastPass = t;
    k7Ui('radio_passby', 0.75);
  }
  function k7StopUi() { k7OpenSnd?.pause(); k7OpenSnd = null; k7Bed?.pause(); k7Bed = null; }
  function k7OpenBox() { // clic sur la boombox : le son d'ouverture (a/b alterné) + l'attente
    k7Open = true;
    k7StopUi();
    k7OpenSnd = k7Ui(k7AB % 2 ? 'radio_ouvrir' : 'radio_on');
    k7AB++;
    if (!k7Cur) k7Bed = k7Ui('radio_mise_en_route'); // rien si une K7 tourne déjà
  }
  function k7Stop() {
    k7Audio?.pause();
    k7Audio = null;
    k7Cur = null;
    // la musique se tait → les danseurs s'arrêtent NET (timer compris), même si on
    // vient de quitter la barque (l'effect ne voit plus ses persos, lui)
    for (const id in personaPose) {
      if (personaPose[id] === 'radio') { clearPose(id); setPose(id, undefined); setFrame(id, 0); }
    }
  }
  function k7Play(c) {
    k7StopUi(); // choisir (ou arrêter) une K7 coupe le son d'ouverture et l'attente
    if (k7Cur === c.titre) { k7Stop(); return; } // re-clic : on arrête la bande
    k7Stop();
    if (typeof Audio === 'undefined' || !c.src) return;
    const a = new Audio(c.src);
    a.volume = 0.9;
    a.onended = () => { if (k7Audio === a) k7Stop(); };
    a.onerror = () => { if (k7Audio === a) k7Stop(); }; // fichier absent : silence (050)
    k7Audio = a;
    k7Cur = c.titre;
    a.play().catch(() => k7Stop());
  }
  const k7OnAir = $derived(k7Cur);
  // sortir de la barque (ou du monde) = la boombox se tait, la boîte se referme
  $effect(() => { if (p !== 'drive') { cielOpen = false; k7Open = false; } });
  $effect(() => { if (!k7Open) k7StopUi(); }); // radio refermée (✕, Échap, sortie) = ses sons se taisent
  $effect(() => { if (sceneTop !== 'barque' && k7Cur) k7Stop(); });
  $effect(() => () => { k7Stop(); k7StopUi(); }); // démontage de la Destination

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
    if (z) {
      // [DEMO PMU reactsound] clic vivant (pitch/pan variables) sur le PMU, sinon one-shot HTML classique
      if (sceneTop === 'pmu') rsHit(`zone_pmu_${z.id}`, { pan: rsPan(z) });
      else zoneSfx(sceneTop, z.id);
    }
    if (sceneTop === 'pmu') rsDuck(true); // [DEMO PMU reactsound] une destination s'ouvre → l'ambiance se fait petite
  }
  function closeRoom() {
    if (room === 'internet') netStop();
    room = null;
    rsDuck(false); // [DEMO PMU reactsound] destination fermée → l'ambiance revient
  }
  function closeUnivers() { univers = null; }

  // le canvas du grattage vient de (re)paraître, pas encore révélé → couche fraîche
  $effect(() => {
    if (room === 'grattage' && gratCvs && !gratRevealed) gratCouche();
  });

  // ============ LE MUR À TAGUER DES CHIOTTES (3.1) ============
  // canvas 2D, spray façon Jet Set Radio (grain + coulures), trace persistante
  // vectorielle (localStorage, plafond FIFO — cf. tag.js). Le mur EST enfant de
  // laride (room='toilettes' dans la pile gigogne, Échap dépile — D15).
  let wcCvs = $state(null);
  let wcCoul = $state(0);        // index couleur bombe (PALETTE)
  let wcTaille = $state(1);      // index taille (TAILLES)
  let wcTags = [];               // liste vectorielle chargée (les traits d'avant)
  let wcSpraying = false;
  let wcTrait = null;            // trait en cours { c, s, p:[…] } en coords GRID
  let wcDrips = [];              // coulures en cours d'animation
  let wcRaf = 0;
  let wcAmb = null;              // boucle sifflement de bombe (optionnelle, 050)

  // --- WC en PERSPECTIVE : la pièce est une IMAGE ; le tag se projette sur le
  // MUR GAUCHE (4 coins en fraction du cadre) via matrix3d (warp.js). ---
  let wcLit = $state(true);      // néon allumé / éteint (blacklight)
  let wcWarp = $state('');       // matrix3d du calque de tag
  let wcFrameEl = $state(null);  // le cadre (pour mesurer les 4 coins réels)
  // 4 coins du pan de mur gauche, fraction (0..1) du cadre — AJUSTABLES si le tag déborde.
  const WC_WALL = { hg:{x:0.00,y:0.02}, hd:{x:0.455,y:0.20}, bg:{x:0.00,y:0.95}, bd:{x:0.455,y:0.56} };
  function wcComputeWarp() {
    if (!wcFrameEl || !wcCvs) return;
    const w = wcFrameEl.clientWidth, h = wcFrameEl.clientHeight;
    if (!w || !h) return;
    wcWarp = matrix3dForQuad(w, h, {
      hg:{x:WC_WALL.hg.x*w, y:WC_WALL.hg.y*h}, hd:{x:WC_WALL.hd.x*w, y:WC_WALL.hd.y*h},
      bg:{x:WC_WALL.bg.x*w, y:WC_WALL.bg.y*h}, bd:{x:WC_WALL.bd.x*w, y:WC_WALL.bd.y*h},
    });
  }

  // convertit un event pointeur → coords GRID (0..GRID) sur le canvas
  function wcXY(e) {
    // le calque est déformé par matrix3d → offsetX/Y arrivent déjà en coords
    // LOCALES non déformées (le navigateur inverse la transform pour le hit-test).
    const w = wcCvs.clientWidth || 1, h = wcCvs.clientHeight || 1;
    return [ (e.offsetX / w) * WC_GRID, (e.offsetY / h) * WC_GRID ];
  }
  // dessine un jet de spray (nuage de points, dense au centre) à x,y (coords GRID)
  function wcSpray(g, x, y, rGrid, hex) {
    const w = wcCvs.width, h = wcCvs.height;
    const px = (x / WC_GRID) * w, py = (y / WC_GRID) * h;
    const r = (rGrid / WC_GRID) * w;
    g.fillStyle = hex;
    const n = Math.round(rGrid * 2.2);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.pow(Math.random(), 0.6) * r; // densité vers le centre
      g.globalAlpha = 0.06 + Math.random() * 0.16; // grain translucide
      g.fillRect(px + Math.cos(a) * d, py + Math.sin(a) * d, 1.5, 1.5);
    }
    g.globalAlpha = 1;
  }
  // repeint tout le mur : fond carrelage → tags Vincent → tags visiteur → trait courant
  function wcRepaint() {
    if (!wcCvs) return;
    const g = wcCvs.getContext('2d');
    const w = wcCvs.width, h = wcCvs.height;
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.clearRect(0, 0, w, h);
    // Les tags de Vincent (RAVE EUSKADI…) sont DÉJÀ peints dans l'image du mur →
    // le canvas ne porte QUE les tags du visiteur, projetés par-dessus.
    g.globalAlpha = 1;
    for (const tr of wcTags) wcPaintTrait(g, tr);
    if (wcTrait) wcPaintTrait(g, wcTrait);
  }
  // peint un trait vectoriel entier (série de sprays le long de la polyligne)
  function wcPaintTrait(g, tr) {
    const hex = WC_PALETTE[tr.c]?.hex ?? '#fff';
    const p = tr.p;
    for (let i = 0; i < p.length - 2; i += 2) {
      const x0 = p[i], y0 = p[i + 1], x1 = p[i + 2], y1 = p[i + 3];
      const seg = Math.hypot(x1 - x0, y1 - y0);
      const steps = Math.max(1, Math.round(seg / 4));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        wcSpray(g, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, tr.s, hex);
      }
    }
    if (p.length === 2) wcSpray(g, p[0], p[1], tr.s, hex);
  }
  // boucle des coulures : de légères gouttes descendent puis figent
  function wcDripLoop() {
    if (!wcCvs) return;
    const g = wcCvs.getContext('2d');
    const w = wcCvs.width, h = wcCvs.height;
    let alive = false;
    for (const d of wcDrips) {
      if (d.life <= 0) continue;
      alive = true;
      d.vy += 0.02;
      d.y += d.vy;
      d.life--;
      g.globalAlpha = 0.5;
      g.fillStyle = d.hex;
      g.fillRect((d.x / WC_GRID) * w, (d.y / WC_GRID) * h, 2, 3);
      g.globalAlpha = 1;
    }
    wcDrips = wcDrips.filter((d) => d.life > 0);
    if (alive) wcRaf = requestAnimationFrame(wcDripLoop);
    else wcRaf = 0;
  }
  function wcDown(e) {
    if (!wcCvs) return;
    wcSpraying = true;
    const [x, y] = wcXY(e);
    wcTrait = { c: wcCoul, s: WC_TAILLES[wcTaille], p: [Math.round(x), Math.round(y)] };
    if (!wcAmb) wcAmb = loop('zone_laride_bombe', 0.5); // sifflement optionnel (silence si absent)
    wcPaintTrait(wcCvs.getContext('2d'), wcTrait);
  }
  function wcMove(e) {
    if (!wcSpraying || !wcTrait) return;
    const [x, y] = wcXY(e);
    const p = wcTrait.p;
    const lx = p[p.length - 2], ly = p[p.length - 1];
    if (Math.hypot(x - lx, y - ly) < 6) return; // évite d'empiler des points identiques
    p.push(Math.round(x), Math.round(y));
    const g = wcCvs.getContext('2d');
    const seg = Math.hypot(x - lx, y - ly);
    const steps = Math.max(1, Math.round(seg / 4));
    const hex = WC_PALETTE[wcTrait.c].hex;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      wcSpray(g, lx + (x - lx) * t, ly + (y - ly) * t, wcTrait.s, hex);
    }
    // coulure de temps en temps (game-feel Jet Set Radio)
    if (Math.random() < 0.05) {
      wcDrips.push({ x, y, vy: 0.3, life: 40 + Math.random() * 60, hex });
      if (!wcRaf) wcRaf = requestAnimationFrame(wcDripLoop);
    }
  }
  function wcUp() {
    if (!wcTrait) { wcSpraying = false; return; }
    wcSpraying = false;
    wcTags = ajouterTrait(wcTags, wcTrait); // + plafond FIFO
    sauverTags(wcTags);                     // persistance vectorielle légère
    wcTrait = null;
    wcAmb?.stop(); wcAmb = null;
  }
  function wcEfface() {
    wcTags = [];
    wcDrips = [];
    sauverTags(wcTags);
    wcRepaint();
  }

  // le mur des chiottes (re)paraît → on charge la trace et on repeint (D15 gigogne)
  $effect(() => {
    if (room === 'toilettes' && wcCvs) {
      wcTags = chargerTags();
      wcRepaint();
      requestAnimationFrame(wcComputeWarp); // mesure le cadre une fois posé → projette
    }
  });
  // recalcule la projection du tag quand la fenêtre change de taille
  $effect(() => {
    if (typeof window === 'undefined') return;
    const on = () => { if (room === 'toilettes') wcComputeWarp(); };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  });
  // on quitte la pièce → couper le sifflement et l'anim des coulures
  $effect(() => {
    if (room !== 'toilettes') {
      wcAmb?.stop(); wcAmb = null;
      if (wcRaf) { cancelAnimationFrame(wcRaf); wcRaf = 0; }
      closeWcSub();
    }
  });

  // ===== TOILETTES v2 : lieu cadré + 2 interactions (urinoir = viser la mouche,
  // lavabo = boire → dessaouler). Cinéma : cadre noir, images non étirées. =====
  const WC_ON  = '/media/nightdrive/scenes/laride_wc_on_v1.webp';
  const WC_OFF = '/media/nightdrive/scenes/laride_wc_off_v1.webp';
  let wcLit2 = $state(true);       // néon (nouvel interrupteur du lieu cadré)
  let wcSub  = $state(null);       // null | 'pee' | 'drink'
  function openWcSub(k) { wcSub = k; if (k === 'pee') requestAnimationFrame(peeInit); }
  function closeWcSub() {
    if (peeRaf) { cancelAnimationFrame(peeRaf); peeRaf = 0; }
    peeRun = false;
    if (drinkRaf) { cancelAnimationFrame(drinkRaf); drinkRaf = 0; }
    wcSub = null;
  }

  // --- MINI-JEU : viser la mouche de l'urinoir (le gag classique) ---
  let peeCvs = $state(null), peeRaf = 0, peeRun = false;
  let peeScore = $state(0), peeBladder = $state(100), peeDone = $state(null);
  let peeAim = 0.5, peePeeing = false, peeFly = { x: 0.5, y: 0.55, dir: 1 };
  function peeInit() {
    peeScore = 0; peeBladder = 100; peeDone = null; peeAim = 0.5; peePeeing = false;
    peeFly = { x: 0.5, y: 0.55, dir: 1 }; peeRun = true;
    if (!peeRaf) peeRaf = requestAnimationFrame(peeStep);
  }
  function peeSet(e) { const w = peeCvs?.clientWidth || 1; peeAim = Math.min(1, Math.max(0, e.offsetX / w)); }
  function peeDown(e) { if (peeDone) return; peePeeing = true; peeSet(e); }
  function peeMove(e) { if (peePeeing) peeSet(e); }
  function peeUp() { peePeeing = false; }
  function peeRoundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
  }
  function peeFinish(win) {
    peeDone = win
      ? 'MOUCHE ÉLIMINÉE ×5 — +1 CLASSE. Tu es la légende des chiottes de LA RIDE.'
      : 'vessie vide, éclaboussures partout. la honte. (réessaie)';
    peeRun = false;
  }
  function peeStep() {
    if (!peeCvs || !peeRun) return;
    const g = peeCvs.getContext('2d'), W = peeCvs.width, H = peeCvs.height;
    // la mouche zigzague
    peeFly.x += 0.006 * peeFly.dir * (0.6 + Math.random() * 0.8);
    if (peeFly.x > 0.78) { peeFly.x = 0.78; peeFly.dir = -1; }
    if (peeFly.x < 0.22) { peeFly.x = 0.22; peeFly.dir = 1; }
    peeFly.y = 0.52 + 0.05 * Math.sin(Date.now() / 280);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#0c1512'; g.fillRect(0, 0, W, H);
    // urinoir (faïence + creux)
    g.fillStyle = '#d7d1c4'; peeRoundRect(g, W * 0.26, H * 0.16, W * 0.48, H * 0.66, 44); g.fill();
    g.fillStyle = '#8f9a8e'; peeRoundRect(g, W * 0.33, H * 0.24, W * 0.34, H * 0.44, 30); g.fill();
    g.fillStyle = '#2a332c'; peeRoundRect(g, W * 0.44, H * 0.6, W * 0.12, H * 0.05, 8); g.fill(); // bonde
    const fx = peeFly.x * W, fy = peeFly.y * H;
    if (!peeDone) {
      g.fillStyle = '#141414'; g.beginPath(); g.ellipse(fx, fy, 7, 5, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.55)';
      g.beginPath(); g.ellipse(fx - 3, fy - 3, 3, 2, 0, 0, 7); g.ellipse(fx + 3, fy - 3, 3, 2, 0, 0, 7); g.fill();
    }
    if (peePeeing && peeBladder > 0 && !peeDone) {
      const sx0 = W * 0.5, sy0 = H * 0.98, sx1 = peeAim * W, sy1 = peeFly.y * H;
      g.strokeStyle = 'rgba(255,214,106,0.9)'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(sx0, sy0); g.quadraticCurveTo((sx0 + sx1) / 2, sy0 - H * 0.2, sx1, sy1); g.stroke();
      g.fillStyle = 'rgba(255,214,106,0.5)';
      for (let i = 0; i < 6; i++) g.fillRect(sx1 + (Math.random() - 0.5) * 22, sy1 + (Math.random() - 0.5) * 16, 2, 2);
      peeBladder = Math.max(0, peeBladder - 0.4);
      if (Math.hypot(sx1 - fx, sy1 - fy) < 16) {
        peeScore++; peeFly.x = 0.22 + Math.random() * 0.56;
        if (peeScore >= 5) peeFinish(true);
      }
    }
    if (peeBladder <= 0 && !peeDone) peeFinish(false);
    if (peeRun) peeRaf = requestAnimationFrame(peeStep);
  }

  // --- LAVABO : maintenir pour boire → ivresse/défonce redescendent ---
  let drinkRaf = 0;
  function drinkStart() {
    if (drinkRaf) return;
    const tick = () => {
      boire(0.9);
      if (etat.ivresse <= 0 && etat.defonce <= 0) { drinkStop(); return; }
      drinkRaf = requestAnimationFrame(tick);
    };
    drinkRaf = requestAnimationFrame(tick);
  }
  function drinkStop() { if (drinkRaf) { cancelAnimationFrame(drinkRaf); drinkRaf = 0; } }
  // la tête du perso selon l'état (à générer par Vincent ; repli sur la base).
  const ETAT_HEADS = {
    sobre:   '/media/nightdrive/perso/etats/laride_sobre.webp',
    defonce: '/media/nightdrive/perso/etats/laride_defonce.webp',
    bourre:  '/media/nightdrive/perso/etats/laride_bourre.webp',
  };
  const etatKey = $derived(
    (etat.ivresse < 15 && etat.defonce < 15) ? 'sobre'
      : etat.ivresse >= etat.defonce ? 'bourre' : 'defonce'
  );

  // le confessionnal : tes vocaux tournent en boucle tant qu'on écoute (D13 :
  // on prend l'antenne). Silence total si le fichier n'est pas déposé (050).
  $effect(() => {
    if (room !== 'confess') return;
    if (player.trackId) eject();
    const v = loop('zone_cathedrale_confessionnal', 0.85);
    return () => v.stop();
  });

  // le vitrail : la boucle de SA dimension tourne tant qu'on y est (univers_dark / univers_ange,
  // sons de Vincent — silence si absent, 050). S'arrête en redescendant (Échap).
  $effect(() => {
    if (!univers) return;
    const v = loop(`univers_${univers}`, 0.38);
    return () => v.stop();
  });

  // tout se referme quand on coupe le contact (comme les autres salles)
  $effect(() => { if (p !== 'drive') { room = null; univers = null; netStop(); } });

  // ---- LE LIT D'AMBIANCE : la boucle de la scène courante, duckée par
  //      l'antenne ou par une expérience plein cadre (D13) ----
  $effect(() => {
    const s = worldOn ? sceneTop : null;
    // [DEMO PMU reactsound] le PMU passe par le crossfade Web Audio ; tout le reste reste sur worldsound
    if (s === 'pmu') { setAmbiance(null); rsBed('ambiance_pmu'); }
    else { rsBed(null); rsDuck(false); setAmbiance(s); }
  });
  $effect(() => {
    const fullscreen = !!univers || cielOpen || room === 'confess';
    duckAmbiance(player.playing || fullscreen || sermonOn || !!k7Cur); // sermon ou boombox : le monde se fait murmure
  });
  $effect(() => () => { setAmbiance(null); rsBed(null); }); // démontage de la Destination : silence ([DEMO PMU reactsound] coupe aussi le bed Web Audio)

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
  // niveau de lévitation ACTIF au rendu : pendant l'ENTRÉE state2, les 2 premières frames
  // restent petites et à leur place (assise normale) ; le grossissement/décollage démarre à
  // la 3e frame. Toujours actif pour blow2 / la pose tenue / state4.
  function floatOn(perso) {
    const lvl = floatState[perso.id]; if (!lvl) return 0;
    const pose = personaPose[perso.id]; const fr = personaFrame[perso.id] ?? 0;
    // ENTRÉE d'un palier : les 2 premières frames gardent la taille du palier PRÉCÉDENT,
    // puis ça grossit/décolle à partir de la 3e frame.
    if (pose === 'state2' && fr < 2) return 0;   // entrée lotus : reste au sol (petite, à sa place)
    if (pose === 'state4' && fr < 2) return 2;   // entrée déesse : reste taille lotus, puis grandit
    if (pose === 'state6' && fr < 2) return 4;   // entrée boule : reste taille Shiva, puis se dissout
    return lvl;
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
  // PALIERS D'ÉTAT de Stick (pattern du projet) : à N taffes → une anim qui se FIGE
  // et devient sa pose PERSISTANTE dans la barque (il reste dans cet état). Frames à
  // fournir dans stick.poses (state2, state4, …) → tant qu'absentes, taffe normale.
  // Par perso ; SEUL Stick touche l'état joueur. Chaque perso garde son palier tenu.
  let puffs = {}, held = {};
  // niveau de lévitation TENU par perso (réactif) : 0 = posé · 2 = flotte (lotus) · 4 = flotte haut (déesse).
  // piloté par les paliers ci-dessous ; reste vide tant que les frames state2/state4 ne sont pas déposées.
  let floatState = $state({});
  let ascension = $state(false);   // ÉVÉNEMENT plein écran (flash + onde) pendant la montée
  let ascLevel = $state(4);        // 4 = Shiva · 6 = boule d'énergie (flash plus violent)
  const PERSO_STATES = { stick: { 5: 'state2', 10: 'state4' }, myrtille: { 5: 'state2', 10: 'state4', 15: 'state6' } };
  // Anim « fume DANS l'état flottant tenu » : elle taffe/exhale sans quitter la pose
  // (frames qui partent ET reviennent sur la frame de lévitation → dernière frame = pose tenue).
  const STATE_SMOKE = { state2: 'blow2', state4: 'blow4' };
  // ====== JAUGE DE MAINTIEN (états spéciaux) : dès qu'elle lévite, une jauge se vide ;
  //        chaque taffe la remplit à fond. À zéro → elle REDESCEND d'un cran (Shiva→lotus→sol). ======
  let gauge = $state({});                       // id -> 0..1 (affichée tant que l'état spécial tient)
  let gaugeTimer = null;
  const GAUGE_MS = 10000, GAUGE_TICK = 100;     // vidage complet en ~10 s sans refumer
  function armGauge(id) {                        // (re)remplit à fond + lance le tic si besoin
    gauge = { ...gauge, [id]: 1 };
    if (!gaugeTimer) gaugeTimer = setInterval(tickGauges, GAUGE_TICK);
  }
  function tickGauges() {
    const g = { ...gauge }; const drop = [];
    for (const id in g) {
      if (!floatState[id]) { delete g[id]; continue; }
      g[id] -= GAUGE_TICK / GAUGE_MS;
      if (g[id] <= 0) { delete g[id]; drop.push(id); }
    }
    gauge = g;
    for (const id of drop) demoteState(id);
    if (!Object.keys(gauge).length) { clearInterval(gaugeTimer); gaugeTimer = null; }
  }
  function demoteState(id) {                      // jauge vide → un cran plus bas
    clearPose(id);                                // stoppe l'idle (ping-pong forme finale, etc.)
    const lvl = floatState[id];
    if (lvl >= 6) {                               // boule d'énergie → Shiva (repart de 10 taffes)
      floatState = { ...floatState, [id]: 4 };
      puffs[id] = 10; held[id] = 'state4';
      setPose(id, 'state4'); setFrame(id, 999);
      armGauge(id);
    } else if (lvl >= 4) {                        // Shiva → lotus (repart de 5 taffes)
      floatState = { ...floatState, [id]: 2 };
      puffs[id] = 5; held[id] = 'state2';
      setPose(id, 'state2'); setFrame(id, 999);
      armGauge(id);
    } else {                                      // lotus → sol : retour idle
      const f = { ...floatState }; delete f[id]; floatState = f;
      puffs[id] = 0; held[id] = undefined; setSmoking(id, false);
      setPose(id, undefined); setFrame(id, 0);
    }
  }
  // ÉVÉNEMENT plein écran + bascule en Shiva : flash violet/onde de choc, puis la
  // transformation state4 s'enclenche au pic du flash et se fige en déesse tenue.
  function triggerAscension(id, key = 'state4', level = 4) {
    if (p !== 'drive') return;
    ascension = true; ascLevel = level;                // level → intensité du flash (6 = boule d'énergie, plus fort)
    playSfx(`/media/nightdrive/sons/ascension${level >= 6 ? '6' : ''}.wav`); // silence si absent
    setTimeout(() => {                                 // au pic du flash → la transformation se joue
      held[id] = key;
      floatState = { ...floatState, [id]: level };
      armGauge(id);
      const per = (SCENES[sceneTop]?.personnages ?? []).find((x) => x.id === id);
      if (level >= 6 && per?.poses?.final6) {           // Shiva → se dissout, PUIS s'installe dans sa forme finale
        playPose(id, key, { fps: 3 });                 // la transfo joue (jusqu'à l'orbe)
        clearTimeout(poseTimers[id + '_final']);
        poseTimers[id + '_final'] = setTimeout(() => finalRest(id), (per.poses[key].length) * (1000 / 3));
      } else {
        playPose(id, key, { fps: 3, hold: true });
      }
    }, level >= 6 ? 300 : 240);
    setTimeout(() => { ascension = false; }, level >= 6 ? 1250 : 950);
  }
  // IDLE PING-PONG (réutilisable pour faire vivre un perso) : joue b→a→b→c→b… lentement.
  // frames = [a, b, c] ; ordre des index = [1,0,1,2]. Une seule frame → statique.
  function startPingpong(id, key, ms = 900) {
    clearPose(id);
    const per = (SCENES[sceneTop]?.personnages ?? []).find((x) => x.id === id);
    const fr = per?.poses?.[key];
    setPose(id, key);
    if (!Array.isArray(fr) || fr.length < 2) { setFrame(id, 0); return; }
    const order = [1, 0, 1, 2]; let k = 0; setFrame(id, Math.min(order[0], fr.length - 1));
    seqTimers[id] = setInterval(() => { k = (k + 1) % order.length; setFrame(id, Math.min(order[k], fr.length - 1)); }, ms);
  }
  // BOUCLE CONTINUE (réutilisable) : joue 0→1→…→n-1→0… en avant, sans fin. 1 frame → statique.
  function startLoop(id, key, ms = 120) {
    clearPose(id);
    const per = (SCENES[sceneTop]?.personnages ?? []).find((x) => x.id === id);
    const fr = per?.poses?.[key];
    setPose(id, key);
    if (!Array.isArray(fr) || fr.length < 2) { setFrame(id, 0); return; }
    let k = 0; setFrame(id, 0);
    seqTimers[id] = setInterval(() => { k = (k + 1) % fr.length; setFrame(id, k); }, ms);
  }
  // FORME FINALE : au REPOS elle est STATIQUE (frame 0). Elle ne "bouge" que si on la sollicite.
  const finalRest = (id) => { clearPose(id); setPose(id, 'final6'); setFrame(id, 0); };
  // clic → joue les 10 frames UNE fois (l'énergie s'active), puis retour au repos.
  function playFinalAnim(id) {
    const per = (SCENES[sceneTop]?.personnages ?? []).find((x) => x.id === id);
    const fr = per?.poses?.final6;
    clearPose(id); setPose(id, 'final6'); setFrame(id, 0);
    if (!Array.isArray(fr) || fr.length < 2) return;
    let i = 0;
    seqTimers[id] = setInterval(() => {
      i++;
      if (i >= fr.length) { clearInterval(seqTimers[id]); setFrame(id, 0); } // retour repos
      else setFrame(id, i);
    }, 90);
  }
  function keepSmoking(id) {
    clearTimeout(poseTimers[id + '_smoke']);
    poseTimers[id + '_smoke'] = setTimeout(() => {
      setSmoking(id, false);
      if (held[id] === 'state6') finalRest(id);  // forme finale : reste STATIQUE au repos
      else if (held[id]) { setPose(id, held[id]); setFrame(id, 999); } // reste dans son état tenu
      else { setPose(id, undefined); setFrame(id, 0); }
    }, 20000);
  }
  function rollJoint(id) {
    rollAsk = false;
    playSfx(`/media/nightdrive/sons/roll_${id}.wav`);
    setSmoking(id, true);
    keepSmoking(id);
    if (id === 'myrtille') {            // enchaîne : elle roule PUIS fume (anim riche) → détente tenue
      playPose(id, 'roll', { fps: 3 });
      setTimeout(() => { if (smoking[id]) playPose(id, 'ring', { fps: 3, then: 'smoke' }); }, 2500); // après le roll → elle souffle un ROND

    } else {
      playPose(id, 'roll', { fps: 3, then: 'smoke' }); // ~330 ms/frame → bien visible
    }
    if (id === 'stick') fumer(24); // SEUL le raver (le joueur) voit sa défonce monter
  }
  // clic sur un perso : si elle fume → elle souffle un rond
  function personaClick(perso) {
    if (p !== 'drive') return;
    if (held[perso.id] === 'state6') { armGauge(perso.id); playFinalAnim(perso.id); return; } // forme finale : clic → joue l'anim énergie UNE fois
    if (smoking[perso.id]) blowRing(perso);
  }
  // UN SEUL rond qui MONTE de sa bouche jusqu'en haut en SE TRANSFORMANT à travers ses 6
  // frames (naissance → dissipation), avec un FONDU entre chaque image (pas de coupe sèche,
  // jamais deux frames superposées). Il sort quand elle crache (~1,1 s).
  function blowRing(perso) {
    playSfx('/media/nightdrive/sons/blow.wav');
    keepSmoking(perso.id);
    const id = perso.id;
    if (id === 'stick') fumer(16);            // SEUL le raver (joueur) fait monter l'état global
    puffs[id] = (puffs[id] ?? 0) + 1;
    const key = PERSO_STATES[id]?.[puffs[id]];
    if (key && perso.poses?.[key]) {          // palier atteint (frames présentes) → il TIENT le nouvel état
      if (id === 'myrtille' && (key === 'state4' || key === 'state6')) {
        const lvl = key === 'state6' ? 6 : 4;
        if (key === 'state4' && perso.poses.charge4) {
          // GRAND ÉVÉNEMENT : charge (aura qui monte) → flash → transformation Shiva tenue.
          playPose(id, 'charge4', { fps: 3 });
          clearTimeout(poseTimers[id + '_asc']);
          poseTimers[id + '_asc'] = setTimeout(() => triggerAscension(id, key, lvl), 1900);
        } else {
          // BOULE D'ÉNERGIE : la dissolution est dans l'anim → event encore plus fort tout de suite.
          triggerAscension(id, key, lvl);
        }
      } else {
        playPose(id, key, { fps: 3, hold: true }); held[id] = key;
        // Myrtille décolle à ses paliers (lotus puis déesse). Stick reste assis → pas de lévitation.
        if (id === 'myrtille' && /^state[24]$/.test(key)) { floatState = { ...floatState, [id]: Number(key.slice(5)) }; armGauge(id); } // 2 → lévite (lotus) · 4 → lévite haut (déesse)
      }
    } else {
      const floating = !!held[id] && /^state[246]$/.test(held[id]);
      const inState = floating ? STATE_SMOKE[held[id]] : null;
      if (inState && perso.poses?.[inState]) {  // elle TAFFE/EXHALE sans quitter l'état flottant → revient sur la pose tenue
        playPose(id, inState, { fps: inState === 'blow4' ? 2 : 3, hold: true }); armGauge(id); // grâce (Shiva) = lent
      } else if (held[id] === 'state6') {        // forme finale : reste STATIQUE (l'anim ne joue qu'au clic via personaClick)
        armGauge(id); finalRest(id);
      } else if (floating) {                    // pas d'anim « fume dans cet état » → reste figée sur sa pose tenue
        setPose(id, held[id]); setFrame(id, 999); armGauge(id);
      } else {                                  // taffe normale au sol : Myrtille ALTERNE rond de fumée / recrache (variété)
        const anim = (id === 'myrtille' && perso.poses?.ring && puffs[id] % 2 === 1) ? 'ring' : 'blow';
        playPose(id, anim, { fps: 3, then: held[id] ?? 'smoke' });
      }
    }
  }
  // ============ [PRÊTRE] perso vivant à humeur (cathédrale) — 060 §2 ============
  // It41 : le prêtre est ANIMÉ (planches de Vincent, tools/build_pretre_frames.py).
  // L'église est VIDE à l'arrivée. Après le délai, il ENTRE en marchant depuis le
  // hors-champ (côté autel), s'arrête à sa place, et quémande (anim en boucle +
  // dialogue décalé pour ne pas le couvrir). OUI → bénédiction (main lumineuse) +
  // sermon joyeux, il reste dans le décor. NON → il encaisse (gueulante) puis se
  // DISSOUT en fumée violette — plus de prêtre jusqu'à la prochaine visite.
  // UNE demande par visite (l'ancien harcèlement périodique est retiré).
  let priestMood = $state(null);    // null | 'joyeux' | 'vener' (mémorisé)
  let priestPose = $state('idle');  // idle | marche | demande | don | refus | disparition | sermon_*
  let priestFrame = $state(0);      // frame courante si la pose est une séquence
  let priestOn = $state(false);     // présent dans la nef
  let priestWalking = $state(false);
  let priestX = $state(null);       // left % courant (null = position du bloc)
  let coinAsk = $state(false);      // dialogue « une pièce ? »
  let sermonOn = $state(false);     // sermon en cours → affiche les halos d'humeur
  let sermonTimer, priestSeq, priestHold, priestWalkT;
  const priest = $derived(sceneTop === 'cathedrale' ? SCENES.cathedrale?.priest : null);

  // pose → src (sprite unique OU séquence de frames, même contrat que resolvePose)
  function priestSrc(P) {
    const pose = P.poses?.[priestPose] ?? P.poses?.idle;
    if (Array.isArray(pose)) return pose[Math.min(priestFrame, pose.length - 1)];
    return pose;
  }
  // opts : { fps } · { loop } · { then } enchaîne à la fin · sinon retour idle après endHold
  function playPriest(key, opts = {}) {
    clearInterval(priestSeq); clearTimeout(priestHold);
    priestPose = key; priestFrame = 0;
    const pose = priest?.poses?.[key];
    if (!Array.isArray(pose) || pose.length < 2) return;
    const fps = opts.fps ?? 6;
    let i = 0;
    priestSeq = setInterval(() => {
      i++;
      if (i >= pose.length) {
        if (opts.loop) { i = 0; priestFrame = 0; return; }
        clearInterval(priestSeq);
        priestFrame = pose.length - 1;
        if (opts.then) opts.then();
        else priestHold = setTimeout(() => { priestPose = 'idle'; priestFrame = 0; }, opts.endHold ?? 1400);
      } else priestFrame = i;
    }, 1000 / fps);
  }

  // l'entrée : hors-champ → sa place, en marchant (une fois par visite)
  $effect(() => {
    if (sceneTop !== 'cathedrale' || !priest || p !== 'drive') return;
    priestOn = false; priestX = null; priestWalking = false; coinAsk = false;
    const [a, b] = priest.askAfter ?? [18, 40];
    const t = setTimeout(() => {
      if (sermonOn) return;
      priestOn = true; priestWalking = true;
      priestX = priest.enterFrom ?? 112;
      playPriest('marche', { fps: 8, loop: true });
      // double rAF : l'img est posée hors-champ AVANT que la transition CSS parte
      requestAnimationFrame(() => requestAnimationFrame(() => { priestX = priest.x; }));
      priestWalkT = setTimeout(() => {
        priestWalking = false; priestX = null;
        playPriest('demande', { fps: 5, loop: true });
        coinAsk = true;
        playSfx('/media/nightdrive/sons/pretre_demande.wav');
      }, priest.walkMs ?? 5200);
    }, (a + Math.random() * (b - a)) * 1000);
    return () => {
      clearTimeout(t); clearTimeout(priestWalkT); clearInterval(priestSeq); clearTimeout(priestHold);
      clearTimeout(sermonTimer); stopSermonAudio();
      priestPose = 'idle'; priestFrame = 0; priestOn = false; priestX = null; priestWalking = false;
      coinAsk = false; sermonOn = false;
    };
  });

  function giveCoin(yes) {
    coinAsk = false;
    priestMood = yes ? 'joyeux' : 'vener';
    playSfx(`/media/nightdrive/sons/${yes ? 'piece' : 'refus'}.wav`);
    // OUI → la pièce tombe : BÉNÉDICTION (main lumineuse), puis sermon joyeux — il reste.
    // NON → il encaisse (gueulante → main levée) puis SE DISSOUT (fumée violette).
    //       Sa pique sonore part avec la gueulante ; sa rancune ne ressort qu'au
    //       pupitre (sermon vénère), même sans lui : sa voix hante le lieu.
    if (yes) {
      playPriest('don', { endHold: 2200 });
      setTimeout(() => playSermon('joyeux'), 900);
    } else {
      playPriest('refus', { fps: 3, then: () => {
        playPriest('disparition', { fps: 4, then: () => { priestOn = false; priestPose = 'idle'; priestFrame = 0; } });
      } });
      setTimeout(() => { if (priestMood === 'vener' && sceneTop === 'cathedrale' && !room && !univers) playGrogne(); }, 300); // sa pique, une fois, avec la gueulante
    }
  }
  // le sermon est un VRAI enregistrement (long) : tente .wav puis .mp3, la pose et
  // les halos tiennent jusqu'à la fin du son ; aucun fichier → halo 6 s, silence (050).
  let sermonAudio = null;
  function stopSermonAudio() { if (sermonAudio) { try { sermonAudio.pause(); } catch (e) {} sermonAudio = null; } }
  function playSermon(forceMood = null) {
    const mood = forceMood ?? priestMood ?? 'joyeux';   // pièce : selon la réponse · pupitre : toujours joyeux
    clearInterval(priestSeq); clearTimeout(priestHold); priestFrame = 0;
    priestPose = `sermon_${mood}`;
    sermonOn = true;
    clearTimeout(sermonTimer); stopSermonAudio();
    const done = () => { sermonOn = false; priestPose = 'idle'; sermonAudio = null; };
    const vol = mood === 'vener' ? 0.5 : 0.9; // le refus gueule déjà tout seul — on le tient en laisse
    const tryPlay = (ext, fallback) => { const a = new Audio(`/media/nightdrive/sons/sermon_${mood}.${ext}`); a.volume = vol;
      a.onended = done; a.onerror = fallback; sermonAudio = a; a.play().catch(() => {}); };
    tryPlay('wav', () => tryPlay('mp3', () => { sermonAudio = null; sermonTimer = setTimeout(done, 6000); }));
  }
  // LA PIQUE DU PRÊTRE : il râle UNE SEULE FOIS, au moment du refus de la pièce —
  // jamais à l'entrée dans le hall, jamais en boucle. Revenir dans la cathédrale ne
  // relance rien : seule l'ambiance de l'église accueille. Sa rancune ne survit
  // qu'au pupitre (sermon vénère). Fichier : sons/pretre_vener.wav|mp3 (silence si absent).
  let granAudio = null;
  function stopGrogne() { if (granAudio) { try { granAudio.pause(); } catch (e) {} granAudio = null; } }
  function playGrogne() {
    stopGrogne();
    let a = new Audio('/media/nightdrive/sons/pretre_vener.wav'); a.volume = 0.4;
    a.onerror = () => { if (granAudio !== a) return; const b = new Audio('/media/nightdrive/sons/pretre_vener.mp3'); b.volume = 0.4; b.onerror = () => {}; granAudio = b; b.play().catch(() => {}); };
    granAudio = a; a.play().catch(() => {});
  }

  // RÈGLE CINÉMA (Vincent 2026-07-09) : un son appartient à son espace. Le sermon
  // retient son espace NATAL (hall si pièce donnée, salle du prêche si pupitre) ;
  // dès qu'on n'y est plus — autre salle, retour au hall, autre scène, univers —
  // il se tait net, et l'ambiance de la cathédrale (jamais coupée, juste duckée
  // pendant qu'il parle) reprend toute sa place.
  let sermonLoc = null, grognePrevLoc = null;
  $effect(() => {
    const loc = `${sceneTop}·${room ?? ''}·${univers ?? ''}`;
    if (sermonOn) {
      if (sermonLoc == null) sermonLoc = loc; // première observation = son espace natal
      else if (loc !== sermonLoc) {
        stopSermonAudio(); clearTimeout(sermonTimer); sermonOn = false; priestPose = 'idle'; sermonLoc = null;
      }
    } else sermonLoc = null;
    // la pique aussi est spatiale : tout changement d'espace la coupe net
    if (grognePrevLoc != null && loc !== grognePrevLoc) stopGrogne();
    grognePrevLoc = loc;
  });
  const hideImg = (e) => { e.currentTarget.style.visibility = 'hidden'; };

  // la boombox joue → les persos qui ont une pose 'radio' DANSENT (boucle de frames
  // continue, ~7 fps). Ils ne s'y mettent que depuis le repos : jamais pendant qu'ils
  // roulent/fument/lévitent (les états tenus restent sacrés). Stop musique = retour idle.
  $effect(() => {
    const playing = !!k7Cur || player.playing;
    for (const per of (SCENES[sceneTop]?.personnages ?? [])) {
      if (!per.poses?.radio) continue;
      const cur = personaPose[per.id];
      if (playing && cur == null && !floatState[per.id] && !smoking[per.id]) {
        startLoop(per.id, 'radio', 140);
      } else if (!playing && cur === 'radio') {
        clearPose(per.id);
        setPose(per.id, undefined); setFrame(per.id, 0);
      }
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
    // le prêtre aussi (marche 16 frames : à la volée, l'entrée « sauterait »)
    const P = SCENES[sceneTop]?.priest;
    if (P?.poses) for (const v of Object.values(P.poses)) {
      for (const u of Array.isArray(v) ? v : [v]) { const im = new Image(); im.src = u; }
    }
  });

  // [COLLAGE] états d'objets peints : map "scène:overlayId" -> état courant.
  // Le calque affiché vient de scenes.js (overlays[].states). off = aucun calque.
  let overlayState = $state({});
  function overlaySrc(sceneId, ov) {
    return ov.states[overlayState[`${sceneId}:${ov.id}`] ?? ov.initial];
  }
  function toggleOverlay(sceneId, ov) {
    const keys = Object.keys(ov.states);
    const key = `${sceneId}:${ov.id}`;
    const cur = overlayState[key] ?? ov.initial;
    overlayState = { ...overlayState, [key]: keys[(keys.indexOf(cur) + 1) % keys.length] };
  }

  // ============ LE JEU D'HABILLAGE DU VESTIAIRE (laride_vestiaire_habillage.md) ============
  // Dress-up type Sims du raver alien : pile de calques PNG empilés dans la
  // persoZone (option A CSS §4.1), pivot pieds, idle doux. On compose une tenue,
  // elle se sauve légère (indices de slots, 1 clé localStorage §5). JOUABLE EN
  // PLACEHOLDER : tant qu'un PNG manque, un aplat coloré étiqueté tient la place
  // au même emplacement de calque — déposer le PNG le remplace sans changer de code.
  let outfit = $state(loadOutfit());      // { bas, pieds, haut, coiffe } → clés de variantes
  let duSwap = $state(0);                 // compteur → force le crossfade du calque au swap
  let duReady = $state({});               // fichier PNG présent ? (sinon placeholder)
  let duToast = $state(null);             // { slot, label } affiché brièvement au changement
  let duToastN = 0;                       // jeton anti-course pour masquer le toast
  // BANDES DU CORPS (fractions de la hauteur de la persoZone, haut→bas) : chaque cycler
  // se pose sur la zone du corps concernée — coiffe→tête, haut→torse, bas→jambes, pieds→pieds.
  const duBand = {
    coiffe: [0.00, 0.20],
    haut:   [0.20, 0.50],
    bas:    [0.50, 0.80],
    pieds:  [0.80, 1.00],
  };
  // précharge / sonde d'existence des PNG (base + variantes) : présent → vrai calque,
  // absent → placeholder. Ne casse rien, se met à jour tout seul si Vincent dépose.
  onMount(() => {
    for (const src of DU_FILES) {
      const im = new Image();
      im.onload = () => { duReady = { ...duReady, [src]: true }; };
      im.src = src;
    }
  });
  // La liste ORDONNÉE des choix d'un slot (inclut 'rien' en tête si optionnel §1.1).
  // → le cycler défile dessus, scalable à n'importe quel nombre de variantes (§7.5).
  function duChoices(slot) {
    const keys = slot.variants.map((v) => v.key);
    return slot.optional ? [null, ...keys] : keys;
  }
  // affiche le nom de la pièce brièvement (petit toast, §1.2)
  function duFlash(slotKey, variantKey) {
    const slot = DU_SLOTS.find((s) => s.key === slotKey);
    const label = variantKey ? (variantOf(slotKey, variantKey)?.label ?? '') : 'rien';
    const n = ++duToastN;
    duToast = { slot: slotKey, label };
    setTimeout(() => { if (duToastN === n) duToast = null; }, 1200);
  }
  // CYCLER : slot suivant/précédent (dir = +1 / -1). Boucle circulaire (§7.5).
  // Sert aux chevrons ◀▶, au clic/swipe sur la zone du corps.
  function duCycle(slotKey, dir) {
    if (p !== 'drive') return;
    const slot = DU_SLOTS.find((s) => s.key === slotKey);
    if (!slot) return;
    const choices = duChoices(slot);
    const cur = choices.indexOf(outfit[slotKey] ?? null);
    const next = choices[((cur < 0 ? 0 : cur) + dir + choices.length) % choices.length];
    outfit = { ...outfit, [slotKey]: next };
    duSwap++;
    duFlash(slotKey, next);
    saveOutfit(outfit);
    zoneSfx('laride', 'vestiaire_swap'); // silence si absent (050)
  }
  // SWIPE sur une zone du corps : swipe horizontal → cycle ; tap → suivant (§1.2)
  let duTouch = null; // { slot, x, y }
  function duTouchStart(slotKey, e) {
    const t = e.changedTouches ? e.changedTouches[0] : e;
    duTouch = { slot: slotKey, x: t.clientX, y: t.clientY };
  }
  function duTouchEnd(slotKey, e) {
    if (!duTouch || duTouch.slot !== slotKey) { duTouch = null; return; }
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - duTouch.x, dy = t.clientY - duTouch.y;
    duTouch = null;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) duCycle(slotKey, dx < 0 ? 1 : -1);
    else duCycle(slotKey, 1); // simple tap = variante suivante
  }
  function duRandom() {
    if (p !== 'drive') return;
    outfit = randomOutfit();
    duSwap++;
    saveOutfit(outfit);
    zoneSfx('laride', 'vestiaire_swap');
  }
  function duReset() {
    if (p !== 'drive') return;
    outfit = defaultOutfit();
    duSwap++;
    saveOutfit(outfit);
    zoneSfx('laride', 'vestiaire_reset');
  }

  // une zone, ses destins : sortie → goto (si les images sont là) → open → lueur
  function zoneClick(z) {
    if (p !== 'drive') return;
    // [COLLAGE] un objet à états lié à cette zone → on bascule son calque peint
    const ov = (SCENES[sceneTop]?.overlays ?? []).find((o) => o.zone === z.id);
    if (ov) toggleOverlay(sceneTop, ov);
    // [PRÊTRE] le pupitre → sermon selon l'humeur mémorisée (le halo suit)
    if (sceneTop === 'cathedrale' && priest && z.id === priest.sermonZone) playSermon(); // le pupitre parle selon SON humeur : joyeux par défaut, vénère tant que la pièce lui a été refusée
    if (z.exit) { popScene(); return; }
    // le VESTIAIRE de LA RIDE (gigogne D15) : son franc d'entrée en plus du
    // `porte_vestiaire` générique du passage (silence si absent, 050).
    if (sceneTop === 'laride' && z.id === 'vestiaire') zoneSfx('laride', 'vestiaire');
    if (z.goto && sceneReady[z.goto]) { pushScene(z); return; }
    if (z.open?.type === 'arcade') { arcadeOpen = true; return; }
    if (z.open?.type === 'mantra') { sayMantra(); if (sceneTop === 'pmu') rsHit('zone_pmu_terminal', { pan: rsPan(z) }); else zoneSfx('pmu', 'terminal'); return; } // [DEMO PMU reactsound]
    if (z.open?.type === 'cocktails') { cocktail = COCKTAILS[0]; carteOpen = true; return; }
    if (z.open?.type === 'dj') { djOpen = true; return; }
    if (z.open?.type === 'carnet') { carnet = z.open.id; return; }
    if (z.open?.type === 'nokia') { phoneVue = 'accueil'; phoneOpen = true; zoneSfx('taverne', 'phone'); return; }
    if (z.open?.type === 'ciel') { cielOpen = true; return; }
    if (z.open?.type === 'k7') { k7OpenBox(); return; }
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
      ? (stack[1]?.id === 'barque'
          // le zoom vers la barque : le seul gardé (plongée dans la porte)
          ? `transform-origin:${stack[0].ox ?? 50}% ${stack[0].oy ?? 50}%; transition: transform 1200ms ease-out; transform: scale(2.3);`
          // toute autre destination : PAS de zoom (la scène apparaît en fondu, sans plongée)
          : `transform: none;`)
      // habitacle au repos : léger parallaxe du regard, AUCUN zoom au survol
      : `transform-origin:${hoverOx}% ${hoverOy}%; transition: transform 1200ms ease-out; transform: translate(${(-lookX * 9).toFixed(1)}px, ${(-lookY * 4).toFixed(1)}px);`
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

    <!-- INDICATEUR D'ÉTAT retiré à la demande de Vincent (2026-07-09) — l'état
         (etatKey/ETAT_HEADS) vit toujours, utilisé par le verre du bar. -->

    <!-- PORTRAIT MYRTILLE + JAUGE DE MAINTIEN : même cadre que Stick (l'indicateur d'état
         à gauche EST Stick), posé juste à côté. Photo illuminée + jauge pleine quand elle
         tient un état spécial (lotus = violet · Shiva = or). -->
    {#if p === 'drive' && sceneTop === 'barque'}
      <div class="lev-cell" class:on={!!floatState.myrtille}>
        <div class="lev-frame lvl{floatState.myrtille ?? 0}">
          {#key floatState.myrtille ?? 0}
            <img src="/media/nightdrive/scenes/perso/myrtille_face_{floatState.myrtille ?? 0}.webp" alt="Myrtille" draggable="false" transition:fade={{ duration: 320 }} />
          {/key}
        </div>
        <div class="statejauge lvl{floatState.myrtille ?? 2}" class:low={!!floatState.myrtille && (gauge.myrtille ?? 0) < 0.3} class:idle={!floatState.myrtille}>
          <i style="width:{Math.max(0, (gauge.myrtille ?? 0)) * 100}%"></i>
        </div>
        <span class="lev-lbl">{floatState.myrtille === 6 ? 'énergie' : floatState.myrtille === 4 ? 'déesse' : floatState.myrtille === 2 ? 'défoncée' : 'sobre'}</span>
      </div>
    {/if}

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
            <button disabled={!canPrev} onclick={() => arStep(-1)} title="son précédent">⏮</button>
            <button disabled={!engaged} onclick={toggle} title={player.playing ? 'pause' : 'lecture'}>{player.playing ? '⏸' : '▶'}</button>
            <button disabled={!canNext} onclick={() => arStep(1)} title="son suivant">⏭</button>
            <button disabled={!engaged} onclick={arEject} title="rendre l'antenne">⏏</button>
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
          <div
            class="sc"
            transition:arrive
          >
            <img class="pc-off" src={sc.off} alt="" draggable="false" />
            {#if sc.breath !== false}
              <img class="pc-breath" src={sc.on} alt="" draggable="false" />
            {/if}
            <!-- [COLLAGE] calques d'état des objets (peints, transparents, plein cadre) :
                 au-dessus du fond, sous les perso. off = aucun calque. -->
            {#if sc.overlays}
              {#each sc.overlays as ov (ov.id)}
                {#if overlaySrc(s.id, ov)}
                  <img class="overlay-layer" class:overlay-pos={ov.x != null} src={overlaySrc(s.id, ov)} alt="" draggable="false"
                       style={ov.x != null ? `left:${ov.x}%; top:${ov.y}%; width:${ov.w}%; height:${ov.h}%;` : ''}
                       transition:fade={{ duration: 260 }} />
                {/if}
              {/each}
            {/if}
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
                <div class="perso perso-{perso.anim}" class:solo={!!(perso.src || perso.poses)} class:smokeable={smoking[perso.id]} class:perso-float2={floatOn(perso) === 2} class:perso-float4={floatOn(perso) === 4} class:perso-float6={floatOn(perso) === 6} role="button" tabindex="-1" onclick={() => personaClick(perso)} style="left:{perso.x}%; top:{perso.y}%; width:{perso.w}%; height:{perso.h}%;">
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
            <!-- ÉVÉNEMENT PLEIN ÉCRAN (montée en Shiva) : flash violet + onde de choc radiale. -->
            {#if ascension}
              <div class="ascension" class:lvl6={ascLevel >= 6}>
                <div class="asc-flash"></div>
                <div class="asc-ring"></div>
                {#if ascLevel >= 6}<div class="asc-ring r2"></div>{/if}
              </div>
            {/if}
            <!-- ============ LE JEU D'HABILLAGE (le vestiaire, gigogne D15) ============
                 pile de calques PNG empilés dans la persoZone (option A §4.1),
                 pivot pieds, idle doux ; à côté, l'UI (onglets + rail de vignettes
                 + SURPRENDS-MOI + reset). Jouable EN PLACEHOLDER : PNG absent →
                 aplat coloré étiqueté au même emplacement de calque. -->
            {#if s.id === 'vestiaire' && sc.persoZone}
              {@const pz = sc.persoZone}
              <!-- LE PERSO PLEIN CADRE (pivot pieds §2.1), entièrement visible tête→pieds.
                   Chaque calque garde son ratio 2:3 (object-fit:contain), crossfade au swap. -->
              <div class="du-perso perso-lean" style="left:{pz.x}%; top:{pz.y}%; width:{pz.w}%; height:{pz.h}%;">
                <!-- z=0 : la base, toujours là -->
                {#if duReady[DU_BASE.src]}
                  <img class="du-layer" style="z-index:0;" src={DU_BASE.src} alt="" draggable="false" />
                {:else}
                  <div class="du-ph du-ph-base" style="z-index:0;"><span>{DU_BASE.label}</span></div>
                {/if}
                <!-- les 4 slots : chacun son calque (crossfade ~150ms via {#key}), 'rien' = vide -->
                {#each DU_SLOTS as slot (slot.key)}
                  {@const vk = outfit[slot.key]}
                  {#key vk}
                    {#if vk}
                      {@const src = variantSrc(slot.key, vk)}
                      {@const v = variantOf(slot.key, vk)}
                      {#if duReady[src]}
                        <img class="du-layer" style="z-index:{slot.z};" src={src} alt="" draggable="false" transition:fade={{ duration: 150 }} />
                      {:else}
                        <div class="du-ph du-ph-{slot.key}" style="z-index:{slot.z}; --phc:{v?.color};" transition:fade={{ duration: 150 }}><span>{v?.label}</span></div>
                      {/if}
                    {/if}
                  {/key}
                {/each}
              </div>

              <!-- LES CYCLERS PAR ZONE DU CORPS (§1.2) : posés SUR la persoZone, chacun
                   à hauteur de sa partie du corps. Bande cliquable/swipe au centre +
                   chevrons ◀▶ semi-transparents de part et d'autre. Généré depuis SLOTS
                   → scalable à n'importe quel nombre de variantes. -->
              {#each DU_SLOTS as slot (slot.key)}
                <div class="du-cycler du-cycler-{slot.key}"
                     style="left:{pz.x}%; width:{pz.w}%; top:{pz.y + pz.h * duBand[slot.key][0]}%; height:{pz.h * (duBand[slot.key][1] - duBand[slot.key][0])}%;">
                  <button class="du-chev du-chev-l" aria-label="{slot.label} précédent" onclick={() => duCycle(slot.key, -1)}>‹</button>
                  <!-- la zone du corps : tap = suivant, swipe = cycle -->
                  <button class="du-hit" aria-label="changer {slot.label}"
                          onclick={() => duCycle(slot.key, 1)}
                          ontouchstart={(e) => duTouchStart(slot.key, e)}
                          ontouchend={(e) => duTouchEnd(slot.key, e)}></button>
                  <button class="du-chev du-chev-r" aria-label="{slot.label} suivant" onclick={() => duCycle(slot.key, 1)}>›</button>
                  <!-- le nom de la pièce, brièvement -->
                  {#if duToast && duToast.slot === slot.key}
                    <span class="du-name" transition:fade={{ duration: 140 }}>{duToast.label}</span>
                  {/if}
                </div>
              {/each}

              <!-- COMMANDES COMPACTES (§1.3) : 🎲 surprends-moi + ↺ reset, discrets, en coin -->
              <div class="du-corner">
                <button class="du-mini du-surprise" onclick={duRandom} title="surprends-moi" aria-label="surprends-moi">🎲</button>
                <button class="du-mini du-reset" onclick={duReset} title="reset" aria-label="reset">↺</button>
              </div>
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
            <!-- [PRÊTRE] halos d'humeur (peints) pendant le sermon + le prêtre vivant.
                 Safe-absent : les images manquantes se cachent (onerror), la logique tourne. -->
            {#if s.id === 'cathedrale' && sc.priest}
              {#if sermonOn && priestMood}
                {#each (sc.priest.halos[priestMood] ?? []) as h (h)}
                  <img class="overlay-layer" src={h} alt="" draggable="false" onerror={hideImg} transition:fade={{ duration: 400 }} />
                {/each}
              {/if}
              {#if priestOn}
                {#key priestPose}
                  <img class="pretre" class:pretre-demande={priestPose === 'demande'}
                       src={priestSrc(sc.priest)}
                       style="left:{priestX ?? sc.priest.x}%; top:{sc.priest.y}%; width:{sc.priest.w}%; height:{sc.priest.h}%;
                              {priestWalking ? `transition: left ${sc.priest.walkMs ?? 5200}ms linear, transform 550ms cubic-bezier(.2,.7,.2,1);` : ''}"
                       alt="" draggable="false" onerror={hideImg} transition:fade={{ duration: 300 }} />
                {/key}
              {/if}
            {/if}
            <!-- LE SEUIL d'abord dans le DOM : les zones passent au-dessus -->
            <button class="exit" onclick={popScene} title="ressortir (Échap)">
              <span class="exit-lab">▾ ressortir</span>
            </button>
            {#each sc.zones as z (z.id)}
              <button
                class="lieu"
                class:fondu={!z.lum && !z.light && !z.soft}
                class:zlight={z.light}
                class:halo={!!z.aura}
                class:soft={z.soft}
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
                onpointerenter={() => { if (z.open?.type === 'k7') k7Passby(); zoomEnter(z); }}
                onpointerleave={zoomLeave}
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

        <!-- ============ UNE PIÈCE ? (le prêtre de la cathédrale, 4e mur) ============ -->
        {#if coinAsk}
          <!-- la fenêtre ne couvre JAMAIS le prêtre (Vincent It41) : carte poussée à droite -->
          <div class="roll-ask coin" role="dialog" aria-label="donner une pièce">
            <div class="roll-card">
              <span class="roll-q">Une petite pièce&nbsp;?</span>
              <span class="roll-sub">pour l'artiste…</span>
              <div class="roll-choices">
                <button onclick={() => giveCoin(true)}>Donner</button>
                <button onclick={() => giveCoin(false)}>Refuser</button>
              </div>
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
                  <button class="k7" class:onair onclick={() => k7Play(c)} onpointerenter={k7Passby} title={onair ? 'stop' : 'lecture'}>
                    <span class="k7-coque">
                      <span class="k7-label" style="background:{c.couleur}">{c.titre}</span>
                      <span class="k7-fen">
                        <i class="k7-reel" class:spin={onair}></i>
                        <i class="k7-reel r2" class:spin={onair}></i>
                      </span>
                    </span>
                    {#if c.note}<em class="k7-note">{c.note}</em>{/if}
                  </button>
                {/each}
              </div>
              <div class="k7-foot">CLIC = LECTURE · RE-CLIC = STOP · Échap pour refermer</div>
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
            <div class="nd-panel pmu-panel">
              <div class="nd-head">
                <span class="nd-title">PARIS — LA TÉLÉ DU PMU</span>
                <span class="nd-sub">— tiercé de nuit en direct —</span>
                <button class="nd-close" onclick={closeRoom} title="éteindre (Échap)">✕</button>
              </div>
              <PmuCourse />
              <div class="nd-foot">mise tes jetons sur un partant · Échap pour éteindre</div>
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

        <!-- ============ LES TOILETTES (lieu cadré + urinoir/lavabo interactifs) ============ -->
        {#if room === 'toilettes'}
          <div class="wc-room" role="dialog" aria-label="les toilettes de la ride">
            <div class="cine">
              <div class="cine-stage" style="background-image:url({WC_OFF})">
                <div class="hotwrap hw-urinal">
                  <button class="hot" style="background-image:url({WC_ON}); background-size:909% 455%; background-position:67.4% 51.3%;" onclick={() => openWcSub('pee')} aria-label="pisser"></button>
                  <span class="hot-cap">pisser</span>
                </div>
                <div class="hotwrap hw-sink">
                  <button class="hot" style="background-image:url({WC_ON}); background-size:571% 400%; background-position:87.9% 72%;" onclick={() => openWcSub('drink')} aria-label="boire"></button>
                  <span class="hot-cap">boire</span>
                </div>
                <div class="hotwrap hw-door">
                  <button class="hot" style="background-image:url({WC_ON}); background-size:833% 250%; background-position:45.45% 40%;" onclick={closeRoom} aria-label="sortir"></button>
                  <span class="hot-cap">sortir</span>
                </div>
                <div class="wc-door" aria-hidden="true"></div>
                <div class="wc-scan" aria-hidden="true"></div>
              </div>
            </div>
            <span class="wc-hint">clique l'urinoir ou le lavabo · Échap pour ressortir</span>

            {#if wcSub === 'pee'}
              <div class="sub-panel" role="dialog" aria-label="viser la mouche">
                <div class="sub-box">
                  <span class="sub-title">VISE LA MOUCHE — maintiens et dirige le jet</span>
                  <canvas class="pee-cvs" width="480" height="360" bind:this={peeCvs}
                    onpointerdown={peeDown} onpointermove={peeMove} onpointerup={peeUp} onpointerleave={peeUp}></canvas>
                  <div class="sub-hud">
                    <span>vessie <b style="--w:{peeBladder}%; --c:#ffd76a"></b></span>
                    <span>mouches {peeScore}/5</span>
                  </div>
                  {#if peeDone}<div class="sub-verdict">{peeDone}</div>{/if}
                  <div class="sub-actions">
                    {#if peeDone}<button class="sub-again" onclick={peeInit}>recommencer</button>{/if}
                    <button class="sub-close" onclick={closeWcSub}>✕ sortir</button>
                  </div>
                </div>
              </div>
            {/if}

            {#if wcSub === 'drink'}
              <div class="sub-panel" role="dialog" aria-label="boire de l'eau">
                <div class="sub-box drink-box">
                  <span class="sub-title">LE LAVABO — bois pour reprendre tes esprits</span>
                  <div class="drink-perso" style="--wob:{Math.min(1, (etat.ivresse + etat.defonce) / 120)}">
                    <img src={ETAT_HEADS[etatKey]} onerror={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/media/nightdrive/perso/dressup/base_h.webp?v=2'; }} alt="" class="drink-img" draggable="false" />
                  </div>
                  <div class="sub-hud col">
                    <span>ivresse <b style="--w:{etat.ivresse}%; --c:#ff3a5e"></b></span>
                    <span>défonce <b style="--w:{etat.defonce}%; --c:#4ad0a0"></b></span>
                  </div>
                  {#if etat.ivresse <= 0 && etat.defonce <= 0}
                    <div class="sub-verdict">t'as repris tes esprits. la nuit peut continuer.</div>
                  {:else}
                    <button class="drink-btn" onpointerdown={drinkStart} onpointerup={drinkStop} onpointerleave={drinkStop}>maintenir pour boire</button>
                  {/if}
                  <button class="sub-close" onclick={closeWcSub}>✕ sortir</button>
                </div>
              </div>
            {/if}
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
          <button disabled={!canPrev} onclick={() => arStep(-1)} title="son précédent">⏮</button>
          <button disabled={!engaged} onclick={toggle} title={player.playing ? 'pause' : 'lecture'}>{player.playing ? '⏸' : '▶'}</button>
          <button disabled={!canNext} onclick={() => arStep(1)} title="son suivant">⏭</button>
          <button disabled={!engaged} onclick={arEject} title="rendre l'antenne">⏏</button>
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
              <button disabled={!canPrev} onclick={() => arStep(-1)} title="son précédent">⏮</button>
              <button class="play" disabled={!engaged} onclick={toggle} title={player.playing ? 'pause' : 'lecture'}>
                {player.playing ? '⏸' : '▶'}
              </button>
              <button disabled={!canNext} onclick={() => arStep(1)} title="son suivant">⏭</button>
              <button class="ej" disabled={!engaged} onclick={arEject} title="rendre l'antenne">⏏</button>
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
    /* toujours un contexte d'empilement : sans ça, quand une scène est ouverte avec
       `transform:none`, les éléments lumineux de l'habitacle (z-index) passaient
       AU-DESSUS de la scène (transparence du tableau de bord vue dans l'église, It38) */
    isolation: isolate;
    transition: transform 1150ms cubic-bezier(0.32, 0.04, 0.14, 1);
  }
  .pc-off, .pc-breath {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    user-select: none;
  }
  /* [COLLAGE] calque d'état d'objet : peint, transparent, plein cadre, au-dessus
     du fond et sous les perso. Aucune lumière CSS — c'est l'image qui porte l'état. */
  .overlay-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    user-select: none;
    object-fit: contain;
  }
  /* calque positionné (juste l'objet peint, placé en %) plutôt que plein cadre */
  .overlay-layer.overlay-pos { inset: auto; }
  /* [PRÊTRE] perso positionné, sous les zones ; « demande » = il avance vers l'écran */
  .pretre {
    position: absolute;
    pointer-events: none;
    user-select: none;
    object-fit: contain;
    object-position: bottom center;
    transform-origin: bottom center;
    transition: transform 550ms cubic-bezier(.2,.7,.2,1), filter 550ms;
  }
  .pretre-demande { transform: scale(1.18) translateY(3%); filter: drop-shadow(0 6px 18px #000a); }
  @media (prefers-reduced-motion: reduce) { .pretre { transition: none; } }
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
  /* zones DOUCES (objets ronds/petits : pizza, sachet) : le survol n'affiche pas un
     bloc → masque radial centré + blend screen (les bords sombres du crop
     disparaissent, seul le cœur de l'objet s'allume). */
  .lieu.soft {
    mix-blend-mode: screen;
    -webkit-mask-image: radial-gradient(58% 58% at 50% 50%, #000 26%, rgba(0,0,0,0.4) 58%, transparent 80%);
            mask-image: radial-gradient(58% 58% at 50% 50%, #000 26%, rgba(0,0,0,0.4) 58%, transparent 80%);
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
  .pmu-panel { width: min(1120px, 96vw) !important; }
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
    background: #000;                    /* cadre noir cinéma : l'image n'est pas étirée */
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; animation: arc-in 420ms ease;
  }
  .wc-frame {
    position: relative; width: min(880px, 92vw); aspect-ratio: 3 / 2;
    overflow: hidden;
    border: 2px solid rgba(74,208,160,0.18);
    box-shadow: 0 0 0 6px rgba(0,0,0,0.5), 0 10px 40px rgba(0,0,0,0.6);
    background: #05070a;
  }
  .wc-bg {
    position: absolute; inset: 0; width: 100%; height: 100%;
    object-fit: cover; user-select: none; -webkit-user-drag: none;
  }
  .wc-switch {
    position: absolute; top: 8px; right: 10px; z-index: 3;
    width: 26px; height: 26px; border-radius: 3px; cursor: pointer;
    background: rgba(12,18,15,0.72); border: 1px solid rgba(180,108,255,0.45);
    color: #ffd76a; font-size: 14px; line-height: 1;
  }
  .wc-switch:hover { background: rgba(180,108,255,0.22); }
  .wc-cvs {
    position: absolute; inset: 0; z-index: 2;
    display: block; width: 100%; height: 100%; cursor: crosshair;
    image-rendering: pixelated; touch-action: none;
    background: transparent; /* le mur (image) est dessous ; le canvas ne porte que les tags */
  }
  .wc-scan {
    position: absolute; inset: 0; pointer-events: none;
    background: repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 2px, transparent 2px 4px);
    mix-blend-mode: multiply; opacity: 0.5;
  }
  .wc-bombe {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center;
    padding: 6px 12px; border: 1px solid rgba(180,108,255,0.28);
    background: rgba(12,18,15,0.6); border-radius: 3px;
  }
  .wc-bombe-lbl { color: rgba(180,108,255,0.7); font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase; }
  .wc-cols { display: flex; gap: 6px; }
  .wc-col {
    width: 22px; height: 22px; border-radius: 50%; cursor: pointer; padding: 0;
    background: var(--c); border: 2px solid rgba(0,0,0,0.5);
    box-shadow: 0 0 6px var(--c); transition: transform 120ms;
  }
  .wc-col.on { transform: scale(1.25); border-color: #fff; }
  .wc-tailles { display: flex; gap: 5px; align-items: center; }
  .wc-tsz {
    width: 24px; height: 24px; display: grid; place-items: center; cursor: pointer;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.14); border-radius: 3px;
  }
  .wc-tsz.on { border-color: #fff; background: rgba(255,255,255,0.14); }
  .wc-tsz span { width: var(--d); height: var(--d); border-radius: 50%; background: rgba(255,255,255,0.75); display: block; }
  .wc-eff {
    color: rgba(255,58,94,0.85); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase;
    background: none; border: 1px solid rgba(255,58,94,0.4); border-radius: 3px; padding: 4px 8px; cursor: pointer;
  }
  .wc-eff:hover { background: rgba(255,58,94,0.12); }
  .wc-hint { color: rgba(180,210,205,0.45); font-size: 9px; letter-spacing: 0.2em; }

  /* ---- lieu cadré cinéma (cadre noir, image non étirée) ---- */
  .cine {
    position: relative; aspect-ratio: 3 / 2;
    width: min(92vw, calc((100vh - 96px) * 1.5)); max-width: 1040px;
    box-shadow: 0 14px 60px rgba(0,0,0,0.7);
  }
  .cine-stage {
    position: absolute; inset: 0; overflow: hidden;
    background-size: cover; background-position: center;
    border: 1px solid rgba(0,0,0,0.9);
  }
  /* lumière du club par la porte — étroite, resserrée, pulse + couleurs, parfois rien */
  .wc-door {
    position: absolute; left: 43.5%; top: 26%; width: 7%; height: 34%;
    pointer-events: none; mix-blend-mode: screen; filter: blur(4px); opacity: 0.22;
    background: radial-gradient(42% 68% at 50% 46%, rgba(150,90,255,0.5), rgba(80,120,255,0.14) 52%, transparent 76%);
    animation: door-club 3.4s ease-in-out infinite;
  }
  @keyframes door-club {
    0%   { opacity: 0.1;  filter: blur(4px) hue-rotate(0deg); }
    12%  { opacity: 0.48; }
    22%  { opacity: 0.14; }
    34%  { opacity: 0.6;  filter: blur(5px) hue-rotate(30deg); }
    46%  { opacity: 0.05; }                 /* parfois rien */
    60%  { opacity: 0.42; filter: blur(4px) hue-rotate(-25deg); }
    72%  { opacity: 0.12; }
    84%  { opacity: 0.54; filter: blur(5px) hue-rotate(15deg); }
    100% { opacity: 0.1;  filter: blur(4px) hue-rotate(0deg); }
  }
  @media (prefers-reduced-motion: reduce) { .wc-neon, .wc-door, .drink-img { animation: none; } }
  /* survol = l'objet S'ALLUME, façon jeu : blend screen (les carreaux sombres
     du crop disparaissent → seule la partie lumineuse émerge) + masque radial en
     FONDU (aucun bord de bloc, ça suit l'objet). Comme l'habitacle. */
  .hotwrap { position: absolute; }
  .hot {
    position: absolute; inset: 0; border: 0; padding: 0; cursor: pointer;
    background-color: transparent; background-repeat: no-repeat;
    mix-blend-mode: screen;
    -webkit-mask-image: radial-gradient(68% 66% at 50% 50%, #000 38%, rgba(0,0,0,0.35) 62%, transparent 82%);
            mask-image: radial-gradient(68% 66% at 50% 50%, #000 38%, rgba(0,0,0,0.35) 62%, transparent 82%);
    filter: saturate(1.15) brightness(1.06);
    opacity: 0; transition: opacity 380ms ease;
  }
  .hotwrap:hover .hot, .hot:focus-visible { opacity: 1; outline: none; }
  /* le libellé murmure et respire (même délire que le seuil), taille selon la profondeur */
  .hot-cap {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
    font-size: var(--cap, 12px); letter-spacing: 0.28em; white-space: nowrap; pointer-events: none;
    color: rgba(226,232,255,0.5); text-shadow: 0 0 8px rgba(120,150,255,0.3);
    animation: cap-breath 3.4s ease-in-out infinite alternate;
    transition: color 320ms ease, text-shadow 320ms ease;
  }
  @keyframes cap-breath {
    from { opacity: 0.45; transform: translate(-50%,-50%) translateY(1px); }
    to   { opacity: 0.92; transform: translate(-50%,-50%) translateY(-2px); }
  }
  .hotwrap:hover .hot-cap { color: #eef2ff; text-shadow: 0 0 12px rgba(140,170,255,0.8); }
  .hot-lbl {
    position: absolute; left: 50%; top: -6px; transform: translate(-50%,-100%);
    background: rgba(8,10,14,0.85); color: #e7d9ff; font-size: 10px;
    letter-spacing: 0.16em; text-transform: uppercase; padding: 2px 8px;
    border-radius: 3px; white-space: nowrap; opacity: 0; transition: opacity 160ms;
  }
  .hot:hover .hot-lbl, .hot:focus-visible .hot-lbl { opacity: 1; }
  .hw-urinal { left: 60%; top: 40%; width: 11%; height: 22%; --cap: 12px; }
  .hw-sink   { left: 72.5%; top: 54%; width: 17.5%; height: 25%; --cap: 14px; }
  .hw-door   { left: 40%; top: 24%; width: 12%; height: 40%; --cap: 10px; }
  /* sous-jeux (panneaux cadrés, ne prennent pas tout l'écran) */
  .sub-panel {
    position: absolute; inset: 0; z-index: 9; display: flex;
    align-items: center; justify-content: center;
    background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); animation: arc-in 200ms ease;
  }
  .sub-box {
    position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px;
    padding: 14px 16px; max-width: 92vw;
    background: #0b0f14; border: 2px solid rgba(180,108,255,0.4); border-radius: 6px;
    box-shadow: 0 0 0 6px rgba(0,0,0,0.5), 0 16px 55px rgba(0,0,0,0.75);
  }
  .sub-title { color: #cdbff0; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; }
  .pee-cvs {
    width: min(480px, 84vw); aspect-ratio: 4 / 3; background: #0c1512;
    border-radius: 4px; image-rendering: pixelated; touch-action: none; cursor: crosshair;
  }
  .sub-hud { display: flex; gap: 18px; align-items: center; color: #cdbff0; font-size: 11px; letter-spacing: 0.06em; }
  .sub-hud.col { flex-direction: column; align-items: stretch; gap: 7px; width: min(340px, 78vw); }
  .sub-hud.col span { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .sub-hud b {
    display: inline-block; height: 8px; width: 120px; border-radius: 4px; vertical-align: middle;
    background: linear-gradient(90deg, var(--c,#ffd76a) var(--w,0%), rgba(255,255,255,0.12) var(--w,0%));
  }
  .sub-hud.col b { flex: 1; }
  .sub-verdict { color: #ffd76a; font-size: 12px; text-align: center; max-width: 380px; line-height: 1.45; }
  .sub-actions { display: flex; gap: 8px; }
  .sub-close, .sub-again {
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer;
    background: none; border-radius: 3px; padding: 5px 10px;
  }
  .sub-close { color: rgba(255,58,94,0.85); border: 1px solid rgba(255,58,94,0.4); }
  .sub-close:hover { background: rgba(255,58,94,0.12); }
  .sub-again { color: #bfeee0; border: 1px solid rgba(74,208,160,0.5); }
  .sub-again:hover { background: rgba(74,208,160,0.14); }
  /* lavabo : le perso titube ∝ (ivresse+défonce) */
  .drink-box { width: min(420px, 90vw); }
  .drink-perso { width: 150px; height: 200px; display: grid; place-items: end center; }
  .drink-img { max-width: 100%; max-height: 100%; object-fit: contain; transform-origin: 50% 100%; animation: wob 0.9s ease-in-out infinite alternate; }
  @keyframes wob {
    from { transform: rotate(calc(var(--wob,0) * -5deg)) translateX(calc(var(--wob,0) * -5px)); }
    to   { transform: rotate(calc(var(--wob,0) *  5deg)) translateX(calc(var(--wob,0) *  5px)); }
  }
  .drink-btn {
    background: rgba(74,208,160,0.14); border: 1px solid rgba(74,208,160,0.5); color: #bfeee0;
    padding: 9px 16px; border-radius: 4px; cursor: pointer; letter-spacing: 0.06em; user-select: none;
  }
  .drink-btn:active { background: rgba(74,208,160,0.32); }

  /* (indicateur d'état retiré 2026-07-09 — demande Vincent) */
  /* PORTRAIT MYRTILLE + JAUGE (barque seulement) : prend la place de l'ancien indicateur. */
  .lev-cell {
    position: absolute; top: 14px; left: 14px; z-index: 40; width: 58px;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    pointer-events: none; user-select: none;
  }
  .lev-frame {
    position: relative; width: 58px; height: 66px; overflow: hidden; border-radius: 3px;
    background: #0a0c16; border: 2px solid rgba(120,140,220,0.4);
    box-shadow: inset -1px -1px #000, inset 1px 1px rgba(90,90,120,0.6), 0 4px 14px rgba(0,0,0,0.6);
    transition: filter .35s ease, box-shadow .35s ease, border-color .35s ease;
  }
  .lev-frame img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 10%; }
  .lev-lbl {
    font-size: 8px; letter-spacing: 0.22em; text-transform: uppercase;
    color: rgba(226,232,255,0.55); text-shadow: 0 0 6px rgba(120,150,255,0.3);
  }
  /* ILLUMINÉE quand la jauge est active (lotus = violet, Shiva = or) */
  .lev-cell.on .lev-frame { filter: saturate(1.1) brightness(1.08); }
  .lev-cell.on .lev-frame.lvl2 {
    border-color: color-mix(in srgb, var(--v2000-violet-rave) 85%, #fff);
    box-shadow: inset -1px -1px #000, 0 0 12px var(--v2000-violet-rave), 0 0 22px color-mix(in srgb, var(--v2000-violet-rave) 55%, transparent);
    animation: lev-lueur 2.2s ease-in-out infinite;
  }
  .lev-cell.on .lev-frame.lvl4 {
    border-color: color-mix(in srgb, var(--v2000-jaune-sodium) 88%, #fff);
    box-shadow: inset -1px -1px #000, 0 0 14px var(--v2000-jaune-sodium), 0 0 26px color-mix(in srgb, var(--v2000-jaune-sodium) 55%, transparent);
    animation: lev-lueur 1.8s ease-in-out infinite;
  }
  .lev-cell.on .lev-frame.lvl6 {
    border-color: #fff;
    box-shadow: inset -1px -1px #000, 0 0 16px #fff, 0 0 30px var(--v2000-violet-rave);
    animation: lev-lueur 1.3s ease-in-out infinite;
  }
  @keyframes lev-lueur { 0%,100% { filter: saturate(1.1) brightness(1.05); } 50% { filter: saturate(1.25) brightness(1.2); } }
  /* la jauge sous chaque portrait (override du positionnement absolu par défaut) */
  .lev-cell .statejauge { position: static; width: 100%; height: 7px; min-height: 7px; }
  .lev-cell .statejauge.idle { opacity: 0.32; }
  .lev-cell .statejauge.idle i { width: 0 !important; }

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
  /* ÉTATS FLOTTANTS TENUS (paliers Myrtille) : elle DÉCOLLE du pont et reste en l'air,
     bob doux. state2 = lotus qui lévite · state4 = déesse, monte plus haut. Ces classes
     sont posées APRÈS .perso-lean → quand les deux coexistent, la lévitation l'emporte. */
  /* FRANCO : dès qu'elle lévite elle GROSSIT nettement et MONTE haut (origine = ses fesses,
     donc elle grandit vers le haut sans décoller du centre), puis glisse lentement encore
     plus haut et redescend à peine → vol suspendu, imposant. state4 = déesse, plus gros/haut. */
  .perso-float2 { animation: perso-float2 7.2s ease-in-out infinite; transform-origin: 50% 100%; }
  @keyframes perso-float2 {
    0%, 100% { transform: translateY(-11%) scale(1.34); }
    50%      { transform: translateY(-17%) scale(1.37); }
  }
  /* Shiva : même lévitation que le lotus, en place (canvas 940 → scale ~1.41 = taille lotus).
     La grandeur vient des 6 bras + du halo, pas d'un agrandissement. Reste dans le cadre. */
  .perso-float4 { animation: perso-float4 8.4s ease-in-out infinite; transform-origin: 50% 100%; }
  @keyframes perso-float4 {
    0%, 100% { transform: translateY(-9%) scale(1.41); }
    50%      { transform: translateY(-14%) scale(1.43); }
  }
  /* Boule d'énergie : MÊME géométrie que le Shiva (origine bas, même taille) → aucun saut,
     aucun agrandissement. Elle devient l'orbe EN PLACE, seule la LUMIÈRE pulse. */
  .perso-float6 { animation: perso-float6 3.4s ease-in-out infinite; transform-origin: 50% 100%; }
  @keyframes perso-float6 {
    0%, 100% { transform: translateY(-9%) scale(1.41);  filter: brightness(1) saturate(1.05); }
    50%      { transform: translateY(-11%) scale(1.43); filter: brightness(1.2) saturate(1.25); }
  }
  @media (prefers-reduced-motion: reduce) {
    .perso-float2 { animation: none; transform: translateY(-14%) scale(1.34); }
    .perso-float4 { animation: none; transform: translateY(-11%) scale(1.41); }
    .perso-float6 { animation: none; transform: translateY(-11%) scale(1.44); }
  }
  .perso:hover { animation-play-state: paused; } /* au survol on fige l'idle, l'allumage prend le relais */
  /* JAUGE DE MAINTIEN D'ÉTAT : petite LCD rétro au-dessus du perso lévitant. */
  .statejauge {
    position: absolute; height: 1.1%; min-height: 6px; z-index: 6; pointer-events: none;
    border: 1px solid rgba(0,0,0,.6); border-radius: 3px; overflow: hidden;
    background: color-mix(in srgb, var(--v2000-noir-nuit) 78%, transparent);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.08), 0 1px 3px rgba(0,0,0,.55);
  }
  .statejauge i {
    display: block; height: 100%; transition: width .1s linear;
    background: linear-gradient(90deg, var(--v2000-violet-rave), color-mix(in srgb, var(--v2000-violet-rave) 55%, #fff));
  }
  .statejauge.lvl4 i { background: linear-gradient(90deg, var(--v2000-jaune-sodium), color-mix(in srgb, var(--v2000-jaune-sodium) 50%, #fff)); }
  .statejauge.lvl6 i { background: linear-gradient(90deg, var(--v2000-violet-rave), #fff); }
  .statejauge.low i  { background: linear-gradient(90deg, var(--v2000-rouge-nuit), color-mix(in srgb, var(--v2000-rouge-nuit) 55%, #fff)); }
  .statejauge.low    { animation: jauge-blink .6s steps(2) infinite; }
  @keyframes jauge-blink { 50% { opacity: .4; } }
  /* ÉVÉNEMENT PLEIN ÉCRAN — montée en Shiva : flash + onde de choc (centrés sur Myrtille). */
  .ascension { position: absolute; inset: 0; z-index: 20; pointer-events: none; overflow: hidden; }
  .asc-flash {
    position: absolute; inset: 0; mix-blend-mode: screen;
    background: radial-gradient(circle at 43% 44%, #fff 0%,
      color-mix(in srgb, var(--v2000-violet-rave) 82%, #fff) 16%,
      color-mix(in srgb, var(--v2000-violet-rave) 60%, transparent) 34%, transparent 62%);
    animation: asc-flash .95s ease-out forwards;
  }
  @keyframes asc-flash { 0% { opacity: 0; } 12% { opacity: 1; } 100% { opacity: 0; } }
  .asc-ring {
    position: absolute; left: 43%; top: 44%; width: 3%; aspect-ratio: 1; transform: translate(-50%, -50%);
    border-radius: 50%; border: 3px solid color-mix(in srgb, var(--v2000-violet-rave) 70%, #fff);
    box-shadow: 0 0 26px var(--v2000-violet-rave), inset 0 0 18px var(--v2000-violet-rave);
    animation: asc-ring .85s ease-out forwards;
  }
  @keyframes asc-ring {
    0%   { opacity: .95; width: 3%; }
    100% { opacity: 0; width: 150%; border-width: 1px; }
  }
  /* BOULE D'ÉNERGIE : flash plus violent (blanc), 2e onde, un peu plus long. */
  .ascension.lvl6 .asc-flash {
    background: radial-gradient(circle at 43% 44%, #fff 0%, #fff 22%,
      color-mix(in srgb, var(--v2000-violet-rave) 75%, #fff) 40%, transparent 72%);
    animation-duration: 1.25s;
  }
  .ascension.lvl6 .asc-ring { animation-duration: 1.1s; border-width: 4px; }
  .asc-ring.r2 { animation-delay: .18s; }
  @media (prefers-reduced-motion: reduce) { .asc-ring { display: none; } }

  /* ============ LE JEU D'HABILLAGE (vestiaire) ============ */
  /* le perso = pile de calques dans la persoZone, pivot pieds (comme .perso) */
  .du-perso {
    position: absolute;
    transform-origin: 50% 100%; /* pivot aux pieds (§2.1) */
    pointer-events: none;       /* le clic va aux vignettes / au seuil, pas au perso */
    will-change: transform;
    z-index: 2;
  }
  .du-layer, .du-ph {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .du-layer { object-fit: contain; object-position: bottom center; user-select: none; -webkit-user-drag: none; }
  /* PLACEHOLDER de calque : silhouette/aplat coloré étiqueté (PNG absent) —
     calé sur la même bande que le vrai calque le sera, pivot bas */
  .du-ph {
    display: flex; align-items: flex-end; justify-content: center;
    pointer-events: none;
  }
  .du-ph span {
    background: var(--phc, #6b4fa0);
    color: #fff; font-size: 9px; letter-spacing: 0.08em;
    padding: 2px 6px; border-radius: 3px;
    box-shadow: 0 0 8px rgba(0,0,0,0.4);
    opacity: 0.9; white-space: nowrap;
  }
  /* bandes verticales approximatives par slot (juste pour que les étiquettes
     placeholder s'étagent sans se superposer — le vrai PNG ignore tout ça) */
  .du-ph-base { align-items: center; }
  .du-ph-base span { background: #6b4fa0; font-size: 11px; letter-spacing: 0.14em; padding: 4px 10px; }
  .du-ph-pieds span { margin-bottom: 2%; }
  .du-ph-bas span   { margin-bottom: 26%; }
  .du-ph-haut span  { margin-bottom: 52%; }
  .du-ph-coiffe { align-items: flex-start; }
  .du-ph-coiffe span { margin-top: 2%; }

  /* ---- CYCLERS PAR ZONE DU CORPS (§1.2) : transparents, posés sur la persoZone,
     chacun à hauteur de sa partie du corps. Chevrons ◀▶ discrets qui s'éclairent
     au survol ; bande centrale cliquable/swipe. Cibles tactiles généreuses. ---- */
  .du-cycler {
    position: absolute;
    display: flex; align-items: center; justify-content: space-between;
    z-index: 6;
    pointer-events: none; /* seuls les enfants captent le clic → le reste passe au décor */
  }
  /* la zone du corps : cible tap/swipe pleine largeur, invisible (survol = léger halo) */
  .du-hit {
    position: absolute; inset: 0;
    background: transparent; border: 0; cursor: pointer;
    pointer-events: auto;
    -webkit-tap-highlight-color: transparent;
    touch-action: pan-y;
    transition: background 160ms ease;
  }
  .du-hit:hover { background: radial-gradient(ellipse at center, rgba(200,138,208,0.10), transparent 70%); }
  /* chevrons : semi-transparents, généreux au doigt, s'éclairent au survol */
  .du-chev {
    position: relative; z-index: 1;
    pointer-events: auto;
    width: 34px; height: 34px; min-width: 34px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(232,224,255,0.42);
    background: rgba(20,16,24,0.28);
    border: 1px solid rgba(200,138,208,0.22); border-radius: 50%;
    font-size: 22px; line-height: 1; font-weight: 700;
    cursor: pointer; transition: all 150ms ease;
    text-shadow: 0 0 6px rgba(0,0,0,0.5);
  }
  .du-chev-l { margin-left: -6px; }
  .du-chev-r { margin-right: -6px; }
  .du-cycler:hover .du-chev { color: rgba(232,224,255,0.72); border-color: rgba(200,138,208,0.4); }
  .du-chev:hover { color: #fff; background: rgba(200,138,208,0.28); border-color: #c88ad0; box-shadow: 0 0 12px rgba(200,138,208,0.45); }
  /* le nom de la pièce, brièvement (petit, au changement §1.2) */
  .du-name {
    position: absolute; left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none; z-index: 2;
    color: #fff; font-size: 10px; letter-spacing: 0.12em; white-space: nowrap;
    background: rgba(16,12,20,0.82); border: 1px solid rgba(200,138,208,0.5);
    border-radius: 3px; padding: 3px 8px;
    box-shadow: 0 0 12px rgba(200,138,208,0.3);
  }
  /* ---- COMMANDES COMPACTES (§1.3) : 🎲 + ↺, en coin, transparents ---- */
  .du-corner {
    position: absolute; top: 3%; right: 3%;
    display: flex; gap: 6px; z-index: 7;
  }
  .du-mini {
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(232,224,255,0.6);
    background: rgba(20,16,24,0.3);
    border: 1px solid rgba(200,138,208,0.25); border-radius: 50%;
    font-size: 15px; cursor: pointer; transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }
  .du-mini:hover { color: #fff; background: rgba(200,138,208,0.28); border-color: #c88ad0; box-shadow: 0 0 12px rgba(200,138,208,0.4); }
  @media (prefers-reduced-motion: reduce) { .du-perso { animation: none; } }

  /* ============ MINI-PROMPT « rouler un joint ? » (skin rétro) ============ */
  .roll-ask {
    position: absolute; inset: 0; z-index: 40;
    display: grid; place-items: center;
    background: radial-gradient(ellipse at center, transparent 30%, rgba(4,6,12,0.5) 100%);
    animation: roll-in 220ms ease;
  }
  @keyframes roll-in { from { opacity: 0; } to { opacity: 1; } }
  /* la demande du prêtre : carte décalée à droite pour ne pas couvrir son anim */
  .roll-ask.coin { place-items: center end; padding-right: 6%; background: none; }
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
    opacity: 1;
    background: radial-gradient(circle at 50% 46%, color-mix(in srgb, var(--v2000-jaune-sodium) 46%, transparent) 0%, transparent 62%) !important;
    mix-blend-mode: screen;
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
