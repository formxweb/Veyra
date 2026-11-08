// Reports what the live catalog is still missing. Never fails the build for
// missing *content* (the owner may publish progressively) — only for
// structural errors that would break pages.
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const data = JSON.parse(await readFile(new URL('../src/data/products.json', import.meta.url), 'utf8'));
const errors = [];
const missing = { name: [], description: [], images: [], price: [], note: [] };
const slugs = new Set();
for (const p of data.products) {
  if (!p.id || !p.slug || !p.name || !p.category) errors.push(`${p.id ?? '?'}: id/slug/name/category zorunlu`);
  if (slugs.has(p.slug)) errors.push(`${p.id}: slug tekrar ediyor (${p.slug})`);
  slugs.add(p.slug);
  for (const img of p.images ?? []) {
    if (!existsSync(new URL(`../src/assets/products/${img.file}`, import.meta.url))) errors.push(`${p.id}: görsel yok (${img.file})`);
  }
  if (p.hidden) continue;
  if (p.review?.includes('name')) missing.name.push(p.id);
  if (!p.description) missing.description.push(p.id);
  if (!p.images?.length || p.images.some((i) => i.quality === 'interim-lowres')) missing.images.push(p.id);
  if (p.price == null) missing.price.push(p.id);
  if (p.reviewNote) missing.note.push(`${p.id} — ${p.reviewNote}`);
}
const visible = data.products.filter((p) => !p.hidden).length;
console.log(`\nVEYRA katalog kontrolü — ${visible} yayında, ${data.products.length - visible} gizli ürün`);
console.log(`Gardrops mağazasında ${data.storeListingCount ?? '?'} ilan; ekran görüntülerinde ${data.visibleListingCount ?? '?'} ilan görünür.`);
const show = (label, list) => list.length && console.log(`  • ${label}: ${list.length}${list.length <= 6 ? ` (${list.join(', ')})` : ''}`);
show('Başlığı teyit bekleyen', missing.name);
show('Açıklaması eksik', missing.description);
show('Yüksek çözünürlüklü fotoğraf bekleyen', missing.images);
show('Fiyatı eksik', missing.price);
if (missing.note.length) {
  console.log('  • İnceleme notları:');
  for (const n of missing.note) console.log(`      ${n}`);
}
if (errors.length) {
  console.error('\nYapısal hatalar:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log('');
