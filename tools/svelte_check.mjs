import { compile } from 'svelte/compiler';
import { readFileSync } from 'node:fs';
const src = readFileSync('src/os/nightdrive/NightDrive.svelte','utf8');
try {
  const { warnings } = compile(src, { name: 'NightDrive', generate: 'client' });
  const errs = warnings.filter(w => /error/i.test(w.code||''));
  console.log('SVELTE_COMPILE_OK — warnings:', warnings.length);
  for (const w of warnings.slice(0,12)) console.log('  ·', w.code, '—', (w.message||'').slice(0,90));
} catch (e) {
  console.log('SVELTE_COMPILE_FAIL');
  console.log(e.message);
  process.exit(1);
}
