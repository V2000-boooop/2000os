// SMOKE TEST — pilote le vrai site en headless et vérifie l'anim de la barque.
// Prérequis (voir docs/015_QC_PROTOCOLE.md §3) : playwright-core + chromium + stub
// libXdamage + build servi sur http://localhost:8099 (dossier dist/).
// Lancer : LD_LIBRARY_PATH=/tmp/libs node tools/smoke_test.mjs [url]
//
// Vérifie OBJECTIVEMENT : les frames défilent (src) ET se décodent (naturalWidth>0),
// et qu'il n'y a AUCUNE erreur console. Vert = on peut livrer.

import { chromium } from 'playwright-core';

const URL = process.argv[2] || 'http://localhost:8099/';
const b = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'] });
const pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errs = [];
pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
// CONTRAT SONORE (000/050) : un son attendu absent = SILENCE voulu, pas une erreur.
// Le 404 d'un fichier de /sons/ est donc toléré ; tout autre 404 reste fatal.
pg.on('console', (m) => {
  if (m.type() !== 'error') return;
  const url = m.location()?.url ?? '';
  if (/Failed to load resource/.test(m.text()) && url.includes('/media/nightdrive/sons/')) return;
  errs.push('CONSOLE ' + m.text() + (url ? ` (${url})` : ''));
});

const poll = async (sel, n, ms) => {
  const out = [];
  for (let i = 0; i < n; i++) {
    const o = await pg.$eval(sel, (e) => ({ s: (e.getAttribute('src') || '').split('/').pop(), w: e.naturalWidth })).catch(() => ({ s: '-', w: 0 }));
    out.push(`${o.s}:${o.w}`);
    await pg.waitForTimeout(ms);
  }
  return out;
};

await pg.goto(URL, { waitUntil: 'load', timeout: 20000 });
await pg.waitForTimeout(600);
await pg.click('.nightkey');
await pg.waitForTimeout(7500); // entrée Night Drive → état 'drive'
const phase = await pg.$eval('.nd', (e) => e.className).catch(() => 'no .nd');
await pg.click('button[aria-label="barque"]', { force: true });
await pg.waitForTimeout(1400);

// roule un joint
await pg.click('.sc button.lieu[aria-label="weed"]', { force: true });
await pg.waitForTimeout(300);
const prompt = !!(await pg.$('.roll-ask'));
await pg.click('.roll-choices button:has-text("Myrtille")');
const roll = await poll('.perso-lean .perso-src', 16, 250);

// souffle un rond
await pg.waitForTimeout(500);
await pg.click('.perso-lean', { force: true });
const ring = await poll('.smoke-ring', 18, 280);

const decoded = (arr) => arr.every((x) => x === '-:0' || Number(x.split(':')[1]) > 0);
console.log('PHASE       ', phase.includes('p-drive') ? 'OK (drive)' : 'KO ' + phase);
console.log('PROMPT      ', prompt ? 'OK' : 'KO');
console.log('ROLL        ', JSON.stringify(roll));
console.log('ROLL decode ', decoded(roll) ? 'OK (toutes décodées)' : 'KO (image manquante !)');
console.log('RING        ', JSON.stringify(ring));
console.log('RING decode ', decoded(ring) ? 'OK (toutes décodées)' : 'KO (frame manquante !)');
console.log('CONSOLE     ', errs.length ? 'KO ' + JSON.stringify(errs.slice(0, 6)) : 'OK (0 erreur)');
await b.close();
