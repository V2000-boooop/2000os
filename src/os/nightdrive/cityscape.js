// NIGHT DRIVE — la ville à travers le pare-brise.
// v2 : VUE PREMIÈRE PERSONNE. On est assis dans la voiture, elle roule, la
// route file vers l'horizon. Pseudo-3D d'arcade (OutRun / NFS 2D) : projection
// perspective simple, objets de bord de route qui grossissent en approchant —
// spectaculaire, rétro par nature, léger. Canvas 384×216 upscalé pixels nets.
// DA cible : docs/exploration/nightdrive/da_cible.md (planche Vincent) —
// PS2 max, Marseille by night, néons qui bavent, route humide, monde vivant.
//
// Ce fichier est reconstruit brique par brique. Posé dans ce pivot :
// route/perspective, launch au contact, voiture suivie, trafic en face,
// lampadaires, immeubles-volumes, palmiers, enseignes (HOTEL, AZUR, panneau
// A50, mur graffiti), Bonne Mère sur la colline, reflets mouillés, rétro
// vivant. Reviendront dans cet axe : port/bateau, train, tunnel, feu + file,
// coureur, ambulance, course, camion, voiture garée, arcade/garage/tabac.

export function createCity(canvas, mirrorCanvas) {
  const W = 384, H = 216;
  const MW = 48, MH = 14;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  let mctx = null;
  if (mirrorCanvas) { mirrorCanvas.width = MW; mirrorCanvas.height = MH; mctx = mirrorCanvas.getContext('2d'); }

  // ---------- projection ----------
  const HOR = 95;        // ligne d'horizon
  const CX = 192;        // fuite au centre
  const K = 300;         // constante de projection (px·unité)
  const ZNEAR = 2.3, ZFAR = 120;
  const ROAD_HW = 1.1;   // demi-largeur de la route (unités monde)
  const S = 16;          // vitesse de croisière (unités/s)

  const gy = (z) => HOR + K / z;         // y du sol à la distance z
  const sc = (z) => K / z;               // échelle à la distance z

  // ---------- palette (nuit méditerranéenne, sodium + néon) ----------
  const P = {
    sky0: '#04041a', sky1: '#0a0f33', sky2: '#1b1746', sky3: '#3a1e55',
    star: '#cfe0ff', ground: '#0a0c16', road: '#181a26', road2: '#151722',
    lane: '#8a8d76', curb: '#141724',
    sodium: '#ffb14e', head: '#fff3c9', tail: '#ff3b30',
    pink: '#ff5fd7', cyan: '#40e8ff', red: '#ff4a3d', green: '#3dff7c',
    purple: '#b06bff', amber: '#ffb24a', blue: '#3f8cff', gold: '#ffd98f',
    bld: ['#10142c', '#161b38', '#0c1024', '#121631'],
    body: ['#242a3d', '#3d2430', '#20303c', '#2c2c34', '#402d1e'],
  };

  const R = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const hash = (n) => { const x = Math.sin(n * 127.1) * 43758.545; return x - Math.floor(x); };

  function rect(x, y, w, h, c, a = 1) {
    if (a <= 0) return;
    ctx.globalAlpha = Math.min(1, a);
    ctx.fillStyle = c;
    ctx.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0));
    ctx.globalAlpha = 1;
  }

  // ---------- police bitmap 3×5, avec échelle entière (PS2 : jamais de flou) ----------
  const FONT = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110',
    E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
    I: '111010010010111', L: '100100100100111', M: '101111111101101', N: '110101101101101',
    O: '010101101101010', P: '110101110100100', R: '110101110101101', S: '011100010001110',
    T: '111010010010010', U: '101101101101111', V: '101101101101010', X: '101101010101101',
    Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '111001111100111',
    3: '111001011001111', 4: '101101111001001', 5: '111100110001110', 9: '111101111001111',
    '.': '000000000000010', ' ': '000000000000000',
  };
  function text(x, y, str, c, a = 1, glow = 0, f = 1) {
    let cx = x;
    for (const ch of str) {
      const g = FONT[ch];
      if (g) {
        for (let i = 0; i < 15; i++) {
          if (g[i] === '1') {
            const px = cx + (i % 3) * f, py = y + ((i / 3) | 0) * f;
            if (glow > 0) {
              rect(px - 2, py - 2, f + 4, f + 4, c, 0.022 * glow * a);
              rect(px - 1, py - 1, f + 2, f + 2, c, 0.06 * glow * a);
            }
            rect(px, py, f, f, c, a);
          }
        }
      }
      cx += 4 * f;
    }
    return cx - x;
  }

  // ---------- état ----------
  let running = false, raf = 0, last = 0, t = 0;
  let litT = 0, litTarget = 0, litSince = -10;
  let v = 0;             // accélérateur 0..1 : au contact, on part doucement
  let traveled = 0;      // distance parcourue (unités monde)

  function lightA(a = 1) {
    let f = 0.10 + 0.90 * litT;
    // l'alternateur : toutes les lumières respirent ensemble (≤ 5 %, jamais un clignotement)
    f *= 1 - litT * (0.03 * (0.5 + 0.5 * Math.sin(t * 4.65)) + 0.02 * (0.5 + 0.5 * Math.sin(t * 0.9)));
    if (litTarget === 1 && t - litSince < 0.7 && Math.random() < 0.22) f *= 0.25;
    return a * f;
  }

  // ---------- le monde : objets posés à des positions absolues sur la route ----------
  // d = distance absolue depuis le départ ; z = d - traveled. Les flux d'objets
  // avancent leurs marques : la ville ne se répète jamais, elle continue.
  const objs = [];
  let seedN = 1;
  const marks = { lamp: 3, palm: 9, bldL: 2, bldR: 5, sign: 26 };
  let lampSide = 1;
  // les lieux du boulevard — certains sont des portes (cliquables, réaction
  // visuelle seulement : les Destinations viendront plus tard)
  const signCycle = ['hotel', 'wall', 'garage', 'gantry', 'azur', 'arcade', 'billboard', 'pmu'];
  const signSide = { hotel: 1, wall: 1, garage: -1, azur: -1, arcade: 1, billboard: 1, pmu: -1, gantry: 1 };
  let signI = 0;

  function spawnStreams() {
    const horizonD = traveled + ZFAR;
    while (marks.lamp < horizonD) {
      objs.push({ type: 'lamp', d: marks.lamp, side: (lampSide = -lampSide), seed: seedN++ });
      marks.lamp += 7;
    }
    while (marks.palm < horizonD) {
      if (hash(seedN) < 0.75)
        objs.push({ type: 'palm', d: marks.palm, side: hash(seedN * 3) < 0.5 ? -1 : 1, seed: seedN++ });
      marks.palm += 11 + hash(seedN++) * 6;
    }
    while (marks.bldL < horizonD) {
      objs.push({ type: 'bld', d: marks.bldL, side: -1, seed: seedN++, w: 0.9 + hash(seedN) * 1.4, h: 0.45 + hash(seedN * 7) * 0.65, off: hash(seedN * 11) * 0.5 });
      marks.bldL += 4.5 + hash(seedN++) * 3;
    }
    while (marks.bldR < horizonD) {
      objs.push({ type: 'bld', d: marks.bldR, side: 1, seed: seedN++, w: 0.9 + hash(seedN) * 1.4, h: 0.45 + hash(seedN * 7) * 0.65, off: hash(seedN * 11) * 0.5 });
      marks.bldR += 4.5 + hash(seedN++) * 3;
    }
    while (marks.sign < horizonD) {
      const type = signCycle[signI++ % signCycle.length];
      objs.push({ type, d: marks.sign, side: signSide[type], seed: seedN++, pulse: 0 });
      // resserré (It7) : plusieurs lieux visibles en même temps, répartis
      // gauche/droite et près/loin — le regard est invité à voyager
      marks.sign += 20 + hash(seedN++) * 16;
    }
  }

  // ---------- les autres voitures ----------
  // La voiture qu'on suit : elle vit sa vie (freine, relance) — on ne la
  // rattrape jamais tout à fait. Le trafic d'en face : des phares qui
  // grossissent, nous éblouissent une demi-seconde, disparaissent.
  const lead = { z: 34, on: false, brake: false, color: '#2c2c34', ph: R(0, 9) };
  const oncoming = [];
  let onNext = R(2, 5);

  const actors = []; // ciel uniquement pour l'instant (avion)
  const events = [{ min: 40, max: 115, next: R(6, 30), fn: spawnPlane }];

  function spawnPlane() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    actors.push({
      x: dir > 0 ? -8 : W + 8, y: R(8, 30), dir, ph: R(0, 2),
      update(dt) { this.x += this.dir * 13 * dt; this.ph += dt; if (this.x > W + 12 || this.x < -12) this.dead = true; },
      draw() {
        rect(this.x, this.y, 3, 1, '#9aa2b8', 0.9);
        rect(this.dir > 0 ? this.x + 3 : this.x - 1, this.y, 1, 1, '#ffffff', 0.9);
        if (((this.ph * 2.2) | 0) % 2) rect(this.x + 1, this.y - 1, 1, 1, P.red, 0.95);
      },
    });
  }

  // ---------- zones cliquables : des portes, pas encore des Destinations ----------
  let hots = [];
  // la porte sous le regard (It9) : le lieu focusé répond — néon plus fort,
  // contour, chenillard qui s'emballe. Une seule porte à la fois.
  let focusKind = null;
  function hot(kind, o, x0, y0, x1, y1) {
    hots.push({ kind, o, x0, y0, x1, y1 });
  }
  function pulseFrame(o, x0, y0, x1, y1) {
    // la réaction au clic : le lieu s'embrase une seconde
    const p = o.pulse || 0;
    if (p <= 0.02) return;
    rect(x0 - 1, y0 - 1, x1 - x0 + 2, 1, '#ffffff', p * 0.5);
    rect(x0 - 1, y1, x1 - x0 + 2, 1, '#ffffff', p * 0.5);
    rect(x0 - 1, y0, 1, y1 - y0, '#ffffff', p * 0.5);
    rect(x1 + 1, y0, 1, y1 - y0, '#ffffff', p * 0.5);
  }

  // ---------- reflets : la route est mouillée, chaque lumière bave dedans ----------
  let refl = [];
  function emit(x, y, w, c, a, len = 14) { refl.push({ x, y, w, c, a, len }); }
  function drawRefl() {
    for (const r of refl) {
      for (let i = 2; i < r.len; i += 2) {
        const wob = ((i + ((t * 26) | 0)) % 4 < 2) ? 0 : 1; // le clapot du bitume
        rect(r.x + wob, r.y + i, r.w, 1, r.c, r.a * 0.45 * (1 - i / r.len) * (0.4 + 0.6 * litT));
      }
    }
    refl = [];
  }

  // ---------- horizon fixe : la Bonne Mère et la ville lointaine ----------
  const farCity = [];
  { let fx = 118;
    while (fx < W + 4) {
      const fw = 7 + ((Math.random() * 12) | 0);
      farCity.push({ x: fx, w: fw, h: 4 + ((Math.random() * 11) | 0), win: Math.random() < 0.6, ph: R(0, 6) });
      fx += fw + 1 + ((Math.random() * 3) | 0);
    }
  }

  function drawHorizon() {
    // la colline, et la Bonne Mère qui veille (dorée, comme sur la planche)
    for (let x = 8; x < 104; x += 2) {
      const hh = 14 * Math.sin(((x - 8) / 96) * Math.PI);
      rect(x, HOR - hh, 2, hh + 1, '#0a0d22');
    }
    for (let i = 0; i < 7; i++)
      rect(14 + hash(i * 3.7) * 80, HOR - 2 - hash(i * 9.1) * 9, 1, 1, P.gold, lightA(0.25 + 0.25 * hash(i * 5.3)));
    rect(51, HOR - 20, 3, 8, '#2a2438');                       // la tour
    rect(50, HOR - 13, 5, 2, '#231f30');                       // le socle
    rect(51, HOR - 20, 3, 3, P.gold, lightA(0.75));            // la vierge dorée
    rect(49, HOR - 22, 7, 7, P.gold, lightA(0.10));            // son halo
    rect(52, HOR - 21, 1, 1, '#ffe9c4', lightA(0.95));
    // le Vieux-Port en contrebas : des mâts endormis, des feux de quai
    for (let i = 0; i < 5; i++) {
      const mx = 16 + i * 17 + hash(i * 7.7) * 6;
      const mh = 3 + hash(i * 3.3) * 4;
      rect(mx, HOR - mh, 1, mh, '#1a2138');
      rect(mx, HOR - mh - 1, 1, 1, '#cfe0ff', lightA(0.3));
    }
    for (let i = 0; i < 6; i++) rect(10 + i * 15, HOR - 1, 2, 1, P.amber, lightA(0.22));
    // la ville lointaine, à droite
    for (const tw of farCity) {
      rect(tw.x, HOR - tw.h, tw.w, tw.h, '#0d1030');
      if (tw.win) rect(tw.x + 2, HOR - tw.h + 2, 1, 1, '#c9a96a', 0.18 + 0.10 * Math.abs(Math.sin(t * 0.5 + tw.ph)));
    }
  }

  // ---------- la route ----------
  function drawRoad() {
    for (let y = HOR + 1; y < H; y++) {
      const z = K / (y - HOR);
      const wz = z + traveled;
      const half = ROAD_HW * sc(z);
      const sw = 0.34 * sc(z); // trottoirs
      rect(0, y, W, 1, P.ground);
      rect(CX - half - sw, y, sw, 1, P.curb);
      rect(CX + half, y, sw, 1, P.curb);
      // bitume : deux tons qui alternent avec la distance parcourue (texture, jamais lisse)
      rect(CX - half, y, half * 2, 1, ((wz * 0.6) | 0) % 2 ? P.road : P.road2);
      // bords usés
      rect(CX - half, y, 1, 1, P.lane, 0.22);
      rect(CX + half - 1, y, 1, 1, P.lane, 0.22);
      // l'axe central : pointillés qui défilent vers nous
      if ((wz % 4) < 1.8) rect(CX - (z < 30 ? 1 : 0), y, z < 30 ? 2 : 1, 1, P.lane, 0.5);
    }
    // nos phares lèchent le bitume devant le capot
    for (let i = 0; i < 8; i++)
      rect(CX - 30 - i * 5, 140 + i * 2, 60 + i * 10, 2, P.head, 0.05 * litT * (1 - i / 9));
  }

  // ---------- objets de bord de route ----------
  function drawObj(o, z) {
    const s = sc(z);
    const y = gy(z);
    const fogA = z > 70 ? Math.max(0.25, (ZFAR - z) / (ZFAR - 70)) : 1;
    const f = z < 9 ? 2 : 1; // échelle des textes bitmap

    if (o.type === 'lamp') {
      const x = CX + o.side * 1.45 * s;
      const h = 0.62 * s;
      rect(x, y - h, Math.max(1, s * 0.014), h, '#141833');
      const ax = x + (o.side < 0 ? 0 : -0.16 * s);
      rect(Math.min(ax, x), y - h, 0.16 * s, Math.max(1, s * 0.012), '#141833');
      const lx = x - o.side * 0.15 * s;
      rect(lx, y - h + 1, Math.max(1, s * 0.02), Math.max(1, s * 0.02), P.sodium, lightA(fogA));
      rect(lx - 0.05 * s, y - h, 0.12 * s, 0.05 * s, P.sodium, lightA(0.10 * fogA)); // halo
      rect(lx - 0.14 * s, y - 1, 0.3 * s, Math.max(1, 0.03 * s), P.sodium, lightA(0.08 * fogA)); // flaque
      emit(lx, y, Math.max(1, s * 0.02), P.sodium, 0.5 * fogA, Math.min(18, s * 0.16));
    }

    else if (o.type === 'palm') {
      const x = CX + o.side * (1.95 + hash(o.seed) * 0.5) * s;
      const h = (0.42 + hash(o.seed * 3) * 0.2) * s;
      const lean = o.side * s * 0.02 * Math.sin(t * 0.7 + o.seed); // le mistral
      rect(x, y - h, Math.max(1, s * 0.012), h, '#0d1126');
      if (hash(o.seed * 5) < 0.35) {
        // pin parasol : la canopée plate du sud
        rect(x + lean - 0.13 * s, y - h - 0.04 * s, 0.27 * s, Math.max(1, s * 0.04), '#0c1a16');
        rect(x + lean - 0.08 * s, y - h - 0.06 * s, 0.17 * s, Math.max(1, s * 0.02), '#0c1a16');
      } else {
        for (const [dx, dy] of [[-0.09, -0.02], [-0.05, -0.05], [0, -0.06], [0.05, -0.05], [0.09, -0.02], [-0.07, 0.01], [0.07, 0.01]])
          rect(x + lean + dx * s, y - h + dy * s, Math.max(1, s * 0.045), Math.max(1, s * 0.014), '#0e1a26');
      }
    }

    else if (o.type === 'bld') {
      const xin = CX + o.side * (1.5 + o.off) * s;
      const wpx = o.w * s;
      const hpx = o.h * s;
      const x0 = o.side < 0 ? xin - wpx : xin;
      const col = P.bld[(o.seed % 4 + 4) % 4];
      rect(x0, y - hpx, wpx, hpx, col);
      rect(x0, y - hpx, wpx, 1, '#1f2444');                                // toit
      rect(o.side < 0 ? xin - Math.max(1, s * 0.03) : xin, y - hpx, Math.max(1, s * 0.03), hpx, '#06070f'); // volume : flanc côté rue
      // fenêtres : déterministes par immeuble (elles ne clignotent pas au hasard du cadre)
      if (s > 22) {
        const stepx = Math.max(3, s * 0.10), stepy = Math.max(4, s * 0.11);
        const wpix = s > 60 ? 2 : 1;
        for (let ix = x0 + stepx * 0.6; ix < x0 + wpx - 2; ix += stepx)
          for (let iy = y - hpx + stepy * 0.7; iy < y - 4; iy += stepy) {
            const r = hash(o.seed * 57.3 + ix * 1.7 + iy * 3.1);
            if (r < 0.32) rect(ix, iy, wpix, wpix, r < 0.06 ? '#bfe3ff' : P.gold, lightA((0.4 + r) * fogA));
          }
      } else if (s > 8 && hash(o.seed * 13) < 0.5) {
        rect(x0 + wpx * 0.3, y - hpx * 0.6, 1, 1, P.gold, lightA(0.5 * fogA));
      }
    }

    else if (o.type === 'hotel') {
      // l'hôtel étroit à l'enseigne verticale (il grésille par instants)
      const xin = CX + o.side * 1.55 * s;
      const wpx = 0.85 * s, hpx = 1.05 * s;
      const pk = 1 + 1.6 * (o.pulse || 0);
      rect(xin, y - hpx, wpx, hpx, '#141230');
      rect(xin, y - hpx, Math.max(1, s * 0.03), hpx, '#06070f');
      const fl = ((t * 0.7 + o.seed) % 19) < 0.5 ? (((t * 16) | 0) % 2 ? 0.15 : 1) : 1;
      if (s > 14) {
        let sy = y - hpx + 0.08 * s;
        for (const ch of 'HOTEL') {
          text(xin + wpx * 0.32, sy, ch, P.pink, lightA(fl * fogA * pk), 2.2 * pk, f);
          sy += 6 * f + 1;
        }
        emit(xin + wpx * 0.35, y, Math.max(1, f), P.pink, 0.55 * fl * fogA * pk, Math.min(16, s * 0.14));
      } else rect(xin + wpx * 0.3, y - hpx * 0.8, 1, Math.max(2, hpx * 0.4), P.pink, lightA(0.5 * fl * fogA));
      if (s > 12 && z < 70) { hot('hotel', o, xin, y - hpx, xin + wpx, y); pulseFrame(o, xin, y - hpx, xin + wpx, y); }
    }

    else if (o.type === 'garage') {
      // le garage — rideau entrouvert, lumière qui déborde (porte cliquable)
      const xin = CX + o.side * 1.55 * s;
      const wpx = 1.15 * s, hpx = 0.55 * s;
      const x0 = xin - wpx;
      const pk = 1 + 1.6 * (o.pulse || 0);
      rect(x0, y - hpx, wpx, hpx, P.bld[1]);
      rect(x0, y - hpx, wpx, 1, '#1f2444');
      rect(x0 + wpx - Math.max(1, s * 0.03), y - hpx, Math.max(1, s * 0.03), hpx, '#06070f');
      const dw = wpx * 0.44, dx = x0 + wpx * 0.28;
      rect(dx, y - hpx * 0.62, dw, hpx * 0.62, '#0a0d1e');
      rect(dx, y - Math.max(1, hpx * 0.1), dw, Math.max(1, hpx * 0.1), P.sodium, lightA(0.5 * fogA * pk));
      rect(dx - dw * 0.1, y - 1, dw * 1.2, Math.max(1, s * 0.02), P.sodium, lightA(0.10 * fogA));
      if (s > 20) text(x0 + wpx * 0.16, y - hpx - 6 * f, 'GARAGE', P.cyan, lightA(0.9 * fogA * pk), 2 * pk, f);
      emit(dx + dw / 2, y, Math.max(1, dw * 0.3), P.sodium, 0.45 * fogA * pk, Math.min(14, s * 0.12));
      if (s > 12 && z < 70) { hot('garage', o, x0, y - hpx - 7 * f, x0 + wpx, y); pulseFrame(o, x0, y - hpx, x0 + wpx, y); }
    }

    else if (o.type === 'arcade') {
      // la salle d'arcade — chenillard de forain (porte cliquable, PILOTE It9 :
      // sous le regard, le lieu répond — néon qui monte, cadre, chenillard fou)
      const xin = CX + o.side * 1.55 * s;
      const wpx = 0.95 * s, hpx = 0.72 * s;
      const fk = focusKind === 'arcade' ? 1 : 0;
      const pk = (1 + 1.6 * (o.pulse || 0)) * (1 + 0.35 * fk);
      rect(xin, y - hpx, wpx, hpx, P.bld[3]);
      rect(xin, y - hpx, Math.max(1, s * 0.03), hpx, '#06070f');
      // la vitrine : elle s'embrase quand on la regarde
      rect(xin + wpx * 0.3, y - hpx * 0.4, wpx * 0.4, hpx * 0.4, '#150a20');
      rect(xin + wpx * 0.34, y - hpx * 0.36, wpx * 0.32, hpx * 0.3, P.purple, lightA((0.14 + 0.14 * fk) * fogA * pk));
      if (s > 20) {
        text(xin + wpx * 0.14, y - hpx + 0.06 * s, 'ARCADE', P.purple, lightA(0.95 * fogA * pk), 2 * (1 + 1.6 * (o.pulse || 0)), f);
        // halo du néon : deux passes seulement quand focusé — il appelle
        if (fk) rect(xin + wpx * 0.1, y - hpx + 0.04 * s - 2, wpx * 0.8, 8 * f + 4, P.purple, lightA(0.13 * fogA));
        for (let i = 0; i < 6; i++) {
          const on = ((t * (8 + 12 * fk)) | 0) % 6 === i;
          rect(xin + wpx * 0.16 + i * 4 * f, y - hpx + 0.06 * s + 6 * f, 2, 1, on ? '#ffffff' : P.purple, lightA((on ? 1 : 0.3 + 0.3 * fk) * fogA));
        }
      } else {
        // de loin : une braise violette — l'arcade se repère depuis l'horizon
        rect(xin + wpx * 0.35, y - hpx * 0.75, 1, Math.max(2, hpx * 0.35), P.purple, lightA((0.55 + 0.3 * fk) * fogA));
      }
      // le cadre du focus : un liseré qui respire, jamais un contour d'UI
      if (fk && s > 12) {
        const fa = lightA((0.28 + 0.14 * Math.sin(t * 6)) * fogA);
        rect(xin - 1, y - hpx - 1, wpx + 2, 1, P.purple, fa);
        rect(xin - 1, y, wpx + 2, 1, P.purple, fa);
        rect(xin - 1, y - hpx, 1, hpx, P.purple, fa);
        rect(xin + wpx + 1, y - hpx, 1, hpx, P.purple, fa);
      }
      emit(xin + wpx * 0.5, y, Math.max(1, wpx * 0.2), P.purple, (0.5 + 0.3 * fk) * fogA * pk, Math.min(14, s * 0.12));
      if (s > 12 && z < 70) { hot('arcade', o, xin, y - hpx, xin + wpx, y); pulseFrame(o, xin, y - hpx, xin + wpx, y); }
    }

    else if (o.type === 'pmu') {
      // le tabac-PMU de quartier, enseigne fatiguée (porte cliquable)
      const xin = CX + o.side * 1.55 * s;
      const wpx = 0.8 * s, hpx = 0.6 * s;
      const x0 = xin - wpx;
      const pk = 1 + 1.6 * (o.pulse || 0);
      rect(x0, y - hpx, wpx, hpx, P.bld[0]);
      rect(x0, y - hpx, wpx, 1, '#1f2444');
      rect(x0 + wpx - Math.max(1, s * 0.03), y - hpx, Math.max(1, s * 0.03), hpx, '#06070f');
      rect(x0 + wpx * 0.2, y - hpx * 0.45, wpx * 0.55, hpx * 0.4, '#0d1020');
      rect(x0 + wpx * 0.24, y - hpx * 0.4, wpx * 0.45, hpx * 0.3, P.gold, lightA(0.10 * fogA));
      if (s > 20) {
        text(x0 + wpx * 0.14, y - hpx - 6 * f, 'TABAC', P.red, lightA(0.85 * fogA * pk), 2 * pk, f);
        text(x0 + wpx * 0.3, y - hpx + 0.05 * s, 'PMU', P.green, lightA((0.5 + 0.35 * Math.sin(t * 2.1)) * fogA * pk), 1.5, f);
      }
      emit(x0 + wpx * 0.4, y, Math.max(1, wpx * 0.2), P.red, 0.4 * fogA * pk, Math.min(12, s * 0.1));
      if (s > 12 && z < 70) { hot('pmu', o, x0, y - hpx - 7 * f, x0 + wpx, y); pulseFrame(o, x0, y - hpx, x0 + wpx, y); }
    }

    else if (o.type === 'azur') {
      // la station AZUR — auvent blanc froid, prix qui a du sens
      const xin = CX + o.side * 1.55 * s;
      const wpx = 1.5 * s, hpx = 0.5 * s;
      const x0 = xin - wpx;
      rect(x0, y - hpx * 0.55, wpx, hpx * 0.55, '#0c1024');                 // boutique
      rect(x0 - 0.1 * s, y - hpx, wpx * 1.1, Math.max(1, s * 0.035), '#1a2040'); // auvent
      rect(x0, y - hpx + Math.max(1, s * 0.035), wpx, Math.max(1, s * 0.02), '#dff2ff', lightA(0.7 * fogA));
      rect(x0 + wpx * 0.15, y - hpx, wpx * 0.7, hpx, '#dff2ff', lightA(0.05 * fogA)); // lumière froide
      if (s > 18) {
        text(x0 + wpx * 0.12, y - hpx - 6 * f, 'AZUR', P.cyan, lightA(0.95 * fogA), 2, f);
        text(x0 + wpx * 0.12 + 18 * f, y - hpx - 6 * f, '1.93', P.red, lightA(0.9 * fogA), 1.5, f);
      }
      if (s > 30) { rect(x0 + wpx * 0.3, y - 0.14 * s, 0.08 * s, 0.14 * s, '#0a0d1e'); rect(x0 + wpx * 0.55, y - 0.14 * s, 0.08 * s, 0.14 * s, '#0a0d1e'); }
      emit(x0 + wpx * 0.5, y, 2, '#bfe9ff', 0.5 * fogA, Math.min(20, s * 0.2));
      if (s > 12 && z < 70) { hot('station', o, x0 - 0.1 * s, y - hpx - 8, x0 + wpx, y); pulseFrame(o, x0, y - hpx, x0 + wpx, y); }
    }

    else if (o.type === 'wall') {
      // le mur de la ZONE : bas, long, couvert de couleurs
      const xin = CX + o.side * 1.5 * s;
      const wpx = 1.9 * s, hpx = 0.24 * s;
      const x0 = o.side < 0 ? xin - wpx : xin;
      rect(x0, y - hpx, wpx, hpx, '#1a1c26');
      rect(x0, y - hpx, wpx, 1, '#262a38');
      if (s > 20) {
        const cols = [P.pink, P.green, P.cyan, '#ff9f3a', P.purple];
        for (let i = 0; i < 9; i++) {
          const r1 = hash(o.seed * 31 + i * 7), r2 = hash(o.seed * 17 + i * 13);
          rect(x0 + r1 * (wpx - 4), y - hpx + 2 + r2 * (hpx - 4), Math.max(1, s * 0.05), Math.max(1, s * 0.02), cols[i % 5], 0.5 * fogA);
        }
        if (s > 46) text(x0 + wpx * 0.28, y - hpx * 0.72, 'LA ZONE', '#e8e8e4', 0.55 * fogA, 0, f);
      }
    }

    else if (o.type === 'gantry') {
      // le panneau suspendu : LA CORNICHE / VIEUX PORT / A50
      const hpx = 0.78 * s;
      const bw = 1.7 * s, bh = 0.34 * s;
      rect(CX - ROAD_HW * s, y - hpx, Math.max(1, s * 0.02), hpx, '#141833');
      rect(CX + ROAD_HW * s, y - hpx, Math.max(1, s * 0.02), hpx, '#141833');
      rect(CX - bw / 2, y - hpx, bw, Math.max(1, s * 0.015), '#141833');
      rect(CX - bw / 2, y - hpx + Math.max(1, s * 0.015), bw, bh, '#0c4a28', Math.max(0.55, fogA));
      rect(CX - bw / 2, y - hpx + Math.max(1, s * 0.015), bw, 1, '#e8e8e4', 0.4 * fogA);
      if (s > 26) {
        text(CX - bw / 2 + 3 * f, y - hpx + 0.05 * s, 'LA CORNICHE', '#e8e8e4', 0.9 * fogA, 0, f);
        text(CX - bw / 2 + 3 * f, y - hpx + 0.05 * s + 6 * f, 'VIEUX PORT', '#e8e8e4', 0.9 * fogA, 0, f);
        text(CX + bw / 2 - 16 * f, y - hpx + 0.05 * s + 3 * f, 'A50', P.amber, 0.95 * fogA, 1, f);
      }
    }

    else if (o.type === 'billboard') {
      // 93.00 FM veille sur la route (l'Émetteur est partout)
      const xin = CX + o.side * (1.7 + 0.2) * s;
      const wpx = 0.9 * s, hpx = 0.4 * s;
      const x0 = o.side < 0 ? xin - wpx : xin;
      rect(x0 + wpx * 0.45, y - 0.7 * s, Math.max(1, s * 0.02), 0.3 * s, '#141833');
      rect(x0, y - 0.7 * s - hpx, wpx, hpx, '#0d0800');
      rect(x0, y - 0.7 * s - hpx, wpx, 1, '#332211');
      if (s > 20) {
        text(x0 + 2 * f, y - 0.7 * s - hpx + 0.08 * s, '93.00', P.amber, lightA((0.75 + 0.15 * Math.sin(t * 1.3)) * fogA), 2, f);
        if (s > 34) text(x0 + 21 * f, y - 0.7 * s - hpx + 0.08 * s, 'FM', P.amber, lightA(0.6 * fogA), 1, f);
      } else rect(x0 + 1, y - 0.7 * s - hpx + 1, wpx - 2, hpx - 2, P.amber, lightA(0.25 * fogA));
      if (s > 12 && z < 70) { hot('radio', o, x0, y - 0.7 * s - hpx, x0 + wpx, y - 0.7 * s); pulseFrame(o, x0, y - 0.7 * s - hpx, x0 + wpx, y - 0.7 * s); }
    }

    else if (o.type === 'lead') {
      // la voiture qu'on suit — feux arrière, freins, plaque du 13
      const wpx = 0.6 * s, hpx = 0.42 * wpx;
      const x0 = CX + 0.42 * s - wpx / 2;
      const y0 = y - hpx;
      rect(x0 + wpx * 0.12, y0 - hpx * 0.5, wpx * 0.76, hpx * 0.55, '#171a26'); // pavillon + lunette
      rect(x0, y0, wpx, hpx, o.color);
      rect(x0 + wpx * 0.1, y0 - hpx * 0.42, wpx * 0.8, Math.max(1, hpx * 0.14), '#0a0c14');
      const tlw = Math.max(1, wpx * 0.14), tlh = Math.max(1, hpx * 0.3);
      const ta = o.brake ? 1 : 0.85;
      rect(x0 + 1, y0 + 1, tlw, tlh, P.tail, lightA(ta));
      rect(x0 + wpx - tlw - 1, y0 + 1, tlw, tlh, P.tail, lightA(ta));
      if (o.brake) {
        rect(x0 - 1, y0, tlw + 3, tlh + 2, P.tail, lightA(0.20));
        rect(x0 + wpx - tlw - 2, y0, tlw + 3, tlh + 2, P.tail, lightA(0.20));
      }
      if (wpx > 16) {
        rect(x0 + wpx / 2 - 4, y0 + hpx - 4, 8, 3, '#d8d4c0', 0.8);
        if (wpx > 26) text(x0 + wpx / 2 - 3, y0 + hpx - 3, '13', '#23231f', 0.9, 0, 1);
      }
      emit(x0 + 1, y0 + tlh, tlw, P.tail, o.brake ? 0.9 : 0.55, Math.min(16, s * 0.2));
      emit(x0 + wpx - tlw - 1, y0 + tlh, tlw, P.tail, o.brake ? 0.9 : 0.55, Math.min(16, s * 0.2));
    }

    else if (o.type === 'oncoming') {
      // en face : deux phares qui grossissent, un éblouissement, plus rien
      const wpx = 0.6 * s, hpx = 0.42 * wpx;
      const x0 = CX - 0.5 * s - wpx / 2;
      const y0 = y - hpx;
      rect(x0, y0, wpx, hpx, '#0d0f1a');
      const hl = Math.max(1, wpx * 0.14);
      rect(x0 + 1, y0 + hpx * 0.4, hl, hl, P.head, lightA());
      rect(x0 + wpx - hl - 1, y0 + hpx * 0.4, hl, hl, P.head, lightA());
      const dazzle = z < 8 ? (8 - z) / 8 : 0;
      rect(x0 - wpx * 0.3, y0, wpx * 1.6, hpx * 1.4, P.head, lightA(0.10 + 0.25 * dazzle));
      emit(x0 + wpx / 2, y0 + hpx, Math.max(1, wpx * 0.3), P.head, 0.7, Math.min(18, s * 0.22));
    }
  }

  // ---------- boucle de mise à jour ----------
  function update(dt) {
    t += dt;
    litT += (litTarget - litT) * Math.min(1, dt * 2.2);
    if (Math.abs(litTarget - litT) < 0.01) litT = litTarget;

    // le launch : contact mis, on lâche le frein, la ville se met à couler
    v += ((litTarget === 1 ? 1 : 0) - v) * Math.min(1, dt * 0.4);
    if (v < 0.002) v = 0;
    traveled += S * v * dt;

    spawnStreams();
    // ménage : ce qui est passé derrière nous n'existe plus
    for (let i = objs.length - 1; i >= 0; i--)
      if (objs[i].d - traveled < ZNEAR - 0.3) objs.splice(i, 1);

    // la voiture qu'on suit
    if (litT > 0.5) lead.on = true;
    if (lead.on) {
      lead.ph += dt;
      const zTarget = 11 + 4.5 * Math.sin(t * 0.11) + 1.5 * Math.sin(t * 0.043);
      const closing = (lead.z - zTarget) * 0.35;
      lead.z -= closing * dt * 4;
      lead.brake = closing > 0.55; // il freine : ses stops s'allument, on recolle
      lead.z = Math.max(5.5, Math.min(30, lead.z));
    }

    // le trafic d'en face
    onNext -= dt;
    if (onNext <= 0 && v > 0.3) {
      oncoming.push({ z: ZFAR - 4 });
      onNext = R(2.5, 8);
    }
    for (let i = oncoming.length - 1; i >= 0; i--) {
      oncoming[i].z -= (S * v + 13) * dt;
      if (oncoming[i].z < ZNEAR) oncoming.splice(i, 1);
    }

    for (const e of events) { e.next -= dt; if (e.next <= 0) { e.fn(); e.next = R(e.min, e.max); } }
    for (const a of actors) a.update(dt);
    for (let i = actors.length - 1; i >= 0; i--) if (actors[i].dead) actors.splice(i, 1);

    // la fièvre du clic retombe
    for (const o of objs) if (o.pulse) o.pulse = Math.max(0, o.pulse - dt * 1.4);
  }

  // ---------- rendu ----------
  function dither(y, c) {
    for (let x = (y % 2) * 2; x < W; x += 4) rect(x, y, 2, 1, c, 0.5);
  }

  function draw() {
    hots = [];
    // ciel en bandes (jamais lisse)
    rect(0, 0, W, 34, P.sky0); dither(33, P.sky1);
    rect(0, 34, W, 24, P.sky1); dither(57, P.sky2);
    rect(0, 58, W, 20, P.sky2); dither(77, P.sky3);
    rect(0, 78, W, HOR - 78, P.sky3);
    rect(0, HOR - 10, W, 10, '#4a2558', 0.5); // le halo de la ville

    for (let i = 0; i < 36; i++) {
      const sx = hash(i * 7.3) * W, sy = hash(i * 3.1) * 66;
      rect(sx, sy, 1, 1, P.star, 0.30 + 0.45 * Math.abs(Math.sin(t * 0.7 + i)));
    }
    for (const a of actors) a.draw();

    drawHorizon();
    drawRoad();

    // les objets, du fond vers nous (peintre) — le brouillard coupe le monde en deux
    const list = [];
    for (const o of objs) { const z = o.d - traveled; if (z > ZNEAR && z < ZFAR) list.push({ z, o }); }
    if (lead.on) list.push({ z: lead.z, o: { ...lead, type: 'lead' } });
    for (const c of oncoming) list.push({ z: c.z, o: { type: 'oncoming' }, zz: c.z });
    list.sort((a, b) => b.z - a.z);

    let fogDrawn = false;
    for (const it of list) {
      if (!fogDrawn && it.z <= 55) {
        // brouillard PS2 : un banc violet saturé, à bords bitmap, qui mange le fond
        dither(HOR - 12, '#3f2f7a');
        rect(0, HOR - 11, W, 17, '#3f2f7a', 0.30);
        rect(0, HOR - 4, W, 8, '#5a3a8a', 0.20);
        dither(HOR + 6, '#3f2f7a');
        fogDrawn = true;
      }
      drawObj(it.o, it.z);
    }
    if (!fogDrawn) {
      dither(HOR - 12, '#3f2f7a');
      rect(0, HOR - 11, W, 17, '#3f2f7a', 0.30);
      rect(0, HOR - 4, W, 8, '#5a3a8a', 0.20);
      dither(HOR + 6, '#3f2f7a');
    }

    drawRefl();

    // avant le contact : la ville n'est qu'une promesse
    rect(0, 0, W, H, '#04040f', 0.55 * (1 - litT));
  }

  // ---------- le rétroviseur : la route qui recule derrière nous ----------
  let mirrorEv = null, mirrorNext = R(10, 26);
  function mrect(x, y, w, h, c, a = 1) {
    mctx.globalAlpha = Math.min(1, a); mctx.fillStyle = c;
    mctx.fillRect(x | 0, y | 0, Math.max(1, w | 0), Math.max(1, h | 0));
    mctx.globalAlpha = 1;
  }
  function drawMirror(dt) {
    if (!mctx) return;
    mirrorNext -= dt;
    if (mirrorNext <= 0 && !mirrorEv) {
      const kind = pick(['headlights', 'gyros', 'scooter', 'taillights']);
      mirrorEv = { kind, t: 0, dur: kind === 'gyros' ? R(4, 7) : R(3.5, 6), x: R(-6, 6) };
      mirrorNext = R(14, 45);
    }
    const cx = MW / 2;
    mrect(0, 0, MW, MH, '#07070f');
    mrect(0, 0, MW, 5, '#0a0f22');                       // le ciel derrière
    mrect(0, 4, MW, 1, '#3f2f7a', 0.5);                  // le même brouillard
    mrect(0, 5, MW, 9, '#0b0c15');
    for (let y = 5; y < MH; y++) {                       // la route qui fuit
      const half = (y - 4) * 2.6;
      mrect(cx - half, y, half * 2, 1, '#14161f');
      if (((y * 3 + ((traveled * 6) | 0)) % 5) < 2) mrect(cx, y, 1, 1, P.lane, 0.4);
    }
    // les lampadaires qu'on vient de dépasser rapetissent derrière nous
    for (let k = 0; k < 3; k++) {
      const p = ((traveled * 0.14 + k / 3) % 1);
      const ly = 12 - p * 7, lx = 21 - p * 17;
      mrect(cx - lx, ly, 1, 1, P.sodium, lightA((1 - p) * 0.5));
      mrect(cx + lx, ly, 1, 1, P.sodium, lightA((1 - p) * 0.5));
    }
    if (mirrorEv) {
      const e = mirrorEv; e.t += dt;
      const p = Math.min(1, e.t / e.dur);
      if (e.kind === 'headlights') {
        // quelqu'un nous suit : deux phares qui grossissent doucement
        const g = 1 + p * 3;
        mrect(cx - 2 - g + e.x, 8, 1, 1, P.head, lightA(0.5 + p * 0.5));
        mrect(cx + 1 + g + e.x, 8, 1, 1, P.head, lightA(0.5 + p * 0.5));
        mrect(cx - 3 - g + e.x, 7, 4 + g * 2, 3, P.head, lightA(0.10 + p * 0.12));
      } else if (e.kind === 'gyros') {
        // des flics derrière — tout le rétro pulse bleu/rouge
        const b = ((e.t * 6) | 0) % 2 === 0;
        mrect(cx - 1 + e.x, 8, 1, 1, b ? P.blue : P.red, lightA());
        mrect(cx + 1 + e.x, 8, 1, 1, b ? P.red : P.blue, lightA());
        mrect(0, 0, MW, MH, b ? P.blue : P.red, lightA(0.10));
      } else if (e.kind === 'scooter') {
        // un scooter qui slalome (un seul phare qui danse)
        mrect(cx + Math.sin(e.t * 4) * 5, 9 - p * 2, 1, 1, P.head, lightA(0.8));
      } else {
        // des feux arrière qui s'éloignent : lui, il rentre
        mrect(cx - 2 + p * 1, 6 + p * 1, 1, 1, P.tail, lightA(0.8 * (1 - p)));
        mrect(cx + 2 - p * 1, 6 + p * 1, 1, 1, P.tail, lightA(0.8 * (1 - p)));
      }
      if (e.t > e.dur) mirrorEv = null;
    }
    mrect(0, 0, MW, MH, '#04040f', 0.5 * (1 - litT));
  }

  // ---------- boucle (≈30 fps : cadence de jeu d'époque) ----------
  function loop(ts) {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (ts - last < 33) return;
    const dt = Math.min(0.1, (ts - last) / 1000);
    last = ts;
    update(dt);
    draw();
    drawMirror(dt);
  }

  return {
    start() { if (running) return; running = true; last = performance.now(); raf = requestAnimationFrame(loop); },
    stop() { running = false; cancelAnimationFrame(raf); },
    setLit(vOn) {
      const target = vOn ? 1 : 0;
      if (target === 1 && litTarget !== 1) litSince = t;
      litTarget = target;
    },
    /** La porte actuellement sous le regard (ou null) : le lieu répond. */
    setFocus(kind) { focusKind = kind; },
    /** La porte sous ce pixel, avec son centre écran — pour que le regard
     *  sache OÙ se tourner (menus PS2). Null si rien d'intéressant. */
    hover(x, y) {
      for (let i = hots.length - 1; i >= 0; i--) {
        const h = hots[i];
        if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1)
          return { kind: h.kind, cx: (h.x0 + h.x1) / 2, cy: (h.y0 + h.y1) / 2 };
      }
      return null;
    },
    /** Clic sur le monde : le lieu répond d'une lueur. Retourne son nom, ou null. */
    click(x, y) {
      for (let i = hots.length - 1; i >= 0; i--) {
        const h = hots[i];
        if (x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) { h.o.pulse = 1; return h.kind; }
      }
      return null;
    },
  };
}
