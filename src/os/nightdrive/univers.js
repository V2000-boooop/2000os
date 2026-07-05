// LES UNIVERS DES VITRAUX (cathédrale) — une parenthèse dans la parenthèse (D12).
// Un vitrail cliqué n'ouvre pas une image : il fait basculer de dimension. Ici,
// une rosace vivante — anneaux de verre serti de plomb, rotation lente, lumière
// qui respire, poussières qui montent. Un seul moteur, deux âmes (config) :
//   'dark' → psyché catholique sombre (sang, violet, contre-jour)
//   'ange' → le même vitrail, versant angélique (or, ciel, ascension)
//
// Rendu bitmap assumé (DA PS2) : petit buffer interne upscalé en pixelated.
// createUnivers(canvas, kind).start() … .stop(). Aucun son ici (worldsound s'en
// charge : univers_dark|ange). Robuste : si le canvas disparaît, tout s'arrête.

const W = 384, H = 216;

const CONFIGS = {
  dark: {
    bg: ['#0a0308', '#160512', '#05020a'],
    verre: ['#7a0f22', '#3a0a2e', '#520b16', '#24103f', '#6e1533', '#160a2c'],
    plomb: '#05030a',
    halo: 'rgba(255,60,90,0.06)',
    rais: 'rgba(190,40,70,0.10)',
    motes: '#ff5a7a',
    coeur: '#ff2a4a',
    spin: -0.045,          // sens anti-horaire, inquiétant
    pouls: 0.85,           // respiration marquée, presque un cœur
    poulsHz: 0.42,
    motif: 'cross-inv',
  },
  ange: {
    bg: ['#0b1024', '#14224a', '#243c6e'],
    verre: ['#ffe9a8', '#ffd45e', '#bfe4ff', '#8fbcf0', '#fff6d8', '#e0b968'],
    plomb: '#1a2038',
    halo: 'rgba(255,244,200,0.09)',
    rais: 'rgba(255,240,190,0.14)',
    motes: '#fff2c0',
    coeur: '#fff6d8',
    spin: 0.03,            // horaire, apaisé
    pouls: 0.5,            // respiration douce
    poulsHz: 0.22,
    motif: 'cross',
  },
};

export function createUnivers(canvas, kind = 'dark') {
  const cfg = CONFIGS[kind] ?? CONFIGS.dark;
  const g = canvas.getContext('2d');
  const cx = W / 2, cy = H / 2;

  // les anneaux de la rosace : [rayon intérieur, rayon extérieur, nb segments]
  const RINGS = [
    [10, 26, 8],
    [26, 52, 12],
    [52, 84, 16],
    [84, 118, 24],
  ];

  // poussières de lumière qui montent (motes)
  const MOTES = Array.from({ length: 46 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() < 0.8 ? 1 : 2,
    v: 4 + Math.random() * 10,
    ph: Math.random() * Math.PI * 2,
    sw: 0.3 + Math.random() * 0.8,
  }));

  let raf = 0;
  let t0 = performance.now();
  let running = false;

  function secteur(ri, ro, a0, a1, fill, lead) {
    g.beginPath();
    g.arc(cx, cy, ro, a0, a1);
    g.arc(cx, cy, ri, a1, a0, true);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
    g.lineWidth = 1.4;
    g.strokeStyle = lead;
    g.stroke();
  }

  function emblem(pulse) {
    g.save();
    g.translate(cx, cy);
    g.globalCompositeOperation = 'lighter';
    g.fillStyle = cfg.coeur;
    g.globalAlpha = 0.5 + 0.5 * pulse;
    const arm = 6, len = 15;
    // une croix : hampe verticale + une seule barre transversale, haute (ange)
    // ou basse (dark = croix inversée, la barre descend)
    g.fillRect(-arm / 2, -len, arm, len * 2);
    const by = cfg.motif === 'cross-inv' ? len - 10 : -len + 6;
    g.fillRect(-len / 2, by, len, arm);
    g.restore();
  }

  function frame(now) {
    if (!running) return;
    const t = (now - t0) / 1000;
    const pulse = (Math.sin(t * Math.PI * 2 * cfg.poulsHz) + 1) / 2; // 0..1

    // le fond : profondeur de nef
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, cfg.bg[0]);
    grad.addColorStop(0.55, cfg.bg[1]);
    grad.addColorStop(1, cfg.bg[2]);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);

    // les rais de lumière qui traversent (contre-jour du vitrail)
    g.save();
    g.translate(cx, cy);
    g.rotate(t * cfg.spin * 0.5);
    g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      g.rotate(Math.PI / 6);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(a) * 240, Math.sin(a) * 240);
      g.lineTo(Math.cos(a + 0.06) * 240, Math.sin(a + 0.06) * 240);
      g.closePath();
      g.fillStyle = cfg.rais;
      g.globalAlpha = 0.4 + 0.6 * pulse * ((i % 3) / 2);
      g.fill();
    }
    g.restore();

    // LA ROSACE : anneaux de verre serti, en rotation lente
    g.save();
    g.translate(cx, cy);
    g.rotate(t * cfg.spin);
    let ci = 0;
    for (let ring = 0; ring < RINGS.length; ring++) {
      const [ri, ro, n] = RINGS[ring];
      const spin = t * cfg.spin * (ring % 2 ? -1.6 : 1.1); // anneaux contrarotatifs
      for (let k = 0; k < n; k++) {
        const a0 = spin + (k / n) * Math.PI * 2;
        const a1 = spin + ((k + 1) / n) * Math.PI * 2;
        const base = cfg.verre[(k + ring + ci) % cfg.verre.length];
        // la lumière traverse : le verre s'éclaire par vagues (respiration)
        const lum = 0.55 + 0.45 * ((Math.sin(t * 1.3 + k * 0.7 + ring) + 1) / 2) * cfg.pouls;
        g.globalAlpha = lum;
        secteur(ri, ro, a0, a1, base, cfg.plomb);
      }
      ci += n;
    }
    g.globalAlpha = 1;
    g.restore();

    // le halo central + l'emblème
    g.save();
    g.globalCompositeOperation = 'lighter';
    const rg = g.createRadialGradient(cx, cy, 2, cx, cy, 70);
    rg.addColorStop(0, cfg.halo.replace(/[\d.]+\)$/, `${(0.14 + 0.14 * pulse).toFixed(3)})`));
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg;
    g.beginPath();
    g.arc(cx, cy, 70, 0, Math.PI * 2);
    g.fill();
    g.restore();
    emblem(pulse);

    // les poussières de lumière (montent, scintillent)
    g.globalCompositeOperation = 'lighter';
    for (const m of MOTES) {
      m.y -= (m.v * 0.016);
      if (m.y < -2) { m.y = H + 2; m.x = Math.random() * W; }
      const a = 0.2 + 0.6 * Math.abs(Math.sin(m.ph + t * m.sw));
      g.globalAlpha = a;
      g.fillStyle = cfg.motes;
      g.fillRect(m.x | 0, m.y | 0, m.r, m.r);
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';

    // vignette de nef : les bords se perdent dans l'ombre
    const vg = g.createRadialGradient(cx, cy, 60, cx, cy, 230);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.72)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}
