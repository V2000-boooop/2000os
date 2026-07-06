#!/usr/bin/env node
// scan_3d.mjs — régénère public/media/3d/manifest.json à partir des .glb présents.
// Usage : node tools/scan_3d.mjs
// Le nom affiché = nom de fichier sans extension, "_" -> espaces.
import { readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'public', 'media', '3d');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const files = readdirSync(dir)
  .filter((f) => f.toLowerCase().endsWith('.glb') || f.toLowerCase().endsWith('.gltf'))
  .sort();

const models = files.map((file) => ({
  file,
  name: file.replace(/\.(glb|gltf)$/i, '').replace(/[_-]+/g, ' ')
}));

writeFileSync(join(dir, 'manifest.json'), JSON.stringify(models, null, 2) + '\n');
console.log(`manifest.json : ${models.length} modèle(s)`);
models.forEach((m) => console.log('  -', m.file));
