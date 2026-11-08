// Imports the owner's original product photos and replaces interim images.
//
// Usage:  node scripts/import-photos.mjs <folder>
//
// File names decide where each photo goes:
//   vr-001.jpg      → first (main) photo of product VR-001
//   vr-001-2.jpg    → second photo, vr-001-3.jpg third, …
// Accepted: jpg, jpeg, png, webp, heic is NOT supported (export as JPEG first).
// Photos are auto-rotated, resized to max 2000 px on the long edge and saved as
// high-quality JPEG in src/assets/products/. Astro optimises them at build time.
import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = process.argv[2];
if (!dir) {
  console.error('Kullanım: node scripts/import-photos.mjs <klasör>');
  process.exit(1);
}
const dataPath = path.join(root, 'src/data/products.json');
const data = JSON.parse(await readFile(dataPath, 'utf8'));
const byId = new Map(data.products.map((p) => [p.id, p]));

const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const groups = new Map();
for (const f of files) {
  const m = f.toLowerCase().match(/^(vr-\d{3})(?:-(\d+))?\./);
  if (!m) {
    console.warn(`  atlandı (ad biçimi vr-001.jpg olmalı): ${f}`);
    continue;
  }
  const [, id, n] = m;
  if (!byId.has(id)) {
    console.warn(`  atlandı (katalogda ${id} yok): ${f}`);
    continue;
  }
  if (!groups.has(id)) groups.set(id, []);
  groups.get(id).push({ f, order: Number(n ?? 1) });
}

for (const [id, list] of groups) {
  const p = byId.get(id);
  list.sort((a, b) => a.order - b.order);
  // remove the old interim files
  for (const img of p.images) {
    const old = path.join(root, 'src/assets/products', img.file);
    if (img.quality?.startsWith('interim') && existsSync(old)) await unlink(old);
  }
  p.images = [];
  for (const [k, { f }] of list.entries()) {
    const out = `${id}-${k + 1}.jpg`;
    const meta = await sharp(path.join(dir, f))
      .rotate()
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(path.join(root, 'src/assets/products', out));
    p.images.push({ file: out, alt: k === 0 ? p.name : `${p.name} — görsel ${k + 1}` });
    console.log(`  ${id}: ${f} → ${out} (${meta.width}×${meta.height})`);
  }
  p.review = p.review.filter((r) => r !== 'images');
}

await writeFile(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log(`\n${groups.size} ürünün fotoğrafı güncellendi.`);
